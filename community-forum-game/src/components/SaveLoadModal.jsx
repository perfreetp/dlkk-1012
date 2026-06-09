import React from 'react'

export default function SaveLoadModal({ onClose, onSave, onLoad }) {
  const hasSave = typeof localStorage !== 'undefined' && localStorage.getItem('community_forum_save')

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">💾 存档管理</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="grid grid-2 gap-16">
          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title">📥 保存游戏</h3>
            <p className="text-sm text-light mb-16">
              将当前游戏进度保存到本地存储中，下次可以继续游戏。
            </p>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={onSave}>
              💾 立即存档
            </button>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <h3 className="card-title">📤 读取存档</h3>
            <p className="text-sm text-light mb-16">
              {hasSave ? '检测到已保存的游戏进度，可以读取继续。' : '暂未发现保存的游戏进度。'}
            </p>
            <button
              className="btn btn-secondary"
              style={{ width: '100%' }}
              disabled={!hasSave}
              onClick={onLoad}
            >
              📂 读取存档
            </button>
          </div>
        </div>

        <div className="divider"></div>
        <p className="text-xs text-light text-center">
          提示：存档保存在浏览器本地，清理浏览器数据会导致存档丢失。
        </p>
      </div>
    </div>
  )
}
