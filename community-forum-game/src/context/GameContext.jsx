import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { BUILDINGS, INITIAL_TASKS, DECORATIONS, ACHIEVEMENTS, FACILITIES, NPC_NAMES, RANDOM_POST_TOPICS, LIMITED_EVENTS, AVATARS, DAILY_EVENTS, REPORT_HISTORY_TYPES } from '../data/gameData'

const GameContext = createContext()

const generateId = () => Math.random().toString(36).substr(2, 9)

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

const cloneDeep = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj))
  } catch {
    return obj
  }
}

const initialState = {
  gameStarted: false,
  currentScreen: 'lobby',
  player: null,
  reputation: 0,
  coins: 100,
  posts: [],
  tasks: [...INITIAL_TASKS].map(t => ({ ...t, id: t.id || generateId() })),
  activeTasks: [],
  completedTasks: [],
  inventory: [],
  announcements: [],
  leaderboard: [],
  relationships: {},
  achievements: [],
  facilities: [...FACILITIES].map(f => ({ ...f })),
  limitedEvent: null,
  activityLog: [],
  day: 1,
  isAdmin: false,
  teamMembers: [],
  totalPosts: 0,
  totalHelpTasks: 0,
  totalDisputes: 0,
  totalPatrols: 0,
  totalMarketTrades: 0,
  heatPenalties: 0,
  reportHistory: [],
  dailyEvent: null,
  dailyEventHistory: [],
  _savedAt: null,
}

