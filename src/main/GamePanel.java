package main;

import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics;
import java.awt.Graphics2D;
import java.awt.GraphicsDevice;
import java.awt.GraphicsEnvironment;
import java.awt.image.BufferedImage;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import javax.swing.JPanel;

import ai.PathFinder;
import data.SaveLoad;
import entity.Entity;
import entity.Player;
import environment.EnvironmentManager;
import tile.Map;
import tile.TileManager;
import tile_interactive.InteractiveTile;

/**
 * ============================================================================
 * CLASS: GamePanel (Core Engine & Canvas)
 * ============================================================================
 * ROLE: The heart of the entire 2D game engine.
 * Extends JPanel (for rendering) and implements Runnable (for multithreading).
 *
 * KEY CONCEPTS TO EXPLAIN TO YOUR SUPERVISOR:
 * 1. GAME LOOP PATTERN (Delta Time Method):
 *    - Uses System.nanoTime() to calculate the time elapsed between frames.
 *    - Guarantees a steady 60 updates per second (FPS) regardless of CPU speed.
 * 
 * 2. DUAL COORDINATE SYSTEMS:
 *    - World Coordinates (worldX, worldY): Position on the entire 50x50 map.
 *    - Screen Coordinates (screenX, screenY): Position on the visible monitor.
 *    - Camera Math:
 *      screenX = worldX - player.worldX + player.screenX
 *      screenY = worldY - player.worldY + player.screenY
 * 
 * 3. PAINTER'S ALGORITHM (Depth Sorting / Y-Sorting):
 *    - All entities (player, NPCs, monsters, items) are collected into a single
 *      ArrayList and sorted by their `worldY` position each frame before drawing.
 *    - Entities with lower Y (higher up) are drawn first, entities with higher Y
 *      are drawn in front, creating realistic 2.5D visual depth.
 * 
 * 4. FINITE STATE MACHINE (FSM):
 *    - Controls game modes: titleState, playState, pauseState, dialogueState,
 *      characterState, optionsState, gameOverState, etc.
 * ============================================================================
 */
public class GamePanel extends JPanel implements Runnable {

    // ========================================================================
    // SECTION 1: SCREEN & TILE CONFIGURATION
    // ========================================================================
    // Base tile resolution in pixels (retro 16x16 pixel art)
    final int originalTileSize = 16;
    // Scale factor to make 16x16 readable on modern high-resolution displays
    final int scale = 3;

    // Actual rendered tile size: 16 * 3 = 48x48 pixels
    public final int tileSize = originalTileSize * scale;
    // Aspect ratio: 20 columns x 12 rows (4:3 / 16:9 friendly retro layout)
    public final int maxScreenCol = 20;
    public final int maxScreenRow = 12;
    // Window dimensions: 20 * 48 = 960px width, 12 * 48 = 576px height
    public final int screenWidth = tileSize * maxScreenCol;
    public final int screenHeight = tileSize * maxScreenRow;

    // ========================================================================
    // SECTION 2: FULL-SCREEN & BUFFERING BUFFERS
    // ========================================================================
    int screenWidth2 = screenWidth;
    int screenHeight2 = screenHeight;
    // Off-screen canvas (Intermediate buffer) where everything is drawn first
    BufferedImage tempScreen;
    Graphics2D g2;
    public boolean fullScreenOn = false;

    // ========================================================================
    // SECTION 3: WORLD MAP LIMITS
    // ========================================================================
    // World dimensions: 50x50 tiles (2400 x 2400 pixels total world size)
    public int maxWorldCol = 50;
    public int maxWorldRow = 50;
    // Supports up to 10 distinct maps (world, house interior, dungeon levels)
    public final int maxMap = 10;
    public int currentMap = 0;

    // Target frame rate
    int FPS = 60;

