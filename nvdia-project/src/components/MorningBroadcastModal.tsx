/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * MorningBroadcastModal.tsx - Glassmorphism Daily Broadcast & Notification center for GPU Dealer Simulator
 */

import React from "react";
import { 
  Sun, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Newspaper, 
  AlertCircle, 
  Flame, 
  Coins, 
  Coffee, 
  ArrowRight, 
  Sparkles,
  Award
} from "lucide-react";
import { GameState, MarketEvent } from "../types";
import { GPU_PRESETS } from "../data";
import { formatCurrency } from "../utils";

interface MorningBroadcastModalProps {
  day: number;
  quote: string;
  event: MarketEvent | null;
  prices: Record<string, number>;
  onClose: () => void;
}

export const MorningBroadcastModal: React.FC<MorningBroadcastModalProps> = ({
  day,
  quote,
  event,
  prices,
  onClose
}) => {
  // Safe helper to find default preset base price for comparison
  const getTrendIcon = (gpuName: string) => {
    const preset = GPU_PRESETS.find(p => p.name === gpuName);
    if (!preset) return null;
    const currentPrice = prices[gpuName] || preset.basePrice;
    
    if (currentPrice > preset.basePrice) {
      const percentage = Math.round(((currentPrice - preset.basePrice) / preset.basePrice) * 100);
      return (
        <span className="flex items-center gap-0.5 text-emerald-400 font-mono text-[9px] font-bold">
          <TrendingUp className="w-3 h-3 animate-pulse" />
          <span>+{percentage}%</span>
        </span>
      );
    } else if (currentPrice < preset.basePrice) {
      const percentage = Math.round(((preset.basePrice - currentPrice) / preset.basePrice) * 100);
      return (
        <span className="flex items-center gap-0.5 text-rose-400 font-mono text-[9px] font-bold">
          <TrendingDown className="w-3 h-3 animate-pulse" />
          <span>-{percentage}%</span>
        </span>
      );
    }
    return (
      <span className="text-zinc-500 font-mono text-[9px]">
        持平
      </span>
    );
  };

  return (
    <div 
      id="morning-broadcast-backdrop" 
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-45 flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
    >
      <div 
        id="morning-broadcast-glass-card" 
        className="w-full max-w-lg bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-4 sm:p-6 space-y-5 shadow-[0_0_25px_rgba(168,85,247,0.12)] relative overflow-hidden animate-zoomIn max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-850 scrollbar-track-transparent"
      >
        {/* Abstract futuristic glowing light elements */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-purple-600/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
        
        {/* Animated accent gradient line across the top border */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse" />

        {/* 1. Header segment */}
        <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-zinc-100 shadow-md">
              <Sun className="w-5 h-5 animate-spin-slow text-yellow-300" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] font-bold tracking-widest text-[#a855f7] font-mono uppercase bg-purple-500/10 border border-purple-500/20 px-1 py-0.2 rounded">
                  MORNING MEETING
                </span>
                <span className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
              </div>
              <h2 className="text-sm font-black text-zinc-100 font-mono uppercase tracking-tight flex items-baseline gap-1 mt-0.5">
                <span>华强北早间行情内参会</span>
              </h2>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-[10px] text-zinc-500 block">第 30 天结算</span>
            <span className="text-xs font-black text-purple-400 bg-purple-950/20 px-2 py-0.5 rounded border border-purple-900/30">
              第 {day} 天 / 🌤️ 晨出摊
            </span>
          </div>
        </div>

        {/* 2. Headline / Quote of the day */}
        <div className="relative p-3.5 rounded-xl border border-zinc-900 bg-zinc-950/80 shadow-inner flex gap-2.5">
          <Coffee className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce-slow" />
          <div className="space-y-0.5">
            <span className="text-[9px] font-bold font-mono text-zinc-500 uppercase">
              今日老板晨语 LOG / DAILY WISDOM
            </span>
            <p className="text-[11px] text-zinc-300 font-sans italic leading-relaxed">
              “ {quote} ”
            </p>
          </div>
        </div>

        {/* 3. Major Special Event broadcast */}
        {event ? (
          <div className="p-4 rounded-xl border border-purple-500/30 bg-purple-950/15 relative overflow-hidden group space-y-2">
            <div className="absolute top-0 right-0 p-2 text-purple-500/15 pointer-events-none group-hover:scale-110 transition duration-300">
              <Zap className="w-20 h-20" />
            </div>

            <div className="flex items-center gap-2">
              <div className="p-1 bg-purple-500/20 border border-purple-500/30 rounded text-purple-400">
                <Newspaper className="w-3.5 h-3.5" />
              </div>
              <span className="text-[10px] font-black tracking-widest text-[#a855f7] font-mono uppercase">
                ⚠️ [ 特大异动传闻播报 ]
              </span>
            </div>

            <h3 className="text-xs font-black text-zinc-200">
              {event.title}
            </h3>

            <p className="text-[10px] text-zinc-400 leading-relaxed">
              {event.desc}
            </p>

            {/* Event Effect description panel */}
            <div className="p-2 border border-purple-950 bg-zinc-950 text-[10px] font-mono rounded text-purple-300">
              <div className="font-extrabold text-[#a855f7]">💡 突发波动效验：</div>
              <div>{event.effect}</div>
            </div>

            <div className="flex gap-1.5 items-center flex-wrap pt-0.5">
              <span className="text-[9px] text-zinc-500 font-mono">波及卡系列:</span>
              {event.affectGpus.map((gpu, index) => (
                <span 
                  key={index}
                  className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-mono"
                >
                  {gpu}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950 text-[11px] font-sans flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
              <span>今日没有特大海报级市场传闻。大盘稳健运行。</span>
            </div>
            <span className="text-[9px] font-mono text-zinc-600 bg-zinc-900 px-1.5 py-0.2 rounded uppercase shrink-0">STABLE</span>
          </div>
        )}

        {/* 4. GPU Reference price index table preview */}
        <div className="space-y-2">
          <div className="flex items-center justify-between font-mono">
            <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>GPU PRICE INDEX / 显卡最新出摊盘价一览</span>
            </h4>
            <span className="text-[8px] text-zinc-500">
              对照初始参考底价
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 border border-zinc-900 bg-zinc-950 p-2 rounded-xl text-[10px] font-mono max-h-40 overflow-y-auto scrollbar-thin">
            {GPU_PRESETS.map((preset) => {
              const currentPrice = prices[preset.name] || preset.basePrice;
              return (
                <div 
                  key={preset.name}
                  className="flex justify-between items-center bg-zinc-900/30 p-1.5 px-2 rounded-lg border border-zinc-950 hover:border-zinc-800 transition"
                >
                  <span className="text-zinc-300 font-semibold truncate max-w-[120px]">{preset.name}</span>
                  <div className="flex items-center gap-1.5 text-right">
                    <span className="text-zinc-400 font-bold">¥{formatCurrency(currentPrice)}</span>
                    {getTrendIcon(preset.name)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 5. Daily Task guidance banner / Daily advice memo */}
        <div className="p-3 bg-indigo-950/10 border border-indigo-900/10 rounded-xl space-y-1 text-[10px] font-sans">
          <div className="text-indigo-400 font-bold font-mono">📌 晨出摊作战备忘录：</div>
          <p className="text-zinc-400 leading-relaxed font-sans">
            今天你将恢复 <strong className="text-indigo-400">5 点行动车池⚡</strong>。拉客、测试跑甜甜圈、砍价等常规运作都消耗行动力，去隔壁深夜港湾摸金盲盒也耗费步数。精打细算本金配货！
          </p>
        </div>

        {/* 6. Action close button */}
        <button
          id="btn-close-morning-broadcast"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-zinc-100 font-extrabold text-xs tracking-widest shadow-xl shadow-purple-600/10 flex items-center justify-center gap-2 transition active:scale-95"
        >
          <span>拉起卷帘门，出摊迎客！ 🚀</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

      </div>
    </div>
  );
};
