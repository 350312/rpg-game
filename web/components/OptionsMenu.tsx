import React from 'react';
import { GameEngine } from '../game/engine';
import { sounds } from '../game/sound';
import { X, Volume2, VolumeX, Save, RotateCcw, HelpCircle } from 'lucide-react';

interface OptionsMenuProps {
  game: GameEngine;
  onClose: () => void;
  onRestart: () => void;
}

export const OptionsMenu: React.FC<OptionsMenuProps> = ({ game, onClose, onRestart }) => {
  const [muted, setMuted] = React.useState(sounds.isMuted);
  const [musicVol, setMusicVol] = React.useState(sounds.musicVolume);
  const [seVol, setSEVol] = React.useState(sounds.seVolume);
  const [savedMsg, setSavedMsg] = React.useState(false);

  const handleMuteToggle = () => {
    const isMuted = sounds.toggleMute();
    setMuted(isMuted);
  };

  const handleMusicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setMusicVol(val);
    sounds.setMusicVolume(val);
  };

  const handleSEChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setSEVol(val);
    sounds.setSEVolume(val);
  };

  const handleSave = () => {
    game.saveGame();
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2500);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in"
    >
      {/* 1. Global Floating Corner Close Button */}
      <button
        onClick={onClose}
        className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-50 p-2.5 sm:p-3 bg-black/85 active:bg-red-600 hover:bg-red-600 border-2 border-white/50 rounded-full text-white shadow-2xl transition-all transform active:scale-90 flex items-center justify-center cursor-pointer"
        title="Resume Game (ESC)"
        aria-label="Close Menu"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* 2. Modal Box */}
      <div className="bg-zinc-900 border-2 border-white/60 rounded-xl w-full max-w-md max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-white font-mono">
        {/* Fixed Header */}
        <div className="shrink-0 flex justify-between items-center border-b border-white/20 p-3 sm:p-4 bg-zinc-900/95">
          <h2 className="text-base sm:text-lg font-bold text-amber-400 tracking-wide flex items-center gap-2">
            <span>⚙️</span> Game Menu & Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 active:bg-red-600 rounded-lg border border-white/20 transition text-zinc-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer mr-8 sm:mr-0"
          >
            <X className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
          {/* Audio Controls */}
          <div className="bg-black/40 border border-white/10 rounded-lg p-3 flex flex-col gap-3 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-zinc-300 font-bold">Audio Settings</span>
              <button
                onClick={handleMuteToggle}
                className={`p-1.5 rounded flex items-center gap-1 text-xs border transition cursor-pointer active:scale-95 ${
                  muted ? 'bg-red-500/30 border-red-500 text-red-300' : 'bg-white/10 border-white/20 text-zinc-200'
                }`}
              >
                {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{muted ? 'Unmute' : 'Mute'}</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400">
                <span>BGM Music:</span>
                <span>{Math.round(musicVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={musicVol}
                onChange={handleMusicChange}
                className="accent-amber-500 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400">
                <span>Sound Effects:</span>
                <span>{Math.round(seVol * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={seVol}
                onChange={handleSEChange}
                className="accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Gameplay & Movement Controls */}
          <div className="bg-black/40 border border-white/10 rounded-lg p-3 flex flex-col gap-2.5 text-xs">
            <span className="text-zinc-300 font-bold">Movement Speed</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  game.movementSpeedSetting = 'normal';
                  game.onStateChange();
                }}
                className={`py-1.5 px-2 rounded border text-xs font-mono transition cursor-pointer ${
                  game.movementSpeedSetting === 'normal'
                    ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                Normal (Precise)
              </button>
              <button
                onClick={() => {
                  game.movementSpeedSetting = 'brisk';
                  game.onStateChange();
                }}
                className={`py-1.5 px-2 rounded border text-xs font-mono transition cursor-pointer ${
                  game.movementSpeedSetting === 'brisk'
                    ? 'bg-amber-500/30 border-amber-400 text-amber-300 font-bold'
                    : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                }`}
              >
                Brisk (Fast)
              </button>
            </div>
            <p className="text-[10px] text-zinc-400">
              Hold <kbd className="px-1 py-0.5 rounded bg-zinc-800 border border-zinc-600 text-zinc-200">Shift</kbd> anytime to sprint, or tap the center D-pad button on mobile.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSave}
              className="w-full py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{savedMsg ? 'Game Saved Successfully!' : 'Save Game Progress'}</span>
            </button>

            <button
              onClick={onRestart}
              className="w-full py-2 px-4 rounded bg-rose-900/60 hover:bg-rose-800/80 active:bg-rose-700 border border-rose-600 font-bold text-xs text-rose-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Quit to Title Screen</span>
            </button>
          </div>

          {/* Controls Reference */}
          <div className="bg-black/40 border border-white/10 rounded-lg p-3 text-[11px] text-zinc-300 flex flex-col gap-1.5">
            <div className="font-bold text-amber-300 flex items-center gap-1 text-xs">
              <HelpCircle className="w-3.5 h-3.5" /> Controls Reference:
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-zinc-400">
              <div><span className="text-zinc-200 font-bold">W, A, S, D</span> : Move</div>
              <div><span className="text-zinc-200 font-bold">SHIFT</span> : Sprint / Run</div>
              <div><span className="text-zinc-200 font-bold">ENTER</span> : Attack / Talk</div>
              <div><span className="text-zinc-200 font-bold">SPACE</span> : Raise Shield</div>
              <div><span className="text-zinc-200 font-bold">F</span> : Cast Fireball</div>
              <div><span className="text-zinc-200 font-bold">C</span> : Inventory & Stats</div>
              <div><span className="text-zinc-200 font-bold">X</span> : Toggle Minimap</div>
              <div><span className="text-zinc-200 font-bold">ESC</span> : Menu / Pause</div>
            </div>
          </div>
        </div>

        {/* 3. Bottom Close Action Bar */}
        <div className="shrink-0 border-t border-white/20 p-2.5 sm:p-3 bg-zinc-950 flex justify-between items-center text-xs">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Press [ESC] to resume</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2 px-6 bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 active:text-white text-zinc-200 font-bold rounded-lg border border-white/20 transition flex items-center justify-center gap-2 text-xs shadow cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Resume Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
