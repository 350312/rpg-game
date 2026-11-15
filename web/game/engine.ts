import { GameState, Direction, Rect, Item, GameObject, InteractiveTile, NPC, Monster, Projectile, Particle, DamageNumber, QuestProgress } from './types';
import { ITEMS, createItem } from './items';
import { TILE_DATA, MAP_CONFIGS, loadMapGrid } from './maps';
import { assets, CAMPUS_PROP_SPRITES, FLORA_SPRITES } from './assets';
import { sounds } from './sound';
import { LIVES_CONFIG, LEVEL_START_SPAWNS } from './config';

export const TILE_SIZE = 48;
export const SCREEN_WIDTH = 960;
export const SCREEN_HEIGHT = 576;
export const MAX_WORLD_COL = 50;
export const MAX_WORLD_ROW = 50;

export class GameEngine {
  public gameState: GameState = GameState.TITLE;
  public currentMap: number = 0;
  public maps: number[][][] = []; // [mapIndex][row][col]

  // Player (Starts outside BUP Main Gate)
  public player = {
    worldX: 23 * TILE_SIZE,
    worldY: 46 * TILE_SIZE,
    screenX: SCREEN_WIDTH / 2 - TILE_SIZE / 2,
    screenY: SCREEN_HEIGHT / 2 - TILE_SIZE / 2,
    speed: 2.6,
    defaultSpeed: 2.6,
    direction: 'up' as Direction,
    level: 1,
    lives: LIVES_CONFIG.INITIAL_LIVES as number,
    maxLife: 6, // 3 hearts
    life: 6,
    maxMana: 4,
    mana: 4,
    strength: 1,
    dexterity: 1,
    exp: 0,
    nextLevelExp: 10,
    coin: 50,
    currentWeapon: createItem('sword_normal'),
    currentShield: createItem('shield_wood'),
    inventory: [
      createItem('sword_normal'),
      createItem('shield_wood'),
      createItem('key', 1),
      createItem('potion_red', 2),
    ] as Item[],
    animFrame: 2,
    animCounter: 0,
    moving: false,
    attacking: false,
    guarding: false,
    attackTimer: 0,
    invincibleTimer: 0,
    hasLantern: false,
    solidArea: { x: 8, y: 16, width: 32, height: 32 },
  };

  // Entities per map
  public objects: GameObject[] = [];
  public interactiveTiles: InteractiveTile[] = [];
  public npcs: NPC[] = [];
  public monsters: Monster[] = [];
  public projectiles: Projectile[] = [];
  public particles: Particle[] = [];
  public damageNumbers: DamageNumber[] = [];

  // Cutscenes & Dialogue
  public dialogueText: string = '';
  public dialogueSpeaker: string = '';
  public activeShopNPC: NPC | null = null;
  public miniMapOn: boolean = false;
  public bossDefeated: boolean = false;
  public dungeonEntrySource: 'campus' | 'monpura' = 'campus';
  public unlockedDoors: string[] = [];
  public openedChests: string[] = [];
  public collectedPickups: string[] = [];
  public lastDeathInfo: { livesRemaining: number; levelLabel: string } | null = null;

  public questProgress: QuestProgress = {
    stage: 0,
    sealsCollected: [],
    libraryBooksRead: [],
    monstersDefeated: 0,
    bookOpened: false,
    talkedToGuide: false,
    talkedToLibrarian: false,
    talkedToElder: false,
  };

  // Day/Night and Environment
  public dayTime: number = 6500; // Golden hour sunset (0..12000)
  public dayState: 'day' | 'dusk' | 'night' | 'dawn' = 'dusk';
  public lastLocationName: string = '';

  // Discovered & Collected Campus Locations
  public collectedLocations: Set<string> = new Set();
  public campusBuildings = [
    { id: 'fst', name: 'FST Building', fullName: 'Faculty of Science & Technology', shortTag: 'FST', icon: '💻', col: 11, row: 5 },
    { id: 'fass', name: 'FASS Building', fullName: 'Faculty of Arts & Social Sciences', shortTag: 'FASS', icon: '📚', col: 24, row: 4 },
    { id: 'fbs', name: 'FBS Building', fullName: 'Faculty of Business Studies', shortTag: 'FBS', icon: '📊', col: 37, row: 5 },
    { id: 'fms', name: 'FMS Building', fullName: 'Faculty of Management Studies', shortTag: 'FMS', icon: '🏢', col: 10, row: 39 },
  ];

  // Map Transitions & Events
  public transitionStateCounter: number = 0;
  public transitionAlpha: number = 0;
  public targetTransitionMap: number = 0;
  public targetTransitionCol: number = 0;
  public targetTransitionRow: number = 0;
  public targetTransitionMusic: 'theme' | 'merchant' | null = null;
  public targetTransitionDirection: Direction | null = null;
  public canTouchEvent: boolean = true;
  public previousEventX: number = 0;
  public previousEventY: number = 0;

  // Input states
  public keys: Record<string, boolean> = {};
  public isRunToggled: boolean = false;
  public movementSpeedSetting: 'normal' | 'brisk' = 'normal';

  // Callback to inform React UI
  public onStateChange: () => void = () => {};

  async init(): Promise<void> {
    // Load pre-bundled map text files
    const loadedMaps: number[][][] = [];
    for (const conf of MAP_CONFIGS) {
      try {
        const grid = await loadMapGrid(conf.url);
        loadedMaps.push(grid);
      } catch (e) {
        console.error(`Failed to load map ${conf.url}:`, e);
        // Fallback 50x50 empty grid
        loadedMaps.push(Array.from({ length: 50 }, () => Array(50).fill(1)));
      }
    }
    this.maps = loadedMaps;

    this.setupEntities();
  }

