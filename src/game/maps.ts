export interface TileInfo {
  id: number;
  fileName: string;
  collision: boolean;
}

// 38 tiles mapping from tiledata.txt
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
  { id: 0, name: 'Island World', url: '/res/maps/worldmap.txt', area: 'outside' },
  { id: 1, name: "Merchant's Shop", url: '/res/maps/indoor01.txt', area: 'indoor' },
  { id: 2, name: 'Dungeon B1', url: '/res/maps/dungeon01.txt', area: 'dungeon' },
  { id: 3, name: 'Dungeon B2 (Boss Chamber)', url: '/res/maps/dungeon02.txt', area: 'dungeon' },
];
