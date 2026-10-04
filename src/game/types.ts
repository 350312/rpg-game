export enum GameState {
  TITLE = 0,
  PLAY = 1,
  PAUSE = 2,
  DIALOGUE = 3,
  CHARACTER = 4,
  OPTIONS = 5,
  GAME_OVER = 6,
  TRANSITION = 7,
  TRADE = 8,
  SLEEP = 9,
  MAP = 10,
  VICTORY = 11,
}

export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Item {
  id: string;
  name: string;
  type: 'weapon' | 'shield' | 'consumable' | 'tool' | 'key' | 'quest';
  icon: string;
  description: string;
  attackValue?: number;
  defenseValue?: number;
  healValue?: number;
  price: number;
  amount?: number;
  motion1?: number;
  motion2?: number;
}

export interface GameObject {
  id: string;
  name: string;
  map: number;
  worldX: number;
  worldY: number;
  image: string;
  solidArea: Rect;
  collision: boolean;
  opened?: boolean;
  loot?: Item;
  interactive?: boolean;
  destroyed?: boolean;
  type?: 'door' | 'iron_door' | 'chest' | 'key' | 'potion' | 'lantern' | 'tent' | 'axe' | 'pickaxe' | 'coin' | 'blue_heart';
}

export interface InteractiveTile {
  id: string;
  map: number;
  worldX: number;
  worldY: number;
  type: 'dry_tree' | 'destructible_wall' | 'metal_plate' | 'trunk';
  image: string;
  life: number;
  maxLife: number;
  destructible: boolean;
  requiredTool?: 'axe' | 'pickaxe';
  pressed?: boolean;
}

export interface NPC {
  id: string;
  name: string;
  map: number;
  worldX: number;
  worldY: number;
  direction: Direction;
  sprite: string;
  solidArea: Rect;
  dialogues: string[];
  dialogueIndex: number;
  isShop?: boolean;
  isPushable?: boolean;
}

export interface Monster {
  id: string;
  name: string;
  map: number;
  worldX: number;
  worldY: number;
  direction: Direction;
  speed: number;
  maxLife: number;
  life: number;
  attack: number;
  defense: number;
  exp: number;
  solidArea: Rect;
  spritePrefix: string;
  animFrame: number;
  animTimer: number;
  actionTimer: number;
  invincibleTimer: number;
  knockbackTimer: number;
  knockbackDir?: Direction;
  isBoss?: boolean;
  inRage?: boolean;
  attacking?: boolean;
  attackTimer?: number;
  width?: number;
  height?: number;
  dead?: boolean;
}

export interface Projectile {
  id: string;
  type: 'fireball' | 'rock';
  worldX: number;
  worldY: number;
  direction: Direction;
  speed: number;
  attack: number;
  life: number;
  maxLife: number;
  manaCost: number;
  sprite: string;
}

export interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
}

export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
}
