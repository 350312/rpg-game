import React, { useEffect, useRef } from 'react';
import { GameEngine, SCREEN_WIDTH, SCREEN_HEIGHT } from '../game/engine';
import { renderer } from '../game/renderer';
import { GameState } from '../game/types';
import { sounds } from '../game/sound';

interface GameCanvasProps {
  game: GameEngine;
  onOpenInventory: () => void;
  onOpenOptions: () => void;
  onToggleMiniMap: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  game,
  onOpenInventory,
  onOpenOptions,
  onToggleMiniMap,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid scrolling on Arrow keys or Space
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault();
      }

      // Hotkeys
      if (e.code === 'KeyC') {
        if (game.gameState === GameState.PLAY) {
          onOpenInventory();
        } else if (game.gameState === GameState.CHARACTER) {
          game.gameState = GameState.PLAY;
        }
        return;
      }

      if (e.code === 'KeyX' && game.gameState === GameState.PLAY) {
        onToggleMiniMap();
        return;
      }

      if ((e.code === 'Escape' || e.code === 'KeyP') && game.gameState === GameState.PLAY) {
        onOpenOptions();
        return;
      }

      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        if (game.gameState === GameState.DIALOGUE) {
          game.triggerAction();
          return;
        }
      }

      game.keys[e.code] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Do not prematurely wipe Enter if not yet consumed
      if (e.code !== 'Enter' && e.code !== 'NumpadEnter') {
        game.keys[e.code] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [game, onOpenInventory, onOpenOptions, onToggleMiniMap]);

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();
    let accumulator = 0;
    const FIXED_STEP = 1000 / 60; // Strict 60 Hz physics tick (16.667ms)

    const loop = (currentTime: number) => {
      // Clamp elapsed time to 100ms to avoid spiral of death on background tab switch
      const elapsed = Math.min(100, currentTime - lastTime);
      lastTime = currentTime;
      accumulator += elapsed;

      // Run game updates in fixed 60 FPS increments
      while (accumulator >= FIXED_STEP) {
        game.update();
        accumulator -= FIXED_STEP;
      }

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;
          renderer.render(ctx, game);
        }
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [game]);

  const handleCanvasPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (game.gameState !== GameState.PLAY) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * SCREEN_WIDTH;
    const clickY = ((e.clientY - rect.top) / rect.height) * SCREEN_HEIGHT;
    const pCenterX = game.player.screenX + 24;
    const pCenterY = game.player.screenY + 24;
    const diffX = clickX - pCenterX;
    const diffY = clickY - pCenterY;

    if (Math.hypot(diffX, diffY) > 20) {
      if (Math.abs(diffX) > Math.abs(diffY)) {
        game.player.direction = diffX > 0 ? 'right' : 'left';
      } else {
        game.player.direction = diffY > 0 ? 'down' : 'up';
      }
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden select-none">
      <canvas
        ref={canvasRef}
        onPointerDown={handleCanvasPointer}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        className="w-full h-full max-w-[1600px] max-h-[960px] object-contain shadow-2xl cursor-pointer"
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </div>
  );
};
