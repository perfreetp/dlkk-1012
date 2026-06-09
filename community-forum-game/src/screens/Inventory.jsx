import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { DECORATIONS } from '../data/gameData'

const RARITY_NAMES = {
  common: '普通',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
}

const RARITY_COLORS = {
  common: '#94a3b8',
  rare: '#3b82f6',
  epic: '#8b5cf6',
  legendary: '#f59e0b',
}

export default function Inventory() {
  const { state, dispatch } = useGame()
  const [activeTab, setActiveTab] = useState('shop')
  const [selectedDeco, setSelectedDeco] = useState(null)
  const [filterRarity, setFilterRarity] = useState('all')

  const rarityCounts = {}
  state.inventory.forEach(item => {
    rarityCounts[item.rarity] = (rarityCounts[item.rarity] || 0) + 1
  })

  const filteredShop = DECORATIONS.filter(d =>
    filterRarity === 'all' ? true : d.rarity === filterRarity
  )

  const ownedIds = new Set(state.inventory.map(i => i.id))

  const totalValue = state.inventory.reduce((sum, item) => sum + item.price, 0)

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <div className="flex gap-12 mb-16" style={{ borderBottom: '2px solid var(--border)', paddingBottom: '12px' }}>
            {[
              { key: 'shop', label: '🛒 装饰物商店' },
              { key: 'inventory', label: '🎒 我的收藏' },
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
            {activeTab === 'shop' && (
              <div className="flex gap-8" style={{ marginLeft: 'auto', alignItems: 'center' }}>
                <select
                  className="select"
                  style={{ width: 'auto', fontSize: '0.8rem', padding: '6px 10px' }}
                  value={filterRarity}
                  onChange={e => setFilterRarity(e.target.value)}
                >
                  <option value="all">全部品质</option>
                  <option value="common">普通</option>
                  <option value="rare">稀有</option>
                  <option value="epic">史诗</option>
                  <option value="legendary">传说</option>
                </select>
              </div>
            )}
          </div>

          {activeTab === 'shop' && (
            <div>
              <div className="grid grid-4 gap-16">
                {filteredShop.map(deco => {
                  const owned = ownedIds.has(deco.id)
                  return (
                    <div
                      key={deco.id}
                      className={`card rarity-${deco.rarity}`}
                      style={{
                        marginBottom: 0,
                        padding: '16px',
                        textAlign: 'center',
                        cursor: 'pointer',
                        opacity: owned ? 0.6 : 1,
                      }}
                      onClick={() => setSelectedDeco(deco)}
                    >
                      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{deco.icon}</div>
                      <div className="font-bold text-sm mb-4">{deco.name}</div>
                      <div className="mb-8">
                        <span
                          className="badge"
                          style={{
                            background: `${RARITY_COLORS[deco.rarity]}22`,
                            color: RARITY_COLORS[deco.rarity],
                          }}
                        >
                          {RARITY_NAMES[deco.rarity]}
                        </span>
                      </div>
                      <div
                        className="font-bold text-accent"
                        style={{ marginBottom: '8px' }}
                      >
                        🪙 {deco.price}
                      </div>
                      {owned ? (
                        <span className="badge badge-secondary">已拥有</span>
                      ) : (
                        <button
                          className={`btn btn-sm ${state.coins >= deco.price ? 'btn-primary' : 'btn-outline'}`}
                          style={{ width: '100%' }}
                          disabled={state.coins < deco.price}
                          onClick={e => {
                            e.stopPropagation()
                            if (state.coins >= deco.price) {
                              dispatch({ type: 'BUY_DECORATION', payload: deco.id })
                            }
                          }}
                        >
                          {state.coins >= deco.price ? '购买' : '金币不足'}
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {activeTab === 'inventory' && (
            <div>
              {state.inventory.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">🎒</div>
                  <p>背包空空如也，去商店挑选一些装饰物吧！</p>
                  <button className="btn btn-primary mt-8" onClick={() => setActiveTab('shop')}>
                    🛒 前往商店
                  </button>
                </div>
              ) : (
                <div>
                  <div className="grid grid-4 gap-16 mb-16">
                    {Object.entries(rarityCounts).map(([rarity, count]) => (
                      <div
                        key={rarity}
                        className="card"
                        style={{
                          marginBottom: 0,
                          padding: '14px',
                          textAlign: 'center',
                          borderLeft: `4px solid ${RARITY_COLORS[rarity]}`,
                        }}
                      >
                        <div
                          className="font-bold"
                          style={{ fontSize: '1.5rem', color: RARITY_COLORS[rarity] }}
                        >
                          {count}
                        </div>
                        <div className="text-xs text-light">
                          {RARITY_NAMES[rarity]}件数
                        </div>
                      </div>
                    ))}
                    <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', borderLeft: '4px solid var(--primary)' }}>
                      <div className="font-bold text-primary" style={{ fontSize: '1.5rem' }}>
                        {state.inventory.length}
                      </div>
                      <div className="text-xs text-light">总收藏</div>
                    </div>
                    <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', borderLeft: '4px solid var(--accent)' }}>
                      <div className="font-bold text-accent" style={{ fontSize: '1.5rem' }}>
                        🪙{totalValue}
                      </div>
                      <div className="text-xs text-light">总价值</div>
                    </div>
                  </div>

                  <div className="grid grid-4 gap-16">
                    {state.inventory.map((item, idx) => (
                      <div
                        key={`${item.id}-${idx}`}
                        className={`card rarity-${item.rarity}`}
                        style={{
                          marginBottom: 0,
                          padding: '16px',
                          textAlign: 'center',
                        }}
                      >
                        <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{item.icon}</div>
                        <div className="font-bold text-sm mb-4">{item.name}</div>
                        <div className="mb-8">
                          <span
                            className="badge"
                            style={{
                              background: `${RARITY_COLORS[item.rarity]}22`,
                              color: RARITY_COLORS[item.rarity],
                            }}
                          >
                            {RARITY_NAMES[item.rarity]}
                          </span>
                        </div>
                        <div className="text-xs text-light">
                          获得于 {new Date(item.obtainedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">🪙 金币中心</h2>
          <div className="card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', border: 'none' }}>
            <div className="text-center">
              <div style={{ fontSize: '3rem' }}>🪙</div>
              <div className="font-bold text-accent mt-8" style={{ fontSize: '2rem' }}>
                {state.coins}
              </div>
              <div className="text-xs" style={{ color: '#78350f' }}>当前金币余额</div>
            </div>
          </div>

          <h3 className="card-title" style={{ fontSize: '1rem' }}>💡 赚取金币方式</h3>
          <div className="scroll-container" style={{ maxHeight: '400px' }}>
            <div className="mb-12" style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              <div className="flex-between mb-4">
                <span className="text-sm font-bold">🤝 完成互助任务</span>
                <span className="text-accent text-sm">+15~40</span>
              </div>
              <p className="text-xs text-light">帮助邻居解决各种问题获得奖励</p>
            </div>
            <div className="mb-12" style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              <div className="flex-between mb-4">
                <span className="text-sm font-bold">⚖️ 调解邻里纠纷</span>
                <span className="text-accent text-sm">+25~40</span>
              </div>
              <p className="text-xs text-light">成功协调解决住户间的矛盾</p>
            </div>
            <div className="mb-12" style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              <div className="flex-between mb-4">
                <span className="text-sm font-bold">🛒 跳蚤市场交易</span>
                <span className="text-accent text-sm">+30~70</span>
              </div>
              <p className="text-xs text-light">在周末跳蚤市场出售闲置物品</p>
            </div>
            <div className="mb-12" style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              <div className="flex-between mb-4">
                <span className="text-sm font-bold">🛡️ 组队夜间巡逻</span>
                <span className="text-accent text-sm">+40</span>
              </div>
              <p className="text-xs text-light">和邻居组队进行小区安全巡逻</p>
            </div>
            <div className="mb-12" style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              <div className="flex-between mb-4">
                <span className="text-sm font-bold">🎊 限时活动奖励</span>
                <span className="text-accent text-sm">+150~250</span>
              </div>
              <p className="text-xs text-light">参与节日活动获得丰厚奖励</p>
            </div>
            <div style={{ padding: '12px', background: 'var(--bg)', borderRadius: '8px' }}>
              <div className="flex-between mb-4">
                <span className="text-sm font-bold">💬 论坛发帖/评论</span>
                <span className="text-accent text-sm">少量</span>
              </div>
              <p className="text-xs text-light">活跃在论坛也会获得少量金币</p>
            </div>
          </div>

          <div className="divider"></div>

          <div className="card" style={{ marginBottom: 0, padding: '14px', background: 'linear-gradient(135deg, #ede9fe, #ddd6fe)' }}>
            <div className="text-xs mb-8" style={{ color: '#5b21b6', fontWeight: 'bold' }}>
              💎 收集进度
            </div>
            <div className="progress-bar mb-8">
              <div
                className="progress-fill"
                style={{
                  width: Math.round((state.inventory.length / DECORATIONS.length) * 100) + '%',
                  background: 'linear-gradient(90deg, #8b5cf6, #7c3aed)',
                }}
              ></div>
            </div>
            <div className="text-center text-xs" style={{ color: '#5b21b6' }}>
              {state.inventory.length} / {DECORATIONS.length} ({Math.round((state.inventory.length / DECORATIONS.length) * 100)}%)
            </div>
          </div>
        </div>
      </div>

      {selectedDeco && (
        <div className="modal-overlay" onClick={() => setSelectedDeco(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedDeco.icon} {selectedDeco.name}</h2>
              <button className="close-btn" onClick={() => setSelectedDeco(null)}>×</button>
            </div>
            <div
              style={{
                textAlign: 'center',
                padding: '40px',
                background: `linear-gradient(135deg, ${RARITY_COLORS[selectedDeco.rarity]}15, ${RARITY_COLORS[selectedDeco.rarity]}30)`,
                borderRadius: 'var(--radius)',
                marginBottom: '20px',
                border: `3px solid ${RARITY_COLORS[selectedDeco.rarity]}`,
              }}
            >
              <div style={{ fontSize: '6rem' }}>{selectedDeco.icon}</div>
            </div>
            <div className="grid grid-2 gap-12 mb-16">
              <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                <div className="text-xs text-light mb-4">品质等级</div>
                <div
                  className="font-bold"
                  style={{ fontSize: '1.2rem', color: RARITY_COLORS[selectedDeco.rarity] }}
                >
                  {RARITY_NAMES[selectedDeco.rarity]}
                </div>
              </div>
              <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                <div className="text-xs text-light mb-4">价格</div>
                <div className="font-bold text-accent" style={{ fontSize: '1.2rem' }}>
                  🪙 {selectedDeco.price}
                </div>
              </div>
            </div>
            <div className="flex gap-12">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedDeco(null)}>
                返回
              </button>
              <button
                className={`btn ${state.coins >= selectedDeco.price && !ownedIds.has(selectedDeco.id) ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                disabled={state.coins < selectedDeco.price || ownedIds.has(selectedDeco.id)}
                onClick={() => {
                  if (state.coins >= selectedDeco.price && !ownedIds.has(selectedDeco.id)) {
                    dispatch({ type: 'BUY_DECORATION', payload: selectedDeco.id })
                    setSelectedDeco(null)
                  }
                }}
              >
                {ownedIds.has(selectedDeco.id) ? '已拥有' : state.coins >= selectedDeco.price ? `购买 (🪙${selectedDeco.price})` : '金币不足'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
