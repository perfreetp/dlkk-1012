import React, { useState, useEffect, useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { LIMITED_EVENTS, NPC_RESIDENTS } from '../data/gameData'

const TASK_TYPES = {
  help: { name: '互助任务', icon: '🤝', color: 'secondary' },
  dispute: { name: '纠纷调解', icon: '⚖️', color: 'danger' },
  market: { name: '跳蚤市场', icon: '🛒', color: 'accent' },
  patrol: { name: '组队巡逻', icon: '🛡️', color: 'primary' },
}

export default function Tasks() {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('available')
  const [eventProgress, setEventProgress] = useState(state.limitedEvent?.progress || 0)
  const [showEventModal, setShowEventModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)

  const stableIds = useMemo(() => state.activeTasks.map(t => t.id).join('|'), [state.activeTasks])
  useEffect(() => {
    const interval = setInterval(() => {
      state.activeTasks.forEach(task => {
        const cur = task.progress || 0
        if (cur < 100) {
          dispatch({ type: 'PROGRESS_TASK', payload: { taskId: task.id, progressDelta: Math.random() * 4 + 2 } })        }
      })
      if (state.limitedEvent) {
        setEventProgress(prev => Math.min(100, prev + Math.random() * 3 + 1))
      }
    }, 600)
    return () => clearInterval(interval)
  }, [stableIds, state.limitedEvent])

  useEffect(() => {
    setEventProgress(state.limitedEvent?.progress || 0)
  }, [state.limitedEvent?.id])

  const getTaskBadge = type => {
    const info = TASK_TYPES[type] || { name: '任务', icon: '📋', color: 'primary' }
    return <span className={`badge badge-${info.color}`}>{info.icon} {info.name}</span>
  }

  const getResidentAssignee = rid => {
    if (!rid) return null
    return NPC_RESIDENTS.find(r => r.id === rid) || null
  }

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex gap-12 mb-16" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
            {[
              { key: 'available', label: '📋 可接任务', count: state.tasks.length },
              { key: 'active', label: '⏳ 进行中', count: state.activeTasks.length },
              { key: 'completed', label: '✅ 已完成', count: state.completedTasks.length },
            ].map(tab => (
              <button
                key={tab.key}
                className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(tab.key)}
                style={{ fontSize: '0.85rem' }}
              >
                {tab.label}
                <span className="badge" style={{ background: activeTab === tab.key ? 'rgba(255,255,255,0.25)' : 'var(--border)', marginLeft: '6px' }}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {activeTab === 'available' && (
            <div className="scroll-container" style={{ maxHeight: '500px' }}>
              {state.tasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📭</div>
                  <p>暂无可接任务，稍后再来看看吧~</p>
                  <button
                    className="btn btn-primary mt-8"
                    onClick={() => dispatch({ type: 'GENERATE_NEW_TASK' })}
                  >
                    🔄 刷新任务
                  </button>
                </div>
              ) : (
                state.tasks.map(task => (
                  <div key={task.id} className="card" style={{ marginBottom: '12px', border: '2px solid var(--border)' }}>
                    <div className="flex-between mb-12">
                      <div>
                        {getTaskBadge(task.type)}
                        <h3 className="font-bold mt-8" style={{ fontSize: '1.05rem' }}>{task.title}</h3>
                      </div>
                      <div className="text-right">
                        <div className="text-sm mb-4">
                          <span className="text-primary">⭐ +{task.reward.reputation}</span>
                          <span className="text-accent" style={{ marginLeft: '10px' }}>🪙 +{task.reward.coins}</span>
                        </div>
                        <div className="text-xs text-light">⏱️ {Math.floor(task.timeLimit / 60)}分钟</div>
                      </div>
                    </div>
                    <p className="text-sm text-light mb-12">{task.description}</p>
                    {task.requireTeam && (
                      <div className="mb-12">
                        <span className="badge badge-primary">
                          👥 需要组队（当前 {state.teamMembers.length + 1}/4）
                        </span>
                      </div>
                    )}
                    <div className="flex gap-12">
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        disabled={task.requireTeam && state.teamMembers.length < 1}
                        onClick={() => dispatch({ type: 'ACCEPT_TASK', payload: task.id })}
                      >
                        ✅ 接取任务
                      </button>
                      {task.requireTeam && state.teamMembers.length < 3 && (
                        <button
                          className="btn btn-outline"
                          onClick={() => dispatch({ type: 'JOIN_TEAM' })}
                        >
                          ➕ 招募队友
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'active' && (
            <div className="scroll-container" style={{ maxHeight: '500px' }}>
              {state.activeTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">⏳</div>
                  <p>暂无进行中的任务，去接取一些任务吧！</p>
                </div>
              ) : (
                state.activeTasks.map(task => {
                  const progress = task.progress || 0
                  const ready = progress >= 100
                  const assignee = getResidentAssignee(task._residentAssignee)
                  return (
                    <div key={task.id} className="card" style={{
                      marginBottom: '12px',
                      border: ready ? '2px solid #10b981' : '2px solid var(--primary-light)',
                      background: ready ? 'linear-gradient(135deg, #ecfdf5, #d1fae5)' : undefined,
                    }}>
                      <div className="flex-between mb-12">
                        <div>
                          {getTaskBadge(task.type)}
                          <h3 className="font-bold mt-8" style={{ fontSize: '1.05rem' }}>{task.title}</h3>
                          {assignee && (
                            <div className="text-xs mt-4" style={{ color: '#6b7280' }}>
                              🧑‍🤝‍🧑 关联住户：{assignee.avatar} {assignee.name}（{assignee.buildingName}）
                            </div>
                          )}
                        </div>
                        <span className={`badge ${ready ? 'badge-secondary' : 'badge-accent pulse'}`}>
                          {ready ? '✅ 可交付' : '进行中'}
                        </span>
                      </div>
                      <p className="text-sm text-light mb-12">{task.description}</p>
                      <div className="mb-8">
                        <div className="flex-between mb-4">
                          <span className="text-sm">任务进度</span>
                          <span className={`text-sm font-bold ${ready ? 'text-secondary' : 'text-primary'}`}>
                            {Math.floor(progress)}%{ready ? ' — 可提交完成！' : ''}
                          </span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className={`progress-fill ${ready ? '' : ''}`}
                            style={{
                              width: progress + '%',
                              background: ready
                                ? 'linear-gradient(90deg, #34d399, #10b981)'
                                : undefined,
                            }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex gap-12">
                        <button
                          className={`btn ${ready ? 'btn-secondary' : 'btn-outline'}`}
                          style={{ flex: 1 }}
                          disabled={!ready}
                          onClick={() => dispatch({ type: 'COMPLETE_TASK', payload: task.id })}
                        >
                          {ready ? '🎁 提交完成并领取奖励' : '⏳ 进度推进中...'}
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          )}

          {activeTab === 'completed' && (
            <div className="scroll-container" style={{ maxHeight: '500px' }}>
              {state.completedTasks.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🏆</div>
                  <p>还没有完成任何任务，加油！</p>
                </div>
              ) : (
                state.completedTasks.slice().reverse().map(task => (
                  <div key={task.id} className="card" style={{ marginBottom: '12px', background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)', border: '2px solid #bbf7d0' }}>
                    <div className="flex-between mb-8">
                      <div>
                        {getTaskBadge(task.type)}
                        <h3 className="font-bold mt-8" style={{ fontSize: '1rem' }}>{task.title}</h3>
                      </div>
                      <span className="badge badge-secondary">✅ 已完成</span>
                    </div>
                    <div className="flex gap-16 text-sm">
                      <span className="text-primary">⭐ +{task.reward.reputation}</span>
                      <span className="text-accent">🪙 +{task.reward.coins}</span>
                      <span className="text-light">
                        📅 {new Date(task.completedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">👥 组队中心</h2>
          <div className="mb-16">
            <div className="text-sm mb-8">当前队伍（{state.teamMembers.length + 1}/4）</div>
            <div className="flex gap-12 mb-12 flex-wrap">
              <div style={{ textAlign: 'center' }}>
                <div className="avatar" style={{ border: '3px solid var(--secondary)' }}>{state.player.avatar}</div>
                <div className="text-xs mt-4 text-secondary font-bold">{state.player.name}</div>
                <div className="text-xs text-light">队长</div>
              </div>
              {state.teamMembers.map(m => (
                <div key={m.id} style={{ textAlign: 'center' }}>
                  <div className="avatar">{m.avatar}</div>
                  <div className="text-xs mt-4 font-bold">{m.name}</div>
                  <div className="text-xs text-light">
                    <button
                      className="text-danger"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}
                      onClick={() => dispatch({ type: 'LEAVE_TEAM', payload: m.id })}
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
              {state.teamMembers.length < 3 && (
                <div style={{ textAlign: 'center', opacity: 0.5 }}>
                  <div className="avatar" style={{ background: 'var(--border)', border: '2px dashed #94a3b8' }}>➕</div>
                  <div className="text-xs mt-4 text-light">空位</div>
                </div>
              )}
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={state.teamMembers.length >= 3}
              onClick={() => dispatch({ type: 'JOIN_TEAM' })}
            >
              ➕ 招募一位邻居
            </button>
          </div>

          <div className="divider"></div>

          <h2 className="card-title">🎊 限时活动</h2>
          {state.limitedEvent ? (
            <div className="card" style={{ marginBottom: 0, background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid #f59e0b' }}>
              <div className="text-center mb-12">
                <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{state.limitedEvent.icon}</div>
                <div className="font-bold">{state.limitedEvent.name}</div>
              </div>
              <p className="text-sm text-light mb-12" style={{ color: '#78350f' }}>
                {state.limitedEvent.description}
              </p>
              <div className="mb-12">
                <div className="flex-between mb-4 text-sm">
                  <span>活动进度</span>
                  <span className="font-bold">{Math.floor(eventProgress)}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: eventProgress + '%',
                      background: 'linear-gradient(90deg, #fbbf24, #f59e0b)',
                    }}
                  ></div>
                </div>
              </div>
              <div className="text-xs text-light mb-12 text-center" style={{ color: '#78350f' }}>
                奖励：⭐ +{state.limitedEvent.reward.reputation} | 🪙 +{state.limitedEvent.reward.coins}
              </div>
              <button
                className="btn btn-accent"
                style={{ width: '100%' }}
                disabled={eventProgress < 100}
                onClick={() => {
                  dispatch({ type: 'COMPLETE_LIMITED_EVENT' })
                  setEventProgress(0)
                }}
              >
                {eventProgress >= 100 ? '🎉 领取奖励' : '⏳ 参与中...'}
              </button>
            </div>
          ) : (
            <div className="scroll-container" style={{ maxHeight: '300px' }}>
              {LIMITED_EVENTS.map(ev => (
                <div
                  key={ev.id}
                  className="card"
                  style={{
                    marginBottom: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                  }}
                  onClick={() => {
                    setCurrentEvent(ev)
                    setShowEventModal(true)
                  }}
                >
                  <div className="flex-between mb-4">
                    <div className="flex gap-8" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem' }}>{ev.icon}</span>
                      <span className="font-bold text-sm">{ev.name}</span>
                    </div>
                    <span className="badge badge-accent">🎊 限时</span>
                  </div>
                  <p className="text-xs text-light mb-8">{ev.description}</p>
                  <div className="text-xs">
                    <span className="text-primary">⭐ +{ev.reward.reputation}</span>
                    <span className="text-accent" style={{ marginLeft: '10px' }}>🪙 +{ev.reward.coins}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showEventModal && currentEvent && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{currentEvent.icon} {currentEvent.name}</h2>
              <button className="close-btn" onClick={() => setShowEventModal(false)}>×</button>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
              <div style={{ fontSize: '5rem' }}>{currentEvent.icon}</div>
              <div className="font-bold mt-8" style={{ fontSize: '1.2rem' }}>{currentEvent.name}</div>
            </div>
            <p className="text-light mb-12">{currentEvent.description}</p>
            <div className="grid grid-2 gap-12 mb-16">
              <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                <div className="text-xs text-light mb-4">活动时长</div>
                <div className="font-bold text-primary" style={{ fontSize: '1.3rem' }}>
                  {Math.floor(currentEvent.duration / 60)}分钟
                </div>
              </div>
              <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                <div className="text-xs text-light mb-4">预计奖励</div>
                <div style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  <span className="text-primary">⭐{currentEvent.reward.reputation}</span>
                  <span className="text-accent" style={{ marginLeft: '8px' }}>🪙{currentEvent.reward.coins}</span>
                </div>
              </div>
            </div>
            <button
              className="btn btn-accent"
              style={{ width: '100%' }}
              onClick={() => {
                dispatch({ type: 'START_LIMITED_EVENT', payload: currentEvent })
                setEventProgress(0)
                setShowEventModal(false)
              }}
            >
              🎊 立即参加活动
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