  setupEntities() {
    this.objects = [];
    this.interactiveTiles = [];
    this.npcs = [];
    this.monsters = [];
    this.projectiles = [];
    this.particles = [];
    this.damageNumbers = [];

    // Map 0: Campus Objects (All on dry land near buildings and garden yard, none in the pond!)
    this.objects.push(
       // 1. Hammer in the Central Garden Yard (Dry land, botanical lawn!)
       { id: 'axe_1', name: 'Hammer', map: 0, worldX: 24 * TILE_SIZE, worldY: 9 * TILE_SIZE, image: '/res/objects/axe.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'axe' },
       // 2. Lantern near FBS Building Plaza (Dry land terrace!)
       { id: 'lantern_1', name: 'Lantern', map: 0, worldX: 36 * TILE_SIZE, worldY: 9 * TILE_SIZE, image: '/res/objects/lantern.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'lantern' },
       // 3. Tent on lawn outside FST Building (Dry land, NOT in the pond!)
       { id: 'tent_1', name: 'Tent', map: 0, worldX: 14 * TILE_SIZE, worldY: 9 * TILE_SIZE, image: '/res/objects/tent.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'tent' },
       // 4. Key 1 near FASS Building entrance (North Garden path)
       { id: 'key_1', name: 'Key', map: 0, worldX: 22 * TILE_SIZE, worldY: 7 * TILE_SIZE, image: '/res/objects/key.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'key' },
       // 5. Key 2 on South Promenade near FMS Building
       { id: 'key_2', name: 'Key', map: 0, worldX: 11 * TILE_SIZE, worldY: 36 * TILE_SIZE, image: '/res/objects/key.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'key' },
       // 6. Security Door to FST Tech Lab Basement (at walkable doorway tile 11, 8)
       { id: 'door_fst', name: 'Lab Security Door', map: 0, worldX: 11 * TILE_SIZE, worldY: 8 * TILE_SIZE, image: '/res/objects/door.png', solidArea: { x: 0, y: 0, width: 48, height: 48 }, collision: true, type: 'door' },
    );

    // Map 0: Lush Campus Trees & Bushes (placed on non-blocking grass borders)
    const campusFlora: Array<[number, number, string]> = [
      [19, 44, FLORA_SPRITES.tree_mango],
      [28, 44, FLORA_SPRITES.tree_cherry],
      [18, 46, FLORA_SPRITES.bush_flower],
      [29, 46, FLORA_SPRITES.bush_flower],
      [34, 38, FLORA_SPRITES.tree_oak],
      [45, 38, FLORA_SPRITES.tree_palm],
      [35, 42, FLORA_SPRITES.bush_flower],
      [44, 42, FLORA_SPRITES.bush_green],
      [4, 12, FLORA_SPRITES.tree_mango],
      [4, 30, FLORA_SPRITES.tree_oak],
      [46, 12, FLORA_SPRITES.tree_palm],
      [46, 28, FLORA_SPRITES.tree_cherry],
      [19, 8, FLORA_SPRITES.bush_flower],
      [29, 8, FLORA_SPRITES.bush_flower],
    ];
    campusFlora.forEach(([col, row, img], idx) => {
      this.objects.push({
        id: `campus_flora_${idx}`,
        name: 'Campus Flora',
        map: 0,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        image: img,
        solidArea: { x: 8, y: 8, width: 32, height: 32 },
        collision: false,
        type: 'prop',
      });
    });

    // Map 1: Merchant Shop Objects
    this.objects.push(
      { id: 'coin_1', name: 'Bronze Coin', map: 1, worldX: 10 * TILE_SIZE, worldY: 10 * TILE_SIZE, image: '/res/objects/coin_bronze.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'coin' },
    );

    // Map 2: Dungeon 1 Chests & Doors
    this.objects.push(
      { id: 'chest_pickaxe', name: 'Chest', map: 2, worldX: 40 * TILE_SIZE, worldY: 41 * TILE_SIZE, image: '/res/objects/chest.png', solidArea: { x: 4, y: 16, width: 40, height: 32 }, collision: true, opened: false, loot: createItem('pickaxe'), type: 'chest' },
      { id: 'chest_pot_1', name: 'Chest', map: 2, worldX: 13 * TILE_SIZE, worldY: 16 * TILE_SIZE, image: '/res/objects/chest.png', solidArea: { x: 4, y: 16, width: 40, height: 32 }, collision: true, opened: false, loot: createItem('potion_red'), type: 'chest' },
      { id: 'chest_pot_2', name: 'Chest', map: 2, worldX: 26 * TILE_SIZE, worldY: 34 * TILE_SIZE, image: '/res/objects/chest.png', solidArea: { x: 4, y: 16, width: 40, height: 32 }, collision: true, opened: false, loot: createItem('potion_red'), type: 'chest' },
      { id: 'chest_pot_3', name: 'Chest', map: 2, worldX: 27 * TILE_SIZE, worldY: 15 * TILE_SIZE, image: '/res/objects/chest.png', solidArea: { x: 4, y: 16, width: 40, height: 32 }, collision: true, opened: false, loot: createItem('potion_red'), type: 'chest' },
      { id: 'door_iron_1', name: 'Iron Door', map: 2, worldX: 18 * TILE_SIZE, worldY: 23 * TILE_SIZE, image: '/res/objects/door_iron.png', solidArea: { x: 0, y: 0, width: 48, height: 48 }, collision: true, type: 'iron_door' },
    );

    // Map 3: Dungeon 2 Boss & Relic
    this.objects.push(
      { id: 'boss_iron_door', name: 'Iron Door', map: 3, worldX: 25 * TILE_SIZE, worldY: 15 * TILE_SIZE, image: '/res/objects/door_iron.png', solidArea: { x: 0, y: 0, width: 48, height: 48 }, collision: true, type: 'iron_door' },
      { id: 'blue_gem_goal', name: 'Heart of Monpura', map: 3, worldX: 25 * TILE_SIZE, worldY: 8 * TILE_SIZE, image: '/res/objects/blueheart.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'blue_heart' },
    );

    // Map 4: BUP Central Library Objects & Props
    this.objects.push(
      {
        id: 'monpura_book_1',
        name: 'MONPURA TALES',
        map: 4,
        worldX: 24 * TILE_SIZE,
        worldY: 13 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_monpura,
        solidArea: { x: 6, y: 6, width: 36, height: 36 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'monpura_book',
      },
      {
        id: 'lore_book_1',
        name: 'BUP Campus Chronicle',
        map: 4,
        worldX: 16 * TILE_SIZE,
        worldY: 13 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_blue,
        solidArea: { x: 8, y: 8, width: 32, height: 32 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'lore_book',
        dialogue:
          '[BUP Campus Chronicle]\nFounded to foster excellence in leadership, technology, and humanities across FST, FASS, FBS, and FMS.\nYet beneath the Central Library archive rests a bound manuscript older than the campus itself...',
      },
      {
        id: 'lore_book_2',
        name: 'Legend of Monpura Island',
        map: 4,
        worldX: 33 * TILE_SIZE,
        worldY: 13 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_red,
        solidArea: { x: 8, y: 8, width: 32, height: 32 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'lore_book',
        dialogue:
          '[Legend of Monpura Island]\n"Three Sacred Seals guard the northern shrine of Monpura:\nThe Emerald Seal of the Bamboo Grove, the Amber Seal of the Village Orchard, and the Azure Seal of the Tides."',
      },
      {
        id: 'lore_book_3',
        name: 'Notes on the Shadow Warden',
        map: 4,
        worldX: 16 * TILE_SIZE,
        worldY: 22 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_purple,
        solidArea: { x: 8, y: 8, width: 32, height: 32 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'lore_book',
        dialogue:
          '[Notes on the Shadow Warden]\n"Beneath the Sunken Ruins lies the Sanctum of Monpura. Only one who raises their Shield [SPACE] and wields Fire [F] can reclaim the Heart of Monpura."',
      },
      // Library decorative furniture
      { id: 'lib_lamp_1', name: 'Floor Lamp', map: 4, worldX: 20 * TILE_SIZE, worldY: 12 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.floor_lamp, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, transparentBg: true, type: 'prop' },
      { id: 'lib_lamp_2', name: 'Floor Lamp', map: 4, worldX: 28 * TILE_SIZE, worldY: 12 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.floor_lamp, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, transparentBg: true, type: 'prop' },
      { id: 'lib_chair_1', name: 'Reading Chair', map: 4, worldX: 15 * TILE_SIZE, worldY: 13 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.armchair_red, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'lib_chair_2', name: 'Reading Chair', map: 4, worldX: 34 * TILE_SIZE, worldY: 13 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.armchair_red, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'lib_sofa_1', name: 'Lounge Sofa', map: 4, worldX: 15 * TILE_SIZE, worldY: 27 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.sofa_red, solidArea: { x: 4, y: 8, width: 40, height: 32 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'lib_sofa_2', name: 'Lounge Sofa', map: 4, worldX: 33 * TILE_SIZE, worldY: 27 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.sofa_red, solidArea: { x: 4, y: 8, width: 40, height: 32 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'lib_vase_1', name: 'Porcelain Vase', map: 4, worldX: 22 * TILE_SIZE, worldY: 27 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.vase_blue, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'lib_vase_2', name: 'Porcelain Vase', map: 4, worldX: 27 * TILE_SIZE, worldY: 27 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.vase_blue, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'lib_candle_1', name: 'Reading Candle', map: 4, worldX: 23 * TILE_SIZE, worldY: 12 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.candle, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, transparentBg: true, type: 'prop' },
      { id: 'lib_candle_2', name: 'Reading Candle', map: 4, worldX: 25 * TILE_SIZE, worldY: 12 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.candle, solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, transparentBg: true, type: 'prop' },
    );

    // Map 5: Isle of Monpura - Three Sacred Seals, Flora & Island Props
    this.objects.push(
      {
        id: 'seal_emerald',
        name: 'Emerald Seal of the Grove',
        map: 5,
        worldX: 39 * TILE_SIZE,
        worldY: 25 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_monpura,
        solidArea: { x: 6, y: 6, width: 36, height: 36 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'seal',
      },
      {
        id: 'seal_amber',
        name: 'Amber Seal of the Village',
        map: 5,
        worldX: 11 * TILE_SIZE,
        worldY: 28 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_brown,
        solidArea: { x: 6, y: 6, width: 36, height: 36 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'seal',
      },
      {
        id: 'seal_azure',
        name: 'Azure Seal of the Tides',
        map: 5,
        worldX: 12 * TILE_SIZE,
        worldY: 12 * TILE_SIZE,
        image: CAMPUS_PROP_SPRITES.book_blue,
        solidArea: { x: 6, y: 6, width: 36, height: 36 },
        collision: false,
        interactive: true,
        transparentBg: true,
        type: 'seal',
      },
      // Healing potion on Tidepool Shrine & Village
      { id: 'monpura_coin_1', name: 'Bronze Coin', map: 5, worldX: 38 * TILE_SIZE, worldY: 20 * TILE_SIZE, image: '/res/objects/coin_bronze.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'coin' },
      { id: 'monpura_coin_2', name: 'Bronze Coin', map: 5, worldX: 15 * TILE_SIZE, worldY: 26 * TILE_SIZE, image: '/res/objects/coin_bronze.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'coin' },
      // Village crates & barrels
      { id: 'monpura_crate_1', name: 'Supply Crate', map: 5, worldX: 9 * TILE_SIZE, worldY: 27 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.crate, solidArea: { x: 6, y: 6, width: 36, height: 36 }, collision: true, transparentBg: true, type: 'prop' },
      { id: 'monpura_barrel_1', name: 'Water Barrel', map: 5, worldX: 9 * TILE_SIZE, worldY: 29 * TILE_SIZE, image: CAMPUS_PROP_SPRITES.barrel, solidArea: { x: 6, y: 6, width: 36, height: 36 }, collision: true, transparentBg: true, type: 'prop' },
    );

    const monpuraFlora: Array<[number, number, string]> = [
      [7, 8, FLORA_SPRITES.tree_palm],
      [42, 8, FLORA_SPRITES.tree_palm],
      [7, 41, FLORA_SPRITES.tree_palm],
      [41, 41, FLORA_SPRITES.tree_palm],
      [18, 36, FLORA_SPRITES.tree_mango],
      [30, 35, FLORA_SPRITES.tree_banana],
      [34, 15, FLORA_SPRITES.tree_cherry],
      [19, 14, FLORA_SPRITES.tree_oak],
      [37, 29, FLORA_SPRITES.plant_bamboo],
      [41, 22, FLORA_SPRITES.plant_bamboo],
      [21, 39, FLORA_SPRITES.bush_flower],
      [28, 39, FLORA_SPRITES.bush_flower],
      [15, 29, FLORA_SPRITES.bush_berry],
      [31, 18, FLORA_SPRITES.plant_fern],
    ];
    monpuraFlora.forEach(([col, row, img], idx) => {
      this.objects.push({
        id: `monpura_flora_${idx}`,
        name: 'Monpura Flora',
        map: 5,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        image: img,
        solidArea: { x: 8, y: 8, width: 32, height: 32 },
        collision: false,
        type: 'prop',
      });
    });

    // Interactive Tiles: Dry Trees placed on dry garden edges
    const treeCoords = [
      [19, 11], [27, 11], [20, 12], [28, 12],
      [14, 38], [15, 38], [27, 39], [28, 39],
      [32, 40], [33, 40], [37, 41], [38, 41],
    ];
    treeCoords.forEach(([col, row], idx) => {
      this.interactiveTiles.push({
        id: `tree_${idx}`,
        map: 0,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        type: 'dry_tree',
        image: '/res/tiles_interactive/drytree.png',
        life: 3,
        maxLife: 3,
        destructible: true,
        requiredTool: 'axe',
      });
    });

    // Destructible Walls on Map 2
    const wallCoords = [
      [18, 30], [17, 31], [17, 32], [17, 34], [18, 34], [10, 33], [10, 22],
      [38, 24], [38, 18], [38, 19], [38, 21], [18, 13], [18, 14], [22, 28],
      [30, 28], [32, 28],
    ];
    wallCoords.forEach(([col, row], idx) => {
      this.interactiveTiles.push({
        id: `wall_${idx}`,
        map: 2,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        type: 'destructible_wall',
        image: '/res/tiles_interactive/destructiblewall.png',
        life: 3,
        maxLife: 3,
        destructible: true,
        requiredTool: 'pickaxe',
      });
    });

    // Metal Plates on Map 2
    const plateCoords = [[20, 22], [8, 17], [39, 31]];
    plateCoords.forEach(([col, row], idx) => {
      this.interactiveTiles.push({
        id: `plate_${idx}`,
        map: 2,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        type: 'metal_plate',
        image: '/res/tiles_interactive/metalplate.png',
        life: 999,
        maxLife: 999,
        destructible: false,
      });
    });

    // NPCs - Map 0: BUP Campus
    this.npcs.push({
      id: 'guide_tanvir',
      name: 'Student Guide Tanvir',
      map: 0,
      worldX: 25 * TILE_SIZE,
      worldY: 45 * TILE_SIZE,
      direction: 'left',
      sprite: '/assets/aistudio/left_1_46a004b4.png',
      spriteSet: 'senior',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'Assalamu Alaikum! Welcome to Bangladesh University of Professionals (BUP)!',
        'Head east along the South Promenade to visit the BUP Central Library (Cols 36-44, Row 38).\nProf. Rahman says an unusual book called "MONPURA TALES" just arrived in the archive!',
        'You can also tour FST, FASS, FBS, and FMS buildings, grab the Hammer in the Central Garden Yard, or train at Third Place Arena!',
      ],
      dialogueIndex: 0,
    });

    this.npcs.push({
      id: 'oldman',
      name: 'Campus Professor',
      map: 0,
      worldX: 26 * TILE_SIZE,
      worldY: 24 * TILE_SIZE,
      direction: 'left',
      sprite: '/assets/aistudio/left_2_11142926.png',
      spriteSet: 'oldman',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'Welcome to the BUP Campus Lake!\nThe golden sunset from this floating boardwalk is truly breathtaking.',
        'Across this bridge to the north lie FST, FASS, and FBS.\nTo the south-east stands BUP Central Library, where ancient folktales await.',
        'Press Enter to interact or strike, Space to raise your shield, and F to cast a Fireball!',
      ],
      dialogueIndex: 0,
    });

    this.npcs.push({
      id: 'campus_student_ayesha',
      name: 'Student Ayesha',
      map: 0,
      worldX: 21 * TILE_SIZE,
      worldY: 10 * TILE_SIZE,
      direction: 'right',
      sprite: '/assets/aistudio/right_1_8d7b8243.png',
      spriteSet: 'friend',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'The Central Garden Yard is my favorite spot between FST and FASS lectures!\nDid you spot the golden Hammer on the stone plinth?',
        'If you visit all four faculty buildings — FST, FASS, FBS, and FMS — you earn a Campus Tour bonus!',
      ],
      dialogueIndex: 0,
      patrolRoute: [{ col: 21, row: 10 }, { col: 26, row: 10 }, { col: 26, row: 13 }, { col: 21, row: 13 }],
      patrolIndex: 0,
      patrolSpeed: 0.9,
    });

    this.npcs.push({
      id: 'campus_student_arif',
      name: 'Student Arif',
      map: 0,
      worldX: 35 * TILE_SIZE,
      worldY: 36 * TILE_SIZE,
      direction: 'down',
      sprite: '/assets/aistudio/down_1_fad8fdad.png',
      spriteSet: 'friend',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'The BUP Central Library entrance is just ahead at the red-brick foyer!\nStep inside to inspect the mysterious book "MONPURA TALES".',
        'Just north of here is Third Place Arena — watch out, training Slimes and an Arena Orc spar inside!',
      ],
      dialogueIndex: 0,
      patrolRoute: [{ col: 35, row: 36 }, { col: 35, row: 40 }, { col: 31, row: 40 }],
      patrolIndex: 0,
      patrolSpeed: 0.85,
    });

    // Map 1: Merchant
    this.npcs.push({
      id: 'merchant',
      name: 'Café Merchant',
      map: 1,
      worldX: 12 * TILE_SIZE,
      worldY: 7 * TILE_SIZE,
      direction: 'down',
      sprite: '/res/npc/merchant_down_1.png',
      spriteSet: 'merchant',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: ['Welcome to the FMS Union Café & Supply Counter! Browse my wares before your journey.'],
      dialogueIndex: 0,
      isShop: true,
    });

    // Map 4: BUP Central Library Librarian
    this.npcs.push({
      id: 'librarian_rahman',
      name: 'Librarian Prof. Rahman',
      map: 4,
      worldX: 22 * TILE_SIZE,
      worldY: 18 * TILE_SIZE,
      direction: 'down',
      sprite: '/assets/aistudio/down_1_4b409c19.png',
      spriteSet: 'oldman',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'Welcome to BUP Central Library! Keep your voice gentle among the archives.',
        'At the north end of the red carpet lies a peculiar emerald tome titled "MONPURA TALES".\nWhenever someone nears it, golden runes shimmer across its cover!',
        'Walk north to the lectern and press [ENTER] / Talk to open the book. Read the side manuscripts too if you wish to learn Monpura’s secrets!',
      ],
      dialogueIndex: 0,
    });

    // Map 5: Isle of Monpura NPCs
    this.npcs.push({
      id: 'elder_karim',
      name: 'Sage Karim',
      map: 5,
      worldX: 26 * TILE_SIZE,
      worldY: 39 * TILE_SIZE,
      direction: 'left',
      sprite: '/assets/aistudio/left_1_06975b4d.png',
      spriteSet: 'oldman',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'A student from BUP?! The Book of Monpura has chosen you just as the legends foretold!',
        'To unseal the Ancient Ruins Gate on the northern shore, you must recover the 3 Sacred Seals:\n1) Emerald Seal in the East Bamboo Grove\n2) Amber Seal in the West Village Orchard\n3) Azure Seal at the North-West Tidepool Shrine.',
        'Once all 3 Seals are yours, enter the Ancient Ruins Gate at the north shore and defeat the Shadow Warden!',
      ],
      dialogueIndex: 0,
    });

    this.npcs.push({
      id: 'villager_rina',
      name: 'Villager Rina',
      map: 5,
      worldX: 13 * TILE_SIZE,
      worldY: 27 * TILE_SIZE,
      direction: 'right',
      sprite: '/assets/aistudio/right_1_65294bb1.png',
      spriteSet: 'senior',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'Our village gardens used to flourish all year round! Please take the Amber Seal beside our stone cottage.',
        'Cross the wooden bridge to the north to reach the Tidepool Shrine for the Azure Seal!',
      ],
      dialogueIndex: 0,
      patrolRoute: [{ col: 13, row: 27 }, { col: 16, row: 27 }],
      patrolIndex: 0,
      patrolSpeed: 0.7,
    });

    // Pushable Rocks in Dungeon 1 (Map 2)
    const rockCoords = [[20, 25], [11, 18], [23, 14]];
    rockCoords.forEach(([col, row], idx) => {
      this.npcs.push({
        id: `rock_${idx}`,
        name: 'Big Rock',
        map: 2,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        direction: 'down',
        sprite: '/res/npc/bigrock.png',
        spriteSet: 'rock',
        solidArea: { x: 4, y: 4, width: 40, height: 40 },
        dialogues: [],
        dialogueIndex: 0,
        isPushable: true,
      });
    });

    // Monsters: Stationed inside the THIRD PLACE ARENA (Columns 36 to 42, Rows 20 to 28)
    const thirdPlaceSlimes = [
      [37, 21], [40, 21], [37, 24], [41, 24], [38, 26], [40, 26]
    ];
    thirdPlaceSlimes.forEach(([col, row], idx) => {
      this.monsters.push({
        id: `arena_slime_${idx}`,
        name: idx % 2 === 0 ? 'Arena Green Slime' : 'Arena Red Slime',
        map: 0,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        direction: 'down',
        speed: 1,
        maxLife: 6,
        life: 6,
        attack: 2,
        defense: 0,
        exp: 3,
        solidArea: { x: 6, y: 18, width: 36, height: 26 },
        spritePrefix: idx % 2 === 0 ? '/res/monster/greenslime_down' : '/res/monster/redslime_down',
        animFrame: 1,
        animTimer: 0,
        actionTimer: 0,
        invincibleTimer: 0,
        knockbackTimer: 0,
      });
    });

    // Orc Brawler inside Third Place Arena
    this.monsters.push({
      id: 'arena_orc_1',
      name: 'Third Place Arena Orc',
      map: 0,
      worldX: 39 * TILE_SIZE,
      worldY: 23 * TILE_SIZE,
      direction: 'down',
      speed: 1.5,
      maxLife: 14,
      life: 14,
      attack: 4,
      defense: 2,
      exp: 8,
      solidArea: { x: 6, y: 6, width: 36, height: 38 },
      spritePrefix: '/res/monster/orc',
      animFrame: 1,
      animTimer: 0,
      actionTimer: 0,
      invincibleTimer: 0,
      knockbackTimer: 0,
    });

    // Bats in Dungeon 1 (Map 2)
    const batCoords = [[34, 39], [36, 25], [39, 26], [28, 11], [10, 19]];
    batCoords.forEach(([col, row], idx) => {
      this.monsters.push({
        id: `bat_${idx}`,
        name: 'Cave Bat',
        map: 2,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        direction: 'down',
        speed: 3,
        maxLife: 6,
        life: 6,
        attack: 3,
        defense: 0,
        exp: 4,
        solidArea: { x: 4, y: 8, width: 40, height: 32 },
        spritePrefix: '/res/monster/bat_down',
        animFrame: 1,
        animTimer: 0,
        actionTimer: 0,
        invincibleTimer: 0,
        knockbackTimer: 0,
      });
    });

    // Skeleton Lord Boss in Sanctum of Monpura (Map 3)
    this.monsters.push({
      id: 'boss_skeleton_lord',
      name: 'Skeleton Lord',
      map: 3,
      worldX: 23 * TILE_SIZE,
      worldY: 16 * TILE_SIZE,
      direction: 'down',
      speed: 1.2,
      maxLife: 40,
      life: 40,
      attack: 10,
      defense: 3,
      exp: 50,
      solidArea: { x: 48, y: 48, width: 144, height: 144 },
      spritePrefix: '/res/monster/skeletonlord',
      animFrame: 1,
      animTimer: 0,
      actionTimer: 0,
      invincibleTimer: 0,
      knockbackTimer: 0,
      isBoss: true,
      width: TILE_SIZE * 5,
      height: TILE_SIZE * 5,
    });

    // Monsters on Isle of Monpura (Map 5)
    const monpuraSlimes: Array<[number, number]> = [
      [34, 26], [37, 23], [36, 31], [29, 15], [18, 17],
    ];
    monpuraSlimes.forEach(([col, row], idx) => {
      this.monsters.push({
        id: `monpura_slime_${idx}`,
        name: idx % 2 === 0 ? 'Grove Green Slime' : 'Tide Red Slime',
        map: 5,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        direction: 'down',
        speed: 1.1,
        maxLife: 7,
        life: 7,
        attack: 2,
        defense: 0,
        exp: 4,
        solidArea: { x: 6, y: 18, width: 36, height: 26 },
        spritePrefix: idx % 2 === 0 ? '/res/monster/greenslime_down' : '/res/monster/redslime_down',
        animFrame: 1,
        animTimer: 0,
        actionTimer: 0,
        invincibleTimer: 0,
        knockbackTimer: 0,
      });
    });

    this.monsters.push({
      id: 'monpura_orc_grove',
      name: 'Grove Guardian Orc',
      map: 5,
      worldX: 37 * TILE_SIZE,
      worldY: 25 * TILE_SIZE,
      direction: 'left',
      speed: 1.35,
      maxLife: 16,
      life: 16,
      attack: 4,
      defense: 2,
      exp: 10,
      solidArea: { x: 6, y: 6, width: 36, height: 38 },
      spritePrefix: '/res/monster/orc',
      animFrame: 1,
      animTimer: 0,
      actionTimer: 0,
      invincibleTimer: 0,
      knockbackTimer: 0,
    });

    this.monsters.push({
      id: 'monpura_orc_ruins',
      name: 'Ruins Sentry Orc',
      map: 5,
      worldX: 24 * TILE_SIZE,
      worldY: 13 * TILE_SIZE,
      direction: 'down',
      speed: 1.4,
      maxLife: 18,
      life: 18,
      attack: 4,
      defense: 2,
      exp: 12,
      solidArea: { x: 6, y: 6, width: 36, height: 38 },
      spritePrefix: '/res/monster/orc',
      animFrame: 1,
      animTimer: 0,
      actionTimer: 0,
      invincibleTimer: 0,
      knockbackTimer: 0,
    });
  }

  clampLives(val: number): number {
    return Math.max(0, Math.min(LIVES_CONFIG.MAX_LIVES, Math.floor(val)));
  }

  syncPersistentWorldState(): void {
    // Remove already collected Sacred Seals
    for (const sealId of this.questProgress.sealsCollected) {
      const idx = this.objects.findIndex((o) => o.id === sealId);
      if (idx !== -1) this.objects.splice(idx, 1);
    }

    // Remove already collected unique world pickups (Hammer, Lantern, Tent, Keys)
    for (const pickupId of this.collectedPickups) {
      const idx = this.objects.findIndex((o) => o.id === pickupId);
      if (idx !== -1) this.objects.splice(idx, 1);
    }

    // Keep chests opened if already looted
    for (const chestId of this.openedChests) {
      const chest = this.objects.find((o) => o.id === chestId);
      if (chest) {
        chest.opened = true;
        chest.image = '/res/objects/chest_opened.png';
      }
    }

    // Keep key-unlocked doors open so player isn't softlocked
    for (const doorId of this.unlockedDoors) {
      const door = this.objects.find((o) => o.id === doorId);
      if (door) {
        door.collision = false;
        door.destroyed = true;
      }
    }

    // If Skeleton Lord was already defeated permanently in this run
    if (this.bossDefeated) {
      const boss = this.monsters.find((m) => m.id === 'boss_skeleton_lord');
      if (boss) boss.dead = true;
      const bossDoor = this.objects.find((o) => o.id === 'boss_iron_door');
      if (bossDoor) {
        bossDoor.collision = false;
        bossDoor.destroyed = true;
      }
    }
  }

  startNewGame() {
    this.gameState = GameState.PLAY;
    this.currentMap = 0;
    this.dayTime = 6500;
    this.dayState = 'dusk';
    this.player.worldX = 23 * TILE_SIZE;
    this.player.worldY = 46 * TILE_SIZE;
    this.player.direction = 'up';
    this.player.animFrame = 2;
    this.player.animCounter = 0;
    this.player.lives = LIVES_CONFIG.INITIAL_LIVES;
    this.player.life = this.player.maxLife;
    this.player.mana = this.player.maxMana;
    this.player.level = 1;
    this.player.exp = 0;
    this.player.coin = 50;
    this.player.hasLantern = false;
    this.player.invincibleTimer = 0;
    this.player.attacking = false;
    this.player.guarding = false;
    this.player.moving = false;
    this.player.currentWeapon = createItem('sword_normal');
    this.player.currentShield = createItem('shield_wood');
    this.player.inventory = [
      createItem('sword_normal'),
      createItem('shield_wood'),
      createItem('key', 1),
      createItem('potion_red', 2),
    ];
    this.bossDefeated = false;
    this.dungeonEntrySource = 'campus';
    this.unlockedDoors = [];
    this.openedChests = [];
    this.collectedPickups = [];
    this.lastDeathInfo = null;
    this.questProgress = {
      stage: 0,
      sealsCollected: [],
      libraryBooksRead: [],
      monstersDefeated: 0,
      bookOpened: false,
      talkedToGuide: false,
      talkedToLibrarian: false,
      talkedToElder: false,
    };
    this.transitionStateCounter = 0;
    this.transitionAlpha = 0;
    this.canTouchEvent = true;
    this.previousEventX = this.player.worldX;
    this.previousEventY = this.player.worldY;
    this.collectedLocations = new Set();
    this.lastLocationName = '';
    try {
      localStorage.removeItem('blue_boy_save');
    } catch (_) {}
    this.setupEntities();
    sounds.playMusic('theme');
    this.onStateChange();
  }

  restartCurrentLevel(): void {
    const spawn = LEVEL_START_SPAWNS[this.currentMap] || LEVEL_START_SPAWNS[0];
    this.keys = {};
    this.player.moving = false;
    this.player.attacking = false;
    this.player.guarding = false;
    this.player.attackTimer = 0;
    // Restore HP & Mana for the new attempt only — never add extra lives
    this.player.lives = this.clampLives(this.player.lives);
    this.player.life = this.player.maxLife;
    this.player.mana = this.player.maxMana;
    this.player.invincibleTimer = LIVES_CONFIG.RESPAWN_INVINCIBILITY_FRAMES;
    this.player.worldX = spawn.col * TILE_SIZE;
    this.player.worldY = spawn.row * TILE_SIZE;
    this.player.direction = spawn.direction;
    this.previousEventX = this.player.worldX;
    this.previousEventY = this.player.worldY;
    this.canTouchEvent = true;
    this.transitionStateCounter = 0;
    this.transitionAlpha = 0;

    // Reset all enemies, bosses, projectiles, hazards, and level puzzles
    this.setupEntities();
    this.syncPersistentWorldState();

    this.gameState = GameState.PLAY;
    sounds.playMusic(spawn.music);
    this.onStateChange();
  }

  restartFromLevelOne(): void {
    this.startNewGame();
  }

  persistDeathPenalty(isGameOver: boolean): void {
    try {
      if (isGameOver) {
        // Mark run as ended so refreshing the page cannot bypass Game Over
        localStorage.setItem(
          'blue_boy_save',
          JSON.stringify({
            saveVersion: 2,
            gameOver: true,
            lives: 0,
          })
        );
        return;
      }

      const spawn = LEVEL_START_SPAWNS[this.currentMap] || LEVEL_START_SPAWNS[0];
      const penaltySave = {
        saveVersion: 2,
        gameOver: false,
        worldX: spawn.col * TILE_SIZE,
        worldY: spawn.row * TILE_SIZE,
        direction: spawn.direction,
        currentMap: this.currentMap,
        lives: this.clampLives(this.player.lives),
        life: this.player.maxLife,
        maxLife: this.player.maxLife,
        mana: this.player.maxMana,
        maxMana: this.player.maxMana,
        level: this.player.level,
        exp: this.player.exp,
        nextLevelExp: this.player.nextLevelExp,
        strength: this.player.strength,
        dexterity: this.player.dexterity,
        hasLantern: this.player.hasLantern,
        coin: this.player.coin,
        inventory: this.player.inventory,
        currentWeapon: this.player.currentWeapon,
        currentShield: this.player.currentShield,
        bossDefeated: this.bossDefeated,
        dungeonEntrySource: this.dungeonEntrySource,
        questProgress: this.questProgress,
        collectedLocations: Array.from(this.collectedLocations),
        unlockedDoors: this.unlockedDoors,
        openedChests: this.openedChests,
        collectedPickups: this.collectedPickups,
      };
      localStorage.setItem('blue_boy_save', JSON.stringify(penaltySave));
    } catch (e) {
      console.warn('Could not persist death penalty:', e);
    }
  }

  saveGame(): void {
    if (this.player.life <= 0 || this.player.lives <= 0) {
      return;
    }
    const saveData = {
      saveVersion: 2,
      gameOver: false,
      worldX: this.player.worldX,
      worldY: this.player.worldY,
      direction: this.player.direction,
      currentMap: this.currentMap,
      lives: this.clampLives(this.player.lives),
      life: this.player.life,
      maxLife: this.player.maxLife,
      mana: this.player.mana,
      maxMana: this.player.maxMana,
      level: this.player.level,
      exp: this.player.exp,
      nextLevelExp: this.player.nextLevelExp,
      strength: this.player.strength,
      dexterity: this.player.dexterity,
      hasLantern: this.player.hasLantern,
      coin: this.player.coin,
      inventory: this.player.inventory,
      currentWeapon: this.player.currentWeapon,
      currentShield: this.player.currentShield,
      bossDefeated: this.bossDefeated,
      dungeonEntrySource: this.dungeonEntrySource,
      questProgress: this.questProgress,
      collectedLocations: Array.from(this.collectedLocations),
      unlockedDoors: this.unlockedDoors,
      openedChests: this.openedChests,
      collectedPickups: this.collectedPickups,
    };
    try {
      localStorage.setItem('blue_boy_save', JSON.stringify(saveData));
      this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 10, 'Game Saved!', '#4ade80');
      sounds.playSE('powerup');
    } catch (e) {
      console.warn('Could not save game:', e);
    }
  }

  loadGame(): boolean {
    try {
      const dataStr = localStorage.getItem('blue_boy_save');
      if (!dataStr) return false;
      const data = JSON.parse(dataStr);

      // Anti-exploit: dead / 0-lives saves cannot be resumed
      if (data.gameOver || (typeof data.lives === 'number' && data.lives <= 0) || (typeof data.life === 'number' && data.life <= 0)) {
        localStorage.removeItem('blue_boy_save');
        return false;
      }

      this.setupEntities();
      this.player.worldX = data.worldX ?? 23 * TILE_SIZE;
      this.player.worldY = data.worldY ?? 46 * TILE_SIZE;
      this.player.direction = data.direction ?? 'up';
      this.currentMap = data.currentMap ?? 0;
      // Migrate legacy v1 saves without `lives` cleanly, capped at MAX_LIVES
      this.player.lives =
        typeof data.lives === 'number'
          ? this.clampLives(data.lives)
          : LIVES_CONFIG.INITIAL_LIVES;
      this.player.maxLife = data.maxLife ?? 6;
      this.player.life = Math.min(this.player.maxLife, data.life ?? this.player.maxLife);
      this.player.maxMana = data.maxMana ?? 4;
      this.player.mana = Math.min(this.player.maxMana, data.mana ?? this.player.maxMana);
      this.player.level = data.level ?? 1;
      this.player.exp = data.exp ?? 0;
      this.player.nextLevelExp = data.nextLevelExp ?? 10;
      this.player.strength = data.strength ?? 1;
      this.player.dexterity = data.dexterity ?? 1;
      this.player.hasLantern = !!data.hasLantern || !!(data.inventory || []).some((i: Item) => i.id === 'lantern');
      this.player.coin = data.coin ?? 50;
      this.player.inventory = data.inventory || [];
      this.player.currentWeapon = data.currentWeapon || createItem('sword_normal');
      this.player.currentShield = data.currentShield || createItem('shield_wood');
      this.bossDefeated = !!data.bossDefeated;
      this.dungeonEntrySource = data.dungeonEntrySource === 'monpura' ? 'monpura' : 'campus';
      this.unlockedDoors = Array.isArray(data.unlockedDoors) ? data.unlockedDoors : [];
      this.openedChests = Array.isArray(data.openedChests) ? data.openedChests : [];
      this.collectedPickups = Array.isArray(data.collectedPickups) ? data.collectedPickups : [];

      if (data.questProgress) {
        this.questProgress = {
          stage: data.questProgress.stage ?? 0,
          sealsCollected: data.questProgress.sealsCollected || [],
          libraryBooksRead: data.questProgress.libraryBooksRead || [],
          monstersDefeated: data.questProgress.monstersDefeated ?? 0,
          bookOpened: !!data.questProgress.bookOpened,
          talkedToGuide: !!data.questProgress.talkedToGuide,
          talkedToLibrarian: !!data.questProgress.talkedToLibrarian,
          talkedToElder: !!data.questProgress.talkedToElder,
        };
      }

      this.collectedLocations = new Set(data.collectedLocations || []);
      this.syncPersistentWorldState();
      this.lastDeathInfo = null;
      this.previousEventX = this.player.worldX;
      this.previousEventY = this.player.worldY;
      this.gameState = GameState.PLAY;
      const spawn = LEVEL_START_SPAWNS[this.currentMap];
      sounds.playMusic(spawn?.music || 'theme');
      this.onStateChange();
      return true;
    } catch (e) {
      return false;
    }
  }

  // Update Game Logic Loop (60 FPS)
  update(): void {
    if (this.gameState === GameState.TRANSITION) {
      this.updateTransition();
      return;
    }
    if (this.gameState !== GameState.PLAY) return;

    this.updateDayTime();
    this.updatePlayer();
    this.updateNPCs();
    this.updateMonsters();
    this.updateProjectiles();
    this.updateInteractiveTiles();
    this.updateParticles();
    this.updateDamageNumbers();
    this.checkEvents();
  }

  updateDayTime() {
    this.dayTime = (this.dayTime + 1) % 12000;
    if (this.dayTime < 6000) {
      this.dayState = 'day';
    } else if (this.dayTime < 8000) {
      this.dayState = 'dusk';
    } else if (this.dayTime < 11000) {
      this.dayState = 'night';
    } else {
      this.dayState = 'dawn';
    }
  }

  updatePlayer() {
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer--;
    }

    // Check if player is holding guard
    this.player.guarding = !!this.keys['Space'];

    // Handle Attack motion
    if (this.player.attacking) {
      this.player.attackTimer++;
      const maxMotion = (this.player.currentWeapon?.motion2 || 25);
      if (this.player.attackTimer >= maxMotion) {
        this.player.attacking = false;
        this.player.attackTimer = 0;
      }
      return;
    }

    // Check attack / enter trigger
    if (this.keys['Enter']) {
      this.keys['Enter'] = false;
      this.triggerAction();
      return;
    }

    // Check shoot fireball trigger
    if (this.keys['KeyF']) {
      this.keys['KeyF'] = false;
      this.shootFireball();
      return;
    }

    // Movement speed: calibrated for friendly, precise, and responsive navigation
    const isSprinting = !!(this.keys['ShiftLeft'] || this.keys['ShiftRight'] || this.isRunToggled);
    const baseWalkSpeed = this.movementSpeedSetting === 'brisk' ? 3.2 : 2.6;
    const currentSpeed = isSprinting ? baseWalkSpeed * 1.45 : baseWalkSpeed;
    this.player.speed = currentSpeed;

    // Player Movement Inputs
    let up = !!(this.keys['KeyW'] || this.keys['ArrowUp']);
    let down = !!(this.keys['KeyS'] || this.keys['ArrowDown']);
    let left = !!(this.keys['KeyA'] || this.keys['ArrowLeft']);
    let right = !!(this.keys['KeyD'] || this.keys['ArrowRight']);

    // Cancel out direct opposing inputs
    if (up && down) { up = false; down = false; }
    if (left && right) { left = false; right = false; }

    let dirX = 0;
    let dirY = 0;

    if (up) dirY -= 1;
    if (down) dirY += 1;
    if (left) dirX -= 1;
    if (right) dirX += 1;

    if (dirX !== 0 || dirY !== 0) {
      // Determine facing direction (predominant input)
      if (Math.abs(dirY) > Math.abs(dirX)) {
        this.player.direction = dirY > 0 ? 'down' : 'up';
      } else if (Math.abs(dirX) > Math.abs(dirY)) {
        this.player.direction = dirX > 0 ? 'right' : 'left';
      } else {
        if (up) this.player.direction = 'up';
        else if (down) this.player.direction = 'down';
      }

      // Normalize diagonal movement speed so diagonal is not 41% faster
      let stepSpeed = currentSpeed;
      if (dirX !== 0 && dirY !== 0) {
        stepSpeed *= Math.SQRT1_2;
      }

      const dx = dirX * stepSpeed;
      const dy = dirY * stepSpeed;

      this.player.moving = true;
      this.player.animCounter++;
      const stepDuration = isSprinting ? 7 : 10;
      if (this.player.animCounter > stepDuration) {
        this.player.animFrame = (this.player.animFrame % 4) + 1;
        this.player.animCounter = 0;
      }

      // Check collision on X and Y independently to allow smooth sliding and turning
      const nextX = this.player.worldX + dx;
      const nextY = this.player.worldY + dy;

      const canMoveX = dx !== 0 &&
        !this.checkTileCollision(nextX, this.player.worldY, this.player.solidArea) &&
        !this.checkObjectCollision(nextX, this.player.worldY, this.player.solidArea) &&
        !this.checkInteractiveTileCollision(nextX, this.player.worldY, this.player.solidArea) &&
        !this.checkNPCCollision(nextX, this.player.worldY, this.player.solidArea, dx, 0);

      const canMoveY = dy !== 0 &&
        !this.checkTileCollision(this.player.worldX, nextY, this.player.solidArea) &&
        !this.checkObjectCollision(this.player.worldX, nextY, this.player.solidArea) &&
        !this.checkInteractiveTileCollision(this.player.worldX, nextY, this.player.solidArea) &&
        !this.checkNPCCollision(this.player.worldX, nextY, this.player.solidArea, 0, dy);

      if (canMoveX) {
        this.player.worldX = Math.max(0, Math.min((MAX_WORLD_COL - 1) * TILE_SIZE, nextX));
      }
      if (canMoveY) {
        this.player.worldY = Math.max(0, Math.min((MAX_WORLD_ROW - 1) * TILE_SIZE, nextY));
      }

      // Corner-rounding assist for smooth entry into narrow doorways, bridges, and stairs
      if ((!canMoveX && dirX !== 0) || (!canMoveY && dirY !== 0)) {
        this.applyCornerAssist(dirX, dirY, currentSpeed);
      }

      // Collect ground items/pickups
      this.checkPickupCollection();

      // Location update & discovery notification
      this.checkLocationUpdate();
    } else {
      this.player.moving = false;
      this.player.animFrame = 2; // Neutral standing frame
    }
  }

  // Smooth corner assist for narrow passages, bridges, and doorways
  applyCornerAssist(dirX: number, dirY: number, speed: number) {
    const nudge = Math.min(speed * 0.75, 1.8);
    // If blocked moving vertically (e.g. entering boardwalk bridge or door), check if nudging left/right is open
    if (dirY !== 0 && dirX === 0) {
      const checkDist = 12;
      const nextY = this.player.worldY + dirY * speed;
      const leftClear = !this.checkTileCollision(this.player.worldX - checkDist, nextY, this.player.solidArea) &&
        !this.checkObjectCollision(this.player.worldX - checkDist, nextY, this.player.solidArea);
      const rightClear = !this.checkTileCollision(this.player.worldX + checkDist, nextY, this.player.solidArea) &&
        !this.checkObjectCollision(this.player.worldX + checkDist, nextY, this.player.solidArea);

      if (leftClear && !rightClear) {
        if (!this.checkTileCollision(this.player.worldX - nudge, this.player.worldY, this.player.solidArea)) {
          this.player.worldX -= nudge;
        }
      } else if (rightClear && !leftClear) {
        if (!this.checkTileCollision(this.player.worldX + nudge, this.player.worldY, this.player.solidArea)) {
          this.player.worldX += nudge;
        }
      }
    } else if (dirX !== 0 && dirY === 0) {
      // If blocked moving horizontally, check if nudging up/down is open
      const checkDist = 12;
      const nextX = this.player.worldX + dirX * speed;
      const upClear = !this.checkTileCollision(nextX, this.player.worldY - checkDist, this.player.solidArea) &&
        !this.checkObjectCollision(nextX, this.player.worldY - checkDist, this.player.solidArea);
      const downClear = !this.checkTileCollision(nextX, this.player.worldY + checkDist, this.player.solidArea) &&
        !this.checkObjectCollision(nextX, this.player.worldY + checkDist, this.player.solidArea);

      if (upClear && !downClear) {
        if (!this.checkTileCollision(this.player.worldX, this.player.worldY - nudge, this.player.solidArea)) {
          this.player.worldY -= nudge;
        }
      } else if (downClear && !upClear) {
        if (!this.checkTileCollision(this.player.worldX, this.player.worldY + nudge, this.player.solidArea)) {
          this.player.worldY += nudge;
        }
      }
    }
  }

  updateNPCs() {
    const pBox: Rect = {
      x: this.player.worldX + this.player.solidArea.x,
      y: this.player.worldY + this.player.solidArea.y,
      width: this.player.solidArea.width,
      height: this.player.solidArea.height,
    };

    for (const npc of this.npcs) {
      if (npc.map !== this.currentMap || !npc.patrolRoute || npc.patrolRoute.length === 0) continue;

      const idx = npc.patrolIndex ?? 0;
      const target = npc.patrolRoute[idx];
      const tx = target.col * TILE_SIZE;
      const ty = target.row * TILE_SIZE;
      const dx = tx - npc.worldX;
      const dy = ty - npc.worldY;
      const dist = Math.hypot(dx, dy);

      if (dist < 2) {
        npc.worldX = tx;
        npc.worldY = ty;
        npc.patrolIndex = (idx + 1) % npc.patrolRoute.length;
        npc.moving = false;
        npc.animFrame = 2;
        continue;
      }

      const speed = npc.patrolSpeed || 0.85;
      const stepX = (dx / dist) * speed;
      const stepY = (dy / dist) * speed;

      if (Math.abs(dx) > Math.abs(dy)) {
        npc.direction = dx > 0 ? 'right' : 'left';
      } else {
        npc.direction = dy > 0 ? 'down' : 'up';
      }

      const nextBox: Rect = {
        x: npc.worldX + stepX + npc.solidArea.x,
        y: npc.worldY + stepY + npc.solidArea.y,
        width: npc.solidArea.width,
        height: npc.solidArea.height,
      };

      // Pause cleanly if player is in the way or tile is solid
      if (this.rectsIntersect(nextBox, pBox) || this.checkTileCollision(npc.worldX + stepX, npc.worldY + stepY, npc.solidArea)) {
        npc.moving = false;
        npc.animFrame = 2;
        continue;
      }

      npc.worldX += stepX;
      npc.worldY += stepY;
      npc.moving = true;
      npc.animCounter = (npc.animCounter || 0) + 1;
      if (npc.animCounter > 12) {
        npc.animFrame = ((npc.animFrame || 1) % 4) + 1;
        npc.animCounter = 0;
      }
    }
  }

  getLocationInfo(): { name: string; subtitle: string; icon: string } {
    if (this.currentMap !== 0) {
      if (this.currentMap === 1) return { name: "FMS Union Café", subtitle: "Campus Store & Coffee Bar", icon: "☕" };
      if (this.currentMap === 2) return { name: "The Sunken Ruins", subtitle: "Level B1 - Ancient Chambers", icon: "🏛️" };
      if (this.currentMap === 3) return { name: "Sanctum of Monpura", subtitle: "Level B2 - Shadow Warden's Throne", icon: "⚡" };
      if (this.currentMap === 4) return { name: "BUP Central Library", subtitle: "Reading Hall & Rare Archives", icon: "📖" };
      if (this.currentMap === 5) {
        const col = Math.floor((this.player.worldX + 24) / TILE_SIZE);
        const row = Math.floor((this.player.worldY + 24) / TILE_SIZE);
        if (col >= 33 && row >= 17 && row <= 33) return { name: "East Bamboo Grove", subtitle: "Isle of Monpura · Emerald Seal", icon: "🎋" };
        if (col <= 16 && row >= 17 && row <= 30) return { name: "West Village Orchard", subtitle: "Isle of Monpura · Amber Seal", icon: "🌾" };
        if (col <= 17 && row <= 16) return { name: "North Tidepool Shrine", subtitle: "Isle of Monpura · Azure Seal", icon: "🌊" };
        if (col >= 20 && col <= 29 && row <= 13) return { name: "Ancient Ruins Gate", subtitle: "Isle of Monpura · North Shore", icon: "⛩️" };
        return { name: "Isle of Monpura", subtitle: "Mystical World Inside the Book", icon: "🏝️" };
      }
      return { name: "Indoor Area", subtitle: "", icon: "📍" };
    }

    const col = Math.floor((this.player.worldX + 24) / TILE_SIZE);
    const row = Math.floor((this.player.worldY + 24) / TILE_SIZE);

    if (col >= 5 && col <= 18 && row >= 1 && row <= 9) {
      return { name: "FST Building", subtitle: "Faculty of Science & Technology", icon: "💻" };
    }
    if (col >= 19 && col <= 30 && row >= 1 && row <= 6) {
      return { name: "FASS Building", subtitle: "Faculty of Arts & Social Sciences", icon: "📚" };
    }
    if (col >= 31 && col <= 45 && row >= 1 && row <= 9) {
      return { name: "FBS Building", subtitle: "Faculty of Business Studies", icon: "📊" };
    }
    if (col >= 18 && col <= 30 && row >= 7 && row <= 14) {
      return { name: "Central Garden Yard", subtitle: "Botanical Plaza & Courtyard", icon: "🌸" };
    }
    if (col >= 34 && col <= 45 && row >= 18 && row <= 30) {
      return { name: "Third Place Arena", subtitle: "Student Pavilion & Battle Arena", icon: "⚔️" };
    }
    if (col >= 35 && col <= 45 && row >= 33 && row <= 40) {
      return { name: "BUP Central Library", subtitle: "Academic Library & Archives", icon: "📖" };
    }
    if (col >= 5 && col <= 16 && row >= 36 && row <= 44) {
      return { name: "FMS Building", subtitle: "Faculty of Management Studies", icon: "🏢" };
    }
    if (col >= 20 && col <= 32 && row >= 14 && row <= 36) {
      return { name: "Floating Boardwalk", subtitle: "Campus Lake Promenade", icon: "🌉" };
    }
    if (col >= 21 && col <= 26 && row >= 44) {
      return { name: "BUP Main Gate", subtitle: "University Entrance Plaza", icon: "🎓" };
    }
    if (row >= 36) {
      return { name: "South Campus Park", subtitle: "Lotus Fountain & Terraces", icon: "🌿" };
    }
    return { name: "Campus Lake Promenade", subtitle: "Scenic Lakeside Walkway", icon: "📍" };
  }

  checkLocationUpdate() {
    const loc = this.getLocationInfo();
    const col = Math.floor((this.player.worldX + 24) / TILE_SIZE);
    const row = Math.floor((this.player.worldY + 24) / TILE_SIZE);

    // Advance Chapter 1 Stage 0 -> 1 once player walks north onto campus promenade
    if (this.currentMap === 0 && this.questProgress.stage === 0 && row <= 42) {
      this.questProgress.stage = 1;
    }

    if (loc.name !== this.lastLocationName) {
      this.lastLocationName = loc.name;
      this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 24, `${loc.icon} ${loc.name}`, '#38bdf8');

      // Check campus building discovery and collection
      if (this.currentMap === 0) {
        const targetBuilding = this.campusBuildings.find((b) => b.name === loc.name);
        if (targetBuilding && !this.collectedLocations.has(targetBuilding.name)) {
          this.collectedLocations.add(targetBuilding.name);
          sounds.playSE('powerup');
          const count = this.collectedLocations.size;
          this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 44, `📍 Discovered: ${targetBuilding.name} (${count}/4 Buildings)`, '#22c55e');
          if (count === 4) {
            this.player.exp += 40;
            this.player.coin += 30;
            sounds.playSE('fanfare');
            this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 60, '🏆 Campus Tour Complete! +40 EXP +30 Coins', '#fbbf24');
          }
        }
      }

      this.onStateChange();
    }
    void col;
  }

  shootFireball() {
    if (this.player.mana <= 0) {
      sounds.playSE('blocked');
      return;
    }
    this.player.mana--;
    sounds.playSE('burning');

    const spawnX = this.player.worldX + (this.player.direction === 'left' ? -20 : this.player.direction === 'right' ? 20 : 0);
    const spawnY = this.player.worldY + (this.player.direction === 'up' ? -20 : this.player.direction === 'down' ? 20 : 0);

    this.projectiles.push({
      id: `proj_${Date.now()}_${Math.random()}`,
      type: 'fireball',
      worldX: spawnX,
      worldY: spawnY,
      direction: this.player.direction,
      speed: 7,
      attack: 6 + this.player.level,
      life: 60,
      maxLife: 60,
      manaCost: 1,
      sprite: `/res/projectile/fireball_${this.player.direction}_1.png`,
    });
    this.onStateChange();
  }

  updateProjectiles() {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.life--;

      if (p.direction === 'up') p.worldY -= p.speed;
      if (p.direction === 'down') p.worldY += p.speed;
      if (p.direction === 'left') p.worldX -= p.speed;
      if (p.direction === 'right') p.worldX += p.speed;

      // Check collision with monsters
      let hit = false;
      const projBox: Rect = { x: p.worldX + 8, y: p.worldY + 8, width: 32, height: 32 };

      for (const m of this.monsters) {
        if (m.map !== this.currentMap || m.dead) continue;
        const mBox: Rect = {
          x: m.worldX + m.solidArea.x,
          y: m.worldY + m.solidArea.y,
          width: m.solidArea.width,
          height: m.solidArea.height,
        };
        if (this.rectsIntersect(projBox, mBox)) {
          hit = true;
          this.damageMonster(m, p.attack);
          sounds.playSE('hitmonster');
          this.spawnParticles(p.worldX + 24, p.worldY + 24, '#f97316', 8);
          break;
        }
      }

      // Check tile collision
      if (this.checkTileCollision(p.worldX, p.worldY, { x: 8, y: 8, width: 32, height: 32 })) {
        hit = true;
        this.spawnParticles(p.worldX + 24, p.worldY + 24, '#fb923c', 6);
      }

      if (hit || p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  checkPlayerAttackHit() {
    // Attack hitbox in front of player
    let attackX = this.player.worldX;
    let attackY = this.player.worldY;
    const reach = 40;

    if (this.player.direction === 'up') attackY -= reach;
    if (this.player.direction === 'down') attackY += reach;
    if (this.player.direction === 'left') attackX -= reach;
    if (this.player.direction === 'right') attackX += reach;

    const hitBox: Rect = { x: attackX + 4, y: attackY + 4, width: 40, height: 40 };

    // 1. Check monsters
    for (const m of this.monsters) {
      if (m.map !== this.currentMap || m.dead) continue;
      const mBox: Rect = {
        x: m.worldX + m.solidArea.x,
        y: m.worldY + m.solidArea.y,
        width: m.solidArea.width,
        height: m.solidArea.height,
      };

      if (this.rectsIntersect(hitBox, mBox)) {
        const weaponAtk = this.player.currentWeapon?.attackValue || 1;
        const totalDamage = Math.max(1, this.player.strength * weaponAtk + this.player.level - m.defense);
        this.damageMonster(m, totalDamage);
        sounds.playSE('hitmonster');
        this.spawnParticles(m.worldX + 24, m.worldY + 24, '#ef4444', 8);
      }
    }

    // 2. Check interactive tiles (Axe cuts dry trees, Pickaxe breaks walls)
    for (const it of this.interactiveTiles) {
      if (it.map !== this.currentMap) continue;
      const itBox: Rect = { x: it.worldX, y: it.worldY, width: TILE_SIZE, height: TILE_SIZE };

      if (this.rectsIntersect(hitBox, itBox)) {
        if (it.type === 'dry_tree' && this.player.currentWeapon?.id === 'axe') {
          it.life--;
          sounds.playSE('cuttree');
          this.spawnParticles(it.worldX + 24, it.worldY + 24, '#22c55e', 8);
          if (it.life <= 0) {
            it.type = 'trunk';
            it.image = '/res/tiles_interactive/trunk.png';
            this.addDamageNumber(it.worldX + 24, it.worldY - 10, 'Tree Cleared!', '#22c55e');
          }
        } else if (it.type === 'destructible_wall' && this.player.currentWeapon?.id === 'pickaxe') {
          it.life--;
          sounds.playSE('chipwall');
          this.spawnParticles(it.worldX + 24, it.worldY + 24, '#9ca3af', 8);
          if (it.life <= 0) {
            // Remove wall
            const idx = this.interactiveTiles.indexOf(it);
            if (idx !== -1) this.interactiveTiles.splice(idx, 1);
            this.addDamageNumber(it.worldX + 24, it.worldY - 10, 'Path Opened!', '#60a5fa');
          }
        }
      }
    }
  }

  damageMonster(m: Monster, dmg: number) {
    if (m.invincibleTimer > 0) return;
    m.life -= dmg;
    m.invincibleTimer = 15;
    m.knockbackTimer = 6;
    m.knockbackDir = this.player.direction;

    this.addDamageNumber(m.worldX + (m.width || TILE_SIZE) / 2, m.worldY, `-${dmg}`, '#ef4444');

    if (m.isBoss && m.life <= m.maxLife / 2 && !m.inRage) {
      m.inRage = true;
      m.speed = 2.2;
      m.attack += 4;
      this.addDamageNumber(m.worldX + 120, m.worldY + 60, 'ENRAGED!', '#f97316');
      sounds.playSE('burning');
    }

    if (m.life <= 0) {
      m.dead = true;
      this.questProgress.monstersDefeated++;
      sounds.playSE('fanfare');
      this.player.exp += m.exp;
      this.addDamageNumber(m.worldX + 24, m.worldY - 10, `+${m.exp} EXP`, '#eab308');

      // Drop loot (coins, hearts, mana)
      if (Math.random() < 0.6) {
        this.objects.push({
          id: `drop_${Date.now()}_${Math.random()}`,
          name: 'Bronze Coin',
          map: this.currentMap,
          worldX: m.worldX + 12,
          worldY: m.worldY + 12,
          image: '/res/objects/coin_bronze.png',
          solidArea: { x: 0, y: 0, width: 24, height: 24 },
          collision: false,
          type: 'coin',
        });
      }

      // Check level up
      this.checkLevelUp();

      // If boss defeated
      if (m.isBoss) {
        this.bossDefeated = true;
        // Open boss iron door
        const ironDoor = this.objects.find((o) => o.id === 'boss_iron_door');
        if (ironDoor) {
          ironDoor.collision = false;
          ironDoor.destroyed = true;
        }
        this.addDamageNumber(m.worldX + 120, m.worldY + 60, 'WARDEN DEFEATED!', '#38bdf8');
      }
    }
  }

  checkLevelUp() {
    if (this.player.exp >= this.player.nextLevelExp) {
      this.player.level++;
      this.player.exp -= this.player.nextLevelExp;
      this.player.nextLevelExp = Math.floor(this.player.nextLevelExp * 1.8);
      this.player.maxLife += 2;
      this.player.life = this.player.maxLife;
      this.player.maxMana += 1;
      this.player.mana = this.player.maxMana;
      this.player.strength++;
      this.player.dexterity++;

      sounds.playSE('levelup');
      this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 20, 'LEVEL UP!', '#eab308');
      this.onStateChange();
    }
  }

  damagePlayer(amount: number) {
    if (this.player.invincibleTimer > 0) return;

    // Check guarding
    if (this.player.guarding) {
      const shieldDef = this.player.currentShield?.defenseValue || 1;
      const reduced = Math.max(0, amount - shieldDef * 2);
      sounds.playSE('parry');
      this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 10, 'GUARDED!', '#38bdf8');
      if (reduced <= 0) return;
      amount = reduced;
    }

    this.player.life = Math.max(0, this.player.life - amount);
    this.player.invincibleTimer = 40;
    sounds.playSE('receivedamage');
    this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 10, `-${amount}`, '#ef4444');
    this.spawnParticles(this.player.worldX + 24, this.player.worldY + 24, '#ef4444', 10);

    if (this.player.life <= 0) {
      this.keys = {};
      this.player.moving = false;
      this.player.attacking = false;
      this.player.guarding = false;
      this.player.lives = this.clampLives(this.player.lives - 1);
      sounds.stopMusic();
      sounds.playSE('gameover');

      const spawn = LEVEL_START_SPAWNS[this.currentMap] || LEVEL_START_SPAWNS[0];
      this.lastDeathInfo = {
        livesRemaining: this.player.lives,
        levelLabel: spawn.label,
      };

      if (this.player.lives > 0) {
        this.gameState = GameState.LIFE_LOST;
        if (LIVES_CONFIG.PENALIZE_RELOAD_ON_DEATH) {
          this.persistDeathPenalty(false);
        }
      } else {
        this.gameState = GameState.GAME_OVER;
        if (LIVES_CONFIG.PENALIZE_RELOAD_ON_DEATH) {
          this.persistDeathPenalty(true);
        }
      }
      this.onStateChange();
    }
  }

  updateMonsters() {
    for (const m of this.monsters) {
      if (m.map !== this.currentMap || m.dead) continue;

      if (m.invincibleTimer > 0) m.invincibleTimer--;

      // Handle Knockback (respect tile collisions so monsters don't clip into walls)
      if (m.knockbackTimer > 0) {
        m.knockbackTimer--;
        const kbSpeed = 5;
        let kbX = m.worldX;
        let kbY = m.worldY;
        if (m.knockbackDir === 'up') kbY -= kbSpeed;
        if (m.knockbackDir === 'down') kbY += kbSpeed;
        if (m.knockbackDir === 'left') kbX -= kbSpeed;
        if (m.knockbackDir === 'right') kbX += kbSpeed;
        if (!this.checkTileCollision(kbX, kbY, m.solidArea)) {
          m.worldX = kbX;
          m.worldY = kbY;
        }
        continue;
      }

      // AI: distance to player
      const distToPlayer = Math.hypot(this.player.worldX - m.worldX, this.player.worldY - m.worldY);

      m.actionTimer++;
      if (m.actionTimer > 60) {
        m.actionTimer = 0;
        // If close to player, pursue!
        if (distToPlayer < 250) {
          const dx = this.player.worldX - m.worldX;
          const dy = this.player.worldY - m.worldY;
          if (Math.abs(dx) > Math.abs(dy)) {
            m.direction = dx > 0 ? 'right' : 'left';
          } else {
            m.direction = dy > 0 ? 'down' : 'up';
          }
        } else {
          // Wander randomly
          const dirs: Direction[] = ['up', 'down', 'left', 'right'];
          m.direction = dirs[Math.floor(Math.random() * dirs.length)];
        }
      }

      // Move monster
      let mx = 0;
      let my = 0;
      if (m.direction === 'up') my -= m.speed;
      if (m.direction === 'down') my += m.speed;
      if (m.direction === 'left') mx -= m.speed;
      if (m.direction === 'right') mx += m.speed;

      const nextX = m.worldX + mx;
      const nextY = m.worldY + my;

      if (!this.checkTileCollision(nextX, nextY, m.solidArea)) {
        m.worldX = nextX;
        m.worldY = nextY;
      }

      m.animTimer++;
      if (m.animTimer > 15) {
        m.animFrame = m.animFrame === 1 ? 2 : 1;
        m.animTimer = 0;
      }

      // Check collision with player
      const mBox: Rect = {
        x: m.worldX + m.solidArea.x,
        y: m.worldY + m.solidArea.y,
        width: m.solidArea.width,
        height: m.solidArea.height,
      };
      const pBox: Rect = {
        x: this.player.worldX + this.player.solidArea.x,
        y: this.player.worldY + this.player.solidArea.y,
        width: this.player.solidArea.width,
        height: this.player.solidArea.height,
      };

      if (this.rectsIntersect(mBox, pBox)) {
        this.damagePlayer(m.attack);
      }
    }
  }

  updateInteractiveTiles() {
    // Check metal plates being pressed by Player or Big Rock
    for (const it of this.interactiveTiles) {
      if (it.map !== this.currentMap || it.type !== 'metal_plate') continue;

      const plateBox: Rect = { x: it.worldX + 10, y: it.worldY + 10, width: 28, height: 28 };
      let pressedNow = false;

      // Check player
      const pBox: Rect = {
        x: this.player.worldX + this.player.solidArea.x,
        y: this.player.worldY + this.player.solidArea.y,
        width: this.player.solidArea.width,
        height: this.player.solidArea.height,
      };
      if (this.rectsIntersect(plateBox, pBox)) pressedNow = true;

      // Check rocks
      for (const n of this.npcs) {
        if (n.map === this.currentMap && n.isPushable) {
          const rBox: Rect = {
            x: n.worldX + n.solidArea.x,
            y: n.worldY + n.solidArea.y,
            width: n.solidArea.width,
            height: n.solidArea.height,
          };
          if (this.rectsIntersect(plateBox, rBox)) pressedNow = true;
        }
      }

      if (pressedNow && !it.pressed) {
        it.pressed = true;
        sounds.playSE('dooropen');
        this.addDamageNumber(it.worldX + 24, it.worldY - 10, 'Plate Activated!', '#fbbf24');
        // Check if all plates on Map 2 are pressed to open iron door
        const allPlates = this.interactiveTiles.filter((t) => t.map === 2 && t.type === 'metal_plate');
        if (allPlates.every((p) => p.pressed)) {
          const door = this.objects.find((o) => o.id === 'door_iron_1');
          if (door) {
            door.collision = false;
            door.destroyed = true;
            this.addDamageNumber(door.worldX + 24, door.worldY - 10, 'Iron Gate Raised!', '#22c55e');
          }
        }
      }
    }
  }

  updateParticles() {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life--;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  updateDamageNumbers() {
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const d = this.damageNumbers[i];
      d.life--;
      d.y -= 0.5;
      if (d.life <= 0) this.damageNumbers.splice(i, 1);
    }
  }

  spawnParticles(x: number, y: number, color: string, count = 6) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      this.particles.push({
        id: `pt_${Date.now()}_${Math.random()}`,
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 3,
        life: 20 + Math.floor(Math.random() * 15),
        maxLife: 35,
      });
    }
  }

  addDamageNumber(x: number, y: number, text: string, color: string) {
    this.damageNumbers.push({
      id: `dn_${Date.now()}_${Math.random()}`,
      x,
      y,
      text,
      color,
      life: 50,
    });
  }

  // Centralized action trigger for Attack / Talk / Advance Dialogue
  triggerAction(): void {
    // 1. Advance or dismiss dialogue if dialogue window is open
    if (this.gameState === GameState.DIALOGUE) {
      sounds.playSE('cursor');
      this.gameState = GameState.PLAY;
      this.onStateChange();
      return;
    }

    if (this.gameState !== GameState.PLAY) return;

    // 2. Check if there is an NPC, chest, or door in range to talk or open
    if (this.interactWithNearby()) {
      return;
    }

    // 3. Otherwise execute weapon attack
    if (!this.player.attacking) {
      this.player.attacking = true;
      this.player.attackTimer = 0;
      sounds.playSE('swingweapon');
      this.checkPlayerAttackHit();
    }
  }

  // Quick check for UI prompts (whether an interactable NPC, book, seal, or chest is in range)
  hasNearbyInteractable(): boolean {
    if (this.gameState !== GameState.PLAY) return false;
    const pCenterX = this.player.worldX + TILE_SIZE / 2;
    const pCenterY = this.player.worldY + TILE_SIZE / 2;

    for (const npc of this.npcs) {
      if (npc.map !== this.currentMap || npc.isPushable) continue;
      const nCenterX = npc.worldX + TILE_SIZE / 2;
      const nCenterY = npc.worldY + TILE_SIZE / 2;
      if (Math.hypot(pCenterX - nCenterX, pCenterY - nCenterY) < 68) {
        return true;
      }
    }

    for (const obj of this.objects) {
      if (obj.map !== this.currentMap || obj.destroyed) continue;
      if ((obj.type === 'chest' && !obj.opened) || obj.type === 'door' || obj.type === 'monpura_book' || obj.type === 'lore_book' || obj.type === 'seal') {
        const oCenterX = obj.worldX + TILE_SIZE / 2;
        const oCenterY = obj.worldY + TILE_SIZE / 2;
        if (Math.hypot(pCenterX - oCenterX, pCenterY - oCenterY) < 68) {
          return true;
        }
      }
    }
    return false;
  }

  // Interacting with nearby objects/NPCs on Enter key or Attack button
  interactWithNearby(): boolean {
    const reach = 52;
    let targetX = this.player.worldX;
    let targetY = this.player.worldY;
    if (this.player.direction === 'up') targetY -= reach;
    if (this.player.direction === 'down') targetY += reach;
    if (this.player.direction === 'left') targetX -= reach;
    if (this.player.direction === 'right') targetX += reach;

    // Use a slightly larger interaction box (56x56) to allow easy alignment
    const hitBox: Rect = { x: targetX - 4, y: targetY - 4, width: TILE_SIZE + 8, height: TILE_SIZE + 8 };
    const pCenterX = this.player.worldX + TILE_SIZE / 2;
    const pCenterY = this.player.worldY + TILE_SIZE / 2;

    // 1. Check NPCs (directional hitBox OR close proximity within 68px)
    for (const npc of this.npcs) {
      if (npc.map !== this.currentMap || npc.isPushable) continue;
      const nBox: Rect = { x: npc.worldX, y: npc.worldY, width: TILE_SIZE, height: TILE_SIZE };
      const nCenterX = npc.worldX + TILE_SIZE / 2;
      const nCenterY = npc.worldY + TILE_SIZE / 2;
      const dist = Math.hypot(pCenterX - nCenterX, pCenterY - nCenterY);

      if (this.rectsIntersect(hitBox, nBox) || dist < 68) {
        // Face the player when talking
        if (this.player.direction === 'up') npc.direction = 'down';
        else if (this.player.direction === 'down') npc.direction = 'up';
        else if (this.player.direction === 'left') npc.direction = 'right';
        else if (this.player.direction === 'right') npc.direction = 'left';

        // Update story quest flags on key NPCs
        if (npc.id === 'guide_tanvir') {
          this.questProgress.talkedToGuide = true;
          if (this.questProgress.stage < 1) this.questProgress.stage = 1;
        } else if (npc.id === 'librarian_rahman') {
          this.questProgress.talkedToLibrarian = true;
        } else if (npc.id === 'elder_karim') {
          this.questProgress.talkedToElder = true;
        }

        if (npc.isShop) {
          this.activeShopNPC = npc;
          this.gameState = GameState.TRADE;
          sounds.playMusic('merchant');
          this.onStateChange();
          return true;
        } else if (npc.dialogues.length > 0) {
          this.dialogueSpeaker = npc.name;
          this.dialogueText = npc.dialogues[npc.dialogueIndex];
          npc.dialogueIndex = (npc.dialogueIndex + 1) % npc.dialogues.length;
          this.gameState = GameState.DIALOGUE;
          sounds.playSE('speak');
          this.onStateChange();
          return true;
        }
      }
    }

    // 2. Check Books, Seals, Chests & Doors
    for (let i = 0; i < this.objects.length; i++) {
      const obj = this.objects[i];
      if (obj.map !== this.currentMap || obj.destroyed) continue;
      const oBox: Rect = { x: obj.worldX, y: obj.worldY, width: TILE_SIZE, height: TILE_SIZE };
      const oCenterX = obj.worldX + TILE_SIZE / 2;
      const oCenterY = obj.worldY + TILE_SIZE / 2;
      const dist = Math.hypot(pCenterX - oCenterX, pCenterY - oCenterY);

      if (this.rectsIntersect(hitBox, oBox) || (obj.interactive && dist < 68)) {
        if (obj.type === 'monpura_book') {
          this.keys = {};
          this.player.moving = false;
          this.gameState = GameState.BOOK_CUTSCENE;
          sounds.playSE('powerup');
          this.onStateChange();
          return true;
        } else if (obj.type === 'lore_book') {
          if (!this.questProgress.libraryBooksRead.includes(obj.id)) {
            this.questProgress.libraryBooksRead.push(obj.id);
            this.player.exp += 5;
            this.checkLevelUp();
          }
          this.dialogueSpeaker = obj.name;
          this.dialogueText = obj.dialogue || 'Ancient pages rustle softly.';
          this.gameState = GameState.DIALOGUE;
          sounds.playSE('speak');
          this.onStateChange();
          return true;
        } else if (obj.type === 'seal') {
          this.collectSealObject(obj, i);
          return true;
        } else if (obj.type === 'chest' && !obj.opened) {
          obj.opened = true;
          obj.image = '/res/objects/chest_opened.png';
          if (!this.openedChests.includes(obj.id)) {
            this.openedChests.push(obj.id);
          }
          sounds.playSE('fanfare');
          if (obj.loot) {
            this.player.inventory.push({ ...obj.loot });
            this.dialogueSpeaker = 'Treasure Chest';
            this.dialogueText = `You opened the chest and obtained:\n[${obj.loot.name}]!\n${obj.loot.description}`;
            this.gameState = GameState.DIALOGUE;
            this.onStateChange();
            return true;
          }
        } else if (obj.type === 'door') {
          const keyIdx = this.player.inventory.findIndex((item) => item.type === 'key');
          if (keyIdx !== -1) {
            const keyItem = this.player.inventory[keyIdx];
            if ((keyItem.amount || 1) > 1) {
              keyItem.amount = (keyItem.amount || 1) - 1;
            } else {
              this.player.inventory.splice(keyIdx, 1);
            }
            obj.collision = false;
            obj.destroyed = true;
            if (!this.unlockedDoors.includes(obj.id)) {
              this.unlockedDoors.push(obj.id);
            }
            sounds.playSE('unlock');
            this.addDamageNumber(obj.worldX + 24, obj.worldY - 10, 'Door Unlocked!', '#4ade80');
            this.onStateChange();
            return true;
          } else {
            sounds.playSE('blocked');
            this.dialogueSpeaker = 'Locked Door';
            this.dialogueText = 'This door is securely locked. You need a Key to open it!';
            this.gameState = GameState.DIALOGUE;
            this.onStateChange();
            return true;
          }
        }
      }
    }

    return false;
  }

  enterMonpuraFromBook(): void {
    this.questProgress.bookOpened = true;
    if (this.questProgress.stage < 3) {
      this.questProgress.stage = 3;
    }
    this.teleport(5, 24, 40, 'theme', 'up');
    this.onStateChange();
  }

  returnToCampusEpilogue(): void {
    this.questProgress.stage = 6;
    this.player.life = this.player.maxLife;
    this.player.mana = this.player.maxMana;
    this.teleport(0, 40, 41, 'theme', 'down');
    this.onStateChange();
  }

  collectSealObject(obj: GameObject, idx: number): void {
    if (!this.questProgress.sealsCollected.includes(obj.id)) {
      this.questProgress.sealsCollected.push(obj.id);
    }
    this.player.inventory.push(createItem(obj.id, 1));
    this.objects.splice(idx, 1);
    sounds.playSE('fanfare');
    this.spawnParticles(obj.worldX + 24, obj.worldY + 24, '#34d399', 14);

    const count = this.questProgress.sealsCollected.length;
    this.dialogueSpeaker = 'Sacred Seal Recovered';
    this.dialogueText =
      count < 3
        ? `You obtained the [${obj.name}]! (${count}/3 Sacred Seals)\nSeek the remaining seals across the Isle of Monpura.`
        : `You obtained the [${obj.name}]! (3/3 Sacred Seals)\nAll three seals resonate! The Ancient Ruins Gate on the north shore is now unsealed!`;
    this.gameState = GameState.DIALOGUE;
    this.onStateChange();
  }

  // Event Triggers (stairs, teleports, healing pool, damage pit)
  checkEvents() {
    const col = Math.floor((this.player.worldX + 24) / TILE_SIZE);
    const row = Math.floor((this.player.worldY + 24) / TILE_SIZE);

    // Distance check to reset canTouchEvent (must step away by at least 1 tile)
    const xDist = Math.abs(this.player.worldX - this.previousEventX);
    const yDist = Math.abs(this.player.worldY - this.previousEventY);
    if (Math.max(xDist, yDist) > TILE_SIZE) {
      this.canTouchEvent = true;
    }

    if (!this.canTouchEvent) return;

    // Map 0 -> Map 1 (Merchant house / FMS Union Café doorway at 10, 39)
    if (this.currentMap === 0 && col === 10 && row === 39) {
      this.teleport(1, 12, 12, 'merchant', 'up');
    }
    // Map 1 -> Map 0 (FMS Union Café exit at 12, 13 -> north brick step 10, 38)
    else if (this.currentMap === 1 && col === 12 && row === 13) {
      this.teleport(0, 10, 38, 'theme', 'up');
    }
    // Map 0 -> Map 4 (BUP Central Library entrance at 40, 38)
    else if (this.currentMap === 0 && col === 40 && row === 38) {
      if (this.questProgress.stage < 2) {
        this.questProgress.stage = 2;
      }
      this.teleport(4, 24, 27, 'theme', 'up');
    }
    // Map 4 -> Map 0 (Exiting BUP Central Library at 24..25, 29..30 -> 40, 39)
    else if (this.currentMap === 4 && (col === 24 || col === 25) && (row === 29 || row === 30)) {
      this.teleport(0, 40, 39, 'theme', 'down');
    }
    // Map 0 -> Map 2 (FST Building Tech Lab entrance at 11, 8)
    else if (this.currentMap === 0 && col === 11 && row === 8) {
      this.dungeonEntrySource = 'campus';
      this.teleport(2, 9, 40, 'theme', 'up');
    }
    // Map 5 -> Map 4 (Arrival Portal at 24, 41 returns to BUP Central Library)
    else if (this.currentMap === 5 && col === 24 && row === 41) {
      this.teleport(4, 24, 15, 'theme', 'down');
    }
    // Map 5 -> Map 2 (Ancient Ruins Gate at 24, 8)
    else if (this.currentMap === 5 && col === 24 && row === 8) {
      if (this.questProgress.sealsCollected.length < 3) {
        this.canTouchEvent = false;
        this.previousEventX = this.player.worldX;
        this.previousEventY = this.player.worldY;
        sounds.playSE('blocked');
        this.dialogueSpeaker = 'Ancient Ruins Gate';
        this.dialogueText = `The Ruins Gate is sealed by ancient runes!\nRecover all 3 Sacred Seals of Monpura first (${this.questProgress.sealsCollected.length}/3 collected).`;
        this.gameState = GameState.DIALOGUE;
        this.onStateChange();
      } else {
        this.dungeonEntrySource = 'monpura';
        if (this.questProgress.stage < 4) {
          this.questProgress.stage = 4;
        }
        this.teleport(2, 9, 40, 'theme', 'up');
      }
    }
    // Map 2 -> Map 5 or Map 0 (Exiting Sunken Ruins at 9, 41)
    else if (this.currentMap === 2 && col === 9 && row === 41) {
      if (this.dungeonEntrySource === 'monpura') {
        this.teleport(5, 24, 10, 'theme', 'down');
      } else {
        this.teleport(0, 11, 9, 'theme', 'down');
      }
    }
    // Map 2 -> Map 3 (Sanctum of Monpura stairs at 8, 7)
    else if (this.currentMap === 2 && col === 8 && row === 7) {
      if (this.questProgress.stage < 5) {
        this.questProgress.stage = 5;
      }
      this.teleport(3, 26, 40, 'theme', 'up');
    }
    // Map 3 -> Map 2 (Sanctum return stairs at 26, 41)
    else if (this.currentMap === 3 && col === 26 && row === 41) {
      this.teleport(2, 8, 8, 'theme', 'down');
    }
    // Healing Pool / Lotus Fountain at (23, 12) or South Fountain at (23, 44)
    else if (this.currentMap === 0 && ((col === 23 && row === 12) || (col === 23 && row === 44)) && (this.player.life < this.player.maxLife || this.player.mana < this.player.maxMana)) {
      this.canTouchEvent = false;
      this.previousEventX = this.player.worldX;
      this.previousEventY = this.player.worldY;
      this.player.life = this.player.maxLife;
      this.player.mana = this.player.maxMana;
      sounds.playSE('powerup');
      this.addDamageNumber(this.player.worldX + 24, this.player.worldY - 10, 'Fully Healed & Mana Restored!', '#38bdf8');
      this.onStateChange();
    }
    // Damage Pit on Map 0 at (27, 16)
    else if (this.currentMap === 0 && col === 27 && row === 16 && this.player.invincibleTimer === 0) {
      this.canTouchEvent = false;
      this.previousEventX = this.player.worldX;
      this.previousEventY = this.player.worldY;
      this.damagePlayer(2);
      this.dialogueSpeaker = 'Trap';
      this.dialogueText = 'You fell into a pit of spikes!';
      this.gameState = GameState.DIALOGUE;
      this.onStateChange();
    }
  }

  teleport(targetMap: number, col: number, row: number, music?: 'theme' | 'merchant', dir?: Direction) {
    this.keys = {}; // Clear all held keys
    this.player.moving = false;
    this.canTouchEvent = false;
    this.gameState = GameState.TRANSITION;
    this.transitionStateCounter = 0;
    this.transitionAlpha = 0;
    this.targetTransitionMap = targetMap;
    this.targetTransitionCol = col;
    this.targetTransitionRow = row;
    this.targetTransitionMusic = music || null;
    this.targetTransitionDirection = dir || null;
    sounds.playSE('stairs');
  }

  updateTransition() {
    this.transitionStateCounter++;
    // Phase 1: Fade to black (1 to 14 frames)
    if (this.transitionStateCounter <= 14) {
      this.transitionAlpha = Math.min(1, this.transitionStateCounter / 14);
    } 
    // Midpoint (Frame 15): screen is completely black, change world & coordinates cleanly
    else if (this.transitionStateCounter === 15) {
      this.keys = {}; // Clear keys at midpoint
      this.transitionAlpha = 1;
      this.currentMap = this.targetTransitionMap;
      this.player.worldX = this.targetTransitionCol * TILE_SIZE;
      this.player.worldY = this.targetTransitionRow * TILE_SIZE;
      if (this.targetTransitionDirection) {
        this.player.direction = this.targetTransitionDirection;
      }
      this.previousEventX = this.player.worldX;
      this.previousEventY = this.player.worldY;
      this.player.moving = false;
      this.projectiles = []; // Clear active projectiles across map bounds
      if (this.targetTransitionMusic) {
        sounds.playMusic(this.targetTransitionMusic);
      }
      this.onStateChange();
    } 
    // Phase 2: Fade in from black (16 to 28 frames)
    else if (this.transitionStateCounter <= 28) {
      this.transitionAlpha = Math.max(0, 1 - (this.transitionStateCounter - 15) / 13);
    } 
    // Complete transition
    else {
      this.keys = {}; // Clear keys on completion
      this.player.moving = false;
      this.transitionAlpha = 0;
      this.transitionStateCounter = 0;
      this.gameState = GameState.PLAY;
      this.onStateChange();
    }
  }

  checkPickupCollection() {
    const pBox: Rect = {
      x: this.player.worldX + 8,
      y: this.player.worldY + 16,
      width: 32,
      height: 32,
    };

    for (let i = this.objects.length - 1; i >= 0; i--) {
      const obj = this.objects[i];
      if (obj.map !== this.currentMap || obj.collision || obj.destroyed) continue;

      const oBox: Rect = {
        x: obj.worldX + obj.solidArea.x,
        y: obj.worldY + obj.solidArea.y,
        width: obj.solidArea.width,
        height: obj.solidArea.height,
      };

      if (this.rectsIntersect(pBox, oBox)) {
        if (obj.type === 'coin') {
          this.player.coin += 5;
          sounds.playSE('coin');
          this.addDamageNumber(obj.worldX + 24, obj.worldY - 10, '+5 Coins', '#fbbf24');
          this.objects.splice(i, 1);
          this.onStateChange();
        } else if (obj.type === 'key') {
          const existing = this.player.inventory.find((item) => item.type === 'key');
          if (existing) {
            existing.amount = (existing.amount || 1) + 1;
          } else {
            this.player.inventory.push(createItem('key', 1));
          }
          if (!this.collectedPickups.includes(obj.id)) {
            this.collectedPickups.push(obj.id);
          }
          sounds.playSE('coin');
          const locText = obj.id === 'key_1' ? 'Key near FASS Building!' : obj.id === 'key_2' ? 'Key near FMS Building!' : 'Obtained Key!';
          this.addDamageNumber(obj.worldX + 24, obj.worldY - 10, locText, '#fbbf24');
          this.objects.splice(i, 1);
          this.onStateChange();
        } else if (obj.type === 'axe' || obj.type === 'lantern' || obj.type === 'tent') {
          this.player.inventory.push(createItem(obj.type, 1));
          if (obj.type === 'lantern') this.player.hasLantern = true;
          if (!this.collectedPickups.includes(obj.id)) {
            this.collectedPickups.push(obj.id);
          }
          sounds.playSE('powerup');
          this.dialogueSpeaker = 'Item Discovered';
          if (obj.id === 'axe_1') {
            this.dialogueText = `You obtained the [Hammer] in the Central Garden Yard!\nCheck your inventory (C key) to equip it and crush obstacles and monsters.`;
          } else if (obj.id === 'lantern_1') {
            this.dialogueText = `You obtained the [Lantern] near FBS Building Plaza!\nIt illuminates dark underground tech labs and dungeons.`;
          } else if (obj.id === 'tent_1') {
            this.dialogueText = `You obtained the [Tent] near FST Building!\nUse it to rest and fully replenish your Health and Mana.`;
          } else {
            this.dialogueText = `You obtained the [${obj.name}]!\nCheck your inventory (C key) to inspect or equip it.`;
          }
          this.gameState = GameState.DIALOGUE;
          this.objects.splice(i, 1);
          this.onStateChange();
        } else if (obj.type === 'seal') {
          this.collectSealObject(obj, i);
          break;
        } else if (obj.type === 'blue_heart') {
          // The Ultimate Victory! Heart of Monpura
          this.player.inventory.push(createItem('blue_heart'));
          this.questProgress.stage = 6;
          this.objects.splice(i, 1);
          this.gameState = GameState.VICTORY;
          sounds.stopMusic();
          sounds.playSE('fanfare');
          this.onStateChange();
          break;
        }
      }
    }
  }

  // Collisions
  checkTileCollision(worldX: number, worldY: number, solidArea: Rect): boolean {
    const leftX = worldX + solidArea.x;
    const rightX = worldX + solidArea.x + solidArea.width;
    const topY = worldY + solidArea.y;
    const bottomY = worldY + solidArea.y + solidArea.height;

    const leftCol = Math.floor(leftX / TILE_SIZE);
    const rightCol = Math.floor(rightX / TILE_SIZE);
    const topRow = Math.floor(topY / TILE_SIZE);
    const bottomRow = Math.floor(bottomY / TILE_SIZE);

    const map = this.maps[this.currentMap];
    if (!map) return false;

    for (let r = topRow; r <= bottomRow; r++) {
      for (let c = leftCol; c <= rightCol; c++) {
        if (r < 0 || r >= MAX_WORLD_ROW || c < 0 || c >= MAX_WORLD_COL) return true;
        const tileNum = map[r]?.[c];
        if (tileNum !== undefined && TILE_DATA[tileNum]?.collision) {
          return true;
        }
      }
    }
    return false;
  }

  checkObjectCollision(worldX: number, worldY: number, solidArea: Rect): boolean {
    const box: Rect = {
      x: worldX + solidArea.x,
      y: worldY + solidArea.y,
      width: solidArea.width,
      height: solidArea.height,
    };
    for (const obj of this.objects) {
      if (obj.map !== this.currentMap || !obj.collision || obj.destroyed) continue;
      const oBox: Rect = {
        x: obj.worldX + obj.solidArea.x,
        y: obj.worldY + obj.solidArea.y,
        width: obj.solidArea.width,
        height: obj.solidArea.height,
      };
      if (this.rectsIntersect(box, oBox)) return true;
    }
    return false;
  }

  checkInteractiveTileCollision(worldX: number, worldY: number, solidArea: Rect): boolean {
    const box: Rect = {
      x: worldX + solidArea.x,
      y: worldY + solidArea.y,
      width: solidArea.width,
      height: solidArea.height,
    };
    for (const it of this.interactiveTiles) {
      if (it.map !== this.currentMap || it.type === 'trunk' || it.type === 'metal_plate') continue;
      const itBox: Rect = { x: it.worldX, y: it.worldY, width: TILE_SIZE, height: TILE_SIZE };
      if (this.rectsIntersect(box, itBox)) return true;
    }
    return false;
  }

  checkNPCCollision(worldX: number, worldY: number, solidArea: Rect, pushDx: number, pushDy: number): boolean {
    const box: Rect = {
      x: worldX + solidArea.x,
      y: worldY + solidArea.y,
      width: solidArea.width,
      height: solidArea.height,
    };
    for (const npc of this.npcs) {
      if (npc.map !== this.currentMap) continue;
      const nBox: Rect = {
        x: npc.worldX + npc.solidArea.x,
        y: npc.worldY + npc.solidArea.y,
        width: npc.solidArea.width,
        height: npc.solidArea.height,
      };
      if (this.rectsIntersect(box, nBox)) {
        // If it's a pushable rock, try pushing it!
        if (npc.isPushable) {
          const rockNextX = npc.worldX + pushDx;
          const rockNextY = npc.worldY + pushDy;
          if (
            !this.checkTileCollision(rockNextX, rockNextY, npc.solidArea) &&
            !this.checkInteractiveTileCollision(rockNextX, rockNextY, npc.solidArea) &&
            !this.checkObjectCollision(rockNextX, rockNextY, npc.solidArea)
          ) {
            npc.worldX = rockNextX;
            npc.worldY = rockNextY;
            sounds.playSE('chipwall');
          }
        }
        return true;
      }
    }
    return false;
  }

  rectsIntersect(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }
}

export const game = new GameEngine();
