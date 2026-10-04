package main;

import java.awt.event.KeyEvent;
import java.awt.event.KeyListener;

/**
 * ============================================================================
 * CLASS: KeyHandler (Input Controller & Event Dispatcher)
 * ============================================================================
 * ROLE: Implements java.awt.event.KeyListener to intercept keyboard events.
 *
 * KEY CONCEPTS TO EXPLAIN TO YOUR SUPERVISOR:
 * 1. INPUT POLLING vs ASYNCHRONOUS EVENTS:
 *    - Java AWT KeyListener events fire on the Event Dispatch Thread (EDT).
 *    - Instead of moving entities directly inside keyPressed() (which causes
 *      stuttery movement), KeyHandler sets boolean flags (`upPressed`, etc.).
 *    - The Game Loop checks these boolean flags at a constant 60 FPS, ensuring
 *      smooth, uniform character speed across any system!
 * 
 * 2. STATE PATTERN DISPATCHER:
 *    - The keyPressed() method checks `gp.gameState` and delegates to specific
 *      handling routines:
 *      * playState(code): Movement, attacking, opening menus.
 *      * titleState(code): Menu cursor selection, starting or quitting game.
 *      * characterState(code): Navigating inventory slots and equipping gear.
 *      * tradeState(code): Buying and selling items with the merchant.
 *      * optionsState(code): Volume slider adjustment and full-screen toggle.
 * ============================================================================
 */
public class KeyHandler implements KeyListener {

    GamePanel gp;

    // Movement & Action Input Flags (Polled by GamePanel.update())
    public boolean upPressed, downPressed, leftPressed, rightPressed, enterPressed, shotKeyPressed, spacePressed;
    public boolean showDebugText = false;
    public boolean godModeOn = false;

    public KeyHandler(GamePanel gp) {
        this.gp = gp;
    }

    @Override
    public void keyTyped(KeyEvent e) {}

    /**
     * ========================================================================
     * METHOD: keyPressed() - STATE-BASED INPUT ROUTING
     * ========================================================================
     */
    @Override
    public void keyPressed(KeyEvent e) {
        int code = e.getKeyCode();

        // 1. TITLE SCREEN
        if (gp.gameState == gp.titleState) {
            titleState(code);
        }
        // 2. PLAYING
        else if (gp.gameState == gp.playState) {
            playState(code);
        }
        // 3. PAUSED
        else if (gp.gameState == gp.pauseState) {
            pauseState(code);
        }
        // 4. DIALOGUE & CUTSCENES
        else if (gp.gameState == gp.dialogueState || gp.gameState == gp.cutsceneState) {
            dialogueState(code);
        }
        // 5. INVENTORY & CHARACTER SHEET
        else if (gp.gameState == gp.characterState) {
            characterState(code);
        }
        // 6. OPTIONS MENU
        else if (gp.gameState == gp.optionsState) {
            optionsState(code);
        }
        // 7. GAME OVER SCREEN
        else if (gp.gameState == gp.gameOverState) {
            gameOverState(code);
        }
        // 8. MERCHANT TRADING
        else if (gp.gameState == gp.tradeState) {
            tradeState(code);
        }
        // 9. FULL WORLD MAP
        else if (gp.gameState == gp.mapState) {
            mapState(code);
        }
    }

