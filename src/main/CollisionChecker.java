package main;

import entity.Entity;

/**
 * ============================================================================
 * CLASS: CollisionChecker (Physics & AABB Collision Engine)
 * ============================================================================
 * ROLE: Detects and resolves collisions between all dynamic entities, tiles,
 *       interactive objects, and the player.
 *
 * KEY CONCEPTS TO EXPLAIN TO YOUR SUPERVISOR:
 * 1. AABB (Axis-Aligned Bounding Box) Collision Detection:
 *    - Each entity has a `Rectangle solidArea` representing its physical hitbox.
 *    - Hitbox is independent of sprite dimensions (e.g. 48x48 sprite might have
 *      a 32x32 collision box to allow realistic overlapping of heads/trees).
 * 
 * 2. PREDICTIVE COLLISION RESOLUTION:
 *    - Instead of checking where the entity is NOW, the algorithm tests where
 *      the entity WILL BE after adding its speed:
 *      (worldY - speed) for "up", (worldY + speed) for "down", etc.
 *    - If a solid tile or object is in that future space, `collisionOn = true`
 *      and the movement is blocked BEFORE the position updates.
 * 
 * 3. TILE COLLISION MATH:
 *    - Converts pixel coordinates to tile grid indices by dividing by tileSize (48):
 *      tileCol = pixelX / gp.tileSize;
 *      tileRow = pixelY / gp.tileSize;
 * ============================================================================
 */
public class CollisionChecker {

    GamePanel gp;

    public CollisionChecker(GamePanel gp) {
        this.gp = gp;
    }

    /**
     * ========================================================================
     * METHOD: checkTile()
     * ========================================================================
     * Checks if the entity's hitbox will collide with solid map tiles.
     * Evaluates 2 corner points in the direction of movement.
     * ========================================================================
     */
    public void checkTile(Entity entity) {
        // Calculate the absolute world coordinates of the 4 edges of the hitbox
        int entityLeftWorldX = entity.worldX + entity.solidArea.x;
        int entityRightWorldX = entity.worldX + entity.solidArea.x + entity.solidArea.width;
        int entityTopWorldY = entity.worldY + entity.solidArea.y;
        int entityBottomWorldY = entity.worldY + entity.solidArea.y + entity.solidArea.height;

        // Convert world pixel positions into tile grid column/row indices
        int entityLeftCol = entityLeftWorldX / gp.tileSize;
        int entityRightCol = entityRightWorldX / gp.tileSize;
        int entityTopRow = entityTopWorldY / gp.tileSize;
        int entityBottomRow = entityBottomWorldY / gp.tileSize;

        int tileNum1, tileNum2;

        // Handle knockback direction if the entity was attacked
        String direction = entity.direction;
        if (entity.knockBack) {
            direction = entity.knockBackDirection;
        }

        switch (direction) {
            case "up":
                // Predict the row the entity will occupy if it moves up by `speed` pixels
                entityTopRow = (entityTopWorldY - entity.speed) / gp.tileSize;
                if (entityTopRow >= 0 && entityLeftCol >= 0 && entityRightCol < gp.maxWorldCol) {
                    // Check top-left and top-right corner tiles
                    tileNum1 = gp.tileM.mapTileNum[gp.currentMap][entityLeftCol][entityTopRow];
                    tileNum2 = gp.tileM.mapTileNum[gp.currentMap][entityRightCol][entityTopRow];
                    if (gp.tileM.tile[tileNum1].collision || gp.tileM.tile[tileNum2].collision) {
                        entity.collisionOn = true;
                    }
                }
                break;
            case "down":
                // Predict the bottom row
                entityBottomRow = (entityBottomWorldY + entity.speed) / gp.tileSize;
                if (entityBottomRow < gp.maxWorldRow && entityLeftCol >= 0 && entityRightCol < gp.maxWorldCol) {
                    // Check bottom-left and bottom-right corner tiles
                    tileNum1 = gp.tileM.mapTileNum[gp.currentMap][entityLeftCol][entityBottomRow];
                    tileNum2 = gp.tileM.mapTileNum[gp.currentMap][entityRightCol][entityBottomRow];
                    if (gp.tileM.tile[tileNum1].collision || gp.tileM.tile[tileNum2].collision) {
                        entity.collisionOn = true;
                    }
                }
                break;
            case "left":
                // Predict the left column
                entityLeftCol = (entityLeftWorldX - entity.speed) / gp.tileSize;
                if (entityLeftCol >= 0 && entityTopRow >= 0 && entityBottomRow < gp.maxWorldRow) {
                    // Check top-left and bottom-left corner tiles
                    tileNum1 = gp.tileM.mapTileNum[gp.currentMap][entityLeftCol][entityTopRow];
                    tileNum2 = gp.tileM.mapTileNum[gp.currentMap][entityLeftCol][entityBottomRow];
                    if (gp.tileM.tile[tileNum1].collision || gp.tileM.tile[tileNum2].collision) {
                        entity.collisionOn = true;
                    }
                }
                break;
            case "right":
                // Predict the right column
                entityRightCol = (entityRightWorldX + entity.speed) / gp.tileSize;
                if (entityRightCol < gp.maxWorldCol && entityTopRow >= 0 && entityBottomRow < gp.maxWorldRow) {
                    // Check top-right and bottom-right corner tiles
                    tileNum1 = gp.tileM.mapTileNum[gp.currentMap][entityRightCol][entityTopRow];
                    tileNum2 = gp.tileM.mapTileNum[gp.currentMap][entityRightCol][entityBottomRow];
                    if (gp.tileM.tile[tileNum1].collision || gp.tileM.tile[tileNum2].collision) {
                        entity.collisionOn = true;
                    }
                }
                break;
        }
    }

