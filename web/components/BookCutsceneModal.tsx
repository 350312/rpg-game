import React, { useEffect, useState } from 'react';
import { GameEngine } from '../game/engine';
import { CAMPUS_PROP_SPRITES } from '../game/assets';
import { GameState } from '../game/types';
import { sounds } from '../game/sound';
import { BookOpen, Sparkles, Compass, X } from 'lucide-react';

interface BookCutsceneModalProps {
  game: GameEngine;
  onEnterMonpura: () => void;
  onCancel: () => void;
}

export const BookCutsceneModal: React.FC<BookCutsceneModalProps> = ({
  game: _game,
  onEnterMonpura,
  onCancel,
}) => {
  const [step, setStep] = useState<0 | 1 | 2>(0);

  const advanceStep = () => {
    if (step === 0) {
      sounds.playSE('speak');
      setStep(1);
    } else if (step === 1) {
      sounds.playSE('burning');
      setStep(2);
    } else {
      sounds.playSE('powerup');
      onEnterMonpura();
    }
  };

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Enter' || e.code === 'NumpadEnter' || e.code === 'Space') {
        e.preventDefault();
        advanceStep();
      } else if (e.code === 'Escape' && step < 2) {
        e.preventDefault();
        sounds.playSE('cursor');
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [step]);

  const beats = [
    {
      badge: 'BUP Central Library · North Alcove',
      title: 'MONPURA TALES',
      image: CAMPUS_PROP_SPRITES.book_monpura,
      text: 'Upon the carved reading lectern rests an ancient, emerald-bound manuscript. Dust motes swirl above its cover as golden runes begin to pulse softly to life.',
      cta: 'Open the Book',
    },
    {
      badge: 'Ancient Inscription',
      title: 'THE PAGES AWAKEN',
      image: CAMPUS_PROP_SPRITES.book_open,
      text: 'The parchment glows as ink drifts into the air:\n\n"Across the Bay lies the Isle of Monpura. Three Sacred Seals guard its northern gate, and the Shadow Warden slumbers beneath the Sunken Ruins. Reclaim the Heart of Monpura."',
      cta: 'Peer Into the Glow',
    },
    {
      badge: 'A Magical Portal Emerges!',
      title: 'INTO MONPURA ISLAND',
      image: CAMPUS_PROP_SPRITES.portal_blue,
      text: 'A sudden wind rushes through the library! Swirling emerald and azure light erupts from the open tome, pulling you out of BUP Campus into the living world inside Monpura Tales!',
      cta: 'Step Into Monpura',
    },
  ];

  const current = beats[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fade-in">
      {step < 2 && (
        <button
          onClick={() => {
            sounds.playSE('cursor');
            onCancel();
          }}
          className="fixed top-3 right-3 sm:top-5 sm:right-5 z-50 p-2.5 bg-black/85 hover:bg-zinc-800 border border-white/40 rounded-full text-zinc-300 hover:text-white transition cursor-pointer"
          title="Step Back (ESC)"
          aria-label="Close Book"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-950 via-zinc-950 to-emerald-950/80 border-2 border-emerald-400/70 rounded-2xl p-5 sm:p-7 shadow-[0_0_60px_rgba(16,185,129,0.35)] text-white font-mono flex flex-col items-center text-center gap-4 overflow-hidden">
        {/* Step indicator dots */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-emerald-300 bg-emerald-950/70 border border-emerald-400/30 px-3 py-1 rounded-full">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{current.badge}</span>
        </div>

        {/* Visual Centerpiece */}
        <div className="relative flex items-center justify-center my-1">
          <div
            className={`absolute w-32 h-32 rounded-full blur-xl transition-all duration-500 ${
              step === 2
                ? 'bg-sky-400/45 scale-125 animate-pulse'
                : step === 1
                ? 'bg-amber-400/35 scale-110'
                : 'bg-emerald-400/25'
            }`}
          />
          <div className="relative p-4 rounded-2xl bg-black/60 border border-emerald-400/40 shadow-inner">
            <img
              src={current.image}
              alt={current.title}
              className={`w-20 h-20 sm:w-24 sm:h-24 object-contain pixelated ${
                step === 2 ? 'animate-spin' : 'animate-pulse'
              }`}
              style={step === 2 ? { animationDuration: '6s' } : undefined}
            />
            <Sparkles className="w-6 h-6 text-amber-300 absolute -top-2 -right-2 animate-bounce" />
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-amber-200 to-sky-300">
          {current.title}
        </h2>

        <p className="text-xs sm:text-sm text-zinc-200 font-sans leading-relaxed whitespace-pre-line max-w-md">
          {current.text}
        </p>

        {/* Step Progress Dots */}
        <div className="flex items-center gap-2 my-1">
          {[0, 1, 2].map((idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all ${
                idx === step ? 'w-6 bg-emerald-400' : idx < step ? 'w-2.5 bg-emerald-600' : 'w-2.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full mt-1">
          {step < 2 && (
            <button
              onClick={() => {
                sounds.playSE('cursor');
                onCancel();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 border border-white/15 text-zinc-300 text-xs sm:text-sm font-bold transition cursor-pointer active:scale-95"
            >
              Step Back
            </button>
          )}
          <button
            onClick={advanceStep}
            className={`flex-[2] py-3 px-5 rounded-xl font-black text-xs sm:text-sm tracking-wide flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-95 ${
              step === 2
                ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-sky-400 text-slate-950 hover:brightness-110'
                : 'bg-gradient-to-r from-amber-500 to-yellow-400 text-black hover:brightness-105'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{current.cta}</span>
          </button>
        </div>

        <div className="text-[10px] text-zinc-400 font-mono">
          Press [ENTER] to continue
        </div>
      </div>
    </div>
  );
};

void GameState;
