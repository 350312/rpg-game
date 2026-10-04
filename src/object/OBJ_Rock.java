package object;

import java.awt.Color;
import entity.Entity;
import entity.Projectile;
import main.GamePanel;

public class OBJ_Rock extends Projectile {

    GamePanel gp;
    public static final String objName = "Rock";

    public OBJ_Rock(GamePanel gp) {
        super(gp);
        this.gp = gp;

        name = objName;
        speed = 8;
        maxLife = 80;
        life = maxLife;
        attack = 2;
        useCost = 1;
        alive = false;
        getImage();
    }

    public void getImage() {
        up1 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        up2 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        down1 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        down2 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        left1 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        left2 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        right1 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
        right2 = setup("/res/projectile/rock_down_1", gp.tileSize, gp.tileSize);
    }

    public boolean haveResource(Entity user) {
        return user.ammo >= useCost;
    }

    public void subtractResource(Entity user) {
        user.ammo -= useCost;
    }

    public Color getParticleColor() { return new Color(40, 50, 0); }
    public int getParticleSize() { return 10; }
    public int getParticleSpeed() { return 1; }
    public int getParticleMaxLife() { return 20; }
}
