/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  Activity, 
  Coins, 
  Info,
  Calendar
} from "lucide-react";
import { GameState } from "../types";
import { formatCurrency } from "../utils";
import { GPU_PRESETS } from "../data";

interface TrendsAreaProps {
  state: GameState;
}

export const TrendsArea: React.FC<TrendsAreaProps> = ({ state }) => {
  const [selectedGpuForChart, setSelectedGpuForChart] = useState<string>(GPU_PRESETS[0].name);

  return (
    <div id="trends-panel" className="space-y-6">
      
      {/* Title section */}
      <div id="trends-welcome-banner" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80 gap-3">
        <div id="trends-title" className="space-y-1">
          <h2 className="typo-title-md flex items-center gap-2">
            <Activity className="text-emerald-400 w-5 h-5 animate-pulse" />
            赛博华强北 & 闲鱼指数实时价格监控大屏
          </h2>
          <p className="typo-body-regular">
            实时汇总各大代理商及咸鱼成交基准价格。结合今日大盘广播，迅速捕获暴涨潜力和暴跌货源。
          </p>
        </div>

        {/* Global quote view */}
        <div className="text-right">
          <div className="typo-title-xs text-zinc-500 font-mono">今日大盘指数点评：</div>
          <p className="typo-body-regular text-emerald-400 font-medium italic mt-1 bg-emerald-950/20 px-3 py-1.5 rounded-lg border border-emerald-900/20 max-w-sm">
            “{state.todayMarketTalk}”
          </p>
        </div>
      </div>

      {/* Grid: Main stock Board + Interactive mini chart */}
      <div id="trends-detail-grid" className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Ticker Exchange Grid */}
        <div id="ticker-grid-container" className="xl:col-span-2 space-y-4 font-mono">
          <h3 className="typo-title-xs text-zinc-400 font-mono">
            <span>🔴 BASE MARKET TICKERS (基准指导价看板)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GPU_PRESETS.map((preset) => {
              const currentPrice = state.gpuPriceFluctuations[preset.name] || preset.basePrice;
              const history = state.gpuPriceHistories[preset.name] || [preset.basePrice];
              
              // Fluctuation calculation vs yesterday's price
              const prevPrice = history.length > 1 ? history[history.length - 2] : preset.basePrice;
              const percentDiff = ((currentPrice - prevPrice) / prevPrice) * 100;
              const isGain = percentDiff >= 0;

              // Check if currently affected by global events
              const isAffected = state.currentEvent?.affectGpus.includes(preset.name);

              return (
                <button
                  key={preset.name}
                  id={`btn-select-chart-${preset.name.replace(/[\s]/g, "")}`}
                  onClick={() => setSelectedGpuForChart(preset.name)}
                  className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
                    selectedGpuForChart === preset.name
                      ? "bg-zinc-900 border-emerald-500 shadow-md shadow-emerald-500/5"
                      : "bg-zinc-900/30 border-zinc-800/80 hover:bg-zinc-900/60 hover:border-zinc-700"
                  }`}
                >
                  {/* Neon tag indicating active event boost */}
                  {isAffected && (
                    <div className="absolute top-0 right-0 px-2 py-1 bg-rose-500 text-zinc-950 font-black text-xs uppercase tracking-wider animate-pulse rounded-bl">
                      HOT AI
                    </div>
                  )}

                  <div className="flex justify-between items-start font-sans">
                    <div>
                      <span className="typo-mono-tiny">GPU PRESET</span>
                      <h4 className="typo-title-sm text-zinc-100 mt-0.5 group-hover:text-indigo-400 transition-colors">
                        {preset.name}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="typo-mono-tiny">大盘指导价</span>
                      <div className="typo-mono-regular font-bold text-zinc-200 mt-0.5">
                        {formatCurrency(currentPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-zinc-900 flex justify-between items-center text-xs font-sans">
                    <span className="typo-mono-tiny">基准价: {formatCurrency(preset.basePrice)}</span>
                    
                    <span className={`inline-flex items-center gap-0.5 font-bold px-1.5 py-0.5 rounded ${isGain ? 'text-emerald-400 bg-emerald-950/20' : 'text-rose-400 bg-rose-950/20'}`}>
                      {isGain ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isGain ? "+" : ""}{percentDiff.toFixed(1)}%</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Sparkline trend tracker */}
        <div id="chart-sparkline-container" className="border border-zinc-800 bg-zinc-900/30 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5 pb-3 border-b border-zinc-800/80">
            <h3 className="typo-title-xs text-zinc-300 flex items-center gap-1.5 font-mono">
              <Activity className="w-4 h-4 text-indigo-400" />
              <span>走势回溯图：{selectedGpuForChart}</span>
            </h3>
            <p className="typo-body-regular">
              显示从开业第 1 天起，该型号大盘成交价的走势演变历史。
            </p>
          </div>

          {/* Graphical Sparkline with SVG */}
          {(() => {
            const history = state.gpuPriceHistories[selectedGpuForChart] || [1000];
            const maxVal = Math.max(...history, 1000) * 1.05;
            const minVal = Math.min(...history, 1000) * 0.95;
            const diff = maxVal - minVal || 1;

            const height = 150;
            const width = 280;

            // Generate points for SVG
            const pts = history.map((val, idx) => {
              const x = history.length > 1 ? (idx / (history.length - 1)) * width : width / 2;
              const y = height - ((val - minVal) / diff) * height;
              return `${x},${y}`;
            }).join(" ");

            return (
              <div className="space-y-3 py-4">
                <div className="h-[150px] w-full border-b border-l border-zinc-800 relative flex items-end">
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.1)_1px,transparent_1px)] bg-[size:20px_20px]" />
                  
                  {/* Real Time SVG Line */}
                  {history.length > 1 ? (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible z-10">
                      <polyline
                        fill="none"
                        stroke="#10B981"
                        strokeWidth="2"
                        points={pts}
                        className="drop-shadow-[0_2px_8px_rgba(16,185,129,0.2)]"
                      />
                      {/* Last dot marker */}
                      {(() => {
                        const lastX = width;
                        const lastVal = history[history.length - 1];
                        const lastY = height - ((lastVal - minVal) / diff) * height;
                        return (
                          <circle cx={lastX} cy={lastY} r="4" fill="#10B981" className="animate-pulse" />
                        );
                      })()}
                    </svg>
                  ) : (
                    <div className="w-full text-center text-xs text-zinc-600 mb-12 font-sans">
                      第 1 天开业中，暂无历史走势数据
                    </div>
                  )}

                  {/* High and Low indicator */}
                  <div className="absolute top-1 left-2 text-xs font-mono text-zinc-500">
                    High: {formatCurrency(maxVal)}
                  </div>
                  <div className="absolute bottom-1 left-2 text-xs font-mono text-zinc-500">
                    Low: {formatCurrency(minVal)}
                  </div>
                </div>

                <div className="flex justify-between items-center text-xs text-zinc-500 font-mono">
                  <span>DAY 01</span>
                  <span>今日 (第 {state.day} 天)</span>
                </div>
              </div>
            );
          })()}

          {/* Explanation panel */}
          <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 text-xs text-zinc-400 space-y-1.5 font-sans leading-relaxed">
            <div className="flex gap-1.5 items-center font-bold text-zinc-300 text-xs text-indigo-400">
              <Info className="w-3.5 h-3.5" />
              <span>商贩指导策略提示</span>
            </div>
            <span>
              当某种显卡显示连续上涨时，散客的报价可能会逐渐提升，但这也意味着闲鱼买家的承接力度极强，是极佳的清仓高价抛售机会。而在下跌行情里，应尽可能放长线深色砍价。
            </span>
          </div>

        </div>

      </div>

    </div>
  );
};
