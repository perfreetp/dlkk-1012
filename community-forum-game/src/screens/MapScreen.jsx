import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { BUILDINGS, NPC_NAMES } from '../data/gameData'

export default function MapScreen() {
  const { state, dispatch } = useGame()
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [selectedFacility, setSelectedFacility] = useState(null)

  const totalVotes = state.facilities.reduce((sum, f) => sum + f.votes, 0)

  const residentsByBuilding = {}
  BUILDINGS.forEach(b => {
    residentsByBuilding[b.id] = NPC_NAMES.slice(
      (b.id - 1) * 2,
      (b.id - 1) * 2 + 2
    )
  })

  return (
    <div>
      <div className="grid grid-3 gap-16">
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2 className="card-title">🗺️ 小区地图</h2>

          <div
            style={{
              position: 'relative',
              background: 'linear-gradient(135deg, #d1fae5, #a7f3d0)',
              borderRadius: 'var(--radius-lg)',
              padding: '40px',
              minHeight: '400px',
              marginBottom: '20px',
            }}
          >
            <div style={{ position: 'absolute', top: '20px', left: '20px', fontSize: '1.2rem', fontWeight: 'bold', color: '#065f46' }}>
              🏘️ 邻里家园小区
            </div>

            <div className="grid grid-3 gap-16" style={{ marginTop: '40px' }}>
              {BUILDINGS.map(b => (
                <div
                  key={b.id}
                  className={`building-card card ${state.player.buildingId === b.id ? 'selected' : ''}`}
                  style={{ cursor: 'pointer', textAlign: 'center' }}
                  onClick={() => setSelectedBuilding(b)}
                >
                  <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{b.icon}</div>
                  <div className="font-bold text-sm">{b.name.split(' - ')[0]}</div>
                  <div className="text-xs text-light mt-4">{b.name.split(' - ')[1]}</div>
                  {state.player.buildingId === b.id && (
                    <span className="badge badge-secondary" style={{ marginTop: '8px' }}>📍 我的家</span>
                  )}
                  <div className="flex-center gap-4 mt-8">
                    {residentsByBuilding[b.id]?.map((n, i) => (
                      <span key={i} title={n} style={{ fontSize: '1rem' }}>
                        {['👵', '👴', '👩', '👨'][i]}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-3 gap-12" style={{ marginTop: '30px' }}>
              {state.facilities.map(f => (
                <div
                  key={f.id}
                  className="card"
                  style={{
                    marginBottom: 0,
                    padding: '12px',
                    textAlign: 'center',
                    background: f.votes > 0
                      ? 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(245,158,11,0.1))'
                      : 'rgba(255,255,255,0.8)',
                    cursor: 'pointer',
                    border: f.votes > 0 ? '2px solid #f59e0b' : '2px solid transparent',
                  }}
                  onClick={() => setSelectedFacility(f)}
                >
                  <div style={{ fontSize: '2rem' }}>{f.icon}</div>
                  <div className="text-sm font-bold mt-4">{f.name}</div>
                  <div className="text-xs text-light mt-4">
                    {f.votes > 0 ? `${f.votes} 票` : '未建设'}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ position: 'absolute', bottom: '20px', right: '20px', display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '2.5rem' }}>🌳🌲🌴</div>
              <div style={{ fontSize: '2.5rem' }}>🏞️</div>
              <div style={{ fontSize: '2.5rem' }}>🚗</div>
            </div>
          </div>

          <h3 className="card-title">🌿 区域设施状态</h3>
          <div className="grid grid-5 gap-12">
            <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', background: '#fef3c7' }}>
              <div style={{ fontSize: '2rem' }}>🅿️</div>
              <div className="text-xs font-bold mt-4">停车场</div>
              <div className="text-xs text-light">正常开放</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', background: '#d1fae5' }}>
              <div style={{ fontSize: '2rem' }}>🏪</div>
              <div className="text-xs font-bold mt-4">便利店</div>
              <div className="text-xs text-light">24小时营业</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', background: '#dbeafe' }}>
              <div style={{ fontSize: '2rem' }}>📦</div>
              <div className="text-xs font-bold mt-4">快递柜</div>
              <div className="text-xs text-light">正常使用</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', background: '#fce7f3' }}>
              <div style={{ fontSize: '2rem' }}>🏥</div>
              <div className="text-xs font-bold mt-4">社区诊所</div>
              <div className="text-xs text-light">9:00-20:00</div>
            </div>
            <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center', background: '#e0e7ff' }}>
              <div style={{ fontSize: '2rem' }}>🗑️</div>
              <div className="text-xs font-bold mt-4">垃圾站</div>
              <div className="text-xs text-light">分类投放</div>
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">🗳️ 公共设施投票</h2>
          <p className="text-sm text-light mb-16">
            投票决定小区下一个要建设的公共设施，每投一票声望+1！
          </p>

          {totalVotes > 0 && (
            <div className="mb-16">
              <div className="text-xs text-light mb-4">当前总票数：{totalVotes}</div>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            {state.facilities.map(f => {
              const percent = totalVotes > 0 ? Math.round((f.votes / totalVotes) * 100) : 0
              return (
                <div key={f.id} className="mb-12">
                  <div className="flex-between mb-4">
                    <span className="text-sm">
                      <span style={{ fontSize: '1.1rem' }}>{f.icon}</span> {f.name}
                    </span>
                    <span className="text-xs text-light">{f.votes}票 ({percent}%)</span>
                  </div>
                  <div className="progress-bar mb-4">
                    <div className="progress-fill progress-fill-green" style={{ width: percent + '%' }}></div>
                  </div>
                  <div className="text-xs text-light mb-8" style={{ marginBottom: '12px' }}>{f.description} · 预计投入 {f.cost} 声望</div>
                  <button
                    className="btn btn-sm btn-outline"
                    style={{ width: '100%' }}
                    onClick={() => dispatch({ type: 'VOTE_FACILITY', payload: f.id })}
                  >
                    🗳️ 投一票
                  </button>
                </div>
              )
            })}
          </div>

          <div className="divider"></div>

          <h3 className="card-title" style={{ fontSize: '1rem' }}>👥 居民好感度</h3>
          <div className="scroll-container" style={{ maxHeight: '200px' }}>
            {Object.entries(state.relationships).map(([name, value]) => (
              <div key={name} className="mb-8">
                <div className="flex-between mb-4">
                  <span className="text-sm">{name}</span>
                  <span className={`text-xs ${value >= 70 ? 'text-secondary' : value >= 40 ? 'text-accent' : 'text-danger'}`}>
                    {value}%
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: value + '%',
                      background: value >= 70
                        ? 'linear-gradient(90deg, #34d399, #10b981)'
                        : value >= 40
                          ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                          : 'linear-gradient(90deg, #fca5a5, #ef4444)',
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selectedBuilding && (
        <div className="modal-overlay" onClick={() => setSelectedBuilding(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedBuilding.icon} {selectedBuilding.name}</h2>
              <button className="close-btn" onClick={() => setSelectedBuilding(null)}>×</button>
            </div>
            <p className="text-light mb-16">{selectedBuilding.description}</p>

            <h3 className="font-bold mb-8">🏠 住户名单</h3>
            <div className="mb-16">
              {residentsByBuilding[selectedBuilding.id]?.map((n, i) => (
                <div key={i} className="flex-between mb-8" style={{ padding: '10px', background: 'var(--bg)', borderRadius: '8px' }}>
                  <div className="flex gap-8" style={{ alignItems: 'center' }}>
                    <div className="avatar avatar-sm">{['👵', '👴', '👩', '👨'][i]}</div>
                    <div>
                      <div className="font-bold text-sm">{n}</div>
                      <div className="text-xs text-light">邻居 · 好感度 {state.relationships[n] || 0}%</div>
                    </div>
                  </div>
                  {state.relationships[n] >= 70 ? (
                    <span className="badge badge-secondary">❤️ 好友</span>
                  ) : state.relationships[n] >= 40 ? (
                    <span className="badge badge-accent">👋 熟悉</span>
                  ) : (
                    <span className="badge badge-primary">🙂 认识</span>
                  )}
                </div>
              ))}
              {state.player.buildingId === selectedBuilding.id && (
                <div className="flex-between mb-8" style={{ padding: '10px', background: 'rgba(16,185,129,0.1)', borderRadius: '8px', border: '2px solid var(--secondary)' }}>
                  <div className="flex gap-8" style={{ alignItems: 'center' }}>
                    <div className="avatar avatar-sm">{state.player.avatar}</div>
                    <div>
                      <div className="font-bold text-sm">{state.player.name} (我)</div>
                      <div className="text-xs text-light">房主</div>
                    </div>
                  </div>
                  <span className="badge badge-secondary">🏠 在此居住</span>
                </div>
              )}
            </div>

            <div className="flex gap-12">
              <button
                className="btn btn-outline"
                style={{ flex: 1 }}
                onClick={() => {
                  const randomNpc = residentsByBuilding[selectedBuilding.id][0]
                  if (randomNpc) {
                    dispatch({
                      type: 'ADD_LOG',
                      payload: { type: 'success', message: `和 ${randomNpc} 打了招呼，好感度提升！`, time: Date.now() },
                    })
                  }
                  setSelectedBuilding(null)
                }}
              >
                👋 打招呼
              </button>
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={state.player.buildingId === selectedBuilding.id}
                onClick={() => {
                  dispatch({
                    type: 'ADD_LOG',
                    payload: { type: 'post', message: `前往 ${selectedBuilding.name} 串门！`, time: Date.now() },
                  })
                  setSelectedBuilding(null)
                }}
              >
                🚪 串门拜访
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedFacility && (
        <div className="modal-overlay" onClick={() => setSelectedFacility(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedFacility.icon} {selectedFacility.name}</h2>
              <button className="close-btn" onClick={() => setSelectedFacility(null)}>×</button>
            </div>
            <div style={{ textAlign: 'center', padding: '30px', background: 'linear-gradient(135deg, #fef3c7, #fde68a)', borderRadius: 'var(--radius)', marginBottom: '20px' }}>
              <div style={{ fontSize: '5rem' }}>{selectedFacility.icon}</div>
            </div>
            <p className="text-light mb-12">{selectedFacility.description}</p>
            <div className="grid grid-2 gap-12 mb-16">
              <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                <div className="text-xs text-light mb-4">当前票数</div>
                <div className="font-bold text-primary" style={{ fontSize: '1.5rem' }}>{selectedFacility.votes}</div>
              </div>
              <div className="card" style={{ marginBottom: 0, padding: '14px', textAlign: 'center' }}>
                <div className="text-xs text-light mb-4">预计投入</div>
                <div className="font-bold text-accent" style={{ fontSize: '1.5rem' }}>{selectedFacility.cost}</div>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: '100%' }}
              onClick={() => {
                dispatch({ type: 'VOTE_FACILITY', payload: selectedFacility.id })
                setSelectedFacility(null)
              }}
            >
              🗳️ 为此设施投票
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
