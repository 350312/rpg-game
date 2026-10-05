import React, { useState } from 'react';
import { GameEngine } from '../game/engine';
import { Item, GameState } from '../game/types';
import { createItem } from '../game/items';
import { sounds } from '../game/sound';
import { X, Coins } from 'lucide-react';

interface MerchantShopProps {
  game: GameEngine;
  onClose: () => void;
  onUpdate: () => void;
}

export const MerchantShop: React.FC<MerchantShopProps> = ({ game, onClose, onUpdate }) => {
  const [tab, setTab] = useState<'buy' | 'sell'>('buy');
  const [message, setMessage] = useState<string>('Welcome! Looking for fine wares?');

  const merchantItems: Item[] = [
    createItem('potion_red'),
    createItem('axe'),
    createItem('shield_blue'),
    createItem('tent'),
  ];

  const handleBuy = (item: Item) => {
    if (game.player.coin < item.price) {
      sounds.playSE('blocked');
      setMessage('You do not have enough coins for that!');
      return;
    }

    game.player.coin -= item.price;
    const existing = game.player.inventory.find((i) => i.id === item.id);
    if (existing && item.type === 'consumable') {
      existing.amount = (existing.amount || 1) + 1;
    } else {
      game.player.inventory.push(createItem(item.id, 1));
    }

    sounds.playSE('coin');
    setMessage(`Purchased [${item.name}]! He he ha!`);
    onUpdate();
  };

  const handleSell = (item: Item) => {
    // Cannot sell equipped weapon or shield
    if (game.player.currentWeapon?.id === item.id || game.player.currentShield?.id === item.id) {
      sounds.playSE('blocked');
      setMessage('You cannot sell an item you currently have equipped!');
      return;
    }

    const sellPrice = Math.max(1, Math.floor(item.price / 2));
    game.player.coin += sellPrice;

    if ((item.amount || 1) > 1) {
      item.amount = (item.amount || 1) - 1;
    } else {
      const idx = game.player.inventory.indexOf(item);
      if (idx !== -1) {
        game.player.inventory.splice(idx, 1);
      }
    }

    sounds.playSE('coin');
    setMessage(`Sold [${item.name}] for ${sellPrice} coins!`);
    onUpdate();
  };

  const handleClose = () => {
    game.gameState = GameState.PLAY;
    sounds.playMusic('merchant');
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40 flex items-center justify-center p-2 sm:p-4 select-none animate-fade-in"
    >
      {/* 1. Global Floating Corner Close Button */}
      <button
        onClick={handleClose}
        className="fixed top-2.5 right-2.5 sm:top-5 sm:right-5 z-50 p-2.5 sm:p-3 bg-black/85 active:bg-red-600 hover:bg-red-600 border-2 border-white/50 rounded-full text-white shadow-2xl transition-all transform active:scale-90 flex items-center justify-center cursor-pointer"
        title="Leave Shop (ESC)"
        aria-label="Close Shop"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* 2. Modal Box */}
      <div className="bg-zinc-900 border-2 border-amber-500/70 rounded-xl w-full max-w-lg max-h-[92vh] shadow-2xl flex flex-col overflow-hidden text-white font-mono">
        {/* Fixed Header */}
        <div className="shrink-0 flex justify-between items-center border-b border-white/20 p-3 sm:p-4 bg-zinc-900/95">
          <div className="flex items-center gap-2">
            <img src="/res/npc/merchant_down_1.png" alt="Merchant" className="w-8 h-8 object-contain pixelated" />
            <div>
              <h2 className="text-base font-bold text-amber-400">Travelling Merchant</h2>
              <span className="text-[10px] text-zinc-400">Imported Rare Commodities</span>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/10 active:bg-red-600 rounded-lg border border-white/20 transition text-zinc-300 hover:text-white flex items-center gap-1 text-xs cursor-pointer mr-8 sm:mr-0"
          >
            <X className="w-4 h-4 text-red-400" />
            <span className="hidden sm:inline">Close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 flex flex-col gap-3">
          {/* Player Coin Balance */}
          <div className="flex justify-between items-center bg-black/40 border border-white/10 p-2.5 rounded-lg text-xs">
            <span className="text-zinc-400">Your Coin Purse:</span>
            <span className="text-amber-300 font-bold flex items-center gap-1 text-sm">
              <Coins className="w-4 h-4 text-amber-400" /> {game.player.coin} Coins
            </span>
          </div>

          {/* Tabs: Buy / Sell */}
          <div className="flex border-b border-white/20 gap-2">
            <button
              onClick={() => {
                setTab('buy');
                sounds.playSE('cursor');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-t transition cursor-pointer active:scale-95 ${
                tab === 'buy' ? 'bg-amber-600 text-black' : 'text-zinc-400 hover:text-white bg-black/30'
              }`}
            >
              Buy Items
            </button>
            <button
              onClick={() => {
                setTab('sell');
                sounds.playSE('cursor');
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-t transition cursor-pointer active:scale-95 ${
                tab === 'sell' ? 'bg-amber-600 text-black' : 'text-zinc-400 hover:text-white bg-black/30'
              }`}
            >
              Sell Items
            </button>
          </div>

          {/* Item List */}
          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {tab === 'buy' ? (
              merchantItems.map((item) => (
                <div
                  key={`buy_${item.id}`}
                  className="bg-black/40 border border-white/10 hover:border-amber-400/50 p-2.5 rounded-lg flex items-center justify-between text-xs transition"
                >
                  <div className="flex items-center gap-2.5">
                    <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain pixelated" />
                    <div>
                      <div className="font-bold text-zinc-100">{item.name}</div>
                      <div className="text-[10px] text-zinc-400">{item.description.split('\n')[1] || item.description}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleBuy(item)}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-500 active:bg-amber-400 text-black font-bold rounded text-xs transition flex items-center gap-1 shadow cursor-pointer active:scale-95"
                  >
                    <span>Buy</span>
                    <span className="text-[11px] text-amber-950 font-mono font-bold">({item.price}g)</span>
                  </button>
                </div>
              ))
            ) : (
              game.player.inventory.map((item, idx) => {
                const sellPrice = Math.max(1, Math.floor(item.price / 2));
                return (
                  <div
                    key={`sell_${item.id}_${idx}`}
                    className="bg-black/40 border border-white/10 hover:border-emerald-400/50 p-2.5 rounded-lg flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={item.icon} alt={item.name} className="w-8 h-8 object-contain pixelated" />
                      <div>
                        <div className="font-bold text-zinc-100">
                          {item.name} {(item.amount || 1) > 1 ? `x${item.amount}` : ''}
                        </div>
                        <div className="text-[10px] text-zinc-400">{item.type}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleSell(item)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-400 text-black font-bold rounded text-xs transition flex items-center gap-1 shadow cursor-pointer active:scale-95"
                    >
                      <span>Sell</span>
                      <span className="text-[11px] text-emerald-950 font-mono font-bold">({sellPrice}g)</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Merchant Dialogue Line */}
          <div className="bg-black/60 border border-white/10 p-2.5 rounded-lg text-xs text-amber-300 italic">
            "{message}"
          </div>
        </div>

        {/* 3. Bottom Close Action Bar */}
        <div className="shrink-0 border-t border-white/20 p-2.5 sm:p-3 bg-zinc-950 flex justify-between items-center text-xs">
          <span className="text-zinc-400 text-[11px] hidden sm:inline">Press [ESC] to leave shop</span>
          <button
            onClick={handleClose}
            className="w-full sm:w-auto py-2 px-6 bg-zinc-800 hover:bg-zinc-700 active:bg-red-600 active:text-white text-zinc-200 font-bold rounded-lg border border-white/20 transition flex items-center justify-center gap-2 text-xs shadow cursor-pointer active:scale-95"
          >
            <X className="w-4 h-4 text-red-400" />
            <span>Leave Shop & Return to Game</span>
          </button>
        </div>
      </div>
    </div>
  );
};
