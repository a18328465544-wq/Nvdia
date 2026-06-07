/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GpuPreset, MarketEvent } from "./types";

// GPU Presets
export const GPU_PRESETS: GpuPreset[] = [
  { name: "RTX 3060 12G", basePrice: 1300, risk: 20 },
  { name: "RTX 3070", basePrice: 1800, risk: 25 },
  { name: "RTX 3080", basePrice: 3200, risk: 35 },
  { name: "RTX 3090", basePrice: 5200, risk: 40 },
  { name: "RTX 4070 Super", basePrice: 4300, risk: 18 },
  { name: "RTX 4080 Super", basePrice: 7000, risk: 15 },
  { name: "RTX 4090", basePrice: 18000, risk: 28 },
  { name: "RTX 5090", basePrice: 28000, risk: 45 }
];

// Extensively expanded funny latent defects (暗病描述)
export const LATENT_DEFECTS = [
  { type: "轻微花屏", desc: "刚进甜甜圈就出现两条粉嫩的彩色横线，老板当场战术后仰，大呼‘寄！’" },
  { type: "风扇噪音超大", desc: "主轴轴承磨损，转起来像水泥搅拌机在狂野咆哮，放桌上甚至能把键盘震飞。" },
  { type: "显存温度极高", desc: "导热垫彻底老化化成水，显存跑个古墓丽影直接飙到115度，随时准备表演‘机箱自燃’。" },
  { type: "核心缩缸不稳定", desc: "默频玩3DMark必闪退，必须在小飞机里降频600Mhz、加压10%才能勉强苟住亮机。" },
  { type: "供电元件修补", desc: "背板抠开一看，全是手工电烙铁飞线和隔夜发黄松香焦黑的痕迹，犹如微型手工作坊杰作。" },
  { type: "接口氧化/水洗绿霉", desc: "HDMI口和DP口长出一层青碧的铜锈，估计之前在沿海矿场的水淋屋里洗过阳光浴。" },
  { type: "小蓝片核心重植", desc: "背板中间盖着芯片翻新常用的‘小蓝片’垫片，核心实则是从另一张报废卡上拿热风枪吹下来重植金球的‘缝合怪’！" },
  { type: "网瘾蟑螂遗体", desc: "拆开风扇罩，赫然掉出两只烤得干脆的网吧蟑螂，机箱散散发着一股雪碧混杂红牛的奇妙包厢烟味。" },
  { type: "电容虚焊掉件", desc: "背面密密麻麻的MLCC小贴片电容秃了一小块，不超频没事，一开游戏电脑立马化身‘黑屏收音机’。" },
  { type: "水洗海盐风味", desc: "散热鳍片缝隙里全是一层洗不净的白色小盐粒和残留除锈剂，这卡绝对游过泳，高低是个高仿干货！" },
  { type: "电气性彻底报废/物理焦炭", desc: "【深夜黑市特供】核心背后PCB已经烧出指甲盖大小的焦炭黑洞，内部铜线全部熔断。插电即炸，属于真正电学意义上的尸体！" },
  { type: "水泥重配重模型", desc: "【深夜黑市特供】散热罩下根本没有核心硅片，居然粘着一块用黑胶固定且一模一样重的水泥土块，金手指全是用黄色水彩笔画上去的工艺美术品！" }
];

