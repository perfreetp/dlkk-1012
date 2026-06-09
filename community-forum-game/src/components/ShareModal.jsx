import React, { useState } from 'react'
import { useGame } from '../context/GameContext'

export default function ShareModal({ onClose }) {
  const { state } = useGame()
  const [copied, setCopied] = useState(false)

  if (!state.player) return null

  const avgRelationship = Object.values(state.relationships).length > 0
    ? Math.round(Object.values(state.relationships).reduce((a, b) => a + b, 0) / Object.values(state.relationships).length)
    : 0

  const shareText = `🏘️【邻里家园】游戏成果分享
━━━━━━━━━━━━━━━━━━━━
👤 玩家：${state.player.name} (${state.player.avatar})
🏢 住所：${state.player.buildingName}
📅 入驻：第 ${state.day} 天

⭐ 小区声望：${state.reputation}
🪙 金币总数：${state.coins}
📦 收藏装饰：${state.inventory.length} 件
📝 论坛发帖：${state.totalPosts} 篇
🤝 互助任务：${state.totalHelpTasks} 次
⚖️ 调解纠纷：${state.totalDisputes} 起
🛡️ 巡逻次数：${state.totalPatrols} 次
💰 市场交易：${state.totalMarketTrades} 次
🏅 解锁成就：${state.achievements.length} 个
❤️ 邻里好感：${avgRelationship}%

━━━━━━━━━━━━━━━━━━━━
快来一起建设我们的美好家园吧！`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      alert('复制失败，请手动复制文本框内容')
    }
  }

  const handleDownload = () => {
    const blob = new Blob([shareText], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `邻里家园_${state.player.name}_成果.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">📤 分享活动成果</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="share-card mb-16">
          <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🏆</div>
          <h2 style={{ marginBottom: '8px' }}>{state.player.name} 的活动报告</h2>
          <p style={{ opacity: 0.9 }}>{state.player.buildingName} · 第 {state.day} 天</p>
        </div>

        <div className="grid grid-2 gap-12 mb-16">
          <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
            <div className="text-xs text-light">⭐ 声望</div>
            <div className="text-primary font-bold" style={{ fontSize: '1.5rem' }}>{state.reputation}</div>
          </div>
          <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
            <div className="text-xs text-light">🪙 金币</div>
            <div className="text-accent font-bold" style={{ fontSize: '1.5rem' }}>{state.coins}</div>
          </div>
          <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
            <div className="text-xs text-light">🏅 成就</div>
            <div className="text-secondary font-bold" style={{ fontSize: '1.5rem' }}>{state.achievements.length}</div>
          </div>
          <div className="card" style={{ marginBottom: 0, padding: '16px' }}>
            <div className="text-xs text-light">❤️ 好感度</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ec4899' }}>{avgRelationship}%</div>
          </div>
        </div>

        <div className="mb-16">
          <label className="label">分享文案</label>
          <textarea
            className="textarea"
            readOnly
            value={shareText}
            style={{ minHeight: '200px', fontSize: '0.8rem' }}
          />
        </div>

        <div className="flex gap-12">
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCopy}>
            {copied ? '✅ 已复制' : '📋 复制文案'}
          </button>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleDownload}>
            💾 下载报告
          </button>
        </div>
      </div>
    </div>
  )
}
