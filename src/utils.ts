/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GpuPreset, GpuCondition, InventoryGpu, MarketCustomer, GameState, MarketEvent } from "./types";
import { 
  GPU_PRESETS, 
  LATENT_DEFECTS,
  SELLER_NAME_PREFIXES,
  SELLER_NAME_SUFFIXES,
  CUSTOMER_AVATARS,
  BACKSTORY_TEMPLATES,
  DAILY_QUOTES
} from "./data";

// Helper to generate a unique SN
export function generateSn(gpuName: string): string {
  const cleanName = gpuName.replace(/[\s]/g, "");
  const randHex = Math.floor(100000 + Math.random() * 900000).toString(16).toUpperCase();
  return `SN-${cleanName}-${randHex.slice(0, 4)}`;
}

// Convert numbers into pretty currency strings
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
    maximumFractionDigits: 0
  }).format(value);
}

// Map condition to risk and price multiplier
export function getConditionAttributes(condition: GpuCondition) {
  switch (condition) {
    case GpuCondition.BrandNew:
      return { riskOffset: -15, priceMultiplier: 1.25, badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" };
    case GpuCondition.PersonalUse:
      return { riskOffset: 0, priceMultiplier: 1.0, badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30" };
    case GpuCondition.Netbar:
      return { riskOffset: 15, priceMultiplier: 0.85, badgeColor: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" };
    case GpuCondition.Miner:
      return { riskOffset: 30, priceMultiplier: 0.70, badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30" };
    case GpuCondition.Repaired:
      return { riskOffset: 45, priceMultiplier: 0.55, badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30" };
    case GpuCondition.Corpse:
      return { riskOffset: 95, priceMultiplier: 0.05, badgeColor: "bg-red-950 text-red-500 border-red-900 animate-pulse font-bold" };
    default:
      return { riskOffset: 0, priceMultiplier: 1.0, badgeColor: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30" };
  }
}

// Create daily price table with random noise and current event factor
export function generateDailyPrices(day: number, currentEvent: MarketEvent | null): Record<string, number> {
  const prices: Record<string, number> = {};
  
  GPU_PRESETS.forEach(gpu => {
    // Standard random noise: -5% to +5%
    let noise = 1 + (Math.random() * 10 - 5) / 100;
    
    // High-end cards (4080, 4090, 5090) fluctuate more (-8% to +8%)
    if (gpu.basePrice >= 7000) {
      noise = 1 + (Math.random() * 16 - 8) / 100;
    }
    
    let baseWithNoise = gpu.basePrice * noise;
    
    // Apply event modifiers if applicable
    if (currentEvent && currentEvent.affectGpus.includes(gpu.name)) {
      baseWithNoise = baseWithNoise * currentEvent.priceShiftMultiplier;
    }
    
    prices[gpu.name] = Math.round(baseWithNoise);
  });
  
  return prices;
}

// Create a randomized seller customer offering a GPU
export function generateRandomSeller(id: string, dailyPrices: Record<string, number>, currentEvent: MarketEvent | null): MarketCustomer {
  const gpuPreset = GPU_PRESETS[Math.floor(Math.random() * GPU_PRESETS.length)];
  const conditions = Object.values(GpuCondition);
  // Pick random condition with weighted index (mostly Personal Use and Miner, less Repaired and BrandNew)
  const conditionPool = [
    GpuCondition.PersonalUse, GpuCondition.PersonalUse,
    GpuCondition.Miner, GpuCondition.Miner,
    GpuCondition.Netbar, GpuCondition.BrandNew, GpuCondition.Repaired
  ];
  const condition = conditionPool[Math.floor(Math.random() * conditionPool.length)];
  const condAttrs = getConditionAttributes(condition);
  
  // Calculate raw market value based on condition multiplier and today's base price
  const marketPrice = dailyPrices[gpuPreset.name];
  const targetMarketWorth = marketPrice * condAttrs.priceMultiplier;
  
  // The seller wants to sell. Their asking price will be around 82% to 103% of condition-adjusted price
  const askPriceModifier = 0.82 + Math.random() * 0.21; // 82% to 103%
  let askPrice = Math.round(targetMarketWorth * askPriceModifier);
  
  // Clean up asking price to make it end with some zeroes or look natural
  askPrice = Math.round(askPrice / 50) * 50;
  
  // Determine if it has latent issues (暗病) based on condition probability
  const baseRisk = gpuPreset.risk + condAttrs.riskOffset;
  const hasIssue = Math.random() * 100 < baseRisk;
  
  // 1. Choose dynamic customer name from prefixes & suffixes (thousands of combinations)
  const first = SELLER_NAME_PREFIXES[Math.floor(Math.random() * SELLER_NAME_PREFIXES.length)];
  const last = SELLER_NAME_SUFFIXES[Math.floor(Math.random() * SELLER_NAME_SUFFIXES.length)];
  const name = first + last;
  
  // 2. Pick dynamic avatar
  const avatar = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)];
  
  // 3. Craft dynamic tailored backstory (includes specific card references & meme elements)
  const baseBackstoryTemplate = BACKSTORY_TEMPLATES[Math.floor(Math.random() * BACKSTORY_TEMPLATES.length)];
  const talk = baseBackstoryTemplate
    .replace(/显卡/g, gpuPreset.name)
    .replace(/3090/g, gpuPreset.name)
    .replace(/4090/g, gpuPreset.name);
  
  // Pick defect type
  const defect = LATENT_DEFECTS[Math.floor(Math.random() * LATENT_DEFECTS.length)];
  
  return {
    id,
    name,
    avatar,
    kind: condition, // e.g. "个人自用", "网吧卡", "矿卡"
    gpuName: gpuPreset.name,
    condition,
    askPrice,
    talk,
    hiddenRisk: hasIssue ? defect.desc : "一切正常",
    hasIssue,
    canBargain: true,
    bargainedCount: 0,
    currentAskPrice: askPrice
  };
}

// Calculate bargaining success probability & actual response
// Options: original, bargain_5, bargain_10
export function evaluateBargain(
  customer: MarketCustomer,
  bargainType: "bargain_5" | "bargain_10",
  reputation: number
): { success: boolean; finalPrice: number; text: string; repPenalty: number } {
  const discountRate = bargainType === "bargain_5" ? 0.05 : 0.10;
  const targetPrice = Math.round(customer.currentAskPrice * (1 - discountRate));
  
  // Calculate success base rate: higher reputation -> higher success
  // A steeper bargain reduces chance
  let baseOdds = discountRate === 0.05 ? 75 : 45;
  
  // Reputation effect (range 0 to 100, 50 is base)
  const repBonus = (reputation - 50) * 0.5; // up to +25% or -25%
  let finalOdds = baseOdds + repBonus;
  
  // Some conditions are harder to bargain
  if (customer.condition === GpuCondition.BrandNew) {
    finalOdds -= 15; // brand new sellers know its actual value
  } else if (customer.condition === GpuCondition.Repaired || customer.condition === GpuCondition.Miner) {
    finalOdds += 20; // miner sellers want to get rid of cards quickly
  }
  
  // Caps
  finalOdds = Math.max(8, Math.min(95, finalOdds));
  const success = Math.random() * 100 < finalOdds;
  
  if (success) {
    const funnySuccessReplies = [
      `砍价成功！对方叹了口气拍大腿说道：“行行行，算你狠！看你是个爽快老板，就按 ${targetPrice} 给你，交个朋友，记得V我50请客！”`,
      `成交！对方一拍即合：“大盘风暴多，亏了也当奉献。就按 ${targetPrice} 出给你，钱转支付宝，顺丰邮费自理啊！”`,
      `谈判得手！对方嘿嘿直笑：“老板你这张金嘴能把烂铁说成黄金， ${targetPrice} 拿走吧！以后有别的卡升级还找你！”`
    ];
    return {
      success: true,
      finalPrice: targetPrice,
      text: funnySuccessReplies[Math.floor(Math.random() * funnySuccessReplies.length)],
      repPenalty: 0
    };
  } else {
    // Failure! Depending on discount, seller might walk away
    const walkAway = discountRate === 0.10 || Math.random() < 0.45;
    let text = "";
    let repPenalty = 0;
    
    if (walkAway) {
      const walkAwayQuotes = [
        `谈判彻底破裂！对方怒发冲冠：“你这四十米大砍刀比拼多多百亿补贴还要黑！不诚心收就麻溜退，再见拉黑！”对方摔门而去。`,
        `生意吹了！对方撇了撇嘴：“拿我当大冤种呢？这可是国行带修保真卡，你去别处收伊拉克水洗矿卡吧！”客户反手把你拉黑了。`,
        `谈崩了！对方气不打一处来：“你这砍价技术在贴吧也就一级，不跟你废话，我找隔壁强子去了！”对方愤愤下线。`
      ];
      text = walkAwayQuotes[Math.floor(Math.random() * walkAwayQuotes.length)];
      repPenalty = discountRate === 0.10 ? 3 : 1; // bargaining 10% and failing hurts rep slightly
    } else {
      text = `对方冷笑一声摇了摇头：“这太便宜了老板，本来买卡金手指就没磨，最多只能按原价 ${customer.currentAskPrice} 给你，少一分都不出一张，爱收不收！”`;
    }
    
    return {
      success: false,
      finalPrice: walkAway ? -1 : customer.currentAskPrice, // -1 means walked away
      text,
      repPenalty
    };
  }
}

// Generate Xianyu buyer request based on inventory item (Meme-enriched)
export function generateXianyuBuyer(
  gpu: InventoryGpu,
  listingPrice: number,
  listingMode: "quick" | "normal" | "high",
  reputation: number
): { hasBuyer: boolean; buyer?: any; logText?: string } {
  // Chance of buyer contact based on price mode
  let baseChance = 0;
  if (listingMode === "quick") {
    baseChance = 95; // almost guaranteed buy
  } else if (listingMode === "normal") {
    baseChance = 58 + (reputation - 50) * 0.35; // middle chance adjusted by rep
  } else if (listingMode === "high") {
    baseChance = 22 + (reputation - 50) * 0.18; // low chance
  }
  
  // Caps
  baseChance = Math.max(8, Math.min(99, baseChance));
  const isContacted = Math.random() * 100 < baseChance;
  
  if (!isContacted) {
    return { hasBuyer: false };
  }
  
  // Dynamic buyers with extremely customized internet quotes and specific cards
  const buyerKinds = [
    {
      kind: "不问来路爽快哥",
      talks: [
        "在吗？卡外观差不多就行，只要不是水洗得掉渣直接发货。明天全款顺丰航空发出，钱不是问题！",
        "哥们，爽快人。刚好今天我工资发了，直接拍了，记得帮我用泡泡纸包满，少一粒扣你分！"
      ],
      offerModifier: 1.0,
      refundRisk: false
    },
    {
      kind: "贴吧大刀客",
      talks: [
        "少300块我立刻秒，少一分我都觉得你是在理财。爽快点改价，我手头还差50块吃KFC！",
        "拼多多全新补贴也就这个价，老板你这二手卡挂传家宝呢？少改个吉利数字我拍了！"
      ],
      offerModifier: 0.9,
      refundRisk: false
    },
    {
      kind: "小白呼吸灯玩家",
      talks: [
        "请问这个显卡烤箱烤过吗？能畅玩黑神话悟空吗？最重要的是散热的呼吸灯能不能和我的呼吸同步发亮？",
        "鲁大师跑分能到多少万？玩4399和原神卡不卡？我只要无拆无修亮晶晶的，你会写保修书给我吗？"
      ],
      offerModifier: 1.0,
      refundRisk: true // naive player might panic and ask for refund on minor stuff
    },
    {
      kind: "微炼丹AI研究生",
      talks: [
        "在吗？听说你手里这货是24G大显存。我想买两块在宿舍偷偷跑DeepSeek-R1蒸馏和微调，价格微超无所谓，核心只要没缩肛就行，发个跑飞机的拷机视频吧！",
        "确认是原厂PCB吗？我微调Llama-3需要稳定电压。爽快拍了，顺丰包装加固一下，写论文全靠它了。"
      ],
      offerModifier: 1.04,
      refundRisk: false
    },
    {
      kind: "到手刀恶魔",
      talks: [
        "卡拍了，你明天赶紧发！不过先丑话说在前头，我会亲自拆解、金手指除锈并上双烤机。稍微有一丝啸叫或者温度超过65度，直接找客服退你300，不退就淘宝投诉！",
        "买了。但我事先提醒你，现在的快递经常摔，收货后哪怕背板有一丁点细微划痕，直接申请到手折扣200元，省得大家扯皮退货！"
      ],
      offerModifier: 1.0,
      refundRisk: true // 100% chance they will attempt to squeeze a refund ("到手刀")
    }
  ];
  
  // Filter appropriate buyers based on VRAM/High end
  let availableBuyers = [...buyerKinds];
  if (gpu.name.includes("3090") || gpu.name.includes("4090") || gpu.name.includes("5090")) {
    // Keep AI buyers
  } else {
    // No AI buyers for lower memory cards
    availableBuyers = availableBuyers.filter(b => b.kind !== "微炼丹AI研究生");
  }
  
  const chosenTemplate = availableBuyers[Math.floor(Math.random() * availableBuyers.length)];
  const rawTalk = chosenTemplate.talks[Math.floor(Math.random() * chosenTemplate.talks.length)];
  const talk = rawTalk.replace(/显卡/g, gpu.name);
  
  // Calculate final offer price from buyer
  let finalOffer = Math.round(listingPrice * chosenTemplate.offerModifier);
  finalOffer = Math.round(finalOffer / 50) * 50;
  
  const buyerId = Math.random().toString();
  const rawNames = ["暴走垃圾佬", "图拉丁小金刚", "猫娘DeepSeek", "考研落榜的阿豪", "同城自提大叔", "爽快大学生", "疯狂V我50"];
  const name = rawNames[Math.floor(Math.random() * rawNames.length)];
  
  // Customize avatar for buyer
  const buyerAvatar = CUSTOMER_AVATARS[Math.floor(Math.random() * CUSTOMER_AVATARS.length)];
  
  return {
    hasBuyer: true,
    buyer: {
      id: buyerId,
      name: `${name} (${chosenTemplate.kind})`,
      avatar: buyerAvatar,
      kind: chosenTemplate.kind,
      gpuId: gpu.id,
      offerPrice: finalOffer,
      talk: talk,
      isToShouDaoChance: chosenTemplate.refundRisk
    }
  };
}

// Calculate the title at day 30 based on final balance
export function getEndingResults(cash: number, totalBought: number, totalSold: number, crashCount: number) {
  let title = "亏麻了小老板";
  let summary = "你这30天过得简直像坐过山车。收卡的时候怕矿，卖卡的时候被大刀客疯狂压价。你这手艺还不如去搬砖呢！";
  
  if (cash >= 1000000) {
    title = "赛博华强北显卡大亨";
    summary = "高山仰止！你是真正的显卡垄断巨头，进货如喝水，囤货如炒股，顺丰甚至为您调拨了专属重卡。全国显卡交易大厅和贴吧卡友圈全是您的不败传说！您对DeepSeek、大金手指、小蓝片的规律了如指掌！";
  } else if (cash >= 500000) {
    title = "显卡囤货大亨 / 华强北白手套";
    summary = "太强了！不仅顺利达成三十万暴富目标，你还完美捉到了AI大热和4090禁售大盘的所有狂暴红利。炒卡如炒股，低买高卖成了你的刻骨记忆，同行看见你都得恭恭敬敬买一桶原味鸡递过来！";
  } else if (cash >= 300000) {
    title = "4090囤货战神";
    summary = "极为优秀的显卡商贩！你稳扎稳打克制贪念，虽然在闲鱼遭遇了几次硬核‘到手刀’，但靠着极强的烤机测试手段排除暗病，大捞特捞了一笔。";
  } else if (cash >= 150000) {
    title = "成都闲置显卡小弟";
    summary = "日子勉强过得去，赚了个温饱。今天帮大学生查查显存挣个两百，明天跑个自提换个鸡腿，虽然没有一夜暴富，但至少懂得了怎么识破矿老板的大金手指！";
  } else if (cash >= 60000) {
    title = "闲鱼拼多多大刀客受害者";
    summary = "虽然小赚几万，但你大半的利润全在闲鱼和线下交易里被极品‘到手刀’和‘呼吸灯对齐大师’给刀走了！下次收卡长点心眼，一定要疯狂双烤！";
  }
  
  return { title, summary };
}

// Default state initializer (Dynamic and fresh on every start!)
export function initGameState(difficulty: "easy" | "normal" | "hard" = "normal"): GameState {
  let startingCash = 50000;
  let startingRep = 50;
  if (difficulty === "easy") {
    startingCash = 80000;
    startingRep = 70;
  } else if (difficulty === "hard") {
    startingCash = 30000;
    startingRep = 35;
  }
  
  const defaultPrices = generateDailyPrices(1, null);
  const histories: Record<string, number[]> = {};
  GPU_PRESETS.forEach(gpu => {
    histories[gpu.name] = [gpu.basePrice];
  });
  
  // Ensure that every time a new game is started, the daily quotes, initial notes and welcome are randomized from the meme dictionary!
  const shuffledInitialMemeQuote = DAILY_QUOTES[Math.floor(Math.random() * DAILY_QUOTES.length)];
  
  return {
    cash: startingCash,
    day: 1,
    reputation: startingRep,
    inventory: [],
    logs: [
      {
        id: "init_1",
        day: 1,
        time: "09:00",
        text: `【开业大吉】华强北显卡商战正式打响！初始本金 ${formatCurrency(startingCash)} 已经到账，目标在 30 天内狠狠大捞一笔，冲！`,
        type: "success"
      },
      {
        id: "init_2",
        day: 1,
        time: "09:05",
        text: `【业界名言】“买家会欺骗，但拷机甜甜圈绝不撒谎。” 检测显卡、点击砍价均有机会识别各种小蓝片、海盐氧化水洗矿等暗病！`,
        type: "info"
      }
    ],
    totalBought: 0,
    totalSold: 0,
    crashCount: 0,
    actionsLeft: 5,
    currentEvent: null,
    activeTab: "market",
    difficulty,
    gpuPriceFluctuations: defaultPrices,
    gpuPriceHistories: histories,
    isGameOver: false,
    gameStarted: false,
    soundEnabled: true,
    todayBestDeal: "暂无成交",
    todayMarketTalk: `【晨曦看盘】：${shuffledInitialMemeQuote} 今天的二手卡柜台依然烟火气十足。`
  };
}
