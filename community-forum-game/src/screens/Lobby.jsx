import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { BUILDINGS, AVATARS, NPC_RESIDENTS } from '../data/gameData'

export default function Lobby({ onStart }) {
  const { state, dispatch } = useGame()
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [buildingId, setBuildingId] = useState(1)
  const [showAdminLogin, setShowAdminLogin] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [residentLookup, setResidentLookup] = useState(null)

  const handleCreate = () => {
    if (!name.trim()) {
      alert('请输入您的姓名')
      return
    }
    dispatch({ type: 'CREATE_CHARACTER', payload: { name: name.trim(), avatar, buildingId } })
    if (onStart) onStart()
  }

  const handleAdminLogin = () => {
    if (adminCode === 'admin123') {
      dispatch({ type: 'SET_ADMIN', payload: true })
      setShowAdminLogin(false)
      alert('管理员权限已开启！')
    } else {
      alert('管理员密码错误')
    }
  }

  const latestLogs = state.activityLog.slice(-10).reverse()

  const avgRelationship = Object.values(state.relationships).length > 0
    ? Math.round(Object.values(state.relationships).reduce((a, b) => a + b, 0) / Object.values(state.relationships).length)
    : 0

  const getResidentById = (rid) => state.residents.find(r => r.id === rid) || NPC_RESIDENTS.find(r => r.id === rid)

  if (!state.player) {
    return (
      <div>
        <div className="welcome-hero">
          <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🏘️</div>
          <h1 className="welcome-title">欢迎来到邻里家园</h1>
          <p className="welcome-subtitle">
            在这里，你将成为小区的一员，与邻居们一起建设美好的社区生活！
          </p>
          <button
            className="btn"
            style={{ background: 'white', color: '#6366f1', fontSize: '1.1rem', padding: '14px 32px', fontWeight: 'bold' }}
            onClick={() => {
              dispatch({ type: 'START_GAME' })
              setName('新住户' + Math.floor(Math.random() * 1000))
            }}
          >
            🎮 开始游戏
          </button>
        </div>

        <div className="card">
          <h2 className="card-title">👤 创建你的住户角色</h2>

          <div className="grid grid-2 gap-16 mb-16">
            <div>
              <label className="label">姓名</label>
              <input
                type="text"
                className="input"
                placeholder="请输入您的姓名"
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={10}
              />
            </div>
            <div>
              <label className="label">选择楼栋</label>
              <select
                className="select"
                value={buildingId}
                onChange={e => setBuildingId(Number(e.target.value))}
              >
                {BUILDINGS.map(b => (
                  <option key={b.id} value={b.id}>{b.icon} {b.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-16">
            <label className="label">选择头像</label>
            <div className="grid grid-6" style={{ gridTemplateColumns: 'repeat(6, 1fr)', gap: '12px' }}>
              {AVATARS.map(a => (
                <div
                  key={a}
                  className={`character-option ${avatar === a ? 'selected' : ''}`}
                  onClick={() => setAvatar(a)}
                >
                  <div className="character-avatar">{a}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-16">
            <label className="label">楼栋预览</label>
            {(() => {
              const b = BUILDINGS.find(x => x.id === buildingId)
              return (
                <div className="card" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.08))', marginBottom: 0 }}>
                  <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{b.icon}</div>
                  <div className="font-bold">{b.name}</div>
                  <div className="text-sm text-light">{b.description}</div>
                </div>
              )
            })()}
          </div>

          <button className="btn btn-primary" style={{ width: '100%', fontSize: '1rem', padding: '14px' }} onClick={handleCreate}>
            ✅ 确认入住
          </button>
        </div>

        <div className="text-center mt-8">
          <button className="text-sm text-light" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAdminLogin(true)}>
            🔑 管理员登录
          </button>
        </div>

        {showAdminLogin && (
          <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🔑 管理员登录</h2>
                <button className="close-btn" onClick={() => setShowAdminLogin(false)}>×</button>
              </div>
              <label className="label">管理员密码</label>
              <input
                type="password"
                className="input mb-16"
                placeholder="请输入管理员密码"
                value={adminCode}
                onChange={e => setAdminCode(e.target.value)}
              />
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdminLogin}>
                登录
              </button>
              <p className="text-xs text-light text-center mt-8">提示：默认密码 admin123</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex-between mb-16">
            <div className="flex gap-16" style={{ alignItems: 'center' }}>
              <div className="avatar avatar-lg">{state.player.avatar}</div>
              <div>
                <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{state.player.name}</h2>
                <p className="text-sm text-light" style={{ marginBottom: '4px' }}>{state.player.buildingName}</p>
                <p className="text-xs text-light">入驻日期：{state.player.joinDate}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="mb-8">
                <span className="badge badge-primary">⭐ 声望 {state.reputation}</span>
              </div>
              <div className="mb-8">
                <span className="badge badge-accent">🪙 {state.coins} 金币</span>
              </div>
              <div>
                <span className="badge badge-secondary">🏅 {state.achievements.length} 成就</span>
              </div>
            </div>
          </div>

          <div className="grid grid-4 gap-12">
            <div className="card" style={{ marginBottom: 0, padding: '14px', background: '#f8fafc' }}>
              <div className="text-xs text-light mb-4">📝 发帖数</div>
              <div className="font-bold text-primary" style={{ fontSize: '1.4rem' }}>{state.totalPosts}</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', background: '#f8fafc' }}>
              <div className="text-xs text-light mb-4">🤝 互助</div>
              <div className="font-bold text-secondary" style={{ fontSize: '1.4rem' }}>{state.totalHelpTasks}</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', background: '#f8fafc' }}>
              <div className="text-xs text-light mb-4">❤️ 好感度</div>
              <div className="font-bold" style={{ fontSize: '1.4rem', color: '#ec4899' }}>{avgRelationship}%</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', background: '#f8fafc' }}>
              <div className="text-xs text-light mb-4">📦 收藏</div>
              <div className="font-bold text-accent" style={{ fontSize: '1.4rem' }}>{state.inventory.length}</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📢 最新公告</h3>
          {state.announcements.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-icon" style={{ fontSize: '2rem' }}>📭</div>
              <p className="text-sm">暂无公告</p>
            </div>
          ) : (
            <div className="scroll-container">
              {state.announcements.slice(0, 5).map(a => (
                <div key={a.id} className="mb-12" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                  <div className="flex-between mb-4">
                    <span className="font-bold text-sm">{a.title}</span>
                    <span className="text-xs text-light">{new Date(a.createdAt).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-light">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {state.dailyEvent && (
        <div
          className={`card daily-event-card ${state.dailyEvent.handled ? 'handled' : 'pulse-border'}`}
          style={{
            marginBottom: '20px',
            background: state.dailyEvent.handled
              ? 'linear-gradient(135deg, #f0fdf4, #dcfce7)'
              : 'linear-gradient(135deg, #fef3c7, #fde68a)',
            border: `2px solid ${state.dailyEvent.handled ? '#22c55e' : '#f59e0b'}`,
          }}
        >
          <div className="flex-between mb-12">
            <div className="flex gap-12" style={{ alignItems: 'center' }}>
              <div style={{ fontSize: '2.5rem' }}>{state.dailyEvent.icon}</div>
              <div>
                <div style={{ fontSize: '0.8rem', opacity: 0.8, marginBottom: '4px' }}>
                  🗓️ 第 {state.dailyEvent.day || state.day} 天 · 社区突发事件
                </div>
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>{state.dailyEvent.title}</h3>
              </div>
            </div>
            {state.dailyEvent.handled ? (
              <span className="badge badge-secondary">✅ 已处理</span>
            ) : (
              <span className="badge badge-accent pulse">⭐ 待处理</span>
            )}
          </div>

          {state.dailyEvent.targetResident && getResidentById(state.dailyEvent.targetResident) && (() => {
            const r = getResidentById(state.dailyEvent.targetResident)
            const rel = state.relationships?.[r.id] || 30
            return (
              <div className="mb-16" style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.75)',
                borderRadius: '10px',
                border: '1px solid rgba(0,0,0,0.06)',
              }}>
                <div className="flex gap-12" style={{ alignItems: 'center' }}>
                  <span className="avatar avatar-sm">{r.avatar}</span>
                  <div style={{ flex: 1 }}>
                    <div className="text-sm font-bold">
                      事件关联住户：{r.name}
                      <span className="text-light" style={{ fontWeight: 'normal', marginLeft: '6px', fontSize: '0.75rem' }}>
                        （{r.buildingName}）
                      </span>
                    </div>
                    <div className="text-xs text-light mt-4">
                      与你当前好感度：
                      <span style={{
                        color: rel >= 80 ? '#db2777' : rel >= 50 ? '#8b5cf6' : rel >= 30 ? '#6366f1' : '#ef4444',
                        fontWeight: 'bold',
                        marginLeft: '4px',
                      }}>
                        ❤️ {rel}%
                      </span>
                      <span
                        className="badge badge-primary"
                        style={{ marginLeft: '8px', fontSize: '0.7rem', cursor: 'pointer' }}
                        onClick={() => setResidentLookup(r.id)}
                      >
                        👁️ 档案
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}

          <p className="text-sm mb-16" style={{ lineHeight: '1.7' }}>{state.dailyEvent.description}</p>

          {state.dailyEvent.handled ? (
            <div style={{ padding: '12px 14px', background: 'rgba(34,197,94,0.15)', borderRadius: '8px' }}>
              <div className="text-sm mb-4">
                <span className="font-bold">您的选择：</span>
                {state.dailyEvent.chosenChoice}
              </div>
              <div className="text-xs" style={{ opacity: 0.9 }}>
                处理结果：
                {state.dailyEvent.effect?.reputation !== 0 && (
                  <span style={{ marginLeft: '6px', color: state.dailyEvent.effect.reputation >= 0 ? '#059669' : '#dc2626' }}>
                    ⭐声望{state.dailyEvent.effect.reputation > 0 ? '+' : ''}{state.dailyEvent.effect.reputation}
                  </span>
                )}
                {state.dailyEvent.effect?.coins !== 0 && (
                  <span style={{ marginLeft: '6px', color: state.dailyEvent.effect.coins >= 0 ? '#d97706' : '#dc2626' }}>
                    🪙金币{state.dailyEvent.effect.coins > 0 ? '+' : ''}{state.dailyEvent.effect.coins}
                  </span>
                )}
                {state.dailyEvent.effect?.relationshipBoost !== 0 && (
                  <span style={{ marginLeft: '6px', color: state.dailyEvent.effect.relationshipBoost >= 0 ? '#db2777' : '#dc2626' }}>
                    ❤️好感{state.dailyEvent.effect.relationshipBoost > 0 ? '+' : ''}{state.dailyEvent.effect.relationshipBoost}
                  </span>
                )}
                {state.dailyEvent._residentRepBoost !== undefined && state.dailyEvent._residentRepBoost !== 0 && (
                  <span style={{ marginLeft: '6px', color: state.dailyEvent._residentRepBoost >= 0 ? '#059669' : '#dc2626' }}>
                    🧑‍🤝‍🧑住户声望{state.dailyEvent._residentRepBoost > 0 ? '+' : ''}{state.dailyEvent._residentRepBoost}
                  </span>
                )}
              </div>
              {state.dailyEvent._followUpHint && (
                <div className="text-xs mt-8" style={{ color: '#7c3aed', fontWeight: 'bold' }}>
                  🔮 明日提示：{state.dailyEvent._followUpHint}
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-3 gap-12">
              {state.dailyEvent.choices.map((choice, idx) => {
                const eff = choice.effect || {}
                const hasResBoost = state.dailyEvent.targetResident && choice.targetResidentRepBoost
                const hasHeat = choice.generateHeatPost
                const hasTask = choice.generateTaskType
                return (
                  <button
                    key={idx}
                    className="btn daily-event-choice"
                    style={{
                      flexDirection: 'column',
                      padding: '14px 10px',
                      height: 'auto',
                      lineHeight: '1.5',
                      whiteSpace: 'normal',
                      background: 'white',
                      border: '2px solid rgba(245,158,11,0.3)',
                      color: 'inherit',
                      alignItems: 'stretch',
                      justifyContent: 'flex-start',
                      textAlign: 'left',
                    }}
                    onClick={() => dispatch({ type: 'HANDLE_DAILY_EVENT', payload: { choiceIndex: idx } })}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(245,158,11,0.15)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'white'}
                  >
                    <div className="text-sm mb-8 font-bold" style={{ textAlign: 'center' }}>{choice.label}</div>
                    <div className="text-xs text-light" style={{ textAlign: 'center' }}>
                      {eff.reputation !== 0 && (
                        <span style={{ marginRight: '4px', color: eff.reputation >= 0 ? '#059669' : '#dc2626' }}>
                          ⭐{eff.reputation > 0 ? '+' : ''}{eff.reputation}
                        </span>
                      )}
                      {eff.coins !== 0 && (
                        <span style={{ marginRight: '4px', color: eff.coins >= 0 ? '#d97706' : '#dc2626' }}>
                          🪙{eff.coins > 0 ? '+' : ''}{eff.coins}
                        </span>
                      )}
                      {eff.relationshipBoost !== 0 && (
                        <span style={{ marginRight: '4px', color: eff.relationshipBoost >= 0 ? '#db2777' : '#dc2626' }}>
                          ❤️{eff.relationshipBoost > 0 ? '+' : ''}{eff.relationshipBoost}
                        </span>
                      )}
                      {hasResBoost && (
                        <span style={{ marginRight: '4px', color: hasResBoost >= 0 ? '#059669' : '#dc2626' }}>
                          🧑‍🤝‍🧑{hasResBoost > 0 ? '+' : ''}{hasResBoost}
                        </span>
                      )}
                    </div>
                    <div className="text-xs mt-8" style={{ textAlign: 'center', color: '#7c3aed' }}>
                      {hasHeat && <span>💬+贴</span>}
                      {hasHeat && hasTask && <span style={{ margin: '0 4px' }}>·</span>}
                      {hasTask && <span>📋+任务</span>}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}

      {state.dailyEventHistory && state.dailyEventHistory.length > 0 && (() => {
        const history = state.dailyEventHistory.slice().reverse().slice(0, 6)
        return (
          <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)' }}>
            <div className="flex-between mb-12">
              <h3 className="card-title" style={{ marginBottom: 0, fontSize: '1rem' }}>📜 事件历史记录</h3>
              <span className="text-xs text-light">共 {state.dailyEventHistory.length} 条</span>
            </div>
            <div className="grid grid-3 gap-12">
              {history.map(h => {
                const targetR = h.targetResident ? getResidentById(h.targetResident) : null
                const isChain = h.requires && Object.keys(h.requires).length > 0
                return (
                  <div key={h.id} className="card" style={{
                    marginBottom: 0, padding: '12px',
                    background: h.actionType === 'daily_expired'
                      ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
                      : 'white',
                    borderLeft: `4px solid ${h.actionType === 'daily_expired' ? '#ef4444' : isChain ? '#8b5cf6' : '#3b82f6'}`,
                  }}>
                    <div className="flex gap-8 mb-6" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: '1.3rem' }}>{h.icon}</span>
                      <div style={{ flex: 1 }}>
                        <div className="text-sm font-bold" style={{ lineHeight: '1.3' }}>{h.title}</div>
                        <div className="text-xs text-light mt-2">
                          第{h.day}天
                          {isChain && <span className="badge" style={{ fontSize: '0.65rem', background: '#ede9fe', color: '#6d28d9', marginLeft: '4px' }}>🔗链式</span>}
                          {h.actionType === 'daily_expired' && <span className="badge badge-danger" style={{ fontSize: '0.65rem', marginLeft: '4px' }}>⏰超时</span>}
                        </div>
                      </div>
                    </div>
                    {h.chosenChoice && (
                      <div className="text-xs mb-6" style={{ color: '#166534', background: '#f0fdf4', padding: '6px 8px', borderRadius: '6px' }}>
                        ✓ {h.chosenChoice}
                      </div>
                    )}
                    {targetR && (
                      <div className="flex gap-6" style={{ alignItems: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                        <span className="avatar" style={{ width: '20px', height: '20px', fontSize: '0.7rem' }}>{targetR.avatar}</span>
                        <span>{targetR.name}（{targetR.buildingName.split(' - ')[0]}）</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}

      <div className="grid grid-2 gap-16">
        <div className="card">
          <h3 className="card-title">📋 今日概览</h3>
          <div className="scroll-container" style={{ maxHeight: '300px' }}>
            <div className="mb-12">
              <div className="flex-between mb-8">
                <span className="text-sm">🗓️ 游戏天数</span>
                <span className="badge badge-primary">第 {state.day} 天</span>
              </div>
            </div>
            <div className="mb-12">
              <div className="flex-between mb-8">
                <span className="text-sm">📋 可接任务</span>
                <span className="badge badge-accent">{state.tasks.length} 个</span>
              </div>
            </div>
            <div className="mb-12">
              <div className="flex-between mb-8">
                <span className="text-sm">⏳ 进行中</span>
                <span className="badge badge-secondary">{state.activeTasks.length} 个</span>
              </div>
              {state.activeTasks.length > 0 && (
                <div style={{ paddingLeft: '12px' }}>
                  {state.activeTasks.map(t => (
                    <div key={t.id} className="text-xs text-light mb-4">• {t.title}</div>
                  ))}
                </div>
              )}
            </div>
            <div className="mb-12">
              <div className="flex-between mb-8">
                <span className="text-sm">✅ 已完成</span>
                <span className="badge badge-primary">{state.completedTasks.length} 个</span>
              </div>
            </div>
            {state.teamMembers.length > 0 && (
              <div className="mb-12">
                <div className="flex-between mb-8">
                  <span className="text-sm">👥 当前队伍</span>
                  <span className="badge badge-secondary">{state.teamMembers.length + 1}/4</span>
                </div>
                <div className="flex gap-8" style={{ paddingLeft: '12px' }}>
                  <div className="avatar avatar-sm">{state.player.avatar}</div>
                  {state.teamMembers.map(m => (
                    <div key={m.id} className="avatar avatar-sm" title={m.name}>{m.avatar}</div>
                  ))}
                </div>
              </div>
            )}
            {state.limitedEvent && (
              <div className="mb-12">
                <div className="flex-between mb-8">
                  <span className="text-sm">🎊 限时活动</span>
                  <span className="badge badge-accent pulse">{state.limitedEvent.name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">📜 活动日志</h3>
          <div className="activity-log">
            {latestLogs.length === 0 ? (
              <div className="empty-state" style={{ padding: '20px' }}>
                <div className="empty-icon" style={{ fontSize: '2rem' }}>📖</div>
                <p className="text-sm">暂无活动记录</p>
              </div>
            ) : (
              latestLogs.map((log, i) => (
                <div key={i} className={`log-item ${log.type}`}>
                  <span className="text-xs text-light">{new Date(log.time).toLocaleTimeString()}</span>
                  <span> {log.message}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {!state.isAdmin && (
        <div className="text-center mt-8">
          <button className="text-sm text-light" style={{ background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setShowAdminLogin(true)}>
            🔑 管理员登录
          </button>
        </div>
      )}

      {showAdminLogin && (
        <div className="modal-overlay" onClick={() => setShowAdminLogin(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🔑 管理员登录</h2>
              <button className="close-btn" onClick={() => setShowAdminLogin(false)}>×</button>
            </div>
            <label className="label">管理员密码</label>
            <input
              type="password"
              className="input mb-16"
              placeholder="请输入管理员密码"
              value={adminCode}
              onChange={e => setAdminCode(e.target.value)}
            />
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleAdminLogin}>
              登录
            </button>
            <p className="text-xs text-light text-center mt-8">提示：默认密码 admin123</p>
          </div>
        </div>
      )}

      {residentLookup && (() => {
        const r = getResidentById(residentLookup)
        if (!r) return null
        const rel = state.relationships?.[r.id] || 30
        const resPosts = state.posts.filter(p => p.authorId === r.id).slice(0, 3)
        return (
          <div className="modal-overlay" onClick={() => setResidentLookup(null)}>
            <div className="modal-content" style={{ maxWidth: '520px' }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h2 className="modal-title">🏠 居民档案</h2>
                <button className="close-btn" onClick={() => setResidentLookup(null)}>×</button>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                borderRadius: 'var(--radius)',
                padding: '24px',
                marginBottom: '16px',
                textAlign: 'center',
              }}>
                <div className="avatar" style={{
                  width: '72px', height: '72px', fontSize: '2.6rem',
                  margin: '0 auto 12px', border: '3px solid rgba(255,255,255,0.5)',
                }}>
                  {r.avatar}
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>{r.name}</div>
                <div style={{ opacity: 0.9, marginTop: '4px', fontSize: '0.9rem' }}>{r.buildingName}</div>
                <div style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.85 }}>
                  🏡 入住{r.joinDays}天
                </div>
              </div>
              <div className="grid grid-3 gap-12 mb-16 text-center">
                <div className="card" style={{ marginBottom: 0, padding: '12px' }}>
                  <div className="text-xs text-light mb-4">声望</div>
                  <div className="font-bold text-primary" style={{ fontSize: '1.15rem' }}>⭐ {r.reputation}</div>
                </div>
                <div className="card" style={{ marginBottom: 0, padding: '12px' }}>
                  <div className="text-xs text-light mb-4">金币</div>
                  <div className="font-bold" style={{ color: '#f59e0b', fontSize: '1.15rem' }}>🪙 {r.coins}</div>
                </div>
                <div className="card" style={{ marginBottom: 0, padding: '12px' }}>
                  <div className="text-xs text-light mb-4">对你好感</div>
                  <div className="font-bold" style={{
                    fontSize: '1.15rem',
                    color: rel >= 80 ? '#db2777' : rel >= 50 ? '#8b5cf6' : rel >= 30 ? '#6366f1' : '#ef4444',
                  }}>
                    ❤️ {rel}%
                  </div>
                </div>
              </div>
              <div className="grid grid-2 gap-12 mb-16 text-center">
                <div className="card" style={{ marginBottom: 0, padding: '12px' }}>
                  <div className="text-xs text-light mb-4">发帖</div>
                  <div className="font-bold" style={{ fontSize: '1rem' }}>📝 {r.postCount || 0}</div>
                </div>
                <div className="card" style={{ marginBottom: 0, padding: '12px' }}>
                  <div className="text-xs text-light mb-4">被举报</div>
                  <div className={`font-bold ${(r.reportCount || 0) > 0 ? 'text-danger' : ''}`} style={{ fontSize: '1rem' }}>
                    ⚠️ {r.reportCount || 0}
                  </div>
                </div>
              </div>
              {r.tags && r.tags.length > 0 && (
                <div className="mb-12">
                  <div className="text-sm text-light mb-8">🏷️ 标签</div>
                  <div className="flex gap-8 flex-wrap">
                    {r.tags.map(t => (
                      <span key={t} className="badge badge-primary" style={{ fontSize: '0.78rem' }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {resPosts.length > 0 && (
                <div>
                  <div className="text-sm text-light mb-8">💬 最近发帖（{resPosts.length}）</div>
                  {resPosts.map(p => (
                    <div key={p.id} className="card" style={{ marginBottom: '8px', padding: '10px 12px' }}>
                      <div className="font-bold text-sm mb-4">{p.title}</div>
                      <div className="text-xs text-light">🔥 {p.heat}热度 · ❤️ {p.likes}赞 · 💬 {p.comments.length}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
