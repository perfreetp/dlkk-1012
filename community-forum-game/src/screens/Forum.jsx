import React, { useState } from 'react'
import { useGame } from '../context/GameContext'

const CATEGORIES = ['全部', '分享', '推荐', '组队', '求助', '建议', '吐槽']

const HOT_THRESHOLDS = {
  viral: 80,
  hot: 40,
  warm: 20,
}

export default function Forum() {
  const { state, dispatch } = useGame()
  const [activeCategory, setActiveCategory] = useState('全部')
  const [showPostModal, setShowPostModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newCategory, setNewCategory] = useState('分享')
  const [expandedPost, setExpandedPost] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [sortBy, setSortBy] = useState('latest')

  const filteredPosts = state.posts.filter(p =>
    activeCategory === '全部' ? true : p.category === activeCategory
  )

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'hot') return b.heat - a.heat
    if (sortBy === 'likes') return b.likes - a.likes
    return b.createdAt - a.createdAt
  })

  const topHotPosts = [...state.posts]
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 5)

  const handleSubmitPost = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      alert('请填写完整的标题和内容')
      return
    }
    dispatch({
      type: 'ADD_POST',
      payload: {
        title: newTitle.trim(),
        content: newContent.trim(),
        category: newCategory,
      },
    })
    setNewTitle('')
    setNewContent('')
    setShowPostModal(false)
  }

  const getHeatBadge = heat => {
    if (heat >= HOT_THRESHOLDS.viral) return <span className="badge badge-danger">🔥 爆帖</span>
    if (heat >= HOT_THRESHOLDS.hot) return <span className="badge badge-accent">🔥 热门</span>
    if (heat >= HOT_THRESHOLDS.warm) return <span className="badge badge-primary">🌡️ 热议</span>
    return null
  }

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex-between mb-16">
            <div className="flex gap-8 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  className={`btn btn-sm ${activeCategory === cat ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveCategory(cat)}
                  style={{ fontSize: '0.8rem' }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div className="flex gap-8">
              <select
                className="select"
                style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                <option value="latest">🕒 最新</option>
                <option value="hot">🔥 热度</option>
                <option value="likes">❤️ 点赞</option>
              </select>
              <button className="btn btn-primary btn-sm" onClick={() => setShowPostModal(true)}>
                ✏️ 发帖
              </button>
            </div>
          </div>

          <div className="scroll-container" style={{ maxHeight: '600px' }}>
            {sortedPosts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <p>还没有帖子，快来发布第一条吧！</p>
                <button className="btn btn-primary mt-8" onClick={() => setShowPostModal(true)}>
                  ✏️ 立即发帖
                </button>
              </div>
            ) : (
              sortedPosts.map(post => (
                <div
                  key={post.id}
                  className="post-item"
                  style={{
                    border: post.isPenalized
                      ? '2px solid var(--danger)'
                      : post.isReported
                        ? '2px solid var(--accent)'
                        : 'none',
                    borderRadius: post.isPenalized || post.isReported ? '8px' : '0',
                    padding: post.isPenalized || post.isReported ? '14px' : '16px 0',
                    background: post.isPenalized ? 'rgba(239,68,68,0.05)' : 'transparent',
                  }}
                >
                  <div className="post-header">
                    <div className="avatar avatar-sm">{post.authorAvatar}</div>
                    <div style={{ flex: 1 }}>
                      <div className="flex gap-8" style={{ alignItems: 'center' }}>
                        <span className="font-bold text-sm">{post.authorName}</span>
                        <span className="badge badge-primary">{post.category}</span>
                        {getHeatBadge(post.heat)}
                        {post.isReported && <span className="badge badge-accent">⚠️ 已举报</span>}
                        {post.isPenalized && <span className="badge badge-danger">🚫 已扣分</span>}
                        {post.authorId === state.player.id && (
                          <span className="badge badge-secondary">我</span>
                        )}
                      </div>
                      <span className="text-xs text-light">
                        {new Date(post.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ width: '80px' }}>
                      <div className="heat-bar mb-4">
                        <div className="heat-fill" style={{ width: Math.min(100, post.heat) + '%' }}></div>
                      </div>
                      <div className="text-xs text-center text-accent">{post.heat} 热度</div>
                    </div>
                  </div>

                  <div className="post-title">{post.title}</div>
                  <div className="post-content">{post.content}</div>

                  <div className="post-actions">
                    <span
                      className="post-action"
                      onClick={() => dispatch({ type: 'LIKE_POST', payload: post.id })}
                    >
                      ❤️ {post.likes}
                    </span>
                    <span
                      className="post-action"
                      onClick={() => setExpandedPost(post.id === expandedPost ? null : post.id)}
                    >
                      💬 {post.comments.length} 评论
                    </span>
                    <span className="post-action">🔗 分享</span>
                    {post.authorId !== state.player.id && (
                      <span
                        className="post-action"
                        onClick={() => {
                          if (confirm('确定要举报此帖子吗？')) {
                            dispatch({ type: 'REPORT_POST', payload: post.id })
                          }
                        }}
                      >
                        ⚠️ 举报
                      </span>
                    )}
                    {state.isAdmin && !post.isPenalized && (
                      <span
                        className="post-action text-danger"
                        onClick={() => {
                          if (confirm('作为管理员，确定要对该违规内容扣分（声望-10）吗？')) {
                            dispatch({ type: 'PENALIZE_POST', payload: post.id })
                          }
                        }}
                      >
                        🚫 扣分处罚
                      </span>
                    )}
                  </div>

                  {expandedPost === post.id && (
                    <div className="comments-section">
                      <div className="mb-12">
                        <div className="flex gap-8">
                          <input
                            type="text"
                            className="input"
                            placeholder="写下你的评论..."
                            value={commentText}
                            onChange={e => setCommentText(e.target.value)}
                            onKeyDown={e => {
                              if (e.key === 'Enter' && commentText.trim()) {
                                dispatch({
                                  type: 'COMMENT_POST',
                                  payload: { postId: post.id, content: commentText.trim() },
                                })
                                setCommentText('')
                              }
                            }}
                          />
                          <button
                            className="btn btn-primary"
                            disabled={!commentText.trim()}
                            onClick={() => {
                              dispatch({
                                type: 'COMMENT_POST',
                                payload: { postId: post.id, content: commentText.trim() },
                              })
                              setCommentText('')
                            }}
                          >
                            发送
                          </button>
                        </div>
                      </div>
                      <div className="scroll-container" style={{ maxHeight: '200px' }}>
                        {post.comments.length === 0 ? (
                          <p className="text-sm text-light text-center" style={{ padding: '20px' }}>
                            暂无评论，快来抢沙发吧！
                          </p>
                        ) : (
                          post.comments.map(c => (
                            <div key={c.id} className="comment-item">
                              <div className="avatar-sm avatar">{c.avatar}</div>
                              <div style={{ flex: 1 }}>
                                <div style={{ marginBottom: '4px' }}>
                                  <span className="font-bold text-sm">{c.author}</span>
                                  <span className="text-xs text-light" style={{ marginLeft: '8px' }}>
                                    {new Date(c.time).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-sm">{c.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">🔥 热度排行榜</h2>
          {topHotPosts.length === 0 ? (
            <div className="empty-state" style={{ padding: '20px' }}>
              <div className="empty-icon" style={{ fontSize: '2rem' }}>📊</div>
              <p className="text-sm">暂无热门帖子</p>
            </div>
          ) : (
            <div>
              {topHotPosts.map((post, idx) => (
                <div
                  key={post.id}
                  className="flex-between mb-12"
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: idx === 0
                      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                      : idx === 1
                        ? 'linear-gradient(135deg, #f1f5f9, #e2e8f0)'
                        : 'var(--bg)',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setExpandedPost(post.id)
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex gap-8 mb-4" style={{ alignItems: 'center' }}>
                      <span
                        style={{
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          background: idx === 0 ? '#f59e0b' : idx === 1 ? '#94a3b8' : idx === 2 ? '#b45309' : '#cbd5e1',
                          color: 'white',
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-sm font-bold" style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}>
                        {post.title}
                      </span>
                    </div>
                    <div className="text-xs text-light" style={{ paddingLeft: '30px' }}>
                      {post.authorName} · ❤️{post.likes} · 💬{post.comments.length}
                    </div>
                  </div>
                  <span className="text-accent font-bold text-sm" style={{ flexShrink: 0, marginLeft: '8px' }}>
                    {post.heat}°
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="divider"></div>

          <h2 className="card-title" style={{ fontSize: '1rem' }}>📊 发帖统计</h2>
          <div className="grid grid-2 gap-12 mb-16">
            <div className="card" style={{ marginBottom: 0, padding: '12px', textAlign: 'center' }}>
              <div className="text-xs text-light mb-4">我的发帖</div>
              <div className="font-bold text-primary" style={{ fontSize: '1.3rem' }}>
                {state.totalPosts}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '12px', textAlign: 'center' }}>
              <div className="text-xs text-light mb-4">总帖数</div>
              <div className="font-bold text-secondary" style={{ fontSize: '1.3rem' }}>
                {state.posts.length}
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '12px', textAlign: 'center' }}>
              <div className="text-xs text-light mb-4">违规扣分</div>
              <div className="font-bold text-danger" style={{ fontSize: '1.3rem' }}>
                {state.heatPenalties}次
              </div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '12px', textAlign: 'center' }}>
              <div className="text-xs text-light mb-4">总热度</div>
              <div className="font-bold text-accent" style={{ fontSize: '1.3rem' }}>
                {state.posts.reduce((s, p) => s + p.heat, 0)}
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0, padding: '14px', background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
            <div className="text-xs mb-8" style={{ color: '#991b1b', fontWeight: 'bold' }}>
              ⚠️ 社区发帖规范
            </div>
            <ul className="text-xs text-light" style={{ color: '#7f1d1d', paddingLeft: '16px' }}>
              <li className="mb-4">禁止发布广告、垃圾信息</li>
              <li className="mb-4">禁止人身攻击、辱骂他人</li>
              <li className="mb-4">禁止传播不实信息</li>
              <li>违规内容将被扣除声望值</li>
            </ul>
          </div>
        </div>
      </div>

      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">✏️ 发布新帖子</h2>
              <button className="close-btn" onClick={() => setShowPostModal(false)}>×</button>
            </div>

            <div className="mb-12">
              <label className="label">分类</label>
              <select
                className="select"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
              >
                {CATEGORIES.filter(c => c !== '全部').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div className="mb-12">
              <label className="label">标题</label>
              <input
                type="text"
                className="input"
                placeholder="请输入帖子标题（吸引眼球的标题会获得更多热度哦~）"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                maxLength={50}
              />
              <div className="text-xs text-light mt-4" style={{ textAlign: 'right' }}>
                {newTitle.length}/50
              </div>
            </div>

            <div className="mb-16">
              <label className="label">内容</label>
              <textarea
                className="textarea"
                placeholder="分享你想和邻居们说的话吧..."
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                maxLength={500}
              />
              <div className="text-xs text-light mt-4" style={{ textAlign: 'right' }}>
                {newContent.length}/500
              </div>
            </div>

            <div className="flex gap-12">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowPostModal(false)}>
                取消
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSubmitPost}>
                📤 发布帖子
              </button>
            </div>
            <p className="text-xs text-light text-center mt-8">
              💡 发帖可获得 +2 声望，和邻居互动可提升好感度
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
