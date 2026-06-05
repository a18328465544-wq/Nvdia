/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  User, 
  Coins, 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  ThumbsUp, 
  ThumbsDown, 
  Trash2,
  Lock,
  MessageSquare
} from "lucide-react";
import { MarketCustomer, GpuCondition, GameState } from "../types";
import { formatCurrency, getConditionAttributes } from "../utils";

interface MarketAreaProps {
  state: GameState;
  customers: MarketCustomer[];
  onBuyCard: (customer: MarketCustomer, finalPrice: number) => void;
  onBargain: (customerId: string, type: "bargain_5" | "bargain_10") => void;
  onRejectCustomer: (customerId: string) => void;
  onRefreshMarket: () => void; // custom refresh option
  onBuyBlackMarket: (tier: "mid" | "high") => void;
}

export const MarketArea: React.FC<MarketAreaProps> = ({
  state,
  customers,
  onBuyCard,
  onBargain,
  onRejectCustomer,
  onRefreshMarket,
  onBuyBlackMarket
}) => {
  const [negotiationFills, setNegotiationFills] = useState<Record<string, string>>({});

  const handleBargainClick = (customer: MarketCustomer, type: "bargain_5" | "bargain_10") => {
    if (state.actionsLeft <= 0) return;
    onBargain(customer.id, type);
  };

  const handleBuyClick = (customer: MarketCustomer) => {
    if (state.cash < customer.currentAskPrice) {
      alert("老板，你手头现金不够啊！多挂两张卡回回血，或者换个更便宜的收！");
      return;
    }
    if (state.inventory.length >= 50) {
      alert("老板！库存塞满了（上限50张）！先去闲鱼卖几张卡，不然连立足的地方都没了！");
      return;
    }
    onBuyCard(customer, customer.currentAskPrice);
  };

  return (
    <div id="market-panel" className="space-y-6">
      
      {/* Tab Header Banner */}
      <div id="market-welcome-banner" className="flex justify-between items-center bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80">
        <div className="space-y-1">
          <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <User className="text-indigo-400 w-5 h-5" />
            老板今日柜台收卡区
          </h2>
          <p className="text-xs text-zinc-400 font-sans">
            散客和贩子送货上门。注意识别他们的黑话、对比今日行情价、使劲压价或直接拿下。
          </p>
        </div>

        {/* If no customers, show manual generate or next day helper */}
        {customers.length === 0 && (
          <button
            id="btn-trigger-market-gen"
            onClick={onRefreshMarket}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white transition shadow-lg active:scale-95"
          >
            拉拢新散客交易
          </button>
        )}
      </div>

      {/* 🌌 深夜黑市 (Midnight Black Market Special Event Interaction Core) */}
      {state.currentEvent?.title.includes("深夜黑市") ? (
        <div id="black-market-neon-panel" className="relative p-5 rounded-2xl border border-purple-500/40 bg-zinc-950 shadow-[0_0_15px_rgba(168,85,247,0.15)] flex flex-col md:flex-row justify-between items-stretch gap-6 overflow-hidden">
          {/* Neon strip light */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 animate-pulse" />
          
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">🏮</span>
              <h3 className="text-xs font-black tracking-widest text-[#a855f7] uppercase flex items-center gap-1.5 font-mono">
                <span>MIDNIGHT BLACK MARKET / 深夜秘密交易网</span>
                <span className="text-[9px] px-1 bg-red-500/10 border border-red-500/30 text-rose-400 font-bold rounded animate-pulse">UNDERGROUND</span>
              </h3>
            </div>
            
            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              夜半三更，阴冷的小吃街尽头。一个戴着鸭舌帽的黑脸商贩神秘招手。这里只支持直接现金流交易。虽然你能以不到半折的价格暴爽买到全新/个人自用的顶配大卡（如 RTX 4090/5090 等），但也面临 60% 极高爆率拿下一纸物理碎裂、核心灌水泥的彻底坏卡 ——【尸体卡】！
            </p>

            <div className="text-[10px] text-zinc-500 font-mono space-y-1 border-t border-purple-950/40 pt-2">
              <div className="text-purple-400 font-bold">⚠️ 黑街战术提示：</div>
              <div>1. 尸体卡成本极低，正常在闲鱼只能折价 5% 卖给拆旧收破烂的，但至少返还 +1 商家诚实誉值。</div>
              <div>2. 若不经跑分检测企图直接以普通卡不披露故障欺诈在闲鱼挂售，买家上机 100% 翻车，被闲鱼直接仲裁退款重罚本金 85% 赔款并扣除巨额信誉 (-20)！</div>
            </div>
          </div>

          <div className="md:w-72 bg-purple-950/10 border border-purple-950 rounded-xl p-4 flex flex-col justify-between gap-4 font-mono">
            <div className="text-xs font-bold text-center text-purple-300 border-b border-purple-900/50 pb-2">
              🌌 选择摸金入场费档位：
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Option A: mid-tier */}
              <button
                id="btn-black-market-mid"
                disabled={state.cash < 1500 || state.actionsLeft <= 0}
                onClick={() => onBuyBlackMarket("mid")}
                className="py-2.5 px-3 rounded-lg border border-purple-500/30 bg-purple-950/20 hover:bg-purple-950/40 hover:border-purple-400 transition text-left space-y-0.5 group disabled:opacity-30 disabled:hover:bg-purple-950/20"
              >
                <div className="text-[11px] font-bold text-purple-200 group-hover:text-purple-300 flex justify-between items-center">
                  <span>中端黑市盲盒 📦</span>
                  <span className="text-purple-400 font-extrabold">¥1,500</span>
                </div>
                <div className="text-[9px] text-zinc-400 font-sans leading-tight">
                  包含 3070/3080/4070S 等。40%极品 / 60%拆机尸体！
                </div>
              </button>

              {/* Option B: top-tier */}
              <button
                id="btn-black-market-high"
                disabled={state.cash < 4500 || state.actionsLeft <= 0}
                onClick={() => onBuyBlackMarket("high")}
                className="py-2.5 px-3 rounded-lg border border-pink-500/30 bg-pink-950/20 hover:bg-pink-950/40 hover:border-pink-400 transition text-left space-y-0.5 group disabled:opacity-30 disabled:hover:bg-pink-950/20"
              >
                <div className="text-[11px] font-bold text-pink-200 group-hover:text-pink-300 flex justify-between items-center">
                  <span>顶级摸金盲盒 💎</span>
                  <span className="text-pink-400 font-extrabold">¥4,500</span>
                </div>
                <div className="text-[9px] text-zinc-400 font-sans leading-tight">
                  包含 3090/4090/5090 等。40%发大财 / 60%巨响尸体！
                </div>
              </button>
            </div>

            <div className="text-[10px] text-zinc-500 text-center flex justify-between font-sans mt-1">
              <span>每次淘货: -1 ⚡</span>
              <span>剩余步数: {state.actionsLeft} 点</span>
            </div>
          </div>
        </div>
      ) : (
        /* Disabled static box showing the lock info */
        <div id="black-market-locked-panel" className="p-4 rounded-xl border border-zinc-900 bg-zinc-950/40 flex items-center justify-between gap-4 font-mono text-[11px]">
          <div className="flex items-center gap-2 text-zinc-500 leading-relaxed">
            <span className="text-base select-none">🔒</span>
            <span>
              <strong className="text-zinc-400">深夜黑市据点未开放</strong> —— 通常街区处于闭店夜休状态。建议每天晨会多看行情播报，当产生 <strong className="text-purple-400">“深夜黑市开启”</strong> 特殊传闻，此处就会向你敞开怀抱！
            </span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-900 text-zinc-600 border border-zinc-800 shrink-0 font-bold">LOCKED</span>
        </div>
      )}

      {/* Main flow of customer offers */}
      {customers.length === 0 ? (
        <div id="empty-market-state" className="flex flex-col items-center justify-center p-12 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/10 text-center space-y-4">
          <div className="text-4xl">📭</div>
          <div className="space-y-2">
            <h3 className="text-zinc-200 font-bold text-sm">柜台今天没有散客了</h3>
            <p className="text-xs text-zinc-500 max-w-sm">
              你已经处理了所有的客户或者是今天还没有人上门。点击上方“拉拢新散客”或者直接进入“下一天”以刷新行情和客源。
            </p>
          </div>
        </div>
      ) : (
        <div id="market-customers-grid" className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {customers.map((c) => {
            const condAttrs = getConditionAttributes(c.condition);
            
            // Calculate actual theoretical value based on today's pricing
            const todayMarketBasePrice = state.gpuPriceFluctuations[c.gpuName] || 1000;
            const targetEstimatedWorth = Math.round(todayMarketBasePrice * condAttrs.priceMultiplier);
            const profitEstimate = targetEstimatedWorth - c.currentAskPrice;
            const isEstimatedProfitable = profitEstimate > 0;
            const isBargained = c.bargainedCount > 0;

            const isAffordable = state.cash >= c.currentAskPrice;
            const isInventoryRoomLeft = state.inventory.length < 50;
            const isActionAvailable = state.actionsLeft > 0;

            return (
              <div 
                key={c.id} 
                id={`customer-card-${c.id}`}
                className="relative border border-zinc-800 bg-zinc-900/20 rounded-2xl p-5 hover:border-indigo-500/20 hover:bg-zinc-900/40 transition-all flex flex-col justify-between gap-5 group"
              >
                {/* Upper row: User profile & GPU selection details */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 bg-zinc-800/80 rounded-xl" role="img" aria-label="avatar">
                      {c.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-zinc-200">{c.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60">
                          {c.kind}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                        <MessageSquare className="w-3 h-3 text-zinc-600" />
                        <span>提供货源：</span>
                        <span className="font-semibold text-zinc-300 font-mono">{c.gpuName}</span>
                      </div>
                    </div>
                  </div>

                  {/* GPU Condition Badge */}
                  <span className={`text-xs px-2.5 py-1 rounded-md border font-medium ${condAttrs.badgeColor}`}>
                    {c.condition}
                  </span>
                </div>

                {/* Speech container */}
                <div className="relative bg-zinc-900/60 p-3.5 rounded-xl border border-zinc-800/50 text-xs italic text-zinc-300 leading-relaxed">
                  <div className="absolute top-2 right-2 text-[10px] text-zinc-600 font-mono select-none">
                    #QUOTE
                  </div>
                  "{c.talk}"
                </div>

                {/* Valuation Info Panels */}
                <div className="grid grid-cols-2 gap-3.5 p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-900 font-mono text-xs">
                  <div>
                    <div className="text-zinc-500 text-[10px]">对方报价</div>
                    <div className={`text-base font-bold mt-0.5 ${isAffordable ? 'text-amber-400' : 'text-zinc-500'}`}>
                      {formatCurrency(c.currentAskPrice)}
                    </div>
                    {isBargained && (
                      <div className="text-[10px] text-emerald-400 mt-0.5 font-sans animate-fade">
                        已通过砍价折算
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="text-zinc-500 text-[10px]">参考行情面值</div>
                    <div className="text-sm font-semibold text-zinc-300 mt-0.5">
                      {formatCurrency(targetEstimatedWorth)}
                    </div>
                    <div className={`text-[10px] flex items-center gap-1 mt-0.5 ${isEstimatedProfitable ? "text-emerald-400" : "text-rose-400"}`}>
                      {isEstimatedProfitable ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      <span>预估利差: {isEstimatedProfitable ? "+" : ""}{formatCurrency(profitEstimate)}</span>
                    </div>
                  </div>
                </div>

                {/* Operations Row */}
                <div className="flex flex-col gap-2.5">
                  <div className="flex gap-2">
                    {/* Bargain 5% */}
                    <button
                      id={`btn-bargain-5-${c.id}`}
                      disabled={!c.canBargain || !isActionAvailable || c.bargainedCount >= 2}
                      onClick={() => handleBargainClick(c, "bargain_5")}
                      className="flex-1 py-2 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-700 transition disabled:opacity-40 disabled:hover:bg-zinc-900/60 disabled:hover:border-zinc-800 flex items-center justify-center gap-1"
                    >
                      <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                      <span>砍5%</span>
                    </button>

                    {/* Bargain 10% */}
                    <button
                      id={`btn-bargain-10-${c.id}`}
                      disabled={!c.canBargain || !isActionAvailable || c.bargainedCount >= 1}
                      onClick={() => handleBargainClick(c, "bargain_10")}
                      className="flex-1 py-2 px-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 text-xs text-zinc-300 font-medium hover:bg-zinc-800 hover:border-zinc-700 transition disabled:opacity-40 disabled:hover:bg-zinc-900/60 disabled:hover:border-zinc-800 flex items-center justify-center gap-1"
                    >
                      <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-amber-400">大砍10%</span>
                    </button>

                    {/* Pass/Reject offer */}
                    <button
                      id={`btn-reject-${c.id}`}
                      onClick={() => onRejectCustomer(c.id)}
                      className="py-2 px-3 rounded-lg border border-zinc-800 hover:border-zinc-700 bg-zinc-900/20 text-zinc-500 hover:text-zinc-400 transition"
                      title="拒接此单"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Ultimate Purchase Button */}
                  {c.currentAskPrice > 0 ? (
                    <button
                      id={`btn-buy-gpu-${c.id}`}
                      disabled={!isAffordable || !isInventoryRoomLeft || !isActionAvailable}
                      onClick={() => handleBuyClick(c)}
                      className={`w-full py-2.5 rounded-lg font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-lg ${
                        isAffordable && isInventoryRoomLeft && isActionAvailable
                          ? "bg-indigo-600 hover:bg-indigo-500 text-white hover:shadow-indigo-500/10 active:scale-95"
                          : "bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-700/20"
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                      <span>{isAffordable ? `原价拿下 (${formatCurrency(c.currentAskPrice)})` : `现金不足 (还差 ${formatCurrency(c.currentAskPrice - state.cash)})`}</span>
                    </button>
                  ) : (
                    <div className="text-center p-2 rounded bg-zinc-950 text-rose-500 font-semibold font-mono text-xs border border-rose-900/20">
                      协商破裂 (散客已愤然离开柜台)
                    </div>
                  )}
                  
                  {/* Small Action points requirement tip */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-500 px-1 font-mono">
                    <span>行动点：-1 ⚡</span>
                    <span>砍价限 {c.bargainedCount}/2 次</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
