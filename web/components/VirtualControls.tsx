import React from 'react';
import { GameEngine } from '../game/engine';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Shield, Flame, Sword, Backpack, Compass, MessageSquare } from 'lucide-react';

interface VirtualControlsProps {
  game: GameEngine;
  onOpenInventory: () => void;
  onToggleMiniMap: () => void;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({ game, onOpenInventory, onToggleMiniMap }) => {
  const isInteractable = game.hasNearbyInteractable();

  const handleKeyStart = (code: string) => {
    game.keys[code] = true;
  };

  const handleKeyEnd = (code: string) => {
    game.keys[code] = false;
  };

  return (
    <div className="absolute inset-x-0 bottom-4 px-4 flex justify-between items-end pointer-events-none z-20 select-none">
      {/* Left: D-Pad */}
      <div className="relative w-36 h-36 bg-black/40 rounded-full border border-white/20 p-2 backdrop-blur-sm pointer-events-auto flex items-center justify-center">
        {/* Up */}
        <button
          onPointerDown={() => handleKeyStart('KeyW')}
          onPointerUp={() => handleKeyEnd('KeyW')}
          onPointerLeave={() => handleKeyEnd('KeyW')}
          className="absolute top-1.5 w-11 h-11 bg-zinc-800/80 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Down */}
        <button
          onPointerDown={() => handleKeyStart('KeyS')}
          onPointerUp={() => handleKeyEnd('KeyS')}
          onPointerLeave={() => handleKeyEnd('KeyS')}
          className="absolute bottom-1.5 w-11 h-11 bg-zinc-800/80 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white"
        >
          <ArrowDown className="w-5 h-5" />
        </button>

        {/* Left */}
        <button
          onPointerDown={() => handleKeyStart('KeyA')}
          onPointerUp={() => handleKeyEnd('KeyA')}
          onPointerLeave={() => handleKeyEnd('KeyA')}
          className="absolute left-1.5 w-11 h-11 bg-zinc-800/80 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Right */}
        <button
          onPointerDown={() => handleKeyStart('KeyD')}
          onPointerUp={() => handleKeyEnd('KeyD')}
          onPointerLeave={() => handleKeyEnd('KeyD')}
          className="absolute right-1.5 w-11 h-11 bg-zinc-800/80 active:bg-amber-600 rounded-lg border border-white/30 flex items-center justify-center text-white"
        >
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* Right: Action Buttons */}
      <div className="flex flex-col gap-2.5 items-end pointer-events-auto">
        <div className="flex gap-2">
          {/* Inventory */}
          <button
            onClick={onOpenInventory}
            className="w-11 h-11 bg-emerald-950/80 active:bg-emerald-600 border border-emerald-400/50 rounded-full flex flex-col items-center justify-center text-emerald-200 text-[10px] shadow"
          >
            <Backpack className="w-4 h-4" />
          </button>
          {/* Map */}
          <button
            onClick={onToggleMiniMap}
            className="w-11 h-11 bg-sky-950/80 active:bg-sky-600 border border-sky-400/50 rounded-full flex flex-col items-center justify-center text-sky-200 text-[10px] shadow"
          >
            <Compass className="w-4 h-4" />
          </button>
          {/* Fireball */}
          <button
            onPointerDown={() => handleKeyStart('KeyF')}
            onPointerUp={() => handleKeyEnd('KeyF')}
            className="w-11 h-11 bg-orange-950/80 active:bg-orange-600 border border-orange-400/50 rounded-full flex flex-col items-center justify-center text-orange-200 text-[10px] shadow"
          >
            <Flame className="w-4 h-4 text-orange-400" />
          </button>
        </div>

        <div className="flex gap-3">
          {/* Guard */}
          <button
            onPointerDown={() => handleKeyStart('Space')}
            onPointerUp={() => handleKeyEnd('Space')}
            onPointerLeave={() => handleKeyEnd('Space')}
            className="w-14 h-14 bg-blue-900/80 active:bg-blue-600 border-2 border-blue-400/70 rounded-full flex flex-col items-center justify-center text-blue-200 text-xs font-bold shadow-lg"
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span className="text-[9px]">GUARD</span>
          </button>

          {/* Attack / Interact Button */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              game.triggerAction();
            }}
            onClick={(e) => {
              e.preventDefault();
              game.triggerAction();
            }}
            className={`w-16 h-16 ${
              isInteractable
                ? 'bg-amber-600/95 active:bg-amber-500 border-amber-300 ring-2 ring-amber-400/50'
                : 'bg-red-800/90 active:bg-red-600 border-red-400/80'
            } border-2 rounded-full flex flex-col items-center justify-center text-white text-xs font-bold shadow-xl transition-all transform active:scale-95`}
          >
            {isInteractable ? (
              <>
                <MessageSquare className="w-6 h-6 mb-0.5 text-amber-100" />
                <span className="text-[10px] text-amber-100 font-extrabold tracking-wider">TALK</span>
              </>
            ) : (
              <>
                <Sword className="w-6 h-6 mb-0.5" />
                <span className="text-[10px]">ATTACK</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
