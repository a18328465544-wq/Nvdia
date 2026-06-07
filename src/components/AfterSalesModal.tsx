/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ShieldAlert, 
  Wrench, 
  Wind, 
  Sparkles, 
  DollarSign, 
  Users, 
  ThumbsUp, 
  ThumbsDown,
  AlertTriangle,
  Clock
} from "lucide-react";
import { GameState } from "../types";

export interface AfterSalesDispute {
  id: string;
  customerName: string;
  avatar: string;
  complaintGpu: string;
  message: string;
  refundCost: number;
  materialsFee: number;
  gameType: "paste" | "dust";
}

interface AfterSalesModalProps {
  state: GameState;
  dispute: AfterSalesDispute;
  onResolveRefund: (refundCost: number, reputationChange: number, logMsg: string) => void;
  onResolveRepairSuccess: (materialsFee: number, reputationChange: number, logMsg: string) => void;
  onResolveRepairFailure: (penaltyCost: number, reputationChange: number, logMsg: string) => void;
}

export const AfterSalesModal: React.FC<AfterSalesModalProps> = ({
  state,
  dispute,
  onResolveRefund,
  onResolveRepairSuccess,
  onResolveRepairFailure
}) => {
  const [phase, setPhase] = useState<"intro" | "playing" | "success" | "failed">("intro");
  const [timeLeft, setTimeLeft] = useState<number>(10);
  const [gameProgress, setGameProgress] = useState<number>(0);

  // Minigame internal data
  const [dustSpots, setDustSpots] = useState<{ id: number; x: number; y: number; cleaned: boolean; size: number }[]>([]);
  const [pasteNodes, setPasteNodes] = useState<{ id: number; x: number; y: number; pasted: boolean; label: string }[]>([]);

  // Sound trigger helper using window.AudioContext safe fallbacks
  const triggerBeep = (freq: number, duration: number) => {
    if (!state.soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
  };

  // Timer Effect
  useEffect(() => {
    if (phase === "playing") {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("failed");
            triggerBeep(220, 0.4);
            return 0;
          }
          if (prev <= 4) {
            triggerBeep(330, 0.1); // Hurry sound
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Start specific repair game
  const handleStartRepair = () => {
    triggerBeep(440, 0.1);
    setTimeLeft(10);
    setGameProgress(0);

    if (dispute.gameType === "dust") {
      const spots = Array.from({ length: 6 }).map((_, i) => ({
        id: i,
        x: 20 + Math.random() * 60,
        y: 20 + Math.random() * 60,
        cleaned: false,
        size: 18 + Math.round(Math.random() * 12)
      }));
      setDustSpots(spots);
    } else {
      const nodes = [
        { id: 1, x: 50, y: 50, pasted: false, label: "GPU 芯片中心 - Core Center" },
        { id: 2, x: 25, y: 35, pasted: false, label: "左侧相变显存 - VRAM L" },
        { id: 3, x: 75, y: 35, pasted: false, label: "右侧相变显存 - VRAM R" },
        { id: 4, x: 25, y: 65, pasted: false, label: "主供电MOS管 - VRM A" },
        { id: 5, x: 75, y: 65, pasted: false, label: "滤波电感排 - VRM B" },
      ];
      setPasteNodes(nodes);
    }
    setPhase("playing");
  };

  // Click handler for Dust Game
  const handleCleanDust = (id: number) => {
    triggerBeep(523, 0.05); // High beep
    const updated = dustSpots.map(s => {
      if (s.id === id) return { ...s, cleaned: true };
      return s;
    });
    setDustSpots(updated);
    const cleanedCount = updated.filter(s => s.cleaned).length;
    const progress = Math.round((cleanedCount / updated.length) * 100);
    setGameProgress(progress);
    if (progress >= 100) {
      setPhase("success");
      triggerBeep(880, 0.25);
    }
  };

  // Click handler for Paste Game
  const handleApplyPaste = (id: number) => {
    triggerBeep(587, 0.05); // Shorter high beep
    const updated = pasteNodes.map(n => {
      if (n.id === id) return { ...n, pasted: true };
      return n;
    });
    setPasteNodes(updated);
    const pastedCount = updated.filter(n => n.pasted).length;
    const progress = Math.round((pastedCount / updated.length) * 100);
    setGameProgress(progress);
    if (progress >= 100) {
      setPhase("success");
      triggerBeep(880, 0.25);
    }
  };

  // Resolve with direct cash refund
  const handlePayRefund = () => {
    triggerBeep(440, 0.1);
    const logText = `【🚨 售后和平退款】面对买家 ${dispute.customerName} 关于 ${dispute.complaintGpu} 的强烈控诉，你忍痛退还了 ¥${dispute.refundCost} 作为全额/部分赔偿。买家称赞你“良心店家”，信誉度得到了完美的温和回升 (+6信誉)！`;
    onResolveRefund(dispute.refundCost, 6, logText);
  };

  // End processes
  const handleFinishSuccess = () => {
    const logText = `【🔧 售后神医保修】你通过 ${dispute.gameType === "dust" ? "【深度清灰与轴油注入】" : "【相变原厂硅脂翻新】"} 方案，现场免费给 ${dispute.customerName} 翻新保修了 ${dispute.complaintGpu}！买家拿回亮机性能超强、冰凉静音的卡后惊叹于你的维修本领。只损耗了 ¥${dispute.materialsFee} 材料费，保住了口碑信誉度 (-2信誉，但避开了大跌)！`;
    onResolveRepairSuccess(dispute.materialsFee, -2, logText);
  };

  const handleFinishFailure = () => {
    const penalty = Math.round(dispute.refundCost * 0.4); // 40% refund penalty on fail
    const logText = `【💢 售后抢修失败】很遗憾，对 ${dispute.complaintGpu} 的免费抢修在限时 10 秒内超时了！买家大发雷霆，认为你是“二流庸医＋拖延作秀”，投诉到网络大盘平台导致你被迫交纳补偿 ¥${penalty} 并遭遇恶评轰炸 (-15信誉)！`;
    onResolveRepairFailure(penalty, -15, logText);
  };

  return (
    <div id="aftersales-dispute-backdrop" className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div id="aftersales-dispute-card" className="bg-zinc-950 border-2 border-rose-600/30 max-w-lg w-full rounded-3xl p-6.5 space-y-6 shadow-[0_0_50px_rgba(225,29,72,0.15)] animate-zoomIn relative">
        
        {/* Glowing header indicators */}
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-rose-600 text-zinc-950 font-black font-mono px-4 py-1 rounded-full text-xs tracking-widest flex items-center gap-1 shadow-md uppercase">
          <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
          <span>售后纠纷拦截处理</span>
        </div>

        {/* Phase A: Introduction & Decision Panel */}
        {phase === "intro" && (
          <div className="space-y-5.5">
            <div className="flex items-center gap-3.5 border-b border-zinc-900 pb-4">
              <span className="text-4xl filter drop-shadow">{dispute.avatar}</span>
              <div>
                <h3 className="typo-title-sm text-zinc-100">{dispute.customerName} - 售后维权申诉中</h3>
                <p className="typo-mono-tiny">涉及产品：<span className="text-zinc-300 font-bold">{dispute.complaintGpu}</span></p>
              </div>
            </div>

            {/* Simulated Chat Message Bubble */}
            <div className="bg-rose-950/20 border border-rose-900/30 rounded-2xl p-4 text-xs text-rose-300 leading-relaxed font-sans shadow-inner relative">
              <div className="absolute -top-2 left-6 bg-zinc-950 px-2 text-xs text-rose-400 font-mono font-bold">📢 维权买家控诉原声：</div>
              <p className="italic">“{dispute.message}”</p>
            </div>

            {/* Option A: Refund details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/30 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="typo-title-xs text-teal-400 flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-teal-400" />
                    方案一：破财消灾
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    向其全额退款补偿 <strong className="text-zinc-200">¥{dispute.refundCost}</strong>。快速解决纠纷。
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-500 border-t border-zinc-900 pt-2 shrink-0">
                    <span>信誉改变量:</span>
                    <span className="text-emerald-400 font-bold">+6 信誉 (温和回升)</span>
                  </div>
                  <button
                    id="btn-aftersales-refund"
                    disabled={state.cash < dispute.refundCost}
                    onClick={handlePayRefund}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-zinc-950 font-black text-xs transition active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {state.cash < dispute.refundCost ? `余额充足不足 ¥${dispute.refundCost}` : `支付退款 ¥${dispute.refundCost}`}
                  </button>
                </div>
              </div>

              {/* Option B: Repair details */}
              <div className="border border-rose-900/10 rounded-xl p-4 bg-zinc-900/30 space-y-3.5 flex flex-col justify-between">
                <div className="space-y-1">
                  <h4 className="typo-title-xs text-amber-400 flex items-center gap-1">
                    <Wrench className="w-4 h-4 text-amber-400" />
                    方案二：保修翻修挑战
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    扣除本天 <strong className="text-zinc-200">1点</strong> 额外行动时间，买家强制要求你帮他清灰/换硅脂进行<strong>保修</strong>！
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-mono text-zinc-500 border-t border-zinc-900 pt-2 shrink-0">
                    <span>保修工本材料:</span>
                    <span className="text-red-400 font-bold">¥{dispute.materialsFee} 辅料费</span>
                  </div>
                  <button
                    id="btn-aftersales-repair"
                    disabled={state.cash < dispute.materialsFee}
                    onClick={handleStartRepair}
                    className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-400 text-zinc-950 font-black text-xs transition active:scale-95 disabled:opacity-40"
                  >
                    开始 10s 免费保修挑战
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Phase B: Playing Repair Minigames */}
        {phase === "playing" && (
          <div className="space-y-5 text-center">
            
            {/* Countdown and progress details */}
            <div className="flex justify-between items-center bg-zinc-900/60 p-3 rounded-xl border border-zinc-900 font-mono text-xs">
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">保修剩余时限:</span>
                <span className={`font-black text-sm tracking-widest ${timeLeft <= 3 ? "text-rose-500 animate-pulse" : "text-amber-400"}`}>
                  ⏱️ {timeLeft}s
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-500">对准覆盖程度:</span>
                <span className="text-emerald-400 font-black text-sm">{gameProgress}%</span>
              </div>
            </div>

            {/* Glowing active progress bar */}
            <div className="w-full bg-zinc-900 h-2 bg-gradient-to-r rounded-lg overflow-hidden border border-zinc-900/50">
              <div 
                className="bg-gradient-to-r from-sky-400 to-emerald-400 h-full transition-all duration-300 shadow-[0_0_10px_rgba(56,189,248,0.4)]"
                style={{ width: `${gameProgress}%` }}
              />
            </div>

            {/* Sub-game 1: Fan dust spots click */}
            {dispute.gameType === "dust" ? (
              <div className="space-y-2">
                <div className="text-xs text-zinc-400 italic">【超声波气吹清灰】连续点击风扇上的黄色陈年灰尘疙瘩并予以吹散！</div>
                <div className="h-44 w-full bg-zinc-900/40 border border-zinc-800/60 rounded-xl relative overflow-hidden flex items-center justify-center">
                  
                  {/* Decorative rotative ventilators */}
                  <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-20">
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-sky-400 animate-spin" style={{ animationDuration: "5s" }} />
                    <div className="w-20 h-20 rounded-full border-2 border-dashed border-sky-400 animate-spin" style={{ animationDuration: "5s" }} />
                  </div>

                  {dustSpots.map((spot) => (
                    <button
                      key={spot.id}
                      id={`aftersales-dust-${spot.id}`}
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
                          ? "opacity-0 scale-50 pointer-events-none duration-500 bg-teal-500"
                          : "bg-amber-500/25 border border-amber-400/80 hover:bg-amber-300/40 hover:scale-110 shadow-md"
                      }`}
                    >
                      {!spot.cleaned && (
                        <span className="text-xs font-black text-amber-200">💨</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Sub-game 2: Liquid metal paste nodes click */
              <div className="space-y-2">
                <div className="text-xs text-zinc-400 italic">【固态硅脂均匀敷设】依次精密点击所有高发热区域让导热垫完美贴紧：</div>
                <div className="h-44 w-full bg-zinc-900/40 border border-zinc-800/60 rounded-xl relative overflow-hidden flex items-center justify-center">
                  
                  <div className="absolute inset-14 border border-teal-500/10 bg-zinc-950 rounded pointer-events-none flex flex-col items-center justify-center">
                    <div className="text-xs font-mono text-zinc-600 tracking-wider">SILICON CHIP DIE</div>
                  </div>

                  {pasteNodes.map((node) => (
                    <button
                      key={node.id}
                      id={`aftersales-paste-${node.id}`}
                      onClick={() => handleApplyPaste(node.id)}
                      disabled={node.pasted}
                      style={{
                        left: `${node.x}%`,
                        top: `${node.y}%`,
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 px-2 py-1 rounded-md text-xs font-mono border font-extrabold shadow-sm transition-all duration-300 ${
                        node.pasted
                          ? "bg-teal-950/60 text-teal-400 border-teal-500/40"
                          : "bg-zinc-800 border-zinc-600 hover:border-teal-500 hover:text-zinc-200"
                      }`}
                    >
                      <span>{node.pasted ? "✔️ 满油" : "⚪ 指向"}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Phase C: Repair Challenge Win/Success */}
        {phase === "success" && (
          <div className="space-y-4.5 text-center py-2.5">
            <div className="w-14 h-14 rounded-full bg-teal-900/40 text-teal-400 border border-teal-500/50 flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
              🎉
            </div>
            
            <div className="space-y-1.5">
              <h3 className="typo-title-sm text-zinc-100 uppercase">工匠绝活：售后完美修复！</h3>
              <p className="typo-body-regular max-w-sm mx-auto">
                你靠着电脑台前的绝顶技艺，完美完成了这次免费的售后抢修调试！买家测试后彻底折服，不再追索任何退款。
              </p>
            </div>

            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 max-w-xs mx-auto space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">保修辅料花费:</span>
                <span className="text-red-400 font-bold">-¥{dispute.materialsFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">金币退款退还:</span>
                <span className="text-emerald-400 font-bold">¥0 完美避过！</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">信誉波动评价:</span>
                <span className="text-yellow-500 font-bold">-2信誉 (轻微磨损)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-aftersales-finish-success"
                onClick={handleFinishSuccess}
                className="px-6 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-zinc-950 font-extrabold text-xs tracking-wider transition active:scale-95 shadow-md"
              >
                递回显卡，笑面送客
              </button>
            </div>
          </div>
        )}

        {/* Phase D: Repair Challenge Lost/Failure */}
        {phase === "failed" && (
          <div className="space-y-4.5 text-center py-2.5">
            <div className="w-14 h-14 rounded-full bg-rose-950/40 text-rose-400 border border-rose-500/30 flex items-center justify-center text-3xl mx-auto animate-pulse">
              💀
            </div>
            
            <div className="space-y-1.5">
              <h3 className="typo-title-sm text-zinc-100 uppercase">彻底完蛋：保修砸了招牌！</h3>
              <p className="typo-body-regular max-w-xs mx-auto">
                你折腾半天却由于焊锡不精或除尘超时搞毁了电路，让本就生气的买家认为你在耍滑头，当众拉横幅对你无情指责！
              </p>
            </div>

            <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800 max-w-xs mx-auto space-y-1.5 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-zinc-500">强制交纳和事款:</span>
                <span className="text-red-400 font-bold">-¥{Math.round(dispute.refundCost * 0.4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">口碑声誉处罚:</span>
                <span className="text-rose-500 font-black">-15信誉 (遭遇差评轰炸)</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="btn-aftersales-finish-failure"
                onClick={handleFinishFailure}
                className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs tracking-wider transition active:scale-95 shadow-md"
              >
                交款赔罪，认栽拉黑
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