function gameReducer(state, action) {
  switch (action.type) {
    case 'START_GAME':
      return { ...state, gameStarted: true }

    case 'SET_SCREEN':
      return { ...state, currentScreen: action.payload }

    case 'CREATE_CHARACTER': {
      const { name, avatar, buildingId } = action.payload
      const building = BUILDINGS.find(b => b.id === buildingId)
      const player = {
        id: generateId(),
        name,
        avatar,
        buildingId,
        buildingName: building?.name || '未知楼栋',
        joinDate: new Date().toLocaleDateString(),
      }
      const relationships = {}
      NPC_NAMES.forEach(npc => {
        relationships[npc] = Math.floor(Math.random() * 30) + 20
      })
      const initialAchievements = [{ ...ACHIEVEMENTS[0], unlockedAt: Date.now() }]
      const firstDailyEvent = state.day === 1 ? {
        ...cloneDeep(getRandomElement(DAILY_EVENTS)),
        triggeredAt: Date.now(),
        handled: false,
      } : null
      return {
        ...state,
        player,
        relationships,
        achievements: initialAchievements,
        reputation: 20,
        dailyEvent: firstDailyEvent,
        activityLog: [...state.activityLog, { type: 'system', message: `${name} 加入了 ${building?.name}！`, time: Date.now() }],
      }
    }

    case 'ADD_POST': {
      const post = {
        id: generateId(),
        authorId: state.player.id,
        authorName: state.player.name,
        authorAvatar: state.player.avatar,
        ...action.payload,
        likes: 0,
        comments: [],
        heat: 0,
        isReported: false,
        reportCount: 0,
        createdAt: Date.now(),
      }
      const newRelationships = { ...state.relationships }
      Object.keys(newRelationships).forEach(npc => {
        newRelationships[npc] = Math.min(100, newRelationships[npc] + 1)
      })
      return {
        ...state,
        posts: [post, ...state.posts],
        totalPosts: state.totalPosts + 1,
        reputation: state.reputation + 2,
        relationships: newRelationships,
        activityLog: [...state.activityLog, { type: 'post', message: `发布了帖子：${post.title}`, time: Date.now() }],
      }
    }

    case 'LIKE_POST': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, likes: p.likes + 1, heat: p.heat + 5 }
        }
        return p
      })
      return { ...state, posts }
    }

    case 'COMMENT_POST': {
      const { postId, content } = action.payload
      const posts = state.posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, {
              id: generateId(),
              author: state.player.name,
              avatar: state.player.avatar,
              content,
              time: Date.now(),
            }],
            heat: p.heat + 3,
          }
        }
        return p
      })
      return { ...state, posts, reputation: state.reputation + 1 }
    }

    case 'REPORT_POST': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return {
            ...p,
            isReported: true,
            reportCount: (p.reportCount || 0) + 1,
            heat: Math.max(0, p.heat - 20),
            reportedAt: Date.now(),
          }
        }
        return p
      })
      return { ...state, posts }
    }

    case 'IGNORE_REPORT': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isReported: false, _reviewIgnored: true }
        }
        return p
      })
      const post = state.posts.find(p => p.id === action.payload)
      return {
        ...state,
        posts,
        reportHistory: [
          ...state.reportHistory,
          {
            id: generateId(),
            postId: action.payload,
            postTitle: post?.title || '未知帖子',
            postAuthor: post?.authorName || '未知作者',
            action: REPORT_HISTORY_TYPES.IGNORED,
            handledAt: Date.now(),
            handledBy: state.player?.name || '管理员',
          },
        ],
        activityLog: [...state.activityLog, { type: 'admin', message: `管理员忽略了帖子举报：${post?.title}`, time: Date.now() }],
      }
    }

    case 'MARK_POST_COMPLIANT': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isReported: false, _reviewCompliant: true }
        }
        return p
      })
      const post = state.posts.find(p => p.id === action.payload)
      return {
        ...state,
        posts,
        reportHistory: [
          ...state.reportHistory,
          {
            id: generateId(),
            postId: action.payload,
            postTitle: post?.title || '未知帖子',
            postAuthor: post?.authorName || '未知作者',
            action: REPORT_HISTORY_TYPES.COMPLIANT,
            handledAt: Date.now(),
            handledBy: state.player?.name || '管理员',
          },
        ],
        activityLog: [...state.activityLog, { type: 'admin', message: `管理员审核通过帖子：${post?.title}`, time: Date.now() }],
      }
    }

    case 'PENALIZE_POST': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isPenalized: true, isReported: false, heat: 0, penalizedAt: Date.now() }
        }
        return p
      })
      const post = state.posts.find(p => p.id === action.payload)
      return {
        ...state,
        posts,
        reputation: Math.max(0, state.reputation - 10),
        heatPenalties: state.heatPenalties + 1,
        reportHistory: [
          ...state.reportHistory,
          {
            id: generateId(),
            postId: action.payload,
            postTitle: post?.title || '未知帖子',
            postAuthor: post?.authorName || '未知作者',
            action: REPORT_HISTORY_TYPES.PENALIZED,
            penalty: -10,
            handledAt: Date.now(),
            handledBy: state.player?.name || '管理员',
          },
        ],
        activityLog: [...state.activityLog, { type: 'warning', message: `管理员对违规内容扣分：${post?.title}（声望-10）`, time: Date.now() }],
      }
    }

    case 'ACCEPT_TASK': {
      const task = state.tasks.find(t => t.id === action.payload)
      if (!task) return state
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        activeTasks: [...state.activeTasks, { ...task, acceptedAt: Date.now(), progress: 0 }],
        activityLog: [...state.activityLog, { type: 'task', message: `接取任务：${task.title}`, time: Date.now() }],
      }
    }

    case 'COMPLETE_TASK': {
      const task = state.activeTasks.find(t => t.id === action.payload)
      if (!task) return state
      let newAchievements = [...state.achievements]
      let helpCount = state.totalHelpTasks
      let disputeCount = state.totalDisputes
      let patrolCount = state.totalPatrols
      let marketCount = state.totalMarketTrades

      if (task.type === 'help') helpCount++
      if (task.type === 'dispute') disputeCount++
      if (task.type === 'patrol') patrolCount++
      if (task.type === 'market') marketCount++

      const newRelationships = { ...state.relationships }
      Object.keys(newRelationships).forEach(npc => {
        newRelationships[npc] = Math.min(100, newRelationships[npc] + 2)
      })

      if (helpCount >= 10 && !newAchievements.find(a => a.id === 2)) {
        newAchievements.push({ ...ACHIEVEMENTS[1], unlockedAt: Date.now() })
      }
      if (state.totalPosts >= 20 && !newAchievements.find(a => a.id === 3)) {
        newAchievements.push({ ...ACHIEVEMENTS[2], unlockedAt: Date.now() })
      }
      if (disputeCount >= 5 && !newAchievements.find(a => a.id === 4)) {
        newAchievements.push({ ...ACHIEVEMENTS[3], unlockedAt: Date.now() })
      }
      if (patrolCount >= 20 && !newAchievements.find(a => a.id === 7)) {
        newAchievements.push({ ...ACHIEVEMENTS[6], unlockedAt: Date.now() })
      }
      if (marketCount >= 50 && !newAchievements.find(a => a.id === 8)) {
        newAchievements.push({ ...ACHIEVEMENTS[7], unlockedAt: Date.now() })
      }

      let newRep = state.reputation + task.reward.reputation
      if (newRep >= 500 && !newAchievements.find(a => a.id === 5)) {
        newAchievements.push({ ...ACHIEVEMENTS[4], unlockedAt: Date.now() })
      }

      return {
        ...state,
        activeTasks: state.activeTasks.filter(t => t.id !== action.payload),
        completedTasks: [...state.completedTasks, { ...task, completedAt: Date.now() }],
        reputation: newRep,
        coins: state.coins + task.reward.coins,
        totalHelpTasks: helpCount,
        totalDisputes: disputeCount,
        totalPatrols: patrolCount,
        totalMarketTrades: marketCount,
        achievements: newAchievements,
        relationships: newRelationships,
        activityLog: [...state.activityLog, { type: 'success', message: `完成任务：${task.title}，声望+${task.reward.reputation}，金币+${task.reward.coins}`, time: Date.now() }],
      }
    }

    case 'GENERATE_NEW_TASK': {
      if (state.tasks.length >= 12) return state
      const newTask = {
        id: generateId(),
        ...getRandomElement([
          { type: 'help', title: `帮${getRandomElement(NPC_NAMES)}${getRandomElement(['送东西', '照看宠物', '浇花', '搬重物', '取快递', '代买东西'])}`, description: '邻居有事需要帮忙，希望热心住户能搭把手', reward: { reputation: 10 + Math.floor(Math.random() * 20), coins: 15 + Math.floor(Math.random() * 20) }, timeLimit: 300 + Math.floor(Math.random() * 600) },
          { type: 'market', title: `跳蚤市场 - 出售${getRandomElement(['闲置电器', '儿童玩具', '手工艺品', '旧衣物', '书籍文具', '家居用品'])}`, description: '周末跳蚤市场又要开啦，把闲置物品拿出来换点零花钱吧', reward: { reputation: 10 + Math.floor(Math.random() * 10), coins: 30 + Math.floor(Math.random() * 40) }, timeLimit: 1800 },
          { type: 'dispute', title: `处理${getRandomElement(['噪音', '宠物', '车位', '电梯', '垃圾'])}纠纷`, description: '邻居之间出现了小摩擦，需要有人出面协调解决', reward: { reputation: 25 + Math.floor(Math.random() * 15), coins: 25 + Math.floor(Math.random() * 15) }, timeLimit: 600 + Math.floor(Math.random() * 300) },
          { type: 'help', title: `协助${getRandomElement(['社区核酸采样', '老年活动', '儿童托管', '快递分拣', '垃圾分类'])}`, description: '社区临时需要志愿者协助，有时间的邻居可以报名', reward: { reputation: 18 + Math.floor(Math.random() * 12), coins: 12 + Math.floor(Math.random() * 18) }, timeLimit: 900 + Math.floor(Math.random() * 300) },
        ]),
        generatedAt: Date.now(),
      }
      return {
        ...state,
        tasks: [...state.tasks, newTask],
      }
    }

    case 'BUY_DECORATION': {
      const deco = DECORATIONS.find(d => d.id === action.payload)
      if (!deco || state.coins < deco.price) return state
      let newAchievements = [...state.achievements]
      const newInventory = [...state.inventory, { ...deco, obtainedAt: Date.now() }]
      const rareDecos = DECORATIONS.filter(d => d.rarity !== 'common')
      const hasAllRare = rareDecos.every(d => newInventory.some(i => i.id === d.id))
      if (hasAllRare && !newAchievements.find(a => a.id === 6)) {
        newAchievements.push({ ...ACHIEVEMENTS[5], unlockedAt: Date.now() })
      }
      return {
        ...state,
        coins: state.coins - deco.price,
        inventory: newInventory,
        achievements: newAchievements,
        activityLog: [...state.activityLog, { type: 'shop', message: `购买了装饰物：${deco.name}`, time: Date.now() }],
      }
    }

    case 'ADD_ANNOUNCEMENT': {
      const announcement = {
        id: generateId(),
        ...action.payload,
        createdAt: Date.now(),
      }
      return {
        ...state,
        announcements: [announcement, ...state.announcements],
        activityLog: [...state.activityLog, { type: 'admin', message: `发布公告：${announcement.title}`, time: Date.now() }],
      }
    }

    case 'VOTE_FACILITY': {
      const facilities = state.facilities.map(f => {
        if (f.id === action.payload) {
          return { ...f, votes: f.votes + 1 }
        }
        return f
      })
      return {
        ...state,
        facilities,
        reputation: state.reputation + 1,
        activityLog: [...state.activityLog, { type: 'vote', message: '参与了公共设施投票', time: Date.now() }],
      }
    }

    case 'START_LIMITED_EVENT': {
      return {
        ...state,
        limitedEvent: { ...action.payload, startedAt: Date.now(), progress: 0 },
        activityLog: [...state.activityLog, { type: 'event', message: `参加限时活动：${action.payload.name}`, time: Date.now() }],
      }
    }

    case 'COMPLETE_LIMITED_EVENT': {
      if (!state.limitedEvent) return state
      const reward = state.limitedEvent.reward
      const finishedEvent = { ...state.limitedEvent, completedAt: Date.now() }
      return {
        ...state,
        limitedEvent: null,
        reputation: state.reputation + reward.reputation,
        coins: state.coins + reward.coins,
        dailyEventHistory: [...state.dailyEventHistory, { type: 'limited', event: finishedEvent }],
        activityLog: [...state.activityLog, { type: 'success', message: `完成限时活动「${finishedEvent.name}」：声望+${reward.reputation}，金币+${reward.coins}`, time: Date.now() }],
      }
    }

    case 'JOIN_TEAM': {
      if (state.teamMembers.length >= 3) return state
      return {
        ...state,
        teamMembers: [...state.teamMembers, { id: generateId(), name: getRandomElement(NPC_NAMES), avatar: getRandomElement(['👨', '👩', '👴', '👵', '🧑']) }],
      }
    }

    case 'LEAVE_TEAM': {
      return { ...state, teamMembers: state.teamMembers.filter(m => m.id !== action.payload) }
    }

    case 'SET_ADMIN':
      return { ...state, isAdmin: action.payload }

    case 'HANDLE_DAILY_EVENT': {
      if (!state.dailyEvent || state.dailyEvent.handled) return state
      const { choiceIndex } = action.payload
      const choice = state.dailyEvent.choices[choiceIndex]
      if (!choice) return state

      const eff = choice.effect || { reputation: 0, coins: 0, relationshipBoost: 0 }
      const newRelationships = { ...state.relationships }
      if (eff.relationshipBoost) {
        Object.keys(newRelationships).forEach(npc => {
          newRelationships[npc] = Math.max(0, Math.min(100, newRelationships[npc] + eff.relationshipBoost))
        })
      }
      const handledEvent = {
        ...state.dailyEvent,
        handled: true,
        chosenChoice: choice.label,
        handledAt: Date.now(),
        effect: eff,
      }

      const logMessages = []
      if (eff.reputation !== 0) logMessages.push(`声望${eff.reputation > 0 ? '+' : ''}${eff.reputation}`)
      if (eff.coins !== 0) logMessages.push(`金币${eff.coins > 0 ? '+' : ''}${eff.coins}`)
      if (eff.relationshipBoost !== 0) logMessages.push(`好感度${eff.relationshipBoost > 0 ? '+' : ''}${eff.relationshipBoost}`)

      return {
        ...state,
        dailyEvent: handledEvent,
        reputation: Math.max(0, state.reputation + eff.reputation),
        coins: Math.max(0, state.coins + eff.coins),
        relationships: newRelationships,
        dailyEventHistory: [...state.dailyEventHistory, { type: 'daily', event: handledEvent }],
        activityLog: [...state.activityLog, {
          type: eff.reputation >= 0 ? 'success' : 'warning',
          message: `处理事件「${state.dailyEvent.title}」：${choice.label}（${logMessages.join('，') || '无影响'}）`,
          time: Date.now(),
        }],
      }
    }

    case 'NEXT_DAY': {
      try {
        const newDay = state.day + 1

        // 1. 热度衰减（已有帖子）
        const posts = state.posts.map(p => ({
          ...p,
          heat: Math.max(0, Math.floor(p.heat * 0.75)),
        }))

        // 2. 生成 2-3 条邻居新帖子
        const newPostCount = 2 + Math.floor(Math.random() * 2)
        const newPosts = []
        const usedNpcs = new Set()
        for (let i = 0; i < newPostCount; i++) {
          let npcName = getRandomElement(NPC_NAMES)
          let attempts = 0
          while (usedNpcs.has(npcName) && attempts < 5) {
            npcName = getRandomElement(NPC_NAMES)
            attempts++
          }
          usedNpcs.add(npcName)

          const topic = getRandomElement(RANDOM_POST_TOPICS)
          const commentCount = Math.floor(Math.random() * 5)
          const newComments = []
          for (let c = 0; c < commentCount; c++) {
            newComments.push({
              id: generateId(),
              author: getRandomElement(NPC_NAMES),
              avatar: getRandomElement(AVATARS),
              content: getRandomElement(['写得真好！', '我也这么觉得', '哈哈哈哈', '有道理', '+1', '谢谢分享', '太有用了', '我也遇到过']),
              time: Date.now() - Math.floor(Math.random() * 3600000),
            })
          }

          const maybeReported = Math.random() < 0.15
          newPosts.push({
            id: generateId(),
            authorId: 'npc_' + generateId(),
            authorName: npcName,
            authorAvatar: getRandomElement(AVATARS),
            ...topic,
            likes: Math.floor(Math.random() * 40),
            comments: newComments,
            heat: Math.floor(Math.random() * 60) + 10,
            isReported: maybeReported,
            reportCount: maybeReported ? 1 + Math.floor(Math.random() * 3) : 0,
            reportedAt: maybeReported ? Date.now() - 1800000 : null,
            createdAt: Date.now() - Math.floor(Math.random() * 7200000),
          })
        }

        // 3. 生成 2-4 个新任务（确保任务池不枯竭）
        const newTaskCount = 2 + Math.floor(Math.random() * 3)
        const newTasks = []
        for (let i = 0; i < newTaskCount; i++) {
          newTasks.push({
            id: generateId(),
            ...getRandomElement([
              { type: 'help', title: `帮${getRandomElement(NPC_NAMES)}${getRandomElement(['送东西', '照看宠物', '浇花', '搬重物', '取快递'])}`, description: '邻居有事需要帮忙，热心住户可以联系', reward: { reputation: 10 + Math.floor(Math.random() * 20), coins: 15 + Math.floor(Math.random() * 20) }, timeLimit: 300 + Math.floor(Math.random() * 600) },
              { type: 'market', title: `跳蚤市场 - 出售${getRandomElement(['闲置电器', '儿童玩具', '手工艺品', '旧衣物'])}`, description: '周末跳蚤市场活动报名中', reward: { reputation: 10 + Math.floor(Math.random() * 10), coins: 30 + Math.floor(Math.random() * 40) }, timeLimit: 1800 },
              { type: 'dispute', title: '处理邻里纠纷', description: '协调解决住户之间的小矛盾', reward: { reputation: 25 + Math.floor(Math.random() * 15), coins: 25 + Math.floor(Math.random() * 15) }, timeLimit: 600 + Math.floor(Math.random() * 300) },
              { type: 'patrol', title: '组队安全巡逻', description: '和邻居一起在小区进行安全巡逻（建议组队）', reward: { reputation: 35 + Math.floor(Math.random() * 15), coins: 35 + Math.floor(Math.random() * 15) }, timeLimit: 3600, requireTeam: Math.random() < 0.4 },
            ]),
            generatedAt: Date.now(),
          })
        }

        // 4. 合并任务列表（去重）
        const existingTaskIds = new Set(state.tasks.map(t => t.id))
        const mergedTasks = [...state.tasks, ...newTasks.filter(t => !existingTaskIds.has(t.id))]

        // 5. 进行中的任务：进度小幅推进
        const progressedActiveTasks = state.activeTasks.map(t => ({
          ...t,
          progress: Math.min(100, (t.progress || 0) + 15 + Math.floor(Math.random() * 20)),
        }))

        // 6. 触发新的每日随机事件（如果上一个已处理或没有）
        const prevEventDone = !state.dailyEvent || state.dailyEvent.handled
        let newDailyEvent = state.dailyEvent
        if (prevEventDone) {
          const availableEvents = DAILY_EVENTS.filter(e =>
            !state.dailyEventHistory.slice(-5).some(h => h.event?.id === e.id)
          )
          const pickFrom = availableEvents.length > 0 ? availableEvents : DAILY_EVENTS
          newDailyEvent = {
            ...cloneDeep(getRandomElement(pickFrom)),
            day: newDay,
            triggeredAt: Date.now(),
            handled: false,
          }
        }

        // 7. 新一天日志
        const newLogs = [
          { type: 'system', message: `━━━━━ 第 ${newDay} 天开始 ━━━━━`, time: Date.now() },
        ]
        if (newPosts.length > 0) {
          newLogs.push({ type: 'post', message: `邻居们发布了 ${newPosts.length} 条新帖子`, time: Date.now() + 1 })
        }
        if (newTasks.length > 0) {
          newLogs.push({ type: 'task', message: `小区发布了 ${newTasks.length} 个新任务`, time: Date.now() + 2 })
        }

        return {
          ...state,
          day: newDay,
          posts: [...newPosts, ...posts].slice(0, 60),
          tasks: mergedTasks.slice(0, 15),
          activeTasks: progressedActiveTasks,
          dailyEvent: newDailyEvent,
          activityLog: [...state.activityLog, ...newLogs].slice(-200),
        }
      } catch (e) {
        console.error('NEXT_DAY error:', e)
        return {
          ...state,
          day: state.day + 1,
          activityLog: [...state.activityLog, { type: 'warning', message: `进入第 ${state.day + 1} 天`, time: Date.now() }],
        }
      }
    }

    case 'SAVE_GAME': {
      try {
        const stateToSave = {
          ...state,
          _savedAt: Date.now(),
          _version: 2,
        }
        localStorage.setItem('community_forum_save', JSON.stringify(stateToSave))
        return {
          ...state,
          _savedAt: stateToSave._savedAt,
          activityLog: [...state.activityLog, { type: 'system', message: '💾 游戏进度已保存', time: Date.now() }],
        }
      } catch (e) {
        console.error('SAVE_GAME error:', e)
        return state
      }
    }

    case 'LOAD_GAME': {
      try {
        const saved = localStorage.getItem('community_forum_save')
        if (!saved) return state
        const parsed = JSON.parse(saved)
        const merged = {
          ...initialState,
          ...parsed,
          tasks: Array.isArray(parsed.tasks) && parsed.tasks.length > 0 ? parsed.tasks : [...INITIAL_TASKS],
          posts: Array.isArray(parsed.posts) ? parsed.posts : [],
          activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          reportHistory: Array.isArray(parsed.reportHistory) ? parsed.reportHistory : [],
          dailyEventHistory: Array.isArray(parsed.dailyEventHistory) ? parsed.dailyEventHistory : [],
          facilities: Array.isArray(parsed.facilities) && parsed.facilities.length > 0
            ? parsed.facilities.map((f, i) => ({ ...FACILITIES[i], votes: f.votes || 0 }))
            : [...FACILITIES],
          currentScreen: parsed.currentScreen || 'lobby',
        }
        if (!merged.dailyEvent || merged.dailyEvent?.handled) {
          const freshEvent = {
            ...cloneDeep(getRandomElement(DAILY_EVENTS)),
            triggeredAt: Date.now(),
            handled: false,
          }
          merged.dailyEvent = freshEvent
        }
        return {
          ...merged,
          activityLog: [
            ...merged.activityLog,
            { type: 'system', message: `📂 已读取存档（第${merged.day}天）`, time: Date.now() },
          ].slice(-200),
        }
      } catch (e) {
        console.error('LOAD_GAME error:', e)
        return state
      }
    }

    case 'SHARE_RESULT':
      return state

    case 'ADD_LOG':
      return { ...state, activityLog: [...state.activityLog, action.payload] }

    default:
      return state
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)

  useEffect(() => {
    try {
      const interval = setInterval(() => {
        dispatch({ type: 'GENERATE_NEW_TASK' })
      }, 45000)
      return () => clearInterval(interval)
    } catch (e) {
      console.error('Task generator error:', e)
    }
  }, [])

  return (
    <GameContext.Provider value={{ state, dispatch }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}