    /**
     * Menu navigation on the title screen.
     */
    public void titleState(int code) {
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) {
            gp.ui.commandNum--;
            if (gp.ui.commandNum < 0) gp.ui.commandNum = 2;
        }
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) {
            gp.ui.commandNum++;
            if (gp.ui.commandNum > 2) gp.ui.commandNum = 0;
        }
        if (code == KeyEvent.VK_ENTER) {
            if (gp.ui.commandNum == 0) {
                // NEW GAME
                gp.gameState = gp.playState;
                gp.playMusic(0);
            }
            if (gp.ui.commandNum == 1) {
                // LOAD GAME
                gp.saveLoad.load();
                gp.gameState = gp.playState;
                gp.playMusic(0);
            }
            if (gp.ui.commandNum == 2) {
                // QUIT
                System.exit(0);
            }
        }
    }

    /**
     * Active gameplay movement and combat controls.
     */
    public void playState(int code) {
        // Movement keys: WASD and Arrow Keys
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) upPressed = true;
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) downPressed = true;
        if (code == KeyEvent.VK_A || code == KeyEvent.VK_LEFT) leftPressed = true;
        if (code == KeyEvent.VK_D || code == KeyEvent.VK_RIGHT) rightPressed = true;

        // Action keys
        if (code == KeyEvent.VK_P) gp.gameState = gp.pauseState;
        if (code == KeyEvent.VK_C) gp.gameState = gp.characterState;
        if (code == KeyEvent.VK_ENTER) enterPressed = true;
        if (code == KeyEvent.VK_F) shotKeyPressed = true;
        if (code == KeyEvent.VK_ESCAPE) gp.gameState = gp.optionsState;
        if (code == KeyEvent.VK_M) gp.gameState = gp.mapState;
        if (code == KeyEvent.VK_X) gp.map.miniMapOn = !gp.map.miniMapOn;
        if (code == KeyEvent.VK_SPACE) spacePressed = true;

        // Debug controls
        if (code == KeyEvent.VK_T) showDebugText = !showDebugText;
        if (code == KeyEvent.VK_R) {
            switch (gp.currentMap) {
                case 0: gp.tileM.loadMap("/res/maps/worldmap.txt", 0); break;
                case 1: gp.tileM.loadMap("/res/maps/indoor01.txt", 1); break;
            }
        }
        if (code == KeyEvent.VK_G) godModeOn = !godModeOn;
    }

    public void pauseState(int code) {
        if (code == KeyEvent.VK_P) gp.gameState = gp.playState;
    }

    public void dialogueState(int code) {
        if (code == KeyEvent.VK_ENTER) enterPressed = true;
    }

    public void characterState(int code) {
        if (code == KeyEvent.VK_C) gp.gameState = gp.playState;
        if (code == KeyEvent.VK_ENTER) gp.player.selectItem();
        playerInventory(code);
    }

    public void optionsState(int code) {
        if (code == KeyEvent.VK_ESCAPE) gp.gameState = gp.playState;
        if (code == KeyEvent.VK_ENTER) enterPressed = true;

        int maxCommandNum = 0;
        switch (gp.ui.subState) {
            case 0: maxCommandNum = 5; break;
            case 3: maxCommandNum = 1; break;
        }

        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) {
            gp.ui.commandNum--;
            gp.playSE(9);
            if (gp.ui.commandNum < 0) gp.ui.commandNum = maxCommandNum;
        }
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) {
            gp.ui.commandNum++;
            gp.playSE(9);
            if (gp.ui.commandNum > maxCommandNum) gp.ui.commandNum = 0;
        }
        if (code == KeyEvent.VK_A || code == KeyEvent.VK_LEFT) {
            if (gp.ui.subState == 0) {
                if (gp.ui.commandNum == 1 && gp.music.volumeScale > 0) {
                    gp.music.volumeScale--;
                    gp.music.checkVolume();
                    gp.playSE(9);
                }
                if (gp.ui.commandNum == 2 && gp.se.volumeScale > 0) {
                    gp.se.volumeScale--;
                    gp.playSE(9);
                }
            }
        }
        if (code == KeyEvent.VK_D || code == KeyEvent.VK_RIGHT) {
            if (gp.ui.subState == 0) {
                if (gp.ui.commandNum == 1 && gp.music.volumeScale < 5) {
                    gp.music.volumeScale++;
                    gp.music.checkVolume();
                    gp.playSE(9);
                }
                if (gp.ui.commandNum == 2 && gp.se.volumeScale < 5) {
                    gp.se.volumeScale++;
                    gp.playSE(9);
                }
            }
        }
    }

    public void gameOverState(int code) {
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) {
            gp.ui.commandNum--;
            if (gp.ui.commandNum < 0) gp.ui.commandNum = 1;
            gp.playSE(9);
        }
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) {
            gp.ui.commandNum++;
            if (gp.ui.commandNum > 1) gp.ui.commandNum = 0;
            gp.playSE(9);
        }
        if (code == KeyEvent.VK_ENTER) {
            if (gp.ui.commandNum == 0) {
                gp.gameState = gp.playState;
                gp.resetGame(false);
                gp.playMusic(0);
            } else if (gp.ui.commandNum == 1) {
                gp.gameState = gp.titleState;
                gp.resetGame(true);
            }
        }
    }

    public void tradeState(int code) {
        if (code == KeyEvent.VK_ENTER) enterPressed = true;

        if (gp.ui.subState == 0) {
            if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) {
                gp.ui.commandNum--;
                if (gp.ui.commandNum < 0) gp.ui.commandNum = 2;
                gp.playSE(9);
            }
            if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) {
                gp.ui.commandNum++;
                if (gp.ui.commandNum > 2) gp.ui.commandNum = 0;
                gp.playSE(9);
            }
        }
        if (gp.ui.subState == 1) {
            npcInventory(code);
            if (code == KeyEvent.VK_ESCAPE) gp.ui.subState = 0;
        }
        if (gp.ui.subState == 2) {
            playerInventory(code);
            if (code == KeyEvent.VK_ESCAPE) gp.ui.subState = 0;
        }
    }

    public void mapState(int code) {
        if (code == KeyEvent.VK_M || code == KeyEvent.VK_ESCAPE) {
            gp.gameState = gp.playState;
        }
    }

    /**
     * 5-column x 4-row inventory grid cursor navigation for the player.
     */
    public void playerInventory(int code) {
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) {
            if (gp.ui.playerSlotRow != 0) {
                gp.ui.playerSlotRow--;
                gp.playSE(9);
            }
        }
        if (code == KeyEvent.VK_A || code == KeyEvent.VK_LEFT) {
            if (gp.ui.playerSlotCol != 0) {
                gp.ui.playerSlotCol--;
                gp.playSE(9);
            }
        }
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) {
            if (gp.ui.playerSlotRow != 3) {
                gp.ui.playerSlotRow++;
                gp.playSE(9);
            }
        }
        if (code == KeyEvent.VK_D || code == KeyEvent.VK_RIGHT) {
            if (gp.ui.playerSlotCol != 4) {
                gp.ui.playerSlotCol++;
                gp.playSE(9);
            }
        }
    }

    public void npcInventory(int code) {
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) {
            if (gp.ui.npcSlotRow != 0) {
                gp.ui.npcSlotRow--;
                gp.playSE(9);
            }
        }
        if (code == KeyEvent.VK_A || code == KeyEvent.VK_LEFT) {
            if (gp.ui.npcSlotCol != 0) {
                gp.ui.npcSlotCol--;
                gp.playSE(9);
            }
        }
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) {
            if (gp.ui.npcSlotRow != 3) {
                gp.ui.npcSlotRow++;
                gp.playSE(9);
            }
        }
        if (code == KeyEvent.VK_D || code == KeyEvent.VK_RIGHT) {
            if (gp.ui.npcSlotCol != 4) {
                gp.ui.npcSlotCol++;
                gp.playSE(9);
            }
        }
    }

    /**
     * Clears boolean flags when a key is released.
     * 
     * EXPLANATION FOR SUPERVISOR:
     * - Movement keys (WASD) and Guard (Space) are continuous held inputs, so they are
     *   cleared when released.
     * - enterPressed is a single-shot push-button trigger. It is consumed and reset
     *   directly inside Player.java (line 271: `keyH.enterPressed = false;`) and the UI.
     * - Therefore, enterPressed is NOT cleared here, preventing fast key releases from
     *   accidentally canceling NPC interactions or attacks before the 60 FPS tick reads them!
     */
    @Override
    public void keyReleased(KeyEvent e) {
        int code = e.getKeyCode();
        if (code == KeyEvent.VK_W || code == KeyEvent.VK_UP) upPressed = false;
        if (code == KeyEvent.VK_S || code == KeyEvent.VK_DOWN) downPressed = false;
        if (code == KeyEvent.VK_A || code == KeyEvent.VK_LEFT) leftPressed = false;
        if (code == KeyEvent.VK_D || code == KeyEvent.VK_RIGHT) rightPressed = false;
        if (code == KeyEvent.VK_F) shotKeyPressed = false;
        // if (code == KeyEvent.VK_ENTER) enterPressed = false; // Intentionally commented: push button consumed by game loop
        if (code == KeyEvent.VK_SPACE) spacePressed = false;
    }
}
