package monster;

import java.awt.Color;
import java.util.Random;
import entity.Entity;
import main.GamePanel;
import object.OBJ_Coin_Bronze;
import object.OBJ_Heart;
import object.OBJ_ManaCrystal;
import object.OBJ_Rock;

public class MON_GreenSlime extends Entity {

    GamePanel gp;

    public MON_GreenSlime(GamePanel gp) {
        super(gp);
        this.gp = gp;

        type = type_monster;
        name = "Green Slime";
        defaultSpeed = 1;
        speed = defaultSpeed;
        maxLife = 4;
        life = maxLife;
        attack = 5;
        defense = 0;
        exp = 2;
        projectile = new OBJ_Rock(gp);

        solidArea.x = 3;
        solidArea.y = 18;
        solidArea.width = 42;
        solidArea.height = 30;
        solidAreaDefaultX = solidArea.x;
        solidAreaDefaultY = solidArea.y;

        getImage();
    }

    public void getImage() {
        up1 = setup("/res/monster/greenslime_down_1", gp.tileSize, gp.tileSize);
        up2 = setup("/res/monster/greenslime_down_2", gp.tileSize, gp.tileSize);
        down1 = setup("/res/monster/greenslime_down_1", gp.tileSize, gp.tileSize);
        down2 = setup("/res/monster/greenslime_down_2", gp.tileSize, gp.tileSize);
        left1 = setup("/res/monster/greenslime_down_1", gp.tileSize, gp.tileSize);
        left2 = setup("/res/monster/greenslime_down_2", gp.tileSize, gp.tileSize);
        right1 = setup("/res/monster/greenslime_down_1", gp.tileSize, gp.tileSize);
        right2 = setup("/res/monster/greenslime_down_2", gp.tileSize, gp.tileSize);
    }

    public void setAction() {
        if (onPath) {
            checkStopChasingOrNot(gp.player, 15, 100);
            searchPath(getGoalCol(gp.player), getGoalRow(gp.player));
            checkShootOrNot(200, 30);
        } else {
            checkStartChasingOrNot(gp.player, 5, 100);
            getRandomDirection(120);
        }
    }

    public void damageReaction() {
        actionLockCounter = 0;
        onPath = true;
    }

    public void checkDrop() {
        int i = new Random().nextInt(100) + 1;
        if (i < 50) dropItem(new OBJ_Coin_Bronze(gp));
        if (i >= 50 && i < 75) dropItem(new OBJ_Heart(gp));
        if (i >= 75 && i < 100) dropItem(new OBJ_ManaCrystal(gp));
    }

    public Color getParticleColor() { return new Color(20, 200, 50); }
    public int getParticleSize() { return 6; }
    public int getParticleSpeed() { return 1; }
    public int getParticleMaxLife() { return 20; }
}
