import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { BUILDINGS, INITIAL_TASKS, DECORATIONS, ACHIEVEMENTS, FACILITIES, NPC_NAMES, RANDOM_POST_TOPICS, LIMITED_EVENTS, AVATARS, DAILY_EVENTS, REPORT_HISTORY_TYPES, NPC_RESIDENTS } from '../data/gameData'

const GameContext = createContext()

const generateId = () => Math.random().toString(36).substr(2, 9)

const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)]

const cloneDeep = (obj) => {
  try { return JSON.parse(JSON.stringify(obj)) } catch { return obj }
}

const buildInitialResidents = () => NPC_RESIDENTS.map(r => ({
  ...r,
  reportCount: r.reportCount || 0,
  taskCompleted: 0,
  recentPenalties: 0,
}))

const computeLeaderboard = (residents, player) => {
  const allCandidates = [
    ...residents.map(r => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      buildingName: r.buildingName,
      reputation: r.reputation,
      coins: r.coins,
      postCount: r.postCount,
      isPlayer: false,
    })),
  ]
  if (player) {
    allCandidates.push({
      id: player.id,
      name: player.name + '（你）',
      avatar: player.avatar,
      buildingName: player.buildingName,
      reputation: 0,
      coins: 0,
      postCount: 0,
      isPlayer: true,
    })
  }
  allCandidates.sort((a, b) => b.reputation - a.reputation)
  return allCandidates.map((c, idx) => ({ ...c, rank: idx + 1 }))
}

const findResidentById = (residents, id) => residents.find(r => r.id === id)
const findResidentByName = (residents, name) => residents.find(r => r.name === name)

const updateResident = (residents, matchKey, matchVal, changes) =>
  residents.map(r => (r[matchKey] === matchVal ? { ...r, ...changes } : r))

