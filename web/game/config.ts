import { Direction } from './types';

/**
 * Task 1: Lives & Death/Restart Configuration
 * Tune these values to adjust player lives and restart behavior.
 */
export const LIVES_CONFIG = {
  MAX_LIVES: 3,
  INITIAL_LIVES: 3,
  ALLOW_EXTRA_LIVES: false,
  AUTO_REGEN_HP: false,
  AUTO_REVIVE: false,
  // 'level_start_then_level1': lose 1 life -> restart current level from early stage;
  // lose all 3 lives -> Game Over & restart from Level 1 (BUP Campus).
  RESTART_MODE: 'level_start_then_level1' as const,
  RESPAWN_INVINCIBILITY_FRAMES: 60,
  PENALIZE_RELOAD_ON_DEATH: true,
} as const;

export interface LevelSpawnPoint {
  mapId: number;
  levelNumber: number;
  label: string;
  col: number;
  row: number;
  direction: Direction;
  music: 'theme' | 'merchant';
}

export const LEVEL_START_SPAWNS: Record<number, LevelSpawnPoint> = {
  0: {
    mapId: 0,
    levelNumber: 1,
    label: 'Level 1: The BUP Campus',
    col: 23,
    row: 46,
    direction: 'up',
    music: 'theme',
  },
  1: {
    mapId: 1,
    levelNumber: 1,
    label: 'FMS Union Café',
    col: 12,
    row: 12,
    direction: 'up',
    music: 'merchant',
  },
  4: {
    mapId: 4,
    levelNumber: 2,
    label: 'Level 2: BUP Central Library',
    col: 24,
    row: 27,
    direction: 'up',
    music: 'theme',
  },
  5: {
    mapId: 5,
    levelNumber: 3,
    label: 'Level 3: Isle of Monpura',
    col: 24,
    row: 40,
    direction: 'up',
    music: 'theme',
  },
  2: {
    mapId: 2,
    levelNumber: 4,
    label: 'Level 4: The Sunken Ruins',
    col: 9,
    row: 40,
    direction: 'up',
    music: 'theme',
  },
  3: {
    mapId: 3,
    levelNumber: 5,
    label: 'Level 5: Sanctum of Monpura',
    col: 26,
    row: 40,
    direction: 'up',
    music: 'theme',
  },
};