// Expanded funny and meme-rich Market Events
export const MARKET_EVENTS: MarketEvent[] = [
  {
    title: "深夜黑市开启：冒险者的摸金天堂",
    desc: "后巷那没有监控的死胡同里亮起了诡异紫红霓虹。大批黑商不提供保修、来路不明低调摆摊。虽然这里有机会以极其便宜的草根价格淘到RTX 4090/5090极品卡，但也伴随着极高概率买到完全无法开机的‘尸体卡’！",
    effect: "「黑市区开启」可在收卡区域点击【深夜黑市淘货】。耗费1⚡与少量保证金即摸即开，高额刺激博弈！",
    affectGpus: ["RTX 3090", "RTX 4090", "RTX 5090"],
    priceShiftMultiplier: 1.0
  },
  {
    title: "DeepSeek-R1 本地微调狂飙",
    desc: "全网大学生、独立开发者人手一个‘本地满血版DeepSeek’，24G高端卡惨遭全网扫货，直接断货！",
    effect: "RTX 3090、4090、5090 行情暴涨 20%，溢价严重，大显存就是真理！",
    affectGpus: ["RTX 3090", "RTX 4090", "RTX 5090"],
    priceShiftMultiplier: 1.20
  },
  {
    title: "《黑神话：悟空》Steam在线人数打破纪录",
    desc: "新版本发售，连村口王大爷都想开光追看孙悟空。老旧GTX全线退役，玩家怒吼‘没有RTX不配成佛’！",
    effect: "经典甜品卡 RTX 3060, 3070, 4070 系列价格大涨 10%，买盘强劲！",
    affectGpus: ["RTX 3060 12G", "RTX 3070", "RTX 4070 Super"],
    priceShiftMultiplier: 1.10
  },
  {
    title: "币圈暴跌大山崩 矿难来临！",
    desc: "某种空气币一夜暴跌99%，矿场连夜拔网线，大卡车拖着几万张显卡在菜市场门口论斤卖！",
    effect: "中端老卡 RTX 3070, 3080 行情血崩跌 18%！但市面上大量‘满油矿卡’泛滥，风险大增！",
    affectGpus: ["RTX 3070", "RTX 3080"],
    priceShiftMultiplier: 0.82
  },
  {
    title: "老黄刀法失误，全新禁售风波",
    desc: "爆出神秘禁售代号法令，黄牛和屯货怪在贴吧群聚狂欢，连夜改标价，把4090捧成理财神器！",
    effect: "顶配卡 RTX 4090 / RTX 5090 行情暴力拉升 25%！投投机者满仓跟进！",
    affectGpus: ["RTX 4095", "RTX 4090", "RTX 5090"],
    priceShiftMultiplier: 1.25
  },
  {
    title: "AI大炼丹时代：全球显存熔断性缺货",
    desc: "由于多模态大语言模型与AI绘画全面爆发，三星与SK海力士的GDDR6/GDDR7显存产能被科技巨头以惊天价格整船买断！显存颗粒极度紧缺，市面上大显存二手显卡瞬间被炼丹师们抢空！",
    effect: "顶级大显存卡 RTX 3090、RTX 4090、RTX 5090 市场价格暴涨 30%！买盘极其强劲！",
    affectGpus: ["RTX 3090", "RTX 4090", "RTX 5090"],
    priceShiftMultiplier: 1.30
  },
  {
    title: "RTX 5090 掉 ROPs 硬件设计缩水灾难",
    desc: "爆出最新批次的 RTX 5090 光栅化处理器（ROPs）疑似存在严重硬件级屏蔽缺陷，光栅渲染效能骤降15%！各大数码评测UP主联合锤翻老黄，引发全网顶级硬件发烧友愤怒退货！",
    effect: "万元神卡 RTX 5090 信仰破灭，今日大盘暴跌 15%！是抄底还是避雷由你抉择！",
    affectGpus: ["RTX 5090"],
    priceShiftMultiplier: 0.85
  },
  {
    title: "RTX 5090 12V-2x6 接头高温融化危机",
    desc: "全球多名贴吧发烧友反映，全新 5090 旗舰卡在跑 600W 满载双烤测试时，由于供电线轻微弯折，供电口在大电流下温度突破150度，引发插头严重融化变形甚至机箱起火！玩家人人自危，生怕一觉醒来房子没了。",
    effect: "高端卡 RTX 5090 市场接盘信心崩塌，行情遭遇寒流下跌 12%！",
    affectGpus: ["RTX 5090"],
    priceShiftMultiplier: 0.88
  },
  {
    title: "RTX 4090 / RTX 5090 中美算力管制禁售风令",
    desc: "重磅出口管制法案正式执行，合规算力上限进一步收紧，RTX 4090 与 RTX 5090 即日起禁止在华销售与代工！全国各大电商渠道连夜高价下架，海关严打水货，华强北现货瞬间成为绝版神卡！",
    effect: "理财理财神卡降临！RTX 4090 与 RTX 5090 二手大盘价格疯狂飙涨 40%！有货就是印钞机！",
    affectGpus: ["RTX 4090", "RTX 5090"],
    priceShiftMultiplier: 1.40
  },
  {
    title: "海关严打‘小蓝片’拼装走私卡",
    desc: "某深圳港口查获十万张用报废颗粒和重植核心拼出来的改装显卡。市场行货买家信心崩盘！",
    effect: "RTX 3080 / 4080 / 3090 等二手卡价格暴跌 15%，收卡价格可往下狠狠一刀！",
    affectGpus: ["RTX 3080", "RTX 3090", "RTX 4080 Super"],
    priceShiftMultiplier: 0.85
  },
  {
    title: "国家以旧换新百亿补贴大放水",
    desc: "买全新国行显卡直接补贴 2000 元！玩家纷纷惊呼‘买二手的纯属冤大头’，全去抢新卡了！",
    effect: "中高端 RTX 4070 Super, 4080 Super 二手市场无人问津，降价 12% 抛售！",
    affectGpus: ["RTX 4070 Super", "RTX 4080 Super"],
    priceShiftMultiplier: 0.88
  },
  {
    title: "拼多多百亿大砍刀：‘砍到 0 元免费送’",
    desc: "拼多多联合各大显卡厂商推出整机、配件暴砍活动，数万张3060和3070全网直降抛售！",
    effect: "RTX 3060 12G 和 3070 二手行情重挫 12%，老板们小心被套牢！",
    affectGpus: ["RTX 3060 12G", "RTX 3070"],
    priceShiftMultiplier: 0.88
  },
  {
    title: "疯狂星期四，全场‘V我50’",
    desc: "肯德基强力联动，全市场显卡贩子都去抢吮指原味鸡。今天交易市场直接冰封，大家只收不卖！",
    effect: "大盘老卡 RTX 3080, 4080 价格微跌 5%，流动性暂时锁定！",
    affectGpus: ["RTX 3080", "RTX 4080 Super"],
    priceShiftMultiplier: 0.95
  },
  {
    title: "老黄惊爆超级背刺：Super-Ultra 狂砍大降价",
    desc: "英伟达毫无预兆地在深夜发布了全新 RTX 40 Super-Ultra 升级款，性能翻倍的同时官方售价直接拦腰砍半！大批持卡屯货准备赚个盆满钵满的炒卡倒爷惨遭迎头痛击，泪洒华强北，哀鸿遍野！",
    effect: "次旗舰 RTX 4080 Super 与 RTX 4070 Super 价格雪崩暴跌 30%！倒爷今晚集体天台集合！",
    affectGpus: ["RTX 4070 Super", "RTX 4080 Super"],
    priceShiftMultiplier: 0.70
  },
  {
    title: "AI初创公司暴雷破产 20万张大显存卡惨遭清算抛售",
    desc: "某明星AI大模型独角兽由于盲目烧钱宣告破产清算，爆出‘首席架构师抱走一卡车显卡抵工资’奇闻。数万张本用于大算力训练的高端 RTX 3090 / 4090 显卡被法院批量强行超低价整箱拍卖，造成大盘价格严重踩踏！",
    effect: "发烧级大显存卡 RTX 3090、4090 遭遇史诗级崩盘，今日暴跌 25%！炼丹师狂喜！",
    affectGpus: ["RTX 3090", "RTX 4090"],
    priceShiftMultiplier: 0.75
  },
  {
    title: "《幻兽帕鲁》热度血崩 帕鲁黑奴集体下班砸机抛售",
    desc: "爆火网络游戏《幻兽帕鲁》在线人数暴减 90%，千万寝室熬夜孵蛋的帕鲁‘赛博黑奴’纷纷砸掉服务器。大批为了多开挂机倒腾装备而高价收来的甜品卡、中端主力卡被狂风暴雨般低价倒逼涌入闲鱼！",
    effect: "中端性价比主力卡 RTX 3060 12G、3070 价格瞬间跌入马里亚纳海沟 22%！",
    affectGpus: ["RTX 3060 12G", "RTX 3070"],
    priceShiftMultiplier: 0.78
  },
  {
    title: "量子计算重大突破 晶圆显卡沦为‘历史暖手宝’",
    desc: "顶尖科研所宣告‘常温超导千比特量子芯片在实验室量产成功’，并宣称未来一块手表级量子芯片算力可以模拟全地表硅基显卡！发烧友、极客黄牛群里人人惶恐，纷纷降价甩货跑路，生怕砸手里成传家垃圾！",
    effect: "天价发烧卡 RTX 5090、4090、4080 Super 的高端溢价彻底泡沫化，暴跌 24%！",
    affectGpus: ["RTX 4080 Super", "RTX 4090", "RTX 5090"],
    priceShiftMultiplier: 0.76
  },
  {
    title: "大快人心！国家突击查封非法地下AI炼丹基地",
    desc: "多部门联合突击清剿了位于西南某省的庞大‘挂羊头卖狗肉’地下高能耗AI炼丹重镇，拉闸断电。老板为求自保并躲避罚款，连夜指使小弟将大批现货伪装成自用卡，以跳楼白菜价扔进小黄鱼二手大盘！",
    effect: "顶级卡 RTX 3090, 4090 行情雪上加霜，行情暴跌 20%！老板含泪大撒网！",
    affectGpus: ["RTX 3090", "RTX 4090"],
    priceShiftMultiplier: 0.80
  },
  {
    title: "精仿GPU核心流入市场：买卖卡堪比开盲盒",
    desc: "贴吧爆出有黑心手工作坊利用最新高精打印翻新技术，制作出外观和GPU-Z测试参数百分百一模一样的‘仿真核心’显卡，实则跑三分钟游戏即融化。玩家、散户信任破裂，大盘接盘信心彻底冰封！",
    effect: "主流走量中端卡 RTX 3070、RTX 3080、RTX 4070 Super 暴跌 18%！全网退避三舍！",
    affectGpus: ["RTX 3070", "RTX 3080", "RTX 4070 Super"],
    priceShiftMultiplier: 0.82
  }
];

