export const BUILDINGS = [
  { id: 1, name: '1号楼 - 春晖苑', icon: '🏢', description: '阳光充足，小区入口第一栋' },
  { id: 2, name: '2号楼 - 夏荷苑', icon: '🏬', description: '靠近花园，环境清幽' },
  { id: 3, name: '3号楼 - 秋枫苑', icon: '🏨', description: '毗邻停车场，出行便利' },
  { id: 4, name: '4号楼 - 冬梅苑', icon: '🏛️', description: '楼王位置，视野开阔' },
  { id: 5, name: '5号楼 - 翠竹苑', icon: '🏘️', description: '靠近社区中心，配套齐全' },
]

export const AVATARS = ['👨‍🦰', '👩', '👨', '👵', '👴', '👱‍♀️', '👱', '🧑', '👩‍🦰', '👨‍🦱', '👩‍🦱', '🧔']

export const INITIAL_TASKS = [
  { id: 1, type: 'help', title: '帮张奶奶取快递', description: '张奶奶腿脚不便，需要帮忙到快递柜取包裹', reward: { reputation: 15, coins: 20 }, timeLimit: 300 },
  { id: 2, type: 'help', title: '代遛邻居的小狗', description: '邻居出差，帮忙遛金毛犬一次', reward: { reputation: 20, coins: 25 }, timeLimit: 600 },
  { id: 3, type: 'dispute', title: '处理楼上噪音纠纷', description: '302住户反映楼上装修噪音太大，需要协调', reward: { reputation: 30, coins: 35 }, timeLimit: 900 },
  { id: 4, type: 'help', title: '协助小区垃圾分类', description: '帮助志愿者在垃圾站引导分类投放', reward: { reputation: 25, coins: 15 }, timeLimit: 1200 },
  { id: 5, type: 'market', title: '跳蚤市场 - 出售旧书', description: '在周末跳蚤市场摆摊出售闲置书籍', reward: { reputation: 10, coins: 50 }, timeLimit: 1800 },
  { id: 6, type: 'patrol', title: '组队夜间巡逻', description: '和邻居组队在小区进行安全巡逻', reward: { reputation: 40, coins: 40 }, timeLimit: 3600, requireTeam: true },
]

export const DECORATIONS = [
  { id: 1, name: '盆栽绿植', icon: '🪴', price: 50, rarity: 'common' },
  { id: 2, name: '门口地毯', icon: '🧶', price: 80, rarity: 'common' },
  { id: 3, name: '风铃挂件', icon: '🎐', price: 100, rarity: 'common' },
  { id: 4, name: '节日灯笼', icon: '🏮', price: 150, rarity: 'rare' },
  { id: 5, name: '家庭相框', icon: '🖼️', price: 180, rarity: 'rare' },
  { id: 6, name: '水晶摆件', icon: '💎', price: 300, rarity: 'epic' },
  { id: 7, name: '金鱼缸', icon: '🐠', price: 400, rarity: 'epic' },
  { id: 8, name: '金质奖章', icon: '🏆', price: 888, rarity: 'legendary' },
]

export const ACHIEVEMENTS = [
  { id: 1, name: '新住户', description: '完成角色创建', icon: '🎉', condition: 'create_character' },
  { id: 2, name: '助人为乐', description: '完成10个互助任务', icon: '🤝', condition: 'help_10' },
  { id: 3, name: '小区达人', description: '论坛发帖达到20条', icon: '📝', condition: 'post_20' },
  { id: 4, name: '调解员', description: '成功处理5起纠纷', icon: '⚖️', condition: 'dispute_5' },
  { id: 5, name: '声望领袖', description: '声望值达到500', icon: '👑', condition: 'rep_500' },
  { id: 6, name: '装饰大师', description: '收集所有稀有以上装饰', icon: '✨', condition: 'deco_all_rare' },
  { id: 7, name: '巡逻英雄', description: '参与20次组队巡逻', icon: '🛡️', condition: 'patrol_20' },
  { id: 8, name: '跳蚤市场王', description: '在跳蚤市场交易50次', icon: '💰', condition: 'market_50' },
]