const initialState = {
  gameStarted: false,
  currentScreen: 'lobby',
  player: null,
  reputation: 0,
  coins: 100,
  residents: buildInitialResidents(),
  leaderboard: [],
  posts: [],
  tasks: [...INITIAL_TASKS].map(t => ({ ...t, id: t.id || generateId() })),
  activeTasks: [],
  completedTasks: [],
  inventory: [],
  announcements: [],
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
  eventFlags: {},
  _savedAt: null,
  _version: 3,
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
      state.residents.forEach(r => {
        relationships[r.id] = 20 + Math.floor(Math.random() * 30)
      })
      const initialAchievements = [{ ...ACHIEVEMENTS[0], unlockedAt: Date.now() }]
      const baseEvent = getRandomElement(DAILY_EVENTS.filter(e => !e.requires))
      const firstDailyEvent = baseEvent ? {
        ...cloneDeep(baseEvent),
        triggeredAt: Date.now(),
        triggeredDay: 1,
        handled: false,
      } : null
      const leaderboard = computeLeaderboard(state.residents, player)
      return {
        ...state,
        player,
        relationships,
        achievements: initialAchievements,
        reputation: 20,
        coins: 100,
        dailyEvent: firstDailyEvent,
        leaderboard,
        activityLog: [...state.activityLog, { type: 'system', message: `${name} 加入了 ${building?.name}！`, time: Date.now() }],
      }
    }

    case 'ADD_POST': {
      const post = {
        id: generateId(),
        authorId: state.player.id,
        authorName: state.player.name,
        authorAvatar: state.player.avatar,
        isPlayerPost: true,
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
      let updatedResidents = state.residents
      if (action.payload._residentBoostTarget) {
        updatedResidents = updateResident(updatedResidents, 'id', action.payload._residentBoostTarget, {
          reputation: Math.min(999, (updatedResidents.find(r => r.id === action.payload._residentBoostTarget)?.reputation || 0) + 5),
          postCount: (updatedResidents.find(r => r.id === action.payload._residentBoostTarget)?.postCount || 0) + 1,
        })
      }
      return {
        ...state,
        posts: [post, ...state.posts],
        totalPosts: state.totalPosts + 1,
        reputation: state.reputation + 2,
        relationships: newRelationships,
        residents: updatedResidents,
        leaderboard: computeLeaderboard(updatedResidents, state.player),
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
      const post = state.posts.find(p => p.id === action.payload)
      let updatedResidents = state.residents
      if (post?.authorId && !post.isPlayerPost) {
        updatedResidents = updateResident(updatedResidents, 'id', post.authorId, {
          reportCount: (findResidentById(updatedResidents, post.authorId)?.reportCount || 0) + 1,
        })
      }
      return { ...state, posts, residents: updatedResidents }
    }

    case 'IGNORE_REPORT': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isReported: false, _reviewIgnored: true, reportCount: 0 }
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
            postAuthorId: post?.authorId || null,
            action: REPORT_HISTORY_TYPES.IGNORED,
            handledAt: Date.now(),
            handledBy: state.player?.name || '管理员',
            day: state.day,
          },
        ],
        leaderboard: computeLeaderboard(state.residents, state.player),
        activityLog: [...state.activityLog, { type: 'admin', message: `管理员忽略了帖子举报：${post?.title}`, time: Date.now() }],
      }
    }

    case 'MARK_POST_COMPLIANT': {
      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isReported: false, _reviewCompliant: true, reportCount: 0 }
        }
        return p
      })
      const post = state.posts.find(p => p.id === action.payload)
      let updatedResidents = state.residents
      if (post?.authorId && !post.isPlayerPost) {
        updatedResidents = updateResident(updatedResidents, 'id', post.authorId, {
          reputation: Math.min(999, (findResidentById(updatedResidents, post.authorId)?.reputation || 0) + 3),
        })
      }
      return {
        ...state,
        posts,
        residents: updatedResidents,
        reportHistory: [
          ...state.reportHistory,
          {
            id: generateId(),
            postId: action.payload,
            postTitle: post?.title || '未知帖子',
            postAuthor: post?.authorName || '未知作者',
            postAuthorId: post?.authorId || null,
            action: REPORT_HISTORY_TYPES.COMPLIANT,
            handledAt: Date.now(),
            handledBy: state.player?.name || '管理员',
            day: state.day,
          },
        ],
        leaderboard: computeLeaderboard(updatedResidents, state.player),
        activityLog: [...state.activityLog, { type: 'admin', message: `管理员审核通过帖子：${post?.title}`, time: Date.now() }],
      }
    }

    case 'PENALIZE_POST': {
      const PENALTY_REP = 15
      const post = state.posts.find(p => p.id === action.payload)
      let updatedResidents = state.residents
      let authorRepChange = 0
      let authorNameForLog = post?.authorName || '未知作者'

      if (post?.authorId && !post.isPlayerPost) {
        const author = findResidentById(updatedResidents, post.authorId)
        if (author) {
          authorRepChange = PENALTY_REP
          updatedResidents = updateResident(updatedResidents, 'id', post.authorId, {
            reputation: Math.max(0, author.reputation - PENALTY_REP),
            reportCount: (author.reportCount || 0) + 1,
            recentPenalties: (author.recentPenalties || 0) + 1,
          })
          authorNameForLog = author.name
        }
      }

      const isPlayerPenalty = post?.isPlayerPost
      const newPlayerRep = isPlayerPenalty
        ? Math.max(0, state.reputation - PENALTY_REP)
        : state.reputation

      const posts = state.posts.map(p => {
        if (p.id === action.payload) {
          return { ...p, isPenalized: true, isReported: false, heat: 0, penalizedAt: Date.now(), _hidden: true }
        }
        return p
      })

      const penaltyMsg = isPlayerPenalty
        ? `管理员对您的违规帖子扣分：${post?.title}（您的声望-${PENALTY_REP}）`
        : `管理员对违规内容扣分：${post?.title}（${authorNameForLog}声望-${PENALTY_REP}）`

      return {
        ...state,
        posts,
        residents: updatedResidents,
        reputation: newPlayerRep,
        heatPenalties: state.heatPenalties + 1,
        reportHistory: [
          ...state.reportHistory,
          {
            id: generateId(),
            postId: action.payload,
            postTitle: post?.title || '未知帖子',
            postAuthor: post?.authorName || '未知作者',
            postAuthorId: post?.authorId || null,
            isPlayerPost: !!post?.isPlayerPost,
            action: REPORT_HISTORY_TYPES.PENALIZED,
            penalty: -PENALTY_REP,
            handledAt: Date.now(),
            handledBy: state.player?.name || '管理员',
            day: state.day,
          },
        ],
        leaderboard: computeLeaderboard(updatedResidents, state.player),
        activityLog: [...state.activityLog, { type: 'warning', message: penaltyMsg, time: Date.now() }],
      }
    }

    case 'ACCEPT_TASK': {
      const task = state.tasks.find(t => t.id === action.payload)
      if (!task) return state
      return {
        ...state,
        tasks: state.tasks.filter(t => t.id !== action.payload),
        activeTasks: [...state.activeTasks, { ...task, id: task.id || generateId(), acceptedAt: Date.now(), progress: 0, originDay: state.day }],
        activityLog: [...state.activityLog, { type: 'task', message: `接取任务：${task.title}`, time: Date.now() }],
      }
    }

    case 'PROGRESS_TASK': {
      const { taskId, progressDelta } = action.payload
      const activeTasks = state.activeTasks.map(t => {
        if (t.id === taskId) {
          return { ...t, progress: Math.min(100, (t.progress || 0) + progressDelta) }
        }
        return t
      })
      return { ...state, activeTasks }
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

      let updatedResidents = state.residents
      if (task._residentAssignee) {
        const target = findResidentById(updatedResidents, task._residentAssignee)
        if (target) {
          updatedResidents = updateResident(updatedResidents, 'id', task._residentAssignee, {
            reputation: Math.min(999, target.reputation + 5),
            taskCompleted: (target.taskCompleted || 0) + 1,
          })
          if (newRelationships[task._residentAssignee] !== undefined) {
            newRelationships[task._residentAssignee] = Math.min(100, newRelationships[task._residentAssignee] + 10)
          }
        }
      }

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
        completedTasks: [...state.completedTasks, { ...task, completedAt: Date.now(), completedDay: state.day }],
        reputation: newRep,
        coins: state.coins + task.reward.coins,
        totalHelpTasks: helpCount,
        totalDisputes: disputeCount,
        totalPatrols: patrolCount,
        totalMarketTrades: marketCount,
        achievements: newAchievements,
        relationships: newRelationships,
        residents: updatedResidents,
        leaderboard: computeLeaderboard(updatedResidents, state.player),
        activityLog: [...state.activityLog, { type: 'success', message: `完成任务：${task.title}，声望+${task.reward.reputation}，金币+${task.reward.coins}`, time: Date.now() }],
      }
    }

    case 'GENERATE_NEW_TASK': {
      if (state.tasks.length >= 15) return state
      const taskType = action.payload?.type || null
      const residentAssign = action.payload?.residentId || null
      const baseTemplates = [
        { type: 'help', titlePool: ['送东西', '照看宠物', '浇花', '搬重物', '取快递', '代买东西', '看小孩'] },
        { type: 'market', titlePool: ['闲置电器', '儿童玩具', '手工艺品', '旧衣物', '书籍文具', '家居用品'] },
        { type: 'dispute', titlePool: ['噪音', '宠物乱跑', '车位', '电梯等待', '垃圾堆放', '晾衣服滴水'] },
        { type: 'help', titlePool: ['核酸采样', '老年活动', '儿童托管', '快递分拣', '垃圾分类', '义诊协助'] },
        { type: 'patrol', titlePool: ['夜间巡逻', '防诈骗宣传', '消防通道检查', '安全隐患排查'] },
      ]
      const pick = taskType ? baseTemplates.find(b => b.type === taskType) || baseTemplates[0] : getRandomElement(baseTemplates)
      let title
      if (residentAssign) {
        const res = findResidentById(state.residents, residentAssign)
        const who = res ? res.name : getRandomElement(NPC_NAMES)
        title = pick.type === 'patrol'
          ? `和${who}一起${getRandomElement(pick.titlePool)}`
          : `${pick.type === 'dispute' ? '协助' : '帮'}${who}处理${getRandomElement(pick.titlePool)}${pick.type === 'market' ? '的跳蚤摊位' : ''}`
      } else {
        const who = getRandomElement(NPC_NAMES)
        title = pick.type === 'help'
          ? `帮${who}${getRandomElement(pick.titlePool)}`
          : pick.type === 'market'
          ? `跳蚤市场 - 出售${getRandomElement(pick.titlePool)}`
          : pick.type === 'dispute'
          ? `处理${getRandomElement(pick.titlePool)}纠纷`
          : `组队${getRandomElement(pick.titlePool)}`
      }
      const newTask = {
        id: generateId(),
        type: pick.type,
        title,
        description: title + ' - 热心住户可以联系',
        reward: {
          reputation: pick.type === 'patrol' ? 35 + Math.floor(Math.random() * 15) : pick.type === 'dispute' ? 25 + Math.floor(Math.random() * 15) : 10 + Math.floor(Math.random() * 20),
          coins: pick.type === 'market' ? 30 + Math.floor(Math.random() * 40) : 15 + Math.floor(Math.random() * 20),
        },
        timeLimit: pick.type === 'patrol' ? 3600 : 300 + Math.floor(Math.random() * 600),
        requireTeam: pick.type === 'patrol' && Math.random() < 0.4,
        generatedAt: Date.now(),
        generatedDay: state.day,
        _residentAssignee: residentAssign,
      }
      return { ...state, tasks: [...state.tasks, newTask] }
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
      const announcement = { id: generateId(), ...action.payload, createdAt: Date.now() }
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
        limitedEvent: { ...action.payload, startedAt: Date.now(), startedDay: state.day, progress: 0 },
        activityLog: [...state.activityLog, { type: 'event', message: `参加限时活动：${action.payload.name}`, time: Date.now() }],
      }
    }

    case 'COMPLETE_LIMITED_EVENT': {
      if (!state.limitedEvent) return state
      const reward = state.limitedEvent.reward
      const finishedEvent = { ...state.limitedEvent, completedAt: Date.now(), completedDay: state.day }
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
        teamMembers: [...state.teamMembers, { id: generateId(), name: getRandomElement(NPC_NAMES), avatar: getRandomElement(AVATARS) }],
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

      let updatedResidents = state.residents
      let extraPosts = []
      const logs = []
      const newEventFlags = { ...state.eventFlags, [state.dailyEvent.id]: choice.flag }

      if (state.dailyEvent.targetResident || choice.targetResidentRepBoost) {
        const targetId = state.dailyEvent.targetResident
        if (targetId) {
          const target = findResidentById(updatedResidents, targetId)
          if (target) {
            let delta = choice.targetResidentRepBoost || 0
            if (newRelationships[targetId] !== undefined && delta !== 0) {
              newRelationships[targetId] = Math.max(0, Math.min(100, newRelationships[targetId] + Math.sign(delta) * Math.max(2, Math.abs(delta) / 2)))
            }
            if (delta !== 0) {
              updatedResidents = updateResident(updatedResidents, 'id', targetId, {
                reputation: Math.max(0, Math.min(999, target.reputation + delta)),
              })
              logs.push(`${target.name}声望${delta > 0 ? '+' : ''}${delta}`)
            }
          }
        }
      }

      if (choice.generateHeatPost) {
        const authorName = state.player?.name || '热心邻居'
        const topic = choice.postToGenerate || { title: `关于「${state.dailyEvent.title}」的后续`, content: '感谢大家的支持与理解，邻里和谐靠大家~', category: '分享' }
        extraPosts.push({
          id: generateId(),
          authorId: state.player?.id || 'system',
          authorName,
          authorAvatar: state.player?.avatar || '📝',
          isPlayerPost: !!state.player,
          title: typeof topic === 'string' ? topic : topic.title,
          content: typeof topic === 'string' ? `关于${state.dailyEvent.title}，给大家报个平安。` : topic.content,
          category: '事件跟进',
          likes: 15 + Math.floor(Math.random() * 30),
          comments: [],
          heat: 40 + Math.floor(Math.random() * 40),
          createdAt: Date.now(),
        })
      }

      const dispatchedTasks = []
      if (choice.generateTaskType) {
        gameReducer(state, { type: 'GENERATE_NEW_TASK', payload: { type: choice.generateTaskType, residentId: state.dailyEvent.targetResident } })
      }
      if (choice.generateTaskForResident && state.dailyEvent.targetResident) {
        dispatchedTasks.push({ type: 'GENERATE_NEW_TASK', payload: { residentId: state.dailyEvent.targetResident, type: 'help' } })
      }

      const handledEvent = {
        ...state.dailyEvent,
        handled: true,
        chosenChoice: choice.label,
        chosenFlag: choice.flag,
        handledAt: Date.now(),
        handledDay: state.day,
        effect: eff,
      }

      const playerLog = []
      if (eff.reputation !== 0) playerLog.push(`声望${eff.reputation > 0 ? '+' : ''}${eff.reputation}`)
      if (eff.coins !== 0) playerLog.push(`金币${eff.coins > 0 ? '+' : ''}${eff.coins}`)
      if (eff.relationshipBoost !== 0) playerLog.push(`邻里好感${eff.relationshipBoost > 0 ? '+' : ''}${eff.relationshipBoost}`)

      let interimState = {
        ...state,
        dailyEvent: handledEvent,
        reputation: Math.max(0, state.reputation + eff.reputation),
        coins: Math.max(0, state.coins + eff.coins),
        relationships: newRelationships,
        residents: updatedResidents,
        eventFlags: newEventFlags,
        leaderboard: computeLeaderboard(updatedResidents, state.player),
        posts: [...extraPosts, ...state.posts].slice(0, 60),
        dailyEventHistory: [...state.dailyEventHistory, { type: 'daily', event: handledEvent }],
        activityLog: [...state.activityLog, {
          type: eff.reputation >= 0 ? 'event' : 'warning',
          message: `处理事件「${state.dailyEvent.title}」：${choice.label}（${[...playerLog, ...logs].join('，') || '无影响'}）`,
          time: Date.now(),
        }],
      }
      if (dispatchedTasks.length > 0) {
        dispatchedTasks.forEach(a => {
          interimState = gameReducer(interimState, a)
        })
      }
      return interimState
    }

    case 'NEXT_DAY': {
      try {
        const newDay = state.day + 1

        const posts = state.posts.map(p => ({
          ...p,
          heat: Math.max(0, Math.floor(p.heat * 0.75)),
        }))

        const prevEvent = state.dailyEvent
        let updatedEventHistory = [...state.dailyEventHistory]
        if (prevEvent) {
          if (!prevEvent.handled) {
            updatedEventHistory.push({
              type: 'daily_expired',
              event: { ...prevEvent, expired: true, expiredDay: newDay, handled: false },
            })
          }
        }

        const lastEventDone = true
        let newDailyEvent = null
        if (prevEvent && !prevEvent.handled && prevEvent.followUp) {
          const flag = state.eventFlags[prevEvent.id]
          const followId = flag && prevEvent.followUp[flag]
          if (followId) {
            const followEv = DAILY_EVENTS.find(e => e.id === followId)
            if (followEv) {
              newDailyEvent = {
                ...cloneDeep(followEv),
                triggeredAt: Date.now(),
                triggeredDay: newDay,
                handled: false,
                _isFollowUp: true,
              }
            }
          }
        }
        if (!newDailyEvent && prevEvent && prevEvent.handled && prevEvent.followUp) {
          const flag = prevEvent.chosenFlag
          const followId = flag && prevEvent.followUp[flag]
          if (followId) {
            const followEv = DAILY_EVENTS.find(e => e.id === followId)
            if (followEv) {
              newDailyEvent = {
                ...cloneDeep(followEv),
                triggeredAt: Date.now(),
                triggeredDay: newDay,
                handled: false,
                _isFollowUp: true,
              }
            }
          }
        }
        if (!newDailyEvent) {
          const matchingFollowUps = DAILY_EVENTS.filter(e => {
            if (!e.requires) return false
            const r = e.requires
            return state.eventFlags[r.prevEventId] === r.prevFlag
              && !state.dailyEventHistory.some(h => h.event?.id === e.id)
          })
          if (matchingFollowUps.length > 0) {
            const pick = matchingFollowUps[Math.floor(Math.random() * matchingFollowUps.length)]
            newDailyEvent = {
              ...cloneDeep(pick),
              triggeredAt: Date.now(),
              triggeredDay: newDay,
              handled: false,
              _isFollowUp: true,
            }
          }
        }
        if (!newDailyEvent) {
          const standalone = DAILY_EVENTS.filter(e => !e.requires
            && !updatedEventHistory.slice(-8).some(h => h.event?.id === e.id))
          const pool = standalone.length > 0 ? standalone : DAILY_EVENTS.filter(e => !e.requires)
          if (pool.length > 0) {
            newDailyEvent = {
              ...cloneDeep(getRandomElement(pool)),
              triggeredAt: Date.now(),
              triggeredDay: newDay,
              handled: false,
            }
          }
        }

        const newPostCount = 2 + Math.floor(Math.random() * 2)
        const newPosts = []
        const usedNpcIds = new Set()
        for (let i = 0; i < newPostCount; i++) {
          let resident = getRandomElement(state.residents)
          let attempts = 0
          while (usedNpcIds.has(resident.id) && attempts < 5) {
            resident = getRandomElement(state.residents)
            attempts++
          }
          usedNpcIds.add(resident.id)
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
          const maybeReported = Math.random() < 0.12
          newPosts.push({
            id: generateId(),
            authorId: resident.id,
            authorName: resident.name,
            authorAvatar: resident.avatar,
            authorBuilding: resident.buildingName,
            isPlayerPost: false,
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

        let updatedResidents = [...state.residents]
        newPosts.forEach(p => {
          const r = findResidentById(updatedResidents, p.authorId)
          if (r) {
            updatedResidents = updateResident(updatedResidents, 'id', p.authorId, {
              postCount: (r.postCount || 0) + 1,
              reputation: Math.min(999, r.reputation + (p.isReported ? 0 : 1 + Math.floor(Math.random() * 2))),
            })
          }
        })
        if (newPosts.some(p => p.isReported)) {
          const rp = newPosts.find(p => p.isReported)
          const r = findResidentById(updatedResidents, rp.authorId)
          if (r) {
            updatedResidents = updateResident(updatedResidents, 'id', rp.authorId, {
              reportCount: (r.reportCount || 0) + rp.reportCount,
            })
          }
        }

        const newTaskCount = 2 + Math.floor(Math.random() * 3)
        const newTasks = []
        for (let i = 0; i < newTaskCount; i++) {
          const templates = [
            { type: 'help', t: `帮${getRandomElement(NPC_NAMES)}${getRandomElement(['送东西', '照看宠物', '浇花', '搬重物', '取快递'])}` },
            { type: 'market', t: `跳蚤市场 - 出售${getRandomElement(['闲置电器', '儿童玩具', '手工艺品', '旧衣物'])}` },
            { type: 'dispute', t: '处理邻里纠纷' },
            { type: 'patrol', t: '组队安全巡逻' },
          ]
          const tmpl = getRandomElement(templates)
          newTasks.push({
            id: generateId(),
            type: tmpl.type,
            title: tmpl.t,
            description: '邻居有事需要帮忙，热心住户可以联系',
            reward: {
              reputation: tmpl.type === 'patrol' ? 35 : tmpl.type === 'dispute' ? 25 + Math.floor(Math.random() * 15) : 10 + Math.floor(Math.random() * 20),
              coins: tmpl.type === 'market' ? 30 + Math.floor(Math.random() * 40) : 15 + Math.floor(Math.random() * 20),
            },
            timeLimit: tmpl.type === 'patrol' ? 3600 : 300 + Math.floor(Math.random() * 600),
            requireTeam: tmpl.type === 'patrol' && Math.random() < 0.4,
            generatedAt: Date.now(),
            generatedDay: newDay,
          })
        }

        const existingTaskIds = new Set(state.tasks.map(t => t.id))
        const mergedTasks = [...state.tasks, ...newTasks.filter(t => !existingTaskIds.has(t.id))]

        const progressedActiveTasks = state.activeTasks.map(t => {
          const cur = t.progress || 0
          if (cur >= 100) return t
          return {
            ...t,
            progress: Math.min(100, cur + 15 + Math.floor(Math.random() * 20)),
            lastProgressedDay: newDay,
          }
        })

        const newLogs = [
          { type: 'system', message: `━━━━━ 第 ${newDay} 天开始 ━━━━━`, time: Date.now() },
        ]
        if (prevEvent && !prevEvent.handled) {
          newLogs.push({ type: 'warning', message: `「${prevEvent.title}」未处理已自动过期`, time: Date.now() + 1 })
        }
        if (newPosts.length > 0) {
          newLogs.push({ type: 'post', message: `邻居们发布了 ${newPosts.length} 条新帖子`, time: Date.now() + 2 })
        }
        if (newTasks.length > 0) {
          newLogs.push({ type: 'task', message: `小区发布了 ${newTasks.length} 个新任务`, time: Date.now() + 3 })
        }
        if (newDailyEvent) {
          newLogs.push({ type: 'event', message: `今日事件：${newDailyEvent.title}`, time: Date.now() + 4 })
        }

        return {
          ...state,
          day: newDay,
          posts: [...newPosts, ...posts].slice(0, 60),
          tasks: mergedTasks.slice(0, 15),
          activeTasks: progressedActiveTasks,
          dailyEvent: newDailyEvent,
          dailyEventHistory: updatedEventHistory.slice(-100),
          residents: updatedResidents,
          leaderboard: computeLeaderboard(updatedResidents, state.player),
          activityLog: [...state.activityLog, ...newLogs].slice(-200),
        }
      } catch (e) {
        console.error('NEXT_DAY error:', e)
        return {
          ...state,
          day: state.day + 1,
          activityLog: [...state.activityLog, { type: 'warning', message: `进入第 ${state.day + 1} 天（部分数据刷新跳过）`, time: Date.now() }],
        }
      }
    }

    case 'SAVE_GAME': {
      try {
        const stateToSave = { ...state, _savedAt: Date.now(), _version: 3 }
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
        const baseResidents = buildInitialResidents()
        const mergedResidents = Array.isArray(parsed.residents) && parsed.residents.length > 0
          ? baseResidents.map(base => {
            const savedR = parsed.residents.find(x => x.id === base.id)
            return savedR ? { ...base, ...savedR } : base
          })
          : baseResidents
        const mergedRelationships = parsed.relationships && Object.keys(parsed.relationships).length > 0
          ? parsed.relationships
          : (() => {
            const rel = {}
            mergedResidents.forEach(r => { rel[r.id] = 20 + Math.floor(Math.random() * 30) })
            return rel
          })()
        const mergedActiveTasks = Array.isArray(parsed.activeTasks) && parsed.activeTasks.length > 0
          ? parsed.activeTasks.map(t => ({
            ...t,
            progress: t.progress ?? 0,
            id: t.id || generateId(),
          }))
          : []
        const mergedTasks = Array.isArray(parsed.tasks) && parsed.tasks.length > 0
          ? parsed.tasks.map(t => ({ ...t, id: t.id || generateId() }))
          : [...INITIAL_TASKS].map(t => ({ ...t, id: t.id || generateId() }))

        const merged = {
          ...initialState,
          ...parsed,
          residents: mergedResidents,
          relationships: mergedRelationships,
          tasks: mergedTasks,
          activeTasks: mergedActiveTasks,
          completedTasks: Array.isArray(parsed.completedTasks) ? parsed.completedTasks : [],
          posts: Array.isArray(parsed.posts) ? parsed.posts : [],
          activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
          achievements: Array.isArray(parsed.achievements) ? parsed.achievements : [],
          reportHistory: Array.isArray(parsed.reportHistory) ? parsed.reportHistory : [],
          dailyEventHistory: Array.isArray(parsed.dailyEventHistory) ? parsed.dailyEventHistory : [],
          eventFlags: parsed.eventFlags || {},
          facilities: Array.isArray(parsed.facilities) && parsed.facilities.length > 0
            ? parsed.facilities.map((f, i) => ({ ...FACILITIES[i], votes: f.votes || 0 }))
            : [...FACILITIES],
          inventory: Array.isArray(parsed.inventory) ? parsed.inventory : [],
          announcements: Array.isArray(parsed.announcements) ? parsed.announcements : [],
          currentScreen: parsed.currentScreen || 'lobby',
          _version: 3,
        }
        if (parsed.player) {
          merged.leaderboard = computeLeaderboard(merged.residents, parsed.player)
        }
        if (!merged.dailyEvent || merged.dailyEvent?.handled) {
          const pickFrom = DAILY_EVENTS.filter(e => !e.requires
            && !merged.dailyEventHistory.slice(-5).some(h => h.event?.id === e.id))
          const pool = pickFrom.length > 0 ? pickFrom : DAILY_EVENTS.filter(e => !e.requires)
          if (pool.length > 0) {
            merged.dailyEvent = {
              ...cloneDeep(getRandomElement(pool)),
              triggeredAt: Date.now(),
              triggeredDay: merged.day,
              handled: false,
            }
          }
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
      }, 60000)
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
