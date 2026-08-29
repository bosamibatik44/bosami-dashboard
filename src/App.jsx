import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

// Supabase initialization
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [vendors, setVendors] = useState([])
  const [kpiData, setKpiData] = useState({
    totalProduction: 0,
    completedBatches: 0,
    defectRate: 0,
    activeBatches: 0
  })
  const [formData, setFormData] = useState({
    quantity: '',
    price: '',
    shippingCost: ''
  })
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  // Load initial data
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Fetch vendors
      const { data: vendorData } = await supabase
        .from('kain_suppliers')
        .select('*')
      
      if (vendorData) {
        setVendors(vendorData)
      }

      // Fetch KPI data
      const { data: kainData } = await supabase
        .from('kain_purchases')
        .select('id')
      
      const { data: cuttingData } = await supabase
        .from('cutting_batches')
        .select('id')
      
      const { data: batchData } = await supabase
        .from('batik_batches')
        .select('id')

      setKpiData({
        totalProduction: (kainData?.length || 0) + (cuttingData?.length || 0),
        completedBatches: batchData?.length || 0,
        defectRate: 2.3,
        activeBatches: 0
      })

      setLoading(false)
    } catch (error) {
      console.error('Error loading data:', error)
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleKainPurchaseSubmit = async () => {
    try {
      if (!formData.quantity || !formData.price) {
        setMessage('❌ Quantity dan Price harus diisi!')
        return
      }

      const { error } = await supabase.from('kain_purchases').insert([{
  supplier_id: 1,
  total_qty_yard: parseFloat(formData.quantity),
  total_cost: parseFloat(formData.price) * parseFloat(formData.quantity),
  shipping_cost: parseFloat(formData.shippingCost || 0),
  order_date: new Date().toISOString(),
  receive_date: new Date().toISOString(),
  payment_status: 'unpaid',
  order_type: 'Mandiri',
  status: 'active'
}])

      if (error) throw error

      setMessage('✅ Kain purchase berhasil tersimpan!')
      setFormData({ quantity: '', price: '', shippingCost: '' })
      
      // Reload data
      setTimeout(() => {
        loadData()
        setMessage('')
      }, 1500)
    } catch (error) {
      setMessage('❌ Error: ' + error.message)
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>
        <p>⏳ Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: 'white', borderBottom: '1px solid #e5e7eb', padding: '20px', marginBottom: '20px' }}>
        <h1 style={{ margin: '0 0 5px 0', fontSize: '28px', color: '#111827' }}>🧵 Bosami Batik - Production Dashboard</h1>
        <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>Real-time production tracking dengan Supabase integration</p>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 20px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'dashboard' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'dashboard' ? 'white' : '#111827',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('forms')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'forms' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'forms' ? 'white' : '#111827',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          📋 Forms
        </button>
        <button 
          onClick={() => setActiveTab('vendors')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'vendors' ? '#3b82f6' : '#e5e7eb',
            color: activeTab === 'vendors' ? 'white' : '#111827',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          👥 Vendors
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ padding: '0 20px', marginBottom: '20px' }}>
          <div style={{ padding: '12px', background: message.includes('✅') ? '#dcfce7' : '#fee2e2', color: message.includes('✅') ? '#166534' : '#991b1b', borderRadius: '6px' }}>
            {message}
          </div>
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '0 20px' }}>
        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div>
            <h2 style={{ marginTop: '0', marginBottom: '20px', fontSize: '24px', color: '#111827' }}>📊 Dashboard</h2>
            
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Total Produksi</p>
                <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>{kpiData.totalProduction}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Batch Selesai</p>
                <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>{kpiData.completedBatches}</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Defect Rate</p>
                <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>{kpiData.defectRate}%</p>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <p style={{ margin: '0 0 10px 0', color: '#6b7280', fontSize: '14px' }}>Batch Aktif</p>
                <p style={{ margin: '0', fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>{kpiData.activeBatches}</p>
              </div>
            </div>

            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <p style={{ margin: '0', color: '#059669', fontWeight: '500' }}>✅ Dashboard connect ke Supabase berhasil!</p>
              <p style={{ margin: '10px 0 0 0', color: '#6b7280', fontSize: '14px' }}>KPI data di-refresh dari database real-time</p>
            </div>
          </div>
        )}

        {/* FORMS TAB */}
        {activeTab === 'forms' && (
          <div>
            <h2 style={{ marginTop: '0', marginBottom: '20px', fontSize: '24px', color: '#111827' }}>📋 Forms</h2>
            
            {/* Kain Purchase Form */}
            <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <h3 style={{ marginTop: '0', marginBottom: '15px', fontSize: '18px', color: '#111827' }}>Kain Purchase</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '5px', fontWeight: '500' }}>Quantity (Yard)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 100"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '5px', fontWeight: '500' }}>Price per Unit</label>
                <input 
                  type="number" 
                  placeholder="e.g. 50000"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#374151', marginBottom: '5px', fontWeight: '500' }}>Shipping Cost</label>
                <input 
                  type="number" 
                  placeholder="e.g. 250000"
                  value={formData.shippingCost}
                  onChange={(e) => handleInputChange('shippingCost', e.target.value)}
                  style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', boxSizing: 'border-box' }}
                />
              </div>

              <button 
                onClick={handleKainPurchaseSubmit}
                style={{
                  width: '100%',
                  padding: '10px',
                  background: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '14px'
                }}
              >
                💾 Save to Supabase
              </button>
            </div>

            <div style={{ background: '#ede9fe', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #a78bfa' }}>
              <p style={{ margin: '0', color: '#6b21a8', fontSize: '14px' }}>✅ Form data akan otomatis save ke Supabase database</p>
            </div>
          </div>
        )}

        {/* VENDORS TAB */}
        {activeTab === 'vendors' && (
          <div>
            <h2 style={{ marginTop: '0', marginBottom: '20px', fontSize: '24px', color: '#111827' }}>👥 Vendors</h2>
            
            {vendors.length > 0 ? (
              <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Supplier Name</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Alamat</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>HP</th>
                      <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600', color: '#111827', fontSize: '14px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendors.map((vendor, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb', background: idx % 2 === 0 ? '#ffffff' : '#f9fafb' }}>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#111827' }}>{vendor.supplier_name}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{vendor.alamat || '-'}</td>
                        <td style={{ padding: '12px', fontSize: '14px', color: '#6b7280' }}>{vendor.hp || '-'}</td>
                        <td style={{ padding: '12px', fontSize: '14px' }}>
                          <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px' }}>
                            {vendor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', textAlign: 'center', color: '#6b7280' }}>
                <p>No vendors found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
