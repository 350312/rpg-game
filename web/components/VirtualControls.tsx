import React from 'react';
import { GameEngine } from '../game/engine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Flame, Sword, MessageSquare } from 'lucide-react';

interface VirtualControlsProps {
  game: GameEngine;
  onOpenInventory: () => void;
  onToggleMiniMap: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ game }) => {
  const isInteractable = game.hasNearbyInteractable();

  const handleKeyStart = (code: string) => {
    game.keys[code] = true;
  };

  const handleKeyEnd = (code: string) => {
    game.keys[code] = false;
  };

  return (
    <div className="absolute inset-x-0 bottom-2 sm:bottom-4 px-2 sm:px-4 flex justify-between items-end pointer-events-none z-20 select-none touch-none">
      {/* Left: Classic Ergonomic D-Pad */}
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 bg-black/50 rounded-full border border-white/25 p-1.5 backdrop-blur-md pointer-events-auto flex items-center justify-center shadow-2xl">
        {/* Up */}
        <button
          onPointerDown={() => handleKeyStart('KeyW')}
          onPointerUp={() => handleKeyEnd('KeyW')}
          onPointerLeave={() => handleKeyEnd('KeyW')}
          className="absolute top-1 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800/90 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow"
          aria-label="Move Up"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down */}
        <button
          onPointerDown={() => handleKeyStart('KeyS')}
          onPointerUp={() => handleKeyEnd('KeyS')}
          onPointerLeave={() => handleKeyEnd('KeyS')}
          className="absolute bottom-1 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800/90 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow"
          aria-label="Move Down"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left */}
        <button
          onPointerDown={() => handleKeyStart('KeyA')}
          onPointerUp={() => handleKeyEnd('KeyA')}
          onPointerLeave={() => handleKeyEnd('KeyA')}
          className="absolute left-1 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800/90 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right */}
        <button
          onPointerDown={() => handleKeyStart('KeyD')}
          onPointerUp={() => handleKeyEnd('KeyD')}
          onPointerLeave={() => handleKeyEnd('KeyD')}
          className="absolute right-1 w-9 h-9 sm:w-10 sm:h-10 bg-zinc-800/90 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white active:scale-90 transition-transform shadow"
          aria-label="Move Right"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Center Cross Accent */}
        <div className="w-6 h-6 rounded-full bg-zinc-900/80 border border-white/10 pointer-events-none" />
      </div>

      {/* Right: Console-Style Action Arc (Thumb Friendly) */}
      <div className="relative w-36 h-32 sm:w-40 sm:h-36 pointer-events-auto touch-none select-none flex items-end justify-end">
        {/* Fireball / Magic Button (Top-Left of the Thumb Cluster) */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            game.shootFireball();
          }}
          className="absolute top-0 right-16 sm:right-20 w-11 h-11 sm:w-12 sm:h-12 bg-orange-950/90 active:bg-orange-600 border-2 border-orange-400/90 rounded-full flex flex-col items-center justify-center text-orange-200 shadow-xl active:scale-90 transition-transform"
          title="Cast Fireball (F)"
          aria-label="Cast Fireball"
        >
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-[8px] font-bold text-orange-200 leading-none">MAGIC</span>
        </button>

        {/* Guard Button (Bottom-Left of the Thumb Cluster) */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            handleKeyStart('Space');
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            handleKeyEnd('Space');
          }}
          onPointerLeave={() => handleKeyEnd('Space')}
          className="absolute bottom-1 right-16 sm:right-18 w-12 h-12 sm:w-13 sm:h-13 bg-blue-950/90 active:bg-blue-600 border-2 border-blue-400/90 rounded-full flex flex-col items-center justify-center text-blue-200 shadow-xl active:scale-90 transition-transform"
          title="Shield Guard (Space)"
          aria-label="Shield Guard"
        >
          <Shield className="w-5 h-5 mb-0.5" />
          <span className="text-[8px] font-bold leading-none">GUARD</span>
        </button>

        {/* Attack / Talk Button (Primary Large Button, Extreme Bottom-Right) */}
        <button
          onPointerDown={(e) => {
            e.preventDefault();
            game.triggerAction();
          }}
          onClick={(e) => {
            e.preventDefault();
            game.triggerAction();
          }}
          className={`absolute bottom-0 right-0 w-15 h-15 sm:w-16 sm:h-16 ${
            isInteractable
              ? 'bg-amber-600/95 active:bg-amber-500 border-amber-300 ring-2 ring-amber-400/60'
              : 'bg-red-800/95 active:bg-red-600 border-red-400/90'
          } border-2 rounded-full flex flex-col items-center justify-center text-white font-bold shadow-2xl active:scale-90 transition-all`}
          title={isInteractable ? 'Talk / Interact (Enter)' : 'Attack (Enter)'}
          aria-label={isInteractable ? 'Talk / Interact' : 'Attack'}
        >
          {isInteractable ? (
            <>
              <MessageSquare className="w-6 h-6 mb-0.5 text-amber-100" />
              <span className="text-[9px] text-amber-100 font-extrabold tracking-wider leading-none">TALK</span>
            </>
          ) : (
            <>
              <Sword className="w-6 h-6 mb-0.5" />
              <span className="text-[9px] font-extrabold tracking-wider leading-none">ATTACK</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
