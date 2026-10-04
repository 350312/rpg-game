import React from 'react';
import { GameEngine } from '../game/engine';
import { Trophy, Sparkles, Home } from 'lucide-react';

interface VictoryModalProps {
  game: GameEngine;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ game, onPlayAgain }) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-zinc-950 border-2 border-amber-400 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 text-white font-mono animate-fade-in">
        <div className="relative">
          <img
            src="/res/objects/blueheart.png"
            alt="Blue Gem"
            className="w-20 h-20 object-contain pixelated animate-bounce"
          />
          <Sparkles className="w-8 h-8 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-amber-300 to-yellow-400 tracking-wider">
          VICTORY!
        </h2>

        <p className="text-sm text-sky-200 font-sans leading-relaxed">
          You have conquered the treacherous dungeons, vanquished the Skeleton Lord, and recovered the legendary Blue Gem!
        </p>

        {/* Stats summary */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex flex-col gap-1.5 my-2">
          <div className="flex justify-between">
            <span className="text-zinc-400">Final Hero Level:</span>
            <span className="text-amber-400 font-bold">{game.player.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Coins Collected:</span>
            <span className="text-yellow-300 font-bold">{game.player.coin}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Items in Bag:</span>
            <span className="text-emerald-400 font-bold">{game.player.inventory.length}</span>
          </div>
        </div>

        <button
          onClick={onPlayAgain}
          className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide"
        >
          <Home className="w-4 h-4" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