    /**
     * ========================================================================
     * METHOD: checkObject()
     * ========================================================================
     * Detects collision between an Entity and world Objects (keys, chests, doors).
     * Returns the array index of the object collided with (or 999 if none).
     * ========================================================================
     */
    public int checkObject(Entity entity, boolean player) {
        int index = 999;
        String direction = entity.direction;
        if (entity.knockBack) direction = entity.knockBackDirection;

        for (int i = 0; i < gp.obj[1].length; i++) {
            if (gp.obj[gp.currentMap][i] != null) {
                // Get entity's solid area absolute position
                entity.solidArea.x = entity.worldX + entity.solidArea.x;
                entity.solidArea.y = entity.worldY + entity.solidArea.y;

                // Get object's solid area absolute position
                gp.obj[gp.currentMap][i].solidArea.x = gp.obj[gp.currentMap][i].worldX + gp.obj[gp.currentMap][i].solidArea.x;
                gp.obj[gp.currentMap][i].solidArea.y = gp.obj[gp.currentMap][i].worldY + gp.obj[gp.currentMap][i].solidArea.y;

                // Project entity position in the direction of movement
                switch (direction) {
                    case "up": entity.solidArea.y -= entity.speed; break;
                    case "down": entity.solidArea.y += entity.speed; break;
                    case "left": entity.solidArea.x -= entity.speed; break;
                    case "right": entity.solidArea.x += entity.speed; break;
                }

                // Check intersection between bounding boxes
                if (entity.solidArea.intersects(gp.obj[gp.currentMap][i].solidArea)) {
                    if (gp.obj[gp.currentMap][i].collision) {
                        entity.collisionOn = true;
                    }
                    if (player) {
                        index = i;
                    }
                }

                // Reset solidArea coordinates back to relative offset
                entity.solidArea.x = entity.solidAreaDefaultX;
                entity.solidArea.y = entity.solidAreaDefaultY;
                gp.obj[gp.currentMap][i].solidArea.x = gp.obj[gp.currentMap][i].solidAreaDefaultX;
                gp.obj[gp.currentMap][i].solidArea.y = gp.obj[gp.currentMap][i].solidAreaDefaultY;
            }
        }
        return index;
    }

    /**
     * ========================================================================
     * METHOD: checkEntity()
     * ========================================================================
     * Checks collision against an array of entities (NPCs or Monsters).
     * ========================================================================
     */
    public int checkEntity(Entity entity, Entity[][] target) {
        int index = 999;
        String direction = entity.direction;
        if (entity.knockBack) direction = entity.knockBackDirection;

        for (int i = 0; i < target[1].length; i++) {
            if (target[gp.currentMap][i] != null) {
                entity.solidArea.x = entity.worldX + entity.solidArea.x;
                entity.solidArea.y = entity.worldY + entity.solidArea.y;

                target[gp.currentMap][i].solidArea.x = target[gp.currentMap][i].worldX + target[gp.currentMap][i].solidArea.x;
                target[gp.currentMap][i].solidArea.y = target[gp.currentMap][i].worldY + target[gp.currentMap][i].solidArea.y;

                switch (direction) {
                    case "up": entity.solidArea.y -= entity.speed; break;
                    case "down": entity.solidArea.y += entity.speed; break;
                    case "left": entity.solidArea.x -= entity.speed; break;
                    case "right": entity.solidArea.x += entity.speed; break;
                }

                if (entity.solidArea.intersects(target[gp.currentMap][i].solidArea)) {
                    if (target[gp.currentMap][i] != entity) {
                        entity.collisionOn = true;
                        index = i;
                    }
                }

                entity.solidArea.x = entity.solidAreaDefaultX;
                entity.solidArea.y = entity.solidAreaDefaultY;
                target[gp.currentMap][i].solidArea.x = target[gp.currentMap][i].solidAreaDefaultX;
                target[gp.currentMap][i].solidArea.y = target[gp.currentMap][i].solidAreaDefaultY;
            }
        }
        return index;
    }

    /**
     * ========================================================================
     * METHOD: checkPlayer()
     * ========================================================================
     * Checks if a monster or projectile will collide with the player.
     * ========================================================================
     */
    public boolean checkPlayer(Entity entity) {
        boolean contactPlayer = false;
        entity.solidArea.x = entity.worldX + entity.solidArea.x;
        entity.solidArea.y = entity.worldY + entity.solidArea.y;

        gp.player.solidArea.x = gp.player.worldX + gp.player.solidArea.x;
        gp.player.solidArea.y = gp.player.worldY + gp.player.solidArea.y;

        switch (entity.direction) {
            case "up": entity.solidArea.y -= entity.speed; break;
            case "down": entity.solidArea.y += entity.speed; break;
            case "left": entity.solidArea.x -= entity.speed; break;
            case "right": entity.solidArea.x += entity.speed; break;
        }

        if (entity.solidArea.intersects(gp.player.solidArea)) {
            entity.collisionOn = true;
            contactPlayer = true;
        }

        entity.solidArea.x = entity.solidAreaDefaultX;
        entity.solidArea.y = entity.solidAreaDefaultY;
        gp.player.solidArea.x = gp.player.solidAreaDefaultX;
        gp.player.solidArea.y = gp.player.solidAreaDefaultY;

        return contactPlayer;
    }
}