export const FACILITIES = [
  { id: 1, name: '儿童游乐场', icon: '🎠', cost: 1000, votes: 0, description: '让小朋友有安全的玩耍空间' },
  { id: 2, name: '健身区', icon: '🏋️', cost: 800, votes: 0, description: '户外健身器材区' },
  { id: 3, name: '社区书屋', icon: '📚', cost: 1200, votes: 0, description: '共享图书阅读空间' },
  { id: 4, name: '宠物乐园', icon: '🐕', cost: 600, votes: 0, description: '毛孩子们的专属活动区' },
  { id: 5, name: '阳光花房', icon: '🌸', cost: 900, votes: 0, description: '种植和分享花卉的地方' },
]

export const NPC_NAMES = ['张奶奶', '李叔叔', '王阿姨', '赵大哥', '陈姐', '小刘', '老孙', '周老师', '吴医生', '郑经理']

export const NPC_RESIDENTS = [
  { id: 'npc_zhang', name: '张奶奶', avatar: '👵', buildingId: 1, buildingName: '1号楼 - 春晖苑', reputation: 85, coins: 60, postCount: 4, joinDays: 120, isElderly: true, tags: ['独居老人', '爱种花草'] },
  { id: 'npc_li', name: '李叔叔', avatar: '👴', buildingId: 2, buildingName: '2号楼 - 夏荷苑', reputation: 72, coins: 200, postCount: 8, joinDays: 95, tags: ['退休干部', '爱下棋'] },
  { id: 'npc_wang', name: '王阿姨', avatar: '👩', buildingId: 3, buildingName: '3号楼 - 秋枫苑', reputation: 92, coins: 150, postCount: 15, joinDays: 200, tags: ['业委会主任', '热心肠'] },
  { id: 'npc_zhao', name: '赵大哥', avatar: '👨', buildingId: 1, buildingName: '1号楼 - 春晖苑', reputation: 55, coins: 80, postCount: 3, joinDays: 30, reportCount: 2, tags: ['年轻上班族', '喜欢熬夜'] },
  { id: 'npc_chen', name: '陈姐', avatar: '👩‍🦰', buildingId: 4, buildingName: '4号楼 - 冬梅苑', reputation: 88, coins: 300, postCount: 12, joinDays: 150, tags: ['全职妈妈', '烘焙达人'] },
  { id: 'npc_liu', name: '小刘', avatar: '👱', buildingId: 5, buildingName: '5号楼 - 翠竹苑', reputation: 60, coins: 120, postCount: 20, joinDays: 45, tags: ['大学生', '爱发帖'] },
  { id: 'npc_sun', name: '老孙', avatar: '🧔', buildingId: 3, buildingName: '3号楼 - 秋枫苑', reputation: 78, coins: 180, postCount: 6, joinDays: 80, tags: ['退伍军人', '巡逻队长'] },
  { id: 'npc_zhou', name: '周老师', avatar: '👩‍🦱', buildingId: 4, buildingName: '4号楼 - 冬梅苑', reputation: 95, coins: 250, postCount: 10, joinDays: 180, tags: ['退休教师', '书法爱好者'] },
  { id: 'npc_wu', name: '吴医生', avatar: '🧑', buildingId: 2, buildingName: '2号楼 - 夏荷苑', reputation: 90, coins: 400, postCount: 5, joinDays: 100, tags: ['社区医生', '义诊志愿者'] },
  { id: 'npc_zheng', name: '郑经理', avatar: '👨‍🦱', buildingId: 5, buildingName: '5号楼 - 翠竹苑', reputation: 68, coins: 500, postCount: 2, joinDays: 60, tags: ['企业高管', '经常出差'] },
]

export const RANDOM_POST_TOPICS = [
  { title: '今天的晚霞真美！', content: '下班回家看到天边的晚霞，心情都变好了~', category: '分享' },
  { title: '推荐小区门口新开的水果店', content: '水果新鲜又便宜，老板人也很好！', category: '推荐' },
  { title: '有没有一起晨跑的邻居？', content: '每天早上6点左右，绕小区跑三圈，有意者留言', category: '组队' },
  { title: '寻找丢失的橘猫', content: '名字叫橘子，戴着蓝色项圈，看到请联系我，重谢！', category: '求助' },
  { title: '关于电梯维护的建议', content: '希望物业能定期检查电梯，安全第一', category: '建议' },
]

