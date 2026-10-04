package entity;

import main.GamePanel;
import object.OBJ_Axe;
import object.OBJ_Potion_Red;
import object.OBJ_Shield_Blue;
import object.OBJ_Shield_Wood;
import object.OBJ_Sword_Normal;
import object.OBJ_Tent;

public class NPC_Merchant extends Entity {

    public NPC_Merchant(GamePanel gp) {
        super(gp);

        direction = "down";
        speed = 1;

        solidArea.x = 8;
        solidArea.y = 16;
        solidArea.width = 32;
        solidArea.height = 32;
        solidAreaDefaultX = solidArea.x;
        solidAreaDefaultY = solidArea.y;

        getImage();
        setDialogue();
        setItems();
    }

    public void getImage() {
        up1 = setup("/res/npc/merchant_down_1", gp.tileSize, gp.tileSize);
        up2 = setup("/res/npc/merchant_down_2", gp.tileSize, gp.tileSize);
        down1 = setup("/res/npc/merchant_down_1", gp.tileSize, gp.tileSize);
        down2 = setup("/res/npc/merchant_down_2", gp.tileSize, gp.tileSize);
        left1 = setup("/res/npc/merchant_down_1", gp.tileSize, gp.tileSize);
        left2 = setup("/res/npc/merchant_down_2", gp.tileSize, gp.tileSize);
        right1 = setup("/res/npc/merchant_down_1", gp.tileSize, gp.tileSize);
        right2 = setup("/res/npc/merchant_down_2", gp.tileSize, gp.tileSize);
    }

    public void setDialogue() {
        dialogues[0][0] = "He he, so you found me. \nI have some good stuff.\nDo you want to trade?";
        dialogues[1][0] = "Come again, hehe!";
        dialogues[2][0] = "You need more coin to buy that!";
        dialogues[3][0] = "You cannot carry any more!";
        dialogues[4][0] = "You cannot sell an equipped item!";
    }

    public void setItems() {
        inventory.add(new OBJ_Potion_Red(gp));
        inventory.add(new OBJ_Axe(gp));
        inventory.add(new OBJ_Shield_Blue(gp));
        inventory.add(new OBJ_Tent(gp));
    }

    public void speak() {
        gp.gameState = gp.tradeState;
        gp.ui.npc = this;
    }
}
