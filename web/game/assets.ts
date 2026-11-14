import { Direction } from './types';

export const HERO_SPRITES: Record<Direction, [string, string, string, string]> = {
  down: [
    '/assets/aistudio/down_1_1e1aee9f.png',
    '/assets/aistudio/down_2_aab17a3b.png',
    '/assets/aistudio/down_3_a7d05b6e.png',
    '/assets/aistudio/down_4_31f89d81.png',
  ],
  left: [
    '/assets/aistudio/left_1_80862444.png',
    '/assets/aistudio/left_2_c64e2341.png',
    '/assets/aistudio/left_3_9980ea46.png',
    '/assets/aistudio/left_4_c64e2341.png',
  ],
  right: [
    '/assets/aistudio/right_1_c8194cd9.png',
    '/assets/aistudio/right_2_a15bf222.png',
    '/assets/aistudio/right_3_e02724ce.png',
    '/assets/aistudio/right_4_a15bf222.png',
  ],
  up: [
    '/assets/aistudio/up_1_db23d3b8.png',
    '/assets/aistudio/up_2_c715d114.png',
    '/assets/aistudio/up_3_7c1abc2c.png',
    '/assets/aistudio/up_4_c715d114.png',
  ],
};

export const OLDMAN_SPRITES: Record<Direction, [string, string, string, string]> = {
  down: [
    '/assets/aistudio/down_1_4b409c19.png',
    '/assets/aistudio/down_2_c43b4512.png',
    '/assets/aistudio/down_3_1b71cb4c.png',
    '/assets/aistudio/down_4_4b91bb0e.png',
  ],
  left: [
    '/assets/aistudio/left_1_06975b4d.png',
    '/assets/aistudio/left_2_11142926.png',
    '/assets/aistudio/left_3_1353646f.png',
    '/assets/aistudio/left_4_9d1e52b7.png',
  ],
  right: [
    '/assets/aistudio/right_1_6ed52b7d.png',
    '/assets/aistudio/right_2_8be5fcc6.png',
    '/assets/aistudio/right_3_ad898cbd.png',
    '/assets/aistudio/right_4_83f560a2.png',
  ],
  up: [
    '/assets/aistudio/up_1_314188fc.png',
    '/assets/aistudio/up_2_b7ccb3c8.png',
    '/assets/aistudio/up_3_fbac40f2.png',
    '/assets/aistudio/up_4_d61d6ac3.png',
  ],
};

// Senior BUP Student / Island Guide (Silver hair, green shirt)
export const SENIOR_STUDENT_SPRITES: Record<Direction, [string, string, string, string]> = {
  down: [
    '/assets/aistudio/down_1_f16d52e6.png',
    '/assets/aistudio/down_2_5edcfa6d.png',
    '/assets/aistudio/down_3_af2a26c4.png',
    '/assets/aistudio/down_4_74b44f17.png',
  ],
  left: [
    '/assets/aistudio/left_1_46a004b4.png',
    '/assets/aistudio/left_2_d3d8b631.png',
    '/assets/aistudio/left_3_3110dc12.png',
    '/assets/aistudio/left_4_48e0271c.png',
  ],
  right: [
    '/assets/aistudio/right_1_65294bb1.png',
    '/assets/aistudio/right_2_dca99cf3.png',
    '/assets/aistudio/right_3_bd3d0639.png',
    '/assets/aistudio/right_4_ac4f94f2.png',
  ],
  up: [
    '/assets/aistudio/up_1_1f10c921.png',
    '/assets/aistudio/up_2_34dd1032.png',
    '/assets/aistudio/up_3_d7658ad3.png',
    '/assets/aistudio/up_4_29b5093d.png',
  ],
};

