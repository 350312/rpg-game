import { CAMPUS_PROP_SPRITES } from './assets';

export interface TileInfo {
  id: number;
  fileName: string;
  collision: boolean;
  customUrl?: string;
  baseTileUrl?: string;
}

// 38 base tiles + extended BUP Library & Monpura Island tiles (38..69)
export const TILE_DATA: TileInfo[] = [
  { id: 0, fileName: '000.png', collision: false },
  { id: 1, fileName: '001.png', collision: false },
  { id: 2, fileName: '002.png', collision: false },
  { id: 3, fileName: '003.png', collision: false },
  { id: 4, fileName: '004.png', collision: false },
  { id: 5, fileName: '005.png', collision: false },
  { id: 6, fileName: '006.png', collision: false },
  { id: 7, fileName: '007.png', collision: false },
  { id: 8, fileName: '008.png', collision: false },
  { id: 9, fileName: '009.png', collision: false },
  { id: 10, fileName: '010.png', collision: false },
  { id: 11, fileName: '011.png', collision: false },
  { id: 12, fileName: '012.png', collision: false },
  { id: 13, fileName: '013.png', collision: false },
  { id: 14, fileName: '014.png', collision: false },
  { id: 15, fileName: '015.png', collision: false },
  { id: 16, fileName: '016.png', collision: true },
  { id: 17, fileName: '017.png', collision: false },
  { id: 18, fileName: '018.png', collision: true },
  { id: 19, fileName: '019.png', collision: true },
  { id: 20, fileName: '020.png', collision: true },
  { id: 21, fileName: '021.png', collision: true },
  { id: 22, fileName: '022.png', collision: true },
  { id: 23, fileName: '023.png', collision: true },
  { id: 24, fileName: '024.png', collision: true },
  { id: 25, fileName: '025.png', collision: true },
  { id: 26, fileName: '026.png', collision: true },
  { id: 27, fileName: '027.png', collision: true },
  { id: 28, fileName: '028.png', collision: true },
  { id: 29, fileName: '029.png', collision: true },
  { id: 30, fileName: '030.png', collision: true },
  { id: 31, fileName: '031.png', collision: true },
  { id: 32, fileName: '032.png', collision: true },
  { id: 33, fileName: '033.png', collision: false },
  { id: 34, fileName: '034.png', collision: false },
  { id: 35, fileName: '035.png', collision: true },
  { id: 36, fileName: '036.png', collision: false },
  { id: 37, fileName: '037.png', collision: false },

  // Extended Tiles (38+) for BUP Central Library & Monpura Island
  { id: 38, fileName: 'floor_wood', collision: false, customUrl: CAMPUS_PROP_SPRITES.floor_wood },
  { id: 39, fileName: 'rug_red', collision: false, customUrl: CAMPUS_PROP_SPRITES.rug_red },
  { id: 40, fileName: 'wall_beige', collision: true, customUrl: CAMPUS_PROP_SPRITES.wall_beige },
  { id: 41, fileName: 'wall_red', collision: true, customUrl: CAMPUS_PROP_SPRITES.wall_red },
  { id: 42, fileName: 'wall_blue', collision: true, customUrl: CAMPUS_PROP_SPRITES.wall_blue },
  { id: 43, fileName: 'wall_gray', collision: true, customUrl: CAMPUS_PROP_SPRITES.wall_gray },
  { id: 44, fileName: 'bookshelf_1', collision: true, customUrl: CAMPUS_PROP_SPRITES.bookshelf_1 },
  { id: 45, fileName: 'bookshelf_2', collision: true, customUrl: CAMPUS_PROP_SPRITES.bookshelf_2 },
  { id: 46, fileName: 'bookshelf_3', collision: true, customUrl: CAMPUS_PROP_SPRITES.bookshelf_3 },
  { id: 47, fileName: 'bookshelf_4', collision: true, customUrl: CAMPUS_PROP_SPRITES.bookshelf_4 },
  { id: 48, fileName: 'fireplace', collision: true, customUrl: CAMPUS_PROP_SPRITES.fireplace },
  { id: 49, fileName: 'floor_stone_light', collision: false, customUrl: CAMPUS_PROP_SPRITES.floor_stone_light },
  { id: 50, fileName: 'floor_stone_dark', collision: false, customUrl: CAMPUS_PROP_SPRITES.floor_stone_dark },
  { id: 51, fileName: 'grass_bright', collision: false, customUrl: CAMPUS_PROP_SPRITES.grass_bright },
  { id: 52, fileName: 'grass_deep', collision: false, customUrl: CAMPUS_PROP_SPRITES.grass_deep },
  { id: 53, fileName: 'grass_flower', collision: false, customUrl: CAMPUS_PROP_SPRITES.grass_flower },
  { id: 54, fileName: 'dirt_light', collision: false, customUrl: CAMPUS_PROP_SPRITES.dirt_light },
  { id: 55, fileName: 'dirt_dark', collision: false, customUrl: CAMPUS_PROP_SPRITES.dirt_dark },
  { id: 56, fileName: 'stepping_stones', collision: false, customUrl: CAMPUS_PROP_SPRITES.stepping_stones },
  { id: 57, fileName: 'flowers_white', collision: false, customUrl: CAMPUS_PROP_SPRITES.flowers_white },
  { id: 58, fileName: 'flowers_orange', collision: false, customUrl: CAMPUS_PROP_SPRITES.flowers_orange },
  { id: 59, fileName: 'tall_grass', collision: false, customUrl: CAMPUS_PROP_SPRITES.tall_grass },
  { id: 60, fileName: 'fern_tile', collision: false, customUrl: CAMPUS_PROP_SPRITES.fern_tile },
  { id: 61, fileName: 'bamboo_stalks', collision: true, customUrl: CAMPUS_PROP_SPRITES.bamboo_stalks },
  { id: 62, fileName: 'bamboo_fence', collision: true, customUrl: CAMPUS_PROP_SPRITES.bamboo_fence },
  { id: 63, fileName: 'fence_h', collision: true, customUrl: CAMPUS_PROP_SPRITES.fence_h },
  { id: 64, fileName: 'fence_v', collision: true, customUrl: CAMPUS_PROP_SPRITES.fence_v },
  { id: 65, fileName: 'crop_cabbage', collision: false, customUrl: CAMPUS_PROP_SPRITES.crop_cabbage },
  { id: 66, fileName: 'crop_carrot', collision: false, customUrl: CAMPUS_PROP_SPRITES.crop_carrot },
  { id: 67, fileName: 'bush_berry_tile', collision: true, customUrl: CAMPUS_PROP_SPRITES.bush_berry_tile },
  { id: 68, fileName: 'portal_blue', collision: false, customUrl: CAMPUS_PROP_SPRITES.portal_blue },
  { id: 69, fileName: 'door_wood_open', collision: false, customUrl: CAMPUS_PROP_SPRITES.door_wood_open },
];

export async function loadMapGrid(url: string): Promise<number[][]> {
  const resp = await fetch(url);
  const text = await resp.text();
  const lines = text.trim().split('\n');
  const grid: number[][] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const cols = trimmed.split(/\s+/).map((n) => parseInt(n, 10));
    grid.push(cols);
  }
  return grid;
}

export const MAP_CONFIGS = [
  { id: 0, name: 'BUP Campus', url: '/res/maps/worldmap.txt', area: 'outside' },
  { id: 1, name: 'BUP Union Café', url: '/res/maps/indoor01.txt', area: 'indoor' },
  { id: 2, name: 'Sunken Ruins (B1)', url: '/res/maps/dungeon01.txt', area: 'dungeon' },
  { id: 3, name: 'Sanctum of Monpura (B2)', url: '/res/maps/dungeon02.txt', area: 'dungeon' },
  { id: 4, name: 'BUP Central Library', url: '/res/maps/library.txt', area: 'indoor' },
  { id: 5, name: 'Isle of Monpura', url: '/res/maps/monpura.txt', area: 'outside' },
];
