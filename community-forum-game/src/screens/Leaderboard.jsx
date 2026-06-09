import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { NPC_NAMES, AVATARS, ACHIEVEMENTS } from '../data/gameData'

export default function Leaderboard() {
  const { state } = useGame()
  const [activeTab, setActiveTab] = useState('reputation')

  const avgRelationship = Object.values(state.relationships).length > 0
    ? Math.round(Object.values(state.relationships).reduce((a, b) => a + b, 0) / Object.values(state.relationships).length)
    : 0

  const totalHeat = state.posts.reduce((s, p) => s + p.heat, 0)
  const totalLikes = state.posts.reduce((s, p) => s + p.likes, 0)

  const reputationRanking = [
    { rank: 1, name: '王大爷', avatar: '👴', building: '4号楼 - 冬梅苑', score: 980, medal: '🥇' },
    { rank: 2, name: '李阿姨', avatar: '👵', building: '2号楼 - 夏荷苑', score: 856, medal: '🥈' },
    { rank: 3, name: state.player?.name || '我', avatar: state.player?.avatar || '🙂', building: state.player?.buildingName || '-', score: state.reputation, medal: '🥉', isMe: true },
    { rank: 4, name: '张老师', avatar: '👩‍🏫', building: '3号楼 - 秋枫苑', score: 612 },
    { rank: 5, name: '陈医生', avatar: '👨‍⚕️', building: '5号楼 - 翠竹苑', score: 589 },
    { rank: 6, name: '赵经理', avatar: '🧑‍💼', building: '1号楼 - 春晖苑', score: 523 },
    { rank: 7, name: '小刘', avatar: '👱‍♂️', building: '2号楼 - 夏荷苑', score: 456 },
    { rank: 8, name: '孙奶奶', avatar: '👵', building: '3号楼 - 秋枫苑', score: 401 },
  ].sort((a, b) => {
    if (a.isMe && a.rank === 3) return 0
    return a.rank - b.rank
  }).filter((item, idx, arr) => {
    if (item.isMe) return true
    return !arr.slice(0, idx).some(x => x.isMe && x.name === item.name)
  })

  const relationshipRanking = Object.entries(state.relationships)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value], idx) => ({
      rank: idx + 1,
      name,
      avatar: AVATARS[idx % AVATARS.length],
      score: value,
      medal: idx < 3 ? ['🥇', '🥈', '🥉'][idx] : null,
      level: value >= 80 ? '挚友' : value >= 60 ? '好友' : value >= 40 ? '熟人' : '邻居',
    }))

  const postHotRanking = [...state.posts]
    .sort((a, b) => b.heat - a.heat)
    .slice(0, 8)
    .map((p, idx) => ({
      rank: idx + 1,
      title: p.title,
      author: p.authorName,
      avatar: p.authorAvatar,
      score: p.heat,
      likes: p.likes,
      comments: p.comments.length,
      medal: idx < 3 ? ['🥇', '🥈', '🥉'][idx] : null,
      isMine: p.authorId === state.player?.id,
    }))

  const renderLeaderboard = (items, scoreLabel, showExtra) => (
    <div className="scroll-container" style={{ maxHeight: '500px' }}>
      {items.map(item => (
        <div
          key={item.rank}
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
                {item.building || item.author ? (item.building || `作者: ${item.author}`) : item.level || ''}
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
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex gap-12 mb-16" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
            {[
              { key: 'reputation', label: '⭐ 声望榜' },
              { key: 'relationship', label: '❤️ 好感榜' },
              { key: 'hot', label: '🔥 热帖榜' },
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
    </div>
  )
}