// Funny hardware, scalper dynamics, and trading commentary memes
export const DAILY_QUOTES = [
  "今天 4090 的价格能买一辆成色不错的二手QQ，这已经不是显卡，这是华强北黄金。",
  "贴吧又爆出‘小白买3080翻车到手缩缸’的热帖，现在全网买家都在玩双烤甜甜圈，别想糊弄了。",
  "俗话说得好：‘一卡有难，八方点亮’。今天去菜市场，连卖猪肉的都在问我要不要跑AI。 ",
  "闲鱼大刀客今天出没异常频繁！有人问我：‘学生，送我，不送你就不是中国人。’我当场脑梗塞。",
  "DeepSeek本地跑起来之后，3090 24G 翻身做主把歌唱，老旧大显存卡比帅小伙还受欢迎！",
  "今天的行情像过山车。上午：‘老板，便宜点出！’下午：‘老子不卖了，明天法案禁售！’",
  "显卡贩子的铁律第一条：宁收伊拉克自用卡，不上矿老板的黄金车。那风扇声转起来和直升机没区别。",
  "隔壁王强昨天收了一张‘全新仅拆封’，拆开发现核心居然用的是GT610，急得当场报了警。",
  "华强北名言：‘只要导热贴贴得足，矿卡也能变公主。’今天进货务必带上手电筒仔细摸！",
  "网络热梗：‘V我50，今晚帮你看着4090跑24小时甜甜圈。’不过真的有人跑出焦味了。"
];

