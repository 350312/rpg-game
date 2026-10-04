import React from 'react';
import { GameEngine } from '../game/engine';
import { MAP_CONFIGS } from '../game/maps';
import { Backpack, Compass, Settings, Shield, Sword } from 'lucide-react';

interface HUDProps {
  game: GameEngine;
  onOpenInventory: () => void;
  onOpenOptions: () => void;
  onToggleMiniMap: () => void;
}

export const HUD: React.FC<HUDProps> = ({ game, onOpenInventory, onOpenOptions, onToggleMiniMap }) => {
  const player = game.player;
  const currentAreaName = MAP_CONFIGS.find((m) => m.id === game.currentMap)?.name || 'Unknown';

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
    <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start pointer-events-none z-10 text-white font-mono">
      {/* Left: Hearts, Mana, Coins, Area */}
      <div className="flex flex-col gap-1.5 bg-black/60 p-2.5 rounded-lg border border-white/20 backdrop-blur-sm pointer-events-auto">
        {/* Hearts */}
        <div className="flex items-center gap-1">
          {hearts.map((src, idx) => (
            <img key={`heart_${idx}`} src={src} alt="HP" className="w-6 h-6 object-contain pixelated" />
          ))}
          <span className="text-xs font-bold text-red-400 ml-1.5">
            {player.life}/{player.maxLife}
          </span>
        </div>

        {/* Mana */}
        <div className="flex items-center gap-1">
          {crystals.map((src, idx) => (
            <img key={`mana_${idx}`} src={src} alt="MP" className="w-5 h-5 object-contain pixelated" />
          ))}
          <span className="text-xs font-bold text-blue-400 ml-1.5">
            {player.mana}/{player.maxMana}
          </span>
        </div>

        {/* Coins & Level */}
        <div className="flex items-center gap-4 text-xs mt-0.5">
          <div className="flex items-center gap-1.5">
            <img src="/res/objects/coin_bronze.png" alt="Coins" className="w-5 h-5 object-contain" />
            <span className="font-bold text-amber-300 text-sm">{player.coin}</span>
          </div>
          <span className="text-zinc-300">
            Lv.<span className="text-amber-400 font-bold">{player.level}</span>
          </span>
          <span className="text-zinc-400 text-[10px]">
            EXP: {player.exp}/{player.nextLevelExp}
          </span>
        </div>

        {/* Area Badge */}
        <div className="text-[11px] text-zinc-300 font-sans tracking-wide border-t border-white/10 pt-1 mt-0.5">
          📍 {currentAreaName}
        </div>
      </div>

      {/* Right: Quick Equipment & Buttons */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Equipment Badges */}
        <div className="hidden sm:flex items-center gap-2 bg-black/60 p-1.5 px-2.5 rounded-lg border border-white/20 backdrop-blur-sm text-xs">
          <div className="flex items-center gap-1" title="Equipped Weapon">
            <Sword className="w-3.5 h-3.5 text-zinc-400" />
            <img src={player.currentWeapon?.icon} alt="Weapon" className="w-6 h-6 object-contain" />
          </div>
          <div className="w-[1px] h-4 bg-white/20" />
          <div className="flex items-center gap-1" title="Equipped Shield">
            <Shield className="w-3.5 h-3.5 text-zinc-400" />
            <img src={player.currentShield?.icon} alt="Shield" className="w-6 h-6 object-contain" />
          </div>
        </div>

        {/* Minimap Toggle */}
        <button
          onClick={onToggleMiniMap}
          className={`p-2 rounded-lg border text-xs flex items-center gap-1 transition ${
            game.miniMapOn
              ? 'bg-amber-500/30 border-amber-400 text-amber-300'
              : 'bg-black/60 border-white/20 text-zinc-300 hover:bg-white/10'
          }`}
          title="Toggle Minimap (X)"
        >
          <Compass className="w-4 h-4" />
          <span className="hidden md:inline">Map [X]</span>
        </button>

        {/* Inventory Button */}
        <button
          onClick={onOpenInventory}
          className="p-2 rounded-lg bg-black/60 border border-white/20 text-zinc-300 hover:bg-white/10 transition text-xs flex items-center gap-1"
          title="Open Inventory (C)"
        >
          <Backpack className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Bag [C]</span>
        </button>

        {/* Options Button */}
        <button
          onClick={onOpenOptions}
          className="p-2 rounded-lg bg-black/60 border border-white/20 text-zinc-300 hover:bg-white/10 transition text-xs flex items-center gap-1"
          title="Game Menu (ESC)"
        >
          <Settings className="w-4 h-4 text-sky-400" />
          <span className="hidden md:inline">Menu</span>
        </button>
      </div>
    </div>
  );
};
