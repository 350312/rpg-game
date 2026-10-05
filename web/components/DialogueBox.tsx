import React from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';
import { sounds } from '../game/sound';
import { X } from 'lucide-react';

interface DialogueBoxProps {
  game: GameEngine;
  onClose: () => void;
}

export const DialogueBox: React.FC<DialogueBoxProps> = ({ game, onClose }) => {
  const advanceDialogue = () => {
    sounds.playSE('cursor');
    game.gameState = GameState.PLAY;
    onClose();
  };

  return (
    <div
      onClick={advanceDialogue}
      className="absolute bottom-2 sm:bottom-5 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl bg-black/92 border-2 border-white/80 rounded-xl p-3 sm:p-5 shadow-2xl backdrop-blur-md cursor-pointer select-none z-30 transition transform hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Speaker Name Tag */}
      {game.dialogueSpeaker && (
        <div className="absolute -top-3 left-4 sm:left-6 bg-amber-500 text-black font-bold text-[10px] sm:text-xs px-2.5 sm:px-3 py-0.5 rounded shadow border border-amber-300 tracking-wider uppercase font-mono">
          {game.dialogueSpeaker}
        </div>
      )}

      {/* Top-Right Close Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          advanceDialogue();
        }}
        className="absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-white active:bg-red-600 active:text-white rounded-lg transition cursor-pointer"
        title="Close Dialogue"
        aria-label="Close Dialogue"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Message Text */}
      <div className="text-white text-xs sm:text-base md:text-lg leading-relaxed whitespace-pre-line font-mono min-h-[2.5rem] mt-0.5 sm:mt-1 pr-6">
        {game.dialogueText}
      </div>

      {/* Advance Indicator */}
      <div className="flex justify-end items-center gap-1.5 text-[10px] sm:text-xs text-amber-400 font-mono mt-1.5 sm:mt-3 animate-pulse">
        <span>Tap to Continue</span>
        <span className="text-sm">▼</span>
      </div>
    </div>
  );
};