// Shuffled and expanded dynamic situations
export const RANDOM_SITUATIONS = [
  {
    title: "大学生整顿二手市场",
    desc: "一名穿着连帽衫的清纯大学生来店里，手持自制‘显卡瑕疵多维度评估书’砍价：‘老板，你这RGB灯有点偏色，建议少200，不然我就发大字报发小红书！’",
    effectText: "破财消灾，损失 300 现金但店铺名誉暴涨 (信誉+5)",
    apply: (state: any) => {
      state.reputation = Math.min(100, state.reputation + 5);
      state.cash = Math.max(0, state.cash - 300);
      state.logs.unshift({
        id: Math.random().toString(),
        day: state.day,
        time: "10:11",
        text: "面临有备而来的整顿流大学生，你战术同意并打折300元送走，换来了满大街‘这家老板老好人’的名声！信誉+5。",
        type: "success"
      });
    }
  },
  {
    title: "偶遇疯狂星期四 V 我 50",
    desc: "附近一家肯德基新开张，大盘顺丰小哥群里全体高呼‘今天疯狂星期四V我50’。你顺应潮流，给经常发货的大哥们转了 150 元鸡腿费。",
    effectText: "顺丰大哥大喜过望，本期快递全部闪电发出且打包加厚",
    apply: (state: any) => {
      state.cash = Math.max(0, state.cash - 150);
      state.logs.unshift({
        id: Math.random().toString(),
        day: state.day,
        time: "11:50",
        text: "发红包请顺丰大哥吃疯狂星期四，物流效率超级加倍，后续货物受大汉小心看护！",
        type: "success"
      });
    }
  },
  {
    title: "到手刀大师暗影突袭",
    desc: "昨天卖出的一张显卡在闲鱼上被买家退回，对方表示‘虽然跑分一切正常，但散热呼吸灯的频率和我的呼吸不一致，很难受，必须刀我150，不然不确认。’",
    effectText: "名誉与金钱的抉择：直接扣除 150 息事宁人",
    apply: (state: any) => {
      state.cash = Math.max(0, state.cash - 150);
      state.logs.unshift({
        id: Math.random().toString(),
        day: state.day,
        time: "14:22",
        text: "遇到了极品‘呼吸灯对齐大师’刀客，你咬着牙转过去150元。对付无赖，省时间才是真理！",
        type: "warn"
      });
    }
  },
  {
    title: "DeepSeek 本地老哥上门求教",
    desc: "一个戴着厚黑框眼镜的技术男推门进来，拿着他的旧 3090：“老板，我想微调我自制的‘猫娘DeepSeek’跑崩溃了，求你用专业测试机帮我查查显存！”",
    effectText: "完成检测并指点迷津，获得打赏与信誉",
    apply: (state: any) => {
      state.reputation = Math.min(100, state.reputation + 4);
      state.cash += 450;
      state.logs.unshift({
        id: Math.random().toString(),
        day: state.day,
        time: "15:30",
        text: "成功帮AI极客排查出‘显存积灰过热’问题，并指导其对齐。AI技术男大喜打赏 450 元！信誉+4。",
        type: "success"
      });
    }
  },
  {
    title: "华强北‘小蓝片’贴纸假货警告",
    desc: "你听说市场上惊现一批RTX 3070贴假金手指翻新出售的，属于重灾区。你连夜在黑板上画出防骗示意图，引来附近商铺纷纷围观赞赏！",
    effectText: "信誉攀升 +3",
    apply: (state: any) => {
      state.reputation = Math.min(100, state.reputation + 3);
      state.logs.unshift({
        id: Math.random().toString(),
        day: state.day,
        time: "17:40",
        text: "你利用华强北金手指识别指南帮助同行避开大雷，全街尊称你为‘防雷战神’。信誉+3！",
        type: "info"
      });
    }
  },
  {
    title: "拼多多‘砍一刀’群求助",
    desc: "你的多年老同学给你发消息：‘在吗，帮我拼多多点一下，差 0.01 金币就能拿到这张 3060 优惠券了！’你硬着头皮下载并点了一下，顺便抽中了满减券！",
    effectText: "获得百亿补贴顺风耳优势，信息流敏锐度提升",
    apply: (state: any) => {
      state.cash += 100;
      state.logs.unshift({
        id: Math.random().toString(),
        day: state.day,
        time: "18:05",
        text: "给同学帮砍一刀，自己意外白嫖了100元满减返现红包！拼多多，真有你的！",
        type: "success"
      });
    }
  },
  {
    title: "⚠️ 警告：华强北黄金铺位租金到期！",
    desc: "物业管理员拿着收费收据和查封用红胶水在店门口敲起了铁卷门：‘兄弟，这个月的黄金柜台商铺管理费和房租 2,500 元到期了！没钱交？今天不仅要拉闸停电，还要直接依法查扣搬走你的显卡抵债！’",
    effectText: "强制扣缴房租 2,500 元。现金不足时，将强制将你库存里的显卡按进货价 60% 拖走折旧抵扣房租！",
    apply: (state: any) => {
      const rentFee = 2500;
      if (state.cash >= rentFee) {
        state.cash -= rentFee;
        state.logs.unshift({
          id: Math.random().toString(),
          day: state.day,
          time: "09:00",
          text: `【房租账单】你全额付清了本月华强北黄金专柜租金 ¥2,500 元。虽然账面资金流失，但商铺好歹保住了。`,
          type: "warn"
        });
      } else {
        // Cash is not enough! Force mortgage process!
        let shortage = rentFee - state.cash;
        state.cash = 0; // Seize all remaining cash first
        let mortgagedGpusDesc: string[] = [];
        state.inventory = [...state.inventory];
        
        while (shortage > 0 && state.inventory.length > 0) {
          // Sort to mortgage high value card first
          state.inventory.sort((a: any, b: any) => b.boughtPrice - a.boughtPrice);
          const gpuToSeize = state.inventory.shift();
          if (gpuToSeize) {
            const val = Math.round(gpuToSeize.boughtPrice * 0.60);
            shortage -= val;
            mortgagedGpusDesc.push(`${gpuToSeize.name}(原进价 ¥${gpuToSeize.boughtPrice} 抵为 ¥${val})`);
            if (shortage < 0) {
              state.cash = Math.abs(shortage);
              shortage = 0;
            }
          }
        }
        
        if (shortage > 0) {
          state.logs.unshift({
            id: Math.random().toString(),
            day: state.day,
            time: "09:15",
            text: `【☠️ 债务破产危机！】无力交齐柜台房租（仍有 ¥${shortage} 欠款未清），且你已抵押了仓库中【所有显卡】（共扣押 ${mortgagedGpusDesc.join("、 ")}），当前现金亦为 0 元！请火速收卡赚差价，否则随时因零资金零代售在下回合破产离场！`,
            type: "error"
          });
        } else {
          state.logs.unshift({
            id: Math.random().toString(),
            day: state.day,
            time: "09:15",
            text: `【⛓️ 房租强制重组】可用现金不足！物业强制执法将你库存的高档卡进行折价抵充房租：[${mortgagedGpusDesc.join(", ")}]。由于显卡强行抵扣，房租已结清，账户找零 ¥${state.cash} 元。经营风险大大增加！`,
            type: "error"
          });
        }
      }
    }
  },
  {
    title: "🔥 事故：精密双烤测试平台意外起火短路！",
    desc: "由于前天收入了一张未经清洗测试、核心严重短路烧毁的高漏电‘黑市大雷卡’，导致价值不菲的专业直流电烤机稳压电源与测试主板当场发出剧烈爆炸火花并全线起火，还将正在跑甜甜圈排查的维修小哥的手给大面积烫伤了！你必须承担设备重置与工伤医药医疗费赔偿共 3,800 元！",
    effectText: "必须赔付事故损失 3,800 元！若账面现金不够，华强北调解办将支持强制扣押仓库中的显卡以进价 60% 粗暴抵销工伤和赔款债务！",
    apply: (state: any) => {
      const damageFee = 3800;
      if (state.cash >= damageFee) {
        state.cash -= damageFee;
        state.logs.unshift({
          id: Math.random().toString(),
          day: state.day,
          time: "10:00",
          text: `【工伤及设备事故账单】你以全额现金 ¥3,800 元支付了测试台起火及维修小哥的重置医药补偿。虽然钱包遭遇重创，但起码避过了法律维权诉讼。`,
          type: "warn"
        });
      } else {
        // Cash is not enough! Force mortgage process!
        let shortage = damageFee - state.cash;
        state.cash = 0; // Take all remaining cash
        let mortgagedGpusDesc: string[] = [];
        state.inventory = [...state.inventory];
        
        while (shortage > 0 && state.inventory.length > 0) {
          // Sort to mortgage high value card first
          state.inventory.sort((a: any, b: any) => b.boughtPrice - a.boughtPrice);
          const gpuToSeize = state.inventory.shift();
          if (gpuToSeize) {
            const val = Math.round(gpuToSeize.boughtPrice * 0.60);
            shortage -= val;
            mortgagedGpusDesc.push(`${gpuToSeize.name}(原进价 ¥${gpuToSeize.boughtPrice} 抵为 ¥${val})`);
            if (shortage < 0) {
              state.cash = Math.abs(shortage);
              shortage = 0;
            }
          }
        }
        
        if (shortage > 0) {
          state.logs.unshift({
            id: Math.random().toString(),
            day: state.day,
            time: "10:15",
            text: `【☠️ 医疗索赔违约警告！】测试台自燃并烫伤事故导致你欠下一文不名的 ¥3,800 重量赔付债务，扣押抵扣完仓库内【所有库存显卡】（共折旧：${mortgagedGpusDesc.join("、 ")}）后，仍存在 ¥${shortage} 金额赔付缺口！小哥家属拉横幅抗议，信誉遭遇毁灭性打击！`,
            type: "error"
          });
        } else {
          state.logs.unshift({
            id: Math.random().toString(),
            day: state.day,
            time: "10:15",
            text: `【⛓️ 工伤扣货偿付】资金断流！因支付不起高昂的测试台重置及烫伤小哥医药费，司法调解组强行扣存处置了你的资产宝贝：[${mortgagedGpusDesc.join(", ")}]。工伤及烧毁事件平息，账户找零 ¥${state.cash} 元。痛定思痛，平时记得多跑双烤防患于未然！`,
            type: "error"
          });
        }
      }
    }
  }
];

