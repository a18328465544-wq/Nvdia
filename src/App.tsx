/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  User, 
  Box, 
  ShoppingBag, 
  Activity, 
  HelpCircle,
  Play,
  Heart,
  Calendar,
  Flame,
  Award,
  Clock
} from "lucide-react";

import { 
  GameState, 
  MarketCustomer, 
  GpuCondition, 
  InventoryGpu, 
  GameLog 
} from "./types";

import { 
  initGameState, 
  generateSn, 
  generateDailyPrices, 
  generateRandomSeller, 
  evaluateBargain, 
  getConditionAttributes,
  formatCurrency
} from "./utils";

import { 
  MARKET_EVENTS, 
  DAILY_QUOTES, 
  RANDOM_SITUATIONS,
  GPU_PRESETS
} from "./data";

const DISPUTE_SCENARIOS = [
  {
    customerName: "黑神话阿杰",
    avatar: "🧑‍💻",
    complaintGpu: "RTX 3060 Ti G6X",
    message: "老板，前两天在你这收的那个说自用的3060Ti，玩《黑神话：悟空》烤机居然秒飙 104 度并自动关机！拆卡看里面的硅脂已经完全干硬碎成渣渣了！退我退款 ¥750 让我去数码城维修，不然直接黑猫投诉封你闲鱼店！",
    refundCost: 750,
    materialsFee: 120,
    gameType: "paste" as const
  },
  {
    customerName: "网咖店主 胡老三",
    avatar: "🧔",
    complaintGpu: "GTX 1660 Super",
    message: "兄弟，你送来的那箱货上机跑了下，4 号槽的风扇声音大的像直升机呼啸。凑近一看风扇槽内堆满网吧焦油和厚黑尘土。你赔我 ¥600 补差价，或者现在立刻动手包清灰重新给轴承打硅油！",
    refundCost: 600,
    materialsFee: 80,
    gameType: "dust" as const
  },
  {
    customerName: "捡漏王 老陈",
    avatar: "👴",
    complaintGpu: "RX 580 满血版",
    message: "掌柜的，金手指这明显是有刮花和掉点，插满四个卡槽无限亮内存 debug 红灯！风扇也是抖个不停。你退我 ¥550 压惊，或者是把挡板除锈并全面把灰吹干净，免得短路了！",
    refundCost: 550,
    materialsFee: 100,
    gameType: "dust" as const
  },
  {
    customerName: "卡吧小老弟 阿达",
    avatar: "🥷",
    complaintGpu: "RTX 3070 锁算力版",
    message: "老板，今天突然花屏白屏满天星，GPU-Z检测发现显存部分烧的发黑。赶紧给全额或者和事退款 ¥900，要不然你就现场当场给我贴好相变导热帖、均匀铺好高倍硅脂！",
    refundCost: 900,
    materialsFee: 150,
    gameType: "paste" as const
  },
  {
    customerName: "建模兼职 林妹子",
    avatar: "👩‍🎨",
    complaintGpu: "RTX 4060 Ti 16G 生产力",
    message: "叔叔，你卖我的白卡一渲染大图就驱动崩溃。看论坛说需要均匀给供电MOS管补耐热硅树脂导热垫，还要给第二风扇通电对齐。赔我退款 ¥950，不然就帮我手动重做全套保修！",
    refundCost: 950,
    materialsFee: 180,
    gameType: "paste" as const
  }
];

import { Dashboard } from "./components/Dashboard";
import { MarketArea } from "./components/MarketArea";
import { InventoryArea } from "./components/InventoryArea";
import { XianyuArea } from "./components/XianyuArea";
import { TrendsArea } from "./components/TrendsArea";
import { StatsLogs } from "./components/StatsLogs";
import { VictoryModal } from "./components/VictoryModal";
import { MorningBroadcastModal } from "./components/MorningBroadcastModal";
import { AfterSalesModal, AfterSalesDispute } from "./components/AfterSalesModal";

