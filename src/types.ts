/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum GpuCondition {
  BrandNew = "全新",
  PersonalUse = "个人自用",
  Netbar = "网吧卡",
  Miner = "矿卡",
  Repaired = "维修卡",
  Corpse = "尸体卡"
}

export interface GpuPreset {
  name: string;
  basePrice: number;
  risk: number; // base risk: 0-100
}

export interface InventoryGpu {
  id: string; // unique ID
  name: string;
  sn: string; // unique serial number
  boughtDay: number;
  boughtPrice: number;
  currentMarketPrice: number; // base price + daily fluctuations
  condition: GpuCondition;
  risk: number; // actual calculated risk of issues
  hasIssue: boolean; // hidden defective issue (暗病)
  // Removed `isTested` — redundant with testResult: "未检测" means untested
  testResult: "未检测" | "正常" | "有暗病";
  issueKnown: boolean; // if the player has uncovered the issue
  defectType?: string; // description of the issue if found
}

export interface MarketCustomer {
  id: string;
  name: string;
  avatar: string;
  // Removed `kind` — redundant with condition (was always set to condition)
  condition: GpuCondition;
  gpuName: string;
  // Removed `askPrice` — redundant with currentAskPrice (initial value is the same)
  currentAskPrice: number;
  talk: string;
  hiddenRisk: string; // defect message
  hasIssue: boolean;
  canBargain: boolean;
  bargainedCount: number; // times player negotiated
}

export interface XianyuListing {
  gpu: InventoryGpu;
  listingPrice: number;
  listingMode: "quick" | "normal" | "high"; // 快速出货, 正常挂价, 高价挂
}

export interface XianyuBuyer {
  id: string;
  name: string;
  avatar: string;
  kind: string; // "爽快哥", "刀客", "到手刀", "小白玩家", "AI玩家", "本地自提哥"
  gpuId: string;
  offerPrice: number;
  talk: string;
  isToShouDaoChance: boolean; // whether they might request a refund after buying ("到手刀")
}

export interface GameLog {
  id: string;
  day: number;
  time: string; // HH:MM
  text: string;
  type: "info" | "success" | "warn" | "error" | "event" | "deal";
}

export interface GameState {
  cash: number;
  day: number;
  reputation: number;
  inventory: InventoryGpu[];
  logs: GameLog[];
  totalBought: number;
  totalSold: number;
  crashCount: number;
  actionsLeft: number;
  currentEvent: MarketEvent | null;
  activeTab: "market" | "inventory" | "xianyu" | "trends";
  difficulty: "easy" | "normal" | "hard";
  gpuPriceFluctuations: Record<string, number>; // current day prices
  gpuPriceHistories: Record<string, number[]>; // price history for charts
  isGameOver: boolean;
  gameStarted: boolean;
  soundEnabled: boolean;
  todayBestDeal: string;
  todayMarketTalk: string;
}

export interface MarketEvent {
  title: string;
  desc: string;
  effect: string;
  affectGpus: string[]; // affected card names
  priceShiftMultiplier: number; // e.g. 1.15 for +15%
}