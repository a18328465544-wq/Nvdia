/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * StatsLogs.tsx - Advanced Market News & Trade logger for GPU Dealer Simulator
 */

import React from "react";
import { 
  MessageSquare, 
  Terminal, 
  Flame, 
  Coins, 
  Zap, 
  Cpu, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  BadgeInfo,
  Trophy
} from "lucide-react";
import { GameLog } from "../types";

interface StatsLogsProps {
  logs: GameLog[];
}

export const StatsLogs: React.FC<StatsLogsProps> = ({ logs }) => {
  
  // Custom categorization helper for log items to implement premium, authentic "monitoring console" vibes
  const getLogCategory = (log: GameLog) => {
    const text = log.text;
    const type = log.type;

    // 0. Achievement check (成就解锁) - high precedence
    if (type === "achievement" || text.includes("【成就：")) {
      return {
        category: "achievement" as const,
        label: "品牌成就",
        badgeClass: "bg-amber-500/20 border-amber-500/40 text-amber-400 font-extrabold text-[10px] sm:text-xs px-1.5 py-0.5 rounded border uppercase tracking-wider animate-pulse",
        cardClass: "border-amber-500/40 bg-amber-950/10 text-zinc-200 hover:border-amber-400/60 hover:bg-amber-950/20 shadow-[inset_0_0_12px_rgba(245,158,11,0.08)]",
        iconClass: "text-amber-400 p-1 bg-amber-950/40 border border-amber-900/40 rounded-lg animate-pulse",
        dayClass: "text-amber-400 bg-amber-950/40 border-amber-900/40 font-black",
        timeClass: "text-amber-500/50"
      };
    }

    // 1. Catastrophic / Severe Loss (惨败 / 爆雷 / 物理冒烟 / 纠纷)
    if (
      type === "error" || 
      text.includes("翻车") || 
      text.includes("欺诈") || 
      text.includes("大雷") || 
      text.includes("跑跑翻车") || 
      text.includes("吃哑巴亏") || 
      text.includes("冒烟") || 
      text.includes("报废") || 
      text.includes("扣除") || 
      text.includes("重罚") || 
      text.includes("起诉") || 
      text.includes("焦炭") || 
      text.includes("炭化")
    ) {
      return {
        category: "disaster" as const,
        label: "物理爆雷",
        badgeClass: "bg-red-500/10 border-red-500/30 text-rose-400 font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded border uppercase tracking-wider animate-pulse",
        cardClass: "border-rose-500/30 bg-rose-950/10 text-zinc-200 hover:border-rose-500/60 hover:bg-rose-950/20 shadow-[inset_0_0_12px_rgba(239,68,68,0.08)]",
        iconClass: "text-rose-500 p-1 bg-red-950/40 border border-red-900/30 rounded-lg",
        dayClass: "text-rose-400 bg-rose-950/40 border-rose-900/40 font-black",
        timeClass: "text-rose-500/50"
      };
    }

    // 2. High Profit / Success / Jackpot / Smart Catch (大捷 / 极品神卡 / 识破到手刀)
    if (
      text.includes("大捷") || 
      text.includes("爆出极品") || 
      text.includes("识破骗子") || 
      text.includes("净赚") || 
      text.includes("发大财") || 
      text.includes("祖坟冒烟") || 
      text.includes("诚实守信") || 
      text.includes("神仙卡") || 
      text.includes("大出清") || 
      (type === "success" && text.includes("成功") && !text.includes("拉拢"))
    ) {
      return {
        category: "victory" as const,
        label: "史诗大捷",
        badgeClass: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded border uppercase tracking-wider",
        cardClass: "border-emerald-500/30 bg-emerald-950/10 text-zinc-100 hover:border-emerald-500/50 hover:bg-emerald-950/15 shadow-[0_0_10px_rgba(16,185,129,0.03)_inset]",
        iconClass: "text-emerald-400 p-1 bg-emerald-950/40 border border-emerald-900/30 rounded-lg",
        dayClass: "text-emerald-400 bg-emerald-950/40 border-emerald-900/40 font-black",
        timeClass: "text-emerald-500/50"
      };
    }

    // 3. Special News / Headline Event (市场异动 / 传闻更迭 / 黑市开启)
    if (
      type === "event" || 
      type === "warn" || 
      text.includes("小道头条") || 
      text.includes("深夜黑市") || 
      text.includes("DeepSeek") || 
      text.includes("暴涨") || 
      text.includes("大盘") || 
      text.includes("行情") || 
      text.includes("首发")
    ) {
      return {
        category: "event" as const,
        label: "大盘异动",
        badgeClass: "bg-purple-500/10 border-purple-500/30 text-purple-400 font-bold text-[10px] sm:text-xs px-1.5 py-0.5 rounded border uppercase tracking-wider",
        cardClass: "border-purple-500/30 bg-purple-950/10 text-zinc-200 hover:border-purple-400/50 hover:bg-purple-950/15 shadow-[0_0_12px_rgba(168,85,247,0.03)_inset]",
        iconClass: "text-purple-400 p-1 bg-purple-950/40 border border-purple-900/30 rounded-lg",
        dayClass: "text-purple-400 bg-purple-950/40 border-purple-900/40 font-black",
        timeClass: "text-purple-400/50"
      };
    }

    // 4. Routine operation (日常事务 / 入库检测 / 晨会 / 拉客)
    return {
      category: "routine" as const,
      label: "本地业务",
      badgeClass: "bg-zinc-800/40 border-zinc-700/30 text-zinc-400 text-[10px] sm:text-xs px-1.5 py-0.5 rounded border uppercase tracking-wider",
      cardClass: "border-zinc-900 bg-zinc-950/60 text-zinc-300 hover:border-zinc-800 hover:bg-zinc-900/20",
      iconClass: "text-indigo-400 p-1 bg-indigo-950/20 border border-indigo-900/10 rounded-lg",
      dayClass: "text-zinc-400 bg-zinc-900 border-zinc-800 font-bold",
      timeClass: "text-zinc-500"
    };
  };

  // Compute live logger dashboard statistics
  const countByCategory = (cat: "disaster" | "victory" | "event" | "routine" | "achievement") => {
    return logs.filter(l => getLogCategory(l).category === cat).length;
  };

  const totalLogs = logs.length;
  const numDisasters = countByCategory("disaster");
  const numVictories = countByCategory("victory");
  const numEvents = countByCategory("event");
  const numRoutines = countByCategory("routine");
  const numAchievements = countByCategory("achievement");

  const renderCategoryIcon = (category: "disaster" | "victory" | "event" | "routine" | "achievement") => {
    switch (category) {
      case "disaster":
        return <Flame className="w-3.5 h-3.5" />;
      case "achievement":
        return <Trophy className="w-3.5 h-3.5" />;
      case "victory":
        return <Coins className="w-3.5 h-3.5" />;
      case "event":
        return <Zap className="w-3.5 h-3.5" />;
      default:
        return <Cpu className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div id="logs-panel" className="border border-zinc-800 bg-zinc-950/90 rounded-2xl p-5 flex flex-col h-[550px] md:h-full justify-between shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      
      {/* 💻 System Terminal Header */}
      <div id="logs-header" className="pb-3 border-b border-zinc-900/80 mb-3 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400 animate-pulse" />
            <h3 className="typo-title-xs text-zinc-200 font-mono">
              华强北秘密商战实录
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-xs text-emerald-400 font-mono tracking-widest uppercase">
              LIVE MONITOR
            </span>
          </div>
        </div>

        {/* 📊 Live Terminal Statistics Feed (High-fidelity monitor look) */}
        <div id="logs-monitor-statistics" className="grid grid-cols-5 gap-1 pt-1.5 font-mono text-[9px] sm:text-xs border-t border-zinc-900/50 text-center">
          
          <div className="p-1 px-1 rounded bg-emerald-950/15 border border-emerald-900/20 flex flex-col items-center">
            <span className="text-emerald-500 font-black">大捷 • {numVictories}</span>
            <span className="text-[8px] sm:text-[9px] text-emerald-600 scale-90">VICTORY</span>
          </div>

          <div className="p-1 px-1 rounded bg-amber-950/15 border border-amber-900/25 flex flex-col items-center">
            <span className="text-amber-400 font-black">成就 • {numAchievements}</span>
            <span className="text-[8px] sm:text-[9px] text-amber-500 scale-90">AWARD</span>
          </div>

          <div className="p-1 px-1 rounded bg-red-950/15 border border-red-900/20 flex flex-col items-center">
            <span className="text-rose-500 font-black">爆雷 • {numDisasters}</span>
            <span className="text-[8px] sm:text-[9px] text-rose-600 scale-90">CRITICAL</span>
          </div>

          <div className="p-1 px-1 rounded bg-purple-950/15 border border-purple-900/20 flex flex-col items-center">
            <span className="text-purple-400 font-black">异动 • {numEvents}</span>
            <span className="text-[8px] sm:text-[9px] text-purple-600 scale-90">EVENTS</span>
          </div>

          <div className="p-1 px-1 rounded bg-zinc-900/30 border border-zinc-800/50 flex flex-col items-center">
            <span className="text-zinc-400 font-black">日常 • {numRoutines}</span>
            <span className="text-[8px] sm:text-[9px] text-zinc-500 scale-90">ROUTINE</span>
          </div>

        </div>
      </div>

      {/* Log Feed Console Scroll Section */}
      <div 
        id="logs-feed-container" 
        className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-zinc-800 hover:scrollbar-thumb-zinc-700 font-sans text-xs"
      >
        {totalLogs === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-650 italic py-16 text-center space-y-2">
            <Activity className="w-6 h-6 text-zinc-800 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-zinc-500">主板总线监听器已就绪</span>
            <p className="text-xs text-zinc-600 font-sans px-4">
              未检测到任何市场风波，拉客或购买显卡后即可在此监听详细事务日志！
            </p>
          </div>
        ) : (
          logs.map((log) => {
            const config = getLogCategory(log);

            return (
              <div 
                key={log.id} 
                id={`log-item-${log.id}`}
                className={`p-3 rounded-xl border leading-relaxed transition-all hover:bg-zinc-950 flex gap-2.5 items-start ${config.cardClass}`}
              >
                {/* Custom Category Icon with styled container background */}
                <div className={`shrink-0 select-none mt-0.5 ${config.iconClass}`}>
                  {renderCategoryIcon(config.category)}
                </div>
                
                <div className="flex-1 space-y-1">
                  {/* Meta tag line */}
                  <div className="flex items-center justify-between font-mono text-xs">
                    <div className="flex items-center gap-1.5 text-zinc-500 font-bold">
                      <span className={`px-1 py-0.2 rounded text-xs font-black ${config.dayClass}`}>
                        DAY {String(log.day).padStart(2, "0")}
                      </span>
                      <span>•</span>
                      <span className={config.timeClass}>{log.time}</span>
                    </div>

                    <span className={config.badgeClass}>
                      {config.label}
                    </span>
                  </div>
                  
                  {/* Message body */}
                  <p className="text-zinc-200 leading-relaxed text-xs font-sans">
                    {log.text}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Monitor Footer (Meme / Hardware Dealer Wisdom) */}
      <div id="logs-footer-credit" className="mt-3 border-t border-zinc-900/60 pt-2.5 flex items-center justify-between text-xs text-zinc-650 font-mono">
        <span className="text-xs text-zinc-500">BUS CAP: {totalLogs} LOGS REGISTERED</span>
        <span className="text-xs text-zinc-500">VITE_DEV_CLOCK // 3000hz</span>
      </div>

    </div>
  );
};
