package entity;

import java.awt.AlphaComposite;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.Rectangle;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.util.ArrayList;
import javax.imageio.ImageIO;

import main.GamePanel;
import main.UtilityTool;

/**
 * ============================================================================
 * CLASS: Entity (Base Superclass for all Game Actors & Items)
 * ============================================================================
 * ROLE: The foundational polymorphic base class in the game's OOP hierarchy.
 *
 * INHERITANCE HIERARCHY TO EXPLAIN TO YOUR SUPERVISOR:
 *                       ┌───────────┐
 *                       │  Entity   │
 *                       └─────┬─────┘
 *         ┌───────────────┬───┴───────────────┬─────────────────┐
 *         ▼               ▼                   ▼                 ▼
 *     Player         NPC (OldMan,       Monster (Slime,     Item / Object
 *                    Merchant, Rock)    Bat, Orc, Boss)     (Sword, Key, Heart)
 *
 * KEY SUBSYSTEMS IMPLEMENTED HERE:
 * 1. SPRITE ANIMATION ENGINE:
 *    - Alternates between spriteNum = 1 and spriteNum = 2 every N frames.
 * 2. ATTACK HITBOX PROJECTION:
 *    - Temporarily expands and offsets `solidArea` into `attackArea` during
 *      attack frames, checks intersections with targets, and restores size.
 * 3. DAMAGE & KNOCKBACK PHYSICS:
 *    - Pushes back entities away from attacker's facing direction.
 * 4. INVINCIBILITY FRAMES (i-frames):
 *    - Prevents taking continuous damage every single tick of the 60 FPS loop.
 * 5. PARTICLE GENERATION SYSTEM:
 *    - Spawns burst particles with velocity and lifespan when hit or destroyed.
 * ============================================================================
 */
public class Entity {

    protected GamePanel gp;

    // SPRITE TEXTURES (4 Directions x 2 Walk Frames)
    public BufferedImage up1, up2, down1, down2, left1, left2, right1, right2;
    // ATTACK TEXTURES
    public BufferedImage attackUp1, attackUp2, attackDown1, attackDown2, attackLeft1, attackLeft2, attackRight1, attackRight2;
    // STATIC OBJECT ICONS
    public BufferedImage image, image2, image3;

    // HITBOXES (AABB Physics)
    public Rectangle solidArea = new Rectangle(0, 0, 48, 48);
    public Rectangle attackArea = new Rectangle(0, 0, 0, 0);
    public int solidAreaDefaultX, solidAreaDefaultY;
    public boolean collision = false;

    // DIALOGUE SCRIPT STORAGE: [dialogueSet][dialogueIndex]
    public String dialogues[][] = new String[20][20];
    public Entity attacker;

    // POSITION & ORIENTATION
    public int worldX, worldY;
    public String direction = "down";
    public int spriteNum = 1;
    public int dialogueSet = 0;
    public int dialogueIndex = 0;

    // BOOLEAN STATUS FLAGS
    public boolean collisionOn = false;
    public boolean invincible = false;
    public boolean attacking = false;
    public boolean alive = true;
    public boolean dying = false;
    public boolean hpBarOn = false;
    public boolean onPath = false;
    public boolean knockBack = false;
    public String knockBackDirection;
    public boolean guarding = false;
    public boolean transparent = false;
    public boolean offBalance = false;
    public Entity loot;
    public boolean opened = false;
    public boolean inRage = false;
    public boolean sleep = false;
    public boolean drawing = true;
    public boolean temp = false;

    // FRAME COUNTERS & TIMERS
    public int spriteCounter = 0;
    public int actionLockCounter = 0;
    public int invincibleCounter = 0;
    public int shotAvailableCounter = 0;
    int dyingCounter = 0;
    public int hpBarCounter = 0;
    int knockBackCounter = 0;
    public int guardCounter = 0;
    int offBalanceCounter = 0;

