import React, { useState, useEffect, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, ArrowRight, Package, User, Building2, Calendar, DollarSign,
  FileText, CheckCircle2, ShoppingBag, Truck, AlertCircle, X, Check, Plus
} from 'lucide-react';

import api from '../../api.js';

const fmtMoney = (v) => `₺${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;

const STEPS = [
  { id: 1, title: 'Ürün Bilgileri', icon: Package, desc: 'Sipariş başlığı ve açıklaması' },
  { id: 2, title: 'Taraflar', icon: User, desc: 'Tedarikçi ve firma seçimi' },
  { id: 3, title: 'Fiyat & Tarih', icon: DollarSign, desc: 'Adet, fiyat ve tarih bilgileri' },
  { id: 4, title: 'Önizleme', icon: CheckCircle2, desc: 'Kontrol et ve onayla' },
];

const CreateOrder = memo(() => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [firms, setFirms] = useState([]);
  const [success, setSuccess] = useState(null);

  const [form, setForm] = useState({
    title: '', description: '', category: '', productType: '', supplierId: '', firmId: '',
    quantity: 1, unitPrice: '', currency: 'TRY',
    orderDate: new Date().toISOString().slice(0, 10), deliveryDate: '', notes: '',
  });

  const CATEGORIES = [
    { id: 'fabric', label: 'Kumaş', icon: '🧵', desc: 'Mayo, bikini, tekstil kumaşları', color: '#8b5cf6', products: [
      { id: 'likra', name: 'Likralı Mayo Kumaş', unit: 'metre' },
      { id: 'polyamid', name: 'Polyamid Kumaş', unit: 'metre' },
      { id: 'pamuk', name: 'Pamuklu Kumaş', unit: 'metre' },
      { id: 'polyester', name: 'Polyester Kumaş', unit: 'metre' },
      { id: 'saten', name: 'Saten Kumaş', unit: 'metre' },
      { id: 'file', name: 'File Kumaş', unit: 'metre' },
      { id: 'kadife', name: 'Kadife Kumaş', unit: 'metre' },
      { id: 'diger-kumas', name: 'Diğer Kumaş', unit: 'metre' },
    ]},
    { id: 'yarn', label: 'İplik', icon: '🪡', desc: 'Polyester, pamuk, likra iplik', color: '#3b82f6', products: [
      { id: 'polyester-iplik', name: 'Polyester İplik', unit: 'kg' },
      { id: 'pamuk-iplik', name: 'Pamuk İplik', unit: 'kg' },
      { id: 'likra-iplik', name: 'Likra (Elastan) İplik', unit: 'kg' },
      { id: 'naylon-iplik', name: 'Naylon İplik', unit: 'kg' },
      { id: 'karisim', name: 'Karışım İplik', unit: 'kg' },
      { id: 'diger-iplik', name: 'Diğer İplik', unit: 'kg' },
    ]},
    { id: 'dye', label: 'Boya & Kimya', icon: '🎨', desc: 'Reaktif boya, apre, yumuşatıcı', color: '#E81E25', products: [
      { id: 'reaktif-boya', name: 'Reaktif Boya', unit: 'kg' },
      { id: 'dispers-boya', name: 'Dispers Boya', unit: 'kg' },
      { id: 'apre', name: 'Apre Kimyasalı', unit: 'kg' },
      { id: 'yumusatici', name: 'Yumuşatıcı', unit: 'litre' },
      { id: 'agartici', name: 'Ağartıcı', unit: 'litre' },
      { id: 'diger-kimya', name: 'Diğer Kimyasal', unit: 'kg' },
    ]},
    { id: 'accessory', label: 'Aksesuar', icon: '📎', desc: 'Toka, halka, klips, fermuar', color: '#f59e0b', products: [
      { id: 'toka', name: 'Toka / Klips', unit: 'adet' },
      { id: 'halka', name: 'Halka / Ring', unit: 'adet' },
      { id: 'fermuar', name: 'Fermuar', unit: 'adet' },
      { id: 'dugme', name: 'Düğme / Çıtçıt', unit: 'adet' },
      { id: 'ip-bant', name: 'İp / Şerit / Bant', unit: 'metre' },
      { id: 'lastik', name: 'Lastik', unit: 'metre' },
      { id: 'diger-aksesuar', name: 'Diğer Aksesuar', unit: 'adet' },
    ]},
    { id: 'label', label: 'Etiket & Ambalaj', icon: '🏷️', desc: 'Marka etiketi, hang tag, kutu', color: '#06b6d4', products: [
      { id: 'marka-etiketi', name: 'Marka Etiketi', unit: 'adet' },
      { id: 'yikama-etiketi', name: 'Yıkama Talimat Etiketi', unit: 'adet' },
      { id: 'hang-tag', name: 'Hang Tag / Fiyat Etiketi', unit: 'adet' },
      { id: 'poset', name: 'Poşet / OPP Ambalaj', unit: 'adet' },
      { id: 'kutu', name: 'Karton Kutu', unit: 'adet' },
      { id: 'bant-ambalaj', name: 'Koli Bandı / Streç', unit: 'adet' },
      { id: 'diger-ambalaj', name: 'Diğer Ambalaj', unit: 'adet' },
    ]},
    { id: 'logistics', label: 'Lojistik', icon: '🚛', desc: 'Kargo, nakliye, depolama', color: '#10b981', products: [
      { id: 'yurtici-kargo', name: 'Yurt İçi Kargo', unit: 'sefer' },
      { id: 'yurtdisi-kargo', name: 'Yurt Dışı Kargo', unit: 'sefer' },
      { id: 'nakliye', name: 'Nakliye / Taşımacılık', unit: 'sefer' },
      { id: 'depolama', name: 'Depolama Hizmeti', unit: 'ay' },
      { id: 'gumruk', name: 'Gümrükleme Hizmeti', unit: 'sefer' },
      { id: 'diger-lojistik', name: 'Diğer Lojistik', unit: 'sefer' },
    ]},
    { id: 'other', label: 'Diğer', icon: '📦', desc: 'Yukarıdakilere uymayan siparişler', color: '#6b7280', products: [
      { id: 'diger', name: 'Diğer Ürün/Hizmet', unit: 'adet' },
    ]},
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const [s, f] = await Promise.all([api.post('/api/partners/suppliers'), api.post('/api/firm/list')]);
        if (s.data.success) setSuppliers(s.data.data);
        if (f.data.success) setFirms(f.data.data);
      } catch {}
    };
    load();
  }, []);

  const set = useCallback((k, v) => setForm(p => ({ ...p, [k]: v })), []);
  const totalPrice = (parseInt(form.quantity) || 0) * (parseFloat(form.unitPrice) || 0);
  const selectedSupplier = suppliers.find(s => s.ID == form.supplierId);
  const selectedFirm = firms.find(f => f.ID == form.firmId);

  const canNext = () => {
    if (step === 1) return form.category && form.productType && form.title.trim().length > 0;
    if (step === 2) return true;
    if (step === 3) return true;
    return true;
  };

  const selectedCategory = CATEGORIES.find(c => c.id === form.category);
  const selectedProduct = selectedCategory?.products?.find(p => p.id === form.productType);

  const handleSubmit = useCallback(async () => {
    if (!form.title.trim()) { toast.error('Sipariş başlığı zorunludur!'); return; }
    setLoading(true);
    try {
      const r = await api.post('/api/partners/orders/create', {
        ...form,
        supplierId: form.supplierId ? parseInt(form.supplierId) : null,
        firmId: form.firmId ? parseInt(form.firmId) : null,
        quantity: parseInt(form.quantity) || 1,
        unitPrice: parseFloat(form.unitPrice) || 0,
      });
      if (r.data.success) { setSuccess(r.data.data); toast.success('Sipariş oluşturuldu!'); }
      else toast.error(r.data.message || 'Hata');
    } catch (e) { toast.error(e?.response?.data?.message || 'Hata oluştu'); }
    finally { setLoading(false); }
  }, [form]);

  const inp = { width: '100%', padding: '14px 16px', border: '2px solid #f0f0f0', borderRadius: 14, fontSize: 14, outline: 'none', transition: 'all 0.2s', background: '#fafafa', fontFamily: 'inherit' };
  const inpFocus = { borderColor: '#E81E25', background: '#fff', boxShadow: '0 0 0 4px rgba(232,30,37,0.06)' };
  const label = { display: 'block', fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 8 };

  // Başarı ekranı
  if (success) {
    return (
      <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
        <motion.div style={{ maxWidth: 560, margin: '60px auto', textAlign: 'center' }}
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <motion.div style={{ width: 88, height: 88, borderRadius: '50%', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 12px 32px rgba(16,185,129,0.3)' }}
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}>
            <CheckCircle2 size={40} color="#fff" />
          </motion.div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>Sipariş Oluşturuldu!</h2>
          <p style={{ fontSize: 14, color: '#999', margin: '0 0 8px' }}>Sipariş numaranız</p>
          <motion.p style={{ fontSize: 36, fontWeight: 800, color: '#E81E25', margin: '0 0 32px', letterSpacing: -1 }}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            {success.orderNo}
          </motion.p>

          {/* Özet Kart */}
          <div style={{ background: '#fafafa', borderRadius: 20, padding: 28, textAlign: 'left', marginBottom: 32, border: '1px solid #f0f0f0' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: '#333', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}><FileText size={16} color="#E81E25" /> Sipariş Özeti</h4>
            {[
              ['Kategori', selectedCategory ? `${selectedCategory.icon} ${selectedCategory.label}` : '-'],
              ['Ürün Çeşidi', selectedProduct?.name || '-'],
              ['Sipariş Başlığı', form.title],
              ['Tedarikçi', selectedSupplier?.NAME || '-'],
              ['Firma', selectedFirm?.NAME || '-'],
              ['Adet × Birim', `${form.quantity} × ${fmtMoney(form.unitPrice)}`],
            ].map(([l, v], i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 5 ? '1px solid #f0f0f0' : 'none' }}>
                <span style={{ fontSize: 13, color: '#888' }}>{l}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{v}</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '2px solid #e5e5e5' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a' }}>Toplam</span>
              <span style={{ fontSize: 22, fontWeight: 800, color: '#E81E25' }}>{fmtMoney(totalPrice)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setSuccess(null); setStep(1); setForm({ title: '', description: '', supplierId: '', firmId: '', quantity: 1, unitPrice: '', currency: 'TRY', orderDate: new Date().toISOString().slice(0, 10), deliveryDate: '', notes: '' }); }}
              style={{ flex: 1, padding: '14px', borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #E81E25, #be1219)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
              <Plus size={16} style={{ display: 'inline', verticalAlign: -3, marginRight: 6 }} /> Yeni Sipariş
            </button>
            <button onClick={() => navigate('/app/siparisler')}
              style={{ flex: 1, padding: '14px', borderRadius: 14, border: '2px solid #f0f0f0', background: '#fff', color: '#333', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
              Siparişlere Git
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <motion.div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button onClick={() => navigate('/app/siparisler')} style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowLeft size={18} color="#666" />
        </button>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #E81E25, #be1219)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(232,30,37,0.25)' }}>
          <ShoppingBag size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Yeni Sipariş Oluştur</h1>
          <p style={{ fontSize: 13, color: '#999', margin: '2px 0 0' }}>Adım {step}/4 — {STEPS[step - 1].desc}</p>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 24 }}>
        {/* Sol: Adım Göstergesi */}
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 24, border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', position: 'sticky', top: 24 }}>
            {STEPS.map((s, i) => {
              const isActive = step === s.id;
              const isDone = step > s.id;
              const Ic = s.icon;
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: i < 3 ? 28 : 0, cursor: isDone ? 'pointer' : 'default' }}
                  onClick={() => { if (isDone) setStep(s.id); }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: isDone ? 'linear-gradient(135deg, #10b981, #059669)' : isActive ? 'linear-gradient(135deg, #E81E25, #be1219)' : '#f5f5f5',
                      boxShadow: isActive ? '0 4px 12px rgba(232,30,37,0.25)' : isDone ? '0 4px 12px rgba(16,185,129,0.2)' : 'none',
                      transition: 'all 0.3s',
                    }}>
                      {isDone ? <Check size={18} color="#fff" /> : <Ic size={18} color={isActive ? '#fff' : '#bbb'} />}
                    </div>
                    {i < 3 && <div style={{ position: 'absolute', left: 20, top: 42, width: 2, height: 28, background: isDone ? '#10b981' : '#f0f0f0', borderRadius: 2, transition: 'background 0.3s' }} />}
                  </div>
                  <div style={{ paddingTop: 4 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: isActive ? '#E81E25' : isDone ? '#10b981' : '#aaa', margin: 0, transition: 'color 0.3s' }}>{s.title}</p>
                    <p style={{ fontSize: 11, color: '#bbb', margin: '2px 0 0' }}>{s.desc}</p>
                  </div>
                </div>
              );
            })}

            {/* Mini Özet */}
            {form.title && (
              <div style={{ marginTop: 28, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>Özet</p>
                {selectedCategory && <p style={{ fontSize: 11, color: selectedCategory.color, fontWeight: 600, margin: '0 0 2px' }}>{selectedCategory.icon} {selectedCategory.label}</p>}
                {selectedProduct && <p style={{ fontSize: 11, color: '#888', margin: '0 0 4px' }}>↳ {selectedProduct.name}</p>}
                <p style={{ fontSize: 12, color: '#666', margin: '0 0 4px' }}>{form.title}</p>
                {selectedSupplier && <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px' }}>↳ {selectedSupplier.NAME}</p>}
                {selectedFirm && <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px' }}>→ {selectedFirm.NAME}</p>}
                {totalPrice > 0 && <p style={{ fontSize: 16, fontWeight: 800, color: '#E81E25', margin: '8px 0 0' }}>{fmtMoney(totalPrice)}</p>}
              </div>
            )}
          </div>
        </motion.div>

        {/* Sağ: Form İçeriği */}
        <div>
          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}>
              <div style={{ background: '#fff', borderRadius: 20, padding: 36, border: '1px solid #f0f0f0', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', minHeight: 400 }}>

                {/* STEP 1: Ürün Bilgileri */}
                {step === 1 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Package size={18} color="#E81E25" /></div>
                      <div><h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Ürün Bilgileri</h3><p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Kategori seçin ve sipariş detaylarını girin</p></div>
                    </div>

                    {/* Kategori Seçimi */}
                    <div style={{ marginBottom: 24 }}>
                      <label style={label}>Sipariş Kategorisi *</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                        {CATEGORIES.map(cat => {
                          const selected = form.category === cat.id;
                          return (
                            <div key={cat.id} onClick={() => { set('category', cat.id); if (form.category !== cat.id) set('productType', ''); }}
                              style={{
                                padding: '16px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center',
                                border: selected ? `2px solid ${cat.color}` : '2px solid #f0f0f0',
                                background: selected ? `${cat.color}08` : '#fafafa',
                                boxShadow: selected ? `0 4px 14px ${cat.color}20` : 'none',
                                transform: selected ? 'translateY(-2px)' : 'none',
                              }}>
                              <div style={{ fontSize: 28, marginBottom: 6 }}>{cat.icon}</div>
                              <p style={{ fontSize: 12, fontWeight: 700, color: selected ? cat.color : '#555', margin: '0 0 2px' }}>{cat.label}</p>
                              <p style={{ fontSize: 10, color: '#aaa', margin: 0, lineHeight: 1.3 }}>{cat.desc}</p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Ürün Çeşidi - kategori seçildiyse göster */}
                    {form.category && (
                      <motion.div style={{ marginBottom: 24 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <label style={label}>Ürün Çeşidi *</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                          {(CATEGORIES.find(c => c.id === form.category)?.products || []).map(prod => {
                            const sel = form.productType === prod.id;
                            const catColor = CATEGORIES.find(c => c.id === form.category)?.color || '#666';
                            return (
                              <div key={prod.id} onClick={() => set('productType', prod.id)}
                                style={{
                                  padding: '12px 14px', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s',
                                  border: sel ? `2px solid ${catColor}` : '2px solid #f0f0f0',
                                  background: sel ? `${catColor}08` : '#fff',
                                  boxShadow: sel ? `0 2px 8px ${catColor}15` : 'none',
                                }}>
                                <p style={{ fontSize: 13, fontWeight: 600, color: sel ? catColor : '#444', margin: 0 }}>{prod.name}</p>
                                <p style={{ fontSize: 10, color: '#aaa', margin: '3px 0 0' }}>Birim: {prod.unit}</p>
                              </div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    <div style={{ marginBottom: 20 }}>
                      <label style={label}>Sipariş Başlığı *</label>
                      <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Örn: Mayo Kumaş Siparişi - Yaz 2026"
                        style={inp} onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, { borderColor: '#f0f0f0', background: '#fafafa', boxShadow: 'none' })} />
                    </div>
                    <div>
                      <label style={label}>Açıklama</label>
                      <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={4}
                        placeholder="Sipariş hakkında detaylı bilgi, malzeme özellikleri, kalite standartları vb..."
                        style={{ ...inp, resize: 'vertical', minHeight: 100 }}
                        onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, { borderColor: '#f0f0f0', background: '#fafafa', boxShadow: 'none' })} />
                    </div>
                  </div>
                )}

                {/* STEP 2: Taraflar */}
                {step === 2 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#8b5cf6" /></div>
                      <div><h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Taraflar</h3><p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Tedarikçi ve müşteri firma seçin</p></div>
                    </div>

                    <div style={{ marginBottom: 24 }}>
                      <label style={label}>Tedarikçi</label>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                        {suppliers.map(s => (
                          <div key={s.ID} onClick={() => set('supplierId', s.ID.toString())}
                            style={{
                              padding: 16, borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
                              border: form.supplierId == s.ID ? '2px solid #8b5cf6' : '2px solid #f0f0f0',
                              background: form.supplierId == s.ID ? '#f5f3ff' : '#fafafa',
                              boxShadow: form.supplierId == s.ID ? '0 4px 12px rgba(139,92,246,0.15)' : 'none',
                            }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: 0 }}>{s.NAME}</p>
                                {s.CONTACT_NAME && <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0' }}>{s.CONTACT_NAME}</p>}
                              </div>
                              {form.supplierId == s.ID && <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Check size={12} color="#fff" /></div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label style={label}>Müşteri Firma</label>
                      <select value={form.firmId} onChange={e => set('firmId', e.target.value)}
                        style={{ ...inp, cursor: 'pointer', appearance: 'auto' }}>
                        <option value="">Firma seçin (opsiyonel)</option>
                        {firms.map(f => <option key={f.ID} value={f.ID}>{f.NAME}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* STEP 3: Fiyat & Tarih */}
                {step === 3 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><DollarSign size={18} color="#10b981" /></div>
                      <div><h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Fiyat & Tarih</h3><p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Miktar, fiyat ve tarih bilgilerini girin</p></div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
                      <div>
                        <label style={label}>Miktar {selectedProduct ? `(${selectedProduct.unit})` : ''}</label>
                        <input type="number" min="1" value={form.quantity} onChange={e => set('quantity', e.target.value)} style={inp}
                          onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, { borderColor: '#f0f0f0', background: '#fafafa', boxShadow: 'none' })} />
                      </div>
                      <div>
                        <label style={label}>Birim Fiyat</label>
                        <input type="number" step="0.01" min="0" value={form.unitPrice} onChange={e => set('unitPrice', e.target.value)} placeholder="0.00" style={inp}
                          onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, { borderColor: '#f0f0f0', background: '#fafafa', boxShadow: 'none' })} />
                      </div>
                      <div>
                        <label style={label}>Para Birimi</label>
                        <select value={form.currency} onChange={e => set('currency', e.target.value)} style={{ ...inp, cursor: 'pointer', appearance: 'auto' }}>
                          <option value="TRY">TRY (₺)</option>
                          <option value="USD">USD ($)</option>
                          <option value="EUR">EUR (€)</option>
                        </select>
                      </div>
                    </div>

                    {totalPrice > 0 && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        style={{ background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', borderRadius: 16, padding: 20, marginBottom: 24, border: '1px solid #a7f3d0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <DollarSign size={20} color="#10b981" />
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#065f46' }}>Toplam Tutar</span>
                        </div>
                        <span style={{ fontSize: 28, fontWeight: 800, color: '#059669' }}>{fmtMoney(totalPrice)}</span>
                      </motion.div>
                    )}

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                      <div>
                        <label style={label}>Sipariş Tarihi</label>
                        <input type="date" value={form.orderDate} onChange={e => set('orderDate', e.target.value)} style={inp} />
                      </div>
                      <div>
                        <label style={label}>Teslimat Tarihi</label>
                        <input type="date" value={form.deliveryDate} onChange={e => set('deliveryDate', e.target.value)} style={inp} />
                      </div>
                    </div>

                    <div>
                      <label style={label}>Ek Notlar</label>
                      <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} placeholder="Sipariş ile ilgili ek bilgiler..."
                        style={{ ...inp, resize: 'vertical' }}
                        onFocus={e => Object.assign(e.target.style, inpFocus)} onBlur={e => Object.assign(e.target.style, { borderColor: '#f0f0f0', background: '#fafafa', boxShadow: 'none' })} />
                    </div>
                  </div>
                )}

                {/* STEP 4: Önizleme */}
                {step === 4 && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CheckCircle2 size={18} color="#f59e0b" /></div>
                      <div><h3 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Sipariş Önizlemesi</h3><p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Bilgileri kontrol edip onaylayın</p></div>
                    </div>

                    <div style={{ background: '#fafafa', borderRadius: 16, padding: 24, marginBottom: 20, border: '1px solid #f0f0f0' }}>
                      {/* Ürün */}
                      <div style={{ marginBottom: 20 }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: '#bbb', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6 }}>Ürün Bilgileri</p>
                        {selectedCategory && (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 100, background: `${selectedCategory.color}10`, marginBottom: 8 }}>
                            <span>{selectedCategory.icon}</span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: selectedCategory.color }}>{selectedCategory.label}</span>
                          </div>
                        )}
                        {selectedProduct && <p style={{ fontSize: 13, fontWeight: 600, color: '#666', margin: '0 0 6px' }}>{selectedProduct.name} <span style={{ fontSize: 11, color: '#aaa', fontWeight: 400 }}>({selectedProduct.unit})</span></p>}
                        <p style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a', margin: '0 0 4px' }}>{form.title}</p>
                        {form.description && <p style={{ fontSize: 13, color: '#888', margin: 0, lineHeight: 1.6 }}>{form.description}</p>}
                      </div>

                      {/* Taraflar */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><User size={14} color="#8b5cf6" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Tedarikçi</span></div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: 0 }}>{selectedSupplier?.NAME || 'Belirtilmemiş'}</p>
                          {selectedSupplier?.CONTACT_NAME && <p style={{ fontSize: 11, color: '#aaa', margin: '4px 0 0' }}>{selectedSupplier.CONTACT_NAME}</p>}
                        </div>
                        <div style={{ padding: 16, borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Building2 size={14} color="#f59e0b" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Firma</span></div>
                          <p style={{ fontSize: 14, fontWeight: 600, color: '#333', margin: 0 }}>{selectedFirm?.NAME || 'Belirtilmemiş'}</p>
                        </div>
                      </div>

                      {/* Fiyat */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                        <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                          <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px' }}>Adet</p>
                          <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{form.quantity || 1}</p>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                          <p style={{ fontSize: 11, color: '#aaa', margin: '0 0 4px' }}>Birim Fiyat</p>
                          <p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(form.unitPrice)}</p>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fecaca', textAlign: 'center' }}>
                          <p style={{ fontSize: 11, color: '#E81E25', margin: '0 0 4px', fontWeight: 600 }}>Toplam</p>
                          <p style={{ fontSize: 22, fontWeight: 800, color: '#E81E25', margin: 0 }}>{fmtMoney(totalPrice)}</p>
                        </div>
                      </div>

                      {/* Tarihler */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Calendar size={16} color="#3b82f6" />
                          <div><p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Sipariş Tarihi</p><p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '2px 0 0' }}>{form.orderDate || '-'}</p></div>
                        </div>
                        <div style={{ padding: 14, borderRadius: 12, background: '#fff', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Truck size={16} color="#06b6d4" />
                          <div><p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>Teslimat Tarihi</p><p style={{ fontSize: 13, fontWeight: 600, color: '#333', margin: '2px 0 0' }}>{form.deliveryDate || 'Belirtilmemiş'}</p></div>
                        </div>
                      </div>

                      {form.notes && (
                        <div style={{ marginTop: 16, padding: 14, borderRadius: 12, background: '#fffbeb', border: '1px solid #fde68a' }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: '#92400e', margin: '0 0 4px' }}>Notlar</p>
                          <p style={{ fontSize: 13, color: '#78350f', margin: 0, lineHeight: 1.6 }}>{form.notes}</p>
                        </div>
                      )}
                    </div>

                    <div style={{ background: '#eff6ff', borderRadius: 14, padding: 14, display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #bfdbfe' }}>
                      <AlertCircle size={16} color="#3b82f6" />
                      <p style={{ fontSize: 12, color: '#1d4ed8', margin: 0 }}>Sipariş oluşturulduktan sonra durum güncellemesi yapabilirsiniz.</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button onClick={() => setStep(p => p - 1)} disabled={step === 1}
                  style={{ padding: '12px 24px', borderRadius: 12, border: '2px solid #f0f0f0', background: '#fff', color: step === 1 ? '#ddd' : '#666', fontSize: 14, fontWeight: 600, cursor: step === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ArrowLeft size={16} /> Geri
                </button>

                {step < 4 ? (
                  <button onClick={() => { if (canNext()) setStep(p => p + 1); else toast.error('Lütfen zorunlu alanları doldurun'); }}
                    style={{ padding: '12px 28px', borderRadius: 12, border: 'none', background: canNext() ? 'linear-gradient(135deg, #E81E25, #be1219)' : '#f0f0f0', color: canNext() ? '#fff' : '#bbb', fontSize: 14, fontWeight: 700, cursor: canNext() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 8, boxShadow: canNext() ? '0 4px 12px rgba(232,30,37,0.25)' : 'none' }}>
                    İleri <ArrowRight size={16} />
                  </button>
                ) : (
                  <button onClick={handleSubmit} disabled={loading}
                    style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 16px rgba(16,185,129,0.3)', opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Oluşturuluyor...' : <><CheckCircle2 size={18} /> Siparişi Onayla</>}
                  </button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
});

CreateOrder.displayName = 'CreateOrder';
export default CreateOrder;
