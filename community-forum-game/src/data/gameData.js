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
