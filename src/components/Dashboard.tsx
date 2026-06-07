/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { 
  Calendar, 
  Coins, 
  TrendingUp, 
  ShieldCheck, 
  Box, 
  Flame, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw,
  Sparkles
} from "lucide-react";
import { formatCurrency } from "../utils";
import { GameState } from "../types";

interface DashboardProps {
  state: GameState;
  onReset: () => void;
  toggleSound: () => void;
  onShowIntro: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  state, 
  onReset, 
  toggleSound,
  onShowIntro 
}) => {
  const currentAssetSum = state.cash + state.inventory.reduce((sum, item) => sum + item.boughtPrice, 0);
  const initialCash = state.difficulty === "easy" ? 80000 : state.difficulty === "hard" ? 30000 : 50000;
  const netProfit = currentAssetSum - initialCash;
  const isProfitPositive = netProfit >= 0;

  // Inventory count fraction
  const inventoryPercentage = (state.inventory.length / 50) * 100;

  return (
    <div id="stat-dashboard-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border border-zinc-800 bg-zinc-950/80 backdrop-blur-xl rounded-2xl shadow-2xl">
      
      {/* Time and Settings Card */}
      <div id="stat-card-time" className="relative p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all group overflow-hidden">
        <div className="absolute top-0 right-0 p-2 bg-indigo-500/10 text-indigo-400 rounded-bl-xl text-xs font-semibold flex items-center gap-1 border-l border-b border-indigo-500/20">
          <Calendar className="w-3.5 h-3.5" />
          <span>DAY {String(state.day).padStart(2, "0")} / 30</span>
        </div>
        
        <div className="flex flex-col h-full justify-between gap-3">
          <div>
            <div className="typo-title-xs">今日排期</div>
            <div className="typo-title-lg text-zinc-100 flex items-baseline gap-1 mt-1">
              第 <span className="text-indigo-400 font-extrabold">{state.day}</span> 天
              <span className="text-xs text-zinc-400 font-normal">/ 30天</span>
            </div>
          </div>
          
          {/* Operations count progress */}
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-zinc-500 font-medium">今日行动力</span>
              <span className={`typo-mono-regular font-bold ${state.actionsLeft === 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                {state.actionsLeft} / 5
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${
                  state.actionsLeft <= 1 ? "bg-rose-500 animate-pulse" : state.actionsLeft <= 3 ? "bg-amber-400" : "bg-emerald-400"
                }`}
                style={{ width: `${(state.actionsLeft / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cash and Assets Card */}
      <div id="stat-card-assets" className="relative p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all overflow-hidden">
        <div className="absolute top-0 right-0 p-2 bg-emerald-500/10 text-emerald-400 rounded-bl-xl text-xs font-semibold flex items-center gap-1 border-l border-b border-emerald-500/20">
          <Coins className="w-3.5 h-3.5" />
          <span>钱包流动资金</span>
        </div>

        <div className="flex flex-col h-full justify-between gap-2">
          <div>
            <div className="typo-title-xs">流动现金</div>
            <div className="typo-mono-display text-emerald-400 mt-1 truncate">
              {formatCurrency(state.cash)}
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">估算总资产</span>
            <span className="typo-mono-regular font-semibold">
              {formatCurrency(currentAssetSum)}
            </span>
          </div>
        </div>
      </div>

      {/* Profitability and Level Card */}
      <div id="stat-card-profit" className="relative p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all overflow-hidden">
        <div className="absolute top-0 right-0 p-2 bg-amber-500/10 text-amber-400 rounded-bl-xl text-xs font-semibold flex items-center gap-1 border-l border-b border-amber-500/20">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>店铺损益账单</span>
        </div>

        <div className="flex flex-col h-full justify-between gap-2">
          <div>
            <div className="typo-title-xs">累计营收净利</div>
            <div className={`typo-mono-display mt-1 truncate ${isProfitPositive ? 'text-indigo-400' : 'text-rose-500'}`}>
              {isProfitPositive ? "+" : ""}{formatCurrency(netProfit)}
            </div>
          </div>

          <div className="border-t border-zinc-800/80 pt-2 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">目标完成度</span>
            <span className="typo-mono-regular text-indigo-300 font-semibold">
              {Math.min(100, Math.round((currentAssetSum / 300000) * 100))}%
            </span>
          </div>
        </div>
      </div>

      {/* Stats and Inventory Limit Card */}
      <div id="stat-card-reputation" className="relative p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/60 transition-all overflow-hidden col-span-1">
        <div className="absolute top-0 right-0 p-2 bg-red-500/10 text-rose-400 rounded-bl-xl text-xs font-semibold flex items-center gap-1 border-l border-b border-red-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>征信及堆栈</span>
        </div>

        <div className="flex flex-col h-full justify-between gap-3">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="typo-title-xs flex items-center gap-1">
                <span>商家信誉</span>
                {state.reputation >= 80 ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                ) : null}
              </div>
              <div className="typo-mono-display mt-0.5 flex items-baseline gap-1">
                <span className={`${state.reputation >= 70 ? 'text-emerald-400' : state.reputation >= 45 ? 'text-amber-400' : 'text-rose-500 font-black animate-pulse'}`}>
                  {state.reputation}
                </span>
                <span className="text-xs text-zinc-500">/ 100</span>
              </div>
            </div>

            <div className="flex-1">
              <div className="typo-title-xs">库存容量</div>
              <div className="typo-mono-display mt-0.5 flex items-baseline gap-0.5">
                <span className={`${state.inventory.length >= 40 ? 'text-rose-500 font-extrabold animate-pulse' : 'text-zinc-200'}`}>
                  {state.inventory.length}
                </span>
                <span className="text-xs text-zinc-500 font-normal">/ 50 张</span>
              </div>
            </div>
          </div>

          <div>
            <div className="w-full bg-zinc-800 rounded-full h-1 overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${
                  inventoryPercentage >= 80 ? "bg-rose-500" : inventoryPercentage >= 50 ? "bg-amber-400" : "bg-indigo-400"
                }`}
                style={{ width: `${inventoryPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Actions Mini Bar */}
      <div id="stat-dashboard-controls" className="col-span-1 md:col-span-2 lg:col-span-4 flex flex-wrap items-center justify-between border-t border-zinc-800/80 pt-3 mt-1 gap-2">
        <div className="flex items-center gap-2">
          {state.currentEvent ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-md">
              <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
              <span>大盘事件：{state.currentEvent.title}</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-zinc-800 text-zinc-400 border border-zinc-700">
              <Sparkles className="w-3 h-3 text-zinc-500" />
              <span>今日无特殊突发事件</span>
            </span>
          )}
          <span className="text-xs text-zinc-500 font-mono hidden sm:inline-block">
            已交易 {state.totalBought + state.totalSold} 件货 (翻车{state.crashCount}次)
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            id="btn-toggle-sound"
            onClick={toggleSound}
            className="p-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition flex items-center gap-1.5"
            title="切换游戏音效"
          >
            {state.soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-zinc-600" />}
            <span className="text-xs font-medium hidden sm:inline">{state.soundEnabled ? "音效开" : "音效关"}</span>
          </button>

          <button 
            id="btn-show-guide"
            onClick={onShowIntro}
            className="p-1.5 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-xs font-medium hidden sm:inline">新手攻略</span>
          </button>

          <button 
            id="btn-restart-game"
            onClick={onReset}
            className="p-1.5 px-3 rounded-lg border border-zinc-800 bg-rose-950/20 text-xs text-rose-400 border-rose-900/30 hover:bg-rose-900/30 hover:border-rose-700/60 transition flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">重开</span>
          </button>
        </div>
      </div>

    </div>
  );
};
