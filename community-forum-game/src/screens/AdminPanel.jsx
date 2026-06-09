import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { LIMITED_EVENTS, BUILDINGS, REPORT_HISTORY_TYPES } from '../data/gameData'

export default function AdminPanel() {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('announce')
  const [announceTitle, setAnnounceTitle] = useState('')
  const [announceContent, setAnnounceContent] = useState('')
  const [announceType, setAnnounceType] = useState('普通')
  const [selectedReported, setSelectedReported] = useState(null)
  const [showHistory, setShowHistory] = useState(false)

  const reportedPosts = state.posts.filter(p => p.isReported && !p.isPenalized)
  const myPosts = state.posts.filter(p => p.authorId === state.player?.id)
  const reviewHistory = state.reportHistory || []

  const handlePublish = () => {
    if (!announceTitle.trim() || !announceContent.trim()) {
      alert('请填写完整的公告标题和内容')
      return
    }
    dispatch({
      type: 'ADD_ANNOUNCEMENT',
      payload: {
        title: announceTitle.trim(),
        content: announceContent.trim(),
        type: announceType,
        author: state.player.name,
      },
    })
    setAnnounceTitle('')
    setAnnounceContent('')
    alert('公告发布成功！')
  }

  const stats = {
    totalResidents: 10 + 1,
    totalPosts: state.posts.length,
    totalReputation: state.reputation + 3500,
    totalTasks: state.completedTasks.length + 45,
  }

  return (
    <div>
      {!state.isAdmin ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '5rem', marginBottom: '20px' }}>🔒</div>
          <h2 className="mb-12" style={{ fontSize: '1.5rem' }}>管理员专属区域</h2>
          <p className="text-light mb-20">您尚未登录管理员账号，无法访问此页面。</p>
          <p className="text-xs text-light">请在大厅页面点击「管理员登录」按钮登录（默认密码 admin123）</p>
        </div>
      ) : (
        <>
          <div className="grid grid-4 gap-16 mb-20">
            <div className="card" style={{ marginBottom: 0, padding: '18px', textAlign: 'center', background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)' }}>
              <div style={{ fontSize: '2rem' }}>🏘️</div>
              <div className="font-bold text-primary" style={{ fontSize: '1.6rem', marginTop: '4px' }}>{stats.totalResidents}</div>
              <div className="text-xs text-light">小区住户</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '18px', textAlign: 'center', background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)' }}>
              <div style={{ fontSize: '2rem' }}>💬</div>
              <div className="font-bold text-secondary" style={{ fontSize: '1.6rem', marginTop: '4px' }}>{stats.totalPosts}</div>
              <div className="text-xs text-light">论坛帖子</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '18px', textAlign: 'center', background: 'linear-gradient(135deg, #fef3c7, #fde68a)' }}>
              <div style={{ fontSize: '2rem' }}>⭐</div>
              <div className="font-bold text-accent" style={{ fontSize: '1.6rem', marginTop: '4px' }}>{stats.totalReputation}</div>
              <div className="text-xs text-light">累计声望</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '18px', textAlign: 'center', background: 'linear-gradient(135deg, #fce7f3, #fbcfe8)' }}>
              <div style={{ fontSize: '2rem' }}>✅</div>
              <div className="font-bold" style={{ fontSize: '1.6rem', marginTop: '4px', color: '#db2777' }}>{stats.totalTasks}</div>
              <div className="text-xs text-light">任务完成</div>
            </div>
          </div>

          <div className="grid grid-3 gap-16">
            <div className="card" style={{ gridColumn: 'span 2' }}>
              <div className="flex gap-12 mb-16" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
                {[
                  { key: 'announce', label: '📢 发布公告' },
                  { key: 'review', label: '⚠️ 内容审核' },
                  { key: 'events', label: '🎊 活动管理' },
                  { key: 'data', label: '📊 数据统计' },
                ].map(tab => (
                  <button
                    key={tab.key}
                    className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
                    onClick={() => setActiveTab(tab.key)}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {tab.label}
                    {tab.key === 'review' && reportedPosts.length > 0 && (
                      <span className="badge badge-danger" style={{ marginLeft: '6px' }}>
                        {reportedPosts.length}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {activeTab === 'announce' && (
                <div>
                  <div className="grid grid-2 gap-16 mb-16">
                    <div>
                      <label className="label">公告类型</label>
                      <select
                        className="select"
                        value={announceType}
                        onChange={e => setAnnounceType(e.target.value)}
                      >
                        <option value="普通">📋 普通公告</option>
                        <option value="重要">🔔 重要通知</option>
                        <option value="紧急">🚨 紧急公告</option>
                        <option value="活动">🎊 活动通知</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">发布人</label>
                      <input
                        type="text"
                        className="input"
                        value={`管理员 - ${state.player.name}`}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="mb-16">
                    <label className="label">公告标题</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="请输入公告标题"
                      value={announceTitle}
                      onChange={e => setAnnounceTitle(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <div className="mb-16">
                    <label className="label">公告内容</label>
                    <textarea
                      className="textarea"
                      placeholder="请输入公告的详细内容..."
                      value={announceContent}
                      onChange={e => setAnnounceContent(e.target.value)}
                      maxLength={500}
                      style={{ minHeight: '150px' }}
                    />
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={handlePublish}>
                    📤 立即发布公告
                  </button>

                  <div className="divider"></div>

                  <h3 className="card-title" style={{ fontSize: '1rem' }}>📜 已发布公告</h3>
                  <div className="scroll-container" style={{ maxHeight: '250px' }}>
                    {state.announcements.length === 0 ? (
                      <div className="empty-state" style={{ padding: '20px' }}>
                        <div className="empty-icon" style={{ fontSize: '2rem' }}>📭</div>
                        <p className="text-sm">暂无发布的公告</p>
                      </div>
                    ) : (
                      state.announcements.map(a => (
                        <div key={a.id} className="mb-12" style={{ padding: '14px', background: 'var(--bg)', borderRadius: '8px' }}>
                          <div className="flex-between mb-4">
                            <div className="flex gap-8" style={{ alignItems: 'center' }}>
                              <span className={`badge ${a.type === '紧急' ? 'badge-danger' : a.type === '重要' ? 'badge-accent' : a.type === '活动' ? 'badge-secondary' : 'badge-primary'}`}>
                                {a.type}
                              </span>
                              <span className="font-bold text-sm">{a.title}</span>
                            </div>
                            <span className="text-xs text-light">
                              {new Date(a.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-light">{a.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'review' && (
                <div>
                  <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: '12px' }}>
                    ⚠️ 待审核举报 ({reportedPosts.length})
                  </h3>
                  {reportedPosts.length === 0 ? (
                    <div className="empty-state">
                      <div className="empty-icon">✅</div>
                      <p>目前没有待审核的举报内容，社区环境良好！</p>
                    </div>
                  ) : (
                    <div className="scroll-container" style={{ maxHeight: '500px' }}>
                      {reportedPosts.map(post => (
                        <div
                          key={post.id}
                          className="card"
                          style={{
                            marginBottom: '12px',
                            border: '2px solid var(--accent)',
                            background: 'rgba(245,158,11,0.05)',
                            cursor: 'pointer',
                          }}
                          onClick={() => setSelectedReported(post)}
                        >
                          <div className="flex-between mb-8">
                            <div className="flex gap-8" style={{ alignItems: 'center' }}>
                              <div className="avatar avatar-sm">{post.authorAvatar}</div>
                              <div>
                                <span className="font-bold">{post.authorName}</span>
                                <span className="text-xs text-light" style={{ marginLeft: '8px' }}>
                                  {new Date(post.createdAt).toLocaleString()}
                                </span>
                              </div>
                            </div>
                            <span className="badge badge-accent">⚠️ 已举报</span>
                          </div>
                          <div className="font-bold mb-4">{post.title}</div>
                          <p className="text-sm text-light mb-12">{post.content}</p>
                          <div className="flex gap-8">
                            <button
                              className="btn btn-sm btn-danger"
                              onClick={e => {
                                e.stopPropagation()
                                if (confirm('确认对该违规内容扣分处罚？（作者声望-10，并记入审核历史）')) {
                                  dispatch({ type: 'PENALIZE_POST', payload: post.id })
                                }
                              }}
                            >
                              🚫 扣分处罚
                            </button>
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={e => {
                                e.stopPropagation()
                                dispatch({ type: 'MARK_POST_COMPLIANT', payload: post.id })
                              }}
                            >
                              ✅ 内容合规
                            </button>
                            <button
                              className="btn btn-sm btn-outline"
                              onClick={e => {
                                e.stopPropagation()
                                dispatch({ type: 'IGNORE_REPORT', payload: post.id })
                              }}
                            >
                              ⏭️ 忽略举报
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="divider"></div>

                  <div className="flex-between mb-12">
                    <h3 className="card-title" style={{ fontSize: '1rem', marginBottom: 0 }}>
                      � 审核处理历史 ({reviewHistory.length})
                    </h3>
                    <button
                      className={`btn btn-sm ${showHistory ? 'btn-accent' : 'btn-outline'}`}
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      {showHistory ? '收起详情' : '展开全部'}
                    </button>
                  </div>

                  {!showHistory ? (
                    <div className="grid grid-3 gap-12 mb-16">
                      <div style={{ padding: '14px', background: '#fef2f2', borderRadius: '10px', textAlign: 'center' }}>
                        <div className="text-danger font-bold" style={{ fontSize: '1.6rem' }}>
                          {reviewHistory.filter(r => r.action === REPORT_HISTORY_TYPES.PENALIZED).length}
                        </div>
                        <div className="text-xs text-light">扣分处罚</div>
                      </div>
                      <div style={{ padding: '14px', background: '#ecfdf5', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', color: '#059669', fontWeight: 'bold' }}>
                          {reviewHistory.filter(r => r.action === REPORT_HISTORY_TYPES.COMPLIANT).length}
                        </div>
                        <div className="text-xs text-light">合规通过</div>
                      </div>
                      <div style={{ padding: '14px', background: '#eff6ff', borderRadius: '10px', textAlign: 'center' }}>
                        <div style={{ fontSize: '1.6rem', color: '#2563eb', fontWeight: 'bold' }}>
                          {reviewHistory.filter(r => r.action === REPORT_HISTORY_TYPES.IGNORED).length}
                        </div>
                        <div className="text-xs text-light">忽略举报</div>
                      </div>
                    </div>
                  ) : (
                    <div className="scroll-container" style={{ maxHeight: '320px' }}>
                      {reviewHistory.length === 0 ? (
                        <p className="text-sm text-light text-center" style={{ padding: '20px' }}>
                          暂无审核处理记录
                        </p>
                      ) : (
                        reviewHistory.slice().reverse().map(r => (
                          <div
                            key={r.id}
                            className="mb-8"
                            style={{
                              padding: '10px 12px',
                              borderRadius: '8px',
                              borderLeft: '4px solid ' + (
                                r.action === REPORT_HISTORY_TYPES.PENALIZED ? 'var(--danger)' :
                                r.action === REPORT_HISTORY_TYPES.COMPLIANT ? 'var(--secondary)' : '#64748b'
                              ),
                              background: (
                                r.action === REPORT_HISTORY_TYPES.PENALIZED ? '#fef2f2' :
                                r.action === REPORT_HISTORY_TYPES.COMPLIANT ? '#ecfdf5' : '#f1f5f9'
                              ),
                            }}
                          >
                            <div className="flex-between mb-4">
                              <div className="flex gap-8" style={{ alignItems: 'center' }}>
                                <span className={`badge ${
                                  r.action === REPORT_HISTORY_TYPES.PENALIZED ? 'badge-danger' :
                                  r.action === REPORT_HISTORY_TYPES.COMPLIANT ? 'badge-secondary' : 'badge-primary'
                                }`} style={{ fontSize: '0.7rem' }}>
                                  {r.action === REPORT_HISTORY_TYPES.PENALIZED ? '🚫 扣分' :
                                   r.action === REPORT_HISTORY_TYPES.COMPLIANT ? '✅ 合规' : '⏭️ 忽略'}
                                </span>
                                <span className="font-bold text-sm">{r.postTitle}</span>
                              </div>
                              <span className="text-xs text-light">
                                {new Date(r.handledAt).toLocaleString()}
                              </span>
                            </div>
                            <div className="text-xs text-light">
                              作者: {r.postAuthor} · 处理人: {r.handledBy}
                              {r.penalty && <span className="text-danger" style={{ marginLeft: '8px' }}>声望{r.penalty}</span>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'events' && (
                <div>
                  <h3 className="card-title" style={{ fontSize: '1rem' }}>🎊 限时活动列表</h3>
                  <div className="grid grid-3 gap-12 mb-16">
                    {LIMITED_EVENTS.map(ev => (
                      <div
                        key={ev.id}
                        className="card"
                        style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}
                      >
                        <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>{ev.icon}</div>
                        <div className="font-bold text-sm mb-4">{ev.name}</div>
                        <p className="text-xs text-light mb-8" style={{ minHeight: '40px' }}>{ev.description}</p>
                        <div className="text-xs mb-8">
                          <span className="text-primary">⭐+{ev.reward.reputation}</span>
                          <span className="text-accent" style={{ marginLeft: '6px' }}>🪙+{ev.reward.coins}</span>
                        </div>
                        <button
                          className="btn btn-sm btn-accent"
                          style={{ width: '100%' }}
                          onClick={() => {
                            dispatch({ type: 'START_LIMITED_EVENT', payload: ev })
                            alert(`活动「${ev.name}」已开启！`)
                          }}
                        >
                          ▶️ 开启活动
                        </button>
                      </div>
                    ))}
                  </div>

                  {state.limitedEvent && (
                    <div className="card" style={{ background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: '2px solid var(--accent)' }}>
                      <div className="flex-between mb-8">
                        <div className="flex gap-12" style={{ alignItems: 'center' }}>
                          <span style={{ fontSize: '2rem' }}>{state.limitedEvent.icon}</span>
                          <div>
                            <div className="font-bold">进行中: {state.limitedEvent.name}</div>
                            <div className="text-xs" style={{ color: '#78350f' }}>{state.limitedEvent.description}</div>
                          </div>
                        </div>
                        <span className="badge badge-accent pulse">进行中</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'data' && (
                <div>
                  <div className="grid grid-2 gap-16 mb-16">
                    <div className="card" style={{ marginBottom: 0 }}>
                      <h3 className="card-title" style={{ fontSize: '1rem' }}>🏢 楼栋住户分布</h3>
                      {BUILDINGS.map(b => {
                        const count = 2 + (b.id === state.player?.buildingId ? 1 : 0)
                        const percent = Math.round((count / 11) * 100)
                        return (
                          <div key={b.id} className="mb-8">
                            <div className="flex-between mb-4">
                              <span className="text-sm">{b.icon} {b.name.split(' - ')[1]}</span>
                              <span className="text-xs text-light">{count}户 ({percent}%)</span>
                            </div>
                            <div className="progress-bar">
                              <div className="progress-fill" style={{ width: percent + '%' }}></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                    <div className="card" style={{ marginBottom: 0 }}>
                      <h3 className="card-title" style={{ fontSize: '1rem' }}>📊 我的管理数据</h3>
                      <div className="mb-12">
                        <div className="flex-between mb-4">
                          <span className="text-sm">发布公告</span>
                          <span className="font-bold text-primary">{state.announcements.length}条</span>
                        </div>
                      </div>
                      <div className="mb-12">
                        <div className="flex-between mb-4">
                          <span className="text-sm">处理违规</span>
                          <span className="font-bold text-danger">{state.heatPenalties}起</span>
                        </div>
                      </div>
                      <div className="mb-12">
                        <div className="flex-between mb-4">
                          <span className="text-sm">我的发帖</span>
                          <span className="font-bold text-secondary">{myPosts.length}篇</span>
                        </div>
                      </div>
                      <div className="mb-12">
                        <div className="flex-between mb-4">
                          <span className="text-sm">完成任务</span>
                          <span className="font-bold text-accent">{state.completedTasks.length}个</span>
                        </div>
                      </div>
                      <div>
                        <div className="flex-between mb-4">
                          <span className="text-sm">累计声望</span>
                          <span className="font-bold" style={{ color: '#8b5cf6' }}>{state.reputation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="card" style={{ marginBottom: 0 }}>
                    <h3 className="card-title" style={{ fontSize: '1rem' }}>🗳️ 公共设施投票进度</h3>
                    <div className="grid grid-5 gap-12">
                      {state.facilities.map(f => {
                        const total = state.facilities.reduce((s, x) => s + x.votes, 0) || 1
                        const percent = Math.round((f.votes / total) * 100)
                        return (
                          <div key={f.id} className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                            <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                            <div className="text-sm font-bold mt-4 mb-4">{f.name}</div>
                            <div className="font-bold text-accent">{f.votes}票</div>
                            <div className="text-xs text-light mt-4">{percent}%</div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <h2 className="card-title">⚙️ 管理面板</h2>

              <div className="card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)', border: 'none' }}>
                <div className="flex-center gap-12" style={{ alignItems: 'center' }}>
                  <div className="avatar avatar-lg" style={{ border: '3px solid #8b5cf6' }}>
                    {state.player.avatar}
                  </div>
                  <div>
                    <div className="font-bold">{state.player.name}</div>
                    <div className="text-xs" style={{ color: '#5b21b6' }}>🛡️ 小区管理员</div>
                    <div className="text-xs text-light">{state.player.buildingName}</div>
                  </div>
                </div>
              </div>

              <h3 className="card-title" style={{ fontSize: '1rem' }}>🛠️ 快捷操作</h3>
              <div className="grid grid-2 gap-12 mb-16">
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('announce')}
                  style={{ flexDirection: 'column', padding: '16px', height: 'auto' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📢</span>
                  <span className="text-xs mt-4">发布公告</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setActiveTab('review')}
                  style={{ flexDirection: 'column', padding: '16px', height: 'auto' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>⚠️</span>
                  <span className="text-xs mt-4">
                    内容审核
                    {reportedPosts.length > 0 && (
                      <span className="badge badge-danger" style={{ marginLeft: '4px' }}>
                        {reportedPosts.length}
                      </span>
                    )}
                  </span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => dispatch({ type: 'GENERATE_NEW_TASK' })}
                  style={{ flexDirection: 'column', padding: '16px', height: 'auto' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>📋</span>
                  <span className="text-xs mt-4">生成任务</span>
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => dispatch({ type: 'NEXT_DAY' })}
                  style={{ flexDirection: 'column', padding: '16px', height: 'auto' }}
                >
                  <span style={{ fontSize: '1.5rem' }}>🌙</span>
                  <span className="text-xs mt-4">进入下一天</span>
                </button>
              </div>

              <h3 className="card-title" style={{ fontSize: '1rem' }}>📜 最近操作日志</h3>
              <div className="activity-log" style={{ maxHeight: '280px' }}>
                {state.activityLog.slice(-15).reverse().map((log, i) => (
                  <div key={i} className={`log-item ${log.type}`}>
                    <span className="text-xs text-light">
                      {new Date(log.time).toLocaleTimeString()}
                    </span>
                    <div style={{ marginTop: '2px' }}>{log.message}</div>
                  </div>
                ))}
              </div>

              <div className="divider"></div>

              <div className="text-center">
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => {
                    if (confirm('确定要退出管理员身份吗？')) {
                      dispatch({ type: 'SET_ADMIN', payload: false })
                    }
                  }}
                >
                  🚪 退出管理模式
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedReported && (
        <div className="modal-overlay" onClick={() => setSelectedReported(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚠️ 帖子详情审核</h2>
              <button className="close-btn" onClick={() => setSelectedReported(null)}>×</button>
            </div>
            <div className="flex gap-12 mb-16" style={{ alignItems: 'center' }}>
              <div className="avatar">{selectedReported.authorAvatar}</div>
              <div>
                <div className="font-bold">{selectedReported.authorName}</div>
                <div className="text-xs text-light">
                  发布于 {new Date(selectedReported.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
            <h3 className="font-bold mb-8" style={{ fontSize: '1.2rem' }}>{selectedReported.title}</h3>
            <div
              className="card mb-16"
              style={{ background: 'var(--bg)', whiteSpace: 'pre-wrap', lineHeight: '1.7' }}
            >
              {selectedReported.content}
            </div>
            <div className="flex-between mb-16 text-sm">
              <span>❤️ {selectedReported.likes} 点赞</span>
              <span>💬 {selectedReported.comments.length} 评论</span>
              <span>🔥 {selectedReported.heat} 热度</span>
            </div>
            <div className="flex gap-12">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedReported(null)}>
                返回
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => {
                  dispatch({ type: 'MARK_POST_COMPLIANT', payload: selectedReported.id })
                  setSelectedReported(null)
                }}
              >
                ✅ 内容合规
              </button>
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => {
                  dispatch({ type: 'IGNORE_REPORT', payload: selectedReported.id })
                  setSelectedReported(null)
                }}
              >
                ⏭️ 忽略举报
              </button>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  if (confirm('确认扣除作者10点声望？')) {
                    dispatch({ type: 'PENALIZE_POST', payload: selectedReported.id })
                    setSelectedReported(null)
                  }
                }}
              >
                🚫 扣分处罚
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