    // RPG ATTRIBUTES & STATS
    public String name;
    public int defaultSpeed;
    public int speed;
    public int maxLife;
    public int life;
    public int maxMana;
    public int mana;
    public int ammo;
    public int level;
    public int strength;
    public int dexterity;
    public int attack;
    public int defense;
    public int exp;
    public int nextLevelExp;
    public int coin;
    public int motion1_duration;
    public int motion2_duration;
    public Entity currentWeapon;
    public Entity currentShield;
    public Entity currentLight;
    public Projectile projectile;
    public boolean boss;

    // INVENTORY SYSTEM
    public ArrayList<Entity> inventory = new ArrayList<>();
    public final int maxInventorySize = 20;
    public int value;
    public int attackValue;
    public int defenseValue;
    public String description = "";
    public int useCost;
    public int price;
    public int knockBackPower = 0;
    public boolean stackable = false;
    public int amount = 1;
    public int lightRadius;

    // TYPE CONSTANTS (Tagging for interaction routing)
    public int type;
    public final int type_player = 0;
    public final int type_npc = 1;
    public final int type_monster = 2;
    public final int type_sword = 3;
    public final int type_axe = 4;
    public final int type_shield = 5;
    public final int type_consumable = 6;
    public final int type_pickupOnly = 7;
    public final int type_obstacle = 8;
    public final int type_light = 9;
    public final int type_pickaxe = 10;

    public Entity(GamePanel gp) {
        this.gp = gp;
    }

    // SCREEN POSITION CONVERSION (Camera projection)
    public int getScreenX() { return worldX - gp.player.worldX + gp.player.screenX; }
    public int getScreenY() { return worldY - gp.player.worldY + gp.player.screenY; }

    public int getLeftX() { return worldX + solidArea.x; }
    public int getRightX() { return worldX + solidArea.x + solidArea.width; }
    public int getTopY() { return worldY + solidArea.y; }
    public int getBottomY() { return worldY + solidArea.y + solidArea.height; }
    public int getCol() { return (worldX + solidArea.x) / gp.tileSize; }
    public int getRow() { return (worldY + solidArea.y) / gp.tileSize; }

    public int getXdistance(Entity target) { return Math.abs(getCenterX() - target.getCenterX()); }
    public int getYdistance(Entity target) { return Math.abs(getCenterY() - target.getCenterY()); }
    public int getTileDistance(Entity target) { return (getXdistance(target) + getYdistance(target)) / gp.tileSize; }
    public int getGoalCol(Entity target) { return (target.worldX + target.solidArea.x) / gp.tileSize; }
    public int getGoalRow(Entity target) { return (target.worldY + target.solidArea.y) / gp.tileSize; }
    public int getCenterX() { return worldX + (left1 != null ? left1.getWidth() / 2 : 24); }
    public int getCenterY() { return worldY + (up1 != null ? up1.getHeight() / 2 : 24); }

    // OVERRIDABLE POLYMORPHIC HOOKS
    public void setLoot(Entity loot) {}
    public void setAction() {}
    public void move(String direction) {}
    public void damageReaction() {}
    public void speak() {}
    public void interact() {}
    public boolean use(Entity entity) { return false; }
    public void checkDrop() {}

    /**
     * Drops an item into the world at the entity's position when defeated.
     */
    public void dropItem(Entity droppedItem) {
        for (int i = 0; i < gp.obj[1].length; i++) {
            if (gp.obj[gp.currentMap][i] == null) {
                gp.obj[gp.currentMap][i] = droppedItem;
                gp.obj[gp.currentMap][i].worldX = worldX;
                gp.obj[gp.currentMap][i].worldY = worldY;
                break;
            }
        }
    }

    public Color getParticleColor() { return null; }
    public int getParticleSize() { return 0; }
    public int getParticleSpeed() { return 0; }
    public int getParticleMaxLife() { return 0; }