    // ========================================================================
    // SECTION 4: ENGINE SUBSYSTEMS (MANAGERS)
    // ========================================================================
    public TileManager tileM = new TileManager(this);         // Map & tile loader
    public KeyHandler keyH = new KeyHandler(this);            // Keyboard input dispatcher
    public Sound music = new Sound();                         // Background music controller
    public Sound se = new Sound();                            // Sound effects controller
    public CollisionChecker cChecker = new CollisionChecker(this); // AABB physics collision
    public AssetSetter aSetter = new AssetSetter(this);       // Spawner for entities/items
    public UI ui = new UI(this);                              // Heads-Up Display (HUD) & menus
    public EventHandler eHandler = new EventHandler(this);    // Trigger plates, pits, traps
    public Config config = new Config(this);                  // File-based configuration (save/load)
    public PathFinder pFinder = new PathFinder(this);         // A* search pathfinding algorithm
    public EnvironmentManager eManager = new EnvironmentManager(this); // Day/Night lighting
    public Map map = new Map(this);                           // Mini-map & full-screen map
    public SaveLoad saveLoad = new SaveLoad(this);            // Binary object serialization
    public EntityGenerator eGenerator = new EntityGenerator(this); // Factory pattern generator
    public CutsceneManager csManager = new CutsceneManager(this);   // Cinematic script engine
    Thread gameThread;                                        // Dedicated Game Loop Thread

    // ========================================================================
    // SECTION 5: ENTITIES & GAME OBJECTS
    // ========================================================================
    public Player player = new Player(this, keyH);
    // 2D Arrays: [mapIndex][slotIndex] - partitioned by map for memory optimization
    public Entity obj[][] = new Entity[maxMap][20];
    public Entity npc[][] = new Entity[maxMap][10];
    public Entity monster[][] = new Entity[maxMap][20];
    public InteractiveTile iTile[][] = new InteractiveTile[maxMap][50];
    public Entity projectile[][] = new Entity[maxMap][20];
    public ArrayList<Entity> particleList = new ArrayList<>();
    // Temporary render queue for Y-sorting each frame
    ArrayList<Entity> entityList = new ArrayList<>();

    // ========================================================================
    // SECTION 6: FINITE STATE MACHINE (GAME STATES)
    // ========================================================================
    public int gameState;
    public final int titleState = 0;       // Main menu
    public final int playState = 1;        // Active exploration & combat
    public final int pauseState = 2;       // Paused gameplay
    public final int dialogueState = 3;    // NPC talking window
    public final int characterState = 4;   // Inventory and stats screen
    public final int optionsState = 5;     // Settings (volume, controls)
    public final int gameOverState = 6;    // Player death screen
    public final int transitionState = 7;  // Map fade transition
    public final int tradeState = 8;       // Merchant shop
    public final int sleepState = 9;       // Resting at campfire/tent
    public final int mapState = 10;        // Full world overview map
    public final int cutsceneState = 11;   // Scripted boss cinematics

    // Area definitions for ambient lighting & music
    public int currentArea;
    public int nextArea;
    public final int outside = 50;
    public final int indoor = 51;
    public final int dungeon = 52;

    public boolean bossBattleOn = false;

    /**
     * CONSTRUCTOR: Configures the JPanel settings and registers keyboard listeners.
     */
    public GamePanel() {
        this.setPreferredSize(new Dimension(screenWidth, screenHeight));
        this.setBackground(Color.black);
        // Double buffering eliminates screen tearing and flickering
        this.setDoubleBuffered(true);
        this.addKeyListener(keyH);
        this.setFocusable(true);
    }

    /**
     * SETUP GAME: Populates the initial world before gameplay starts.
     */
    public void setupGame() {
        aSetter.setObject();
        aSetter.setNPC();
        aSetter.setMonster();
        aSetter.setInteractiveTile();
        eManager.setup();

        gameState = titleState;
        currentMap = 0;

        // Create the off-screen image buffer for rendering
        tempScreen = new BufferedImage(screenWidth, screenHeight, BufferedImage.TYPE_INT_ARGB);
        g2 = (Graphics2D) tempScreen.getGraphics();

        if (fullScreenOn) {
            setFullScreen();
        }
    }

    /**
     * RESET GAME: Restores entities, player stats, and positions on retry or restart.
     */
    public void resetGame(boolean restart) {
        stopMusic();
        currentArea = outside;
        removeTempEntity();
        bossBattleOn = false;
        player.setDefaultPositions();
        player.restoreStatus();
        player.resetCounter();
        aSetter.setNPC();
        aSetter.setMonster();

        if (restart) {
            player.setDefaultValues();
            aSetter.setObject();
            aSetter.setInteractiveTile();
            eManager.lighting.resetDay();
        }
    }