// Campus Student / Explorer Peer (Brown hair, red shirt)
export const FRIEND_STUDENT_SPRITES: Record<Direction, [string, string, string, string]> = {
  down: [
    '/assets/aistudio/down_1_fad8fdad.png',
    '/assets/aistudio/down_2_d0b12b28.png',
    '/assets/aistudio/down_3_de6a1ccd.png',
    '/assets/aistudio/down_4_f00a6b32.png',
  ],
  left: [
    '/assets/aistudio/left_1_c6d89213.png',
    '/assets/aistudio/left_2_19843583.png',
    '/assets/aistudio/left_3_ecb42a01.png',
    '/assets/aistudio/left_4_247e072b.png',
  ],
  right: [
    '/assets/aistudio/right_1_8d7b8243.png',
    '/assets/aistudio/right_2_b2568cd4.png',
    '/assets/aistudio/right_3_6aca1aee.png',
    '/assets/aistudio/right_4_136574d4.png',
  ],
  up: [
    '/assets/aistudio/up_1_a022bf21.png',
    '/assets/aistudio/up_2_fed8ea57.png',
    '/assets/aistudio/up_3_8a441c74.png',
    '/assets/aistudio/up_4_058f1a3a.png',
  ],
};

export const FLORA_SPRITES = {
  tree_mango: '/assets/aistudio/tree_mango_43a936b8.png',
  tree_banana: '/assets/aistudio/tree_banana_c1da8bbd.png',
  tree_cherry: '/assets/aistudio/tree_cherry_57837113.png',
  tree_oak: '/assets/aistudio/tree_oak_7884d13d.png',
  tree_palm: '/assets/aistudio/tree_palm_a888e7e8.png',
  tree_pine: '/assets/aistudio/tree_pine_280e1a99.png',
  tree_autumn: '/assets/aistudio/tree_autumn_e2c31163.png',
  tree_dead: '/assets/aistudio/tree_dead_24589a4b.png',
  bush_flower: '/assets/aistudio/bush_flower_9c7e5031.png',
  bush_berry: '/assets/aistudio/bush_berry_2e044da5.png',
  bush_green: '/assets/aistudio/bush_green_0e7f1268.png',
  bush_hedge: '/assets/aistudio/bush_hedge_3c045531.png',
  bush_dry: '/assets/aistudio/bush_dry_f50bf97f.png',
  plant_bamboo: '/assets/aistudio/plant_bamboo_838ff189.png',
  plant_fern: '/assets/aistudio/plant_fern_f50b627a.png',
  plant_grass: '/assets/aistudio/plant_grass_9777ca78.png',
} as const;

