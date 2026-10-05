import { GameState, Direction, Rect, Item, GameObject, InteractiveTile, NPC, Monster, Projectile, Particle, DamageNumber } from './types';
import { ITEMS, createItem } from './items';
import { TILE_DATA, MAP_CONFIGS, loadMapGrid } from './maps';
import { assets } from './assets';
import { sounds } from './sound';

export const TILE_SIZE = 48;
export const SCREEN_WIDTH = 960;
export const SCREEN_HEIGHT = 576;
export const MAX_WORLD_COL = 50;
export const MAX_WORLD_ROW = 50;

export class GameEngine {
  public gameState: GameState = GameState.TITLE;
  public currentMap: number = 0;
  public maps: number[][][] = []; // [mapIndex][row][col]

  // Player
  public player = {
    worldX: 23 * TILE_SIZE,
    worldY: 21 * TILE_SIZE,
    screenX: SCREEN_WIDTH / 2 - TILE_SIZE / 2,
    screenY: SCREEN_HEIGHT / 2 - TILE_SIZE / 2,
    speed: 4,
    defaultSpeed: 4,
    direction: 'down' as Direction,
    level: 1,
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
    animFrame: 1,
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

  // Day/Night and Environment
  public dayTime: number = 0; // 0..12000
  public dayState: 'day' | 'dusk' | 'night' | 'dawn' = 'day';

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

    // Map 0: World Map Objects
    this.objects.push(
      { id: 'axe_1', name: 'Axe', map: 0, worldX: 33 * TILE_SIZE, worldY: 7 * TILE_SIZE, image: '/res/objects/axe.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'axe' },
      { id: 'lantern_1', name: 'Lantern', map: 0, worldX: 31 * TILE_SIZE, worldY: 12 * TILE_SIZE, image: '/res/objects/lantern.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'lantern' },
      { id: 'tent_1', name: 'Tent', map: 0, worldX: 26 * TILE_SIZE, worldY: 16 * TILE_SIZE, image: '/res/objects/tent.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'tent' },
      { id: 'door_1', name: 'Door', map: 0, worldX: 14 * TILE_SIZE, worldY: 28 * TILE_SIZE, image: '/res/objects/door.png', solidArea: { x: 0, y: 0, width: 48, height: 48 }, collision: true, type: 'door' },
      { id: 'door_2', name: 'Door', map: 0, worldX: 12 * TILE_SIZE, worldY: 12 * TILE_SIZE, image: '/res/objects/door.png', solidArea: { x: 0, y: 0, width: 48, height: 48 }, collision: true, type: 'door' },
      { id: 'key_1', name: 'Key', map: 0, worldX: 22 * TILE_SIZE, worldY: 41 * TILE_SIZE, image: '/res/objects/key.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'key' },
      { id: 'key_2', name: 'Key', map: 0, worldX: 38 * TILE_SIZE, worldY: 40 * TILE_SIZE, image: '/res/objects/key.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'key' },
    );

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
      { id: 'blue_gem_goal', name: 'Blue Gem', map: 3, worldX: 25 * TILE_SIZE, worldY: 8 * TILE_SIZE, image: '/res/objects/blueheart.png', solidArea: { x: 8, y: 8, width: 32, height: 32 }, collision: false, type: 'blue_heart' },
    );

    // Interactive Tiles: Dry Trees on Map 0
    const treeCoords = [
      [27, 12], [28, 12], [29, 12], [30, 12], [32, 12], [33, 12],
      [18, 40], [17, 40], [16, 40], [15, 40], [14, 40], [13, 40], [10, 40],
      [13, 41], [12, 41], [11, 41], [10, 41],
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

    // NPCs
    this.npcs.push({
      id: 'oldman',
      name: 'Old Man',
      map: 0,
      worldX: 21 * TILE_SIZE,
      worldY: 21 * TILE_SIZE,
      direction: 'down',
      sprite: '/res/npc/oldman_down_1.png',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: [
        'Hello, young adventurer!\nSo you have come seeking the legendary Blue Gem?',
        'Beware of slimes and orcs wandering the island.\nPress Enter to strike with your sword, and Space to raise your shield!',
        'You can chop down dry trees if you find a Woodcutter Axe,\nand break weak dungeon walls with a Pickaxe.',
        'If you become weary, drink from the sacred healing spring to the north!',
      ],
      dialogueIndex: 0,
    });

    this.npcs.push({
      id: 'merchant',
      name: 'Merchant',
      map: 1,
      worldX: 12 * TILE_SIZE,
      worldY: 7 * TILE_SIZE,
      direction: 'down',
      sprite: '/res/npc/merchant_down_1.png',
      solidArea: { x: 8, y: 16, width: 32, height: 32 },
      dialogues: ['He he ha! Welcome to my modest shop! Browse my wares, traveller.'],
      dialogueIndex: 0,
      isShop: true,
    });

    // Pushable Rocks in Dungeon 1
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
        solidArea: { x: 4, y: 4, width: 40, height: 40 },
        dialogues: [],
        dialogueIndex: 0,
        isPushable: true,
      });
    });

    // Monsters: Map 0
    const slimeCoords = [[23, 36], [23, 37], [24, 37], [34, 42], [38, 42]];
    slimeCoords.forEach(([col, row], idx) => {
      this.monsters.push({
        id: `green_slime_${idx}`,
        name: 'Green Slime',
        map: 0,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        direction: 'down',
        speed: 1,
        maxLife: 4,
        life: 4,
        attack: 2,
        defense: 0,
        exp: 2,
        solidArea: { x: 6, y: 18, width: 36, height: 26 },
        spritePrefix: '/res/monster/greenslime_down',
        animFrame: 1,
        animTimer: 0,
        actionTimer: 0,
        invincibleTimer: 0,
        knockbackTimer: 0,
      });
    });

    const redSlimes = [[34, 11], [38, 7], [37, 9]];
    redSlimes.forEach(([col, row], idx) => {
      this.monsters.push({
        id: `red_slime_${idx}`,
        name: 'Red Slime',
        map: 0,
        worldX: col * TILE_SIZE,
        worldY: row * TILE_SIZE,
        direction: 'down',
        speed: 2,
        maxLife: 8,
        life: 8,
        attack: 4,
        defense: 1,
        exp: 5,
        solidArea: { x: 6, y: 18, width: 36, height: 26 },
        spritePrefix: '/res/monster/redslime_down',
        animFrame: 1,
        animTimer: 0,
        actionTimer: 0,
        invincibleTimer: 0,
        knockbackTimer: 0,
      });
    });

    this.monsters.push({
      id: 'orc_1',
      name: 'Orc Warrior',
      map: 0,
      worldX: 12 * TILE_SIZE,
      worldY: 33 * TILE_SIZE,
      direction: 'down',
      speed: 1.5,
      maxLife: 12,
      life: 12,
      attack: 6,
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

    // Skeleton Lord Boss in Dungeon 2 (Map 3)
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
  }

  startNewGame() {
    this.gameState = GameState.PLAY;
    this.currentMap = 0;
    this.player.worldX = 23 * TILE_SIZE;
    this.player.worldY = 21 * TILE_SIZE;
    this.player.life = this.player.maxLife;
    this.player.mana = this.player.maxMana;
    this.player.level = 1;
    this.player.exp = 0;
    this.player.coin = 50;
    this.player.currentWeapon = createItem('sword_normal');
    this.player.currentShield = createItem('shield_wood');
    this.player.inventory = [
      createItem('sword_normal'),
      createItem('shield_wood'),
      createItem('key', 1),
      createItem('potion_red', 2),
    ];
    this.bossDefeated = false;
    this.transitionStateCounter = 0;
    this.transitionAlpha = 0;
    this.canTouchEvent = true;
    this.previousEventX = this.player.worldX;
    this.previousEventY = this.player.worldY;
    this.setupEntities();
    sounds.playMusic('theme');
    this.onStateChange();
  }

  saveGame(): void {
    const saveData = {
      worldX: this.player.worldX,
      worldY: this.player.worldY,
      currentMap: this.currentMap,
      life: this.player.life,
      maxLife: this.player.maxLife,
      mana: this.player.mana,
      maxMana: this.player.maxMana,
      level: this.player.level,
      exp: this.player.exp,
      coin: this.player.coin,
      inventory: this.player.inventory,
      currentWeapon: this.player.currentWeapon,
      currentShield: this.player.currentShield,
      bossDefeated: this.bossDefeated,
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
      this.player.worldX = data.worldX;
      this.player.worldY = data.worldY;
      this.currentMap = data.currentMap;
      this.player.life = data.life;
      this.player.maxLife = data.maxLife;
      this.player.mana = data.mana;
      this.player.maxMana = data.maxMana;
      this.player.level = data.level;
      this.player.exp = data.exp;
      this.player.coin = data.coin;
      this.player.inventory = data.inventory;
      this.player.currentWeapon = data.currentWeapon;
      this.player.currentShield = data.currentShield;
      this.bossDefeated = data.bossDefeated;
      this.gameState = GameState.PLAY;
      sounds.playMusic('theme');
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

    // Player Movement
    let dx = 0;
    let dy = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) {
      this.player.direction = 'up';
      dy -= this.player.speed;
    } else if (this.keys['KeyS'] || this.keys['ArrowDown']) {
      this.player.direction = 'down';
      dy += this.player.speed;
    } else if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
      this.player.direction = 'left';
      dx -= this.player.speed;
    } else if (this.keys['KeyD'] || this.keys['ArrowRight']) {
      this.player.direction = 'right';
      dx += this.player.speed;
    }

    if (dx !== 0 || dy !== 0) {
      this.player.moving = true;
      this.player.animCounter++;
      if (this.player.animCounter > 10) {
        this.player.animFrame = this.player.animFrame === 1 ? 2 : 1;
        this.player.animCounter = 0;
      }

      // Check collision with solid tiles
      const nextX = this.player.worldX + dx;
      const nextY = this.player.worldY + dy;

      if (!this.checkTileCollision(nextX, nextY, this.player.solidArea) &&
          !this.checkObjectCollision(nextX, nextY, this.player.solidArea) &&
          !this.checkInteractiveTileCollision(nextX, nextY, this.player.solidArea) &&
          !this.checkNPCCollision(nextX, nextY, this.player.solidArea, dx, dy)) {
        this.player.worldX = Math.max(0, Math.min((MAX_WORLD_COL - 1) * TILE_SIZE, nextX));
        this.player.worldY = Math.max(0, Math.min((MAX_WORLD_ROW - 1) * TILE_SIZE, nextY));
      }

      // Collect ground items/pickups
      this.checkPickupCollection();
    } else {
      this.player.moving = false;
    }
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
        this.addDamageNumber(m.worldX + 120, m.worldY + 60, 'BOSS DEFEATED!', '#38bdf8');
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
      this.gameState = GameState.GAME_OVER;
      sounds.stopMusic();
      sounds.playSE('gameover');
      this.onStateChange();
    }
  }

  updateMonsters() {
    for (const m of this.monsters) {
      if (m.map !== this.currentMap || m.dead) continue;

      if (m.invincibleTimer > 0) m.invincibleTimer--;

      // Handle Knockback
      if (m.knockbackTimer > 0) {
        m.knockbackTimer--;
        const kbSpeed = 5;
        if (m.knockbackDir === 'up') m.worldY -= kbSpeed;
        if (m.knockbackDir === 'down') m.worldY += kbSpeed;
        if (m.knockbackDir === 'left') m.worldX -= kbSpeed;
        if (m.knockbackDir === 'right') m.worldX += kbSpeed;
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

  // Quick check for UI prompts (whether an interactable NPC or chest is in range)
  hasNearbyInteractable(): boolean {
    if (this.gameState !== GameState.PLAY) return false;
    const pCenterX = this.player.worldX + TILE_SIZE / 2;
    const pCenterY = this.player.worldY + TILE_SIZE / 2;

    for (const npc of this.npcs) {
      if (npc.map !== this.currentMap) continue;
      const nCenterX = npc.worldX + TILE_SIZE / 2;
      const nCenterY = npc.worldY + TILE_SIZE / 2;
      if (Math.hypot(pCenterX - nCenterX, pCenterY - nCenterY) < 68) {
        return true;
      }
    }

    for (const obj of this.objects) {
      if (obj.map !== this.currentMap || obj.destroyed) continue;
      if (obj.type === 'chest' && !obj.opened) {
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
      if (npc.map !== this.currentMap) continue;
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

    // 2. Check Chests & Doors
    for (const obj of this.objects) {
      if (obj.map !== this.currentMap || obj.destroyed) continue;
      const oBox: Rect = { x: obj.worldX, y: obj.worldY, width: TILE_SIZE, height: TILE_SIZE };

      if (this.rectsIntersect(hitBox, oBox)) {
        if (obj.type === 'chest' && !obj.opened) {
          obj.opened = true;
          obj.image = '/res/objects/chest_opened.png';
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
          const keyIdx = this.player.inventory.findIndex((i) => i.type === 'key');
          if (keyIdx !== -1) {
            const keyItem = this.player.inventory[keyIdx];
            if ((keyItem.amount || 1) > 1) {
              keyItem.amount = (keyItem.amount || 1) - 1;
            } else {
              this.player.inventory.splice(keyIdx, 1);
            }
            obj.collision = false;
            obj.destroyed = true;
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

    // Map 0 -> Map 1 (Merchant house doorway at 10, 39)
    if (this.currentMap === 0 && col === 10 && row === 39) {
      this.teleport(1, 12, 12, 'merchant', 'up');
    }
    // Map 1 -> Map 0 (Merchant shop exit at 12, 13)
    else if (this.currentMap === 1 && col === 12 && row === 13) {
      this.teleport(0, 10, 40, 'theme', 'down');
    }
    // Map 0 -> Map 2 (Dungeon B1 entrance stairs at 12, 9)
    else if (this.currentMap === 0 && col === 12 && row === 9) {
      this.teleport(2, 9, 40, 'theme', 'up');
    }
    // Map 2 -> Map 0 (Dungeon B1 exit stairs at 9, 41)
    else if (this.currentMap === 2 && col === 9 && row === 41) {
      this.teleport(0, 12, 10, 'theme', 'down');
    }
    // Map 2 -> Map 3 (Dungeon B2 stairs at 8, 7)
    else if (this.currentMap === 2 && col === 8 && row === 7) {
      this.teleport(3, 26, 40, 'theme', 'up');
    }
    // Map 3 -> Map 2 (Dungeon B2 return stairs at 26, 41)
    else if (this.currentMap === 3 && col === 26 && row === 41) {
      this.teleport(2, 8, 8, 'theme', 'down');
    }
    // Healing Pool on Map 0 at (23, 12)
    else if (this.currentMap === 0 && col === 23 && row === 12 && (this.player.life < this.player.maxLife || this.player.mana < this.player.maxMana)) {
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
          sounds.playSE('coin');
          this.addDamageNumber(obj.worldX + 24, obj.worldY - 10, 'Obtained Key!', '#fbbf24');
          this.objects.splice(i, 1);
          this.onStateChange();
        } else if (obj.type === 'axe' || obj.type === 'lantern' || obj.type === 'tent') {
          this.player.inventory.push(createItem(obj.type, 1));
          if (obj.type === 'lantern') this.player.hasLantern = true;
          sounds.playSE('powerup');
          this.dialogueSpeaker = 'Item Discovered';
          this.dialogueText = `You obtained the [${obj.name}]!\nCheck your inventory (C key) to inspect or equip it.`;
          this.gameState = GameState.DIALOGUE;
          this.objects.splice(i, 1);
          this.onStateChange();
        } else if (obj.type === 'blue_heart') {
          // The Ultimate Victory!
          this.player.inventory.push(createItem('blue_heart'));
          this.gameState = GameState.VICTORY;
          sounds.stopMusic();
          sounds.playSE('fanfare');
          this.onStateChange();
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
          if (!this.checkTileCollision(rockNextX, rockNextY, npc.solidArea)) {
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
