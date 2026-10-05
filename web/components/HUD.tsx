import React, { useState, useEffect } from 'react';
import { GameEngine } from '../game/engine';
import { MAP_CONFIGS } from '../game/maps';
import { Backpack, Compass, Settings, Shield, Sword, Maximize, Minimize, Building2, CheckCircle2, MapPin, X } from 'lucide-react';

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
  const [showLandmarksModal, setShowLandmarksModal] = useState(false);

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
    <div
      className="absolute top-0 left-0 right-0 flex justify-between items-start pointer-events-none z-10 text-white font-mono select-none"
      style={{
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
        paddingLeft: 'max(0.75rem, env(safe-area-inset-left))',
        paddingRight: 'max(0.75rem, env(safe-area-inset-right))',
      }}
    >
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
          {(() => {
            const loc = game.getLocationInfo();
            const count = game.collectedLocations.size;
            return (
              <button
                onClick={() => setShowLandmarksModal(!showLandmarksModal)}
                className="flex items-center gap-1 truncate max-w-[120px] sm:max-w-[160px] text-zinc-200 font-sans font-medium hover:text-emerald-300 transition text-left cursor-pointer active:scale-95"
                title={`${loc.name} - ${loc.subtitle}\nClick to view Campus Buildings Guide`}
              >
                <span className="truncate">{loc.icon} {loc.name}</span>
                <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono shrink-0">
                  {count}/4
                </span>
              </button>
            );
          })()}
        </div>
      </div>

      {/* Campus Buildings & Locations Guide Modal */}
      {showLandmarksModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-auto">
          <div className="bg-zinc-950/95 border border-white/20 rounded-2xl p-4 sm:p-6 w-full max-w-md shadow-2xl text-white font-sans animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base sm:text-lg text-emerald-400 tracking-wide font-mono">
                  CAMPUS LOCATIONS & BUILDINGS
                </h3>
              </div>
              <button
                onClick={() => setShowLandmarksModal(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-300 mb-3 font-mono">
              Explore the campus to discover all 4 major buildings and landmark areas:
            </p>

            <div className="space-y-2 mb-4">
              {game.campusBuildings.map((b) => {
                const isCollected = game.collectedLocations.has(b.name);
                return (
                  <div
                    key={b.id}
                    className={`flex items-start justify-between p-2.5 rounded-xl border transition ${
                      isCollected
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-zinc-900/60 border-white/10 text-zinc-300'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-lg mt-0.5">{b.icon || '🏛️'}</span>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-1.5 font-mono">
                          {b.name}
                          {isCollected && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded font-sans">
                              Discovered
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-zinc-400">{b.fullName}</div>
                      </div>
                    </div>
                    {isCollected ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Special Landmarks */}
            <div className="pt-2 border-t border-white/10 space-y-2 mb-4">
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-300">
                <span className="text-base">🌸</span>
                <div>
                  <div className="font-bold text-emerald-300 font-mono">Central Garden Yard</div>
                  <div className="text-zinc-400">Lush botanical courtyard. The **Hammer** is located here on the lawn!</div>
                </div>
              </div>
              <div className="flex items-start gap-2.5 p-2 rounded-xl bg-zinc-900/40 border border-white/5 text-xs text-zinc-300">
                <span className="text-base">⚔️</span>
                <div>
                  <div className="font-bold text-amber-300 font-mono">Third Place Arena</div>
                  <div className="text-zinc-400">East lakeside pavilion student arena where battle slimes & orc warriors train!</div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-zinc-400 font-mono pt-2 border-t border-white/10">
              <span>Buildings Visited: {game.collectedLocations.size} / 4</span>
              <button
                onClick={() => setShowLandmarksModal(false)}
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

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
