import React, { useEffect, useState } from 'react';
import { GameEngine } from '../game/engine';
import { sounds } from '../game/sound';
import { Play, RotateCcw, Volume2, Shield, Sword, Sparkles } from 'lucide-react';

interface TitleScreenProps {
  game: GameEngine;
  onStartNew: () => void;
  onLoadGame: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ game, onStartNew, onLoadGame }) => {
  const [hasSave, setHasSave] = useState(false);

  useEffect(() => {
    try {
      const saveStr = localStorage.getItem('blue_boy_save');
      if (saveStr) setHasSave(true);
    } catch (e) {}
  }, []);

  const handleStart = () => {
    sounds.playSE('cursor');
    onStartNew();
  };

  const handleLoad = () => {
    sounds.playSE('cursor');
    onLoadGame();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-white font-mono select-none overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-black">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* Main Title Badge */}
      <div className="flex flex-col items-center gap-3 z-10 mb-8 animate-fade-in text-center">
        <div className="flex items-center gap-3">
          <img src="/res/objects/blueheart.png" alt="Relic" className="w-10 h-10 object-contain pixelated animate-bounce" />
          <h1 className="text-3xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-200 to-amber-300 drop-shadow-[0_4px_12px_rgba(56,189,248,0.5)]">
            BLUE BOY ADVENTURE
          </h1>
          <img src="/res/objects/blueheart.png" alt="Relic" className="w-10 h-10 object-contain pixelated animate-bounce" />
        </div>
        <p className="text-xs md:text-sm text-sky-200 font-sans tracking-widest uppercase">
          Classic 2D Action RPG
        </p>

        {/* Character Preview */}
        <div className="relative my-2 p-3 bg-black/40 border border-white/20 rounded-2xl shadow-xl flex items-center justify-center">
          <img
            src="/res/player/boy_down_1.png"
            alt="Hero"
            className="w-16 h-16 object-contain pixelated scale-125"
          />
        </div>
      </div>

      {/* Menu Actions */}
      <div className="flex flex-col gap-3 w-full max-w-xs z-10">
        <button
          onClick={handleStart}
          className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-500 hover:to-sky-400 text-white font-bold rounded-xl shadow-lg border border-sky-300/40 flex items-center justify-center gap-2.5 transition transform active:scale-95 text-base tracking-wider"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START NEW ADVENTURE</span>
        </button>

        {hasSave && (
          <button
            onClick={handleLoad}
            className="w-full py-2.5 px-6 bg-amber-600/80 hover:bg-amber-500 text-white font-bold rounded-xl shadow border border-amber-300/40 flex items-center justify-center gap-2 transition transform active:scale-95 text-sm tracking-wider"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CONTINUE SAVED GAME</span>
          </button>
        )}
      </div>

      {/* Controls Summary Footer */}
      <div className="mt-10 bg-black/50 border border-white/10 rounded-xl p-4 max-w-lg w-full text-center text-xs text-zinc-300 z-10 backdrop-blur-sm">
        <div className="font-bold text-amber-400 mb-2 flex items-center justify-center gap-1.5">
          <Sword className="w-3.5 h-3.5" /> Game Controls
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] text-zinc-400">
          <div><span className="text-white font-bold">W A S D</span> : Walk</div>
          <div><span className="text-white font-bold">ENTER</span> : Attack / Talk</div>
          <div><span className="text-white font-bold">SPACE</span> : Shield Guard</div>
          <div><span className="text-white font-bold">F</span> : Cast Fireball</div>
          <div><span className="text-white font-bold">C</span> : Inventory</div>
          <div><span className="text-white font-bold">X</span> : Minimap</div>
          <div><span className="text-white font-bold">ESC</span> : Settings Menu</div>
          <div><span className="text-sky-300">Touch D-pad</span> : Mobile</div>
        </div>
      </div>
    </div>
  );
};
