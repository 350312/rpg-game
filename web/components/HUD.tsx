import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { MAP_CONFIGS } from '../game/maps';
import { Backpack, Compass, Settings, Shield, Sword, Maximize, Minimize } from 'lucide-react';

interface HUDProps {
  game: GameEngine;
  onOpenInventory: () => void;
  onOpenOptions: () => void;
  onToggleMiniMap: () => void;
}

export const HUD: React.FC<HUDProps> = ({ game, onOpenInventory, onOpenOptions, onToggleMiniMap }) => {
  const player = game.player;
  const currentAreaName = MAP_CONFIGS.find((m) => m.id === game.currentMap)?.name || 'Unknown';
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  // Calculate hearts (each full heart = 2 life)
  const totalHearts = Math.ceil(player.maxLife / 2);
  const hearts = [];
  for (let i = 0; i < totalHearts; i++) {
    const heartVal = player.life - i * 2;
    if (heartVal >= 2) {
      hearts.push('/res/objects/heart_full.png');
    } else if (heartVal === 1) {
      hearts.push('/res/objects/heart_half.png');
    } else {
      hearts.push('/res/objects/heart_blank.png');
    }
  }

  // Calculate mana crystals
  const crystals = [];
  for (let i = 0; i < player.maxMana; i++) {
    crystals.push(i < player.mana ? '/res/objects/manacrystal_full.png' : '/res/objects/manacrystal_blank.png');
  }

  return (
    <div className="absolute top-0 left-0 right-0 p-2 sm:p-3 flex justify-between items-start pointer-events-none z-10 text-white font-mono select-none">
      {/* Left: Compact, Sleek Status HUD */}
      <div className="flex flex-col gap-1 bg-black/75 p-1.5 sm:p-2 rounded-xl border border-white/20 backdrop-blur-md pointer-events-auto shadow-lg max-w-[240px] sm:max-w-xs transition-all">
        {/* Row 1: Hearts & HP Number */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
            {hearts.map((src, idx) => (
              <img key={`heart_${idx}`} src={src} alt="HP" className="w-4 h-4 sm:w-5 sm:h-5 object-contain pixelated" />
            ))}
          </div>
          <span className="text-[11px] sm:text-xs font-bold text-red-400 shrink-0">
            {player.life}/{player.maxLife}
          </span>
        </div>

        {/* Row 2: Mana Crystals & MP Number */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-0.5 sm:gap-1 flex-wrap">
            {crystals.map((src, idx) => (
              <img key={`mana_${idx}`} src={src} alt="MP" className="w-3.5 h-3.5 sm:w-4 sm:h-4 object-contain pixelated" />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs font-bold text-blue-400 shrink-0">
            {player.mana}/{player.maxMana}
          </span>
        </div>

        {/* Row 3: Coins, Level & Map Location in one clean line */}
        <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-300 pt-0.5 border-t border-white/10 mt-0.5">
          <div className="flex items-center gap-1 font-bold text-amber-300">
            <img src="/res/objects/coin_bronze.png" alt="Coins" className="w-3.5 h-3.5 object-contain" />
            <span>{player.coin}</span>
          </div>
          <span className="text-zinc-400">|</span>
          <span>
            Lv.<span className="text-amber-400 font-bold">{player.level}</span>
          </span>
          <span className="text-zinc-400">|</span>
          <span className="truncate max-w-[70px] sm:max-w-[110px] text-zinc-300 font-sans" title={currentAreaName}>
            📍 {currentAreaName}
          </span>
        </div>
      </div>

      {/* Right: Quick Equipment & Utility Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Equipment Badges (Desktop/Tablet) */}
        <div className="hidden lg:flex items-center gap-2 bg-black/75 p-1.5 px-2.5 rounded-xl border border-white/20 backdrop-blur-md text-xs shadow-lg">
          <div className="flex items-center gap-1" title="Equipped Weapon">
            <Sword className="w-3.5 h-3.5 text-zinc-400" />
            <img src={player.currentWeapon?.icon} alt="Weapon" className="w-5 h-5 object-contain" />
          </div>
          <div className="w-[1px] h-3.5 bg-white/20" />
          <div className="flex items-center gap-1" title="Equipped Shield">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <img src={player.currentShield?.icon} alt="Shield" className="w-5 h-5 object-contain" />
          </div>
        </div>

        {/* Fullscreen Toggle (Mobile Friendly) */}
        <button
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2 rounded-xl bg-black/75 border border-white/20 text-zinc-300 active:bg-white/20 hover:bg-white/10 transition shadow-lg flex items-center justify-center"
          title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4 text-amber-300" /> : <Maximize className="w-4 h-4 text-zinc-300" />}
        </button>

        {/* Minimap Toggle */}
        <button
          onClick={onToggleMiniMap}
          className={`p-1.5 sm:p-2 rounded-xl border text-xs flex items-center gap-1 shadow-lg transition active:scale-95 ${
            game.miniMapOn
              ? 'bg-amber-500/30 border-amber-400 text-amber-300'
              : 'bg-black/75 border-white/20 text-zinc-300 hover:bg-white/10 active:bg-white/20'
          }`}
          title="Toggle Minimap (X)"
        >
          <Compass className="w-4 h-4 text-sky-400" />
          <span className="hidden md:inline">Map</span>
        </button>

        {/* Inventory Button */}
        <button
          onClick={onOpenInventory}
          className="p-1.5 sm:p-2 rounded-xl bg-black/75 border border-white/20 text-zinc-300 hover:bg-white/10 active:bg-white/20 active:scale-95 transition text-xs flex items-center gap-1 shadow-lg"
          title="Open Inventory (C)"
        >
          <Backpack className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Bag</span>
        </button>

        {/* Options Button */}
        <button
          onClick={onOpenOptions}
          className="p-1.5 sm:p-2 rounded-xl bg-black/75 border border-white/20 text-zinc-300 hover:bg-white/10 active:bg-white/20 active:scale-95 transition text-xs flex items-center gap-1 shadow-lg"
          title="Game Menu (ESC)"
        >
          <Settings className="w-4 h-4 text-sky-400" />
          <span className="hidden md:inline">Menu</span>
        </button>
      </div>
    </div>
  );
};
