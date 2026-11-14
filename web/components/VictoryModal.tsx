import React from 'react';
import { GameEngine } from '../game/engine';
import { Sparkles, Home, Compass, X } from 'lucide-react';

interface VictoryModalProps {
  game: GameEngine;
  onContinueExplore: () => void;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ game, onContinueExplore, onPlayAgain }) => {
  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 select-none">
      {/* Floating Close Button */}
      <button
        onClick={onContinueExplore}
        className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 p-2.5 bg-black/85 active:bg-amber-600 hover:bg-amber-600 border-2 border-white/50 rounded-full text-white shadow-2xl transition-all transform active:scale-90 flex items-center justify-center cursor-pointer"
        title="Return to BUP Campus (Epilogue)"
        aria-label="Close Victory Screen"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      <div className="bg-zinc-950 border-2 border-amber-400 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center gap-4 text-white font-mono animate-fade-in relative">
        <button
          onClick={onContinueExplore}
          className="absolute top-3 right-3 p-1.5 text-zinc-400 hover:text-white rounded-lg transition cursor-pointer"
          title="Return to BUP Campus"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="relative">
          <img
            src="/res/objects/blueheart.png"
            alt="Heart of Monpura"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain pixelated animate-bounce"
          />
          <Sparkles className="w-8 h-8 text-amber-300 absolute -top-2 -right-2 animate-spin" />
        </div>

        <div className="text-[10px] uppercase tracking-widest text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-3 py-0.5 rounded-full">
          Monpura Tales Complete
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-300 to-sky-400 tracking-wider">
          GUARDIAN OF MONPURA!
        </h2>

        <p className="text-xs sm:text-sm text-sky-100 font-sans leading-relaxed">
          You unsealed the Ancient Gate, vanquished the Shadow Warden, and reclaimed the legendary{' '}
          <span className="text-sky-300 font-semibold">Heart of Monpura</span>! As peace returns to the island, the book&apos;s golden light carries you safely home to BUP.
        </p>

        {/* Stats summary */}
        <div className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs flex flex-col gap-1.5 my-1">
          <div className="flex justify-between">
            <span className="text-zinc-400">Final Hero Level:</span>
            <span className="text-amber-400 font-bold">{game.player.level}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Sacred Seals Recovered:</span>
            <span className="text-emerald-300 font-bold">{game.questProgress.sealsCollected.length} / 3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">BUP Buildings Visited:</span>
            <span className="text-sky-300 font-bold">{game.collectedLocations.size} / 4</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Library Chronicles Read:</span>
            <span className="text-purple-300 font-bold">{game.questProgress.libraryBooksRead.length} / 3</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Monsters Defeated:</span>
            <span className="text-rose-300 font-bold">{game.questProgress.monstersDefeated}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-400">Coins Collected:</span>
            <span className="text-yellow-300 font-bold">{game.player.coin}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full">
          <button
            onClick={onContinueExplore}
            className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-sm tracking-wide active:scale-95 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            <span>RETURN TO BUP (FREE EXPLORE)</span>
          </button>

          <button
            onClick={onPlayAgain}
            className="w-full py-2.5 px-6 bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-400/40 font-bold rounded-xl transition flex items-center justify-center gap-2 text-xs tracking-wide active:scale-95 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>START NEW ADVENTURE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
