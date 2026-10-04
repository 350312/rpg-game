import React, { useEffect, useState } from 'react';
import { game } from './game/engine';
import { GameState } from './game/types';
import { assets } from './game/assets';
import { sounds } from './game/sound';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { DialogueBox } from './components/DialogueBox';
import { CharacterModal } from './components/CharacterModal';
import { MerchantShop } from './components/MerchantShop';
import { OptionsMenu } from './components/OptionsMenu';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { TitleScreen } from './components/TitleScreen';
import { VirtualControls } from './components/VirtualControls';

export const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [, setTick] = useState(0);

  const forceUpdate = () => setTick((t) => t + 1);

  useEffect(() => {
    game.onStateChange = forceUpdate;

    const prepare = async () => {
      try {
        await Promise.all([assets.preloadAll(), game.init()]);
      } catch (e) {
        console.error('Initialization error:', e);
      } finally {
        setLoading(false);
      }
    };

    prepare();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white font-mono gap-4 select-none">
        <img
          src="/res/objects/blueheart.png"
          alt="Loading..."
          className="w-16 h-16 object-contain pixelated animate-bounce"
        />
        <h2 className="text-xl md:text-2xl font-bold tracking-widest text-sky-400">
          LOADING BLUE BOY ADVENTURE...
        </h2>
        <div className="w-48 h-2 bg-zinc-800 rounded-full overflow-hidden border border-white/20">
          <div className="w-full h-full bg-sky-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Title Screen */}
      {game.gameState === GameState.TITLE && (
        <TitleScreen
          game={game}
          onStartNew={() => {
            game.startNewGame();
            forceUpdate();
          }}
          onLoadGame={() => {
            const success = game.loadGame();
            if (!success) {
              game.startNewGame();
            }
            forceUpdate();
          }}
        />
      )}

      {/* Main Play View */}
      {game.gameState !== GameState.TITLE && (
        <>
          <GameCanvas
            game={game}
            onOpenInventory={() => {
              game.gameState = GameState.CHARACTER;
              sounds.playSE('cursor');
              forceUpdate();
            }}
            onOpenOptions={() => {
              game.gameState = GameState.OPTIONS;
              sounds.playSE('cursor');
              forceUpdate();
            }}
            onToggleMiniMap={() => {
              game.miniMapOn = !game.miniMapOn;
              sounds.playSE('cursor');
              forceUpdate();
            }}
          />

          {/* HUD Overlay */}
          <HUD
            game={game}
            onOpenInventory={() => {
              game.gameState = GameState.CHARACTER;
              sounds.playSE('cursor');
              forceUpdate();
            }}
            onOpenOptions={() => {
              game.gameState = GameState.OPTIONS;
              sounds.playSE('cursor');
              forceUpdate();
            }}
            onToggleMiniMap={() => {
              game.miniMapOn = !game.miniMapOn;
              sounds.playSE('cursor');
              forceUpdate();
            }}
          />

          {/* Virtual On-Screen Controls */}
          <VirtualControls
            game={game}
            onOpenInventory={() => {
              game.gameState = GameState.CHARACTER;
              sounds.playSE('cursor');
              forceUpdate();
            }}
            onToggleMiniMap={() => {
              game.miniMapOn = !game.miniMapOn;
              sounds.playSE('cursor');
              forceUpdate();
            }}
          />

          {/* Dialogue Box */}
          {game.gameState === GameState.DIALOGUE && (
            <DialogueBox
              game={game}
              onClose={() => {
                game.gameState = GameState.PLAY;
                forceUpdate();
              }}
            />
          )}

          {/* Character & Inventory Modal */}
          {game.gameState === GameState.CHARACTER && (
            <CharacterModal
              game={game}
              onClose={() => {
                game.gameState = GameState.PLAY;
                forceUpdate();
              }}
              onUpdate={forceUpdate}
            />
          )}

          {/* Merchant Shop Modal */}
          {game.gameState === GameState.TRADE && (
            <MerchantShop
              game={game}
              onClose={() => {
                game.gameState = GameState.PLAY;
                forceUpdate();
              }}
              onUpdate={forceUpdate}
            />
          )}

          {/* Options / Menu Modal */}
          {game.gameState === GameState.OPTIONS && (
            <OptionsMenu
              game={game}
              onClose={() => {
                game.gameState = GameState.PLAY;
                forceUpdate();
              }}
              onRestart={() => {
                game.gameState = GameState.TITLE;
                sounds.stopMusic();
                forceUpdate();
              }}
            />
          )}

          {/* Game Over Modal */}
          {game.gameState === GameState.GAME_OVER && (
            <GameOverModal
              game={game}
              onRetry={() => {
                game.player.life = game.player.maxLife;
                game.player.mana = game.player.maxMana;
                game.player.invincibleTimer = 60;
                game.gameState = GameState.PLAY;
                sounds.playMusic('theme');
                forceUpdate();
              }}
              onTitle={() => {
                game.gameState = GameState.TITLE;
                sounds.stopMusic();
                forceUpdate();
              }}
            />
          )}

          {/* Victory Modal */}
          {game.gameState === GameState.VICTORY && (
            <VictoryModal
              game={game}
              onPlayAgain={() => {
                game.startNewGame();
                forceUpdate();
              }}
            />
          )}
        </>
      )}
    </div>
  );
};
