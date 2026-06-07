/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Title Unlock & Award Settlement System for VictoryModal
 */

import React, { useState } from "react";
import { Award, RefreshCw, Trophy, Skull, Share2, Copy, Check, Sparkles, Flame, ShieldAlert, Zap, Compass } from "lucide-react";
import { formatCurrency, getEndingResults } from "../utils";

interface VictoryModalProps {
  cash: number;
  inventoryCost: number;
  day: number;
  reputation: number;
  totalBought: number;
  totalSold: number;
  crashCount: number;
  isFailure: boolean;
  failureReason?: string;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  cash,
  inventoryCost,
  day,
  reputation,
  totalBought,
  totalSold,
  crashCount,
  isFailure,
  failureReason,
  onRestart
}) => {
  const totalAssets = cash + inventoryCost;
  const results = getEndingResults(totalAssets, totalBought, totalSold, crashCount);
  
  const isGoal1Met = totalAssets >= 300000;
  const isGoal2Met = totalSold >= 100;
  const isGoal3Met = reputation >= 100;
  const metGoalsCount = (isGoal1Met ? 1 : 0) + (isGoal2Met ? 1 : 0) + (isGoal3Met ? 1 : 0);
  const isWinner = !isFailure && (metGoalsCount >= 2);

  // Clipboard copies state
  const [copied, setCopied] = useState(false);

  // 1. Compute complete rank score grade (SSS down to D/F)
  let scoreGrade = "D";
  let gradeColor = "text-zinc-400";
  let gradeBg = "bg-zinc-900 border-zinc-800";
  let gradeDesc = "勉强度日。也许你更适合去给黄老板做贴纸线工，别在这担惊受怕了。";

  if (isFailure) {
    scoreGrade = "F";
    gradeColor = "text-rose-500 animate-pulse font-black";
    gradeBg = "bg-rose-950/20 border-rose-900/40";
    gradeDesc = "血本无归！信誉砸地，被买家和市场无情淘汰！";
  } else if (totalAssets >= 1500000 && reputation >= 90) {
    scoreGrade = "SSS";
    gradeColor = "text-yellow-400 font-black drop-shadow-[0_0_12px_rgba(250,204,21,0.5)]";
    gradeBg = "bg-yellow-950/30 border-yellow-500/50 shadow-[0_0_20px_rgba(250,204,21,0.2)]";
    gradeDesc = "赛博之神！已经掌控全部核心定价权，顺丰重配卡车24h专属为您待命！";
  } else if (totalAssets >= 800000 && reputation >= 80) {
    scoreGrade = "SS";
    gradeColor = "text-amber-400 font-extrabold";
    gradeBg = "bg-amber-950/25 border-amber-500/45";
    gradeDesc = "顶级垄断！逆市抄底、对涨跌大势如臂使指的资本家！";
  } else if (totalAssets >= 500000 && reputation >= 75) {
    scoreGrade = "S";
    gradeColor = "text-purple-400 font-bold";
    gradeBg = "bg-purple-950/25 border-purple-500/45";
    gradeDesc = "数码倒爷天花板！信誉奇佳，手起卡落挣足千万美金！";
  } else if (totalAssets >= 300000 && reputation >= 50) {
    scoreGrade = "A";
    gradeColor = "text-indigo-400 font-semibold";
    gradeBg = "bg-indigo-950/25 border-indigo-500/45";
    gradeDesc = "合格华强北商户。虽然中招过几次到手刀，但靠防雷雷达坚守到了曙光。";
  } else if (totalAssets >= 150000) {
    scoreGrade = "B";
    gradeColor = "text-sky-400";
    gradeBg = "bg-sky-950/20 border-sky-500/35";
    gradeDesc = "能挣杯咖啡钱。下次收卡记得连烤3遍甜甜圈以免亏进ICU。";
  } else if (totalAssets >= 80000) {
    scoreGrade = "C";
    gradeColor = "text-teal-400";
    gradeBg = "bg-teal-950/20 border-teal-500/35";
    gradeDesc = "小白收尸。贴吧发个避坑帖可能会被当反面网吧卡案例。";
  }

  // 2. Define the Complete Title Unlocked System
  const titlesDatabase = [
    {
      id: "leather_jacket",
      name: "皮衣刀客·黄仁勋座下首徒",
      emoji: "🧥",
      desc: "精准切刀垄断所有4090/5090核心。华强北甚至为你重新规划了步行街！",
      conditionDesc: "总资产 ≥ 150万 元 且未宣告破产",
      unlocked: totalAssets >= 1500000 && !isFailure,
      color: "border-yellow-500/40 text-yellow-400 bg-yellow-950/20 shadow-[0_0_8px_rgba(234,179,8,0.15)]",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "shua_lord",
      name: "华强北重装卡枭",
      emoji: "📊",
      desc: "逆市洗地，店里堆满了连顺丰卡车都拉不完的黑市大卡，同行看到你都瑟瑟发抖。",
      conditionDesc: "总资产 ≥ 80万 元 且未宣告破产",
      unlocked: totalAssets >= 800000 && !isFailure,
      color: "border-purple-500/40 text-purple-400 bg-purple-950/20 shadow-[0_0_8px_rgba(168,85,247,0.15)]",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "xianyu_scalper",
      name: "华强北防雷倒爷",
      emoji: "🤝",
      desc: "一手老练的压价功底出神入化，隔空能感知 MLCC 电容的水洗盐析。你就是金手指的主宰！",
      conditionDesc: "总资产 ≥ 30万 元 且未宣告破产",
      unlocked: totalAssets >= 300000 && !isFailure,
      color: "border-indigo-500/30 text-indigo-400 bg-indigo-950/20",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "charity_king",
      name: "拼好货电商慈善大亨",
      emoji: "🎁",
      desc: "在狂暴商战里不图财只图大伙高兴。别人赚钱，你搁这给卡友做纯公益硬件大爱！",
      conditionDesc: "总资产 < 15万 元 且未宣告破产",
      unlocked: totalAssets < 150000 && !isFailure,
      color: "border-blue-500/30 text-blue-400 bg-blue-950/20",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "golden_shield",
      name: "100% 纯白信仰招牌",
      emoji: "✨",
      desc: "口碑满分神仙客服！宁可自己吃巨额闷亏，也不对客户瞒藏一丝暗病或水泥假核心！",
      conditionDesc: "最终商家信誉度 = 100",
      unlocked: reputation === 100,
      color: "border-amber-400/50 text-amber-300 bg-amber-950/15 shadow-[0_0_10px_rgba(245,158,11,0.2)] font-bold animate-pulse",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "reputable_merchant",
      name: "贴吧首推避坑大佬",
      emoji: "🛡️",
      desc: "极高的威望！你在卡友群一呼百应，求购小白直接闭眼进货。你的招牌比黄金还显眼。",
      conditionDesc: "最终商家信誉度 ≥ 85",
      unlocked: reputation >= 85,
      color: "border-emerald-500/30 text-emerald-400 bg-emerald-950/15",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "scammer_refuge",
      name: "连夜销号金蝉脱壳狂魔",
      emoji: "🏃",
      desc: "大名高挂在各大数码贴吧黑名单置顶贴。你每天的乐趣就是更换头像和闲鱼账号，名副其实的黑街鬼见愁。",
      conditionDesc: "信誉度 < 25 且未宣告破产",
      unlocked: reputation < 25 && !isFailure,
      color: "border-red-500/30 text-red-400 bg-red-950/10",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "thunder_radar",
      name: "无伤超频·防雷雷达",
      emoji: "🧿",
      desc: "手气玄学拉满，收卡无数却稳如泰山，三十天经营中奇迹般从未发生过一例退货爆雷纠纷！",
      conditionDesc: "收卡记录 ≥ 4次 且最终翻车退款 0 次",
      unlocked: crashCount === 0 && totalBought >= 4,
      color: "border-teal-500/30 text-teal-400 bg-teal-950/15",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "blue_smoke_collector",
      name: "电表倒扣/蓝烟收集巨奖",
      emoji: "⚡",
      desc: "你买的尸体卡跟假药卡足以引雷度劫。上机必冒烟、碰电必跳闸！物理熔毁界的一哥！",
      conditionDesc: "交易或烤机中招翻车 ≥ 4次",
      unlocked: crashCount >= 4,
      color: "border-orange-500/30 text-orange-400 bg-orange-950/15",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    },
    {
      id: "black_market_legend",
      name: "黑市盲盒摸金校尉",
      emoji: "🌌",
      desc: "大半夜戴着猪嘴防爆面罩扎根后巷油毛毡。哪怕淘出灌满水泥的模型也依然高高兴兴。赌狗到极致！",
      conditionDesc: "收卡总张数 ≥ 8次 (黑市摸金重度依赖)",
      unlocked: totalBought >= 8,
      color: "border-purple-500/30 text-purple-400 bg-purple-950/15",
      lockedColor: "border-zinc-900 text-zinc-600 bg-zinc-950/20 opacity-30"
    }
  ];

  // Pick the most outstanding title the player unlocked
  const unlockedListClean = titlesDatabase.filter(t => t.unlocked);
  const mainTitleFinal = isFailure 
    ? "宣告破产倒闭" 
    : (unlockedListClean.length > 0 ? unlockedListClean[0].name : "普通华强北散商");

  const mainTitleEmoji = isFailure 
    ? "👻" 
    : (unlockedListClean.length > 0 ? unlockedListClean[0].emoji : "📦");

  // ASCII/Unicode Share layout content
  const asciiShareText = `⚡ 【华强北显卡商战 · 毕业战绩卡】 ⚡
-----------------------------------------
🏆 经营总评分：[ ${scoreGrade} ]级 (${isWinner ? "大捷" : isFailure ? "破产" : "结业"})
👑 江湖名称号：${mainTitleEmoji} 【${mainTitleFinal}】
💰 核算总资产：${formatCurrency(totalAssets)}
🤝 诚实信誉度：${reputation} / 100
📦 进收卡总数：${totalBought} 张 | 🛒 卖出卡：${totalSold} 张
☠️ 拷机爆雷数：${crashCount} 次 (${crashCount >= 4 ? "物理冒烟狂魔" : "排雷有方"})

📜 终局江湖评语：
“${isFailure ? ("因" + (failureReason || "信用破产/本金倒扣") + "惨烈清场！") : results.summary}”
-----------------------------------------
💻 甜甜圈烤机不撒谎，小蓝片缝合怪无处藏！
🔥 来 华强北显卡商战 测一测你的倒爷财富段位！`;

  const handleCopyShare = () => {
    try {
      navigator.clipboard.writeText(asciiShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      // Fallback
      alert("复制失败，请手动在底部的分享文本栏复制战绩！");
    }
  };

  return (
    <div id="victory-modal-backdrop" className="fixed inset-0 bg-black/95 backdrop-blur-lg z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Toast Notification for copying */}
      {copied && (
        <div id="toast-copy-success" className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-full border border-emerald-500 bg-zinc-950 text-emerald-400 font-mono text-xs sm:text-sm font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-bounce duration-300">
          <Check className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>📋 战绩复制成功！快发去Q群/贴吧跟卡友炫耀吧！</span>
        </div>
      )}

      <div 
        id="victory-modal-card" 
        className="bg-zinc-950 border border-zinc-900 max-w-2xl w-full rounded-2xl p-4 sm:p-7 space-y-5 shadow-3xl relative overflow-hidden animate-zoomIn max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950"
      >
        
        {/* Neon style colorful backdrop glows */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center space-y-2.5 relative z-10">
          {/* Header Trophy, Medal, or Grave Skull */}
          <div className="flex justify-center">
            {isFailure ? (
              <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 text-3xl animate-pulse">
                <Skull className="w-7 h-7" />
              </div>
            ) : isWinner ? (
              <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center text-yellow-400 text-3xl animate-bounce">
                <Trophy className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 text-3xl animate-ping-slow">
                <Award className="w-7 h-7" />
              </div>
            )}
          </div>

          <div className="space-y-0.5">
            <span className="text-xs text-pink-500 font-black uppercase tracking-widest font-mono flex justify-center items-center gap-1.5">
              <span>{isFailure ? "BANKRUPTCY STATS" : "30-DAY SHANGZHAN ENDING REPORT"}</span>
              <span className="h-1 w-1 bg-pink-500 rounded-full animate-ping" />
            </span>
            <h2 className="typo-title-md text-zinc-100 uppercase">
              {isFailure ? "华强北商战腰折：倒闭惨案" : "三十天战期届满，年终财务清盘！"}
            </h2>
          </div>

          {/* Evaluation Score Plate Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto pt-1 font-mono">
            {/* Level Rank Card */}
            <div className={`p-3 rounded-xl border flex flex-col justify-center items-center gap-1 ${gradeBg}`}>
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">倒爷综合能力段位</span>
              <div className="flex items-baseline gap-1">
                <span className={`text-3xl font-black ${gradeColor}`}>{scoreGrade}</span>
                <span className="text-xs text-zinc-500">级</span>
              </div>
              <span className="text-xs text-zinc-400 font-sans text-center px-1 leading-tight">{gradeDesc}</span>
            </div>

            {/* Main Title Badge Card */}
            <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950 flex flex-col justify-center items-center gap-1 shadow-inner">
              <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">所得江湖终极称号</span>
              <div className="flex items-center gap-1.5 py-1">
                <span className="text-2xl select-none">{mainTitleEmoji}</span>
                <span className="text-sm font-black text-zinc-100 tracking-wide">{mainTitleFinal}</span>
              </div>
              <span className="text-xs text-[#a855f7] bg-purple-500/5 border border-purple-500/10 px-1.5 py-0.5 rounded font-bold">华强北倒影名册已录入</span>
            </div>
          </div>
        </div>

        {/* Narrative comments */}
        <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-900/80 text-xs leading-relaxed italic text-zinc-300 text-center font-sans">
          {isFailure ? (
            <span className="text-rose-400 font-extrabold flex justify-center items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 animate-pulse shrink-0" />
              清算原因：{failureReason || "本金跌零，或者信誉值跌至安全红线 10 以下引发全网起底，实体店面倒闭！"}
            </span>
          ) : (
            `“ ${results.summary} ”`
          )}
        </div>

        {/* 🏆 THE HALL OF MEME TITLES (NEW SEGMENT!) */}
        <div className="space-y-2">
          <h3 className="typo-title-xs text-zinc-500 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-[#a855f7]" />
            <span>THE HALL OF MEME TITLES / 华强北荣誉称号挂牌室</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 border border-zinc-900 bg-zinc-950/40 p-2.5 rounded-xl scrollbar-thin">
            {titlesDatabase.map((title) => {
              const BadgeIcon = title.unlocked ? Check : Zap;
              return (
                <div 
                  key={title.id}
                  className={`p-2.5 rounded-xl border text-xs transition duration-200 flex flex-col gap-1 ${title.unlocked ? title.color : title.lockedColor}`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1 font-mono text-zinc-200">
                      <span>{title.emoji}</span>
                      <span className={title.unlocked ? "text-zinc-100" : "text-zinc-500 font-normal line-through"}>{title.name}</span>
                    </span>
                    <span className={`text-xs font-black uppercase px-1 py-0.2 rounded font-sans shrink-0 ${title.unlocked ? 'bg-zinc-100/10 border border-current text-current' : 'bg-zinc-900 text-zinc-600 border border-zinc-800'}`}>
                      {title.unlocked ? "【已解锁】" : "【锁定】"}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-tight font-sans">
                    {title.desc}
                  </p>
                  <div className="text-xs text-zinc-500 bg-zinc-900/10 p-1 rounded font-mono flex items-center justify-between border border-zinc-900/20 mt-0.5">
                    <span>条件: {title.conditionDesc}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical ledger list */}
        <div className="space-y-2 max-w-2xl font-mono text-xs">
          <h3 className="typo-title-xs text-zinc-500 flex items-center gap-1.5 font-mono">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span>ACCOUNT AUDIT REPORT / 三十天账务明细表</span>
          </h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900/60">
              <span className="text-zinc-500 block text-xs font-bold">手头流动现钞</span>
              <span className="text-xs font-black text-emerald-400 block mt-0.5">{formatCurrency(cash)}</span>
            </div>

            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900/60">
              <span className="text-zinc-500 block text-xs font-bold">压仓货值估价(按成本)</span>
              <span className="text-xs font-black text-zinc-300 block mt-0.5">{formatCurrency(inventoryCost)}</span>
            </div>

            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900/60">
              <span className="text-zinc-500 block text-xs font-bold">收卡成交次数</span>
              <span className="text-xs font-black text-indigo-400 block mt-0.5">{totalBought} 次</span>
            </div>

            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900/60">
              <span className="text-zinc-500 block text-xs font-bold">闲鱼成功出手</span>
              <span className="text-xs font-black text-amber-400 block mt-0.5">{totalSold} 次</span>
            </div>

            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900/60">
              <span className="text-zinc-500 block text-xs font-bold">极品卡烤跑翻车数</span>
              <span className={`text-xs font-black block mt-0.5 ${crashCount > 0 ? 'text-rose-500 font-extrabold animate-pulse' : 'text-zinc-400'}`}>{crashCount} 次</span>
            </div>

            <div className="p-2 rounded-lg bg-zinc-950 border border-zinc-900/60">
              <span className="text-zinc-500 block text-xs font-bold">商家信誉口碑</span>
              <span className="text-xs font-black text-sky-400 block mt-0.5">{reputation} / 100</span>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-zinc-900/20 border border-zinc-900 flex justify-between items-center mt-1">
            <span className="text-zinc-400 block text-xs font-bold uppercase tracking-wider">📊 终盘合计净资产 (流动现金 + 货值估算)</span>
            <span className="text-sm font-black text-emerald-400">{formatCurrency(totalAssets)}</span>
          </div>
        </div>

        {/* 📋 ULTRA COOL SHARE BLOCK (NEW!) */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="typo-title-xs text-zinc-500 flex items-center gap-1.5 font-mono">
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>SHARE CARD PREVIEW / 赛博倒爷纸质战绩卡一键复制</span>
            </h3>

            <button
              id="btn-copy-combat-text"
              onClick={handleCopyShare}
              className="py-1 px-3 text-xs font-bold rounded-lg bg-emerald-600/10 hover:bg-emerald-600 text-emerald-400 hover:text-zinc-950 border border-emerald-500/30 font-mono transition flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>一键复制装杯 🚀</span>
            </button>
          </div>

          <div className="relative rounded-lg overflow-hidden border border-zinc-900 bg-zinc-950 p-2.5 font-mono text-xs leading-relaxed text-zinc-400 select-all whitespace-pre">
            {asciiShareText}
          </div>
        </div>

        {/* Actions layout retry */}
        <div id="modal-footer-actions" className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            id="btn-modal-retry"
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-zinc-100 font-extrabold text-xs sm:text-sm tracking-widest shadow-xl shadow-indigo-600/10 flex items-center justify-center gap-2 transition active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>换手气，重回华强北商战！</span>
          </button>
        </div>

      </div>
    </div>
  );
};

// Simple inline micro icon helper for alert feedback
const AlertTriangle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);
