import { GameEngine, TILE_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT, MAX_WORLD_COL, MAX_WORLD_ROW } from './engine';
import { assets } from './assets';
import { TILE_DATA } from './maps';

export class GameRenderer {
  render(ctx: CanvasRenderingContext2D, game: GameEngine): void {
    // Clear screen
    ctx.fillStyle = '#0a0a0c';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    if (!game.maps[game.currentMap]) return;

    const player = game.player;
    const cameraX = player.worldX - player.screenX;
    const cameraY = player.worldY - player.screenY;

    // 1. Draw World Tiles
    const startCol = Math.max(0, Math.floor(cameraX / TILE_SIZE));
    const endCol = Math.min(MAX_WORLD_COL - 1, Math.ceil((cameraX + SCREEN_WIDTH) / TILE_SIZE));
    const startRow = Math.max(0, Math.floor(cameraY / TILE_SIZE));
    const endRow = Math.min(MAX_WORLD_ROW - 1, Math.ceil((cameraY + SCREEN_HEIGHT) / TILE_SIZE));

    const map = game.maps[game.currentMap];

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = map[r]?.[c];
        if (tileId !== undefined) {
          const tileInfo = TILE_DATA[tileId];
          if (tileInfo) {
            const tileImg = assets.get(`/res/tiles/${tileInfo.fileName}`);
            const screenX = c * TILE_SIZE - cameraX;
            const screenY = r * TILE_SIZE - cameraY;

            if (tileImg) {
              ctx.drawImage(tileImg, screenX, screenY, TILE_SIZE, TILE_SIZE);
            } else {
              ctx.fillStyle = tileInfo.collision ? '#222' : '#3d7e3d';
              ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
            }
          }
        }
      }
    }

    // 2. Draw Interactive Tiles (Metal plates, dry trees, destructible walls)
    for (const it of game.interactiveTiles) {
      if (it.map !== game.currentMap) continue;
      const screenX = it.worldX - cameraX;
      const screenY = it.worldY - cameraY;
      if (screenX + TILE_SIZE < 0 || screenX > SCREEN_WIDTH || screenY + TILE_SIZE < 0 || screenY > SCREEN_HEIGHT) continue;

      const img = assets.get(it.image);
      if (img) {
        ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // 3. Draw Game Objects (Chests, Keys, Doors, Coins, Relics)
    for (const obj of game.objects) {
      if (obj.map !== game.currentMap || obj.destroyed) continue;
      const screenX = obj.worldX - cameraX;
      const screenY = obj.worldY - cameraY;
      if (screenX + TILE_SIZE < 0 || screenX > SCREEN_WIDTH || screenY + TILE_SIZE < 0 || screenY > SCREEN_HEIGHT) continue;

      const img = assets.get(obj.image);
      if (img) {
        ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // 4. Draw NPCs & Rocks
    for (const npc of game.npcs) {
      if (npc.map !== game.currentMap) continue;
      const screenX = npc.worldX - cameraX;
      const screenY = npc.worldY - cameraY;
      if (screenX + TILE_SIZE < 0 || screenX > SCREEN_WIDTH || screenY + TILE_SIZE < 0 || screenY > SCREEN_HEIGHT) continue;

      let spriteSrc = npc.sprite;
      if (npc.name === 'Old Man') {
        spriteSrc = `/res/npc/oldman_${npc.direction}_1.png`;
      }
      const img = assets.get(spriteSrc) || assets.get(npc.sprite);
      if (img) {
        ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // 5. Draw Monsters
    for (const m of game.monsters) {
      if (m.map !== game.currentMap || m.dead) continue;
      const width = m.width || TILE_SIZE;
      const height = m.height || TILE_SIZE;
      const screenX = m.worldX - cameraX;
      const screenY = m.worldY - cameraY;
      if (screenX + width < 0 || screenX > SCREEN_WIDTH || screenY + height < 0 || screenY > SCREEN_HEIGHT) continue;

      // Invincible blink
      if (m.invincibleTimer > 0 && Math.floor(m.invincibleTimer / 3) % 2 === 0) {
        continue;
      }

      let spriteSrc = '';
      if (m.isBoss) {
        const phase = m.inRage ? 'phase2_' : '';
        spriteSrc = `/res/monster/skeletonlord_${phase}${m.direction}_${m.animFrame}.png`;
      } else if (m.name === 'Green Slime') {
        spriteSrc = `/res/monster/greenslime_down_${m.animFrame}.png`;
      } else if (m.name === 'Red Slime') {
        spriteSrc = `/res/monster/redslime_down_${m.animFrame}.png`;
      } else if (m.name === 'Cave Bat') {
        spriteSrc = `/res/monster/bat_down_${m.animFrame}.png`;
      } else if (m.name === 'Orc Warrior') {
        spriteSrc = `/res/monster/orc_${m.direction}_${m.animFrame}.png`;
      }

      const img = assets.get(spriteSrc);
      if (img) {
        ctx.drawImage(img, screenX, screenY, width, height);
      }

      // Draw Monster HP Bar
      if (m.life < m.maxLife) {
        const hpBarW = width;
        const hpBarH = 5;
        const hpPercent = Math.max(0, m.life / m.maxLife);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(screenX, screenY - 8, hpBarW, hpBarH);
        ctx.fillStyle = m.isBoss ? '#ef4444' : '#22c55e';
        ctx.fillRect(screenX, screenY - 8, hpBarW * hpPercent, hpBarH);
      }
    }

    // 6. Draw Player
    if (player.invincibleTimer === 0 || Math.floor(player.invincibleTimer / 4) % 2 === 0) {
      let playerSprite = '';
      let drawW = TILE_SIZE;
      let drawH = TILE_SIZE;
      let drawOffX = 0;
      let drawOffY = 0;

      if (player.guarding) {
        playerSprite = `/res/player/boy_guard_${player.direction}.png`;
      } else if (player.attacking) {
        const weaponType = player.currentWeapon?.id === 'axe' ? 'axe' : player.currentWeapon?.id === 'pickaxe' ? 'pick' : 'attack';
        const attackFrame = player.attackTimer < (player.currentWeapon?.motion1 || 10) ? 1 : 2;
        playerSprite = `/res/player/boy_${weaponType}_${player.direction}_${attackFrame}.png`;

        if (player.direction === 'up') {
          drawH = TILE_SIZE * 2;
          drawOffY = -TILE_SIZE;
        } else if (player.direction === 'down') {
          drawH = TILE_SIZE * 2;
        } else if (player.direction === 'left') {
          drawW = TILE_SIZE * 2;
          drawOffX = -TILE_SIZE;
        } else if (player.direction === 'right') {
          drawW = TILE_SIZE * 2;
        }
      } else {
        playerSprite = `/res/player/boy_${player.direction}_${player.animFrame}.png`;
      }

      const img = assets.get(playerSprite);
      if (img) {
        ctx.drawImage(img, player.screenX + drawOffX, player.screenY + drawOffY, drawW, drawH);
      }
    }

    // 7. Draw Projectiles
    for (const p of game.projectiles) {
      const screenX = p.worldX - cameraX;
      const screenY = p.worldY - cameraY;
      const img = assets.get(p.sprite);
      if (img) {
        ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
      }
    }

    // 8. Draw Particles
    for (const pt of game.particles) {
      const screenX = pt.x - cameraX;
      const screenY = pt.y - cameraY;
      ctx.fillStyle = pt.color;
      ctx.fillRect(screenX, screenY, pt.size, pt.size);
    }

    // 9. Draw Environment Lighting
    // If in Dungeon (Map 2 or 3)
    if (game.currentMap === 2 || game.currentMap === 3) {
      ctx.save();
      const lightRadius = game.player.hasLantern ? 320 : 160;
      const pCenterX = player.screenX + TILE_SIZE / 2;
      const pCenterY = player.screenY + TILE_SIZE / 2;

      const grad = ctx.createRadialGradient(pCenterX, pCenterY, lightRadius * 0.2, pCenterX, pCenterY, lightRadius);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
      grad.addColorStop(0.7, 'rgba(10, 10, 15, 0.7)');
      grad.addColorStop(1, 'rgba(5, 5, 10, 0.98)');

      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      ctx.restore();
    } else if (game.currentMap === 0) {
      // Outside Day/Night color overlay
      if (game.dayState === 'dusk') {
        ctx.fillStyle = 'rgba(180, 80, 20, 0.15)';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      } else if (game.dayState === 'night') {
        ctx.fillStyle = 'rgba(10, 15, 40, 0.45)';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      } else if (game.dayState === 'dawn') {
        ctx.fillStyle = 'rgba(255, 180, 80, 0.1)';
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }
    }

    // 10. Draw Damage Numbers & Notifications
    ctx.save();
    ctx.font = 'bold 20px "MaruMonica", monospace';
    ctx.textAlign = 'center';
    for (const dn of game.damageNumbers) {
      const screenX = dn.x - cameraX;
      const screenY = dn.y - cameraY;
      ctx.fillStyle = '#000';
      ctx.fillText(dn.text, screenX + 1, screenY + 1);
      ctx.fillStyle = dn.color;
      ctx.fillText(dn.text, screenX, screenY);
    }
    ctx.restore();

    // 11. Draw Minimap if active
    if (game.miniMapOn) {
      this.drawMiniMap(ctx, game);
    }

    // 12. Draw Smooth Map Transition Fade Screen
    if (game.transitionAlpha > 0) {
      ctx.fillStyle = `rgba(0, 0, 0, ${game.transitionAlpha})`;
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }
  }

  drawMiniMap(ctx: CanvasRenderingContext2D, game: GameEngine) {
    const size = 120;
    const mapX = SCREEN_WIDTH - size - 20;
    const mapY = 20;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.fillRect(mapX, mapY, size, size);
    ctx.strokeRect(mapX, mapY, size, size);

    const map = game.maps[game.currentMap];
    if (map) {
      const scale = size / MAX_WORLD_COL;
      for (let r = 0; r < MAX_WORLD_ROW; r += 2) {
        for (let c = 0; c < MAX_WORLD_COL; c += 2) {
          const tId = map[r]?.[c];
          if (tId !== undefined) {
            const isSolid = TILE_DATA[tId]?.collision;
            ctx.fillStyle = isSolid ? '#475569' : '#15803d';
            ctx.fillRect(mapX + c * scale, mapY + r * scale, scale * 2, scale * 2);
          }
        }
      }
    }

    // Player blip
    const pCol = (game.player.worldX / TILE_SIZE) * (size / MAX_WORLD_COL);
    const pRow = (game.player.worldY / TILE_SIZE) * (size / MAX_WORLD_ROW);
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(mapX + pCol, mapY + pRow, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}

export const renderer = new GameRenderer();
