import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { BUILDINGS, INITIAL_TASKS, DECORATIONS, ACHIEVEMENTS, FACILITIES, NPC_NAMES, RANDOM_POST_TOPICS, LIMITED_EVENTS } from '../data/gameData'

const GameContext = createContext()

const generateId = () => Math.random().toString(36).substr(2, 9)

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

const initialState = {
  gameStarted: false,
  currentScreen: 'lobby',
  player: null,
  reputation: 0,
  coins: 100,
  posts: [],
  tasks: [...INITIAL_TASKS],
  activeTasks: [],
  completedTasks: [],
  inventory: [],
  announcements: [],
  leaderboard: [],
  relationships: {},
  achievements: [],
  facilities: [...FACILITIES],
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
      return {
        ...state,
        player,
        relationships,
        achievements: initialAchievements,
        reputation: 20,
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
          return { ...p, isReported: true, heat: Math.max(0, p.heat - 20) }
        }
        return p
      })
      return { ...state, posts }
    }

    case 'PENALIZE_POST': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isPenalized: true, heat: 0 }
        }
        return p
      })
      return {
        ...state,
        posts,
        reputation: Math.max(0, state.reputation - 10),
        heatPenalties: state.heatPenalties + 1,
        activityLog: [...state.activityLog, { type: 'warning', message: '发布了违规内容，声望-10', time: Date.now() }],
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
      const newTask = {
        id: Date.now(),
        ...getRandomElement([
          { type: 'help', title: `帮${getRandomElement(NPC_NAMES)}${getRandomElement(['送东西', '照看宠物', '浇花', '搬重物'])}`, description: '邻居有事需要帮忙', reward: { reputation: 10 + Math.floor(Math.random() * 20), coins: 15 + Math.floor(Math.random() * 20) }, timeLimit: 300 + Math.floor(Math.random() * 600) },
          { type: 'market', title: `跳蚤市场 - 出售${getRandomElement(['闲置电器', '儿童玩具', '手工艺品', '旧衣物'])}`, description: '周末跳蚤市场活动', reward: { reputation: 10 + Math.floor(Math.random() * 10), coins: 30 + Math.floor(Math.random() * 40) }, timeLimit: 1800 },
          { type: 'dispute', title: '处理邻里纠纷', description: '协调解决住户之间的小矛盾', reward: { reputation: 25 + Math.floor(Math.random() * 15), coins: 25 + Math.floor(Math.random() * 15) }, timeLimit: 600 + Math.floor(Math.random() * 300) },
        ]),
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
        limitedEvent: { ...action.payload, startedAt: Date.now() },
        activityLog: [...state.activityLog, { type: 'event', message: `参加限时活动：${action.payload.name}`, time: Date.now() }],
      }
    }

    case 'COMPLETE_LIMITED_EVENT': {
      if (!state.limitedEvent) return state
      const reward = state.limitedEvent.reward
      return {
        ...state,
        limitedEvent: null,
        reputation: state.reputation + reward.reputation,
        coins: state.coins + reward.coins,
        activityLog: [...state.activityLog, { type: 'success', message: `完成限时活动：声望+${reward.reputation}，金币+${reward.coins}`, time: Date.now() }],
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

    case 'NEXT_DAY': {
      const posts = state.posts.map(p => ({
        ...p,
        heat: Math.max(0, p.heat - Math.floor(p.heat * 0.2)),
      }))
      const newPosts = []
      for (let i = 0; i < 2; i++) {
        const topic = getRandomElement(RANDOM_POST_TOPICS)
        const npcName = getRandomElement(NPC_NAMES)
        newPosts.push({
          id: generateId(),
          authorId: 'npc_' + i,
          authorName: npcName,
          authorAvatar: getRandomElement(AVATARS),
          ...topic,
          likes: Math.floor(Math.random() * 30),
          comments: Array(Math.floor(Math.random() * 5)).fill(null).map(() => ({
            id: generateId(),
            author: getRandomElement(NPC_NAMES),
            avatar: getRandomElement(AVATARS),
            content: getRandomElement(['写得真好！', '我也这么觉得', '哈哈哈哈', '有道理', '+1']),
            time: Date.now(),
          })),
          heat: Math.floor(Math.random() * 50),
          isReported: false,
          createdAt: Date.now(),
        })
      }
      return {
        ...state,
        day: state.day + 1,
        posts: [...newPosts, ...posts].slice(0, 50),
        activityLog: [...state.activityLog, { type: 'system', message: `=== 第 ${state.day + 1} 天 ===`, time: Date.now() }],
      }
    }

    case 'SAVE_GAME': {
      localStorage.setItem('community_forum_save', JSON.stringify(state))
      return {
        ...state,
        activityLog: [...state.activityLog, { type: 'system', message: '游戏已保存', time: Date.now() }],
      }
    }

    case 'LOAD_GAME': {
      const saved = localStorage.getItem('community_forum_save')
      if (!saved) return state
      return { ...JSON.parse(saved) }
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
    const interval = setInterval(() => {
      dispatch({ type: 'GENERATE_NEW_TASK' })
    }, 60000)
    return () => clearInterval(interval)
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