export const CAMPUS_PROP_SPRITES = {
  // Books
  book_blue: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.33__1__72cd4c77.jpeg',
  book_brown: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.33__2__878509a6.jpeg',
  book_monpura: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.33_413e05b2.jpeg',
  book_purple: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.34_00dcbeb3.jpeg',
  book_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.34__1__c3afdb58.jpeg',
  book_red: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.35_b227a59d.jpeg',
  // Bookshelves
  bookshelf_empty: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.44_c1b33ffb.jpeg',
  bookshelf_1: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.45__1__b362f56e.jpeg',
  bookshelf_2: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.45__2__f9086f02.jpeg',
  bookshelf_3: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.45_e5d4228c.jpeg',
  bookshelf_4: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.46_57361c7f.jpeg',
  // Walls
  wall_beige: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.59__1__502896e4.jpeg',
  wall_gray: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.59__2__5a0db270.jpeg',
  wall_dark: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.59_2d2c18bc.jpeg',
  wall_red: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.20.59__3__4e0f01cc.jpeg',
  wall_smooth: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.00__1__662cfb97.jpeg',
  wall_blue: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.00_8a9cd840.jpeg',
  // Furniture & Decor
  chair_right: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.14_fa3e465c.jpeg',
  stool: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.15__1__d207c6c4.jpeg',
  armchair_red: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.15_e4c3632f.jpeg',
  chair_back: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.16__1__7f81edc9.jpeg',
  chair_front: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.16_49ab6a68.jpeg',
  chair_left: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.17_b11f54a3.jpeg',
  // Chests & Doors
  chest_silver_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.31_46c48a88.jpeg',
  chest_purple_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.32__1__e54fb1c9.jpeg',
  chest_purple_closed: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.32__2__a74c6c5a.jpeg',
  chest_brown_closed: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.32_ed5ab293.jpeg',
  chest_brown_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.33__1__9b7abdc2.jpeg',
  chest_gold_closed: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.33_d5a143c6.jpeg',
  chest_gold_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.34__1__192738e7.jpeg',
  chest_silver_closed: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.34_410998da.jpeg',
  door_wood_locked: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.52__1__23df1575.jpeg',
  door_wood_closed: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.52__2__c7e3acf0.jpeg',
  door_wood_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.52_33d834ef.jpeg',
  door_iron_closed: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.53__1__168011ab.jpeg',
  door_iron_locked: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.53_8f1313aa.jpeg',
  door_iron_open: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.21.54_2f32832f.jpeg',
  // Floors & Ground
  floor_marble: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.11_da69c823.jpeg',
  floor_stone_light: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.12_042d8344.jpeg',
  dirt_dark: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.12__1__4ffe859f.jpeg',
  dirt_light: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.13__1__4bd1d3da.jpeg',
  floor_stone_dark: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.13__2__3effcd18.jpeg',
  grass_bright: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.13_9f305f88.jpeg',
  grass_deep: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.14__1__927dad7f.jpeg',
  grass_flower: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.14_1b564e53.jpeg',
  // Interior Props
  fireplace: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.31__1__7c446d51.jpeg',
  floor_lamp: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.31_e1c6d032.jpeg',
  rug_red: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.32__1__103bbed4.jpeg',
  portal_blue: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.32__2__a23d379f.jpeg',
  sofa_red: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.32_7d3fe784.jpeg',
  vase_blue: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.33__1__2a358af6.jpeg',
  wardrobe: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.33_dd89064d.jpeg',
  bucket: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.34__1__5c9a3787.jpeg',
  candle: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.34_8191fa5d.jpeg',
  desk: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.35__1__4d86db92.jpeg',
  barrel: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.35_1a0a5979.jpeg',
  crate: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.35__2__58224619.jpeg',
  bed_red: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.36__1__fadc3c99.jpeg',
  bed_blue: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.36_63fc4fbc.jpeg',
  // Island & Nature Tiles
  stepping_stones: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.55_af0b4819.jpeg',
  floor_wood: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.56__1__fb3d451a.jpeg',
  bamboo_stalks: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.56__2__59194914.jpeg',
  bamboo_fence: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.56_c0a265ce.jpeg',
  tall_grass: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.57__1__5d80ae81.jpeg',
  flowers_white: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.57__2__4f417399.jpeg',
  fern_tile: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.57_453a55c7.jpeg',
  flowers_orange: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.22.58_13387f49.jpeg',
  crop_cabbage: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.23.01__1__343749b3.jpeg',
  fence_h: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.23.01_e42d8f49.jpeg',
  fence_v: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.23.02__1__6334d5f4.jpeg',
  crop_carrot: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.23.02_bc6cc4ea.jpeg',
  bush_berry_tile: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.23.03_859591b9.jpeg',
  blue_heart_relic: '/assets/aistudio/WhatsApp_Image_2026-11-14_at_03.23.09__1__1cb9fbfb.jpeg',
} as const;

class AssetCache {
  private cache: Map<string, HTMLImageElement> = new Map();
  private transparentCache: Map<string, HTMLCanvasElement> = new Map();
  private loadedCount = 0;
  private totalCount = 0;

  load(src: string): HTMLImageElement {
    if (this.cache.has(src)) {
      return this.cache.get(src)!;
    }
    const img = new Image();
    img.src = src;
    this.cache.set(src, img);
    return img;
  }

