import React, { useState, useMemo } from 'react'
import { useGame } from '../context/GameContext'
import { ACHIEVEMENTS } from '../data/gameData'

export default function Leaderboard() {
  const { state } = useGame()
  const [activeTab, setActiveTab] = useState('reputation')
  const [selectedResident, setSelectedResident] = useState(null)

  const avgRelationship = Object.values(state.relationships).length > 0
    ? Math.round(Object.values(state.relationships).reduce((a, b) => a + b, 0) / Object.values(state.relationships).length)
    : 0

  const totalHeat = state.posts.reduce((s, p) => s + p.heat, 0)
  const totalLikes = state.posts.reduce((s, p) => s + p.likes, 0)

  const reputationRanking = useMemo(() => {
    const residents = state.residents.map(r => ({
      id: r.id,
      name: r.name,
      avatar: r.avatar,
      building: r.buildingName,
      score: r.reputation,
      postCount: r.postCount,
      reportCount: r.reportCount || 0,
      isPlayer: false,
    }))
    residents.push({
      id: state.player?.id || 'me',
      name: (state.player?.name || '我') + '（你）',
      avatar: state.player?.avatar || '🙂',
      building: state.player?.buildingName || '-',
      score: state.reputation,
      postCount: state.totalPosts,
      reportCount: 0,
      isPlayer: true,
      isMe: true,
    })
    residents.sort((a, b) => b.score - a.score)
    return residents.map((r, idx) => ({
      ...r,
      rank: idx + 1,
      medal: idx < 3 ? ['🥇', '🥈', '🥉'][idx] : null,
    }))
  }, [state.residents, state.player, state.reputation, state.totalPosts])

  const relationshipRanking = useMemo(() => {
    return Object.entries(state.relationships)
      .map(([rid, value]) => {
        const res = state.residents.find(r => r.id === rid)
        return {
          id: rid,
          name: res?.name || rid,
          avatar: res?.avatar || '🙂',
          score: value,
          level: value >= 80 ? '挚友' : value >= 60 ? '好友' : value >= 40 ? '熟人' : '邻居',
        }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map((r, idx) => ({
        ...r,
        rank: idx + 1,
        medal: idx < 3 ? ['🥇', '🥈', '🥉'][idx] : null,
      }))
  }, [state.relationships, state.residents])

  const postHotRanking = [...state.posts]
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 10)
    .map((p, idx) => ({
      rank: idx + 1,
      title: p.title,
      author: p.authorName,
      avatar: p.authorAvatar,
      authorBuilding: p.authorBuilding,
      score: p.heat,
      likes: p.likes,
      comments: p.comments.length,
      medal: idx < 3 ? ['🥇', '🥈', '🥉'][idx] : null,
      isMine: p.authorId === state.player?.id,
    }))

  const residentCards = useMemo(() => state.residents.map(r => {
    const rep = reputationRanking.find(x => x.id === r.id)
    return {
      ...r,
      rank: rep?.rank,
      relationship: state.relationships[r.id] || 0,
      reputation: r.reputation,
    }
  }).sort((a, b) => (a.rank || 999) - (b.rank || 999)), [state.residents, reputationRanking, state.relationships])

  const renderLeaderboard = (items, scoreLabel, showExtra) => (
    <div className="scroll-container" style={{ maxHeight: '520px' }}>
      {items.map(item => (
        <div
          key={item.id || item.rank}
          className="flex-between mb-12"
          style={{
            padding: '14px 16px',
            borderRadius: '12px',
            background: item.isMe || item.isMine
              ? 'linear-gradient(135deg, #dbeafe, #bfdbfe)'
              : item.rank <= 3
                ? `linear-gradient(135deg, ${item.rank === 1 ? '#fef3c7' : item.rank === 2 ? '#f1f5f9' : '#fef3c7'}, ${item.rank === 1 ? '#fde68a' : item.rank === 2 ? '#e2e8f0' : '#fed7aa'})`
                : 'var(--bg)',
            border: item.isMe || item.isMine ? '2px solid var(--primary)' : 'none',
            cursor: !showExtra && item.id && !item.isPlayer ? 'pointer' : 'default',
          }}
          onClick={() => {
            if (!showExtra && item.id && !item.isPlayer) setSelectedResident(item.id)
          }}
        >
          <div className="flex gap-12" style={{ alignItems: 'center' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                background: item.rank <= 3 ? 'transparent' : '#94a3b8',
                color: item.rank <= 3 ? 'transparent' : 'white',
                fontSize: item.rank <= 3 ? '1.5rem' : '0.9rem',
              }}
            >
              {item.medal || item.rank}
            </div>
            <div className="avatar avatar-sm">{item.avatar}</div>
            <div>
              <div className="font-bold text-sm">
                {item.title || item.name}
                {(item.isMe || item.isMine) && <span className="badge badge-primary" style={{ marginLeft: '6px' }}>我</span>}
              </div>
              <div className="text-xs text-light">
                {item.building || item.author ? (item.building || `作者: ${item.author}${item.authorBuilding ? ' · ' + item.authorBuilding : ''}`) : item.level || ''}
              </div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
              {item.score}{scoreLabel}
            </div>
            {showExtra && item.likes !== undefined && (
              <div className="text-xs text-light">
                ❤️{item.likes} · 💬{item.comments}
              </div>
            )}
            {!showExtra && item.postCount !== undefined && !item.isPlayer && (
              <div className="text-xs text-light">
                📝{item.postCount}帖 {item.reportCount ? '· ⚠️' + item.reportCount + '次举报' : ''}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const selectedResidentData = selectedResident ? state.residents.find(r => r.id === selectedResident) : null
  const selectedResidentPosts = selectedResident ? state.posts.filter(p => p.authorId === selectedResident) : []

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex gap-12 mb-16" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '12px', flexWrap: 'wrap' }}>
            {[
              { key: 'reputation', label: '⭐ 声望榜' },
              { key: 'relationship', label: '❤️ 好感榜' },
              { key: 'hot', label: '🔥 热帖榜' },
              { key: 'residents', label: '🏠 居民档案' },
            ].map(tab => (
              <button
                key={tab.key}
                className={`btn ${activeTab === tab.key ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setActiveTab(tab.key)}
                style={{ fontSize: '0.9rem' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'reputation' && renderLeaderboard(reputationRanking, ' 声望', false)}
          {activeTab === 'relationship' && renderLeaderboard(relationshipRanking, '%', false)}
          {activeTab === 'hot' && renderLeaderboard(postHotRanking, '°', true)}
          {activeTab === 'residents' && (
            <div className="scroll-container" style={{ maxHeight: '520px' }}>
              <div className="grid grid-2 gap-12">
                {residentCards.map(r => (
                  <div
                    key={r.id}
                    className="card"
                    style={{ marginBottom: 0, cursor: 'pointer', border: r.rank <= 3 ? '2px solid #f59e0b' : '2px solid var(--border)' }}
                    onClick={() => setSelectedResident(r.id)}
                  >
                    <div className="flex gap-12" style={{ alignItems: 'center' }}>
                      <div style={{ position: 'relative' }}>
                        <div className="avatar" style={{ width: '56px', height: '56px', fontSize: '2rem' }}>{r.avatar}</div>
                        <span style={{
                          position: 'absolute',
                          top: '-8px',
                          right: '-8px',
                          background: r.rank <= 3 ? '#f59e0b' : '#94a3b8',
                          color: 'white',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          fontSize: '0.7rem',
                          fontWeight: 'bold',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          {r.rank}
                        </span>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div className="flex-between mb-4">
                          <span className="font-bold">{r.name}</span>
                          {r.tags && r.tags.length > 0 && (
                            <span className="badge badge" style={{ fontSize: '0.7rem' }}>{r.tags[0]}</span>
                          )}
                        </div>
                        <div className="text-xs text-light mb-4">{r.buildingName} · 入住{r.joinDays}天</div>
                        <div className="grid grid-3 gap-8 text-xs">
                          <div>⭐ <b>{r.reputation}</b></div>
                          <div>🪙 <b>{r.coins}</b></div>
                          <div>❤️ <b>{r.relationship}%</b></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">🏅 成就徽章</h2>
          <div className="scroll-container" style={{ maxHeight: '500px' }}>
            {ACHIEVEMENTS.map(ach => {
              const unlocked = state.achievements.some(a => a.id === ach.id)
              return (
                <div
                  key={ach.id}
                  className="mb-12"
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    background: unlocked
                      ? 'linear-gradient(135deg, #fef3c7, #fde68a)'
                      : 'var(--bg)',
                    opacity: unlocked ? 1 : 0.5,
                    border: unlocked ? '2px solid var(--accent)' : '2px dashed #cbd5e1',
                  }}
                >
                  <div className="flex gap-12" style={{ alignItems: 'center' }}>
                    <div
                      style={{
                        fontSize: '2.5rem',
                        filter: unlocked ? 'none' : 'grayscale(100%)',
                      }}
                    >
                      {ach.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="flex-between mb-4">
                        <span className="font-bold text-sm">{ach.name}</span>
                        {unlocked ? (
                          <span className="badge badge-accent">已解锁</span>
                        ) : (
                          <span className="badge">未解锁</span>
                        )}
                      </div>
                      <p className="text-xs text-light">{ach.description}</p>
                      {unlocked && (
                        <p className="text-xs mt-4" style={{ color: '#b45309' }}>
                          📅 {new Date(state.achievements.find(a => a.id === ach.id)?.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-4 gap-16">
        <div className="card" style={{ marginBottom: 0, textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐</div>
          <div className="font-bold text-primary" style={{ fontSize: '1.8rem' }}>{state.reputation}</div>
          <div className="text-xs text-light mt-4">当前声望值</div>
        </div>
        <div className="card" style={{ marginBottom: 0, textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏅</div>
          <div className="font-bold text-accent" style={{ fontSize: '1.8rem' }}>
            {state.achievements.length}/{ACHIEVEMENTS.length}
          </div>
          <div className="text-xs text-light mt-4">成就解锁</div>
        </div>
        <div className="card" style={{ marginBottom: 0, textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>❤️</div>
          <div className="font-bold" style={{ fontSize: '1.8rem', color: '#ec4899' }}>{avgRelationship}%</div>
          <div className="text-xs text-light mt-4">平均好感度</div>
        </div>
        <div className="card" style={{ marginBottom: 0, textAlign: 'center', padding: '20px' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🔥</div>
          <div className="font-bold text-danger" style={{ fontSize: '1.8rem' }}>{totalHeat}</div>
          <div className="text-xs text-light mt-4">总热度 / ❤️{totalLikes}赞</div>
        </div>
      </div>

      {selectedResidentData && (
        <div className="modal-overlay" onClick={() => setSelectedResident(null)}>
          <div className="modal-content" style={{ maxWidth: '560px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">🏠 居民档案</h2>
              <button className="close-btn" onClick={() => setSelectedResident(null)}>×</button>
            </div>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 'var(--radius)',
              padding: '24px',
              marginBottom: '16px',
              textAlign: 'center',
            }}>
              <div className="avatar" style={{
                width: '80px',
                height: '80px',
                fontSize: '3rem',
                margin: '0 auto 12px',
                border: '3px solid rgba(255,255,255,0.5)',
              }}>
                {selectedResidentData.avatar}
              </div>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold' }}>{selectedResidentData.name}</div>
              <div style={{ opacity: 0.85, marginTop: '4px' }}>{selectedResidentData.buildingName}</div>
              <div style={{ marginTop: '8px', fontSize: '0.85rem' }}>
                🏡 入住 {selectedResidentData.joinDays} 天 · 声望排名 第{residentCards.find(r => r.id === selectedResidentData.id)?.rank || '-'}名
              </div>
            </div>
            <div className="grid grid-3 gap-12 mb-16 text-center">
              <div className="card" style={{ marginBottom: 0, padding: '14px' }}>
                <div className="text-xs text-light mb-4">声望值</div>
                <div className="font-bold text-primary" style={{ fontSize: '1.3rem' }}>⭐ {selectedResidentData.reputation}</div>
              </div>
              <div className="card" style={{ marginBottom: 0, padding: '14px' }}>
                <div className="text-xs text-light mb-4">金币</div>
                <div className="font-bold" style={{ color: '#f59e0b', fontSize: '1.3rem' }}>🪙 {selectedResidentData.coins}</div>
              </div>
              <div className="card" style={{ marginBottom: 0, padding: '14px' }}>
                <div className="text-xs text-light mb-4">与你的好感</div>
                <div className="font-bold" style={{ color: '#ec4899', fontSize: '1.3rem' }}>❤️ {state.relationships[selectedResidentData.id] || 0}%</div>
              </div>
            </div>
            <div className="grid grid-2 gap-12 mb-16 text-center">
              <div className="card" style={{ marginBottom: 0, padding: '14px' }}>
                <div className="text-xs text-light mb-4">发帖数</div>
                <div className="font-bold" style={{ fontSize: '1.2rem' }}>📝 {selectedResidentData.postCount || 0}</div>
              </div>
              <div className="card" style={{ marginBottom: 0, padding: '14px' }}>
                <div className="text-xs text-light mb-4">被举报次数</div>
                <div className={`font-bold ${(selectedResidentData.reportCount || 0) > 0 ? 'text-danger' : ''}`} style={{ fontSize: '1.2rem' }}>
                  ⚠️ {selectedResidentData.reportCount || 0}
                </div>
              </div>
            </div>
            <div className="mb-12">
              <div className="text-sm text-light mb-8">🏷️ 标签</div>
              <div className="flex gap-8 flex-wrap">
                {(selectedResidentData.tags || []).map(t => (
                  <span key={t} className="badge badge-primary" style={{ fontSize: '0.8rem' }}>{t}</span>
                ))}
              </div>
            </div>
            {selectedResidentPosts.length > 0 && (
              <div>
                <div className="text-sm text-light mb-8">📝 最近发帖（{selectedResidentPosts.length}条）</div>
                <div className="scroll-container" style={{ maxHeight: '180px' }}>
                  {selectedResidentPosts.slice(0, 5).map(p => (
                    <div key={p.id} className="card" style={{ marginBottom: '8px', padding: '10px 12px' }}>
                      <div className="flex-between mb-4">
                        <span className="font-bold text-sm">{p.title}</span>
                        <span className="text-xs text-light">🔥 {p.heat}</span>
                      </div>
                      <div className="text-xs text-light">{p.category || '分享'} · ❤️{p.likes} · 💬{p.comments.length}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
