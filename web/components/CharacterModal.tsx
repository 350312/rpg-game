import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { Item } from '../game/types';
import { sounds } from '../game/sound';
import { Shield, Sword, X, Sparkles, Check } from 'lucide-react';

interface CharacterModalProps {
  game: GameEngine;
  onClose: () => void;
  onUpdate: () => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({ game, onClose, onUpdate }) => {
  const player = game.player;
  const [selectedItem, setSelectedItem] = useState<Item | null>(player.inventory[0] || null);

  const handleItemClick = (item: Item) => {
    sounds.playSE('cursor');
    setSelectedItem(item);
  };

  const handleAction = () => {
    if (!selectedItem) return;

    // Equip Weapon
    if (selectedItem.type === 'weapon') {
      player.currentWeapon = selectedItem;
      sounds.playSE('swingweapon');
      game.addDamageNumber(player.worldX + 24, player.worldY - 10, `Equipped ${selectedItem.name}!`, '#38bdf8');
    }
    // Equip Shield
    else if (selectedItem.type === 'shield') {
      player.currentShield = selectedItem;
      sounds.playSE('parry');
      game.addDamageNumber(player.worldX + 24, player.worldY - 10, `Equipped ${selectedItem.name}!`, '#38bdf8');
    }
    // Use Red Potion
    else if (selectedItem.id === 'potion_red') {
      if (player.life >= player.maxLife) {
        sounds.playSE('blocked');
        return;
      }
      player.life = Math.min(player.maxLife, player.life + (selectedItem.healValue || 5));
      sounds.playSE('powerup');
      game.addDamageNumber(player.worldX + 24, player.worldY - 10, '+5 HP Healed!', '#4ade80');

      if ((selectedItem.amount || 1) > 1) {
        selectedItem.amount = (selectedItem.amount || 1) - 1;
      } else {
        const idx = player.inventory.indexOf(selectedItem);
        if (idx !== -1) {
          player.inventory.splice(idx, 1);
          setSelectedItem(player.inventory[0] || null);
        }
      }
    }
    // Use Tent (rest)
    else if (selectedItem.id === 'tent') {
      player.life = player.maxLife;
      player.mana = player.maxMana;
      sounds.playSE('sleep');
      game.addDamageNumber(player.worldX + 24, player.worldY - 10, 'Rested & Restored!', '#38bdf8');

      if ((selectedItem.amount || 1) > 1) {
        selectedItem.amount = (selectedItem.amount || 1) - 1;
      } else {
        const idx = player.inventory.indexOf(selectedItem);
        if (idx !== -1) {
          player.inventory.splice(idx, 1);
          setSelectedItem(player.inventory[0] || null);
        }
      }
    }

    onUpdate();
  };

  const isEquipped = (item: Item) => {
    return player.currentWeapon?.id === item.id || player.currentShield?.id === item.id;
  };

  const weaponAtk = player.currentWeapon?.attackValue || 1;
  const totalAtk = player.strength * weaponAtk + player.level;
  const shieldDef = player.currentShield?.defenseValue || 1;
  const totalDef = player.dexterity * shieldDef;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in"
    >
      {/* 1. Global Floating Corner Close Button (Always visible on mobile screens) */}
      <button
        onClick={onClose}
        className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-50 p-2.5 sm:p-3 bg-black/85 active:bg-red-600 hover:bg-red-600 border-2 border-white/50 rounded-full text-white shadow-2xl transition-all transform active:scale-90 flex items-center justify-center cursor-pointer"
        title="Close (ESC)"
        aria-label="Close Inventory"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* 2. Modal Box with Fixed Header & Footer */}
      <div className="bg-zinc-900 border-2 border-white/60 rounded-xl w-full max-w-2xl max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-white font-mono">
        {/* Fixed Header */}
        <div className="shrink-0 flex justify-between items-center border-b border-white/20 p-3 sm:p-4 bg-zinc-900/95">
          <h2 className="text-base sm:text-lg font-bold text-amber-400 tracking-wide flex items-center gap-2">
            <span>🛡️</span> Character Status & Inventory
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 active:bg-red-600 rounded-lg border border-white/20 transition text-zinc-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer mr-8 sm:mr-0"
          >
            <X className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Player Stats */}
            <div className="bg-black/40 border border-white/10 rounded-lg p-3.5 flex flex-col gap-2 text-xs">
              <h3 className="font-bold text-sm text-zinc-300 border-b border-white/10 pb-1.5 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Attributes
              </h3>
              <div className="flex justify-between">
                <span className="text-zinc-400">Level:</span>
                <span className="text-amber-300 font-bold">{player.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Life:</span>
                <span className="text-red-400 font-bold">
                  {player.life} / {player.maxLife}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Mana:</span>
                <span className="text-blue-400 font-bold">
                  {player.mana} / {player.maxMana}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Strength:</span>
                <span className="text-orange-300 font-bold">{player.strength}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Dexterity:</span>
                <span className="text-emerald-300 font-bold">{player.dexterity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Attack:</span>
                <span className="text-red-300 font-bold">{totalAtk}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Defense:</span>
                <span className="text-blue-300 font-bold">{totalDef}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">EXP:</span>
                <span className="text-amber-200">
                  {player.exp} / {player.nextLevelExp}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Coins:</span>
                <span className="text-yellow-400 font-bold">{player.coin} G</span>
              </div>

              {/* Currently Equipped */}
              <div className="border-t border-white/10 pt-2 mt-1 flex flex-col gap-1.5">
                <div className="text-[11px] text-zinc-400">Equipped Gear:</div>
                <div className="flex items-center gap-2">
                  <Sword className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-200">{player.currentWeapon?.name || 'None'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-zinc-200">{player.currentShield?.name || 'None'}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Inventory Grid & Details */}
            <div className="flex flex-col gap-3">
              {/* Inventory Slots */}
              <div className="bg-black/40 border border-white/10 rounded-lg p-3">
                <div className="text-xs text-zinc-400 mb-2">Item Bag ({player.inventory.length} items):</div>
                <div className="grid grid-cols-4 gap-2">
                  {player.inventory.map((item, idx) => {
                    const active = selectedItem?.id === item.id;
                    const equipped = isEquipped(item);
                    return (
                      <button
                        key={`inv_${idx}`}
                        onClick={() => handleItemClick(item)}
                        className={`relative aspect-square rounded-lg border flex items-center justify-center p-1.5 transition active:scale-95 ${
                          active
                            ? 'border-amber-400 bg-amber-500/20'
                            : 'border-white/10 bg-black/40 hover:border-white/40'
                        }`}
                      >
                        <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain pixelated" />
                        {/* Amount Badge */}
                        {(item.amount || 1) > 1 && (
                          <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-amber-300">
                            x{item.amount}
                          </span>
                        )}
                        {/* Equipped Badge */}
                        {equipped && (
                          <span className="absolute top-0.5 left-0.5 bg-blue-600 text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Item Detail */}
              {selectedItem ? (
                <div className="bg-black/40 border border-white/10 rounded-lg p-3 flex flex-col justify-between flex-1 text-xs">
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-sm text-amber-300">{selectedItem.name}</span>
                      <span className="text-zinc-500 text-[10px] uppercase tracking-wider">{selectedItem.type}</span>
                    </div>
                    <p className="text-zinc-300 whitespace-pre-line text-[11px] leading-relaxed mb-3">
                      {selectedItem.description}
                    </p>
                  </div>

                  {/* Action Button */}
                  {(selectedItem.type === 'weapon' || selectedItem.type === 'shield' || selectedItem.type === 'consumable') && (
                    <button
                      onClick={handleAction}
                      className="w-full py-2 px-3 rounded bg-amber-600 hover:bg-amber-500 active:bg-amber-400 font-bold text-xs text-black transition shadow active:scale-95 cursor-pointer"
                    >
                      {isEquipped(selectedItem)
                        ? 'Already Equipped'
                        : selectedItem.type === 'weapon' || selectedItem.type === 'shield'
                        ? 'Equip Item'
                        : 'Use Item'}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-black/40 border border-white/10 rounded-lg p-4 flex items-center justify-center text-xs text-zinc-500 flex-1">
                  Select an item to view description
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 3. Bottom Close Action Bar (Always visible at bottom of modal) */}
        <div className="shrink-0 border-t border-white/20 p-2.5 sm:p-3 bg-zinc-950 flex justify-between items-center text-xs">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Press [C] or [ESC] to resume</span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto py-2 px-6 bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 active:text-white text-zinc-200 font-bold rounded-lg border border-white/20 transition flex items-center justify-center gap-2 text-xs shadow cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Close & Return to Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