  get(src: string): HTMLImageElement | null {
    const img = this.cache.get(src);
    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }
    return null;
  }

  /**
   * Returns a cached offscreen canvas with outer near-black JPEG background removed
   * via edge flood-fill, preserving dark interior outlines.
   */
  getTransparent(src: string): HTMLCanvasElement | HTMLImageElement | null {
    if (this.transparentCache.has(src)) {
      return this.transparentCache.get(src)!;
    }
    const img = this.get(src);
    if (!img) return null;

    if (!src.endsWith('.jpeg') && !src.endsWith('.jpg')) {
      return img;
    }

    try {
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      const offscreen = document.createElement('canvas');
      offscreen.width = w;
      offscreen.height = h;
      const octx = offscreen.getContext('2d');
      if (!octx) return img;

      octx.drawImage(img, 0, 0);
      const imgData = octx.getImageData(0, 0, w, h);
      const data = imgData.data;

      const visited = new Uint8Array(w * h);
      const queue: number[] = [];

      const isNearBlack = (idx: number) => {
        const p = idx * 4;
        return data[p] < 28 && data[p + 1] < 28 && data[p + 2] < 28;
      };

      // Seed flood-fill from all border pixels that are near-black
      for (let x = 0; x < w; x++) {
        const topIdx = x;
        const botIdx = (h - 1) * w + x;
        if (isNearBlack(topIdx) && !visited[topIdx]) {
          visited[topIdx] = 1;
          queue.push(topIdx);
        }
        if (isNearBlack(botIdx) && !visited[botIdx]) {
          visited[botIdx] = 1;
          queue.push(botIdx);
        }
      }
      for (let y = 0; y < h; y++) {
        const leftIdx = y * w;
        const rightIdx = y * w + (w - 1);
        if (isNearBlack(leftIdx) && !visited[leftIdx]) {
          visited[leftIdx] = 1;
          queue.push(leftIdx);
        }
        if (isNearBlack(rightIdx) && !visited[rightIdx]) {
          visited[rightIdx] = 1;
          queue.push(rightIdx);
        }
      }

      let head = 0;
      while (head < queue.length) {
        const curr = queue[head++];
        data[curr * 4 + 3] = 0; // transparent

        const cx = curr % w;
        const cy = (curr - cx) / w;

        const neighbors = [
          cx > 0 ? curr - 1 : -1,
          cx < w - 1 ? curr + 1 : -1,
          cy > 0 ? curr - w : -1,
          cy < h - 1 ? curr + w : -1,
        ];

        for (const n of neighbors) {
          if (n !== -1 && !visited[n] && isNearBlack(n)) {
            visited[n] = 1;
            queue.push(n);
          }
        }
      }

      octx.putImageData(imgData, 0, 0);
      this.transparentCache.set(src, offscreen);
      return offscreen;
    } catch {
      return img;
    }
  }

  async preloadAll(): Promise<void> {
    const list: string[] = [
      // Tiles
      ...Array.from({ length: 38 }, (_, i) => `/res/tiles/${String(i).padStart(3, '0')}.png`),
      // Interactive
      '/res/tiles_interactive/drytree.png',
      '/res/tiles_interactive/trunk.png',
      '/res/tiles_interactive/destructiblewall.png',
      '/res/tiles_interactive/metalplate.png',
      // Main Character (4 directions x 4 frames)
      ...HERO_SPRITES.down,
      ...HERO_SPRITES.left,
      ...HERO_SPRITES.right,
      ...HERO_SPRITES.up,
      // NPCs (Campus Professor / Librarian + Senior Student + Friend Student + Merchant & Rock)
      ...OLDMAN_SPRITES.down,
      ...OLDMAN_SPRITES.left,
      ...OLDMAN_SPRITES.right,
      ...OLDMAN_SPRITES.up,
      ...SENIOR_STUDENT_SPRITES.down,
      ...SENIOR_STUDENT_SPRITES.left,
      ...SENIOR_STUDENT_SPRITES.right,
      ...SENIOR_STUDENT_SPRITES.up,
      ...FRIEND_STUDENT_SPRITES.down,
      ...FRIEND_STUDENT_SPRITES.left,
      ...FRIEND_STUDENT_SPRITES.right,
      ...FRIEND_STUDENT_SPRITES.up,
      '/res/npc/merchant_down_1.png',
      '/res/npc/merchant_down_2.png',
      '/res/npc/bigrock.png',
      // Flora & Props
      ...Object.values(FLORA_SPRITES),
      ...Object.values(CAMPUS_PROP_SPRITES),
      // Monsters
      '/res/monster/greenslime_down_1.png',
      '/res/monster/greenslime_down_2.png',
      '/res/monster/redslime_down_1.png',
      '/res/monster/redslime_down_2.png',
      '/res/monster/bat_down_1.png',
      '/res/monster/bat_down_2.png',
      '/res/monster/orc_up_1.png',
      '/res/monster/orc_up_2.png',
      '/res/monster/orc_down_1.png',
      '/res/monster/orc_down_2.png',
      '/res/monster/orc_left_1.png',
      '/res/monster/orc_left_2.png',
      '/res/monster/orc_right_1.png',
      '/res/monster/orc_right_2.png',
      '/res/monster/orc_attack_up_1.png',
      '/res/monster/orc_attack_up_2.png',
      '/res/monster/orc_attack_down_1.png',
      '/res/monster/orc_attack_down_2.png',
      '/res/monster/orc_attack_left_1.png',
      '/res/monster/orc_attack_left_2.png',
      '/res/monster/orc_attack_right_1.png',
      '/res/monster/orc_attack_right_2.png',
      // Boss
      '/res/monster/skeletonlord_down_1.png',
      '/res/monster/skeletonlord_down_2.png',
      '/res/monster/skeletonlord_up_1.png',
      '/res/monster/skeletonlord_up_2.png',
      '/res/monster/skeletonlord_left_1.png',
      '/res/monster/skeletonlord_left_2.png',
      '/res/monster/skeletonlord_right_1.png',
      '/res/monster/skeletonlord_right_2.png',
      '/res/monster/skeletonlord_phase2_down_1.png',
      '/res/monster/skeletonlord_phase2_down_2.png',
      '/res/monster/skeletonlord_phase2_up_1.png',
      '/res/monster/skeletonlord_phase2_up_2.png',
      '/res/monster/skeletonlord_phase2_left_1.png',
      '/res/monster/skeletonlord_phase2_left_2.png',
      '/res/monster/skeletonlord_phase2_right_1.png',
      '/res/monster/skeletonlord_phase2_right_2.png',
      // Objects & HUD
      '/res/objects/heart_full.png',
      '/res/objects/heart_half.png',
      '/res/objects/heart_blank.png',
      '/res/objects/manacrystal_full.png',
      '/res/objects/manacrystal_blank.png',
      '/res/objects/coin_bronze.png',
      '/res/objects/key.png',
      '/res/objects/door.png',
      '/res/objects/door_iron.png',
      '/res/objects/chest.png',
      '/res/objects/chest_opened.png',
      '/res/objects/sword_normal.png',
      '/res/objects/axe.png',
      '/res/objects/pickaxe.png',
      '/res/objects/shield_wood.png',
      '/res/objects/shield_blue.png',
      '/res/objects/potion_red.png',
      '/res/objects/lantern.png',
      '/res/objects/tent.png',
      '/res/objects/blueheart.png',
      // Projectiles
      '/res/projectile/fireball_down_1.png',
      '/res/projectile/fireball_down_2.png',
      '/res/projectile/fireball_up_1.png',
      '/res/projectile/fireball_up_2.png',
      '/res/projectile/fireball_left_1.png',
      '/res/projectile/fireball_left_2.png',
      '/res/projectile/fireball_right_1.png',
      '/res/projectile/fireball_right_2.png',
      '/res/projectile/rock_down_1.png',
    ];

    this.totalCount = list.length;
    this.loadedCount = 0;

    const promises = list.map((src) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          this.cache.set(src, img);
          this.loadedCount++;
          resolve();
        };
        img.onerror = () => {
          this.loadedCount++;
          resolve();
        };
      });
    });

    await Promise.all(promises);
  }
}

export const assets = new AssetCache();
