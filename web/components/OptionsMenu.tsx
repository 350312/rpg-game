import React from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';
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
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border-2 border-white/60 rounded-xl w-full max-w-md p-5 shadow-2xl flex flex-col gap-4 text-white font-mono">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/20 pb-3">
          <h2 className="text-lg font-bold text-amber-400 tracking-wide flex items-center gap-2">
            ⚙️ Game Menu & Settings
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition text-zinc-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Audio Controls */}
        <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 flex flex-col gap-3 text-xs">
          <div className="flex justify-between items-center">
            <span className="text-zinc-300 font-bold">Audio Settings</span>
            <button
              onClick={handleMuteToggle}
              className={`p-1.5 rounded flex items-center gap-1 text-xs border transition ${
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

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleSave}
            className="w-full py-2 px-4 rounded bg-emerald-600 hover:bg-emerald-500 font-bold text-xs text-white transition flex items-center justify-center gap-2 shadow"
          >
            <Save className="w-4 h-4" />
            <span>{savedMsg ? 'Game Saved Successfully!' : 'Save Game Progress'}</span>
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2 px-4 rounded bg-rose-900/60 hover:bg-rose-800/80 border border-rose-600 font-bold text-xs text-rose-200 transition flex items-center justify-center gap-2"
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
            <div><span className="text-zinc-200 font-bold">ENTER</span> : Attack / Talk</div>
            <div><span className="text-zinc-200 font-bold">SPACE</span> : Raise Shield</div>
            <div><span className="text-zinc-200 font-bold">F</span> : Cast Fireball</div>
            <div><span className="text-zinc-200 font-bold">C</span> : Inventory & Stats</div>
            <div><span className="text-zinc-200 font-bold">X</span> : Toggle Minimap</div>
            <div><span className="text-zinc-200 font-bold">ESC</span> : Menu / Pause</div>
          </div>
        </div>
      </div>
    </div>
  );
};
