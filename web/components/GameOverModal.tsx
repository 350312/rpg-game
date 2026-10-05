import React from 'react';
import { GameEngine } from '../game/engine';
import { RotateCcw, Home, Skull, X } from 'lucide-react';

interface GameOverModalProps {
  game: GameEngine;
  onRetry: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ game, onRetry, onTitle }) => {
  return (
    <div className="fixed inset-0 bg-red-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      {/* Floating Corner Close Button */}
      <button
        onClick={onRetry}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 p-2.5 bg-black/85 active:bg-red-600 hover:bg-red-600 border-2 border-white/50 rounded-full text-white shadow-2xl transition-all transform active:scale-90 flex items-center justify-center cursor-pointer"
        title="Close & Retry"
        aria-label="Close Game Over"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="bg-zinc-950 border-2 border-red-600 rounded-2xl p-6 sm:p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4 text-white font-mono animate-fade-in relative">
        <button
          onClick={onRetry}
          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white rounded-lg transition"
          title="Retry"
        >
          <X className="w-4 h-4" />
        </button>

        <Skull className="w-16 h-16 text-red-500 animate-pulse" />

        <h2 className="text-2xl sm:text-3xl font-black text-red-500 tracking-widest drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
          YOU DIED
        </h2>

        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          The shadows of the dungeon overcame you. Rise again, brave hero!
        </p>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={onRetry}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={onTitle}
            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 text-zinc-300 font-bold rounded-xl transition border border-white/10 flex items-center justify-center gap-2 text-sm active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