    /**
     * Spawns a 4-particle burst effect when hitting objects or entities.
     */
    public void generateParticle(Entity generator, Entity target) {
        Color color = generator.getParticleColor();
        int size = generator.getParticleSize();
        int speed = generator.getParticleSpeed();
        int maxLife = generator.getParticleMaxLife();

        Particle p1 = new Particle(gp, target, color, size, speed, maxLife, -2, -1);
        Particle p2 = new Particle(gp, target, color, size, speed, maxLife, 2, -1);
        Particle p3 = new Particle(gp, target, color, size, speed, maxLife, -1, 2);
        Particle p4 = new Particle(gp, target, color, size, speed, maxLife, 1, 2);
        gp.particleList.add(p1);
        gp.particleList.add(p2);
        gp.particleList.add(p3);
        gp.particleList.add(p4);
    }

    /**
     * Performs comprehensive collision detection against map tiles, objects, and characters.
     */
    public void checkCollision() {
        collisionOn = false;
        gp.cChecker.checkTile(this);
        gp.cChecker.checkObject(this, false);
        gp.cChecker.checkEntity(this, gp.npc);
        gp.cChecker.checkEntity(this, gp.monster);
        gp.cChecker.checkEntity(this, gp.iTile);
        boolean contactPlayer = gp.cChecker.checkPlayer(this);

        if (this.type == type_monster && contactPlayer) {
            damagePlayer(attack);
        }
    }

    /**
     * ========================================================================
     * METHOD: update()
     * ========================================================================
     * Standard update routine handling knockback physics, attacking animations,
     * movement execution, sprite walking cycle, and timer decrements.
     * ========================================================================
     */
    public void update() {
        if (sleep) return;

        // 1. KNOCKBACK PHYSICS
        if (knockBack) {
            checkCollision();
            if (collisionOn) {
                knockBackCounter = 0;
                knockBack = false;
                speed = defaultSpeed;
            } else {
                switch (knockBackDirection) {
                    case "up": worldY -= speed; break;
                    case "down": worldY += speed; break;
                    case "left": worldX -= speed; break;
                    case "right": worldX += speed; break;
                }
            }
            knockBackCounter++;
            if (knockBackCounter == 10) {
                knockBackCounter = 0;
                knockBack = false;
                speed = defaultSpeed;
            }
        }
        // 2. ATTACK ANIMATION
        else if (attacking) {
            attacking();
        }
        // 3. REGULAR AI ACTION & MOVEMENT
        else {
            setAction();
            checkCollision();

            if (!collisionOn) {
                switch (direction) {
                    case "up": worldY -= speed; break;
                    case "down": worldY += speed; break;
                    case "left": worldX -= speed; break;
                    case "right": worldX += speed; break;
                }
            }

            // 4. ANIMATION SPRITE TOGGLE
            spriteCounter++;
            if (spriteCounter > 24) {
                if (spriteNum == 1) spriteNum = 2;
                else if (spriteNum == 2) spriteNum = 1;
                spriteCounter = 0;
            }
        }

        // 5. INVINCIBILITY TIMER
        if (invincible) {
            invincibleCounter++;
            if (invincibleCounter > 40) {
                invincible = false;
                invincibleCounter = 0;
            }
        }
        if (shotAvailableCounter < 30) {
            shotAvailableCounter++;
        }
        if (offBalance) {
            offBalanceCounter++;
            if (offBalanceCounter > 60) {
                offBalance = false;
                offBalanceCounter = 0;
            }
        }
    }

