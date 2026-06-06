/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShoppingBag, 
  UserCheck, 
  TrendingUp, 
  MessageCircle, 
  X, 
  CheckCircle, 
  Coins, 
  AlertTriangle,
  HelpCircle
} from "lucide-react";
import { InventoryGpu, XianyuListing, XianyuBuyer, GameState } from "../types";
import { formatCurrency, getConditionAttributes, generateXianyuBuyer } from "../utils";

interface XianyuAreaProps {
  state: GameState;
  onConfirmSale: (gpuId: string, finalBillPrice: number, reputationChange: number, logMessage: string, isCrash: boolean) => void;
  onDeductAction: () => void;
}

export const XianyuArea: React.FC<XianyuAreaProps> = ({
  state,
  onConfirmSale,
  onDeductAction
}) => {
  const [selectedGpuId, setSelectedGpuId] = useState<string>(() => {
    try {
      return localStorage.getItem("xianyu_selected_gpu_id") || "";
    } catch {
      return "";
    }
  });
  
  const [listingMode, setListingMode] = useState<"quick" | "normal" | "high">(() => {
    try {
      const saved = localStorage.getItem("xianyu_listing_mode");
      return (saved as "quick" | "normal" | "high") || "normal";
    } catch {
      return "normal";
    }
  });
  
  // Active listing state if we have a generated offer
  const [currentOffer, setCurrentOffer] = useState<{
    gpu: InventoryGpu;
    listingPrice: number;
    mode: "quick" | "normal" | "high";
    buyer: XianyuBuyer | null;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("xianyu_current_offer");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Dynamic status/chat console state for the buyer negotiation game
  const [negotiation, setNegotiation] = useState<{
    stage: "initial" | "success" | "denied" | "walkout";
    currentPrice: number;
    logMessage: string;
    attempts: number;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("xianyu_negotiation");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Keep state synchronized into localStorage
  useEffect(() => {
    try {
      localStorage.setItem("xianyu_selected_gpu_id", selectedGpuId);
    } catch {}
  }, [selectedGpuId]);

  useEffect(() => {
    try {
      localStorage.setItem("xianyu_listing_mode", listingMode);
    } catch {}
  }, [listingMode]);

  useEffect(() => {
    try {
      if (currentOffer) {
        localStorage.setItem("xianyu_current_offer", JSON.stringify(currentOffer));
      } else {
        localStorage.removeItem("xianyu_current_offer");
      }
    } catch {}
  }, [currentOffer]);

  useEffect(() => {
    try {
      if (negotiation) {
        localStorage.setItem("xianyu_negotiation", JSON.stringify(negotiation));
      } else {
        localStorage.removeItem("xianyu_negotiation");
      }
    } catch {}
  }, [negotiation]);

  // Filter out listed/sold GPUs. Since we resolve instantly, any GPU in state.inventory is sellable
  const sellableGpus = state.inventory;

  const handleListForSale = () => {
    if (!selectedGpuId) {
      alert("请先在列表中选中你打算挂在闲鱼上的显卡！");
      return;
    }

    if (state.actionsLeft <= 0) {
      alert("今天行动次数已经用光！先点击“下一天”刷新操作点吧。");
      return;
    }

    const targetGpu = state.inventory.find(g => g.id === selectedGpuId);
    if (!targetGpu) return;

    // Calculate listing price base
    const condAttrs = getConditionAttributes(targetGpu.condition);
    const baseMarketRef = state.gpuPriceFluctuations[targetGpu.name] || targetGpu.boughtPrice;
    const worth = Math.round(baseMarketRef * condAttrs.priceMultiplier);

    let listPrice = worth;
    if (listingMode === "quick") {
      listPrice = Math.round(worth * 0.90); // 10% discount
    } else if (listingMode === "high") {
      listPrice = Math.round(worth * 1.12); // 12% markup
    }

    // Clean up
    listPrice = Math.round(listPrice / 50) * 50;

    // Generate buyer contact
    const { hasBuyer, buyer } = generateXianyuBuyer(targetGpu, listPrice, listingMode, state.reputation);
    
    // Deduct action
    onDeductAction();

    if (hasBuyer && buyer) {
      setCurrentOffer({
        gpu: targetGpu,
        listingPrice: listPrice,
        mode: listingMode,
        buyer
      });
      setNegotiation({
        stage: "initial",
        currentPrice: buyer.offerPrice,
        logMessage: buyer.offerPrice < listPrice 
          ? `【买家大刀咨询】对方对你的货极为眼馋。但直呼“挂价太高”，主动发起试探性砍价，报出一个偏低的成交价 ¥${buyer.offerPrice} 元（相比你挂价少 ¥${listPrice - buyer.offerPrice} 元）！你可以顺水推舟接受，或者选择三种“反砍价战术”对其反向拉扯！`
          : `【诚意买家咨询】买家对你的挂牌价 ¥${listPrice} 元非常认可，认为老哥你诚意拉满。当场发起 ¥${listPrice} 元的全额打款意愿！可以闭眼成交了。`,
        attempts: 0
      });
    } else {
      // Listed but no buyers contacted today
      setCurrentOffer({
        gpu: targetGpu,
        listingPrice: listPrice,
        mode: listingMode,
        buyer: null
      });
      setNegotiation(null);
    }

    // Clear dropdown selector
    setSelectedGpuId("");
  };

  // Handle buyer accept transaction
  const handleAcceptTransaction = () => {
    if (!currentOffer) return;
    const { gpu, buyer, listingPrice } = currentOffer;
    if (!buyer) return;

    let transactionPrice = negotiation ? negotiation.currentPrice : buyer.offerPrice;
    let repChange = 2; // normal transaction adds rep
    let logMsg = `【交易成功】你在闲鱼将 ${gpu.name} 出售给了 ${buyer.name}，成交价为 ${formatCurrency(transactionPrice)}`;
    let isCrash = false;

    // Scenario: Has Hidden Defect (未检测暗病)
    if (gpu.condition === "尸体卡" && !gpu.issueKnown) {
      isCrash = true;
      const penalty = Math.round(gpu.boughtPrice * 0.85); // heavy penalty for fraud
      transactionPrice = Math.max(0, transactionPrice - penalty);
      repChange = -20; // heavy reputation hit for outright fraud
      logMsg = `【☠️ 欺诈上架大雷翻车！】买家收到货上机开始双烤瞬间‘啪’的一声直接电表跳闸冒出蓝烟！对方当即将烧焦贴图发到贴吧 and 避坑群，发起极速仲裁并以‘假药假卡’起诉。由于该卡是你黑市淘来且从未点亮测试的【尸体卡】，你被迫强制全额退款重罚 ¥${formatCurrency(penalty)} 息事宁人！商家信誉狂降 20 点！`;
    } else if (gpu.hasIssue && !gpu.issueKnown) {
      // Buyer receives and double-checks! If they double check with high risk or is scammer, they complain!
      // High risk of post-sale discovery
      const discovered = Math.random() < 0.75 || buyer.kind === "到手刀骗子";
      if (discovered) {
        isCrash = true;
        const penalty = Math.round(gpu.boughtPrice * 0.35); // compensation / refund loss
        transactionPrice = transactionPrice - penalty;
        repChange = -10; // serious reputation drop
        logMsg = `【翻车退款】客户在收到 ${gpu.name} 跑 3DMark 时直接黑屏花屏！经检测由于没有提前标注暗病，你不得不退还补偿费 ${formatCurrency(penalty)}，信誉值狂扣 10 点！`;
      } else {
        logMsg += `。(注: 这张卡其实有暗病, 居然奇迹般地没被对方发现, 老板拍胸脯松了口气！)`;
      }
    } 
    // Scenario: Scammer Buyer ("到手刀") with normal Card
    else if (buyer.kind === "到手刀骗子") {
      // Scammer will complain even if card is 100% fine!
      if (gpu.testResult !== "未检测" && gpu.testResult === "正常") {
        // Player has proof!
        repChange = 3; // secure rep because you stood your ground
        logMsg = `【识破骗子】闲鱼“到手刀”想要挑刺：抱怨说风扇声响、要求返款300。你当场晒出口碑极佳的“专业双烤烤机绿标检测报告”！对方哑口无言，只好确认收货！信誉 +3！`;
      } else {
        // No proof, player is forced to refund 300 to avoid dispute
        transactionPrice = transactionPrice - 300;
        repChange = -2;
        logMsg = `【吃哑巴亏】闲鱼“到手刀”一口咬定风扇声音像拖拉机。由于你入库时没有留下测试证据，无奈在闲鱼仲裁前同意返款补差价 ¥300 息事宁人。`;
      }
    }
    
    // Scenario: Know Defect marked properly (已检测且如实描述)
    else if (gpu.issueKnown) {
      repChange = 1; // honest businessman
      logMsg = `【诚实守信】你如实标注了二手微疵/暗病。买家 ${buyer.name} 认可成色并满意认购，爽快付款了 ${formatCurrency(transactionPrice)}。`;
    }

    onConfirmSale(gpu.id, transactionPrice, repChange, logMsg, isCrash);
    setCurrentOffer(null);
    setNegotiation(null);
  };

  const handleDeclineTransaction = (rejectMessage: string) => {
    setCurrentOffer(null);
    setNegotiation(null);
    alert(rejectMessage);
  };

  const handleCounterBargain = (strategy: "sincere" | "tough" | "proof") => {
    if (!currentOffer || !currentOffer.buyer || !negotiation) return;
    const { gpu, listingPrice } = currentOffer;

    const currentPrice = negotiation.currentPrice;
    const attempts = negotiation.attempts + 1;

    let nextPrice = currentPrice;
    let nextStage: "initial" | "success" | "denied" | "walkout" = "initial";
    let message = "";

    const roll = Math.random() * 100;

    if (strategy === "sincere") {
      // Sincere discount talk: 70% chance of gaining some grounds
      if (roll < 70) {
        // Successful split of difference! Let's increase the price by 50% of the difference
        const diff = listingPrice - currentPrice;
        if (diff > 50) {
          const increase = Math.round((diff * 0.5) / 50) * 50;
          nextPrice = Math.min(listingPrice, currentPrice + Math.max(50, increase));
          nextStage = "success";
          message = `【还价拉扯成功】你言辞恳切：“哥们，大学生自用好卡，成色绝对完美，真不能亏了。” 对方有些动容，回道：“行吧老板，看你人挺爽快，我再加 ¥${nextPrice - currentPrice} 元，凑整 ¥${nextPrice} 给你，能行就当场拍下了！”`;
        } else {
          nextStage = "denied";
          message = `【对白：让步失败】你极力说情，可对方很固执：“老板，钱包真被榨干了。真的加不了，就按原先我给的出价 ¥${currentPrice} 块吧，行不行给句痛快话。”`;
        }
      } else if (roll < 90) {
        nextStage = "denied";
        message = `【对白：软磨硬泡失败】对方回绝道：“现在淘二手行情透明，我预算拉得极紧，真没法再多加一毛钱。出价 ¥${currentPrice}，不行我就去买别家的啦，老板不送。”`;
      } else {
        nextStage = "walkout";
        message = `【大刀客：买家下线溜了】对方似乎对你磨叽的态度感到厌倦：“买个二手显卡和挤牙膏一样，太磨叽了！溜了溜了，别家多的是！”（交易断开）`;
      }
    } 
    else if (strategy === "tough") {
      // Hardline approach: 45% high gain, 30% flat no, 25% walkout
      if (roll < 45) {
        const diff = listingPrice - currentPrice;
        const increase = Math.round((diff * 0.8) / 50) * 50;
        nextPrice = Math.min(listingPrice, currentPrice + Math.max(50, increase));
        nextStage = "success";
        message = `【气势拉扯成功！】你态度蛮横、一字千金：“爱买不买！好货就是这个本钱，旁边大把水洗电教卡便宜但一双烤就度劫，你敢去赌？” 对方气势怂了：“靠，老板脾气真火爆。得，买个安稳！我多加 ¥${nextPrice - currentPrice} 元凑个 ¥${nextPrice} 元，今晚八点能给顺丰发出吗？”`;
      } else if (roll < 75) {
        nextStage = "denied";
        message = `【强硬碰壁】你态度虽然豪横，对方是老油条：“老哥别跟这吹了，大伙出来倒卡都不容易，少灌鸡汤，一口价 ¥${currentPrice}，多加一个蹦子我都不买，再见！”`;
      } else {
        nextStage = "walkout";
        message = `【逼退买家】你的高姿态和硬语气彻底激怒了对方：“闲鱼卖家还特么装起来了大爷，爱卖谁卖谁去！告辞不送！”（买家直接拉黑并走宝）`;
      }
    } 
    else if (strategy === "proof") {
      // Running benchmark proof
      if (gpu.testResult !== "未检测") {
        // High success if pre-tested! 90% success rate
        if (roll < 88) {
          const diff = listingPrice - currentPrice;
          const increase = Math.round((diff * 0.92) / 50) * 50;
          nextPrice = Math.min(listingPrice, currentPrice + Math.max(50, increase));
          nextStage = "success";
          message = `【测试硬照砸脸上！】你直接甩去精美的甜甜圈双烤30分钟无故障截图：“别搁这瞎比砍。看好这SN对齐的烤机图，核心58度，无拆无修，绿色诊断通过！买这个图的就是省心，不值这个看病钱？” 对方瞪大双眼：“卧槽，温度这么低真极品雕。妥，我信你，我加钱到 ¥${nextPrice} 诚意全款拍，麻溜打包装泡泡纸送快递去吧！”`;
        } else {
          nextStage = "denied";
          message = `【绿标检测被拒】看到极品检测图后，对方惊叹连连，但囊中羞涩：“烤机曲线真完美，确实是极品... 唉，只关键钱包真掏不出钱了... 老板，就按原先我开的 ¥${currentPrice} 块，算做福利交个朋友呗？”`;
        }
      } else {
        // Un-tested has terrible odds! 20% success, 20% no, 60% walkout!
        if (roll < 20) {
          nextStage = "denied";
          message = `【无实机图尴尬】你极力口头担保“绝对是自用极品卡，拿到不亮我直播吃键盘”，可是对方撇撇嘴：“空口无凭啊哥们，连个实机烤温图都掏不利索，指定是网吧卡或者水洗货，我就敢给 ¥${currentPrice} 起步风险费，能出就拍！”`;
        } else if (roll < 40) {
          nextStage = "denied";
          message = `【空谈画饼】对方油盐不进：“没跑过 Furmark 的原件，谁知有没有虚焊暗病。不加价格，多出 ¥1 我都觉得自己在送死。”`;
        } else {
          nextStage = "walkout";
          message = `【雷达滴滴作响：怀疑暗病！】由于你闪烁其词、连当场跑个测试都不愿意，对方心生极大疑窦而警惕：“老哥，你连个甜甜圈拷机绿标截图都发不出来，这100%是电表跳闸的地雷尸体卡吧？对不住了，我命大，不敢接，告辞！”（买家断开下线，不再回复）`;
        }
      }
    }

    setNegotiation({
      stage: nextStage,
      currentPrice: nextPrice,
      logMessage: message,
      attempts
    });
  };

  return (
    <div id="xianyu-resale-panel" className="space-y-6">
      
      {/* Banner */}
      <div id="xianyu-welcome-banner" className="bg-zinc-900/30 p-4 rounded-xl border border-zinc-800/80 space-y-1">
        <h2 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <ShoppingBag className="text-amber-400 w-5 h-5 animate-pulse" />
          闲鱼上架大厅：挂价及出货
        </h2>
        <p className="text-xs text-zinc-400">
          在这里出售你积攒的货品。你可以针对现金急需度调整挂牌价：可以快速出清、也可以稳赚面值、更可以当黄牛溢价挂，全看运气和信誉！
        </p>
      </div>

      {/* Main Listing Interactive Interface */}
      {!currentOffer ? (
        <div id="xianyu-form-card" className="border border-zinc-800 bg-zinc-900/10 rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-bold text-zinc-200">上架宝贝配置</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-sans">
            {/* Left box: dropdown */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
                <span>1. 选择要卖的库存货品：</span>
                <span className="text-zinc-600">({sellableGpus.length} 张可用)</span>
              </label>

              <select
                id="select-listing-gpu"
                value={selectedGpuId}
                onChange={(e) => setSelectedGpuId(e.target.value)}
                className="w-full bg-zinc-950 text-xs text-zinc-300 rounded-lg p-3 border border-zinc-800 focus:outline-none focus:border-indigo-500 font-mono"
              >
                <option value="">-- 点击展开我的仓库货架 --</option>
                {sellableGpus.map((gpu) => {
                  const condAttrs = getConditionAttributes(gpu.condition);
                  return (
                    <option key={gpu.id} value={gpu.id}>
                      {gpu.name} (SN: {gpu.sn.slice(-4)}) | 成本: ¥{gpu.boughtPrice} | {gpu.condition} {gpu.testResult !== "未检测" ? " [已检测]" : " [未检测]" }
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Right box: pricing Strategy mode */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">
                2. 设置闲鱼挂牌定价档位：
              </label>
              
              <div id="pricing-strategy-grid" className="grid grid-cols-3 gap-2">
                <button
                  id="btn-listing-quick"
                  type="button"
                  onClick={() => setListingMode("quick")}
                  className={`p-2.5 rounded-lg text-xs font-semibold text-center border transition flex flex-col items-center justify-center gap-1 ${
                    listingMode === "quick"
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/50 shadow-md"
                      : "bg-zinc-900/40 text-zinc-500 border-zinc-800/80 hover:text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[13px] font-extrabold text-emerald-400">快速变现</span>
                  <span className="text-[9px] scale-90 text-zinc-500">低于市价 10% (易出手)</span>
                </button>

                <button
                  id="btn-listing-normal"
                  type="button"
                  onClick={() => setListingMode("normal")}
                  className={`p-2.5 rounded-lg text-xs font-semibold text-center border transition flex flex-col items-center justify-center gap-1 ${
                    listingMode === "normal"
                      ? "bg-indigo-950/40 text-indigo-400 border-indigo-500/50 shadow-md"
                      : "bg-zinc-900/40 text-zinc-500 border-zinc-800/80 hover:text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[13px] font-extrabold text-indigo-400">行情挂价</span>
                  <span className="text-[9px] scale-90 text-zinc-500">平进平出 100%市值</span>
                </button>

                <button
                  id="btn-listing-high"
                  type="button"
                  onClick={() => setListingMode("high")}
                  className={`p-2.5 rounded-lg text-xs font-semibold text-center border transition flex flex-col items-center justify-center gap-1 ${
                    listingMode === "high"
                      ? "bg-amber-950/40 text-amber-400 border-amber-500/50 shadow-md"
                      : "bg-zinc-900/40 text-zinc-500 border-zinc-800/80 hover:text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[13px] font-extrabold text-amber-400">黄牛溢价</span>
                  <span className="text-[9px] scale-90 text-zinc-500">加价 12% 赌接盘侠</span>
                </button>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800/50 pt-4 flex justify-between items-center text-xs text-zinc-500">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-zinc-600" />
              <span>注意：发布后将消耗每天 1 次行动点数（行动点: -1 ⚡）</span>
            </span>

            <button
              id="btn-list-submit"
              onClick={handleListForSale}
              disabled={state.actionsLeft <= 0}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-zinc-950 font-extrabold text-xs tracking-wide shadow-lg active:scale-95 transition disabled:opacity-40"
            >
              立刻发布宝贝 ⚡
            </button>
          </div>
        </div>
      ) : (
        /* Dialogue result container of Xianyu listings */
        <div id="xianyu-result-container" className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-900">
            <div>
              <div className="text-xs text-zinc-500 uppercase font-mono">宝贝发布状态反馈</div>
              <h3 className="text-sm font-extrabold text-amber-400 mt-0.5">
                已挂牌：{currentOffer.gpu.name} ({currentOffer.gpu.condition})
              </h3>
            </div>
            
            <div className="text-right">
              <span className="text-xs text-zinc-500">挂售价：</span>
              <span className="text-sm font-bold font-mono text-zinc-300">{formatCurrency(currentOffer.listingPrice)}</span>
            </div>
          </div>

          {/* Buyer offer detail */}
          {currentOffer.buyer ? (
            <div className="space-y-4 font-sans">
              {/* Buyer info card with live negotiated price */}
              <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-900 flex justify-between items-start gap-4">
                <div className="flex gap-3">
                  <span className="text-3xl p-1 bg-zinc-800 rounded-lg">💬</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-zinc-200">{currentOffer.buyer.name}</span>
                      <span className="text-[10px] px-1 bg-indigo-950 text-indigo-300 rounded border border-indigo-900/30">
                        {currentOffer.buyer.kind}
                      </span>
                    </div>
                    {/* dialogue bubble */}
                    <p className="text-xs italic text-zinc-400 mt-1.5 leading-relaxed bg-zinc-950/80 p-3 rounded-lg border border-zinc-900">
                      “{currentOffer.buyer.talk}”
                    </p>
                  </div>
                </div>

                <div className="text-right font-mono shrink-0 self-center">
                  <span className="text-[10px] text-zinc-500 block">当前出价</span>
                  <span className="text-base font-extrabold text-emerald-400">
                    {formatCurrency(negotiation ? negotiation.currentPrice : currentOffer.buyer.offerPrice)}
                  </span>
                  {negotiation && negotiation.currentPrice < currentOffer.listingPrice && (
                    <span className="text-[10px] text-rose-400/80 block">
                      (低于挂价 -{formatCurrency(currentOffer.listingPrice - negotiation.currentPrice)})
                    </span>
                  )}
                  {negotiation && negotiation.currentPrice >= currentOffer.listingPrice && (
                    <span className="text-[10px] text-emerald-400 block font-bold">
                      (原价成交！)
                    </span>
                  )}
                </div>
              </div>

              {/* INTERACTIVE NEGOTIATION CONSOLE */}
              {negotiation && (
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-1.5 text-[9px] bg-zinc-900 border-l border-b border-zinc-800 text-zinc-500 font-mono">
                    拉扯进度: {negotiation.attempts}/2 次
                  </div>
                  <h4 className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                    <MessageCircle className="w-4 h-4 text-indigo-400" />
                    <span>买家拉扯现场</span>
                  </h4>
                  <div className="p-3 bg-zinc-900/70 border border-zinc-900/50 rounded-lg text-xs leading-relaxed text-zinc-300">
                    {negotiation.logMessage}
                  </div>

                  {/* Bargain strategies selection (if attempts < 2 and not walkout) */}
                  {negotiation.stage !== "walkout" && negotiation.attempts < 2 && negotiation.currentPrice < currentOffer.listingPrice && (
                    <div className="space-y-2 pt-1">
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">选择反砍价战术：</div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* 1. 打感情牌 */}
                        <button
                          type="button"
                          onClick={() => handleCounterBargain("sincere")}
                          className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-left transition space-y-0.5"
                        >
                          <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                            <span>打感情牌 🥺</span>
                            <span className="text-[9px] px-1 bg-emerald-950 text-emerald-300 rounded text-normal">稳妥</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">
                            “大学生自用一手好卡...”
                          </p>
                        </button>

                        {/* 2. 硬气对线 */}
                        <button
                          type="button"
                          onClick={() => handleCounterBargain("tough")}
                          className="p-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-lg text-left transition space-y-0.5"
                        >
                          <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                            <span>强硬对线 😤</span>
                            <span className="text-[9px] px-1 bg-amber-950 text-amber-300 rounded text-normal">高额升值</span>
                          </div>
                          <p className="text-[10px] text-zinc-500">
                            “爱买不买，防爆大雷卡...”
                          </p>
                        </button>

                        {/* 3. 跑跑拷机 */}
                        <button
                          type="button"
                          onClick={() => handleCounterBargain("proof")}
                          className={`p-2 border rounded-lg text-left transition space-y-0.5 ${
                            currentOffer.gpu.testResult !== "未检测"
                              ? "bg-indigo-950/20 border-indigo-800/60 hover:bg-indigo-950/30"
                              : "bg-zinc-900 hover:bg-zinc-850 border-zinc-800"
                          }`}
                        >
                          <div className="text-xs font-bold text-zinc-200 flex items-center gap-1">
                            <span>亮出烤机图 📊</span>
                            {currentOffer.gpu.testResult !== "未检测" ? (
                              <span className="text-[9px] px-1 bg-indigo-900 text-indigo-200 rounded">已备证</span>
                            ) : (
                              <span className="text-[9px] px-1 bg-rose-950 text-rose-400 rounded">无数据!</span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 font-mono">
                            {currentOffer.gpu.testResult !== "未检测" ? "30分钟甜甜圈通过" : "未跑分双烤, 易惹嫌疑"}
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Warnings regarding risk if untested etc. */}
              {currentOffer.gpu.hasIssue && currentOffer.gpu.testResult === "未检测" && (
                <div className="p-3.5 rounded-lg bg-orange-950/20 border border-orange-900/30 text-orange-400 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">隐藏风险警告：</span>
                    这张卡你刚拍桌上入库没来得及做任何“跑分双烤测试”。如果该卡本身有暗病，由于闲鱼卖家需承担售后连带责任，一经买家上机发觉，极易遭遇退货扣分、甚至赔掉高达几千元的补偿！
                  </div>
                </div>
              )}

              {/* Regular scammer warning */}
              {currentOffer.buyer.kind === "到手刀骗子" && (
                <div className="p-3.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-rose-400 text-xs flex items-start gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">高危预警：</span>
                    对方是臭名昭著的职业【到手刀客】！不论显卡本身成色好坏，拿货签收后他们通常必出鬼点子勒索300元差价。如果你提供过完美的“甜甜圈烤机诊断书”则可成功保牌回击；如果由于你急用钱未测试过显卡，多半只能被迫屈辱打折！
                  </div>
                </div>
              )}

              {/* Action grid (Disabled if buyer walked out) */}
              {negotiation && negotiation.stage === "walkout" ? (
                <div className="pt-2 font-mono">
                  <button
                    onClick={() => handleDeclineTransaction("买家遛了，重新上架看看吧。")}
                    className="w-full py-3.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 text-xs font-black text-zinc-400 hover:text-zinc-200 text-center transition tracking-wide border border-zinc-800"
                  >
                    撤回此宝贝，重返上架大门 ↩️
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2 font-mono">
                  <button
                    id="btn-decline-sale"
                    onClick={() => handleDeclineTransaction("再考虑考虑，大刀不接！暂不卖出。")}
                    className="flex-1 py-3 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-xs font-semibold text-zinc-400 hover:text-zinc-200 text-center transition"
                  >
                    不卖了 (暂退大厅)
                  </button>

                  <button
                    id="btn-confirm-sale"
                    onClick={handleAcceptTransaction}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-black text-center shadow-lg transition active:scale-95"
                  >
                    成交！当场打包发货 🚚
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Unlucky scenario: no views */
            <div className="text-center p-8 space-y-4 font-sans">
              <p className="text-xs text-zinc-400">
                闲鱼上的宝贝已经发布了几个小时，然而点击量甚至只有个位数。看来你这次挂的价格有点脱离群众，或者最近市场供大于求，今天没有人上门咨询询价。
              </p>
              
              <div className="flex justify-center">
                <button
                  id="btn-clear-empty-listing"
                  onClick={() => setCurrentOffer(null)}
                  className="px-5 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-semibold text-zinc-300 transition"
                >
                  撤回宝贝，重新配置挂牌
                </button>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
