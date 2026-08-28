import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, ChevronDown, Menu, X, Plus, Trash2, Eye, Edit } from 'lucide-react';

// Supabase Config
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export default function BosamiDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Dashboard state
  const [kpiData, setKpiData] = useState({
    totalProduction: 0,
    completedBatches: 0,
    defectRate: 0,
    activeBatches: 0
  });
  
  // Form state
  const [formData, setFormData] = useState({
    kainPurchase: { supplier: '', quantity: '', price: '', shippingCost: '' },
    cuttingBatch: { vendor: '', quantity: '', cost: '' },
    batikBatch: { vendor: '', quantity: '', motif: '', cost: '' },
    jahitBatch: { vendor: '', quantity: '', productType: '', cost: '' },
    qcBatch: { batchId: '', passCount: '', rejectCount: '', notes: '' }
  });

  // Vendor state
  const [vendors, setVendors] = useState([]);
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendor, setNewVendor] = useState({
    type: 'cutting',
    name: '',
    alamat: '',
    hp: '',
    paymentMethod: '',
    bankName: '',
    accountName: '',
    accountNumber: '',
    contactPerson: '',
    leadTime: 5
  });

  // Load KPI data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [kain, cutting, batik, jahit, qc] = await Promise.all([
        supabase.from('kain_purchases').select('id'),
        supabase.from('cutting_batches').select('id'),
        supabase.from('batik_batches').select('id'),
        supabase.from('jahit_batches').select('id'),
        supabase.from('final_qc_batches').select('id')
      ]);

      setKpiData({
        totalProduction: (kain.data?.length || 0) + (cutting.data?.length || 0),
        completedBatches: (batik.data?.length || 0) + (jahit.data?.length || 0),
        defectRate: 2.3,
        activeBatches: (qc.data?.length || 0)
      });
      
      loadVendors();
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const [cutting, batik, jahit] = await Promise.all([
        supabase.from('cutting_vendors').select('*').eq('status', 'aktif'),
        supabase.from('batik_vendors').select('*').eq('status', 'aktif'),
        supabase.from('jahit_vendors').select('*').eq('status', 'aktif')
      ]);

      const allVendors = [
        ...(cutting.data || []).map(v => ({ ...v, type: 'cutting' })),
        ...(batik.data || []).map(v => ({ ...v, type: 'batik' })),
        ...(jahit.data || []).map(v => ({ ...v, type: 'jahit' }))
      ];

      setVendors(allVendors);
    } catch (error) {
      console.error('Error loading vendors:', error);
    }
  };

  const handleAddVendor = async () => {
    if (!newVendor.name || !newVendor.type) {
      alert('Nama vendor & tipe harus diisi!');
      return;
    }

    try {
      const table = {
        cutting: 'cutting_vendors',
        batik: 'batik_vendors',
        jahit: 'jahit_vendors'
      }[newVendor.type];

      await supabase.from(table).insert([{
        vendor_name: newVendor.name,
        alamat: newVendor.alamat,
        hp: newVendor.hp,
        payment_method: newVendor.paymentMethod,
        bank_name: newVendor.bankName,
        account_name: newVendor.accountName,
        rekening_ewallet: newVendor.accountNumber,
        contact_person: newVendor.contactPerson,
        lead_time_days: newVendor.leadTime,
        quality_rating: 4,
        status: 'aktif'
      }]);

      alert('Vendor berhasil ditambahkan!');
      setShowAddVendor(false);
      setNewVendor({
        type: 'cutting',
        name: '',
        alamat: '',
        hp: '',
        paymentMethod: '',
        bankName: '',
        accountName: '',
        accountNumber: '',
        contactPerson: '',
        leadTime: 5
      });
      loadVendors();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleRemoveVendor = async (vendorId, vendorType) => {
    if (!confirm('Hapus vendor ini (soft delete)?')) return;

    try {
      const table = {
        cutting: 'cutting_vendors',
        batik: 'batik_vendors',
        jahit: 'jahit_vendors'
      }[vendorType];

      await supabase.from(table)
        .update({ status: 'tidak aktif' })
        .eq('id', vendorId);

      alert('Vendor berhasil dinonaktifkan');
      loadVendors();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleFormInputChange = (tab, field, value) => {
    setFormData(prev => ({
      ...prev,
      [tab]: { ...prev[tab], [field]: value }
    }));
  };

  const submitForm = async (formType) => {
    try {
      const data = formData[formType];
      
      if (formType === 'kainPurchase') {
        await supabase.from('kain_purchases').insert([{
          supplier_id: 1,
          quantity_yard: parseFloat(data.quantity),
          price_per_unit: parseFloat(data.price),
          shipping_cost: parseFloat(data.shippingCost || 0),
          purchase_date: new Date().toISOString(),
          status: 'terima'
        }]);
      } else if (formType === 'cuttingBatch') {
        await supabase.from('cutting_batches').insert([{
          kain_purchase_id: 1,
          cutting_vendor_id: parseInt(data.vendor),
          total_kodi: parseFloat(data.quantity),
          cost_per_kodi: parseFloat(data.cost),
          cutting_date: new Date().toISOString(),
          status: 'potong'
        }]);
      } else if (formType === 'batikBatch') {
        await supabase.from('batik_batches').insert([{
          cutting_batch_id: 1,
          batik_vendor_id: parseInt(data.vendor),
          motif: data.motif,
          quantity_lembar: parseFloat(data.quantity),
          cost_per_lembar: parseFloat(data.cost),
          send_date: new Date().toISOString(),
          status: 'proses'
        }]);
      }

      alert('Data berhasil tersimpan!');
      setFormData(prev => ({
        ...prev,
        [formType]: Object.keys(prev[formType]).reduce((a, k) => ({ ...a, [k]: '' }), {})
      }));
      loadDashboardData();
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0 lg:w-64'} bg-gray-900 text-white transition-all duration-300 overflow-hidden`}>
        <div className="p-4">
          <h1 className="text-xl font-bold mb-8">🧵 Bosami System</h1>
          <nav className="space-y-3">
            {[
              { id: 'dashboard', label: '📊 Dashboard', icon: '📊' },
              { id: 'forms', label: '📋 Forms', icon: '📋' },
              { id: 'vendors', label: '👥 Vendors', icon: '👥' },
              { id: 'reports', label: '📈 Reports', icon: '📈' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                className={`w-full text-left px-4 py-2 rounded ${activeTab === item.id ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden text-gray-600"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-2xl font-bold text-gray-900">Bosami Batik - Production System</h2>
          <div className="text-sm text-gray-500">{new Date().toLocaleDateString('id-ID')}</div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="p-6 space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Produksi', value: kpiData.totalProduction, color: 'blue' },
                  { label: 'Batch Selesai', value: kpiData.completedBatches, color: 'green' },
                  { label: 'Defect Rate', value: kpiData.defectRate + '%', color: 'red' },
                  { label: 'Batch Aktif', value: kpiData.activeBatches, color: 'yellow' }
                ].map((kpi, i) => (
                  <div key={i} className="bg-white rounded-lg shadow p-6">
                    <p className="text-gray-600 text-sm mb-2">{kpi.label}</p>
                    <p className={`text-3xl font-bold text-${kpi.color}-600`}>{kpi.value}</p>
                  </div>
                ))}
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Produksi Mingguan</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={[
                      { name: 'Min 1', value: 120 },
                      { name: 'Min 2', value: 140 },
                      { name: 'Min 3', value: 130 },
                      { name: 'Min 4', value: 150 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold mb-4">Status Batch</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Proses', value: 45 },
                          { name: 'Selesai', value: 35 },
                          { name: 'Cacat', value: 20 }
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                      >
                        <Cell fill="#3b82f6" />
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Forms Tab */}
          {activeTab === 'forms' && (
            <div className="p-6 space-y-6">
              {/* Kain Purchase Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Kain Purchase</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input
                    type="number"
                    placeholder="Qty (yard)"
                    value={formData.kainPurchase.quantity}
                    onChange={(e) => handleFormInputChange('kainPurchase', 'quantity', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Price/unit"
                    value={formData.kainPurchase.price}
                    onChange={(e) => handleFormInputChange('kainPurchase', 'price', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Shipping Cost"
                    value={formData.kainPurchase.shippingCost}
                    onChange={(e) => handleFormInputChange('kainPurchase', 'shippingCost', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <button
                    onClick={() => submitForm('kainPurchase')}
                    className="bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Cutting Batch Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Cutting Batch</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={formData.cuttingBatch.vendor}
                    onChange={(e) => handleFormInputChange('cuttingBatch', 'vendor', e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.filter(v => v.type === 'cutting').map(v => (
                      <option key={v.id} value={v.id}>{v.vendor_name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Qty (kodi)"
                    value={formData.cuttingBatch.quantity}
                    onChange={(e) => handleFormInputChange('cuttingBatch', 'quantity', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Cost/kodi"
                    value={formData.cuttingBatch.cost}
                    onChange={(e) => handleFormInputChange('cuttingBatch', 'cost', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <button
                    onClick={() => submitForm('cuttingBatch')}
                    className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700"
                  >
                    Save
                  </button>
                </div>
              </div>

              {/* Batik Batch Form */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Batik Batch</h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <select
                    value={formData.batikBatch.vendor}
                    onChange={(e) => handleFormInputChange('batikBatch', 'vendor', e.target.value)}
                    className="border rounded px-3 py-2"
                  >
                    <option value="">Select Vendor</option>
                    {vendors.filter(v => v.type === 'batik').map(v => (
                      <option key={v.id} value={v.id}>{v.vendor_name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Motif"
                    value={formData.batikBatch.motif}
                    onChange={(e) => handleFormInputChange('batikBatch', 'motif', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Qty (lembar)"
                    value={formData.batikBatch.quantity}
                    onChange={(e) => handleFormInputChange('batikBatch', 'quantity', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Cost/lembar"
                    value={formData.batikBatch.cost}
                    onChange={(e) => handleFormInputChange('batikBatch', 'cost', e.target.value)}
                    className="border rounded px-3 py-2"
                  />
                  <button
                    onClick={() => submitForm('batikBatch')}
                    className="bg-purple-600 text-white rounded px-4 py-2 hover:bg-purple-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Vendors Tab */}
          {activeTab === 'vendors' && (
            <div className="p-6 space-y-6">
              {/* Add Vendor */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Vendor Management</h3>
                  <button
                    onClick={() => setShowAddVendor(!showAddVendor)}
                    className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
                  >
                    <Plus size={18} /> Add Vendor
                  </button>
                </div>

                {showAddVendor && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded">
                    <select
                      value={newVendor.type}
                      onChange={(e) => setNewVendor({...newVendor, type: e.target.value})}
                      className="border rounded px-3 py-2"
                    >
                      <option value="cutting">Cutting</option>
                      <option value="batik">Batik</option>
                      <option value="jahit">Jahit</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Vendor Name"
                      value={newVendor.name}
                      onChange={(e) => setNewVendor({...newVendor, name: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Alamat"
                      value={newVendor.alamat}
                      onChange={(e) => setNewVendor({...newVendor, alamat: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="HP"
                      value={newVendor.hp}
                      onChange={(e) => setNewVendor({...newVendor, hp: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Bank/E-wallet"
                      value={newVendor.bankName}
                      onChange={(e) => setNewVendor({...newVendor, bankName: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Account Name"
                      value={newVendor.accountName}
                      onChange={(e) => setNewVendor({...newVendor, accountName: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Account Number"
                      value={newVendor.accountNumber}
                      onChange={(e) => setNewVendor({...newVendor, accountNumber: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Contact Person"
                      value={newVendor.contactPerson}
                      onChange={(e) => setNewVendor({...newVendor, contactPerson: e.target.value})}
                      className="border rounded px-3 py-2"
                    />
                    <input
                      type="number"
                      placeholder="Lead Time (days)"
                      value={newVendor.leadTime}
                      onChange={(e) => setNewVendor({...newVendor, leadTime: parseInt(e.target.value)})}
                      className="border rounded px-3 py-2"
                    />
                    <button
                      onClick={handleAddVendor}
                      className="bg-green-600 text-white rounded px-4 py-2 hover:bg-green-700 md:col-span-2"
                    >
                      Save Vendor
                    </button>
                  </div>
                )}
              </div>

              {/* Vendor Lists */}
              {['cutting', 'batik', 'jahit'].map(type => (
                <div key={type} className="bg-white rounded-lg shadow p-6">
                  <h4 className="text-md font-semibold mb-4 capitalize">{type} Vendors</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left">Name</th>
                          <th className="px-4 py-2 text-left">Alamat</th>
                          <th className="px-4 py-2 text-left">HP</th>
                          <th className="px-4 py-2 text-left">Bank</th>
                          <th className="px-4 py-2 text-left">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vendors.filter(v => v.type === type).map(vendor => (
                          <tr key={vendor.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-2">{vendor.vendor_name}</td>
                            <td className="px-4 py-2">{vendor.alamat}</td>
                            <td className="px-4 py-2">{vendor.hp}</td>
                            <td className="px-4 py-2">{vendor.bank_name}</td>
                            <td className="px-4 py-2">
                              <button
                                onClick={() => handleRemoveVendor(vendor.id, type)}
                                className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <Trash2 size={16} /> Deactivate
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">📊 Production Report</h3>
                <p className="text-gray-600">Report section - coming soon</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
