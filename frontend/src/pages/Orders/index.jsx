import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, RefreshCw, Plus, X, Package, Truck, CheckCircle2, Clock, XCircle, PackageCheck,
  Calendar, DollarSign, User, Building2, Eye, Filter, ChevronDown, MapPin, Hash, FileText,
  TrendingUp, CalendarDays, Download, Printer, MessageSquare, Tag
} from 'lucide-react';
import api from '../../api.js';
import { DateFilter } from '../../components/PageShell.jsx';

const STATUS_MAP = {
  1: { label: 'Beklemede', color: '#f59e0b', bg: '#fef3c7', icon: Clock, desc: 'Onay bekliyor' },
  2: { label: 'Onaylandı', color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle2, desc: 'Onaylandı, hazırlanmayı bekliyor' },
  3: { label: 'Hazırlanıyor', color: '#8b5cf6', bg: '#ede9fe', icon: PackageCheck, desc: 'Üretim aşamasında' },
  4: { label: 'Kargoda', color: '#06b6d4', bg: '#cffafe', icon: Truck, desc: 'Sevk edildi, yolda' },
  5: { label: 'Teslim Edildi', color: '#10b981', bg: '#d1fae5', icon: CheckCircle2, desc: 'Başarıyla teslim edildi' },
  6: { label: 'İptal', color: '#ef4444', bg: '#fee2e2', icon: XCircle, desc: 'İptal edildi' },
};
const fmtMoney = (v) => `₺${Number(v || 0).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const fmtDateLong = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-';

// Timeline Status
const STATUS_FLOW = [1, 2, 3, 4, 5];

const OrderDetail = memo(({ order, onClose, onStatusChange }) => {
  const [tab, setTab] = useState('genel');
  if (!order) return null;
  const st = STATUS_MAP[order.STATUS] || { label: '?', color: '#aaa', bg: '#f5f5f5', icon: Clock };
  const Ic = st.icon;
  const currentIdx = STATUS_FLOW.indexOf(order.STATUS);
  const isCancelled = order.STATUS === 6;

  // Kalan gün
  const daysLeft = order.DELIVERY_DATE ? Math.ceil((new Date(order.DELIVERY_DATE) - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <AnimatePresence>
      <motion.div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
        <motion.div style={{ position: 'relative', background: '#fff', borderRadius: 24, maxWidth: 780, width: '100%', maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 30px 80px rgba(0,0,0,0.25)' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Header - Kırmızı gradient */}
          <div style={{ background: 'linear-gradient(135deg, #E81E25, #b91c1c)', padding: '28px 32px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -20, left: 30, width: 100, height: 100, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
            <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#fff" /></button>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Tag size={14} color="rgba(255,255,255,0.7)" />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1 }}>SİPARİŞ NO</span>
              </div>
              <h2 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: -0.5 }}>{order.ORDER_NO}</h2>
              <p style={{ fontSize: 16, fontWeight: 500, color: 'rgba(255,255,255,0.9)', margin: 0 }}>{order.TITLE}</p>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 100, background: 'rgba(255,255,255,0.15)', marginTop: 12 }}>
                <Ic size={13} color="#fff" />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#fff' }}>{st.label}</span>
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          {!isCancelled && (
            <div style={{ padding: '20px 32px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 14, left: '10%', right: '10%', height: 2, background: '#e5e5e5' }} />
                <div style={{ position: 'absolute', top: 14, left: '10%', width: `${currentIdx >= 0 ? (currentIdx / 4) * 80 : 0}%`, height: 2, background: '#E81E25' }} />
                {STATUS_FLOW.map((s, i) => {
                  const statusInfo = STATUS_MAP[s];
                  const SI = statusInfo.icon;
                  const done = i <= currentIdx;
                  return (
                    <div key={s} style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', background: done ? '#E81E25' : '#fff', border: done ? 'none' : '2px solid #e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: done ? '0 2px 8px rgba(232,30,37,0.3)' : 'none' }}>
                        <SI size={13} color={done ? '#fff' : '#ccc'} />
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 600, color: done ? '#E81E25' : '#aaa', marginTop: 6 }}>{statusInfo.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '0 32px' }}>
            {[
              { id: 'genel', label: 'Genel Bilgiler', icon: FileText },
              { id: 'fiyat', label: 'Fiyat Detayı', icon: DollarSign },
              { id: 'zaman', label: 'Zaman Çizelgesi', icon: CalendarDays },
              { id: 'islem', label: 'İşlemler', icon: MessageSquare },
            ].map(t => {
              const active = tab === t.id;
              return (
                <button key={t.id} onClick={() => setTab(t.id)}
                  style={{ padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: active ? '2px solid #E81E25' : '2px solid transparent', color: active ? '#E81E25' : '#888', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                  <t.icon size={14} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab İçerik */}
          <div style={{ overflowY: 'auto', padding: 28, flex: 1 }}>

            {tab === 'genel' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {order.DESCRIPTION && (
                  <div style={{ padding: 16, background: '#fafafa', borderRadius: 12, marginBottom: 16, borderLeft: '3px solid #E81E25' }}>
                    <p style={{ fontSize: 11, color: '#999', margin: '0 0 6px', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>Açıklama</p>
                    <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.7 }}>{order.DESCRIPTION}</p>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div style={{ padding: 18, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={15} color="#E81E25" /></div>
                      <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: 0.5 }}>TEDARİKÇİ</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{order.SUPPLIER_NAME || '-'}</p>
                  </div>
                  <div style={{ padding: 18, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Building2 size={15} color="#E81E25" /></div>
                      <span style={{ fontSize: 11, color: '#aaa', fontWeight: 600, letterSpacing: 0.5 }}>MÜŞTERİ FİRMA</span>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{order.FIRM_NAME || '-'}</p>
                  </div>
                </div>

                <div style={{ padding: 16, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <p style={{ fontSize: 11, color: '#991b1b', margin: '0 0 6px', fontWeight: 700, letterSpacing: 0.5 }}>SİPARİŞ BİLGİSİ</p>
                  <p style={{ fontSize: 12, color: '#b91c1c', margin: 0, lineHeight: 1.6 }}>{st.desc}. Oluşturan: <strong>{order.CUSER_NAME || 'Admin'} {order.CUSER_SURNAME || ''}</strong></p>
                </div>
              </motion.div>
            )}

            {tab === 'fiyat' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                  <div style={{ padding: 18, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <Hash size={18} color="#aaa" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: 11, color: '#999', margin: '0 0 4px' }}>Adet / Miktar</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{order.QUANTITY || 1}</p>
                  </div>
                  <div style={{ padding: 18, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <Tag size={18} color="#aaa" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: 11, color: '#999', margin: '0 0 4px' }}>Birim Fiyat</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(order.UNIT_PRICE)}</p>
                  </div>
                  <div style={{ padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, #E81E25, #b91c1c)', textAlign: 'center', color: '#fff', boxShadow: '0 8px 24px rgba(232,30,37,0.25)' }}>
                    <DollarSign size={18} color="rgba(255,255,255,0.8)" style={{ margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '0 0 4px', fontWeight: 600 }}>TOPLAM TUTAR</p>
                    <p style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{fmtMoney(order.TOTAL_PRICE)}</p>
                  </div>
                </div>

                <div style={{ padding: 18, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <p style={{ fontSize: 12, color: '#999', fontWeight: 600, marginBottom: 12 }}>Fiyat Hesaplama</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: 13, color: '#666' }}>Birim Fiyat × Adet</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{fmtMoney(order.UNIT_PRICE)} × {order.QUANTITY || 1}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <span style={{ fontSize: 13, color: '#666' }}>Para Birimi</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#333' }}>{order.CURRENCY || 'TRY'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 8, borderTop: '2px solid #E81E25' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>Genel Toplam</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: '#E81E25' }}>{fmtMoney(order.TOTAL_PRICE)}</span>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'zaman' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ padding: 20, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#E81E25" /></div>
                    <div>
                      <p style={{ fontSize: 11, color: '#aaa', margin: 0, fontWeight: 600 }}>SİPARİŞ TARİHİ</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#1a1a1a', margin: '2px 0 0' }}>{fmtDateLong(order.ORDER_DATE)}</p>
                    </div>
                  </div>
                </div>

                <div style={{ padding: 20, borderRadius: 14, background: '#f0fdfa', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Truck size={16} color="#10b981" /></div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 11, color: '#059669', margin: 0, fontWeight: 600 }}>TESLİMAT TARİHİ</p>
                      <p style={{ fontSize: 15, fontWeight: 700, color: '#064e3b', margin: '2px 0 0' }}>{fmtDateLong(order.DELIVERY_DATE)}</p>
                    </div>
                    {daysLeft !== null && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 10, color: '#059669', margin: 0, fontWeight: 600 }}>{daysLeft > 0 ? 'KALAN' : 'GEÇEN'}</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: daysLeft > 0 ? '#10b981' : '#ef4444', margin: 0 }}>{Math.abs(daysLeft)} gün</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'islem' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>Durumu Güncelle</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                  {Object.entries(STATUS_MAP).map(([key, val]) => {
                    const active = parseInt(key) === order.STATUS;
                    const Ic = val.icon;
                    return (
                      <button key={key} onClick={() => !active && onStatusChange(order.ID, parseInt(key))}
                        style={{ padding: '10px 18px', borderRadius: 12, border: active ? `2px solid ${val.color}` : '2px solid #f0f0f0', background: active ? val.bg : '#fff', color: val.color, fontSize: 12, fontWeight: 700, cursor: active ? 'default' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, boxShadow: active ? `0 4px 12px ${val.color}25` : 'none' }}>
                        <Ic size={13} /> {val.label}
                      </button>
                    );
                  })}
                </div>

                <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 14px' }}>Hızlı İşlemler</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <button style={{ padding: 14, borderRadius: 12, border: '2px solid #f0f0f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Printer size={16} color="#666" /><span style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>Yazdır</span>
                  </button>
                  <button style={{ padding: 14, borderRadius: 12, border: '2px solid #f0f0f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Download size={16} color="#666" /><span style={{ fontSize: 13, fontWeight: 600, color: '#666' }}>PDF İndir</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
OrderDetail.displayName = 'OrderDetail';

const PartnerOrders = memo(() => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [sortBy, setSortBy] = useState('date-desc');
  const [dateRangeQuick, setDateRangeQuick] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.post('/api/partners/orders'); if (r.data.success) setOrders(r.data.data); } catch { toast.error('Yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = useCallback(async (orderId, status) => {
    try { const r = await api.post('/api/partners/orders/update-status', { orderId, status }); if (r.data.success) { toast.success('Güncellendi'); setSelectedOrder(null); load(); } } catch { toast.error('Hata'); }
  }, [load]);

  const suppliers = useMemo(() => {
    const s = new Set();
    orders.forEach(o => o.SUPPLIER_NAME && s.add(o.SUPPLIER_NAME));
    return [...s];
  }, [orders]);

  const filtered = useMemo(() => {
    let r = orders;
    if (statusFilter) r = r.filter(o => o.STATUS === parseInt(statusFilter));
    if (supplierFilter) r = r.filter(o => o.SUPPLIER_NAME === supplierFilter);
    if (dateFrom) r = r.filter(o => o.ORDER_DATE >= dateFrom);
    if (dateTo) r = r.filter(o => o.ORDER_DATE <= dateTo);
    if (priceMin) r = r.filter(o => Number(o.TOTAL_PRICE) >= parseFloat(priceMin));
    if (priceMax) r = r.filter(o => Number(o.TOTAL_PRICE) <= parseFloat(priceMax));
    if (searchTerm) { const t = searchTerm.toLowerCase(); r = r.filter(o => o.ORDER_NO?.toLowerCase().includes(t) || o.TITLE?.toLowerCase().includes(t) || o.SUPPLIER_NAME?.toLowerCase().includes(t) || o.FIRM_NAME?.toLowerCase().includes(t)); }

    // Sıralama
    const sorted = [...r];
    if (sortBy === 'date-desc') sorted.sort((a, b) => new Date(b.ORDER_DATE) - new Date(a.ORDER_DATE));
    else if (sortBy === 'date-asc') sorted.sort((a, b) => new Date(a.ORDER_DATE) - new Date(b.ORDER_DATE));
    else if (sortBy === 'price-desc') sorted.sort((a, b) => Number(b.TOTAL_PRICE) - Number(a.TOTAL_PRICE));
    else if (sortBy === 'price-asc') sorted.sort((a, b) => Number(a.TOTAL_PRICE) - Number(b.TOTAL_PRICE));
    return sorted;
  }, [orders, statusFilter, supplierFilter, dateFrom, dateTo, priceMin, priceMax, searchTerm, sortBy]);

  const statusCounts = useMemo(() => { const c = {}; orders.forEach(o => { c[o.STATUS] = (c[o.STATUS] || 0) + 1; }); return c; }, [orders]);
  const totalAmount = useMemo(() => filtered.reduce((s, o) => s + Number(o.TOTAL_PRICE || 0), 0), [filtered]);
  const avgAmount = filtered.length > 0 ? totalAmount / filtered.length : 0;

  const clearFilters = () => { setStatusFilter(''); setDateFrom(''); setDateTo(''); setPriceMin(''); setPriceMax(''); setSupplierFilter(''); setSearchTerm(''); };
  const hasFilters = statusFilter || dateFrom || dateTo || priceMin || priceMax || supplierFilter || searchTerm;

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <motion.div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Siparişler</h1><p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Tüm sipariş kayıtları ve yönetim</p></div>
        <button onClick={() => navigate('/app/yeni-siparis')} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', background: '#E81E25', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><Plus size={16} /> Yeni Sipariş</button>
      </motion.div>

      {/* Tarih Filtresi */}
      <div style={{ marginBottom: 16 }}>
        <DateFilter value={dateRangeQuick} onChange={setDateRangeQuick} />
      </div>

      {/* Özet Kartlar */}
      <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {[
          { label: 'Toplam Sipariş', value: filtered.length, icon: Package, color: '#E81E25' },
          { label: 'Toplam Tutar', value: fmtMoney(totalAmount), icon: DollarSign, color: '#10b981' },
          { label: 'Ortalama', value: fmtMoney(avgAmount), icon: TrendingUp, color: '#3b82f6' },
          { label: 'Teslim Edilen', value: orders.filter(o => o.STATUS === 5).length, icon: CheckCircle2, color: '#8b5cf6' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><k.icon size={18} color={k.color} /></div>
            <div><p style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{k.value}</p><p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{k.label}</p></div>
          </div>
        ))}
      </motion.div>

      {/* Durum Filtreleri */}
      <motion.div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <button onClick={() => setStatusFilter('')} style={{ padding: '8px 16px', borderRadius: 10, border: !statusFilter ? '2px solid #E81E25' : '2px solid #f0f0f0', background: !statusFilter ? '#fef2f2' : '#fff', color: !statusFilter ? '#E81E25' : '#888', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>Tümü ({orders.length})</button>
        {Object.entries(STATUS_MAP).map(([key, val]) => {
          const active = statusFilter === key;
          return (<button key={key} onClick={() => setStatusFilter(active ? '' : key)} style={{ padding: '8px 16px', borderRadius: 10, border: active ? `2px solid ${val.color}` : '2px solid #f0f0f0', background: active ? val.bg : '#fff', color: active ? val.color : '#888', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>{val.label} ({statusCounts[key] || 0})</button>);
        })}
      </motion.div>

      {/* Arama + Gelişmiş Filtre Toggle */}
      <motion.div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
          <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Sipariş no, ürün, tedarikçi veya firma ara..." style={{ width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12, border: '2px solid #f0f0f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
        </div>
        <button onClick={() => setShowAdvanced(!showAdvanced)} style={{ padding: '12px 18px', borderRadius: 12, border: showAdvanced ? '2px solid #E81E25' : '2px solid #f0f0f0', background: showAdvanced ? '#fef2f2' : '#fff', color: showAdvanced ? '#E81E25' : '#666', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Filter size={15} /> Gelişmiş Filtre <ChevronDown size={14} style={{ transform: showAdvanced ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
        </button>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ padding: '12px 14px', borderRadius: 12, border: '2px solid #f0f0f0', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
          <option value="date-desc">En Yeni</option>
          <option value="date-asc">En Eski</option>
          <option value="price-desc">Fiyat (Yüksek)</option>
          <option value="price-asc">Fiyat (Düşük)</option>
        </select>
        <button onClick={load} style={{ width: 44, height: 44, borderRadius: 12, border: '2px solid #f0f0f0', background: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><RefreshCw size={16} color="#aaa" /></button>
      </motion.div>

      {/* Gelişmiş Filtre Paneli */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden', marginBottom: 20 }}>
            <div style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #f0f0f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6 }}>Tarih Başlangıç</label>
                  <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid #f0f0f0', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6 }}>Tarih Bitiş</label>
                  <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid #f0f0f0', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6 }}>Min. Tutar</label>
                  <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder="0" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid #f0f0f0', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6 }}>Max. Tutar</label>
                  <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder="∞" style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid #f0f0f0', fontSize: 12, fontFamily: 'inherit', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 6 }}>Tedarikçi</label>
                  <select value={supplierFilter} onChange={e => setSupplierFilter(e.target.value)} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '2px solid #f0f0f0', fontSize: 12, fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
                    <option value="">Tümü</option>
                    {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              {hasFilters && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: '#888' }}><strong style={{ color: '#E81E25' }}>{filtered.length}</strong> sonuç bulundu</span>
                  <button onClick={clearFilters} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#f5f5f5', color: '#666', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Filtreleri Temizle</button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tablo */}
      <motion.div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={{ background: '#fafafa' }}>
              {['Sipariş No', 'Ürün', 'Tedarikçi', 'Firma', 'Adet', 'Tutar', 'Durum', 'Tarih', ''].map(h => (
                <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#999', textAlign: h === 'Tutar' ? 'right' : h === 'Adet' ? 'center' : h === 'Durum' ? 'center' : 'left', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="9" style={{ padding: 60, textAlign: 'center' }}><div style={{ width: 40, height: 40, border: '3px solid #fee2e2', borderTopColor: '#E81E25', borderRadius: '50%', margin: '0 auto 12px' }} className="animate-spin" /><p style={{ color: '#ccc' }}>Yükleniyor...</p></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="9" style={{ padding: 60, textAlign: 'center' }}><Package size={36} style={{ color: '#eee', margin: '0 auto 12px', display: 'block' }} /><p style={{ color: '#ccc', fontWeight: 600 }}>Sipariş bulunamadı</p><p style={{ color: '#ddd', fontSize: 12 }}>Filtreleri değiştirmeyi deneyin</p></td></tr>
              ) : filtered.map((order, idx) => {
                const st = STATUS_MAP[order.STATUS] || { label: '?', color: '#aaa', bg: '#f5f5f5', icon: Clock };
                const Ic = st.icon;
                return (
                  <motion.tr key={order.ID} style={{ borderTop: '1px solid #f7f7f7', cursor: 'pointer' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * idx }}
                    onClick={() => setSelectedOrder(order)} whileHover={{ backgroundColor: '#fafafa' }}>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#E81E25', whiteSpace: 'nowrap' }}>{order.ORDER_NO}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: '#333', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.TITLE}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#666' }}>{order.SUPPLIER_NAME || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#666' }}>{order.FIRM_NAME || '-'}</td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#666', textAlign: 'center' }}>{order.QUANTITY || 1}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 700, color: '#1a1a1a', textAlign: 'right', whiteSpace: 'nowrap' }}>{fmtMoney(order.TOTAL_PRICE)}</td>
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}><span style={{ fontSize: 11, fontWeight: 600, color: st.color, background: st.bg, padding: '4px 12px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}><Ic size={12} /> {st.label}</span></td>
                    <td style={{ padding: '14px 16px', fontSize: 12, color: '#aaa', whiteSpace: 'nowrap' }}>{fmtDate(order.ORDER_DATE)}</td>
                    <td style={{ padding: '14px 16px' }}><Eye size={15} color="#ddd" /></td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ padding: '14px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
          <span style={{ color: '#aaa' }}>Toplam <strong style={{ color: '#1a1a1a' }}>{filtered.length}</strong> sipariş</span>
          <span style={{ fontWeight: 700, color: '#E81E25' }}>{fmtMoney(totalAmount)}</span>
        </div>
      </motion.div>

      {selectedOrder && <OrderDetail order={selectedOrder} onClose={() => setSelectedOrder(null)} onStatusChange={handleStatusChange} />}
    </div>
  );
});

PartnerOrders.displayName = 'PartnerOrders';
export default PartnerOrders;