// Rich pools of customer profile parameters to dynamically generate infinite funny combinations
export const SELLER_NAME_PREFIXES = [
  "不懂行的小", "急回血的", "暴躁的", "同城自提", "考研上岸的", "刚下飞机的", "微调小白", 
  "爱打游戏但怕老婆的", "网吧倒闭的", "工作室跑路的", "换苹果敲代码的", "宿舍断电的",
  "玩黑神话爆金币的", "嫌风扇太吵的", "信越7921战术大仙", "拼多多砍单狂魔", "退游自消退的",
  "只想V50的", "急凑疯狂星期四路费的", "家里有矿但也怕缩缸的", "国行保真箱全的", "被封号求退坑的"
];

export const SELLER_NAME_SUFFIXES = [
  "老哥", "大学生", "准研究生", "黄牛克星", "数码极客", "大叔", "阿强", "学长", "老王", 
  "网管小哥", "AI炼丹师", "硬件垃圾佬", "技术宅", "张总", "前矿老板", "跑分帝", "贴吧基友"
];

// Funny avatars for diverse profiles
export const CUSTOMER_AVATARS = [
  "👨‍🎓", "🧑‍💻", "🎒", "🧔", "👨", "🚬", "🤵", "🧥", "☕", "🕶️", "💼", "🖥️", "🤠", "📿", "🛵", "🧢", "📱", "👓", "🎧", "🕹️", "🦁", "🐵", "🛹"
];

