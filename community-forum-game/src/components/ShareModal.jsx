import React, { useState, useRef } from 'react'
import { useGame } from '../context/GameContext'
import { REPORT_HISTORY_TYPES } from '../data/gameData'

export default function ShareModal({ onClose }) {
  const { state } = useGame()
  const [copied, setCopied] = useState(false)
  const cardRef = useRef(null)

  if (!state.player) return null

  const avgRelationship = Object.values(state.relationships).length > 0
    ? Math.round(Object.values(state.relationships).reduce((a, b) => a + b, 0) / Object.values(state.relationships).length)
    : 0

  const unlockedAchievements = state.achievements
  const dailyEventHandled = state.dailyEventHistory?.filter(h => h.type === 'daily').length || 0
  const reviewCount = state.reportHistory?.length || 0
  const penalizedCount = state.reportHistory?.filter(r => r.action === REPORT_HISTORY_TYPES.PENALIZED).length || 0

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
📰 处理事件：${dailyEventHandled} 起
🏅 解锁成就：${unlockedAchievements.length} 个
❤️ 邻里好感：${avgRelationship}%
${state.isAdmin ? `🛡️ 管理员工作：审核${reviewCount}条 / 扣分${penalizedCount}次\n` : ''}
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
    a.download = `邻里家园_${state.player.name}_成果报告.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDownloadCard = () => {
    if (!cardRef.current) {
      alert('分享卡片暂未就绪')
      return
    }
    try {
      const svgNS = 'http://www.w3.org/2000/svg'
      const svg = document.createElementNS(svgNS, 'svg')
      svg.setAttribute('xmlns', svgNS)
      svg.setAttribute('width', '480')
      svg.setAttribute('height', '760')
      svg.setAttribute('viewBox', '0 0 480 760')

      const defs = document.createElementNS(svgNS, 'defs')
      const gradient = document.createElementNS(svgNS, 'linearGradient')
      gradient.setAttribute('id', 'bgGrad')
      gradient.setAttribute('x1', '0%')
      gradient.setAttribute('y1', '0%')
      gradient.setAttribute('x2', '100%')
      gradient.setAttribute('y2', '100%')
      const stop1 = document.createElementNS(svgNS, 'stop')
      stop1.setAttribute('offset', '0%')
      stop1.setAttribute('stop-color', '#6366f1')
      const stop2 = document.createElementNS(svgNS, 'stop')
      stop2.setAttribute('offset', '100%')
      stop2.setAttribute('stop-color', '#8b5cf6')
      gradient.appendChild(stop1)
      gradient.appendChild(stop2)
      defs.appendChild(gradient)
      svg.appendChild(defs)

      const bgRect = document.createElementNS(svgNS, 'rect')
      bgRect.setAttribute('width', '480')
      bgRect.setAttribute('height', '760')
      bgRect.setAttribute('rx', '20')
      bgRect.setAttribute('fill', 'url(#bgGrad)')
      svg.appendChild(bgRect)

      const innerRect = document.createElementNS(svgNS, 'rect')
      innerRect.setAttribute('x', '20')
      innerRect.setAttribute('y', '110')
      innerRect.setAttribute('width', '440')
      innerRect.setAttribute('height', '630')
      innerRect.setAttribute('rx', '16')
      innerRect.setAttribute('fill', '#ffffff')
      svg.appendChild(innerRect)

      const addText = (x, y, text, size = 14, color = '#334155', weight = 'normal', anchor = 'start') => {
        const el = document.createElementNS(svgNS, 'text')
        el.setAttribute('x', x)
        el.setAttribute('y', y)
        el.setAttribute('font-size', size)
        el.setAttribute('fill', color)
        el.setAttribute('font-weight', weight)
        el.setAttribute('text-anchor', anchor)
        el.setAttribute('font-family', '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif')
        el.textContent = text
        svg.appendChild(el)
      }

      addText(240, 50, '🏘️ 邻里家园', 28, '#ffffff', 'bold', 'middle')
      addText(240, 80, '社区活动日 · 游戏成果报告', 15, 'rgba(255,255,255,0.9)', 'normal', 'middle')

      addText(240, 155, `${state.player.avatar}`, 56, '#334155', 'normal', 'middle')
      addText(240, 205, state.player.name, 24, '#1e293b', 'bold', 'middle')
      addText(240, 230, `${state.player.buildingName} · 入驻第${state.day}天`, 13, '#64748b', 'normal', 'middle')

      const badges = [
        { x: 60, y: 268, w: 360, h: 40, color: '#fef3c7', label: '⭐ 声望', value: state.reputation, valueColor: '#d97706' },
        { x: 60, y: 316, w: 360, h: 40, color: '#dbeafe', label: '🪙 金币', value: state.coins, valueColor: '#2563eb' },
        { x: 60, y: 364, w: 360, h: 40, color: '#fce7f3', label: '❤️ 邻里好感', value: `${avgRelationship}%`, valueColor: '#db2777' },
        { x: 60, y: 412, w: 360, h: 40, color: '#d1fae5', label: '🏅 解锁成就', value: `${unlockedAchievements.length}个`, valueColor: '#059669' },
      ]
      badges.forEach(b => {
        const r = document.createElementNS(svgNS, 'rect')
        r.setAttribute('x', b.x)
        r.setAttribute('y', b.y)
        r.setAttribute('width', b.w)
        r.setAttribute('height', b.h)
        r.setAttribute('rx', '8')
        r.setAttribute('fill', b.color)
        svg.appendChild(r)
        addText(b.x + 16, b.y + 26, b.label, 14, '#334155')
        addText(b.x + b.w - 16, b.y + 26, b.value, 18, b.valueColor, 'bold', 'end')
      })

      const stats = [
        { label: '📝发帖', value: state.totalPosts },
        { label: '🤝互助', value: state.totalHelpTasks },
        { label: '⚖️调解', value: state.totalDisputes },
        { label: '🛡️巡逻', value: state.totalPatrols },
        { label: '💰交易', value: state.totalMarketTrades },
        { label: '📦收藏', value: state.inventory.length },
        { label: '📰事件', value: dailyEventHandled },
        { label: '💬帖子', value: state.posts.length },
      ]
      const startY = 476
      const cellW = 100
      const cellH = 60
      stats.forEach((s, i) => {
        const col = i % 4
        const row = Math.floor(i / 4)
        const cx = 60 + col * cellW
        const cy = startY + row * cellH
        addText(cx + 50, cy + 25, String(s.value), 20, '#6366f1', 'bold', 'middle')
        addText(cx + 50, cy + 48, s.label, 11, '#64748b', 'normal', 'middle')
      })

      if (unlockedAchievements.length > 0) {
        addText(240, 610, '——— 最近解锁成就 ———', 12, '#94a3b8', 'normal', 'middle')
        const lastAchs = unlockedAchievements.slice(-3)
        lastAchs.forEach((a, i) => {
          const ay = 640 + i * 26
          addText(240, ay, `${a.icon} ${a.name} - ${a.description}`, 12, '#64748b', 'normal', 'middle')
        })
      }

      const dateText = `生成时间：${new Date().toLocaleDateString()} | 邻里家园 v2.0`
      addText(240, 735, dateText, 11, '#94a3b8', 'normal', 'middle')

      const svgData = new XMLSerializer().serializeToString(svg)
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
      const svgUrl = URL.createObjectURL(svgBlob)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = 960
        canvas.height = 1520
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, 960, 1520)
        URL.revokeObjectURL(svgUrl)
        canvas.toBlob(blob => {
          if (!blob) {
            alert('图片生成失败，请重试')
            return
          }
          const dl = document.createElement('a')
          dl.href = URL.createObjectURL(blob)
          dl.download = `邻里家园_${state.player.name}_分享卡片.png`
          dl.click()
          setTimeout(() => URL.revokeObjectURL(dl.href), 3000)
        }, 'image/png')
      }
      img.onerror = () => {
        const fallbackLink = document.createElement('a')
        fallbackLink.href = svgUrl
        fallbackLink.download = `邻里家园_${state.player.name}_分享卡片.svg`
        fallbackLink.click()
      }
      img.src = svgUrl
    } catch (e) {
      console.error('Download card error:', e)
      const svgText = cardRef.current?.outerHTML || ''
      const blob = new Blob([svgText], { type: 'text/html;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `邻里家园_${state.player.name}_分享卡片.html`
      a.click()
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content share-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title">📤 分享活动成果</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div ref={cardRef} className="share-poster-card" style={{
          background: 'linear-gradient(160deg, #6366f1 0%, #8b5cf6 40%, #ec4899 100%)',
          borderRadius: '16px',
          padding: '20px 20px 24px',
          marginBottom: '20px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '120px', opacity: 0.08 }}>🏘️</div>

          <div style={{ textAlign: 'center', color: 'white', marginBottom: '18px' }}>
            <div style={{ fontSize: '2.2rem', marginBottom: '4px' }}>🏘️ 邻里家园</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>社区活动日 · 游戏成果海报</div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '14px',
            padding: '20px 16px',
            position: 'relative',
            zIndex: 2,
          }}>
            <div style={{ textAlign: 'center', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{state.player.avatar}</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#1e293b', marginTop: '8px' }}>{state.player.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                {state.player.buildingName} · 入驻第 {state.day} 天
                {state.isAdmin && <span className="badge badge-accent" style={{ marginLeft: '6px', fontSize: '0.65rem' }}>🛡️ 管理员</span>}
              </div>
            </div>

            <div className="grid grid-2 gap-8 mb-12">
              <div style={{ background: '#fef3c7', padding: '10px 12px', borderRadius: '8px' }}>
                <div className="text-xs text-light" style={{ fontSize: '0.7rem' }}>⭐ 小区声望</div>
                <div className="font-bold" style={{ fontSize: '1.3rem', color: '#d97706' }}>{state.reputation}</div>
              </div>
              <div style={{ background: '#dbeafe', padding: '10px 12px', borderRadius: '8px' }}>
                <div className="text-xs text-light" style={{ fontSize: '0.7rem' }}>🪙 金币总额</div>
                <div className="font-bold" style={{ fontSize: '1.3rem', color: '#2563eb' }}>{state.coins}</div>
              </div>
              <div style={{ background: '#fce7f3', padding: '10px 12px', borderRadius: '8px' }}>
                <div className="text-xs text-light" style={{ fontSize: '0.7rem' }}>❤️ 邻里好感</div>
                <div className="font-bold" style={{ fontSize: '1.3rem', color: '#db2777' }}>{avgRelationship}%</div>
              </div>
              <div style={{ background: '#d1fae5', padding: '10px 12px', borderRadius: '8px' }}>
                <div className="text-xs text-light" style={{ fontSize: '0.7rem' }}>🏅 解锁成就</div>
                <div className="font-bold" style={{ fontSize: '1.3rem', color: '#059669' }}>{unlockedAchievements.length}个</div>
              </div>
            </div>

            <div className="grid grid-4 gap-6 mb-12" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
              {[
                { icon: '📝', label: '发帖', v: state.totalPosts },
                { icon: '🤝', label: '互助', v: state.totalHelpTasks },
                { icon: '⚖️', label: '调解', v: state.totalDisputes },
                { icon: '🛡️', label: '巡逻', v: state.totalPatrols },
                { icon: '💰', label: '交易', v: state.totalMarketTrades },
                { icon: '📦', label: '收藏', v: state.inventory.length },
                { icon: '📰', label: '事件', v: dailyEventHandled },
                { icon: '💬', label: '论坛帖', v: state.posts.length },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '8px 4px', background: '#f8fafc', borderRadius: '8px' }}>
                  <div style={{ fontSize: '1rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: '#6366f1', marginTop: '2px' }}>{s.v}</div>
                  <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {unlockedAchievements.length > 0 && (
              <div style={{ paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', textAlign: 'center', marginBottom: '8px' }}>✨ 成就徽章</div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {unlockedAchievements.slice(0, 6).map(a => (
                    <span key={a.id} title={`${a.name}: ${a.description}`} style={{
                      padding: '4px 10px',
                      background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      color: '#92400e',
                    }}>
                      {a.icon} {a.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div style={{ textAlign: 'center', marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                生成时间：{new Date().toLocaleString()} | 邻里家园 v2.0
              </span>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <label className="label">分享文案</label>
          <textarea
            className="textarea"
            readOnly
            value={shareText}
            style={{ minHeight: '180px', fontSize: '0.78rem' }}
          />
        </div>

        <div className="grid grid-2 gap-12 mb-12">
          <button className="btn btn-primary" onClick={handleCopy}>
            {copied ? '✅ 已复制' : '📋 复制文案'}
          </button>
          <button className="btn btn-secondary" onClick={handleDownload}>
            💾 下载TXT报告
          </button>
        </div>

        <button className="btn" style={{
          width: '100%',
          background: 'linear-gradient(135deg, #6366f1, #ec4899)',
          color: 'white',
          border: 'none',
          fontWeight: '600',
        }} onClick={handleDownloadCard}>
          🎨 下载分享海报卡片 (PNG)
        </button>
      </div>
    </div>
  )
}
