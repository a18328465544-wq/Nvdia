/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Box, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert, 
  Flame, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Clock,
  ExternalLink,
  Wrench,
  Sparkles,
  Wind
} from "lucide-react";
import { InventoryGpu, GpuCondition, GameState } from "../types";
import { formatCurrency, getConditionAttributes } from "../utils";

interface InventoryAreaProps {
  state: GameState;
  onDetectGpu: (gpuId: string, testType: "quick" | "deep" | "furmark") => void;
  onListToXianyu: (gpuId: string) => void;
  onRepairGpu: (gpuId: string, improvedCondition: GpuCondition, costDiscountPercentage: number, logMessage: string) => void;
}

export const InventoryArea: React.FC<InventoryAreaProps> = ({
  state,
  onDetectGpu,
  onListToXianyu,
  onRepairGpu
}) => {
  const [filterCondition, setFilterCondition] = useState<string>("all");
  const [testModalTarget, setTestModalTarget] = useState<InventoryGpu | null>(null);

  // Repair Mini-game Local States
  const [repairModalTarget, setRepairModalTarget] = useState<InventoryGpu | null>(null);
  const [activeGame, setActiveGame] = useState<"paste" | "dust" | null>(null);
  const [gameStatus, setGameStatus] = useState<"intro" | "playing" | "success" | "failed">("intro");
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameProgress, setGameProgress] = useState<number>(0);
  const [dustSpots, setDustSpots] = useState<{ id: number; x: number; y: number; cleaned: boolean; size: number }[]>([]);
  const [pasteNodes, setPasteNodes] = useState<{ id: number; x: number; y: number; pasted: boolean; label: string }[]>([]);

  // Timer Effect
  useEffect(() => {
    if (activeGame && gameStatus === "playing") {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setGameStatus("failed");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [activeGame, gameStatus]);

  // Start Paste Game
  const startPasteGame = () => {
    const nodes = [
      { id: 1, x: 50, y: 50, pasted: false, label: "芯片中央最烫处 - Core Center" },
      { id: 2, x: 25, y: 30, pasted: false, label: "左上显存颗粒 - VRAM L" },
      { id: 3, x: 75, y: 30, pasted: false, label: "右上显存颗粒 - VRAM R" },
      { id: 4, x: 25, y: 70, pasted: false, label: "莫斯管供电L1 - MOS A" },
      { id: 5, x: 75, y: 70, pasted: false, label: "莫斯管供电L2 - MOS B" },
    ];
    setPasteNodes(nodes);
    setGameProgress(0);
    setTimeLeft(10);
    setGameStatus("playing");
    setActiveGame("paste");
  };

  // Start Dust Game
  const startDustGame = () => {
    const spots = Array.from({ length: 6 }).map((_, i) => ({
      id: i,
      x: 20 + Math.random() * 60, // 20% to 80% boundary
      y: 20 + Math.random() * 60,
      cleaned: false,
      size: 16 + Math.round(Math.random() * 12)
    }));
    setDustSpots(spots);
    setGameProgress(0);
    setTimeLeft(10);
    setGameStatus("playing");
    setActiveGame("dust");
  };

  // Handle click on Dust spot
  const handleCleanDust = (id: number) => {
    const updated = dustSpots.map(s => {
      if (s.id === id) return { ...s, cleaned: true };
      return s;
    });
    setDustSpots(updated);
    const cleanedCount = updated.filter(s => s.cleaned).length;
    const progress = Math.round((cleanedCount / updated.length) * 100);
    setGameProgress(progress);
    if (progress >= 100) {
      handleSuccess("dust");
    }
  };

  // Handle click on Paste node
  const handleApplyPaste = (id: number) => {
    const updated = pasteNodes.map(n => {
      if (n.id === id) return { ...n, pasted: true };
      return n;
    });
    setPasteNodes(updated);
    const pastedCount = updated.filter(n => n.pasted).length;
    const progress = Math.round((pastedCount / updated.length) * 100);
    setGameProgress(progress);
    if (progress >= 100) {
      handleSuccess("paste");
    }
  };

  // Trigger win of game
  const handleSuccess = (type: "paste" | "dust") => {
    if (!repairModalTarget) return;
    setGameStatus("success");

    // Upgrade the condition
    let originalCondition = repairModalTarget.condition;
    let improvedCondition = originalCondition;

    if (originalCondition === GpuCondition.Corpse) {
      improvedCondition = GpuCondition.Repaired;
    } else if (originalCondition === GpuCondition.Repaired) {
      improvedCondition = GpuCondition.PersonalUse;
    } else if (originalCondition === GpuCondition.Miner) {
      improvedCondition = GpuCondition.PersonalUse;
    } else if (originalCondition === GpuCondition.Netbar) {
      improvedCondition = GpuCondition.PersonalUse;
    } else if (originalCondition === GpuCondition.PersonalUse) {
      improvedCondition = GpuCondition.BrandNew;
    }

    const gameLabel = type === "paste" ? "【硅脂精密涂抹】" : "【微型风扇除尘】";
    
    // Calculate estimated value difference based on original condition vs improved
    const originalAttrs = getConditionAttributes(originalCondition);
    const improvedAttrs = getConditionAttributes(improvedCondition);
    const currentMarketRef = state.gpuPriceFluctuations[repairModalTarget.name] || repairModalTarget.boughtPrice;
    
    const originalWorth = Math.round(currentMarketRef * originalAttrs.priceMultiplier);
    const updatedWorth = Math.round(currentMarketRef * improvedAttrs.priceMultiplier);
    const valueBoost = Math.max(200, updatedWorth - originalWorth);

    const logMessage = `【🔧 完美修复手艺！】你顶住手抖时间压力，通过 ${gameLabel} 彻底整配清除了 ${repairModalTarget.name} (SN: ${repairModalTarget.sn.slice(-4)}) 的暗病缺陷！品质成色由元先的 [${originalCondition}] 破茧重组并提升为良好绿标级 [${improvedCondition}]！此卡预售挂牌价评估直接飙涨了近 ¥${valueBoost}，账面底折 25% 使总利润大幅度攀登升级！`;

    onRepairGpu(repairModalTarget.id, improvedCondition, 25, logMessage);
  };

  // Filter inventory
  const filteredInventory = state.inventory.filter((gpu) => {
    if (filterCondition === "all") return true;
    if (filterCondition === "tested") return gpu.isTested;
    if (filterCondition === "untested") return !gpu.isTested;
    if (filterCondition === "defective") return gpu.isTested && gpu.testResult === "有暗病";
    return gpu.condition === filterCondition;
  });

  const handleTestSelection = (testType: "quick" | "deep" | "furmark") => {
    if (!testModalTarget) return;
    
    // Check cost
    let cost = 50;
    if (testType === "deep") cost = 200;
    if (testType === "furmark") cost = 500;

    if (state.cash < cost) {
      alert("老板！你兜里的钱不够做这档检测！多去卖卡或者选便宜一点的检测！");
      return;
    }

    if (state.actionsLeft <= 0) {
      alert("今日行动次数已经归零了！必须点击'下一天'睡觉，才能刷新体力和操作次数！");
      return;
    }

    onDetectGpu(testModalTarget.id, testType);
    setTestModalTarget(null);
  };

  return (
    <div id="inventory-panel" className="space-y-6">
      
      {/* Inventory Header Filter */}
      <div id="inventory-welcome-banner" className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80 gap-3">
        <div id="inventory-header-title" className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Box className="text-sky-400 w-5 h-5" />
            货架库存管理：{state.inventory.length} / 50 张
          </h2>
          <p className="text-xs text-zinc-400">
            你已经收来的货。可以对他们运行深度检测、打上良品标签，免得挂在闲鱼时被买家抓住瑕疵到手刀倒打一耙！
          </p>
        </div>

        {/* Filter selection */}
        <select
          id="inventory-filter-select"
          value={filterCondition}
          onChange={(e) => setFilterCondition(e.target.value)}
          className="bg-zinc-900 text-xs text-zinc-300 rounded px-2.5 py-1.5 border border-zinc-800 focus:outline-none focus:border-indigo-500 font-medium"
        >
          <option value="all">分类：全部货品</option>
          <option value="untested">未检测的卡</option>
          <option value="tested">已做过检测的卡</option>
          <option value="defective">已确认为暗病的卡</option>
          <option value={GpuCondition.BrandNew}>{GpuCondition.BrandNew}</option>
          <option value={GpuCondition.PersonalUse}>{GpuCondition.PersonalUse}</option>
          <option value={GpuCondition.Miner}>{GpuCondition.Miner}</option>
          <option value={GpuCondition.Netbar}>{GpuCondition.Netbar}</option>
          <option value={GpuCondition.Repaired}>{GpuCondition.Repaired}</option>
        </select>
      </div>

      {/* Grid of stock */}
      {filteredInventory.length === 0 ? (
        <div id="empty-inventory-state" className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-center space-y-4">
          <div className="text-4xl">📦</div>
          <div className="space-y-1">
            <h3 className="text-zinc-200 font-bold text-sm">此分类下没有任何显卡</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              你目前可能还没有买到任何符合该条件的显卡。赶快去操作面板的“去市场收卡”囤点货吧，低进高出才是王道！
            </p>
          </div>
        </div>
      ) : (
        <div id="inventory-grid" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredInventory.map((gpu) => {
            const condAttrs = getConditionAttributes(gpu.condition);
            const currentMarketRef = state.gpuPriceFluctuations[gpu.name] || gpu.boughtPrice;
            const marketValueAdjusted = Math.round(currentMarketRef * condAttrs.priceMultiplier);
            const priceDifference = marketValueAdjusted - gpu.boughtPrice;
            const isProfitable = priceDifference > 0;

            return (
              <div 
                key={gpu.id}
                id={`inventory-card-${gpu.id}`}
                className="relative border border-zinc-800 bg-zinc-900/10 rounded-xl p-4.5 hover:border-sky-500/20 hover:bg-zinc-900/30 transition-all flex flex-col justify-between gap-4"
              >
                {/* Condition and SN row */}
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] text-zinc-500 font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-zinc-600" />
                    <span>第 {gpu.boughtDay} 天买盘入库</span>
                  </span>
                  
                  <span className={`text-[10px] px-2 py-0.5 rounded border ${condAttrs.badgeColor}`}>
                    {gpu.condition}
                  </span>
                </div>

                {/* Card Title */}
                <div>
                  <h3 className="text-sm font-extrabold text-zinc-200 tracking-tight">
                    {gpu.name}
                  </h3>
                  <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                    {gpu.sn}
                  </div>
                </div>

                {/* Price Ledger Panel */}
                <div className="p-3 bg-zinc-950/60 border border-zinc-900 rounded-lg font-mono text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">吃货成本价：</span>
                    <span className="text-zinc-300 font-bold">{formatCurrency(gpu.boughtPrice)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-zinc-500">今日参考市价：</span>
                    <span className="text-zinc-300 font-medium">{formatCurrency(marketValueAdjusted)}</span>
                  </div>

                  <div className="border-t border-zinc-900 pt-1.5 flex justify-between">
                    <span className="text-zinc-500">预估市价波动：</span>
                    <span className={`font-semibold flex items-center gap-0.5 ${isProfitable ? "text-emerald-400" : "text-rose-400"}`}>
                      {isProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>{isProfitable ? "+" : ""}{formatCurrency(priceDifference)}</span>
                    </span>
                  </div>
                </div>

                {/* Diagnostic Tested Status Ribbon */}
                <div className="flex items-center justify-between text-xs py-2 px-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <span className="text-zinc-500 font-sans">检测报告</span>
                  {gpu.isTested ? (
                    gpu.testResult === "有暗病" ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                        <span>确认有暗病！</span>
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                        <span>检测良好</span>
                      </span>
                    )
                  ) : (
                    <span className="text-zinc-500 flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-zinc-600" />
                      <span>未检测已封签</span>
                    </span>
                  )}
                </div>

                 {/* Action Buttons */}
                 <div className="flex gap-2.5">
                   {gpu.isTested && gpu.testResult === "有暗病" ? (
                     <button
                       id={`btn-open-repair-${gpu.id}`}
                       onClick={() => {
                         setRepairModalTarget(gpu);
                         setActiveGame(null);
                         setGameStatus("intro");
                       }}
                       className="flex-1 py-1.5 rounded-lg border border-amber-500/30 bg-amber-950/50 hover:bg-amber-900/40 font-bold text-xs text-amber-400 text-center transition flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.15)] hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] animate-pulse"
                     >
                       <span>⚙️ 手动修理暗病</span>
                     </button>
                   ) : (
                     <button
                       id={`btn-open-diagnostic-${gpu.id}`}
                       onClick={() => setTestModalTarget(gpu)}
                       disabled={state.actionsLeft <= 0}
                       className="flex-1 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 hover:border-zinc-700 font-medium text-xs text-zinc-300 text-center transition flex items-center justify-center gap-1 disabled:opacity-40"
                     >
                       <span>🛠️ 跑分烤机</span>
                     </button>
                   )}
 
                   <button
                     id={`btn-list-xianyu-${gpu.id}`}
                     onClick={() => onListToXianyu(gpu.id)}
                     className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white text-center transition flex items-center justify-center gap-1"
                   >
                     <ExternalLink className="w-3.5 h-3.5" />
                     <span>挂闲鱼售卖</span>
                   </button>
                 </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Diagnostics selector modal if target exists */}
      {testModalTarget && (
        <div id="test-modal-backdrop" className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="test-modal-box" className="bg-zinc-950 border border-zinc-800 max-w-md w-full rounded-2xl p-6 space-y-5 animate-fade shadow-2xl">
            <div className="space-y-1.5">
              <h3 className="text-base font-extrabold text-zinc-100 flex items-center gap-2">
                <span>🛠️ 选择显卡检测和双烤深度：</span>
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                目标显卡: {testModalTarget.name} - {testModalTarget.sn} ({testModalTarget.condition})
              </p>
            </div>

            <div className="space-y-3.5">
              
              {/* Option 1 */}
              <button
                id="btn-test-quick"
                onClick={() => handleTestSelection("quick")}
                className="w-full text-left p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all flex justify-between items-center hover:border-sky-500/30 group"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400">1. 普通轻度检测</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">电脑店上机点亮，发现暗病率 40%</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-amber-400 font-bold">¥50</div>
                  <div className="text-zinc-500 text-[10px]">行动点 -1</div>
                </div>
              </button>

              {/* Option 2 */}
              <button
                id="btn-test-deep"
                onClick={() => handleTestSelection("deep")}
                className="w-full text-left p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all flex justify-between items-center hover:border-sky-500/30 group"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400">2. GPU-Z 深度排障</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">拆解抠背板、排查供电飞线，发现暗病率 80%</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-amber-400 font-bold">¥200</div>
                  <div className="text-zinc-500 text-[10px]">行动点 -1</div>
                </div>
              </button>

              {/* Option 3 */}
              <button
                id="btn-test-furmark"
                onClick={() => handleTestSelection("furmark")}
                className="w-full text-left p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 hover:bg-zinc-900/80 transition-all flex justify-between items-center hover:border-sky-500/30 group"
              >
                <div>
                  <div className="text-xs font-bold text-zinc-200 group-hover:text-indigo-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                    <span>3. 甜甜圈+3DMark烤机检测</span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">高负荷满载烤机 30 分钟，发现暗病率 95%</div>
                </div>
                <div className="text-right font-mono text-xs">
                  <div className="text-amber-400 font-bold">¥500</div>
                  <div className="text-zinc-500 text-[10px]">行动点 -1</div>
                </div>
              </button>

            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                id="btn-close-test-modal"
                onClick={() => setTestModalTarget(null)}
                className="px-4 py-2 rounded-lg border border-zinc-800 text-xs text-zinc-400 hover:text-zinc-200 transition"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Repair Mini-game Modal */}
      {repairModalTarget && (
        <div id="repair-modal-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div id="repair-modal-box" className="bg-zinc-950 border border-zinc-800 max-w-lg w-full rounded-2xl p-6 space-y-6 shadow-2xl relative font-sans">
            
            {/* Header */}
            <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
              <div className="space-y-1">
                <div className="text-[10px] text-amber-500 font-mono tracking-widest uppercase flex items-center gap-1.5 font-bold">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>自主维修整备工坊</span>
                </div>
                <h3 className="text-base font-black text-zinc-100">
                  整修宝贝: {repairModalTarget.name}
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  SN: {repairModalTarget.sn} | 状态: {repairModalTarget.condition} ({repairModalTarget.defectType || "核心缩缸风扇故障"})
                </p>
              </div>
              
              {gameStatus !== "playing" && (
                <button
                  id="btn-close-repair-modal"
                  onClick={() => setRepairModalTarget(null)}
                  className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Content Switcher based on gameStatus */}
            {gameStatus === "intro" && (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-900/30 text-xs text-orange-300 space-y-2 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5 text-orange-400">
                    <ShieldAlert className="w-4 h-4" />
                    手艺人翻新红利：
                  </p>
                  <p>
                    将有暗病的显卡在店里手工对症下药修复，不仅可以<strong>拔除烦人的暗病红标</strong>，成色还会得到品质级别的<strong>免费华丽升格</strong> (例如 矿卡 ➡️ 个人自用，尸体 ➡️ 维修卡)！身价售卖上限狂增！
                  </p>
                </div>

                <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider font-mono">选择对症下药的修复方式:</div>

                <div className="grid grid-cols-1 gap-4">
                  {/* Select Game 1 */}
                  <button
                    id="btn-select-game-dust"
                    onClick={startDustGame}
                    className="p-4 rounded-xl border border-zinc-800 hover:border-sky-500/50 bg-zinc-900/30 hover:bg-zinc-900/60 text-left transition flex items-start gap-3.5 group"
                  >
                    <div className="p-3 rounded-xl bg-sky-950/40 text-sky-400 border border-sky-900/50 group-hover:scale-105 transition shrink-0">
                      <Wind className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-200 group-hover:text-sky-400">🔥 方案 A：超声波清尘 & 风扇轴承油脂注入</h4>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        由于长时间挖矿或网吧水洗，风扇轴承严重磨损进灰。在 10 秒钟内用气吹或镊子，迅速点爆主板和扇叶上的 6 颗积尘污垢块，恢复清亮微风！
                      </p>
                    </div>
                  </button>

                  {/* Select Game 2 */}
                  <button
                    id="btn-select-game-paste"
                    onClick={startPasteGame}
                    className="p-4 rounded-xl border border-zinc-800 hover:border-emerald-500/50 bg-zinc-900/30 hover:bg-zinc-900/60 text-left transition flex items-start gap-3.5 group"
                  >
                    <div className="p-3 rounded-xl bg-emerald-950/40 text-emerald-400 border border-emerald-900/50 group-hover:scale-105 transition shrink-0">
                      <Sparkles className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-200 group-hover:text-emerald-400 font-sans">🔥 方案 B：原厂高性能 PTM7951 导热片涂抹</h4>
                      <p className="text-[11px] text-zinc-500 mt-1 leading-relaxed">
                        散热底座硅脂化水，导致烤机秒飙 105℃ 黑屏花屏。在 10 秒内，用硅脂刮刀点击锁定芯片中央及 4 处高热电容/显存热敏区，达到 100% 均匀覆盖！
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Playing Status */}
            {gameStatus === "playing" && (
              <div className="space-y-5 text-center">
                
                {/* Stats panel */}
                <div className="flex justify-between items-center bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/80 font-mono text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">倒计时:</span>
                    <span className={`font-black text-sm tracking-wide ${timeLeft <= 3 ? "text-rose-500 animate-bounce" : "text-amber-400"}`}>
                      ⏱️ {timeLeft} 秒
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span className="text-zinc-500">除垢覆盖进度:</span>
                    <span className="text-emerald-400 font-extrabold text-sm">{gameProgress}%</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-zinc-900 h-2 bg-gradient-to-r rounded-lg overflow-hidden border border-zinc-800/50">
                  <div 
                    className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.5)]"
                    style={{ width: `${gameProgress}%` }}
                  />
                </div>

                {/* Playboard Area */}
                {activeGame === "dust" ? (
                  <div className="space-y-2">
                    <div className="text-[11px] text-zinc-400 italic">【风扇除尘小游戏】用螺丝刀/螺杆鼠标依次狂点并引爆黄色积灰块！</div>
                    <div className="h-48 w-full bg-zinc-900/50 border border-zinc-800/80 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                      {/* Stylized background graphics indicating dual fans */}
                      <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-20">
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-sky-500 animate-spin" style={{ animationDuration: "6s" }} />
                        <div className="w-24 h-24 rounded-full border-4 border-dashed border-sky-500 animate-spin" style={{ animationDuration: "6s" }} />
                      </div>

                      {dustSpots.map((spot) => (
                        <button
                          key={spot.id}
                          id={`dust-button-${spot.id}`}
                          onClick={() => handleCleanDust(spot.id)}
                          disabled={spot.cleaned}
                          style={{
                            left: `${spot.x}%`,
                            top: `${spot.y}%`,
                            width: `${spot.size}px`,
                            height: `${spot.size}px`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer flex items-center justify-center transition-all active:scale-90 ${
                            spot.cleaned
                              ? "opacity-0 scale-50 pointer-events-none duration-500 bg-sky-500"
                              : "bg-yellow-500/20 border border-yellow-500/80 hover:bg-yellow-400/40 hover:scale-110 shadow-[0_0_8px_rgba(234,179,8,0.4)]"
                          }`}
                        >
                          {!spot.cleaned && (
                            <span className="text-[10px] scale-75 font-black text-amber-300">☁️</span>
                          )}
                        </button>
                      ))}

                      {/* Cleanliness visual trigger */}
                      {gameProgress >= 100 && (
                        <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center font-bold text-xs text-emerald-400">
                          ✔️ 清洁度 100%！冷却性能恢复完美！
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-zinc-400 italic">【硅脂精密敷设】按顺序精密点击所有闪灼虚线区域，均匀盖好硅树脂脂垫！</div>
                    <div className="h-48 w-full bg-slate-950 border border-zinc-800/80 rounded-xl relative overflow-hidden flex items-center justify-center p-4">
                      {/* Stylized chip silicon core graphics */}
                      <div className="absolute inset-12 border border-emerald-500/20 bg-zinc-900/10 rounded pointer-events-none flex flex-col items-center justify-center shrink-0">
                        <div className="text-[9px] font-mono text-emerald-500/30 tracking-widest select-none font-bold">NVIDIA / AMD CHIP DIE</div>
                        <div className="w-16 h-16 border border-emerald-500/10 rounded-sm mt-1 animate-pulse" />
                      </div>

                      {pasteNodes.map((node) => (
                        <button
                          key={node.id}
                          id={`paste-node-${node.id}`}
                          onClick={() => handleApplyPaste(node.id)}
                          disabled={node.pasted}
                          style={{
                            left: `${node.x}%`,
                            top: `${node.y}%`,
                          }}
                          className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1.5 rounded-lg text-[9px] font-mono border font-extrabold shadow-md transition-all duration-300 ${
                            node.pasted
                              ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40 shadow-emerald-500/10"
                              : "bg-zinc-900 border-zinc-700 hover:border-emerald-500/50 hover:bg-zinc-800 text-zinc-400 animate-pulse"
                          }`}
                        >
                          <div className="flex flex-col items-center gap-0.5">
                            <span>{node.pasted ? "🔹 已涂填" : "⚪ 待对准"}</span>
                            <span className="scale-75 text-[8px] opacity-60 font-medium whitespace-nowrap">{node.label}</span>
                          </div>
                        </button>
                      ))}

                      {/* Overlap victory banner */}
                      {gameProgress >= 100 && (
                        <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-xs flex items-center justify-center font-bold text-xs text-emerald-400">
                          ✔️ 敷设率 100%！热导率极限爆推！
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Success screen */}
            {gameStatus === "success" && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-900/30 text-emerald-400 border border-emerald-500/50 flex items-center justify-center text-4xl mx-auto animate-bounce shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  🎉
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-emerald-400 uppercase tracking-widest">显卡完美重组，暗病完全消失！</h4>
                  <p className="text-xs text-zinc-300 max-w-md mx-auto leading-relaxed">
                    经过你在电脑台上的精密修砌整补，所有的电路瑕疵已被你用纯手工手艺彻底化解！该卡已经打上【绿标检测良好】证书，并重焕新生。
                  </p>
                </div>

                {/* Stat upgrade rows */}
                <div className="bg-zinc-900 p-3.5 rounded-xl border border-zinc-800 max-w-sm mx-auto space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">成色质量晋升:</span>
                    <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                      <span className="text-[10px] text-zinc-500 line-through">{repairModalTarget.condition}</span>
                      <span>➡️</span>
                      <span className="text-emerald-400 font-black">
                        {(() => {
                          const originalCondition = repairModalTarget.condition;
                          if (originalCondition === GpuCondition.Corpse) return GpuCondition.Repaired;
                          if (originalCondition === GpuCondition.Repaired || originalCondition === GpuCondition.Miner || originalCondition === GpuCondition.Netbar) return GpuCondition.PersonalUse;
                          if (originalCondition === GpuCondition.PersonalUse) return GpuCondition.BrandNew;
                          return originalCondition;
                        })()}
                      </span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">暗病雷区清除:</span>
                    <span className="text-emerald-400 font-black">
                      已完美排除，绿标认证 ⚡
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500">保价利润底增:</span>
                    <span className="text-amber-400 font-black">
                      原始底账折降 25% (利润空间大增)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    id="btn-close-repair-victory"
                    onClick={() => setRepairModalTarget(null)}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-extrabold text-xs tracking-wider transition"
                  >
                    确认收纳，贴签入库！
                  </button>
                </div>
              </div>
            )}

            {/* Trial Failed Screen */}
            {gameStatus === "failed" && (
              <div className="space-y-4 text-center py-4">
                <div className="w-16 h-16 rounded-full bg-rose-950/40 text-rose-400 border border-rose-500/30 flex items-center justify-center text-4xl mx-auto shadow-lg">
                  ❌
                </div>
                
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-rose-400 uppercase tracking-widest">呜呼，在修复过程中手抖超时！</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    在限时 10 秒倒计时面前，可能你涂敷慢了，或是未将灰尘除尽。不要气馁，整理测试工具即可随时再次整配！
                  </p>
                </div>

                <div className="flex justify-center gap-3.5 pt-2">
                  <button
                    id="btn-retry-repair"
                    onClick={() => {
                      setGameStatus("intro");
                      setActiveGame(null);
                    }}
                    className="px-5 py-2 rounded-lg border border-zinc-700 bg-zinc-900 text-xs font-semibold text-zinc-300 hover:text-zinc-100 transition"
                  >
                    重新挑战一遍
                  </button>
                  <button
                    id="btn-quit-repair"
                    onClick={() => setRepairModalTarget(null)}
                    className="px-5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-400 transition"
                  >
                    取消，稍后再整
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

