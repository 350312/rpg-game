import React from 'react';
import { GameEngine } from '../game/engine';
import { GameState } from '../game/types';
import { sounds } from '../game/sound';

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
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl bg-black/90 border-2 border-white/80 rounded-xl p-5 shadow-2xl backdrop-blur-md cursor-pointer select-none z-30 transition transform hover:scale-[1.01]"
    >
      {/* Speaker Name Tag */}
      {game.dialogueSpeaker && (
        <div className="absolute -top-3.5 left-6 bg-amber-500 text-black font-bold text-xs px-3 py-0.5 rounded shadow border border-amber-300 tracking-wider uppercase font-mono">
          {game.dialogueSpeaker}
        </div>
      )}

      {/* Message Text */}
      <div className="text-white text-base md:text-lg leading-relaxed whitespace-pre-line font-mono min-h-[3rem] mt-1">
        {game.dialogueText}
      </div>

      {/* Advance Indicator */}
      <div className="flex justify-end items-center gap-1.5 text-xs text-amber-400 font-mono mt-3 animate-pulse">
        <span>Click or Press [ENTER]</span>
        <span className="text-base">▼</span>
      </div>
    </div>
  );
};
