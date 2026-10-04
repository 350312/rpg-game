package main;

import java.awt.Graphics2D;
import entity.PlayerDummy;
import monster.MON_SkeletonLord;
import object.OBJ_BlueHeart;
import object.OBJ_Door_Iron;

public class CutsceneManager {

    GamePanel gp;
    Graphics2D g2;
    public int sceneNum;
    public int scenePhase;
    public boolean scenePhase2 = false;
    int counter = 0;
    float alpha = 0f;
    int y;
    String endCredit;

    // SCENE NUMBER
    public final int NA = 0;
    public final int skeletonLord = 1;
    public final int ending = 2;

    public CutsceneManager(GamePanel gp) {
        this.gp = gp;
    }

    public void draw(Graphics2D g2) {
        this.g2 = g2;
        switch (sceneNum) {
            case skeletonLord: scene_skeletonLord(); break;
            case ending: scene_ending(); break;
        }
    }

    public void scene_skeletonLord() {
        if (scenePhase == 0) {
            gp.bossBattleOn = true;
            for (int i = 0; i < gp.obj[1].length; i++) {
                if (gp.obj[gp.currentMap][i] == null) {
                    gp.obj[gp.currentMap][i] = new OBJ_Door_Iron(gp);
                    gp.obj[gp.currentMap][i].worldX = gp.tileSize * 25;
                    gp.obj[gp.currentMap][i].worldY = gp.tileSize * 28;
                    gp.obj[gp.currentMap][i].temp = true;
                    gp.playSE(15);
                    break;
                }
            }
            scenePhase++;
        }
        if (scenePhase == 1) {
            gp.player.worldY -= 2;
            if (gp.player.worldY <= gp.tileSize * 25) {
                scenePhase++;
            }
        }
        if (scenePhase == 2) {
            for (int i = 0; i < gp.monster[1].length; i++) {
                if (gp.monster[gp.currentMap][i] != null && gp.monster[gp.currentMap][i].name.equals(MON_SkeletonLord.monName)) {
                    gp.monster[gp.currentMap][i].sleep = false;
                    gp.ui.npc = gp.monster[gp.currentMap][i];
                    scenePhase++;
                    break;
                }
            }
        }
        if (scenePhase == 3) {
            gp.ui.drawDialogueScreen();
        }
        if (scenePhase == 4) {
            gp.stopMusic();
            gp.playMusic(0);
            sceneNum = NA;
            scenePhase = 0;
            gp.gameState = gp.playState;
        }
    }

    public void scene_ending() {
        if (scenePhase == 0) {
            gp.stopMusic();
            gp.ui.npc = new OBJ_BlueHeart(gp);
            scenePhase++;
        }
        if (scenePhase == 1) {
            gp.ui.drawDialogueScreen();
        }
        if (scenePhase == 2) {
            gp.playSE(4);
            scenePhase++;
        }
    }
}