export default function App() {
  const [state, setState] = useState<GameState>(() => {
    // Attempt local storage load
    try {
      const saved = localStorage.getItem("gpu_scalper_sim_save");
      if (saved) {
        const parsed = JSON.parse(saved);
        // ensure compatibility
        if (parsed && typeof parsed.day === "number") {
          return parsed;
        }
      }
    } catch (e) {
      console.warn("Could not load local storage progress", e);
    }
    return initGameState("normal");
  });

  const [activeCustomers, setActiveCustomers] = useState<MarketCustomer[]>(() => {
    try {
      const saved = localStorage.getItem("gpu_scalper_sim_active_customers");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load active customers", e);
    }
    return [];
  });
  const [introOpen, setIntroOpen] = useState(() => {
    try {
      const saved = localStorage.getItem("gpu_scalper_sim_save");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.gameStarted) {
          return false;
        }
      }
    } catch {}
    return true;
  });
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [activeDispute, setActiveDispute] = useState<AfterSalesDispute | null>(() => {
    try {
      const saved = localStorage.getItem("gpu_scalper_sim_active_dispute");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not load active dispute", e);
    }
    return null;
  });

  const [morningBroadcast, setMorningBroadcast] = useState<{
    day: number;
    quote: string;
    event: any;
    prices: Record<string, number>;
  } | null>(() => {
    try {
      const saved = localStorage.getItem("gpu_scalper_sim_morning_broadcast");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    return null;
  });

  // Keep active dispute persistent
  useEffect(() => {
    try {
      if (activeDispute) {
        localStorage.setItem("gpu_scalper_sim_active_dispute", JSON.stringify(activeDispute));
      } else {
        localStorage.removeItem("gpu_scalper_sim_active_dispute");
      }
    } catch (e) {
      console.warn("Could not save active dispute", e);
    }
  }, [activeDispute]);

  // Keep active customers persistent
  useEffect(() => {
    try {
      localStorage.setItem("gpu_scalper_sim_active_customers", JSON.stringify(activeCustomers));
    } catch (e) {
      console.warn("Could not save active customers", e);
    }
  }, [activeCustomers]);

  // Keep morning broadcast persistent
  useEffect(() => {
    try {
      if (morningBroadcast) {
        localStorage.setItem("gpu_scalper_sim_morning_broadcast", JSON.stringify(morningBroadcast));
      } else {
        localStorage.removeItem("gpu_scalper_sim_morning_broadcast");
      }
    } catch (e) {}
  }, [morningBroadcast]);

  // Initialize customer list for day 1 once game begins or states reload (only if not loaded from storage)
  useEffect(() => {
    if (state.gameStarted && activeCustomers.length === 0 && state.day === 1) {
      const saved = localStorage.getItem("gpu_scalper_sim_active_customers");
      if (!saved || JSON.parse(saved).length === 0) {
        generateDailyCustomers(state.gpuPriceFluctuations, state.currentEvent);
      }
    }
  }, [state.gameStarted]);

  // Audio synths for game vibe
  const playSound = (type: "buy" | "sell" | "fail" | "click" | "test") => {
    if (!state.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === "buy") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(660, now + 0.1);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === "sell") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.setValueAtTime(783.99, now + 0.1); // G5
        osc.frequency.setValueAtTime(1046.50, now + 0.2); // C6
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.4);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (type === "click") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(950, now);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === "test") {
        osc.type = "square";
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.setValueAtTime(440, now + 0.1);
        osc.frequency.setValueAtTime(554.37, now + 0.2);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.warn("Audio Context interaction blocked or unsupported by container framework", e);
    }
  };

  const handleTabChange = (tab: "market" | "inventory" | "xianyu" | "trends") => {
    playSound("click");
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const generateDailyCustomers = (prices: Record<string, number>, currentEvent: any) => {
    const count = 3 + Math.floor(Math.random() * 3); // 3 to 5 customers
    const list: MarketCustomer[] = [];
    for (let i = 0; i < count; i++) {
      list.push(generateRandomSeller(`sc_${state.day}_${i}`, prices, currentEvent));
    }
    setActiveCustomers(list);
  };

  // 1. Buy Card Logic
  const handleBuyCard = (customer: MarketCustomer, finalPrice: number) => {
    if (state.cash < finalPrice) return;
    if (state.inventory.length >= 50) return;
    if (state.actionsLeft <= 0) return;

    playSound("buy");
    
    // Create new Inventory card status
    const isBrandNew = customer.condition === GpuCondition.BrandNew;
    const newGpu: InventoryGpu = {
      id: `gpu_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      name: customer.gpuName,
      sn: generateSn(customer.gpuName),
      boughtDay: state.day,
      boughtPrice: finalPrice,
      currentMarketPrice: finalPrice,
      condition: customer.condition,
      risk: isBrandNew ? 5 : customer.condition === GpuCondition.PersonalUse ? 15 : customer.condition === GpuCondition.Netbar ? 35 : customer.condition === GpuCondition.Miner ? 60 : 80,
      hasIssue: customer.hasIssue,
      isTested: false,
      testResult: "未检测",
      issueKnown: false
    };

    // Remove customer from drawer
    setActiveCustomers(prev => prev.filter(c => c.id !== customer.id));

    // Update state
    setState(prev => {
      const updatedInventory = [...prev.inventory, newGpu];
      const detailLog: GameLog = {
        id: `log_buy_${Date.now()}`,
        day: prev.day,
        time: new Date().toLocaleTimeString("zh-CN", { hour: "numeric", minute: "numeric" }),
        text: `【囤货入库】成功向“${customer.name}”收下一张 ${customer.gpuName} (${customer.condition})，成交价: ${formatCurrency(finalPrice)}。`,
        type: "deal"
      };

      const newState = {
        ...prev,
        cash: prev.cash - finalPrice,
        inventory: updatedInventory,
        totalBought: prev.totalBought + 1,
        actionsLeft: prev.actionsLeft - 1,
        logs: [detailLog, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
  };

  // 1b. Deep Underground Midnight Black Market Gamble Logic
  const handleBuyBlackMarket = (tier: "mid" | "high") => {
    if (state.actionsLeft <= 0) {
      alert("今日行动步数已被榨干！赶紧‘进入下一天’上床休息恢复体能吧。");
      return;
    }
    const isHigh = tier === "high";
    const cost = isHigh ? 4500 : 1500;
    
    if (state.cash < cost) {
      alert(`老板！深夜黑街不赊账，带够 ¥${cost} 保证金或准备金再来博弈摸大雷吧！`);
      return;
    }
    if (state.inventory.length >= 50) {
      alert("老板！柜台和货架都被塞爆了，请先在闲鱼变现掉几张再来摸金！");
      return;
    }

    playSound("buy");

    // Pool selections
    const midPool = ["RTX 3070", "RTX 3080", "RTX 4070 Super"];
    const highPool = ["RTX 3090", "RTX 4090", "RTX 5090"];
    const gpuName = isHigh 
      ? highPool[Math.floor(Math.random() * highPool.length)]
      : midPool[Math.floor(Math.random() * midPool.length)];

    const successChance = 0.40; // 40% win, 60% corpse
    const isSuccessful = Math.random() < successChance;
    
    let condition: GpuCondition;
    let hasIssue: boolean;
    let logText = "";
    let logType: "success" | "error" = "success";

    if (isSuccessful) {
      condition = Math.random() < 0.6 ? GpuCondition.BrandNew : GpuCondition.PersonalUse;
      hasIssue = false;
      logText = `【🎉 黑街大捷！爆出极品神仙卡】你在黑市油毛毡摊位低调揭秘，花费 ¥${cost} 竟然无损挖出了成色近乎[${condition}]的巨无霸级神卡 ${gpuName}！这特么直接能净赚几千倍！老板流泪大呼：祖坟冒大烟！`;
      logType = "success";
    } else {
      condition = GpuCondition.Corpse;
      hasIssue = true;
      logText = `【💥 贪心吃大雷！淘出报废尸体】黑商拿钱后吹着口哨塞给你一个漆黑发酸的塑料口袋。你连夜拆解一瞧，果不其然是一张外酥里嫩、PCB穿孔、水泥配重的 [${gpuName} 尸体卡]！不仅电表倒扣，连亮机可能都没有！`;
      logType = "error";
    }

    const newGpu: InventoryGpu = {
      id: `gpu_${Date.now()}_black_${Math.random().toString(36).substr(2, 5)}`,
      name: gpuName,
      sn: generateSn(gpuName),
      boughtDay: state.day,
      boughtPrice: cost,
      currentMarketPrice: cost,
      condition,
      risk: condition === GpuCondition.Corpse ? 99 : 5,
      hasIssue,
      isTested: false,
      testResult: "未检测",
      issueKnown: false
    };

    setState(prev => {
      const detailLog: GameLog = {
        id: `log_black_buy_${Date.now()}`,
        day: prev.day,
        time: "黑市盲盒摸金",
        text: logText,
        type: logType === "success" ? "deal" : "error"
      };

      const newState = {
        ...prev,
        cash: prev.cash - cost,
        inventory: [...prev.inventory, newGpu],
        totalBought: prev.totalBought + 1,
        actionsLeft: prev.actionsLeft - 1,
        logs: [detailLog, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
  };

  // 2. Perform negotiation (树上压价)
  const handleBargain = (customerId: string, type: "bargain_5" | "bargain_10") => {
    if (state.actionsLeft <= 0) return;

    const targetCustomer = activeCustomers.find(c => c.id === customerId);
    if (!targetCustomer) return;

    const result = evaluateBargain(targetCustomer, type, state.reputation);
    
    if (result.success) {
      playSound("click");
      // update specific customer state
      setActiveCustomers(prev => prev.map(c => {
        if (c.id === customerId) {
          return {
            ...c,
            currentAskPrice: result.finalPrice,
            bargainedCount: c.bargainedCount + 1,
            talk: `好吧老板，我急着换生活费，就按 ¥${result.finalPrice} 出了，你爽快拿走吧！`
          };
        }
        return c;
      }));

      setState(prev => {
        const log: GameLog = {
          id: `log_bargain_ok_${Date.now()}`,
          day: prev.day,
          time: "谈判中",
          text: `【砍价成功】你对 ${targetCustomer.name} 的 ${targetCustomer.gpuName} 特殊压价。${result.text}`,
          type: "success"
        };
        const newState = {
          ...prev,
          actionsLeft: prev.actionsLeft - 1,
          logs: [log, ...prev.logs]
        };
        saveToStorage(newState);
        return newState;
      });
    } else {
      playSound("fail");
      if (result.finalPrice === -1) {
        // Customer stormed off
        setActiveCustomers(prev => prev.filter(c => c.id !== customerId));
      } else {
        // Declined discount but still available
        setActiveCustomers(prev => prev.map(c => {
          if (c.id === customerId) {
            return {
              ...c,
              bargainedCount: c.bargainedCount + 1,
              canBargain: false, // block further bargain
              talk: `你这价格太离谱了老板，最多只能原价出，爱收不收了！`
            };
          }
          return c;
        }));
      }

      setState(prev => {
        const log: GameLog = {
          id: `log_bargain_fail_${Date.now()}`,
          day: prev.day,
          time: "谈判破裂",
          text: `【砍价失败】你对 ${targetCustomer.name} 砍价未果！${result.text}`,
          type: "warn"
        };
        const newState = {
          ...prev,
          reputation: Math.max(0, prev.reputation - result.repPenalty),
          actionsLeft: prev.actionsLeft - 1,
          logs: [log, ...prev.logs]
        };
        saveToStorage(newState);
        return newState;
      });
    }
  };

  // 3. Reject offer from customer list
  const handleRejectCustomer = (customerId: string) => {
    playSound("click");
    setActiveCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  // 4. Test Card diagnostic (普通/深度/烤机检测)
  const handleDetectGpu = (gpuId: string, testType: "quick" | "deep" | "furmark") => {
    if (state.actionsLeft <= 0) return;

    let cost = 50;
    let accuracy = 40;
    let label = "普通轻度检测";
    if (testType === "deep") {
      cost = 200;
      accuracy = 80;
      label = "GPU-Z 深度测试";
    } else if (testType === "furmark") {
      cost = 500;
      accuracy = 95;
      label = "甜甜圈 3DMark 烤机检测";
    }

    if (state.cash < cost) return;

    playSound("test");

    setState(prev => {
      const updatedGpus = prev.inventory.map(gpu => {
        if (gpu.id === gpuId) {
          // Perform test outcome probability
          const isCorpse = gpu.condition === GpuCondition.Corpse;
          const checkPassed = isCorpse ? false : (Math.random() * 100 > accuracy); 
          // If we pass check, we fail to detect the actual issue if there was one.
          // If we fail check, we correctly pinpoint the issue!
          const issueDiscovered = gpu.hasIssue && !checkPassed;

          let testResultText: "未检测" | "正常" | "有暗病" = "正常";
          if (gpu.hasIssue) {
            testResultText = issueDiscovered ? "有暗病" : "正常"; // normal false pass if accuracy failed
          }

          return {
            ...gpu,
            isTested: true,
            testResult: testResultText,
            issueKnown: (testResultText === "有暗病" || isCorpse) ? true : gpu.issueKnown,
            defectType: isCorpse ? "物理毁坏/水泥假核心" : (testResultText === "有暗病" ? "核心缩缸或显存过热" : undefined)
          } as InventoryGpu;
        }
        return gpu;
      });

      const testedGpu = prev.inventory.find(g => g.id === gpuId);
      const isActuallyDefectiveAndFound = testedGpu?.hasIssue && (updatedGpus.find(g => g.id === gpuId)?.testResult === "有暗病");

      let logText = `【绿标正常】你花费了 ${cost} 元对 ${testedGpu?.name} (SN: ${testedGpu?.sn.slice(-4)}) 运行了 [${label}]。上机点亮、烤机十分平稳，散热扇噪音微弱，评定状态完美！`;
      let logType: "success" | "error" = "success";

      if (testedGpu?.condition === GpuCondition.Corpse) {
        logText = `【🚨 物理冒烟！上机检测出高级尸体！】你花费了 ${cost} 元对黑街淘来的 ${testedGpu?.name} 挂架测验。开机瞬间只听空气中啪的一声火花大闪！电源立马亮红灯触发过载保护！拆开卡罩目瞪口呆：背后PCB被高温局部炭化洞穿，甚至原本核心居然被换成了模型！好在检测已如实贴签登记，切勿在闲鱼上作为好卡销售欺骗小白！`;
        logType = "error";
      } else if (isActuallyDefectiveAndFound) {
        logText = `【发现暗病！】用 [${label}] 对 ${testedGpu?.name} 测试 3 分钟后主板报警，温度飙到 105 度并伴随轻微花屏闪烁！确认此卡为暗病缺陷卡，已在货架贴上瑕疵标签！`;
        logType = "error";
      } else if (testedGpu?.hasIssue && !isActuallyDefectiveAndFound) {
        logText = `【未查出隐患】花费 ${cost} 元点亮测试卡片。虽然卡片有潜在隐疾，但在 ${accuracy}% 的检测度下居然幸运通过了。评定状态: [正常]！(注: 下手买家依然有概率翻车哦)`;
      }

      const log: GameLog = {
        id: `log_test_${Date.now()}`,
        day: prev.day,
        time: "车间测试",
        text: logText,
        type: logType
      };

      const newState = {
        ...prev,
        cash: prev.cash - cost,
        inventory: updatedGpus,
        actionsLeft: prev.actionsLeft - 1,
        logs: [log, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
  };

  // Add a repair method to handle GPU repair outcome
  const handleRepairGpu = (gpuId: string, improvedCondition: GpuCondition, costDiscountPercentage: number, logMessage: string) => {
    playSound("sell");
    setState(prev => {
      const updatedGpus = prev.inventory.map(gpu => {
        if (gpu.id === gpuId) {
          return {
            ...gpu,
            hasIssue: false,
            testResult: "正常",
            isTested: true,
            condition: improvedCondition,
            boughtPrice: Math.max(100, Math.round(gpu.boughtPrice * (1 - costDiscountPercentage / 100))),
            defectType: undefined
          } as InventoryGpu;
        }
        return gpu;
      });

      const log: GameLog = {
        id: `log_repair_${Date.now()}`,
        day: prev.day,
        time: "维修车间",
        text: logMessage,
        type: "success"
      };

      const newState = {
        ...prev,
        inventory: updatedGpus,
        logs: [log, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
  };

  // 5. Navigate from stock card lists directly to Xianyu Tab list config
  const handleListToXianyu = (gpuId: string) => {
    playSound("click");
    setSelectedGpuIdInXianyu(gpuId); // helper state for transition
    setState(prev => ({ ...prev, activeTab: "xianyu" }));
  };

  // We set selected card in dropdown automatically in Xianyu area
  const setSelectedGpuIdInXianyu = (gpuId: string) => {
    const el = document.getElementById("select-listing-gpu") as HTMLSelectElement;
    if (el) {
      el.value = gpuId;
      // Trigger vanilla event
      const event = new Event('change', { bubbles: true });
      el.dispatchEvent(event);
    }
  };

  // 6. Deduct action point for listing publishing
  const handleDeductAction = () => {
    setState(prev => {
      const newState = {
        ...prev,
        actionsLeft: Math.max(0, prev.actionsLeft - 1)
      };
      saveToStorage(newState);
      return newState;
    });
  };

  // 7. Seller accepts/completes transaction with Xianyu Buyers
  const handleConfirmSale = (gpuId: string, finalBillPrice: number, reputationChange: number, logMessage: string, isCrash: boolean) => {
    playSound(isCrash ? "fail" : "sell");

    setState(prev => {
      const filteredInventory = prev.inventory.filter(g => g.id !== gpuId);
      const newLog: GameLog = {
        id: `log_sale_${Date.now()}`,
        day: prev.day,
        time: "闲鱼极速达成",
        text: logMessage,
        type: isCrash ? "error" : "success"
      };

      const newState = {
        ...prev,
        cash: prev.cash + finalBillPrice,
        inventory: filteredInventory,
        reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange)),
        totalSold: prev.totalSold + 1,
        crashCount: isCrash ? prev.crashCount + 1 : prev.crashCount,
        logs: [newLog, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
  };

  // 8. Next Day system (进入下一天)
  const handleNextDay = () => {
    playSound("click");
    
    // Check if the game should end
    if (state.day >= 30) {
      setState(prev => ({ ...prev, isGameOver: true }));
      return;
    }

    const nextDayNum = state.day + 1;

    // Trigger randomized after-sales claims starting from Day 2 onwards (30% chance)
    const isDisputeTriggered = Math.random() < 0.30;
    if (isDisputeTriggered) {
      const idx = Math.floor(Math.random() * DISPUTE_SCENARIOS.length);
      const chosenTemplate = DISPUTE_SCENARIOS[idx];
      const newDispute: AfterSalesDispute = {
        ...chosenTemplate,
        id: `dispute_${nextDayNum}_${Date.now()}`
      };
      setActiveDispute(newDispute);
    }

    // Trigger randomized major market events: 35% chance
    const isNewEventTriggered = Math.random() < 0.35;
    let nextEvent = null;
    let comment = "今天大盘局势明朗，收卡出卡稳扎稳打最为妥善，切忌贪婪。";

    if (isNewEventTriggered) {
      nextEvent = MARKET_EVENTS[Math.floor(Math.random() * MARKET_EVENTS.length)];
      comment = `${nextEvent.title}: ${nextEvent.desc}`;
    } else {
      comment = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
    }

    // Generate next day standard reference base prices
    const nextPrices = generateDailyPrices(nextDayNum, nextEvent);
    
    // Update histories for chart views
    const nextHistories = { ...state.gpuPriceHistories };
    GPU_PRESETS.forEach(gpu => {
      const todayRef = nextPrices[gpu.name] || gpu.basePrice;
      const historyArr = nextHistories[gpu.name] ? [...nextHistories[gpu.name]] : [gpu.basePrice];
      nextHistories[gpu.name] = [...historyArr, todayRef];
    });

    // Check if dynamic status events happen (25% chance of side notifications)
    let extraSituationLog: GameLog | null = null;
    let extraCashAction: ((s: GameState) => void) | null = null;

    if (Math.random() < 0.25) {
      const randomSit = RANDOM_SITUATIONS[Math.floor(Math.random() * RANDOM_SITUATIONS.length)];
      extraSituationLog = {
        id: `sit_${nextDayNum}_${Date.now()}`,
        day: nextDayNum,
        time: "事件广播",
        text: `【小道头条：${randomSit.title}】${randomSit.desc} ➜ 预估效应: ${randomSit.effectText}`,
        type: "event"
      };
      extraCashAction = randomSit.apply;
    }

    setState(prev => {
      const startDayLog: GameLog = {
        id: `day_${nextDayNum}_intro_log`,
        day: nextDayNum,
        time: "08:30",
        text: `【今日晨会】开启第 ${nextDayNum} 天经营盘。晨语：“${comment}”。大盘涨幅数据已加载，操作额度充盈！`,
        type: "info"
      };

      const updatedLogs = [startDayLog, ...prev.logs];
      if (extraSituationLog) {
        updatedLogs.unshift(extraSituationLog);
      }

      let nextState: GameState = {
        ...prev,
        day: nextDayNum,
        actionsLeft: 5,
        currentEvent: nextEvent,
        gpuPriceFluctuations: nextPrices,
        gpuPriceHistories: nextHistories,
        todayMarketTalk: comment,
        logs: updatedLogs
      };

      // Call side random effects if any
      if (extraCashAction) {
        extraCashAction(nextState);
      }

      // Pre-emptive bankrupt check at start of day
      const estimateAssets = nextState.cash + nextState.inventory.reduce((sum, g) => sum + g.boughtPrice, 0);
      if (nextState.cash < 50 && nextState.inventory.length === 0) {
        nextState.isGameOver = true;
      }

      generateDailyCustomers(nextPrices, nextEvent);
      saveToStorage(nextState);
      
      // Open daily morning briefing popup
      setMorningBroadcast({
        day: nextDayNum,
        quote: comment,
        event: nextEvent,
        prices: nextPrices
      });

      return nextState;
    });
  };

  const handleResolveAfterSalesRefund = (refundCost: number, reputationChange: number, logMsg: string) => {
    setState(prev => {
      const newLog: GameLog = {
        id: `aftersales_${Date.now()}`,
        day: prev.day,
        time: "售后完结",
        text: logMsg,
        type: "deal" as const
      };
      const newState = {
        ...prev,
        cash: Math.max(0, prev.cash - refundCost),
        reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange)),
        logs: [newLog, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
    setActiveDispute(null);
  };

  const handleResolveAfterSalesRepairSuccess = (materialsFee: number, reputationChange: number, logMsg: string) => {
    setState(prev => {
      const newLog: GameLog = {
        id: `aftersales_${Date.now()}`,
        day: prev.day,
        time: "售后保修",
        text: logMsg,
        type: "success" as const
      };
      const newState = {
        ...prev,
        cash: Math.max(0, prev.cash - materialsFee),
        actionsLeft: Math.max(0, prev.actionsLeft - 1),
        reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange)),
        logs: [newLog, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
    setActiveDispute(null);
  };

  const handleResolveAfterSalesRepairFailure = (penaltyCost: number, reputationChange: number, logMsg: string) => {
    setState(prev => {
      const newLog: GameLog = {
        id: `aftersales_${Date.now()}`,
        day: prev.day,
        time: "售后赔罪",
        text: logMsg,
        type: "error" as const
      };
      const newState = {
        ...prev,
        cash: Math.max(0, prev.cash - penaltyCost),
        actionsLeft: Math.max(0, prev.actionsLeft - 1),
        reputation: Math.max(0, Math.min(100, prev.reputation + reputationChange)),
        logs: [newLog, ...prev.logs]
      };
      saveToStorage(newState);
      return newState;
    });
    setActiveDispute(null);
  };

  // Helper storage writes
  const saveToStorage = (newState: GameState) => {
    try {
      localStorage.setItem("gpu_scalper_sim_save", JSON.stringify(newState));
    } catch (e) {
      console.warn("Could not write local storage cache", e);
    }
  };

  // 9. Reset simulated game progression
  const handleReset = () => {
    playSound("click");
    setResetConfirmOpen(true);
  };

  const handleConfirmReset = () => {
    playSound("click");
    const cleared = initGameState("normal");
    setState(cleared);
    setActiveCustomers([]);
    setIntroOpen(true);
    setResetConfirmOpen(false);
    setMorningBroadcast(null);
    setActiveDispute(null);
    try {
      localStorage.removeItem("gpu_scalper_sim_save");
      localStorage.removeItem("gpu_scalper_sim_active_customers");
      localStorage.removeItem("gpu_scalper_sim_morning_broadcast");
      localStorage.removeItem("gpu_scalper_sim_active_dispute");
      localStorage.removeItem("xianyu_selected_gpu_id");
      localStorage.removeItem("xianyu_listing_mode");
      localStorage.removeItem("xianyu_current_offer");
      localStorage.removeItem("xianyu_negotiation");
    } catch (e) {}
  };

  const handleStartWithDifficulty = (diff: "easy" | "normal" | "hard") => {
    playSound("click");
    const init = initGameState(diff);
    init.gameStarted = true;
    setState(init);
    generateDailyCustomers(init.gpuPriceFluctuations, null);
    setIntroOpen(false);
    setMorningBroadcast({
      day: init.day,
      quote: init.todayMarketTalk,
      event: init.currentEvent,
      prices: init.gpuPriceFluctuations
    });
  };

  // Toggle Sound state
  const handleToggleSound = () => {
    setState(prev => {
      const next = { ...prev, soundEnabled: !prev.soundEnabled };
      saveToStorage(next);
      return next;
    });
  };

  // Manual generation trigger to attract regular customers
  const handleRefreshMarketManual = () => {
    playSound("click");
    generateDailyCustomers(state.gpuPriceFluctuations, state.currentEvent);
    setState(prev => {
      const log = {
        id: `manual_attr_${Date.now()}`,
        day: prev.day,
        time: "拉客成功",
        text: "【主动拉客】你成功拉拢了几名新的本地电脑散客交易，快去柜台看看他们的卡片报价！",
        type: "success" as const
      };
      return {
        ...prev,
        logs: [log, ...prev.logs]
      };
    });
  };

  const totalAssetsSum = state.cash + state.inventory.reduce((sum, item) => sum + item.boughtPrice, 0);

  // Failure state verification parameters
  const isOutOfMoneyBankrupt = state.cash < 50 && state.inventory.length === 0;
  const isBannedByReputation = state.reputation < 10;
  const isDrownedInStock = state.inventory.length > 50;
  const isFailureOutcome = isOutOfMoneyBankrupt || isBannedByReputation || isDrownedInStock;

  // Final Day check outcome triggers
  const forceGameOver = state.isGameOver || (state.day >= 30 && state.actionsLeft === 0) || isFailureOutcome;

  let failureReasonText = "";
  if (isOutOfMoneyBankrupt) {
    failureReasonText = "你手里的流动资金已经不足 ¥50 且没有存余货品可倒卖变现。在华强北街头无声失业。";
  } else if (isBannedByReputation) {
    failureReasonText = "因为你在闲鱼或面对客户时砍价太狠、卖假货不测退款纠纷太多，信用指数跌落至 10 以下！已被闲鱼封号、实体店拉横幅曝光，彻底宣告社会性死亡。";
  } else if (isDrownedInStock) {
    failureReasonText = "库存多于 50 张！货架倒塌、库房塞爆。由于资金被存货全部套牢毫无现金流，最终向网贷平台投降。";
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans relative selection:bg-indigo-500 selection:text-white leading-relaxed antialiased">
      
      {/* Absolute top grid canvas background style */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.4)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none" />

      {/* Header bar layout */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center font-black text-white text-base shadow-lg animate-pulse">
            📟
          </div>
          <div>
            <h1 className="text-sm font-black tracking-widest text-zinc-100 uppercase flex items-center gap-1">
              <span>显卡贩子模拟器 v1.0</span>
              <span className="text-[9px] px-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold rounded">LIVE</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-mono">
              Computer Store & GPU Secondary Market trading cabin
            </p>
          </div>
        </div>

        {/* Dynamic header stats tickers */}
        <div className="hidden lg:flex items-center gap-5 text-xs font-mono">
          <div className="text-right">
            <span className="text-zinc-600 font-sans block text-[9px]">DIFFICULTY 等级</span>
            <span className="text-zinc-400 font-bold uppercase">{state.difficulty === "easy" ? "🟢 轻松小白" : state.difficulty === "hard" ? "🔴 困难商人" : "🟡 极乐店长"}</span>
          </div>
          <div className="w-px h-6 bg-zinc-900" />
          <div className="text-right">
            <span className="text-zinc-600 font-sans block text-[9px]">TOTAL VALUE 估算总值</span>
            <span className="text-emerald-400 font-extrabold">{formatCurrency(totalAssetsSum)}</span>
          </div>
        </div>
      </header>

      {/* News-bar marquee inspired by the Technical Dashboard theme */}
      {state.gameStarted && (
        <div className="bg-[#1a202c] border-b border-[#24292e] h-8 flex items-center px-6 text-xs text-[#ffcc00] select-none shrink-0 z-30 relative font-mono overflow-hidden">
          <span className="font-bold shrink-0 mr-3.5 flex items-center gap-1.5 text-xs text-[#ffcc00] tracking-wider animate-pulse">
            <span>⚠️</span>
            <span>MARKET FLASH 实时播报 /:</span>
          </span>
          <marquee scrollamount="3" className="flex-1 text-[11px] font-medium tracking-wide">
            {state.currentEvent 
              ? `【大盘剧烈波动特派】${state.currentEvent.title}: ${state.currentEvent.desc} —— 建议密切关注对应的显卡面值波动！` 
              : `AI算力热度强劲狂飙！RTX 3090/4090 D 价格再度震荡。今日市井传闻：“${state.todayMarketTalk}”。注意防范瑕疵矿卡，闲鱼大刀纠纷风险！`
            }
          </marquee>
        </div>
      )}

      {/* Main Container Dashboard */}
      {state.gameStarted && (
        <main className="flex-1 w-full max-w-7xl mx-auto p-4 lg:p-6 space-y-6 relative z-10">
          
          {/* Dashboard stats components */}
          <Dashboard 
            state={state} 
            onReset={handleReset} 
            toggleSound={handleToggleSound}
            onShowIntro={() => setIntroOpen(true)}
          />

          {/* Three column panel layout */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Column 1: Left control dials */}
            <div id="left-sidebar-controls" className="lg:col-span-1 space-y-4 font-sans">
              
              <div className="border border-zinc-800 bg-zinc-900/40 rounded-2xl p-4.5 space-y-2.5">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2 font-mono">
                  老板核心指令台
                </h3>

                {/* Tab buttons */}
                <div className="flex flex-col gap-2 font-sans font-medium text-xs">
                  
                  <button
                    id="btn-tab-market"
                    onClick={() => handleTabChange("market")}
                    className={`w-full py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between group ${
                      state.activeTab === "market"
                        ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30 font-bold shadow"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>1. 去市场收卡 🏮</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 group-hover:bg-zinc-900">
                      {activeCustomers.length}
                    </span>
                  </button>

                  <button
                    id="btn-tab-inventory"
                    onClick={() => handleTabChange("inventory")}
                    className={`w-full py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between group ${
                      state.activeTab === "inventory"
                        ? "bg-sky-600/10 text-sky-400 border-sky-500/30 font-bold shadow"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Box className="w-4 h-4 text-sky-400 shrink-0" />
                      <span>2. 查看与检测库存 📦</span>
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-950 group-hover:bg-zinc-900">
                      {state.inventory.length}
                    </span>
                  </button>

                  <button
                    id="btn-tab-xianyu"
                    onClick={() => handleTabChange("xianyu")}
                    className={`w-full py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between group ${
                      state.activeTab === "xianyu"
                        ? "bg-amber-600/10 text-amber-400 border-amber-500/30 font-bold shadow"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                      <span>3. 挂闲鱼卖卡 🛍️</span>
                    </span>
                  </button>

                  <button
                    id="btn-tab-trends"
                    onClick={() => handleTabChange("trends")}
                    className={`w-full py-2.5 px-3 rounded-xl border text-left transition flex items-center justify-between group ${
                      state.activeTab === "trends"
                        ? "bg-emerald-600/10 text-emerald-400 border-emerald-500/30 font-bold shadow"
                        : "bg-zinc-900/60 text-zinc-400 border-zinc-800/80 hover:text-zinc-200 hover:bg-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>4. 大盘走势监视屏 📈</span>
                    </span>
                  </button>

                </div>

                <div className="border-t border-zinc-800 pt-3 mt-3">
                  <button
                    id="btn-tab-next-day"
                    onClick={handleNextDay}
                    className="w-full py-3 px-3 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-zinc-950 font-black text-xs tracking-wider text-center shadow-lg hover:shadow-indigo-500/20 active:scale-95 transition flex items-center justify-center gap-1.5"
                  >
                    <span>🛌 进入下一天</span>
                    <span className="font-mono text-[10px] bg-zinc-950/20 text-zinc-950 px-1.5 py-0.5 rounded font-black">
                      Day {state.day} ➜ {state.day + 1}
                    </span>
                  </button>
                  <p className="text-[10px] text-zinc-500 font-mono text-center mt-1.5">
                    进入下一天将恢复5次行动力并大幅波动行情！
                  </p>
                </div>
              </div>

              {/* Rules summary rail */}
              <div className="border border-zinc-900 bg-zinc-950 rounded-xl p-4 space-y-2 shrink-0">
                <span className="text-[10px] font-bold text-zinc-400 tracking-wider font-mono">🎯 达成目标所需（其一满足即可）：</span>
                <ul className="text-[11px] text-zinc-500 list-disc list-inside space-y-1 font-sans">
                  <li>30天期末总资产达到 <strong className="text-zinc-400">¥300,000</strong></li>
                  <li>累计成交买本 <strong className="text-zinc-400">100</strong> 张显卡</li>
                  <li>商家信誉值滚到 <strong className="text-zinc-400">100满分</strong></li>
                </ul>
              </div>

            </div>

            {/* Column 2: Center core play area (2 spans on desktop) */}
            <div id="center-game-area" className="lg:col-span-2 space-y-6">
              {state.activeTab === "market" && (
                <MarketArea 
                  state={state} 
                  customers={activeCustomers} 
                  onBuyCard={handleBuyCard} 
                  onBargain={handleBargain} 
                  onRejectCustomer={handleRejectCustomer}
                  onRefreshMarket={handleRefreshMarketManual}
                  onBuyBlackMarket={handleBuyBlackMarket}
                />
              )}

              {state.activeTab === "inventory" && (
                <InventoryArea 
                  state={state} 
                  onDetectGpu={handleDetectGpu} 
                  onListToXianyu={handleListToXianyu}
                  onRepairGpu={handleRepairGpu}
                />
              )}

              {state.activeTab === "xianyu" && (
                <XianyuArea 
                  state={state} 
                  onConfirmSale={handleConfirmSale}
                  onDeductAction={handleDeductAction}
                />
              )}

              {state.activeTab === "trends" && (
                <TrendsArea state={state} />
              )}
            </div>

            {/* Column 3: Right log console section */}
            <div id="right-logs-area" className="lg:col-span-1 h-full min-h-[550px] lg:min-h-[620px]">
              <StatsLogs logs={state.logs} />
            </div>

          </div>

        </main>
      )}

      {/* Intro Modal Rules explanation on Startup */}
      {introOpen && (
        <div id="intro-modal-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div id="intro-modal-card" className="bg-zinc-950 border border-zinc-800 max-w-lg w-full rounded-3xl p-8 space-y-6 animate-zoomIn relative">
            
            <div className="space-y-2 text-center">
              <span className="text-3xl">📟</span>
              <h2 className="text-xl font-black text-zinc-100 tracking-wide mt-1">
                欢迎加盟：赛博显卡商战起航
              </h2>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                你将化身为成都华强北电脑城的一名显卡二道商。目标通过倒买倒卖、拼命砍价、排查缺陷和规避损毁，把本金做强做大！
              </p>
            </div>

            {/* Rules guidelines cards */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1 text-xs font-sans leading-relaxed text-zinc-300">
              
              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1">
                <div className="font-bold text-indigo-400 flex items-center gap-1">
                  <span>🏮 1. 行情与商户收卡</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  每天有 3 到 5 名各种奇特背景散客在显卡市场叫价卖货。多打量他们的宝贝！用自带测算相比今天市场价的大概盈利。嫌贵？没关系！你有两次对其狠劲砍价的机会，砍中便宜买入，砍崩对方拉黑掉。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1">
                <div className="font-bold text-sky-400 flex items-center gap-1">
                  <span>🔬 2. 检测隐疾以防到手刀</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  吃下来的卡往往伴随“暗病”。千万别直接甩上闲鱼！若是没测过被精明或不轨买家收到测试当场翻车，容易遭遇十几点信誉狂降和高额索赔。花费50至500元点亮/GPU-Z深度烤机或3DMark烤机，如实贴出检测，即可立于不败之地！
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1">
                <div className="font-bold text-amber-400 flex items-center gap-1">
                  <span>🛍️ 3. 闲鱼上架大本营</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  挂牌闲鱼提供三种模式：拼命甩货快速变现（大降价，90%被拍）、行情价中等变卖、和黑心高价等有缘大水鱼。如上所述，注意防范拿着显卡指指点点的无常买家！
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-900/40 border border-zinc-900 space-y-1">
                <div className="font-bold text-rose-500">
                  <span>🚨 4. 临终破产界限</span>
                </div>
                <p className="text-zinc-400 text-[11px]">
                  如果信誉小于 10，闲鱼或柜台会被查封；如果兜里没钱且无片货（现金不足 ¥50）则倒闭；如30天期满未能实现 300,000 资产或达成 100 张售卡，商战也会退回新手村！
                </p>
              </div>

            </div>

            {/* Select difficulty to begin */}
            <div className="space-y-3 pt-2">
              <label className="text-xs font-semibold text-zinc-400 text-center block">
                【请选择你的商海战役起点难度，立即起航】：
              </label>

              <div className="grid grid-cols-3 gap-2 font-mono">
                <button
                  id="btn-start-easy"
                  onClick={() => handleStartWithDifficulty("easy")}
                  className="p-2.5 rounded-xl border border-emerald-900/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/20 tracking-wider text-[11px] font-bold text-center transition py-3"
                >
                  🟢 轻松小白<br/>
                  <span className="text-[9px] text-zinc-500 font-normal">本金8万 | 初始高信誉</span>
                </button>

                <button
                  id="btn-start-normal"
                  onClick={() => handleStartWithDifficulty("normal")}
                  className="p-2.5 rounded-xl border border-indigo-900/30 bg-indigo-950/20 text-indigo-400 hover:bg-indigo-900/20 tracking-wider text-[11px] font-bold text-center transition py-3"
                >
                  🟡 极乐店长<br/>
                  <span className="text-[9px] text-zinc-500 font-normal">本金5万 | 信誉正常</span>
                </button>

                <button
                  id="btn-start-hard"
                  onClick={() => handleStartWithDifficulty("hard")}
                  className="p-2.5 rounded-xl border border-rose-905/30 bg-rose-950/20 text-rose-400 hover:bg-rose-900/20 tracking-wider text-[11px] font-bold text-center transition py-3 animate-pulse"
                >
                  🔴 困难商人<br/>
                  <span className="text-[9px] text-zinc-500 font-normal">本金3万 | 信誉低寒</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* 🔄 Custom Reset Game Confirmation Modal */}
      {resetConfirmOpen && (
        <div id="reset-confirm-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div id="reset-confirm-card" className="bg-zinc-950 border border-rose-900/40 max-w-sm w-full rounded-2xl p-6 space-y-5 text-center shadow-xl animate-zoomIn">
            <div className="w-12 h-12 rounded-full bg-rose-900/20 text-rose-400 border border-rose-500/30 flex items-center justify-center text-2xl mx-auto">
              ⚠️
            </div>
            
            <div className="space-y-1">
              <h3 className="text-zinc-100 font-black text-sm tracking-wide">
                确认清理账本重新开局？
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                确定要清理当前的所有显卡大盘、可用本金以及库存进度并回到 D1 天重新开始商战吗？先前的进度将永久丢失！
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3.5 font-sans pt-2">
              <button
                id="btn-cancel-reset"
                onClick={() => {
                  playSound("click");
                  setResetConfirmOpen(false);
                }}
                className="py-2.5 rounded-lg border border-zinc-800 bg-zinc-900 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition"
              >
                先留着继续玩
              </button>
              
              <button
                id="btn-confirm-reset"
                onClick={handleConfirmReset}
                className="py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-lg transition active:scale-95"
              >
                确认清除并重开 ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* final Victory/Loss modal recaps */}
      {forceGameOver && (
        <VictoryModal 
          cash={state.cash}
          inventoryCost={state.inventory.reduce((sum, item) => sum + item.boughtPrice, 0)}
          day={state.day}
          reputation={state.reputation}
          totalBought={state.totalBought}
          totalSold={state.totalSold}
          crashCount={state.crashCount}
          isFailure={isFailureOutcome || (state.day >= 30 && totalAssetsSum < 300000)}
          failureReason={failureReasonText}
          onRestart={() => {
            const cleared = initGameState("normal");
            setState(cleared);
            setActiveCustomers([]);
            setIntroOpen(true);
            setMorningBroadcast(null);
            setActiveDispute(null);
            try {
              localStorage.removeItem("gpu_scalper_sim_save");
              localStorage.removeItem("gpu_scalper_sim_active_customers");
              localStorage.removeItem("gpu_scalper_sim_morning_broadcast");
              localStorage.removeItem("gpu_scalper_sim_active_dispute");
              localStorage.removeItem("xianyu_selected_gpu_id");
              localStorage.removeItem("xianyu_listing_mode");
              localStorage.removeItem("xianyu_current_offer");
              localStorage.removeItem("xianyu_negotiation");
            } catch (e) {}
          }}
        />
      )}

      {/* 🚨 After-Sales Dispute popup */}
      {!forceGameOver && activeDispute && (
        <AfterSalesModal
          state={state}
          dispute={activeDispute}
          onResolveRefund={handleResolveAfterSalesRefund}
          onResolveRepairSuccess={handleResolveAfterSalesRepairSuccess}
          onResolveRepairFailure={handleResolveAfterSalesRepairFailure}
        />
      )}

      {/* 🌤️ Morning status broadcast glassmorphism popup */}
      {!forceGameOver && morningBroadcast && (
        <MorningBroadcastModal 
          day={morningBroadcast.day}
          quote={morningBroadcast.quote}
          event={morningBroadcast.event}
          prices={morningBroadcast.prices}
          onClose={() => setMorningBroadcast(null)}
        />
      )}

      {/* Minimal Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-6 text-center text-xs text-zinc-600 font-mono relative z-10 w-full">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span>🎮 《显卡贩子模拟器》 2026 年度首版 | 好玩 ＋ 好看 ＋ 真实电脑商倒卖生活</span>
          <span>用 React 19 + Tailwind CSS 高精构建</span>
        </div>
      </footer>

    </div>
  );
}
