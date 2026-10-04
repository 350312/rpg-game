package main;

import javax.swing.JFrame;

/**
 * ============================================================================
 * CLASS: Main
 * ============================================================================
 * ROLE: Entry point for the application.
 *
 * ARCHITECTURAL CONCEPTS TO EXPLAIN TO YOUR SUPERVISOR:
 * 1. Java Swing GUI Architecture:
 *    - Uses JFrame as the top-level operating system window container.
 * 2. Component Hierarchy:
 *    - GamePanel (a subclass of JPanel) is mounted onto the JFrame content pane.
 * 3. Thread Orchestration:
 *    - Main thread initializes UI windows and starts the Game Thread for 
 *      the game loop to prevent blocking the GUI Event Dispatch Thread (EDT).
 * ============================================================================
 */
public class Main {
    // Static reference to the main window for full-screen switching
    public static JFrame window;

    public static void main(String[] args) {
        // STEP 1: Instantiate the desktop window frame
        window = new JFrame();
        
        // STEP 2: Configure window behaviors
        // - Close the Java Virtual Machine process when user closes the window
        window.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
        // - Disable OS window resizing to maintain exact aspect ratio and tile grid
        window.setResizable(false);
        // - Set window title bar text
        window.setTitle("Blue Boy Adventure");

        // STEP 3: Mount the core Game Engine Panel (handles rendering & game loop)
        GamePanel gamePanel = new GamePanel();
        window.add(gamePanel);

        // STEP 4: Load persistent user configurations (volume, screen settings)
        gamePanel.config.loadConfig();
        if (gamePanel.fullScreenOn) {
            // Remove title bar and borders for full-screen mode
            window.setUndecorated(true);
        }

        // STEP 5: Size window to fit the preferred size of its subcomponents (GamePanel)
        window.pack();
        // Centers the window on the user's primary monitor
        window.setLocationRelativeTo(null);
        // Make the window visible on screen
        window.setVisible(true);

        // STEP 6: Initialize assets, objects, NPCs and launch the separate Game Thread
        gamePanel.setupGame();
        gamePanel.startGameThread();
    }
}