// Funny core arguments/talk templates
export const BACKSTORY_TEMPLATES = [
  "【出卡缘由】：女朋友把我电脑砸了，说我天天抱在手里跑 DeepSeek ，还给生成的AI猫娘买皮肤！不说了，急用钱回血，爽快的来！",
  "【自用声明】：真的只是平时写写毕业论文，打打 4399 网页小游戏。这卡金手指极新，甚至带有大学宿舍的汗水香味，没挖过矿骗人我是小狗！",
  "【出货原因】：快到疯狂星期四了，急需50块钱疯狂一下。这张显卡是当年我省吃俭用买的国行，箱说齐全，信越7921硅脂刚涂满！",
  "【降级处理】：网吧老板跟我顶账抵的卡。拿回家看电视觉得风扇转起来和直升机螺旋桨一样，吵得我脑壳疼，便宜卖了换个安静的亮机卡。",
  "【工作室散伙】：合伙做 AI 绘画没熬过三个月，项目凉透了，大家分行李。这批卡在恒温空调房里跑了几十万张美少女大图，核心绝对没缩水！",
  "【回老家退坑】：考研没过，下周就要打包铺盖回老家厂里打螺丝了，大号行李箱塞不下显卡，低价转给同城有缘人，能亮机直接拿走！",
  "【老婆不让系列】：懂的都懂，家里掌柜的嫌我玩电脑不带娃，昨天直接断了我的插线板。为了家庭和谐，忍痛在闲鱼出，不要打电话只发短信！",
  "【宿舍限电难民】：本以为买来能在宿舍叱咤风云，结果一插上这显卡玩游戏，宿舍楼当场跳闸，被辅导员全校通报批评……含泪出！",
  "【大砍刀受害者】：闲鱼上挂了三天全是‘大砍刀仙人’：‘100块包邮卖我，我是学生’、‘V你50直接送我’。气得我直接来店里找老板你，诚心收给个爽快价！",
  "【空气显卡受害者】：本来在别的贩子那买的翻新卡，拿到手里鲁大师一跑居然显示是GTX 550 Ti改字，找店家退货还拉黑了我，不折腾了，剩下的旧卡低价出给你！"
];