    /**
     * Evaluates whether the player is in attack range and executes an attack with probability.
     */
    public void checkAttackOrNot(int rate, int straight, int horizontal) {
        boolean targetInRange = false;
        int xDis = getXdistance(gp.player);
        int yDis = getYdistance(gp.player);

        switch (direction) {
            case "up":
                if (gp.player.getCenterY() < getCenterY() && yDis < straight && xDis < horizontal) targetInRange = true;
                break;
            case "down":
                if (gp.player.getCenterY() > getCenterY() && yDis < straight && xDis < horizontal) targetInRange = true;
                break;
            case "left":
                if (gp.player.getCenterX() < getCenterX() && xDis < straight && yDis < horizontal) targetInRange = true;
                break;
            case "right":
                if (gp.player.getCenterX() > getCenterX() && xDis < straight && yDis < horizontal) targetInRange = true;
                break;
        }

        if (targetInRange) {
            int i = new java.util.Random().nextInt(rate);
            if (i == 0) {
                attacking = true;
                spriteNum = 1;
                spriteCounter = 0;
                shotAvailableCounter = 0;
            }
        }
    }

    /**
     * Checks projectile shooting rate and fires if cooldown has elapsed.
     */
    public void checkShootOrNot(int rate, int shotInterval) {
        int i = new java.util.Random().nextInt(rate);
        if (i == 0 && !projectile.alive && shotAvailableCounter == shotInterval) {
            projectile.set(worldX, worldY, direction, true, this);
            for (int ii = 0; ii < gp.projectile[1].length; ii++) {
                if (gp.projectile[gp.currentMap][ii] == null) {
                    gp.projectile[gp.currentMap][ii] = projectile;
                    break;
                }
            }
            shotAvailableCounter = 0;
        }
    }

    public void checkStartChasingOrNot(Entity target, int distance, int rate) {
        if (getTileDistance(target) < distance) {
            int i = new java.util.Random().nextInt(rate);
            if (i == 0) onPath = true;
        }
    }

    public void checkStopChasingOrNot(Entity target, int distance, int rate) {
        if (getTileDistance(target) > distance) {
            int i = new java.util.Random().nextInt(rate);
            if (i == 0) onPath = false;
        }
    }

    /**
     * Random directional wandering AI for monsters and NPCs.
     */
    public void getRandomDirection(int interval) {
        actionLockCounter++;
        if (actionLockCounter > interval) {
            int i = new java.util.Random().nextInt(100) + 1;
            if (i <= 25) direction = "up";
            if (i > 25 && i <= 50) direction = "down";
            if (i > 50 && i <= 75) direction = "left";
            if (i > 75 && i <= 100) direction = "right";
            actionLockCounter = 0;
        }
    }

    public void moveTowardPlayer(int interval) {
        actionLockCounter++;
        if (actionLockCounter > interval) {
            if (getXdistance(gp.player) > getYdistance(gp.player)) {
                if (gp.player.getCenterX() < getCenterX()) direction = "left";
                else direction = "right";
            } else {
                if (gp.player.getCenterY() < getCenterY()) direction = "up";
                else direction = "down";
            }
            actionLockCounter = 0;
        }
    }

    /**
     * Executes attack animation, projects attack hitbox, and checks hits.
     */
    public void attacking() {
        spriteCounter++;
        if (spriteCounter <= motion1_duration) {
            spriteNum = 1;
        }
        if (spriteCounter > motion1_duration && spriteCounter <= motion2_duration) {
            spriteNum = 2;

            int currentWorldX = worldX;
            int currentWorldY = worldY;
            int solidAreaWidth = solidArea.width;
            int solidAreaHeight = solidArea.height;

            switch (direction) {
                case "up": worldY -= attackArea.height; break;
                case "down": worldY += attackArea.height; break;
                case "left": worldX -= attackArea.width; break;
                case "right": worldX += attackArea.width; break;
            }

            solidArea.width = attackArea.width;
            solidArea.height = attackArea.height;

            if (type == type_monster) {
                if (gp.cChecker.checkPlayer(this)) {
                    damagePlayer(attack);
                }
            } else {
                int monsterIndex = gp.cChecker.checkEntity(this, gp.monster);
                gp.player.damageMonster(monsterIndex, this, attack, currentWeapon.knockBackPower);

                int iTileIndex = gp.cChecker.checkEntity(this, gp.iTile);
                gp.player.damageInteractiveTile(iTileIndex);

                int projectileIndex = gp.cChecker.checkEntity(this, gp.projectile);
                gp.player.damageProjectile(projectileIndex);
            }

            worldX = currentWorldX;
            worldY = currentWorldY;
            solidArea.width = solidAreaWidth;
            solidArea.height = solidAreaHeight;
        }
        if (spriteCounter > motion2_duration) {
            spriteNum = 1;
            spriteCounter = 0;
            attacking = false;
        }
    }

