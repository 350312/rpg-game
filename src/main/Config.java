package main;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;

public class Config {

    GamePanel gp;

    public Config(GamePanel gp) {
        this.gp = gp;
    }

    public void saveConfig() {
        try {
            BufferedWriter bw = new BufferedWriter(new FileWriter("config.txt"));

            // Full screen
            if (gp.fullScreenOn) bw.write("On");
            if (!gp.fullScreenOn) bw.write("Off");
            bw.newLine();

            // Music volume
            bw.write(String.valueOf(gp.music.volumeScale));
            bw.newLine();

            // SE volume
            bw.write(String.valueOf(gp.se.volumeScale));
            bw.newLine();

            bw.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public void loadConfig() {
        try {
            BufferedReader br = new BufferedReader(new FileReader("config.txt"));
            String s = br.readLine();

            if (s != null && s.equals("On")) gp.fullScreenOn = true;
            if (s != null && s.equals("Off")) gp.fullScreenOn = false;

            s = br.readLine();
            if (s != null) gp.music.volumeScale = Integer.parseInt(s);

            s = br.readLine();
            if (s != null) gp.se.volumeScale = Integer.parseInt(s);

            br.close();
        } catch (Exception e) {}
    }
}