    public void removeTempEntity() {
        for (int mapNum = 0; mapNum < maxMap; mapNum++) {
            for (int i = 0; i < obj[1].length; i++) {
                if (obj[mapNum][i] != null && obj[mapNum][i].temp) {
                    obj[mapNum][i] = null;
                }
            }
        }
    }

    public void setFullScreen() {
        GraphicsEnvironment ge = GraphicsEnvironment.getLocalGraphicsEnvironment();
        GraphicsDevice gd = ge.getDefaultScreenDevice();
        gd.setFullScreenWindow(Main.window);
        screenWidth2 = Main.window.getWidth();
        screenHeight2 = Main.window.getHeight();
    }

    /**
     * START GAME THREAD: Spawns the worker thread that executes the Game Loop.
     */
    public void startGameThread() {
        gameThread = new Thread(this);
        gameThread.start();
    }

    /**
     * ========================================================================
     * METHOD: run() - THE GAME LOOP (Delta / Accumulator Method)
     * ========================================================================
     * EXPLANATION FOR SUPERVISOR:
     * - 1 second = 1,000,000,000 nanoseconds.
     * - drawInterval = 1,000,000,000 / 60 FPS (~16.66 milliseconds per frame).
     * - `delta` accumulates fractional frame progress:
     *   delta += (currentTime - lastTime) / drawInterval;
     * - When delta >= 1, one complete frame interval has passed:
     *   1. update(): Execute game physics, AI, inputs, and collisions.
     *   2. drawToTempScreen(): Render tiles, entities, and UI to off-screen buffer.
     *   3. drawToScreen(): Blit the finished buffer onto the actual monitor.
     * ========================================================================
     */
    @Override
    public void run() {
        double drawInterval = 1000000000 / FPS;
        double delta = 0;
        long lastTime = System.nanoTime();
        long currentTime;

        while (gameThread != null) {
            currentTime = System.nanoTime();
            delta += (currentTime - lastTime) / drawInterval;
            lastTime = currentTime;

            if (delta >= 1) {
                update();
                drawToTempScreen();
                drawToScreen();
                delta--;
            }
        }
    }

    /**
     * ========================================================================
     * METHOD: update() - GAME LOGIC & PHYSICS PIPELINE
     * ========================================================================
     * Only executes when gameState == playState.
     * Updates positions, AI states, collision detection, and life timers.
     * ========================================================================
     */
    public void update() {
        if (gameState == playState) {
            // 1. UPDATE PLAYER
            player.update();

            // 2. UPDATE NON-PLAYER CHARACTERS (NPCs)
            for (int i = 0; i < npc[1].length; i++) {
                if (npc[currentMap][i] != null) {
                    npc[currentMap][i].update();
                }
            }

            // 3. UPDATE MONSTERS & REMOVE DEFEATED ONES
            for (int i = 0; i < monster[1].length; i++) {
                if (monster[currentMap][i] != null) {
                    if (monster[currentMap][i].alive && !monster[currentMap][i].dying) {
                        monster[currentMap][i].update();
                    }
                    if (!monster[currentMap][i].alive) {
                        monster[currentMap][i].checkDrop();
                        monster[currentMap][i] = null;
                    }
                }
            }

            // 4. UPDATE PROJECTILES (Fireballs, rocks)
            for (int i = 0; i < projectile[1].length; i++) {
                if (projectile[currentMap][i] != null) {
                    if (projectile[currentMap][i].alive) {
                        projectile[currentMap][i].update();
                    }
                    if (!projectile[currentMap][i].alive) {
                        projectile[currentMap][i] = null;
                    }
                }
            }

            // 5. UPDATE PARTICLE EFFECTS
            for (int i = 0; i < particleList.size(); i++) {
                if (particleList.get(i) != null) {
                    if (particleList.get(i).alive) {
                        particleList.get(i).update();
                    }
                    if (!particleList.get(i).alive) {
                        particleList.remove(i);
                    }
                }
            }

            // 6. UPDATE DESTRUCTIBLE / INTERACTIVE TILES (Trees, breakable walls)
            for (int i = 0; i < iTile[1].length; i++) {
                if (iTile[currentMap][i] != null) {
                    iTile[currentMap][i].update();
                }
            }

            // 7. UPDATE DAY/NIGHT LIGHTING SYSTEM
            eManager.update();
        }
    }