    /**
     * Applies damage to player, testing shield blocking, parrying, and armor defense.
     */
    public void damagePlayer(int attack) {
        if (!gp.player.invincible) {
            int damage = attack - gp.player.defense;
            String canGuardDirection = getOppositeDirection(direction);

            // Shield block and parry check
            if (gp.player.guarding && gp.player.direction.equals(canGuardDirection)) {
                if (gp.player.guardCounter < 10) {
                    damage = 0;
                    gp.playSE(16); // Parry SE
                    setKnockBack(this, gp.player, knockBackPower);
                    offBalance = true;
                    spriteCounter =- 60;
                } else {
                    damage /= 3; // Block SE
                    gp.playSE(15);
                }
            } else {
                gp.playSE(6);
                if (damage < 1) damage = 1;
            }

            if (damage > 0) {
                gp.player.transparent = true;
                setKnockBack(gp.player, this, knockBackPower);
            }
            gp.player.life -= damage;
            gp.player.invincible = true;
        }
    }

    public void setKnockBack(Entity target, Entity attacker, int knockBackPower) {
        this.attacker = attacker;
        target.knockBackDirection = attacker.direction;
        target.speed += 10;
        target.knockBack = true;
    }

    public boolean inCamera() {
        return worldX + gp.tileSize * 5 > gp.player.worldX - gp.player.screenX &&
               worldX - gp.tileSize < gp.player.worldX + gp.player.screenX &&
               worldY + gp.tileSize * 5 > gp.player.worldY - gp.player.screenY &&
               worldY - gp.tileSize < gp.player.worldY + gp.player.screenY;
    }

    /**
     * Renders the entity with alpha transparency (for i-frames) and death flashes.
     */
    public void draw(Graphics2D g2) {
        BufferedImage image = null;

        if (inCamera()) {
            int tempScreenX = getScreenX();
            int tempScreenY = getScreenY();

            switch (direction) {
                case "up":
                    if (!attacking) {
                        if (spriteNum == 1) image = up1;
                        if (spriteNum == 2) image = up2;
                    }
                    if (attacking) {
                        tempScreenY = getScreenY() - (up1 != null ? up1.getHeight() : 48);
                        if (spriteNum == 1) image = attackUp1;
                        if (spriteNum == 2) image = attackUp2;
                    }
                    break;
                case "down":
                    if (!attacking) {
                        if (spriteNum == 1) image = down1;
                        if (spriteNum == 2) image = down2;
                    }
                    if (attacking) {
                        if (spriteNum == 1) image = attackDown1;
                        if (spriteNum == 2) image = attackDown2;
                    }
                    break;
                case "left":
                    if (!attacking) {
                        if (spriteNum == 1) image = left1;
                        if (spriteNum == 2) image = left2;
                    }
                    if (attacking) {
                        tempScreenX = getScreenX() - (left1 != null ? left1.getWidth() : 48);
                        if (spriteNum == 1) image = attackLeft1;
                        if (spriteNum == 2) image = attackLeft2;
                    }
                    break;
                case "right":
                    if (!attacking) {
                        if (spriteNum == 1) image = right1;
                        if (spriteNum == 2) image = right2;
                    }
                    if (attacking) {
                        if (spriteNum == 1) image = attackRight1;
                        if (spriteNum == 2) image = attackRight2;
                    }
                    break;
            }

            if (invincible) {
                hpBarOn = true;
                hpBarCounter = 0;
                changeAlpha(g2, 0.4F);
            }
            if (dying) {
                dyingAnimation(g2);
            }

            if (image != null) {
                g2.drawImage(image, tempScreenX, tempScreenY, null);
            }
            changeAlpha(g2, 1F);
        }
    }

