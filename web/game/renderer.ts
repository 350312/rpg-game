import { GameEngine, TILE_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT, MAX_WORLD_COL, MAX_WORLD_ROW } from './engine';
import { assets, HERO_SPRITES, OLDMAN_SPRITES, SENIOR_STUDENT_SPRITES, FRIEND_STUDENT_SPRITES, CAMPUS_PROP_SPRITES } from './assets';
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
    const isCampusOverworld = game.currentMap === 0;

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        const tileId = map[r]?.[c];
        if (tileId !== undefined) {
          const screenX = c * TILE_SIZE - cameraX;
          const screenY = r * TILE_SIZE - cameraY;

          // Custom Campus Environment Rendering for Map 0
          if (isCampusOverworld) {
            // Lake Water (Tiles 18 & 19)
            if (tileId === 18 || tileId === 19) {
              this.drawLakeWaterTile(ctx, screenX, screenY, r, c, game);
              continue;
            }
            // Floating Boardwalk / Pier Bridge (Tile 17)
            if (tileId === 17) {
              this.drawBoardwalkTile(ctx, screenX, screenY, r, c, map, game);
              continue;
            }
            // Modern Academic Glass Towers (Tile 32)
            if (tileId === 32) {
              this.drawCampusTowerTile(ctx, screenX, screenY, r, c, map, game);
              continue;
            }
            // Red Brick Amphitheater & Terraces (Tile 34)
            if (tileId === 34) {
              this.drawBrickTerraceTile(ctx, screenX, screenY, r, c, map);
              continue;
            }
          }

          const tileInfo = TILE_DATA[tileId];
          if (tileInfo) {
            if (tileInfo.customUrl) {
              const isOverlayTile =
                (tileId >= 44 && tileId <= 48) ||
                (tileId >= 57 && tileId <= 69);

              if (isOverlayTile) {
                const baseUrl =
                  tileId === 68
                    ? CAMPUS_PROP_SPRITES.floor_stone_light
                    : tileId >= 57 && tileId <= 67
                    ? CAMPUS_PROP_SPRITES.grass_bright
                    : CAMPUS_PROP_SPRITES.floor_wood;
                const baseImg = assets.get(baseUrl);
                if (baseImg) {
                  ctx.drawImage(baseImg, screenX, screenY, TILE_SIZE, TILE_SIZE);
                } else {
                  ctx.fillStyle = tileId >= 57 && tileId <= 67 ? '#2f6b3c' : '#5c3c24';
                  ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }

                // Glowing aura under portal tile (68)
                if (tileId === 68) {
                  const pulse = 0.55 + Math.sin(Date.now() * 0.005) * 0.25;
                  const pGrad = ctx.createRadialGradient(
                    screenX + 24,
                    screenY + 24,
                    4,
                    screenX + 24,
                    screenY + 24,
                    30
                  );
                  pGrad.addColorStop(0, `rgba(56, 189, 248, ${pulse})`);
                  pGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
                  ctx.fillStyle = pGrad;
                  ctx.beginPath();
                  ctx.arc(screenX + 24, screenY + 24, 30, 0, Math.PI * 2);
                  ctx.fill();
                }

                const overlayImg = assets.getTransparent(tileInfo.customUrl);
                if (overlayImg) {
                  ctx.drawImage(overlayImg, screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
              } else {
                const customImg = assets.get(tileInfo.customUrl);
                if (customImg) {
                  ctx.drawImage(customImg, screenX, screenY, TILE_SIZE, TILE_SIZE);
                } else {
                  ctx.fillStyle = tileInfo.collision ? '#334155' : '#3d7e3d';
                  ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
                }
              }
            } else {
              const tileImg = assets.get(`/res/tiles/${tileInfo.fileName}`);

              if (tileImg) {
                ctx.drawImage(tileImg, screenX, screenY, TILE_SIZE, TILE_SIZE);
              } else {
                ctx.fillStyle = tileInfo.collision ? '#222' : '#3d7e3d';
                ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);
              }
            }

            // Draw Flowerbeds along shoreline on Map 0
            if (isCampusOverworld && (tileId === 1 || tileId === 0 || tileId === 34)) {
              this.drawShorelineFlora(ctx, screenX, screenY, r, c, map);
            }
          }
        }
      }
    }

    // 1.5. Draw Campus Building Names and Third Place Pavilion Canopy (Map 0) or Monpura Landmarks (Map 5)
    if (isCampusOverworld) {
      this.drawCampusSignageAndStructures(ctx, game, cameraX, cameraY);
    } else if (game.currentMap === 5) {
      this.drawMonpuraLandmarks(ctx, game, cameraX, cameraY);
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
    const time = Date.now() * 0.003;
    for (const obj of game.objects) {
      if (obj.map !== game.currentMap || obj.destroyed) continue;
      const screenX = obj.worldX - cameraX;
      let screenY = obj.worldY - cameraY;
      if (screenX + TILE_SIZE < -60 || screenX > SCREEN_WIDTH + 60 || screenY + TILE_SIZE < -60 || screenY > SCREEN_HEIGHT + 60) continue;

      // Special display for the Hammer in Central Garden Yard
      if (obj.id === 'axe_1') {
        ctx.save();
        // Garden stone plinth shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(screenX + 24, screenY + 42, 22, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone plinth steps
        ctx.fillStyle = '#64748b';
        ctx.fillRect(screenX + 6, screenY + 34, 36, 10);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(screenX + 10, screenY + 30, 28, 5);

        // Radiant golden aura
        const auraGrad = ctx.createRadialGradient(screenX + 24, screenY + 20, 4, screenX + 24, screenY + 20, 28);
        auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
        auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.3)');
        auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(screenX + 24, screenY + 20, 28, 0, Math.PI * 2);
        ctx.fill();

        // Glowing "HAMMER" tag
        ctx.font = 'bold 12px "MaruMonica", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText('HAMMER', screenX + 24, screenY - 6);
        ctx.restore();

        // Slight float bob
        screenY += Math.sin(time * 1.5) * 4;
      } else if (obj.type === 'monpura_book' || obj.type === 'seal') {
        ctx.save();
        const isBook = obj.type === 'monpura_book';
        const auraColor = isBook
          ? 'rgba(52, 211, 153, 0.78)'
          : obj.id === 'seal_amber'
          ? 'rgba(251, 191, 36, 0.78)'
          : obj.id === 'seal_azure'
          ? 'rgba(56, 189, 248, 0.78)'
          : 'rgba(52, 211, 153, 0.78)';

        const auraGrad = ctx.createRadialGradient(screenX + 24, screenY + 22, 4, screenX + 24, screenY + 22, 30);
        auraGrad.addColorStop(0, auraColor);
        auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = auraGrad;
        ctx.beginPath();
        ctx.arc(screenX + 24, screenY + 22, 30, 0, Math.PI * 2);
        ctx.fill();

        const label = isBook
          ? 'MONPURA TALES'
          : obj.id === 'seal_emerald'
          ? 'EMERALD SEAL'
          : obj.id === 'seal_amber'
          ? 'AMBER SEAL'
          : 'AZURE SEAL';

        ctx.font = 'bold 11px "MaruMonica", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#fef08a';
        ctx.shadowColor = '#000';
        ctx.shadowBlur = 4;
        ctx.fillText(label, screenX + 24, screenY - 6);
        ctx.restore();

        screenY += Math.sin(time * 1.6 + obj.worldX) * 3;
      } else if (!obj.collision && obj.type !== 'door' && obj.type !== 'iron_door' && obj.type !== 'prop') {
        // Ground shadow for pickup items
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(screenX + 24, screenY + 38, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Floating hover
        screenY += Math.sin(time + obj.worldX) * 3;
      } else if (obj.type === 'prop' && obj.image.includes('tree_')) {
        // Soft tree ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.26)';
        ctx.beginPath();
        ctx.ellipse(screenX + 24, screenY + 44, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const img = obj.transparentBg ? assets.getTransparent(obj.image) : assets.get(obj.image);
      if (img) {
        if (obj.type === 'prop' && obj.image.includes('tree_')) {
          ctx.drawImage(img, screenX - 6, screenY - 12, 60, 60);
        } else {
          ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
        }
      }

      // Subtle [ENTER] prompt badge when near interactive book/seal/lore
      if (obj.interactive && !obj.destroyed) {
        const pCenterX = player.worldX + TILE_SIZE / 2;
        const pCenterY = player.worldY + TILE_SIZE / 2;
        const dist = Math.hypot(pCenterX - (obj.worldX + TILE_SIZE / 2), pCenterY - (obj.worldY + TILE_SIZE / 2));
        if (dist < 68) {
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#fbbf24';
          ctx.lineWidth = 1;
          ctx.fillRect(screenX - 4, screenY - 22, 56, 15);
          ctx.strokeRect(screenX - 4, screenY - 22, 56, 15);
          ctx.font = 'bold 10px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#fde047';
          ctx.fillText('ENTER', screenX + 24, screenY - 11);
          ctx.restore();
        }
      }
    }

    // 4. Draw NPCs & Rocks
    const pCenterX = player.worldX + TILE_SIZE / 2;
    const pCenterY = player.worldY + TILE_SIZE / 2;
    for (const npc of game.npcs) {
      if (npc.map !== game.currentMap) continue;
      const screenX = npc.worldX - cameraX;
      const screenY = npc.worldY - cameraY;
      if (screenX + TILE_SIZE < 0 || screenX > SCREEN_WIDTH || screenY + TILE_SIZE < 0 || screenY > SCREEN_HEIGHT) continue;

      if (!npc.isPushable) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.28)';
        ctx.beginPath();
        ctx.ellipse(screenX + 24, screenY + 43, 14, 5, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      const frameIdx = npc.moving ? Math.max(0, Math.min(3, ((npc.animFrame || 1) - 1) % 4)) : 1;
      let spriteSrc = npc.sprite;
      if (npc.spriteSet === 'oldman' || npc.name === 'Old Man' || npc.name === 'Campus Professor' || npc.id === 'oldman') {
        spriteSrc = OLDMAN_SPRITES[npc.direction][frameIdx];
      } else if (npc.spriteSet === 'senior') {
        spriteSrc = SENIOR_STUDENT_SPRITES[npc.direction][frameIdx];
      } else if (npc.spriteSet === 'friend') {
        spriteSrc = FRIEND_STUDENT_SPRITES[npc.direction][frameIdx];
      } else if (npc.spriteSet === 'merchant') {
        spriteSrc = `/res/npc/merchant_down_${(npc.animFrame || 1) % 2 === 0 ? 2 : 1}.png`;
      }

      const img = assets.get(spriteSrc) || assets.get(npc.sprite);
      if (img) {
        ctx.drawImage(img, screenX, screenY, TILE_SIZE, TILE_SIZE);
      }

      // Draw talk prompt badge when near an interactive NPC
      if (!npc.isPushable) {
        const dist = Math.hypot(pCenterX - (npc.worldX + TILE_SIZE / 2), pCenterY - (npc.worldY + TILE_SIZE / 2));
        if (dist < 68) {
          ctx.save();
          const bob = Math.sin(time * 2) * 2;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.2;
          ctx.fillRect(screenX + 4, screenY - 18 + bob, 40, 14);
          ctx.strokeRect(screenX + 4, screenY - 18 + bob, 40, 14);
          ctx.font = 'bold 9px monospace';
          ctx.textAlign = 'center';
          ctx.fillStyle = '#bae6fd';
          ctx.fillText('TALK', screenX + 24, screenY - 8 + bob);
          ctx.restore();
        }
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
      } else if (m.name.includes('Green Slime')) {
        spriteSrc = `/res/monster/greenslime_down_${m.animFrame}.png`;
      } else if (m.name.includes('Red Slime')) {
        spriteSrc = `/res/monster/redslime_down_${m.animFrame}.png`;
      } else if (m.name.includes('Bat')) {
        spriteSrc = `/res/monster/bat_down_${m.animFrame}.png`;
      } else if (m.name.includes('Orc')) {
        if (m.attacking) {
          spriteSrc = `/res/monster/orc_attack_${m.direction}_${m.animFrame}.png`;
        } else {
          spriteSrc = `/res/monster/orc_${m.direction}_${m.animFrame}.png`;
        }
      } else if (m.spritePrefix) {
        spriteSrc = `${m.spritePrefix}_${m.animFrame}.png`;
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
      // Subtle ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(player.screenX + 24, player.screenY + 43, 14, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      let frameIdx = 1; // Neutral standing (_2)
      let lungeX = 0;
      let lungeY = 0;

      if (player.attacking) {
        const motion1 = player.currentWeapon?.motion1 || 10;
        frameIdx = player.attackTimer < motion1 ? 0 : 2;
        const lunge = 5;
        if (player.direction === 'up') lungeY = -lunge;
        if (player.direction === 'down') lungeY = lunge;
        if (player.direction === 'left') lungeX = -lunge;
        if (player.direction === 'right') lungeX = lunge;
      } else if (player.guarding) {
        frameIdx = 1;
      } else if (player.moving) {
        frameIdx = Math.max(0, Math.min(3, (player.animFrame - 1) % 4));
      }

      const heroSrc = HERO_SPRITES[player.direction][frameIdx];
      const heroImg = assets.get(heroSrc);

      // Draw weapon behind character if attacking upward
      if (player.attacking && player.direction === 'up') {
        this.drawHeroWeaponSwing(ctx, game, lungeX, lungeY);
      }

      if (heroImg) {
        ctx.drawImage(heroImg, player.screenX + lungeX, player.screenY + lungeY, TILE_SIZE, TILE_SIZE);
      }

      // Draw weapon in front for down/left/right attacks
      if (player.attacking && player.direction !== 'up') {
        this.drawHeroWeaponSwing(ctx, game, lungeX, lungeY);
      }

      // Draw shield aura & equipped shield when guarding
      if (player.guarding) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.fillStyle = 'rgba(56, 189, 248, 0.18)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.screenX + 24, player.screenY + 24, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const shieldImg = assets.get(player.currentShield?.icon || '/res/objects/shield_wood.png');
        if (shieldImg) {
          let sx = player.screenX + 12;
          let sy = player.screenY + 14;
          if (player.direction === 'up') sy -= 12;
          if (player.direction === 'down') sy += 12;
          if (player.direction === 'left') sx -= 12;
          if (player.direction === 'right') sx += 12;
          ctx.drawImage(shieldImg, sx, sy, 24, 24);
        }
        ctx.restore();
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
      // Golden Hour Sunset & Campus Environment Lighting
      this.drawCampusLighting(ctx, game, cameraX, cameraY);
    } else if (game.currentMap === 4) {
      // Warm Library Reading Lamps & Glowing Book of Monpura Aura
      this.drawLibraryLighting(ctx, game, cameraX, cameraY);
    } else if (game.currentMap === 5) {
      // Mystical Tropical Glow on Isle of Monpura
      this.drawMonpuraLighting(ctx, cameraX, cameraY);
    }

    // 9.5. Draw Boss Health Banner in Sanctum of Monpura (Map 3)
    if (game.currentMap === 3) {
      const boss = game.monsters.find((m) => m.map === 3 && m.isBoss && !m.dead);
      if (boss) {
        this.drawBossHealthBanner(ctx, boss.name, boss.life, boss.maxLife, !!boss.inRage);
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
    ctx.arc(mapX + pCol, mapY + pRow, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Map 0 & Map 5 Landmarks on MiniMap
    if (game.currentMap === 0) {
      const markers = [
        { label: 'FST', col: 11, row: 4, fullName: 'FST Building', color: '#38bdf8' },
        { label: 'FASS', col: 24, row: 3, fullName: 'FASS Building', color: '#f43f5e' },
        { label: 'FBS', col: 37, row: 4, fullName: 'FBS Building', color: '#34d399' },
        { label: 'FMS', col: 10, row: 39, fullName: 'FMS Building', color: '#fbbf24' },
        { label: 'LIB', col: 40, row: 36, fullName: 'BUP Central Library', color: '#c084fc' },
        { label: 'ARN', col: 39, row: 23, fullName: 'Third Place Arena', color: '#eab308' },
      ];
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      for (const m of markers) {
        const mx = mapX + m.col * (size / MAX_WORLD_COL);
        const my = mapY + m.row * (size / MAX_WORLD_ROW);
        const collected = game.collectedLocations.has(m.fullName);
        ctx.fillStyle = collected ? '#22c55e' : m.color;
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = collected ? '#86efac' : '#e2e8f0';
        ctx.fillText(m.label, mx, my - 2);
      }
    } else if (game.currentMap === 5) {
      const markers = [
        { label: 'PORT', col: 24, row: 42, color: '#38bdf8' },
        { label: 'VILL', col: 11, row: 28, color: '#fbbf24' },
        { label: 'GRV', col: 39, row: 25, color: '#34d399' },
        { label: 'TIDE', col: 12, row: 12, color: '#60a5fa' },
        { label: 'GATE', col: 24, row: 8, color: '#f43f5e' },
      ];
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      for (const m of markers) {
        const mx = mapX + m.col * (size / MAX_WORLD_COL);
        const my = mapY + m.row * (size / MAX_WORLD_ROW);
        ctx.fillStyle = m.color;
        ctx.beginPath();
        ctx.arc(mx, my, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#e2e8f0';
        ctx.fillText(m.label, mx, my - 2);
      }
    }

    ctx.restore();
  }

  // --- Campus Environment Custom Rendering (UIU Campus Lake & Floating Boardwalk) ---

  /** Renders peaceful lake water with wave ripples and golden sunset reflections (Photo 1 & 3) */
  drawLakeWaterTile(ctx: CanvasRenderingContext2D, screenX: number, screenY: number, r: number, c: number, game: GameEngine) {
    // 1. Deep calm water base
    ctx.fillStyle = '#0c2f42';
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    // 2. Animated water ripples
    const time = Date.now() * 0.0018;
    const wave1 = Math.sin(c * 0.6 + r * 0.4 + time) * 3;
    const wave2 = Math.cos(c * 0.4 - r * 0.5 + time * 1.2) * 2;

    ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(screenX + 4, screenY + 14 + wave1);
    ctx.lineTo(screenX + 26, screenY + 14 + wave1);
    ctx.moveTo(screenX + 22, screenY + 34 + wave2);
    ctx.lineTo(screenX + 44, screenY + 34 + wave2);
    ctx.stroke();

    // 3. Golden Hour Sunset Water Shimmer Reflection Column (Photo 1)
    if (c >= 18 && c <= 30 && (game.dayState === 'dusk' || game.dayState === 'night')) {
      const sunDist = Math.abs(c - 24);
      const intensity = Math.max(0, 0.45 - sunDist * 0.06);
      if (intensity > 0) {
        ctx.fillStyle = `rgba(251, 191, 36, ${intensity})`;
        ctx.fillRect(screenX + 8 + wave1, screenY + 10, 20, 2);
        ctx.fillRect(screenX + 16 - wave2, screenY + 26, 26, 2.5);
        ctx.fillRect(screenX + 4 + wave2, screenY + 40, 18, 2);
      }
    }
  }

  /** Renders the iconic floating boardwalk bridge with white railings, terracotta pontoons, and lanterns */
  drawBoardwalkTile(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    r: number,
    c: number,
    map: number[][],
    game: GameEngine
  ) {
    // 1. Composite deck planks
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    // Horizontal plank seams
    ctx.fillStyle = '#64748b';
    ctx.fillRect(screenX, screenY + 11, TILE_SIZE, 1);
    ctx.fillRect(screenX, screenY + 23, TILE_SIZE, 1);
    ctx.fillRect(screenX, screenY + 35, TILE_SIZE, 1);
    ctx.fillRect(screenX, screenY + 47, TILE_SIZE, 1);

    // 2. Central non-slip terracotta/orange runner (matching Photo 3)
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(screenX + 15, screenY, 18, TILE_SIZE);
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(screenX + 17, screenY, 14, TILE_SIZE);

    // Subtle safety tread lines on the runner
    ctx.fillStyle = '#9a3412';
    for (let py = 3; py < 48; py += 6) {
      ctx.fillRect(screenX + 18, screenY + py, 12, 1);
    }

    // 3. Inspect adjacent tiles to draw floating pontoons and white railings bordering water
    const isWater = (tr: number, tc: number) => {
      const id = map[tr]?.[tc];
      return id === 18 || id === 19;
    };

    const topWater = isWater(r - 1, c);
    const bottomWater = isWater(r + 1, c);
    const leftWater = isWater(r, c - 1);
    const rightWater = isWater(r, c + 1);

    // --- Red/Terracotta Modular Floating Pontoons under water edge (Photos 1, 2, 3) ---
    if (topWater) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(screenX, screenY - 5, TILE_SIZE, 6);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(screenX + 2, screenY - 2, TILE_SIZE - 4, 3);
    }
    if (bottomWater) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(screenX, screenY + 47, TILE_SIZE, 6);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(screenX + 2, screenY + 49, TILE_SIZE - 4, 3);
    }
    if (leftWater) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(screenX - 5, screenY, 6, TILE_SIZE);
      ctx.fillStyle = '#991b1b';
      ctx.fillRect(screenX - 2, screenY + 2, 3, TILE_SIZE - 4);
    }
    if (rightWater) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(screenX + 47, screenY, 6, TILE_SIZE);
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(screenX + 49, screenY + 2, 3, TILE_SIZE - 4);
    }

    // --- Pure White Double Railings with vertical posts ---
    if (topWater) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX, screenY + 1, TILE_SIZE, 2);
      ctx.fillRect(screenX, screenY + 6, TILE_SIZE, 2);
      // Posts
      ctx.fillRect(screenX + 2, screenY, 3, 9);
      ctx.fillRect(screenX + 23, screenY, 3, 9);
      ctx.fillRect(screenX + 43, screenY, 3, 9);
    }
    if (bottomWater) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX, screenY + 40, TILE_SIZE, 2);
      ctx.fillRect(screenX, screenY + 45, TILE_SIZE, 2);
      // Posts
      ctx.fillRect(screenX + 2, screenY + 39, 3, 9);
      ctx.fillRect(screenX + 23, screenY + 39, 3, 9);
      ctx.fillRect(screenX + 43, screenY + 39, 3, 9);
    }
    if (leftWater) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + 1, screenY, 2, TILE_SIZE);
      ctx.fillRect(screenX + 6, screenY, 2, TILE_SIZE);
      ctx.fillRect(screenX, screenY + 2, 9, 3);
      ctx.fillRect(screenX, screenY + 23, 9, 3);
      ctx.fillRect(screenX, screenY + 43, 9, 3);
    }
    if (rightWater) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(screenX + 40, screenY, 2, TILE_SIZE);
      ctx.fillRect(screenX + 45, screenY, 2, TILE_SIZE);
      ctx.fillRect(screenX + 39, screenY + 2, 9, 3);
      ctx.fillRect(screenX + 39, screenY + 23, 9, 3);
      ctx.fillRect(screenX + 39, screenY + 43, 9, 3);
    }

    // 4. Bridge Lanterns / Lampposts (every 3 rows or at pier corners)
    const isLampTile = (r % 3 === 0) && (c === 22 || c === 24 || c === 31 || c === 25);
    if (isLampTile) {
      // Lamp base & pole
      ctx.fillStyle = '#18181b';
      const lx = screenX + (c === 22 || c === 25 ? 4 : 40);
      const ly = screenY + 8;
      ctx.fillRect(lx, ly, 4, 16);
      ctx.fillRect(lx - 1, ly - 3, 6, 4);

      // Glowing Lantern head
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(lx - 2, ly - 7, 8, 6);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(lx - 3, ly - 9, 10, 2);
    }
  }

  /** Renders Modern Academic Towers with blue glass facade and concrete columns (Photo 2 & 3) */
  drawCampusTowerTile(
    ctx: CanvasRenderingContext2D,
    screenX: number,
    screenY: number,
    r: number,
    c: number,
    map: number[][],
    game: GameEngine
  ) {
    // 1. Off-white architectural concrete structure
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    // 2. Concrete framing grid (columns & floor slabs)
    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(screenX, screenY, TILE_SIZE, 3);
    ctx.fillRect(screenX, screenY + 45, TILE_SIZE, 3);
    ctx.fillRect(screenX, screenY, 4, TILE_SIZE);
    ctx.fillRect(screenX + 44, screenY, 4, TILE_SIZE);
    ctx.fillRect(screenX + 22, screenY, 4, TILE_SIZE);

    // 3. Reflective blue glass curtain-wall windows
    const isNight = game.dayState === 'night';
    const isSunset = game.dayState === 'dusk';

    // Window bays
    const winColor = isNight
      ? (r % 2 === 0 ? '#fef08a' : '#0369a1')
      : isSunset
      ? '#0284c7'
      : '#38bdf8';

    ctx.fillStyle = winColor;
    ctx.fillRect(screenX + 6, screenY + 5, 14, 16);
    ctx.fillRect(screenX + 28, screenY + 5, 14, 16);
    ctx.fillRect(screenX + 6, screenY + 25, 14, 17);
    ctx.fillRect(screenX + 28, screenY + 25, 14, 17);

    // Window diagonal architectural sky gleam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.beginPath();
    ctx.moveTo(screenX + 8, screenY + 5);
    ctx.lineTo(screenX + 16, screenY + 5);
    ctx.lineTo(screenX + 6, screenY + 15);
    ctx.lineTo(screenX + 6, screenY + 9);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(screenX + 30, screenY + 5);
    ctx.lineTo(screenX + 38, screenY + 5);
    ctx.lineTo(screenX + 28, screenY + 15);
    ctx.lineTo(screenX + 28, screenY + 9);
    ctx.closePath();
    ctx.fill();

    // Terracotta accent horizontal trim
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(screenX + 4, screenY + 22, 40, 2);
  }

  /** Renders red brick terraces / outdoor amphitheater steps (Photo 2 & 3) */
  drawBrickTerraceTile(ctx: CanvasRenderingContext2D, screenX: number, screenY: number, r: number, c: number, map: number[][]) {
    // Red brick base
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(screenX, screenY, TILE_SIZE, TILE_SIZE);

    // Stone mortar lines & running bond brick pattern
    ctx.fillStyle = '#f5f5f4';
    for (let y = 0; y < 48; y += 8) {
      ctx.fillRect(screenX, screenY + y, TILE_SIZE, 1);
      const offset = (y % 16 === 0) ? 0 : 8;
      for (let x = offset; x < 48; x += 16) {
        ctx.fillRect(screenX + x, screenY + y, 1, 8);
      }
    }

    // Step shadow lip along south edge
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(screenX, screenY + 46, TILE_SIZE, 2);
  }

  /** Renders lush floral shrubbery and colorful flowerbeds along the lake embankment (Photo 3) */
  drawShorelineFlora(ctx: CanvasRenderingContext2D, screenX: number, screenY: number, r: number, c: number, map: number[][]) {
    // Check if neighbor is water
    const isWater = (tr: number, tc: number) => {
      const id = map[tr]?.[tc];
      return id === 18 || id === 19;
    };

    if (isWater(r + 1, c) || isWater(r - 1, c) || isWater(r, c + 1) || isWater(r, c - 1)) {
      // Flower blossoms (magenta, yellow, pink)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(screenX + 12, screenY + 38, 3, 0, Math.PI * 2);
      ctx.arc(screenX + 32, screenY + 40, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(screenX + 22, screenY + 42, 2.5, 0, Math.PI * 2);
      ctx.arc(screenX + 42, screenY + 36, 2.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(screenX + 8, screenY + 44, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  /** Renders the glorious Sunset / Golden Hour ambiance, setting sun, and bridge lantern light halos */
  drawCampusLighting(ctx: CanvasRenderingContext2D, game: GameEngine, cameraX: number, cameraY: number) {
    ctx.save();

    // 1. Dusk / Sunset Mode (Matching the iconic Photo 1 Sunset!)
    if (game.dayState === 'dusk') {
      // Golden Sun Orb on the lake horizon (around Col 24, Row 14)
      const sunScreenX = 24 * TILE_SIZE - cameraX;
      const sunScreenY = 14 * TILE_SIZE - cameraY;

      if (sunScreenX > -200 && sunScreenX < SCREEN_WIDTH + 200 && sunScreenY > -200 && sunScreenY < SCREEN_HEIGHT + 200) {
        const grad = ctx.createRadialGradient(sunScreenX, sunScreenY, 12, sunScreenX, sunScreenY, 220);
        grad.addColorStop(0, 'rgba(255, 255, 240, 0.95)');
        grad.addColorStop(0.18, 'rgba(251, 191, 36, 0.65)');
        grad.addColorStop(0.5, 'rgba(249, 115, 22, 0.35)');
        grad.addColorStop(1, 'rgba(249, 115, 22, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
      }

      // Warm Golden Amber atmospheric filter across the whole scene
      ctx.fillStyle = 'rgba(249, 115, 22, 0.16)';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

      // Warm glowing halos on the floating bridge lanterns
      const bridgeLamps = [
        [22, 18], [24, 18], [22, 21], [24, 21], [22, 24], [24, 24],
        [25, 23], [31, 23], [31, 27], [22, 27], [24, 27], [22, 30], [24, 30], [22, 33], [24, 33]
      ];

      for (const [lc, lr] of bridgeLamps) {
        const lx = lc * TILE_SIZE + 24 - cameraX;
        const ly = lr * TILE_SIZE + 12 - cameraY;
        if (lx > -50 && lx < SCREEN_WIDTH + 50 && ly > -50 && ly < SCREEN_HEIGHT + 50) {
          const lGrad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 48);
          lGrad.addColorStop(0, 'rgba(254, 240, 138, 0.55)');
          lGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.2)');
          lGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = lGrad;
          ctx.beginPath();
          ctx.arc(lx, ly, 48, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (game.dayState === 'night') {
      // Deep blue-violet night ambiance
      ctx.fillStyle = 'rgba(10, 15, 40, 0.48)';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

      // Night bridge lanterns (high intensity glow)
      const bridgeLamps = [
        [22, 18], [24, 18], [22, 21], [24, 21], [22, 24], [24, 24],
        [25, 23], [31, 23], [31, 27], [22, 27], [24, 27], [22, 30], [24, 30], [22, 33], [24, 33]
      ];

      for (const [lc, lr] of bridgeLamps) {
        const lx = lc * TILE_SIZE + 24 - cameraX;
        const ly = lr * TILE_SIZE + 12 - cameraY;
        if (lx > -60 && lx < SCREEN_WIDTH + 60 && ly > -60 && ly < SCREEN_HEIGHT + 60) {
          const lGrad = ctx.createRadialGradient(lx, ly, 4, lx, ly, 64);
          lGrad.addColorStop(0, 'rgba(254, 240, 138, 0.75)');
          lGrad.addColorStop(0.4, 'rgba(245, 158, 11, 0.35)');
          lGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
          ctx.fillStyle = lGrad;
          ctx.beginPath();
          ctx.arc(lx, ly, 64, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (game.dayState === 'dawn') {
      ctx.fillStyle = 'rgba(255, 190, 120, 0.12)';
      ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
    }

    ctx.restore();
  }

  /** Renders building names (FST, FASS, FBS, FMS) and the iconic Third Place Pavilion Canopy */
  drawCampusSignageAndStructures(ctx: CanvasRenderingContext2D, game: GameEngine, cameraX: number, cameraY: number) {
    ctx.save();

    // 1. Building Architectural Signboards
    const buildings = [
      { name: 'FST BUILDING', key: 'FST Building', sub: 'Faculty of Science & Tech', col: 11.5, row: 2, color: '#38bdf8' },
      { name: 'FASS BUILDING', key: 'FASS Building', sub: 'Faculty of Arts & Social Sciences', col: 24.5, row: 1.8, color: '#f43f5e' },
      { name: 'FBS BUILDING', key: 'FBS Building', sub: 'Faculty of Business Studies', col: 37.5, row: 2, color: '#34d399' },
      { name: 'FMS BUILDING', key: 'FMS Building', sub: 'Faculty of Management Studies', col: 10, row: 36.8, color: '#fbbf24' },
      { name: 'BUP CENTRAL LIBRARY', key: 'BUP Central Library', sub: 'Archive & Monpura Tales', col: 40.5, row: 33.2, color: '#c084fc' },
      { name: 'CENTRAL GARDEN YARD', key: 'Central Garden Yard', sub: 'Botanical Courtyard', col: 24, row: 6.8, color: '#a7f3d0' },
      { name: 'BUP MAIN GATE', key: 'BUP Main Gate', sub: 'Bangladesh Univ. of Professionals', col: 24, row: 44.2, color: '#38bdf8' },
    ];

    ctx.font = 'bold 13px "MaruMonica", monospace';
    ctx.textAlign = 'center';

    for (const b of buildings) {
      const bx = b.col * TILE_SIZE - cameraX;
      const by = b.row * TILE_SIZE - cameraY;

      if (bx > -150 && bx < SCREEN_WIDTH + 150 && by > -50 && by < SCREEN_HEIGHT + 50) {
        const isCollected = game.collectedLocations.has(b.key);
        const displayName = isCollected ? `✓ ${b.name}` : b.name;
        const textWidth = ctx.measureText(displayName).width;
        const boxWidth = Math.max(140, textWidth + 24);
        const boxHeight = 26;

        // Plaque background
        ctx.fillStyle = isCollected ? 'rgba(6, 78, 59, 0.95)' : 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = isCollected ? '#34d399' : b.color;
        ctx.lineWidth = isCollected ? 2 : 1.5;
        ctx.fillRect(bx - boxWidth / 2, by - boxHeight / 2, boxWidth, boxHeight);
        ctx.strokeRect(bx - boxWidth / 2, by - boxHeight / 2, boxWidth, boxHeight);

        // Sign text
        ctx.fillStyle = isCollected ? '#a7f3d0' : b.color;
        ctx.fillText(displayName, bx, by + 4);
      }
    }

    // 1.5. Central Botanical Garden Yard Custom Structures (Fountain, Benches & Flowerbeds)
    const gardenCenterX = 24 * TILE_SIZE - cameraX;
    const gardenCenterY = 11 * TILE_SIZE - cameraY;
    if (gardenCenterX > -200 && gardenCenterX < SCREEN_WIDTH + 200 && gardenCenterY > -200 && gardenCenterY < SCREEN_HEIGHT + 200) {
      // Stone Garden Fountain Base
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(gardenCenterX + 24, gardenCenterY + 24, 26, 0, Math.PI * 2);
      ctx.fill();

      // Fountain Water Basin
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.arc(gardenCenterX + 24, gardenCenterY + 24, 20, 0, Math.PI * 2);
      ctx.fill();

      // Center Spout & Water Jet
      const t = Date.now() * 0.005;
      ctx.fillStyle = '#bae6fd';
      ctx.beginPath();
      ctx.arc(gardenCenterX + 24, gardenCenterY + 24, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(gardenCenterX + 24 + Math.sin(t) * 2, gardenCenterY + 24 - 4 + Math.cos(t) * 2, 4, 0, Math.PI * 2);
      ctx.fill();

      // Garden Benches at (20, 8) and (28, 8)
      const benchLeftX = 20 * TILE_SIZE - cameraX;
      const benchRightX = 28 * TILE_SIZE - cameraX;
      const benchY = 8 * TILE_SIZE - cameraY;
      for (const bx of [benchLeftX, benchRightX]) {
        if (bx > -50 && bx < SCREEN_WIDTH + 50) {
          ctx.fillStyle = '#78350f'; // wood slats
          ctx.fillRect(bx + 4, benchY + 18, 40, 10);
          ctx.fillStyle = '#1c1917'; // cast iron legs
          ctx.fillRect(bx + 6, benchY + 28, 4, 8);
          ctx.fillRect(bx + 38, benchY + 28, 4, 8);
        }
      }

      // Colorful Blooming Flowerbed Clusters
      const flowerBeds = [
        { col: 21, row: 9, c1: '#f43f5e', c2: '#fbbf24' },
        { col: 27, row: 9, c1: '#a855f7', c2: '#ec4899' },
        { col: 21, row: 12, c1: '#38bdf8', c2: '#f43f5e' },
        { col: 27, row: 12, c1: '#fbbf24', c2: '#34d399' },
      ];
      for (const fb of flowerBeds) {
        const fx = fb.col * TILE_SIZE - cameraX;
        const fy = fb.row * TILE_SIZE - cameraY;
        if (fx > -50 && fx < SCREEN_WIDTH + 50 && fy > -50 && fy < SCREEN_HEIGHT + 50) {
          ctx.fillStyle = fb.c1;
          ctx.beginPath();
          ctx.arc(fx + 14, fy + 16, 4, 0, Math.PI * 2);
          ctx.arc(fx + 34, fy + 20, 4, 0, Math.PI * 2);
          ctx.arc(fx + 22, fy + 32, 4, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = fb.c2;
          ctx.beginPath();
          ctx.arc(fx + 24, fy + 18, 3.5, 0, Math.PI * 2);
          ctx.arc(fx + 14, fy + 30, 3.5, 0, Math.PI * 2);
          ctx.arc(fx + 34, fy + 32, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // 2. THIRD PLACE ARENA PAVILION CANOPY (Directly matching Photo 5 / image.png)
    // Position: Columns 36 to 42, Rows 18 to 22
    const pavCenterX = 39 * TILE_SIZE - cameraX;
    const pavBaseY = 21 * TILE_SIZE - cameraY;
    const pavWidth = 6 * TILE_SIZE; // 288px wide
    const pavHeight = 110;

    if (pavCenterX > -250 && pavCenterX < SCREEN_WIDTH + 250 && pavBaseY > -150 && pavBaseY < SCREEN_HEIGHT + 250) {
      // Elevated concrete deck platform steps
      ctx.fillStyle = '#64748b';
      ctx.fillRect(pavCenterX - pavWidth / 2 - 12, pavBaseY + 36, pavWidth + 24, 14);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(pavCenterX - pavWidth / 2 - 8, pavBaseY + 30, pavWidth + 16, 8);

      // Steel Support Columns (Dark charcoal steel)
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(pavCenterX - pavWidth / 2 + 10, pavBaseY - 30, 8, 70);
      ctx.fillRect(pavCenterX + pavWidth / 2 - 18, pavBaseY - 30, 8, 70);
      ctx.fillRect(pavCenterX - 4, pavBaseY - 50, 8, 90); // center column

      // Diagonal steel trusses
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pavCenterX - pavWidth / 2 + 14, pavBaseY + 30);
      ctx.lineTo(pavCenterX, pavBaseY - 45);
      ctx.lineTo(pavCenterX + pavWidth / 2 - 14, pavBaseY + 30);
      ctx.stroke();

      // Triangular A-Frame Dark Steel Roof (Matching the exact silhouette of Third Place in image.png)
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.moveTo(pavCenterX, pavBaseY - 70);
      ctx.lineTo(pavCenterX - pavWidth / 2 - 10, pavBaseY - 15);
      ctx.lineTo(pavCenterX - pavWidth / 2 + 10, pavBaseY - 15);
      ctx.lineTo(pavCenterX, pavBaseY - 55);
      ctx.lineTo(pavCenterX + pavWidth / 2 - 10, pavBaseY - 15);
      ctx.lineTo(pavCenterX + pavWidth / 2 + 10, pavBaseY - 15);
      ctx.closePath();
      ctx.fill();

      // Triangular Gable Background & Horizontal Louvers
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(pavCenterX, pavBaseY - 65);
      ctx.lineTo(pavCenterX - 75, pavBaseY - 20);
      ctx.lineTo(pavCenterX + 75, pavBaseY - 20);
      ctx.closePath();
      ctx.fill();

      // Horizontal louvers
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      for (let ly = pavBaseY - 55; ly < pavBaseY - 20; ly += 6) {
        const spread = (ly - (pavBaseY - 65)) * 1.5;
        ctx.beginPath();
        ctx.moveTo(pavCenterX - spread, ly);
        ctx.lineTo(pavCenterX + spread, ly);
        ctx.stroke();
      }

      // Yellow THIRD PLACE Logo Text (Exactly from reference photo!)
      ctx.fillStyle = '#eab308';
      ctx.font = 'bold 16px "MaruMonica", monospace';
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 4;
      ctx.fillText('THIRD PLACE', pavCenterX, pavBaseY - 32);
      ctx.shadowBlur = 0;

      // Small subtitle under sign: "STUDENT PAVILION & ARENA"
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText('STUDENT ARENA', pavCenterX, pavBaseY - 22);

      // Hanging flower baskets from roof beam (visible in photo)
      ctx.fillStyle = '#ec4899';
      ctx.beginPath();
      ctx.arc(pavCenterX - 45, pavBaseY - 10, 4, 0, Math.PI * 2);
      ctx.arc(pavCenterX + 45, pavBaseY - 10, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /** Renders equipped melee weapon swing & slash arc for the campus_hero character */
  drawHeroWeaponSwing(ctx: CanvasRenderingContext2D, game: GameEngine, lungeX: number, lungeY: number) {
    const player = game.player;
    const weaponSrc = player.currentWeapon?.icon || '/res/objects/sword_normal.png';
    const weaponImg = assets.get(weaponSrc);
    const totalDuration = Math.max(15, player.currentWeapon?.motion2 || 25);
    const progress = Math.min(1, player.attackTimer / totalDuration);

    const cx = player.screenX + lungeX + TILE_SIZE / 2;
    const cy = player.screenY + lungeY + TILE_SIZE / 2;

    // Base facing angle (0 = right, PI/2 = down, PI = left, -PI/2 = up)
    let baseAngle = Math.PI / 2;
    if (player.direction === 'right') baseAngle = 0;
    else if (player.direction === 'left') baseAngle = Math.PI;
    else if (player.direction === 'up') baseAngle = -Math.PI / 2;

    // Swing sweep from -70 deg to +75 deg around facing direction
    const sweepOffset = -1.2 + progress * 2.5;
    const currentAngle = baseAngle + sweepOffset;

    ctx.save();

    // Subtle slash crescent during active strike window
    if (progress >= 0.2 && progress <= 0.85) {
      const alpha = (1 - Math.abs(progress - 0.52) / 0.33) * 0.75;
      ctx.strokeStyle = player.currentWeapon?.id === 'axe'
        ? `rgba(251, 191, 36, ${alpha})`
        : `rgba(224, 242, 254, ${alpha})`;
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(cx, cy, 30, baseAngle - 1.0, baseAngle + Math.min(1.0, sweepOffset));
      ctx.stroke();
    }

    // Draw rotated weapon sprite
    if (weaponImg) {
      const reach = 20;
      const wx = cx + Math.cos(currentAngle) * reach;
      const wy = cy + Math.sin(currentAngle) * reach;
      ctx.translate(wx, wy);
      // Item icons point diagonally top-right (-PI/4), offset accordingly
      ctx.rotate(currentAngle + Math.PI / 4);
      ctx.drawImage(weaponImg, -14, -14, 28, 28);
    }

    ctx.restore();
  }

  /** Renders warm lamp light & mystical glow around MONPURA TALES in BUP Central Library */
  drawLibraryLighting(ctx: CanvasRenderingContext2D, game: GameEngine, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(15, 10, 5, 0.14)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    const warmLights = [
      [17, 11, 90],
      [32, 11, 90],
      [20, 12, 75],
      [28, 12, 75],
      [23, 12, 55],
      [25, 12, 55],
    ];
    for (const [col, row, radius] of warmLights) {
      const lx = col * TILE_SIZE + 24 - cameraX;
      const ly = row * TILE_SIZE + 24 - cameraY;
      if (lx > -radius && lx < SCREEN_WIDTH + radius && ly > -radius && ly < SCREEN_HEIGHT + radius) {
        const g = ctx.createRadialGradient(lx, ly, 4, lx, ly, radius);
        g.addColorStop(0, 'rgba(253, 224, 71, 0.28)');
        g.addColorStop(0.5, 'rgba(245, 158, 11, 0.12)');
        g.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(lx, ly, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Mystical emerald shimmer around MONPURA TALES book at (24, 13)
    const book = game.objects.find((o) => o.id === 'monpura_book_1' && !o.destroyed);
    if (book) {
      const bx = book.worldX + 24 - cameraX;
      const by = book.worldY + 24 - cameraY;
      const pulse = 0.28 + Math.sin(Date.now() * 0.004) * 0.1;
      const g = ctx.createRadialGradient(bx, by, 6, bx, by, 85);
      g.addColorStop(0, `rgba(52, 211, 153, ${pulse})`);
      g.addColorStop(0.6, 'rgba(56, 189, 248, 0.12)');
      g.addColorStop(1, 'rgba(16, 185, 129, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(bx, by, 85, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Renders subtle golden island sunlight & firefly glints on Isle of Monpura */
  drawMonpuraLighting(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Subtle firefly sparkles at shrines
    const spots = [
      [24, 41, 'rgba(56, 189, 248, 0.24)'],
      [39, 25, 'rgba(52, 211, 153, 0.24)'],
      [11, 28, 'rgba(251, 191, 36, 0.24)'],
      [12, 12, 'rgba(96, 165, 250, 0.26)'],
      [24, 8, 'rgba(244, 63, 94, 0.22)'],
    ] as const;
    for (const [col, row, color] of spots) {
      const sx = col * TILE_SIZE + 24 - cameraX;
      const sy = row * TILE_SIZE + 24 - cameraY;
      if (sx > -90 && sx < SCREEN_WIDTH + 90 && sy > -90 && sy < SCREEN_HEIGHT + 90) {
        const g = ctx.createRadialGradient(sx, sy, 4, sx, sy, 75);
        g.addColorStop(0, color);
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(sx, sy, 75, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  /** Renders landmark signage plaques across Isle of Monpura (Map 5) */
  drawMonpuraLandmarks(ctx: CanvasRenderingContext2D, game: GameEngine, cameraX: number, cameraY: number) {
    ctx.save();
    const landmarks = [
      { label: 'BUP RETURN PORTAL', col: 24.5, row: 42.3, color: '#38bdf8', done: false },
      { label: 'VILLAGE ORCHARD', col: 11.5, row: 25.5, color: '#fbbf24', done: game.questProgress.sealsCollected.includes('seal_amber') },
      { label: 'BAMBOO GROVE', col: 39.5, row: 22.8, color: '#34d399', done: game.questProgress.sealsCollected.includes('seal_emerald') },
      { label: 'TIDEPOOL SHRINE', col: 12.5, row: 10.3, color: '#60a5fa', done: game.questProgress.sealsCollected.includes('seal_azure') },
      {
        label: game.questProgress.sealsCollected.length >= 3 ? 'ANCIENT RUINS GATE (OPEN)' : `RUINS GATE (${game.questProgress.sealsCollected.length}/3 SEALS)`,
        col: 24.5,
        row: 6.4,
        color: game.questProgress.sealsCollected.length >= 3 ? '#34d399' : '#f43f5e',
        done: game.questProgress.sealsCollected.length >= 3,
      },
    ];

    ctx.font = 'bold 12px "MaruMonica", monospace';
    ctx.textAlign = 'center';

    for (const lm of landmarks) {
      const lx = lm.col * TILE_SIZE - cameraX;
      const ly = lm.row * TILE_SIZE - cameraY;
      if (lx > -160 && lx < SCREEN_WIDTH + 160 && ly > -50 && ly < SCREEN_HEIGHT + 50) {
        const text = lm.done && !lm.label.includes('OPEN') ? `✓ ${lm.label}` : lm.label;
        const w = Math.max(130, ctx.measureText(text).width + 20);
        ctx.fillStyle = lm.done ? 'rgba(6, 78, 59, 0.92)' : 'rgba(15, 23, 42, 0.88)';
        ctx.strokeStyle = lm.color;
        ctx.lineWidth = 1.5;
        ctx.fillRect(lx - w / 2, ly - 12, w, 24);
        ctx.strokeRect(lx - w / 2, ly - 12, w, 24);
        ctx.fillStyle = lm.done ? '#a7f3d0' : lm.color;
        ctx.fillText(text, lx, ly + 4);
      }
    }
    ctx.restore();
  }

  /** Renders dramatic boss HP bar in Sanctum of Monpura */
  drawBossHealthBanner(ctx: CanvasRenderingContext2D, name: string, life: number, maxLife: number, inRage: boolean) {
    ctx.save();
    const barW = 320;
    const barH = 14;
    const x = SCREEN_WIDTH / 2 - barW / 2;
    const y = SCREEN_HEIGHT - 44;
    const pct = Math.max(0, Math.min(1, life / maxLife));

    ctx.fillStyle = 'rgba(10, 10, 18, 0.88)';
    ctx.strokeStyle = inRage ? '#f97316' : '#ef4444';
    ctx.lineWidth = 2;
    ctx.fillRect(x - 10, y - 22, barW + 20, 44);
    ctx.strokeRect(x - 10, y - 22, barW + 20, 44);

    ctx.font = 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.fillStyle = inRage ? '#fdba74' : '#fca5a5';
    ctx.fillText(`${name.toUpperCase()}${inRage ? ' · ENRAGED' : ''} (${life}/${maxLife})`, SCREEN_WIDTH / 2, y - 6);

    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = inRage ? '#f97316' : '#ef4444';
    ctx.fillRect(x, y, barW * pct, barH);
    ctx.restore();
  }
}

export const renderer = new GameRenderer();

