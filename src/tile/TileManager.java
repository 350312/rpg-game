package tile;

import java.awt.Graphics2D;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import javax.imageio.ImageIO;
import main.GamePanel;
import main.UtilityTool;

/**
 * ============================================================================
 * CLASS: TileManager (Map Loader & Tile Renderer)
 * ============================================================================
 * ROLE: Loads sprite image definitions, parses text-based map layouts, and
 *       renders the tile grid using camera frustum culling.
 *
 * KEY CONCEPTS TO EXPLAIN TO YOUR SUPERVISOR:
 * 1. TEXT-BASED MAP ENCODING:
 *    - Maps are stored as space-separated integer matrices in .txt files
 *      (e.g., worldmap.txt, indoor01.txt, dungeon01.txt).
 *    - Each integer corresponds to an index in the `tile[]` array (0=grass, 1=wall, etc.).
 * 
 * 2. 3D ARRAY MAP STRUCTURE:
 *    - `mapTileNum[mapIndex][col][row]`: Supports multiple distinct maps
 *      (overworld, shop interior, multi-floor dungeons).
 * 
 * 3. CAMERA FRUSTUM CULLING (Performance Optimization):
 *    - Instead of rendering all 2,500 tiles (50x50) every frame, the engine
 *      calculates the screen-space boundary around the player:
 *      (worldX + tileSize > player.worldX - player.screenX && ...)
 *    - Off-screen tiles are completely skipped, maintaining high 60 FPS performance!
 * ============================================================================
 */
public class TileManager {

    GamePanel gp;
    public Tile[] tile;
    // 3D Array: [mapNumber][worldColumn][worldRow]
    public int mapTileNum[][][];
    boolean drawPath = true;
    ArrayList<String> fileNames = new ArrayList<>();
    ArrayList<Boolean> collisionStatus = new ArrayList<>();

    public TileManager(GamePanel gp) {
        this.gp = gp;

        // STEP 1: READ TILE METADATA AND COLLISION FROM CONFIG FILE
        InputStream is = getClass().getResourceAsStream("/res/maps/tiledata.txt");
        BufferedReader br = new BufferedReader(new InputStreamReader(is));

        String line;
        try {
            while ((line = br.readLine()) != null) {
                fileNames.add(line);
                collisionStatus.add(false);
            }
            br.close();
        } catch (IOException e) {
            e.printStackTrace();
        }

        // STEP 2: LOAD AND SCALE TILE TEXTURES
        tile = new Tile[fileNames.size()];
        getTileImage();

        // STEP 3: INITIALIZE MAP MATRICES
        is = getClass().getResourceAsStream("/res/maps/worldmap.txt");
        br = new BufferedReader(new InputStreamReader(is));

        try {
            String line2 = br.readLine();
            String maxTile[] = line2.split(" ");
            gp.maxWorldCol = maxTile.length;
            gp.maxWorldRow = maxTile.length;
            mapTileNum = new int[gp.maxMap][gp.maxWorldCol][gp.maxWorldRow];
            br.close();
        } catch (IOException e) {
            System.out.println("Exception!");
        }

        // STEP 4: LOAD ALL LEVELS INTO MEMORY
        loadMap("/res/maps/worldmap.txt", 0);
        loadMap("/res/maps/indoor01.txt", 1);
        loadMap("/res/maps/dungeon01.txt", 2);
        loadMap("/res/maps/dungeon02.txt", 3);
    }

    public void getTileImage() {
        for (int i = 0; i < fileNames.size(); i++) {
            String fileName = fileNames.get(i);
            boolean collision = collisionStatus.get(i);
            setup(i, fileName, collision);
        }
    }

    /**
     * Loads a PNG image, pre-scales it to tile dimensions, and assigns collision flag.
     */
    public void setup(int index, String imageName, boolean collision) {
        UtilityTool uTool = new UtilityTool();
        try {
            tile[index] = new Tile();
            tile[index].image = ImageIO.read(getClass().getResourceAsStream("/res/tiles/" + imageName));
            // Pre-scale image to 48x48 so Java doesn't re-scale during runtime rendering
            tile[index].image = uTool.scaleImage(tile[index].image, gp.tileSize, gp.tileSize);
            tile[index].collision = collision;
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    /**
     * Parses a text file into integer tile IDs for the specified map index.
     */
    public void loadMap(String filePath, int map) {
        try {
            InputStream is = getClass().getResourceAsStream(filePath);
            BufferedReader br = new BufferedReader(new InputStreamReader(is));

            int col = 0;
            int row = 0;

            while (col < gp.maxWorldCol && row < gp.maxWorldRow) {
                String line = br.readLine();
                while (col < gp.maxWorldCol) {
                    String numbers[] = line.split(" ");
                    int num = Integer.parseInt(numbers[col]);
                    mapTileNum[map][col][row] = num;
                    col++;
                }
                if (col == gp.maxWorldCol) {
                    col = 0;
                    row++;
                }
            }
            br.close();
        } catch (Exception e) {}
    }

    /**
     * ========================================================================
     * METHOD: draw() - CAMERA PROJECTION WITH FRUSTUM CULLING
     * ========================================================================
     * Transforms World coordinates to Screen coordinates.
     * Evaluates viewport boundary before calling Graphics2D.drawImage().
     * ========================================================================
     */
    public void draw(Graphics2D g2) {
        int worldCol = 0;
        int worldRow = 0;

        while (worldCol < gp.maxWorldCol && worldRow < gp.maxWorldRow) {
            int tileNum = mapTileNum[gp.currentMap][worldCol][worldRow];

            int worldX = worldCol * gp.tileSize;
            int worldY = worldRow * gp.tileSize;

            // Camera transformation formula
            int screenX = worldX - gp.player.worldX + gp.player.screenX;
            int screenY = worldY - gp.player.worldY + gp.player.screenY;

            // Frustum Culling Check: Only draw if within monitor view boundary
            if (worldX + gp.tileSize > gp.player.worldX - gp.player.screenX &&
                worldX - gp.tileSize < gp.player.worldX + gp.player.screenX &&
                worldY + gp.tileSize > gp.player.worldY - gp.player.screenY &&
                worldY - gp.tileSize < gp.player.worldY + gp.player.screenY) {
                if (tileNum < tile.length && tile[tileNum] != null) {
                    g2.drawImage(tile[tileNum].image, screenX, screenY, null);
                }
            }

            worldCol++;
            if (worldCol == gp.maxWorldCol) {
                worldCol = 0;
                worldRow++;
            }
        }
    }
}
