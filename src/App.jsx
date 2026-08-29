import React, { useState } from 'react'

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px' }}>
      <div style={{ marginBottom: '20px', borderBottom: '2px solid #ccc', paddingBottom: '10px' }}>
        <h1>🧵 Bosami Batik - Production Dashboard</h1>
        <p>Simple test version - React initialized successfully!</p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('dashboard')} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer', background: activeTab === 'dashboard' ? '#3b82f6' : '#e5e7eb', color: activeTab === 'dashboard' ? 'white' : 'black', border: 'none', borderRadius: '4px' }}>
          📊 Dashboard
        </button>
        <button onClick={() => setActiveTab('forms')} style={{ marginRight: '10px', padding: '10px 20px', cursor: 'pointer', background: activeTab === 'forms' ? '#3b82f6' : '#e5e7eb', color: activeTab === 'forms' ? 'white' : 'black', border: 'none', borderRadius: '4px' }}>
          📋 Forms
        </button>
        <button onClick={() => setActiveTab('vendors')} style={{ padding: '10px 20px', cursor: 'pointer', background: activeTab === 'vendors' ? '#3b82f6' : '#e5e7eb', color: activeTab === 'vendors' ? 'white' : 'black', border: 'none', borderRadius: '4px' }}>
          👥 Vendors
        </button>
      </div>

      <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
        {activeTab === 'dashboard' && (
          <div>
            <h2>📊 Dashboard</h2>
            <p>✅ React is working!</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginTop: '20px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#999', marginBottom: '10px' }}>Total Produksi</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>0</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#999', marginBottom: '10px' }}>Batch Selesai</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>0</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#999', marginBottom: '10px' }}>Defect Rate</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#ef4444' }}>0%</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ color: '#999', marginBottom: '10px' }}>Batch Aktif</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>0</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'forms' && (
          <div>
            <h2>📋 Forms</h2>
            <p>✅ Dashboard navigasi bekerja!</p>
            <p>Klik tab lain untuk testing...</p>
          </div>
        )}

        {activeTab === 'vendors' && (
          <div>
            <h2>👥 Vendors</h2>
            <p>✅ Vercel deployment SUCCESS!</p>
            <p style={{ marginTop: '10px', padding: '10px', background: '#dcfce7', borderRadius: '4px', color: '#166534' }}>
              🎉 Dashboard sudah LIVE dan bisa di-akses! Selanjutnya: integrate Supabase & add semua fitur.
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#ede9fe', borderRadius: '8px', borderLeft: '4px solid #a78bfa' }}>
        <p style={{ margin: 0, color: '#6b21a8' }}>
          ✅ <strong>MILESTONE:</strong> Dashboard sudah live di Vercel! React initialization SUCCESS!
        </p>
      </div>
    </div>
  )
}
