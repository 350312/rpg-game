class AssetCache {
  private cache: Map<string, HTMLImageElement> = new Map();
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

  async preloadAll(): Promise<void> {
    const list: string[] = [
      // Tiles
      ...Array.from({ length: 38 }, (_, i) => `/res/tiles/${String(i).padStart(3, '0')}.png`),
      // Interactive
      '/res/tiles_interactive/drytree.png',
      '/res/tiles_interactive/trunk.png',
      '/res/tiles_interactive/destructiblewall.png',
      '/res/tiles_interactive/metalplate.png',
      // Player
      '/res/player/boy_up_1.png',
      '/res/player/boy_up_2.png',
      '/res/player/boy_down_1.png',
      '/res/player/boy_down_2.png',
      '/res/player/boy_left_1.png',
      '/res/player/boy_left_2.png',
      '/res/player/boy_right_1.png',
      '/res/player/boy_right_2.png',
      '/res/player/boy_guard_up.png',
      '/res/player/boy_guard_down.png',
      '/res/player/boy_guard_left.png',
      '/res/player/boy_guard_right.png',
      '/res/player/boy_attack_up_1.png',
      '/res/player/boy_attack_up_2.png',
      '/res/player/boy_attack_down_1.png',
      '/res/player/boy_attack_down_2.png',
      '/res/player/boy_attack_left_1.png',
      '/res/player/boy_attack_left_2.png',
      '/res/player/boy_attack_right_1.png',
      '/res/player/boy_attack_right_2.png',
      '/res/player/boy_axe_up_1.png',
      '/res/player/boy_axe_up_2.png',
      '/res/player/boy_axe_down_1.png',
      '/res/player/boy_axe_down_2.png',
      '/res/player/boy_axe_left_1.png',
      '/res/player/boy_axe_left_2.png',
      '/res/player/boy_axe_right_1.png',
      '/res/player/boy_axe_right_2.png',
      '/res/player/boy_pick_up_1.png',
      '/res/player/boy_pick_up_2.png',
      '/res/player/boy_pick_down_1.png',
      '/res/player/boy_pick_down_2.png',
      '/res/player/boy_pick_left_1.png',
      '/res/player/boy_pick_left_2.png',
      '/res/player/boy_pick_right_1.png',
      '/res/player/boy_pick_right_2.png',
      // NPCs
      '/res/npc/oldman_up_1.png',
      '/res/npc/oldman_up_2.png',
      '/res/npc/oldman_down_1.png',
      '/res/npc/oldman_down_2.png',
      '/res/npc/oldman_left_1.png',
      '/res/npc/oldman_left_2.png',
      '/res/npc/oldman_right_1.png',
      '/res/npc/oldman_right_2.png',
      '/res/npc/merchant_down_1.png',
      '/res/npc/merchant_down_2.png',
      '/res/npc/bigrock.png',
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
