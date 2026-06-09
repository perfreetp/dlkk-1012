import React, { useEffect, useState } from 'react'
import { useGame } from './context/GameContext'
import Lobby from './screens/Lobby.jsx'
import MapScreen from './screens/MapScreen.jsx'
import Tasks from './screens/Tasks.jsx'
import Forum from './screens/Forum.jsx'
import Inventory from './screens/Inventory.jsx'
import Leaderboard from './screens/Leaderboard.jsx'
import AdminPanel from './screens/AdminPanel.jsx'
import SaveLoadModal from './components/SaveLoadModal.jsx'
import ShareModal from './components/ShareModal.jsx'

const SCREENS = {
  lobby: { name: '大厅', icon: '🏠' },
  map: { name: '地图', icon: '🗺️' },
  tasks: { name: '任务', icon: '📋' },
  forum: { name: '论坛', icon: '💬' },
  inventory: { name: '背包', icon: '🎒' },
  leaderboard: { name: '排行榜', icon: '🏆' },
  admin: { name: '管理台', icon: '⚙️' },
}

export default function App() {
  const { state, dispatch } = useGame()
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [newAchievement, setNewAchievement] = useState(null)

  useEffect(() => {
    const prevCount = state.achievements.length - 1
    if (state.achievements.length > 0 && state.achievements[state.achievements.length - 1]) {
      const latest = state.achievements[state.achievements.length - 1]
      if (latest && !latest._shown) {
        setNewAchievement(latest)
        latest._shown = true
        setTimeout(() => setNewAchievement(null), 3500)
      }
    }
  }, [state.achievements.length])

  const renderScreen = () => {
    if (!state.player) {
      return <Lobby onStart={() => dispatch({ type: 'START_GAME' })} />
    }

    switch (state.currentScreen) {
      case 'lobby':
        return <Lobby />
      case 'map':
        return <MapScreen />
      case 'tasks':
        return <Tasks />
      case 'forum':
        return <Forum />
      case 'inventory':
        return <Inventory />
      case 'leaderboard':
        return <Leaderboard />
      case 'admin':
        return <AdminPanel />
      default:
        return <Lobby />
    }
  }

  return (
    <div className="app-container">
      <header className="top-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <span>🏘️</span>
            <span>邻里家园</span>
            {state.player && (
              <span className="badge" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                第 {state.day} 天
              </span>
            )}
          </div>
          {state.player && (
            <>
              <div className="nav-stats">
                <div className="nav-stat">
                  <span>⭐</span>
                  <span>声望 {state.reputation}</span>
                </div>
                <div className="nav-stat">
                  <span>🪙</span>
                  <span>金币 {state.coins}</span>
                </div>
                <div className="nav-stat">
                  <span>📦</span>
                  <span>背包 {state.inventory.length}</span>
                </div>
                {state.teamMembers.length > 0 && (
                  <div className="nav-stat">
                    <span>👥</span>
                    <span>队伍 {state.teamMembers.length + 1}/4</span>
                  </div>
                )}
              </div>
              <div className="nav-actions">
                <button className="nav-btn" onClick={() => dispatch({ type: 'NEXT_DAY' })}>
                  🌙 下一天
                </button>
                <button className="nav-btn" onClick={() => setShowSaveModal(true)}>
                  💾 存档
                </button>
                <button className="nav-btn" onClick={() => setShowShareModal(true)}>
                  📤 分享
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="main-content">
        {renderScreen()}
      </main>

      {state.player && (
        <nav className="bottom-nav">
          <div className="nav-tabs">
            {Object.entries(SCREENS).map(([key, val]) => {
              if (key === 'admin' && !state.isAdmin) return null
              return (
                <button
                  key={key}
                  className={`nav-tab ${state.currentScreen === key ? 'active' : ''}`}
                  onClick={() => dispatch({ type: 'SET_SCREEN', payload: key })}
                >
                  <span className="nav-tab-icon">{val.icon}</span>
                  <span>{val.name}</span>
                </button>
              )
            })}
          </div>
        </nav>
      )}

      {showSaveModal && (
        <SaveLoadModal
          onClose={() => setShowSaveModal(false)}
          onSave={() => dispatch({ type: 'SAVE_GAME' })}
          onLoad={() => { dispatch({ type: 'LOAD_GAME' }); setShowSaveModal(false) }}
        />
      )}

      {showShareModal && (
        <ShareModal onClose={() => setShowShareModal(false)} />
      )}

      {newAchievement && (
        <div className="achievement-popup">
          <div style={{ fontSize: '0.8rem', opacity: 0.9 }}>🎉 解锁成就</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 'bold', marginTop: '4px' }}>
            {newAchievement.icon} {newAchievement.name}
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '4px', opacity: 0.9 }}>
            {newAchievement.description}
          </div>
        </div>
      )}
    </div>
  )
}
