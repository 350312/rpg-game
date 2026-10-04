import React from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';
import { sounds } from '../game/sound';
import { RotateCcw, Home, Skull } from 'lucide-react';

interface GameOverModalProps {
  game: GameEngine;
  onRetry: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ game, onRetry, onTitle }) => {
  return (
    <div className="fixed inset-0 bg-red-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border-2 border-red-600 rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-4 text-white font-mono animate-fade-in">
        <Skull className="w-16 h-16 text-red-500 animate-pulse" />

        <h2 className="text-3xl font-black text-red-500 tracking-widest drop-shadow-[0_2px_10px_rgba(239,68,68,0.5)]">
          YOU DIED
        </h2>

        <p className="text-xs text-zinc-400 font-sans leading-relaxed">
          The shadows of the dungeon overcame you. Rise again, brave hero!
        </p>

        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={onRetry}
            className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2 text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={onTitle}
            className="w-full py-2.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold rounded-xl transition border border-white/10 flex items-center justify-center gap-2 text-sm"
          >
            <Home className="w-4 h-4" />
            <span>RETURN TO TITLE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