    /**
     * ========================================================================
     * METHOD: drawToTempScreen() - RENDERING PIPELINE & Y-SORTING
     * ========================================================================
     * EXPLANATION FOR SUPERVISOR:
     * - LAYER 1: Background terrain tiles (grass, water, dirt, walls).
     * - LAYER 2: Interactive tiles (trees, metal plates).
     * - LAYER 3: Dynamic entities (Player, NPCs, Monsters, Items).
     *   * Sorted by Y coordinate using Collections.sort(Comparator) so entities
     *     closer to the bottom overlap entities farther up.
     * - LAYER 4: Ambient environment lighting filter (day/dusk/night).
     * - LAYER 5: Minimap overlay.
     * - LAYER 6: HUD and UI dialogues (always top layer).
     * ========================================================================
     */
    public void drawToTempScreen() {
        // STATE 1: TITLE SCREEN
        if (gameState == titleState) {
            ui.draw(g2);
        }
        // STATE 2: FULL MAP VIEW
        else if (gameState == mapState) {
            map.drawFullMapScreen(g2);
        }
        // STATE 3: IN-GAME ACTIVE RENDERING
        else {
            // 1. DRAW BACKGROUND TILES
            tileM.draw(g2);

            // 2. DRAW INTERACTIVE TILES
            for (int i = 0; i < iTile[1].length; i++) {
                if (iTile[currentMap][i] != null) {
                    iTile[currentMap][i].draw(g2);
                }
            }

            // 3. COLLECT ALL RENDERABLE ENTITIES INTO A SINGLE LIST FOR SORTING
            entityList.add(player);

            for (int i = 0; i < npc[1].length; i++) {
                if (npc[currentMap][i] != null) {
                    entityList.add(npc[currentMap][i]);
                }
            }

            for (int i = 0; i < obj[1].length; i++) {
                if (obj[currentMap][i] != null) {
                    entityList.add(obj[currentMap][i]);
                }
            }

            for (int i = 0; i < monster[1].length; i++) {
                if (monster[currentMap][i] != null) {
                    entityList.add(monster[currentMap][i]);
                }
            }

            for (int i = 0; i < projectile[1].length; i++) {
                if (projectile[currentMap][i] != null) {
                    entityList.add(projectile[currentMap][i]);
                }
            }

            for (int i = 0; i < particleList.size(); i++) {
                if (particleList.get(i) != null) {
                    entityList.add(particleList.get(i));
                }
            }

            // 4. DEPTH SORT (Y-SORTING)
            // Compares entity worldY coordinates: smaller worldY drawn first
            Collections.sort(entityList, new Comparator<Entity>() {
                @Override
                public int compare(Entity e1, Entity e2) {
                    return Integer.compare(e1.worldY, e2.worldY);
                }
            });

            // 5. DRAW ENTITIES IN DEPTH ORDER
            for (int i = 0; i < entityList.size(); i++) {
                entityList.get(i).draw(g2);
            }

            // Reset queue for next frame
            entityList.clear();

            // 6. DRAW LIGHTING & SHADOW FILTER
            eManager.draw(g2);

            // 7. DRAW MINI-MAP
            map.drawMiniMap(g2);

            // 8. DRAW CUTSCENE OVERLAY
            csManager.draw(g2);

            // 9. DRAW USER INTERFACE (Hearts, Mana, Inventory, Dialogue)
            ui.draw(g2);
        }
    }

    /**
     * BLIT BUFFER TO SCREEN: Transfers the off-screen image buffer to the monitor.
     */
    public void drawToScreen() {
        Graphics g = getGraphics();
        if (g != null) {
            g.drawImage(tempScreen, 0, 0, screenWidth2, screenHeight2, null);
            g.dispose();
        }
    }

    // AUDIO WRAPPERS
    public void playMusic(int i) {
        music.setFile(i);
        music.play();
        music.loop();
    }

    public void stopMusic() {
        music.stop();
    }

    public void playSE(int i) {
        se.setFile(i);
        se.play();
    }
}
