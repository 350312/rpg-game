package data;

import java.io.Serializable;
import java.util.ArrayList;

/**
 * ============================================================================
 * CLASS: DataStorage (Data Transfer Object - DTO)
 * ============================================================================
 * ROLE: Implements java.io.Serializable to package all persistent game state
 *       into a single serializable object graph.
 *
 * EXPLANATION FOR SUPERVISOR:
 * - Direct references to Swing GUI or BufferedImage cannot be serialized.
 * - This class extracts only primitive values (int, boolean), Strings, and
 *   ArrayLists (names and amounts) to write cleanly to binary disk storage.
 * ============================================================================
 */
public class DataStorage implements Serializable {

    // 1. PLAYER STATS
    int level;
    int maxLife;
    int life;
    int maxMana;
    int mana;
    int strength;
    int dexterity;
    int exp;
    int nextLevelExp;
    int coin;

    // 2. PLAYER INVENTORY & EQUIPPED SLOTS
    ArrayList<String> itemNames = new ArrayList<>();
    ArrayList<Integer> itemAmounts = new ArrayList<>();
    int currentWeaponSlot;
    int currentShieldSlot;

    // 3. PERSISTENT WORLD OBJECT STATES (Opened chests, collected items)
    String mapObjectNames[][];
    int mapObjectWorldX[][];
    int mapObjectWorldY[][];
    String mapObjectLootNames[][];
    boolean mapObjectOpened[][];
}