    public void dyingAnimation(Graphics2D g2) {
        dyingCounter++;
        int i = 5;
        if (dyingCounter <= i) changeAlpha(g2, 0f);
        if (dyingCounter > i && dyingCounter <= i * 2) changeAlpha(g2, 1f);
        if (dyingCounter > i * 2 && dyingCounter <= i * 3) changeAlpha(g2, 0f);
        if (dyingCounter > i * 3 && dyingCounter <= i * 4) changeAlpha(g2, 1f);
        if (dyingCounter > i * 4 && dyingCounter <= i * 5) changeAlpha(g2, 0f);
        if (dyingCounter > i * 5 && dyingCounter <= i * 6) changeAlpha(g2, 1f);
        if (dyingCounter > i * 6 && dyingCounter <= i * 7) changeAlpha(g2, 0f);
        if (dyingCounter > i * 7 && dyingCounter <= i * 8) changeAlpha(g2, 1f);
        if (dyingCounter > i * 8) {
            alive = false;
        }
    }

    public void changeAlpha(Graphics2D g2, float alphaValue) {
        g2.setComposite(AlphaComposite.getInstance(AlphaComposite.SRC_OVER, alphaValue));
    }

    public BufferedImage setup(String imagePath, int width, int height) {
        UtilityTool uTool = new UtilityTool();
        BufferedImage image = null;
        try {
            image = ImageIO.read(getClass().getResourceAsStream(imagePath + ".png"));
            image = uTool.scaleImage(image, width, height);
        } catch (IOException e) {
            e.printStackTrace();
        }
        return image;
    }

    /**
     * Commands PathFinder to calculate the shortest path to target and steps along it.
     */
    public void searchPath(int goalCol, int goalRow) {
        int startCol = (worldX + solidArea.x) / gp.tileSize;
        int startRow = (worldY + solidArea.y) / gp.tileSize;

        gp.pFinder.setNodes(startCol, startRow, goalCol, goalRow);

        if (gp.pFinder.search()) {
            int nextX = gp.pFinder.pathList.get(0).col * gp.tileSize;
            int nextY = gp.pFinder.pathList.get(0).row * gp.tileSize;

            int enLeftX = worldX + solidArea.x;
            int enRightX = worldX + solidArea.x + solidArea.width;
            int enTopY = worldY + solidArea.y;
            int enBottomY = worldY + solidArea.y + solidArea.height;

            if (enTopY > nextY && enLeftX >= nextX && enRightX < nextX + gp.tileSize) {
                direction = "up";
            } else if (enTopY < nextY && enLeftX >= nextX && enRightX < nextX + gp.tileSize) {
                direction = "down";
            } else if (enTopY >= nextY && enBottomY < nextY + gp.tileSize) {
                if (enLeftX > nextX) direction = "left";
                if (enLeftX < nextX) direction = "right";
            } else if (enTopY > nextY && enLeftX > nextX) {
                direction = "up";
                checkCollision();
                if (collisionOn) direction = "left";
            } else if (enTopY > nextY && enLeftX < nextX) {
                direction = "up";
                checkCollision();
                if (collisionOn) direction = "right";
            } else if (enTopY < nextY && enLeftX > nextX) {
                direction = "down";
                checkCollision();
                if (collisionOn) direction = "left";
            } else if (enTopY < nextY && enLeftX < nextX) {
                direction = "down";
                checkCollision();
                if (collisionOn) direction = "right";
            }
        }
    }

    public String getOppositeDirection(String direction) {
        switch (direction) {
            case "up": return "down";
            case "down": return "up";
            case "left": return "right";
            case "right": return "left";
        }
        return "";
    }
}
