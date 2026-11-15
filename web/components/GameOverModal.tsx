import React, { useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { LIVES_CONFIG } from '../game/config';
import { RotateCcw, Home, Skull, Heart } from 'lucide-react';

interface GameOverModalProps {
  game: GameEngine;
  mode: 'life_lost' | 'game_over';
  onRestartLevel: () => void;
  onRestartGame: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  game,
  mode,
  onRestartLevel,
  onRestartGame,
  onTitle,
}) => {
  const livesLeft = game.player.lives;
  const levelLabel = game.lastDeathInfo?.levelLabel || 'Current Level';
  const isFinalGameOver = mode === 'game_over' || livesLeft <= 0;

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter') {
        e.preventDefault();
        if (isFinalGameOver) {
          onRestartGame();
        } else {
          onRestartLevel();
        }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isFinalGameOver, onRestartLevel, onRestartGame]);

  return (
    <div className="fixed inset-0 bg-red-950/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border-2 border-red-600 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 text-white font-mono animate-fade-in relative">
        <Skull className="w-14 h-14 text-red-500 animate-pulse" />

        <h2 className="text-2xl sm:text-3xl font-black text-red-500 tracking-widest drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
          {isFinalGameOver ? 'GAME OVER' : 'LIFE LOST'}
        </h2>

        {/* Visual Remaining Lives Row */}
        <div className="flex items-center justify-center gap-3 px-4 py-2 rounded-xl bg-black/60 border border-white/15">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: LIVES_CONFIG.MAX_LIVES }, (_, idx) => {
              const alive = idx < livesLeft;
              return alive ? (
                <Heart
                  key={`modal_life_${idx}`}
                  className="w-5 h-5 text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.65)]"
                />
              ) : (
                <Skull key={`modal_life_${idx}`} className="w-5 h-5 text-zinc-600" />
              );
            })}
          </div>
          <span className="text-xs font-bold text-zinc-200 tabular-nums">
            {livesLeft} / {LIVES_CONFIG.MAX_LIVES} Lives Remaining
          </span>
        </div>

        <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed">
          {isFinalGameOver ? (
            <>
              All {LIVES_CONFIG.MAX_LIVES} lives have been lost. Your adventure resets to{' '}
              <span className="text-amber-300 font-semibold">Level 1: The BUP Campus</span> with 3 fresh lives.
            </>
          ) : (
            <>
              You fell in <span className="text-amber-300 font-semibold">{levelLabel}</span>. You will restart from the beginning of this level with full HP, while enemies and bosses reset. Your saved key items and story progress remain.
            </>
          )}
        </p>

        <div className="flex flex-col gap-2.5 w-full mt-1">
          {isFinalGameOver ? (
            <button
              onClick={onRestartGame}
              className="w-full min-h-[44px] py-3 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART FROM LEVEL 1</span>
            </button>
          ) : (
            <button
              onClick={onRestartLevel}
              className="w-full min-h-[44px] py-3 px-4 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-black font-black rounded-xl transition shadow flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>RESTART LEVEL ({livesLeft} {livesLeft === 1 ? 'LIFE' : 'LIVES'} LEFT)</span>
            </button>
          )}

          <button
            onClick={onTitle}
            className="w-full min-h-[44px] py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 font-bold rounded-xl transition border border-white/10 flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>

        <div className="text-[10px] text-zinc-500 font-mono">
          Press [ENTER] to {isFinalGameOver ? 'restart from Level 1' : 'restart current level'}
        </div>
      </div>
    </div>
  );
};