export const LIMITED_EVENTS = [
  { id: 1, name: '春日摄影比赛', icon: '📷', duration: 180, description: '拍摄小区最美春景，上传照片赢取奖励', reward: { reputation: 100, coins: 200 } },
  { id: 2, name: '端午包粽子活动', icon: '🍙', duration: 240, description: '社区食堂组织包粽子活动，邻里齐动手', reward: { reputation: 80, coins: 150 } },
  { id: 3, name: '中秋赏月晚会', icon: '🌕', duration: 300, description: '花园广场赏月、吃月饼、猜灯谜', reward: { reputation: 120, coins: 250 } },
]

export const DAILY_EVENTS = [
  {
    id: 'water_shutdown',
    icon: '🚰',
    title: '突发停水通知',
    description: '物业通知：因水管维修，今天下午2-6点小区将临时停水，请邻居们提前做好储水准备。',
    targetResident: 'npc_zhang',
    choices: [
      { label: '📢 在论坛发帖提醒邻居', effect: { reputation: 8, coins: 0, relationshipBoost: 3 }, flag: 'water_posted', postToGenerate: '停水提醒谢谢邻居！' },
      { label: '🛒 帮张奶奶家储水', effect: { reputation: 15, coins: 10, relationshipBoost: 8 }, flag: 'water_helped_zhang', targetResidentRepBoost: 15 },
      { label: '😐 默默自己储水就行', effect: { reputation: 0, coins: 0, relationshipBoost: 0 }, flag: 'water_ignored' },
    ],
    followUp: {
      water_helped_zhang: 'water_shutdown_feedback_good',
      water_posted: 'water_shutdown_feedback_ok',
      water_ignored: 'water_shutdown_feedback_bad',
    },
  },
  {
    id: 'water_shutdown_feedback_good',
    icon: '💖',
    title: '停水事件：张奶奶登门感谢',
    description: '第二天一早，张奶奶提着自己种的蔬菜敲开了你家的门：「小伙子/小姑娘，昨天多亏你帮我储水，不然我一个老婆子真不知道怎么办才好！」',
    requires: { prevEventId: 'water_shutdown', prevFlag: 'water_helped_zhang' },
    targetResident: 'npc_zhang',
    choices: [
      { label: '🙂 收下礼物并寒暄', effect: { reputation: 5, coins: 0, relationshipBoost: 5 }, flag: 'zhang_bonded', targetResidentRepBoost: 10, generateTaskForResident: true },
      { label: '🎁 婉拒蔬菜，改约下次喝茶', effect: { reputation: 10, coins: 0, relationshipBoost: 10 }, flag: 'zhang_friendship', targetResidentRepBoost: 15 },
    ],
  },
  {
    id: 'water_shutdown_feedback_ok',
    icon: '📢',
    title: '停水事件：邻居纷纷点赞提醒帖',
    description: '你发的停水提醒帖在论坛收获了30多个赞，好几户邻居说多亏看到你的帖才提前储水，没影响晚饭。',
    requires: { prevEventId: 'water_shutdown', prevFlag: 'water_posted' },
    choices: [
      { label: '😊 统一回复感谢大家', effect: { reputation: 5, coins: 5, relationshipBoost: 2 }, flag: 'water_reply_ok', generateHeatPost: true },
    ],
  },
  {
    id: 'water_shutdown_feedback_bad',
    icon: '😞',
    title: '停水事件：张奶奶家出了状况',
    description: '听说张奶奶因为没储水，昨天傍晚只能去楼下便利店买矿泉水做饭，今天在业主群里被几个邻居委婉提醒多关心独居老人。',
    requires: { prevEventId: 'water_shutdown', prevFlag: 'water_ignored' },
    choices: [
      { label: '🙇 立刻去张奶奶家道歉并帮忙', effect: { reputation: 12, coins: 0, relationshipBoost: 6 }, flag: 'water_made_up', targetResidentRepBoost: 10 },
      { label: '😔 默默当作没看到', effect: { reputation: -5, coins: 0, relationshipBoost: -3 }, flag: 'water_ignored_2' },
    ],
  },
  {
    id: 'noise_complaint',
    icon: '🔊',
    title: '深夜噪音投诉',
    description: '3号楼有邻居反映，深夜11点多还有人在家大声唱歌，影响孩子休息和老人睡眠。查了下是1号楼的赵大哥招待朋友喝了点酒。',
    targetResident: 'npc_zhao',
    choices: [
      { label: '🤝 主动上楼协调沟通', effect: { reputation: 20, coins: 5, relationshipBoost: -2 }, flag: 'noise_handled_self', targetResidentRepBoost: -10 },
      { label: '📞 联系物业处理', effect: { reputation: 5, coins: 0, relationshipBoost: 0 }, flag: 'noise_property', targetResidentRepBoost: -5 },
      { label: '🎧 自己戴上耳塞忍忍', effect: { reputation: 0, coins: 0, relationshipBoost: 0 }, flag: 'noise_ignored' },
    ],
    followUp: {
      noise_handled_self: 'noise_feedback_good',
      noise_property: 'noise_feedback_ok',
      noise_ignored: 'noise_escalated',
    },
  },
  {
    id: 'noise_feedback_good',
    icon: '✅',
    title: '噪音事件：赵大哥改了还登门道歉',
    description: '没想到第二天赵大哥提着水果给受影响的几户邻居一一登门道歉，说自己一时兴起没注意时间，以后一定注意。',
    requires: { prevEventId: 'noise_complaint', prevFlag: 'noise_handled_self' },
    targetResident: 'npc_zhao',
    choices: [
      { label: '🙂 收下道歉，鼓励他以后多注意', effect: { reputation: 8, coins: 0, relationshipBoost: 5 }, flag: 'noise_peace', targetResidentRepBoost: 15 },
      { label: '📝 论坛发帖表扬知错能改', effect: { reputation: 12, coins: 0, relationshipBoost: 3 }, flag: 'noise_praised', generateHeatPost: true, targetResidentRepBoost: 20 },
    ],
  },
  {
    id: 'noise_escalated',
    icon: '🚨',
    title: '噪音事件升级：110来了',
    description: '你忍住没管，但其他楼的住户忍不了直接报了警。警察上门警告了赵大哥，现在整个小区都在议论这件事，社区形象受损。',
    requires: { prevEventId: 'noise_complaint', prevFlag: 'noise_ignored' },
    choices: [
      { label: '🛡️ 在论坛发帖呼吁和谐共处', effect: { reputation: 8, coins: 0, relationshipBoost: -1 }, flag: 'damage_control', generateHeatPost: true },
      { label: '🤷 事不关己高高挂起', effect: { reputation: -10, coins: 0, relationshipBoost: -5 }, flag: 'escalated_ignored' },
    ],
  },
  {
    id: 'flea_market_preheat',
    icon: '🛍️',
    title: '跳蚤市场预热',
    description: '本周六小区广场将举办月度跳蚤市场，邻居们可以摆摊出售闲置物品或以物换物。陈姐正在找搭子一起摆摊。',
    targetResident: 'npc_chen',
    choices: [
      { label: '🎪 报名和陈姐搭档卖闲置', effect: { reputation: 10, coins: 40, relationshipBoost: 6 }, flag: 'market_team_chen', targetResidentRepBoost: 10, generateTaskType: 'market' },
      { label: '📣 帮物业宣传活动', effect: { reputation: 15, coins: 10, relationshipBoost: 4 }, flag: 'market_promo', generateHeatPost: true },
      { label: '👀 当天随便逛逛', effect: { reputation: 2, coins: 0, relationshipBoost: 1 }, flag: 'market_browser' },
    ],
  },
  {
    id: 'lost_pet',
    icon: '🐱',
    title: '寻找丢失宠物',
    description: '5号楼李阿姨（住你楼下的老住户）家的橘猫「团子」今早溜出门不见了，李阿姨急得饭都吃不下。',
    targetResident: 'npc_li',
    choices: [
      { label: '🔍 组织邻居一起帮忙找', effect: { reputation: 25, coins: 15, relationshipBoost: 10 }, flag: 'pet_found_team', targetResidentRepBoost: 20, generateTaskForResident: true },
      { label: '📱 在业主群发寻猫启事', effect: { reputation: 8, coins: 0, relationshipBoost: 3 }, flag: 'pet_posted', generateHeatPost: true },
      { label: '🙏 希望它自己能回来', effect: { reputation: 0, coins: 0, relationshipBoost: 0 }, flag: 'pet_ignored' },
    ],
  },
  {
    id: 'package_misdelivered',
    icon: '📦',
    title: '快递错拿事件',
    description: '快递柜里有吴医生的快递被错拿了，业主群里正在问，快递里是他明天要给社区义诊带的急用药品。',
    targetResident: 'npc_wu',
    choices: [
      { label: '🚶 下楼去快递柜帮忙查监控', effect: { reputation: 18, coins: 8, relationshipBoost: 6 }, flag: 'pkg_investigated', targetResidentRepBoost: 12 },
      { label: '💬 群里帮忙扩散询问', effect: { reputation: 5, coins: 0, relationshipBoost: 2 }, flag: 'pkg_shared' },
      { label: '🤷 不是我拿的不管了', effect: { reputation: -3, coins: 0, relationshipBoost: -1 }, flag: 'pkg_ignored', targetResidentRepBoost: -5 },
    ],
  },
  {
    id: 'community_dinner',
    icon: '🍲',
    title: '百家宴活动报名',
    description: '中秋临近，业委会的王阿姨牵头组织小区百家宴，每户出一道菜，大家一起在花园广场聚餐赏月。',
    targetResident: 'npc_wang',
    choices: [
      { label: '🍳 报名出拿手好菜', effect: { reputation: 20, coins: 5, relationshipBoost: 8 }, flag: 'dinner_cook', targetResidentRepBoost: 10 },
      { label: '🎤 报名表演才艺节目', effect: { reputation: 15, coins: 10, relationshipBoost: 5 }, flag: 'dinner_perform', targetResidentRepBoost: 8 },
      { label: '🍽️ 当天去吃就行', effect: { reputation: 3, coins: 0, relationshipBoost: 1 }, flag: 'dinner_guest' },
    ],
  },
  {
    id: 'elderly_help',
    icon: '👵',
    title: '独居老人求助',
    description: '70多岁独居的周老师说家里灯泡坏了，儿女都在外地，想找个邻居帮忙换一下，她说家里灯已经黑了两天了。',
    targetResident: 'npc_zhou',
    choices: [
      { label: '🔧 立刻带工具上门帮忙', effect: { reputation: 22, coins: 12, relationshipBoost: 10 }, flag: 'elderly_helped', targetResidentRepBoost: 20, generateTaskForResident: true },
      { label: '📞 联系物业维修工上门', effect: { reputation: 5, coins: 0, relationshipBoost: 2 }, flag: 'elderly_property' },
      { label: '⏳ 最近太忙先等等', effect: { reputation: -2, coins: 0, relationshipBoost: -2 }, flag: 'elderly_delayed', targetResidentRepBoost: -8 },
    ],
  },
  {
    id: 'greening_activity',
    icon: '🌱',
    title: '小区植树活动',
    description: '春天到了，退伍军人老孙组织周末在小区空地上种桂花树，美化环境造福大家，工具树苗都准备好了。',
    targetResident: 'npc_sun',
    choices: [
      { label: '🌳 报名参与种植并捐苗', effect: { reputation: 25, coins: 5, relationshipBoost: 6 }, flag: 'tree_donor', targetResidentRepBoost: 12 },
      { label: '💧 活动后帮忙浇水养护', effect: { reputation: 12, coins: 5, relationshipBoost: 4 }, flag: 'tree_carer', targetResidentRepBoost: 8, generateTaskType: 'help' },
      { label: '👏 精神上支持一下', effect: { reputation: 1, coins: 0, relationshipBoost: 0 }, flag: 'tree_supporter' },
    ],
  },
]

export const REPORT_HISTORY_TYPES = {
  PENALIZED: 'penalized',
  IGNORED: 'ignored',
  COMPLIANT: 'compliant',
}
