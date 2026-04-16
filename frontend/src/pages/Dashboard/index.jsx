import React, { useState, useEffect, useCallback, memo, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence, animate } from 'framer-motion';
import {
  TrendingUp, Package, Users, Building2, ArrowUpRight, X,
  Truck, CheckCircle2, Clock, XCircle, PackageCheck,
  ChevronRight, ChevronDown, Calendar, DollarSign, BarChart3, PieChart, Activity,
  Phone, Mail, User, FileText, Star, ArrowUp, ArrowDown, Eye, Hash,
  ShoppingBag, AlertCircle, Zap, Award
} from 'lucide-react';

import api from '../../api.js';
import styles from './Dashboard.module.css';

const STATUS_MAP = {
  1: { label: 'Beklemede', color: '#f59e0b', bg: '#fef3c7', icon: Clock, desc: 'Onay bekleyen siparişler' },
  2: { label: 'Onaylandı', color: '#3b82f6', bg: '#dbeafe', icon: CheckCircle2, desc: 'Onaylanmış, hazırlanmayı bekliyor' },
  3: { label: 'Hazırlanıyor', color: '#8b5cf6', bg: '#ede9fe', icon: PackageCheck, desc: 'Üretim/hazırlık aşamasında' },
  4: { label: 'Kargoda', color: '#06b6d4', bg: '#cffafe', icon: Truck, desc: 'Sevk edildi, yolda' },
  5: { label: 'Teslim Edildi', color: '#10b981', bg: '#d1fae5', icon: CheckCircle2, desc: 'Başarıyla teslim edildi' },
  6: { label: 'İptal', color: '#ef4444', bg: '#fee2e2', icon: XCircle, desc: 'İptal edilen siparişler' },
};

const SHORT_MONTHS = { '01': 'Oca', '02': 'Şub', '03': 'Mar', '04': 'Nis', '05': 'May', '06': 'Haz', '07': 'Tem', '08': 'Ağu', '09': 'Eyl', '10': 'Eki', '11': 'Kas', '12': 'Ara' };
const MONTH_NAMES = { '01': 'Ocak', '02': 'Şubat', '03': 'Mart', '04': 'Nisan', '05': 'Mayıs', '06': 'Haziran', '07': 'Temmuz', '08': 'Ağustos', '09': 'Eylül', '10': 'Ekim', '11': 'Kasım', '12': 'Aralık' };
const fmtMoney = (v) => `₺${Number(v || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// Animated Counter
const AnimCounter = memo(({ value, prefix = '', suffix = '' }) => {
  const ref = useRef(null);
  const num = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.-]/g, '')) || 0 : Number(value) || 0;
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ctrl = animate(0, num, { duration: 1.5, ease: [0.22, 1, 0.36, 1], onUpdate(v) { node.textContent = prefix + Math.round(v).toLocaleString('tr-TR') + suffix; } });
    return () => ctrl.stop();
  }, [num, prefix, suffix]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
});
AnimCounter.displayName = 'AnimCounter';

// Modal
const DATE_RANGES = [
  { id: 'all', label: 'Tüm Dönem' },
  { id: '12m', label: 'Son 12 Ay' },
  { id: '6m', label: 'Son 6 Ay' },
  { id: '3m', label: 'Son 3 Ay' },
  { id: '1m', label: 'Son 1 Ay' },
];

const Modal = memo(({ isOpen, onClose, title, subtitle, icon: Icon, children, wide, heroValue, heroLabel, tabs, activeTab, onTabChange, dateRange, onDateRangeChange }) => {
  if (!isOpen) return null;
  return (
    <AnimatePresence>
      <motion.div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }} onClick={onClose} />
        <motion.div style={{ position: 'relative', background: '#fff', borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,0.25)', width: '100%', maxWidth: wide ? 960 : 720, maxHeight: '92vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* Kırmızı Gradient Header */}
          <div style={{ background: 'linear-gradient(135deg, #E81E25, #b91c1c)', padding: '24px 28px 24px 72px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
            <div style={{ position: 'absolute', bottom: -20, left: 30, width: 100, height: 100, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />

            {/* Kapatma butonu SOL ÜST */}
            <button onClick={onClose} style={{ position: 'absolute', top: 20, left: 20, width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2, transition: 'background 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}>
              <X size={16} color="#fff" />
            </button>

            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {Icon && <div style={{ width: 50, height: 50, borderRadius: 14, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)', flexShrink: 0 }}><Icon size={24} color="#fff" /></div>}
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.3 }}>{title}</h2>
                  {subtitle && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '3px 0 0' }}>{subtitle}</p>}
                </div>
              </div>
              {heroValue && (
                <div style={{ textAlign: 'right', paddingRight: 12 }}>
                  <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, letterSpacing: 1, margin: 0, textTransform: 'uppercase' }}>{heroLabel}</p>
                  <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '2px 0 0', lineHeight: 1 }}>{heroValue}</p>
                </div>
              )}
            </div>
          </div>

          {/* Tabs + Tarih Filtresi */}
          {(tabs || dateRange !== undefined) && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', padding: '0 28px', background: '#fafafa', gap: 12 }}>
              {tabs ? (
                <div style={{ display: 'flex' }}>
                  {tabs.map(t => {
                    const active = activeTab === t.id;
                    return (
                      <button key={t.id} onClick={() => onTabChange(t.id)}
                        style={{ padding: '14px 18px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: active ? '2px solid #E81E25' : '2px solid transparent', color: active ? '#E81E25' : '#888', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                        {t.icon && <t.icon size={13} />} {t.label}
                      </button>
                    );
                  })}
                </div>
              ) : <div />}

              {/* Tarih Filtresi - Selectbox */}
              {dateRange !== undefined && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                  <Calendar size={13} color="#aaa" />
                  <span style={{ fontSize: 11, color: '#888', fontWeight: 600 }}>Dönem:</span>
                  <div style={{ position: 'relative' }}>
                    <select value={dateRange} onChange={e => onDateRangeChange(e.target.value)}
                      style={{
                        padding: '7px 32px 7px 12px', border: '1px solid #fecaca', borderRadius: 8,
                        background: '#fef2f2', color: '#E81E25', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit', outline: 'none',
                        appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
                      }}>
                      {DATE_RANGES.map(r => (
                        <option key={r.id} value={r.id} style={{ color: '#333' }}>{r.label}</option>
                      ))}
                    </select>
                    <ChevronDown size={12} color="#E81E25" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ overflowY: 'auto', padding: 28, flex: 1 }}>{children}</div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
Modal.displayName = 'Modal';

// ═══ MAIN DASHBOARD ═══
const PartnerDashboard = memo(() => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState(null);
  const [modalTab, setModalTab] = useState('ozet');
  const [dateRange, setDateRange] = useState('all');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedMonth, setExpandedMonth] = useState(null);
  const [expandedFirm, setExpandedFirm] = useState(null);

  const openModal = (name) => { setActiveModal(name); setModalTab('ozet'); setDateRange('all'); setExpandedOrderId(null); setExpandedMonth(null); setExpandedFirm(null); };

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.post('/api/partners/dashboard'); if (r.data.success) setData(r.data.data); else toast.error(r.data.message); }
    catch (e) { toast.error(e?.response?.data?.message || 'Hata'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const stats = data?.generalStats || {};
  const statusStats = data?.statusStats || [];
  const topSuppliers = data?.topSuppliers || [];
  const monthlyTrend = data?.monthlyTrend || [];

  // Tarih filtresine göre aylık veriyi filtrele
  const filteredMonthly = useMemo(() => {
    if (!monthlyTrend || monthlyTrend.length === 0) return [];
    const map = { 'all': monthlyTrend.length, '12m': 12, '6m': 6, '3m': 3, '1m': 1 };
    const count = map[dateRange] || monthlyTrend.length;
    return monthlyTrend.slice(-count);
  }, [monthlyTrend, dateRange]);

  const filteredTotalRevenue = useMemo(() => filteredMonthly.reduce((s, m) => s + Number(m.TOTAL_AMOUNT || 0), 0), [filteredMonthly]);
  const filteredOrderCount = useMemo(() => filteredMonthly.reduce((s, m) => s + Number(m.ORDER_COUNT || 0), 0), [filteredMonthly]);

  const recentOrders = data?.recentOrders || [];
  const firmStats = data?.firmStats || [];
  const totalOrders = useMemo(() => statusStats.reduce((s, i) => s + i.COUNT, 0), [statusStats]);
  const avgOrder = stats.TOTAL_ORDERS > 0 ? stats.TOTAL_REVENUE / stats.TOTAL_ORDERS : 0;
  const deliveredPct = totalOrders > 0 ? ((statusStats.find(s => s.STATUS === 5)?.COUNT || 0) / totalOrders * 100).toFixed(0) : 0;

  const trend = useMemo(() => {
    if (monthlyTrend.length < 2) return { o: 0, r: 0 };
    const l = monthlyTrend[monthlyTrend.length - 1], p = monthlyTrend[monthlyTrend.length - 2];
    return { o: p.ORDER_COUNT > 0 ? Math.round(((l.ORDER_COUNT - p.ORDER_COUNT) / p.ORDER_COUNT) * 100) : 0, r: Number(p.TOTAL_AMOUNT) > 0 ? Math.round(((Number(l.TOTAL_AMOUNT) - Number(p.TOTAL_AMOUNT)) / Number(p.TOTAL_AMOUNT)) * 100) : 0 };
  }, [monthlyTrend]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
      <motion.div style={{ textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ width: 56, height: 56, border: '4px solid #fee2e2', borderTopColor: '#E81E25', borderRadius: '50%', margin: '0 auto 16px' }} className="animate-spin" />
        <p style={{ color: '#aaa', fontWeight: 500 }}>Analiz verileri yükleniyor...</p>
      </motion.div>
    </div>
  );

  const rankColors = [
    'linear-gradient(135deg, #8b5cf6, #7c3aed)', 'linear-gradient(135deg, #3b82f6, #2563eb)',
    'linear-gradient(135deg, #06b6d4, #0891b2)', 'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #d97706)',
  ];

  const statCards = [
    { title: 'Toplam Tedarikçi', value: stats.TOTAL_SUPPLIERS || 0, sub: 'Aktif iş ortakları', icon: Users, color: '#8b5cf6', bgFrom: '#f5f3ff', bgTo: '#ede9fe', border: '#e4d4fb', change: 12, modal: 'suppliers' },
    { title: 'Toplam Sipariş', value: stats.TOTAL_ORDERS || 0, sub: 'Tüm dönem', icon: Package, color: '#3b82f6', bgFrom: '#eff6ff', bgTo: '#dbeafe', border: '#bfdbfe', change: trend.o, modal: 'orders' },
    { title: 'Toplam Ciro', value: stats.TOTAL_REVENUE || 0, isMoney: true, sub: `Ort: ${fmtMoney(avgOrder)}`, icon: TrendingUp, color: '#10b981', bgFrom: '#ecfdf5', bgTo: '#d1fae5', border: '#a7f3d0', change: trend.r, modal: 'revenue' },
    { title: 'Hizmet Verilen Firma', value: stats.TOTAL_FIRMS || 0, sub: 'Aktif müşteriler', icon: Building2, color: '#f59e0b', bgFrom: '#fffbeb', bgTo: '#fef3c7', border: '#fde68a', change: 8, modal: 'firms' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>

      {/* ═══ HEADER ═══ */}
      <motion.div style={{ marginBottom: 28, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: -0.5 }}>Analiz Merkezi</h1>
          <p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>KOM Mayo Tekstil — İş Ortakları</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { label: 'Yeni Sipariş', icon: ShoppingBag, path: '/app/yeni-siparis', primary: true },
            { label: 'Siparişler', icon: FileText, path: '/app/siparisler' },
            { label: 'Tedarikçiler', icon: Users, path: '/app/tedarikciler' },
          ].map((btn, i) => (
            <motion.button key={i} onClick={() => navigate(btn.path)}
              initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: btn.primary ? '#E81E25' : '#f5f5f5', color: btn.primary ? '#fff' : '#555',
              }}>
              <btn.icon size={16} /> {btn.label}
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* ═══ STAT CARDS — Temiz, beyaz, minimal ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {statCards.map((c, i) => (
          <motion.div key={i}
            style={{ background: '#fff', borderRadius: 18, padding: 24, cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', border: '1px solid #f0f0f0' }}
            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}
            whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.06)' }}
            onClick={() => setActiveModal(c.modal)}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <c.icon size={20} color="#E81E25" />
              </div>
              {c.change !== undefined && (
                <span style={{ fontSize: 11, fontWeight: 700, color: c.change >= 0 ? '#16a34a' : '#dc2626', display: 'flex', alignItems: 'center', gap: 2 }}>
                  {c.change >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {Math.abs(c.change)}%
                </span>
              )}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#1a1a1a', letterSpacing: -0.5 }}>
              {c.isMoney ? <AnimCounter value={Math.round(Number(c.value))} prefix="₺" /> : <AnimCounter value={c.value} />}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#888', marginTop: 4 }}>{c.title}</div>
          </motion.div>
        ))}
      </div>

      {/* ═══ CHART ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '5fr 7fr', gap: 20, marginBottom: 28 }}>
        {/* Donut - Koyu Kırmızı Tema */}
        <motion.div style={{ background: 'linear-gradient(145deg, #1a1a1a, #2a2020)', borderRadius: 24, padding: 32, cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
          whileHover={{ boxShadow: '0 16px 40px rgba(0,0,0,0.25)' }}
          onClick={() => setActiveModal('status')}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(232,30,37,0.06)', borderRadius: '50%' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>Sipariş Durumları</h3>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', margin: '4px 0 0' }}>Detay için tıklayın</p>
              </div>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(232,30,37,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PieChart size={17} color="#E81E25" />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{ position: 'relative', width: 180, height: 180 }}>
                <div style={{
                  width: '100%', height: '100%', borderRadius: '50%',
                  background: `conic-gradient(${(() => { let c = 0; return statusStats.map(item => { const s = STATUS_MAP[item.STATUS] || { color: '#555' }; const p = totalOrders > 0 ? (item.COUNT / totalOrders) * 100 : 0; const r = `${s.color} ${c}% ${c + p}%`; c += p; return r; }).join(', '); })()})`,
                  boxShadow: '0 6px 24px rgba(0,0,0,0.3)'
                }} />
                <div style={{
                  position: 'absolute', top: '20%', left: '20%', right: '20%', bottom: '20%',
                  background: 'linear-gradient(145deg, #1a1a1a, #2a2020)', borderRadius: '50%', display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center'
                }}>
                  <span style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1 }}><AnimCounter value={totalOrders} /></span>
                  <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 3, fontWeight: 600, marginTop: 4 }}>Sipariş</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
              {statusStats.map(item => { const s = STATUS_MAP[item.STATUS] || { label: '?', color: '#555' }; return (
                <div key={item.STATUS} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0, boxShadow: `0 0 6px ${s.color}50` }} />
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', flex: 1 }}>{s.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{item.COUNT}</span>
                </div>
              ); })}
            </div>
          </div>
        </motion.div>

        {/* Bar Chart - KOM Kırmızı Header */}
        <motion.div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', cursor: 'pointer', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
          whileHover={{ boxShadow: '0 12px 36px rgba(0,0,0,0.07)' }}
          onClick={() => setActiveModal('trend')}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div style={{ background: 'linear-gradient(135deg, #E81E25, #b91c1c)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', margin: 0 }}>Aylık Sipariş Trendi</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', margin: '4px 0 0' }}>Son 12 ay — detay için tıklayın</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{monthlyTrend.reduce((s, m) => s + m.ORDER_COUNT, 0)}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>Sipariş</div>
              </div>
              <div style={{ width: 1, height: 30, background: 'rgba(255,255,255,0.2)' }} />
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>{fmtMoney(monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0))}</div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', letterSpacing: 1, textTransform: 'uppercase' }}>Ciro</div>
              </div>
            </div>
          </div>
          <div style={{ padding: '24px 28px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180 }}>
              {monthlyTrend.map((item, idx) => {
                const max = Math.max(...monthlyTrend.map(t => Number(t.TOTAL_AMOUNT)), 1);
                const h = (Number(item.TOTAL_AMOUNT) / max) * 100;
                const mk = item.MONTH.slice(5);
                const isLast = idx === monthlyTrend.length - 1;
                return (
                  <div key={item.MONTH} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <motion.span style={{ fontSize: 10, fontWeight: 700, marginBottom: 4, color: isLast ? '#E81E25' : '#999' }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 + idx * 0.04 }}>
                      {Number(item.TOTAL_AMOUNT) >= 1000 ? `${(Number(item.TOTAL_AMOUNT) / 1000).toFixed(0)}K` : ''}
                    </motion.span>
                    <motion.div
                      style={{
                        height: `${Math.max(h, 8)}%`, minHeight: 16, width: '100%', position: 'relative', transformOrigin: 'bottom',
                        background: isLast ? 'linear-gradient(180deg, #E81E25, #991b1b)' : 'linear-gradient(180deg, #fca5a5, #E81E25)',
                        boxShadow: isLast ? '0 4px 16px rgba(232,30,37,0.35)' : '0 2px 6px rgba(232,30,37,0.1)',
                        borderRadius: 8,
                        outline: isLast ? '3px solid rgba(232,30,37,0.2)' : 'none', outlineOffset: 3,
                      }}
                      initial={{ scaleY: 0, opacity: 0 }} animate={{ scaleY: 1, opacity: 1 }}
                      transition={{ delay: 0.3 + idx * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      whileHover={{ scale: 1.08 }}>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 11, fontWeight: 700 }}>{item.ORDER_COUNT}</div>
                    </motion.div>
                    <span style={{ fontSize: 11, fontWeight: 600, marginTop: 8, color: isLast ? '#E81E25' : '#bbb' }}>{SHORT_MONTHS[mk]}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 16, paddingTop: 12, borderTop: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#aaa' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: 'linear-gradient(180deg, #fca5a5, #E81E25)' }} /> Aylık Ciro</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#aaa' }}><div style={{ width: 10, height: 10, borderRadius: 3, background: '#E81E25', boxShadow: '0 0 6px rgba(232,30,37,0.4)' }} /> Bu Ay</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ═══ BOTTOM ROW ═══ */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Tedarikçiler - Koyu Kart */}
        <motion.div style={{ background: 'linear-gradient(145deg, #1a1a1a, #2a2020)', borderRadius: 24, overflow: 'hidden', position: 'relative' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
          <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'rgba(232,30,37,0.05)', borderRadius: '50%' }} />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 16px', position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(232,30,37,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Award size={17} color="#E81E25" /></div>
              <div><h3 style={{ fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>En Aktif Tedarikçiler</h3><p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: '2px 0 0' }}>İş hacmine göre sıralı</p></div>
            </div>
            <button onClick={() => openModal('suppliers')} style={{ fontSize: 12, color: '#E81E25', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: 'rgba(232,30,37,0.08)', border: 'none', cursor: 'pointer' }}>Tümü <ChevronRight size={12} /></button>
          </div>
          <div style={{ padding: '0 28px 24px', position: 'relative', zIndex: 1 }}>
            {topSuppliers.slice(0, 5).map((s, idx) => {
              const maxA = topSuppliers[0]?.TOTAL_AMOUNT || 1;
              const pct = (Number(s.TOTAL_AMOUNT) / Number(maxA)) * 100;
              const shades = ['#E81E25', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
              return (
                <motion.div key={s.ID} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 0', cursor: 'pointer', borderBottom: idx < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + idx * 0.06 }}
                  whileHover={{ x: 6 }}
                  onClick={() => navigate(`/app/tedarikciler?id=${s.ID}`)}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: shades[idx], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{idx + 1}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#e5e5e5' }}>{s.NAME}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginLeft: 8 }}>{fmtMoney(s.TOTAL_AMOUNT)}</span>
                    </div>
                    <div style={{ width: '100%', height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 100, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 100, background: shades[idx] }}
                        initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + idx * 0.06, duration: 0.8 }} />
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{s.ORDER_COUNT} sipariş · {s.CONTACT_NAME || ''}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Son Siparişler - Beyaz Kart */}
        <motion.div style={{ background: '#fff', borderRadius: 24, overflow: 'hidden', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '24px 28px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Zap size={17} color="#E81E25" /></div>
              <div><h3 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>Son Siparişler</h3><p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>En son oluşturulan siparişler</p></div>
            </div>
            <button onClick={() => openModal('orders')} style={{ fontSize: 12, color: '#E81E25', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', borderRadius: 8, background: '#fef2f2', border: 'none', cursor: 'pointer' }}>Tümü <ChevronRight size={12} /></button>
          </div>
          <div style={{ padding: '0 20px 20px' }}>
            {recentOrders.slice(0, 6).map((order, idx) => {
              const st = STATUS_MAP[order.STATUS] || { label: '?', color: '#9ca3af', bg: '#f3f4f6', icon: Clock };
              const Ic = st.icon;
              return (
                <motion.div key={order.ID} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px', borderRadius: 14, cursor: 'pointer', marginBottom: 2 }}
                  initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.55 + idx * 0.05 }}
                  whileHover={{ backgroundColor: '#fafafa' }}>
                  <div style={{ width: 42, height: 42, borderRadius: 12, background: st.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Ic size={18} style={{ color: st.color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{order.TITLE}</div>
                    <div style={{ fontSize: 11, color: '#bbb', marginTop: 3 }}>{order.SUPPLIER_NAME} → {order.FIRM_NAME} · {fmtDate(order.ORDER_DATE)}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a' }}>{fmtMoney(order.TOTAL_PRICE)}</div>
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 100, color: st.color, background: `${st.color}10`, display: 'inline-block', marginTop: 3 }}>{st.label}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ═══ MODALLER ═══ */}

      {/* ═══ TEDARİKÇİLER MODAL ═══ */}
      <Modal isOpen={activeModal === 'suppliers'} onClose={() => setActiveModal(null)} title="Tedarikçi Analizi"
        subtitle={`${stats.TOTAL_SUPPLIERS || 0} aktif iş ortağı ile çalışılıyor`} icon={Users} wide
        heroValue={stats.TOTAL_SUPPLIERS || 0} heroLabel="Tedarikçi"
        tabs={[
          { id: 'ozet', label: 'Genel Bakış', icon: Activity },
          { id: 'liste', label: 'Sıralama', icon: Award },
          { id: 'insight', label: 'Öngörüler', icon: Star },
        ]} activeTab={modalTab} onTabChange={setModalTab}
        dateRange={dateRange} onDateRangeChange={setDateRange}>
        {modalTab === 'ozet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            {/* Bilgi kutusu */}
            <div style={{ background: '#fef2f2', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #fecaca', display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E81E25', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Star size={16} color="#fff" /></div>
              <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.7, margin: 0 }}>
                Toplam <strong>{stats.TOTAL_SUPPLIERS || 0}</strong> tedarikçi ile aktif çalışma. Lider <strong>{topSuppliers[0]?.NAME}</strong> — cirodaki payı <strong>%{stats.TOTAL_REVENUE > 0 ? ((Number(topSuppliers[0]?.TOTAL_AMOUNT) / stats.TOTAL_REVENUE) * 100).toFixed(0) : 0}</strong>. Sipariş başına ortalama <strong>{fmtMoney(avgOrder)}</strong> tutarında iş yapılmaktadır.
              </p>
            </div>

            {/* 4 Büyük Metrik */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 24 }}>
              {[
                { label: 'Aktif Tedarikçi', value: stats.TOTAL_SUPPLIERS || 0, sub: 'İş ortağı', icon: Users, hi: true },
                { label: 'Toplam Sipariş', value: stats.TOTAL_ORDERS || 0, sub: 'Tüm dönem', icon: Package },
                { label: 'Toplam Ciro', value: fmtMoney(stats.TOTAL_REVENUE), sub: 'İş hacmi', icon: DollarSign },
                { label: 'Ortalama', value: fmtMoney(avgOrder), sub: 'Sipariş başı', icon: TrendingUp },
              ].map((k, i) => (
                <div key={i} style={{ padding: 18, borderRadius: 14, background: k.hi ? '#fef2f2' : '#fafafa', border: `1px solid ${k.hi ? '#fecaca' : '#f0f0f0'}`, position: 'relative', overflow: 'hidden' }}>
                  {k.hi && <div style={{ position: 'absolute', top: -10, right: -10, width: 50, height: 50, background: 'rgba(232,30,37,0.08)', borderRadius: '50%' }} />}
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <k.icon size={16} color={k.hi ? '#E81E25' : '#aaa'} />
                      <span style={{ fontSize: 10, color: k.hi ? '#991b1b' : '#888', fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>{k.label}</span>
                    </div>
                    <p style={{ fontSize: 20, fontWeight: 800, color: k.hi ? '#E81E25' : '#1a1a1a', margin: 0, lineHeight: 1.2 }}>{k.value}</p>
                    <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0' }}>{k.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Dağılım çubuğu */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#666', margin: '0 0 10px' }}>CİRO DAĞILIMI</p>
              <div style={{ display: 'flex', height: 32, borderRadius: 10, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                {topSuppliers.slice(0, 5).map((s, i) => {
                  const colors = ['#E81E25', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
                  const pct = stats.TOTAL_REVENUE > 0 ? (Number(s.TOTAL_AMOUNT) / stats.TOTAL_REVENUE) * 100 : 0;
                  return (
                    <motion.div key={s.ID} style={{ background: colors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}
                      initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.1 * i, duration: 0.6 }}>
                      {pct > 5 ? `%${pct.toFixed(0)}` : ''}
                    </motion.div>
                  );
                })}
                <div style={{ background: '#e5e5e5', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888' }}>Diğer</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 10 }}>
                {topSuppliers.slice(0, 5).map((s, i) => {
                  const colors = ['#E81E25', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d'];
                  return (
                    <div key={s.ID} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: colors[i] }} />
                      <span style={{ fontSize: 11, color: '#666' }}>{s.NAME}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {modalTab === 'liste' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>İş hacmine göre sıralı tedarikçi listesi:</p>
            {topSuppliers.map((s, idx) => {
              const maxA = topSuppliers[0]?.TOTAL_AMOUNT || 1;
              const pct = (Number(s.TOTAL_AMOUNT) / Number(maxA)) * 100;
              const share = stats.TOTAL_REVENUE > 0 ? ((Number(s.TOTAL_AMOUNT) / stats.TOTAL_REVENUE) * 100).toFixed(1) : 0;
              return (
                <motion.div key={s.ID} style={{ padding: 18, borderRadius: 14, border: idx === 0 ? '2px solid #fecaca' : '1px solid #f0f0f0', marginBottom: 10, background: idx === 0 ? '#fef2f2' : '#fff' }}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * idx }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: idx === 0 ? '#E81E25' : '#e5e5e5', color: idx === 0 ? '#fff' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, boxShadow: idx === 0 ? '0 4px 12px rgba(232,30,37,0.25)' : 'none' }}>{idx + 1}</div>
                      <div>
                        <p style={{ fontWeight: 800, color: '#1a1a1a', margin: 0, fontSize: 15 }}>{s.NAME}</p>
                        <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
                          {s.CONTACT_NAME && <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><User size={10} />{s.CONTACT_NAME}</span>}
                          {s.PHONE && <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={10} />{s.PHONE}</span>}
                          {s.EMAIL && <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><Mail size={10} />{s.EMAIL}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 18, fontWeight: 800, color: idx === 0 ? '#E81E25' : '#1a1a1a' }}>{fmtMoney(s.TOTAL_AMOUNT)}</span>
                      <p style={{ fontSize: 11, color: '#aaa', margin: '3px 0 0' }}>{s.ORDER_COUNT} sipariş · %{share} pay</p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 100, background: idx === 0 ? '#E81E25' : '#ccc' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.05 * idx, duration: 0.6 }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? '#E81E25' : '#aaa', minWidth: 40, textAlign: 'right' }}>%{pct.toFixed(0)}</span>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {modalTab === 'insight' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>Tedarikçi performans öngörüleri ve öneriler:</p>
            {[
              { title: 'Güçlü İş Ortağı', icon: Award, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: `${topSuppliers[0]?.NAME} tedarikçisi ${topSuppliers[0]?.ORDER_COUNT} sipariş ve ${fmtMoney(topSuppliers[0]?.TOTAL_AMOUNT)} iş hacmi ile en güçlü iş ortağıdır. Bu ilişkiyi sürdürmeniz önerilir.` },
              { title: 'Risk Uyarısı', icon: Activity, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: `Toplam cironuzun %${stats.TOTAL_REVENUE > 0 ? ((Number(topSuppliers[0]?.TOTAL_AMOUNT || 0) / stats.TOTAL_REVENUE) * 100).toFixed(0) : 0}'si tek tedarikçiden geliyor. Tedarikçi çeşitliliğini artırmanız risk azaltır.` },
              { title: 'Büyüme Potansiyeli', icon: TrendingUp, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: `Son sıralarda yer alan ${topSuppliers[topSuppliers.length - 1]?.NAME} gibi tedarikçilerle iş hacmini artırma potansiyeli mevcut. Ortalama sipariş tutarı ${fmtMoney(avgOrder)} olup büyüme fırsatı var.` },
              { title: 'Portföy Özeti', icon: Star, color: '#E81E25', bg: '#fef2f2', border: '#fecaca', text: `Toplam ${stats.TOTAL_SUPPLIERS || 0} aktif tedarikçiden oluşan portföyünüz, ${stats.TOTAL_ORDERS || 0} sipariş ve ${fmtMoney(stats.TOTAL_REVENUE)} iş hacmi üretti. Performans skorunuz ortalama üstü.` },
            ].map((ins, i) => (
              <motion.div key={i} style={{ padding: 18, borderRadius: 14, background: ins.bg, border: `1px solid ${ins.border}`, marginBottom: 12, display: 'flex', gap: 14 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: ins.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ins.icon size={18} color="#fff" /></div>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: ins.color, margin: '0 0 4px' }}>{ins.title}</p><p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.7 }}>{ins.text}</p></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Modal>

      {/* ═══ SİPARİŞLER MODAL ═══ */}
      <Modal isOpen={activeModal === 'orders'} onClose={() => setActiveModal(null)} title="Sipariş Merkezi"
        subtitle={`${stats.TOTAL_ORDERS || 0} sipariş · %${deliveredPct} teslim oranı`} icon={Package} wide
        heroValue={dateRange === 'all' ? (stats.TOTAL_ORDERS || 0) : filteredOrderCount} heroLabel="Sipariş"
        tabs={[
          { id: 'ozet', label: 'Genel Bakış', icon: Activity },
          { id: 'liste', label: 'Son Siparişler', icon: Package },
          { id: 'insight', label: 'Öngörüler', icon: Star },
        ]} activeTab={modalTab} onTabChange={setModalTab}
        dateRange={dateRange} onDateRangeChange={setDateRange}>

        {modalTab === 'ozet' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div style={{ background: '#fef2f2', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #fecaca', display: 'flex', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E81E25', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 size={16} color="#fff" /></div>
              <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.7, margin: 0 }}>
                Toplam <strong>{totalOrders}</strong> siparişin <strong>%{deliveredPct}</strong>'i başarıyla teslim edildi. <strong>{statusStats.find(s => s.STATUS === 3)?.COUNT || 0}</strong> sipariş hazırlıkta, <strong>{statusStats.find(s => s.STATUS === 4)?.COUNT || 0}</strong> sipariş kargoda. {(statusStats.find(s => s.STATUS === 1)?.COUNT || 0) > 0 && `${statusStats.find(s => s.STATUS === 1)?.COUNT} onay bekliyor.`}
              </p>
            </div>

            {/* 6 Durum Kartı */}
            <p style={{ fontSize: 12, fontWeight: 700, color: '#666', margin: '0 0 12px', letterSpacing: 0.5 }}>DURUM DAĞILIMI</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {statusStats.map(item => { const s = STATUS_MAP[item.STATUS] || { label: '?', color: '#ddd', bg: '#f5f5f5', icon: Clock, desc: '' }; const Ic = s.icon; const pct = totalOrders > 0 ? ((item.COUNT / totalOrders) * 100).toFixed(0) : 0; return (
                <div key={item.STATUS} style={{ padding: 16, borderRadius: 14, border: `1px solid ${s.color}30`, background: `${s.color}05`, position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, background: `${s.color}10`, borderRadius: '50%' }} />
                  <div style={{ position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 8, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Ic size={14} style={{ color: s.color }} /></div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color, letterSpacing: 0.3 }}>{s.label}</span>
                    </div>
                    <p style={{ fontSize: 26, fontWeight: 800, color: '#1a1a1a', margin: 0, lineHeight: 1 }}>{item.COUNT}</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
                      <div style={{ flex: 1, height: 3, background: '#fff', borderRadius: 100, overflow: 'hidden', marginRight: 8 }}>
                        <motion.div style={{ height: '100%', borderRadius: 100, background: s.color }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: s.color }}>%{pct}</span>
                    </div>
                  </div>
                </div>
              ); })}
            </div>

            {/* Teslim Performansı */}
            <div style={{ padding: 20, borderRadius: 14, background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: 11, color: '#065f46', fontWeight: 700, margin: '0 0 4px', letterSpacing: 0.5 }}>TESLİM PERFORMANSI</p>
                  <p style={{ fontSize: 30, fontWeight: 800, color: '#059669', margin: 0 }}>%{deliveredPct}</p>
                  <p style={{ fontSize: 12, color: '#065f46', margin: '2px 0 0' }}>Başarıyla teslim edilen siparişler</p>
                </div>
                <div style={{ width: 70, height: 70, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16,185,129,0.25)' }}>
                  <CheckCircle2 size={32} color="#fff" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {modalTab === 'liste' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>En son oluşturulan siparişler — <strong>detay için tıklayın</strong></p>
            <div style={{ borderRadius: 14, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#fafafa' }}>
                {['Sipariş No', 'Ürün', 'Tedarikçi → Firma', 'Tutar', 'Durum', ''].map(h => <th key={h} style={{ padding: '12px 16px', fontSize: 11, fontWeight: 600, color: '#999', textAlign: h === 'Tutar' ? 'right' : h === 'Durum' ? 'center' : 'left' }}>{h}</th>)}
              </tr></thead><tbody>
                {recentOrders.map((o, idx) => {
                  const s = STATUS_MAP[o.STATUS] || { label: '?', color: '#ddd' };
                  const Ic = s.icon || Clock;
                  const expanded = expandedOrderId === o.ID;
                  return (
                    <React.Fragment key={o.ID}>
                      <motion.tr style={{ borderTop: '1px solid #f5f5f5', cursor: 'pointer', background: expanded ? '#fef2f2' : 'transparent' }}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.03 * idx }}
                        onClick={() => setExpandedOrderId(expanded ? null : o.ID)}
                        whileHover={{ backgroundColor: expanded ? '#fef2f2' : '#fafafa' }}>
                        <td style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#E81E25' }}>{o.ORDER_NO}</td>
                        <td style={{ padding: '12px 16px', fontSize: 12, color: '#333', fontWeight: 600 }}>{o.TITLE}</td>
                        <td style={{ padding: '12px 16px', fontSize: 11, color: '#aaa' }}>{o.SUPPLIER_NAME} <span style={{ color: '#ddd' }}>→</span> {o.FIRM_NAME}</td>
                        <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 700, color: '#1a1a1a', textAlign: 'right' }}>{fmtMoney(o.TOTAL_PRICE)}</td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}><span style={{ fontSize: 10, fontWeight: 700, color: s.color, background: `${s.color}12`, padding: '4px 10px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 4 }}><Ic size={10} />{s.label}</span></td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <ChevronDown size={14} color="#ccc" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                        </td>
                      </motion.tr>
                      <AnimatePresence>
                        {expanded && (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <td colSpan="6" style={{ padding: 0, background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                                <div style={{ padding: 24 }}>
                                  {/* Detay içerik */}
                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                                    <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Hash size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>ADET</span></div>
                                      <p style={{ fontSize: 18, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{o.QUANTITY || 1}</p>
                                    </div>
                                    <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><DollarSign size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>BİRİM FİYAT</span></div>
                                      <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(o.UNIT_PRICE)}</p>
                                    </div>
                                    <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Calendar size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>SİPARİŞ TARİHİ</span></div>
                                      <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{fmtDate(o.ORDER_DATE)}</p>
                                    </div>
                                    <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Truck size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>TESLİMAT</span></div>
                                      <p style={{ fontSize: 12, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{fmtDate(o.DELIVERY_DATE)}</p>
                                    </div>
                                  </div>

                                  {o.DESCRIPTION && (
                                    <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca', marginBottom: 12 }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><FileText size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>AÇIKLAMA</span></div>
                                      <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{o.DESCRIPTION}</p>
                                    </div>
                                  )}

                                  <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={(e) => { e.stopPropagation(); navigate('/app/siparisler'); }}
                                      style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#E81E25', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                      <Eye size={14} /> Siparişler Sayfasında Aç
                                    </button>
                                    <button onClick={(e) => { e.stopPropagation(); setExpandedOrderId(null); }}
                                      style={{ padding: '12px 20px', borderRadius: 10, border: '2px solid #fecaca', background: '#fff', color: '#991b1b', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                                      Kapat
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            </td>
                          </motion.tr>
                        )}
                      </AnimatePresence>
                    </React.Fragment>
                  );
                })}
              </tbody></table>
            </div>
          </motion.div>
        )}

        {modalTab === 'insight' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>Sipariş yönetimi öngörüleri:</p>
            {[
              { title: 'Yüksek Başarı Oranı', icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', text: `Siparişlerin %${deliveredPct}'i başarıyla teslim edildi. Bu oran sektör ortalamasının üzerinde ve güçlü bir operasyonel performansı gösteriyor.` },
              { title: 'Aktif Süreç Yönetimi', icon: Package, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: `${(statusStats.find(s=>s.STATUS===3)?.COUNT||0) + (statusStats.find(s=>s.STATUS===4)?.COUNT||0)} sipariş aktif süreçte (hazırlık + kargo). Bu siparişleri yakın takip ederek teslimat süreçlerini hızlandırabilirsiniz.` },
              ...(((statusStats.find(s=>s.STATUS===1)?.COUNT||0) > 0) ? [{ title: 'Onay Bekliyor', icon: Clock, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: `${statusStats.find(s=>s.STATUS===1)?.COUNT} sipariş onay bekliyor. Bu siparişleri hızlıca değerlendirerek süreci başlatmanız iş akışını iyileştirir.` }] : []),
              { title: 'Ortalama Sipariş Değeri', icon: DollarSign, color: '#E81E25', bg: '#fef2f2', border: '#fecaca', text: `Sipariş başına ortalama ${fmtMoney(avgOrder)} tutarında iş yapılmaktadır. Bu değer müşteri segmenti ve tedarikçi seçimini göstermektedir.` },
            ].map((ins, i) => (
              <motion.div key={i} style={{ padding: 18, borderRadius: 14, background: ins.bg, border: `1px solid ${ins.border}`, marginBottom: 12, display: 'flex', gap: 14 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: ins.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ins.icon size={18} color="#fff" /></div>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: ins.color, margin: '0 0 4px' }}>{ins.title}</p><p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.7 }}>{ins.text}</p></div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </Modal>

      {/* ═══ CİRO MODAL ═══ */}
      <Modal isOpen={activeModal === 'revenue'} onClose={() => setActiveModal(null)} title="Ciro & Gelir Analizi"
        subtitle="Detaylı finansal performans raporu" icon={TrendingUp} wide
        heroValue={fmtMoney(dateRange === 'all' ? stats.TOTAL_REVENUE : filteredTotalRevenue)} heroLabel="Toplam Ciro"
        tabs={[
          { id: 'ozet', label: 'Özet', icon: Activity },
          { id: 'insight', label: 'Öngörüler', icon: Star },
        ]} activeTab={modalTab} onTabChange={setModalTab}
        dateRange={dateRange} onDateRangeChange={setDateRange}>

        {modalTab === 'insight' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>Finansal performans öngörüleri:</p>
            {[
              { title: trend.r >= 0 ? 'Pozitif Ciro Trendi' : 'Ciro Düşüşü', icon: trend.r >= 0 ? ArrowUp : ArrowDown, color: trend.r >= 0 ? '#10b981' : '#ef4444', bg: trend.r >= 0 ? '#ecfdf5' : '#fef2f2', border: trend.r >= 0 ? '#a7f3d0' : '#fecaca', text: `Son aya göre ciro değişimi %${trend.r >= 0 ? '+' : ''}${trend.r}. ${trend.r >= 0 ? 'Bu pozitif bir trenddir, büyüme sürdürülebilir görünüyor.' : 'Bu dönemde dikkatli olunması gereken bir düşüş var.'}` },
              { title: 'En Başarılı Ay', icon: Star, color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', text: `${monthlyTrend.length > 0 ? MONTH_NAMES[monthlyTrend.reduce((max, m) => Number(m.TOTAL_AMOUNT) > Number(max.TOTAL_AMOUNT) ? m : max).MONTH.slice(5)] : ''} ayı ${fmtMoney(monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(m => Number(m.TOTAL_AMOUNT))) : 0)} ile en yüksek ciroyu kaydetti. Bu ayın başarı faktörlerini analiz ederek diğer aylara uygulayabilirsiniz.` },
              { title: 'Ortalama Performans', icon: Activity, color: '#3b82f6', bg: '#eff6ff', border: '#bfdbfe', text: `Aylık ortalama ciro ${fmtMoney(monthlyTrend.length > 0 ? monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0) / monthlyTrend.length : 0)} seviyesindedir. Sipariş başına ortalama ${fmtMoney(avgOrder)} değerinde iş yapılmaktadır.` },
              { title: 'Büyüme Potansiyeli', icon: TrendingUp, color: '#E81E25', bg: '#fef2f2', border: '#fecaca', text: `Toplam ${fmtMoney(stats.TOTAL_REVENUE)} iş hacmi güçlü bir başlangıç. Tedarikçi çeşitliliğini artırarak %20-30 büyüme potansiyeli mevcut.` },
            ].map((ins, i) => (
              <motion.div key={i} style={{ padding: 18, borderRadius: 14, background: ins.bg, border: `1px solid ${ins.border}`, marginBottom: 12, display: 'flex', gap: 14 }}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: ins.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><ins.icon size={18} color="#fff" /></div>
                <div><p style={{ fontSize: 13, fontWeight: 700, color: ins.color, margin: '0 0 4px' }}>{ins.title}</p><p style={{ fontSize: 12, color: '#555', margin: 0, lineHeight: 1.7 }}>{ins.text}</p></div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {modalTab === 'ozet' && (<>
        <div style={{ background: '#fef2f2', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #fecaca', display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E81E25', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><DollarSign size={16} color="#fff" /></div>
          <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.7, margin: 0 }}>
            Toplam <strong>{fmtMoney(stats.TOTAL_REVENUE)}</strong> ciro. Sipariş başı ortalama <strong>{fmtMoney(avgOrder)}</strong>. En yüksek ay <strong>{monthlyTrend.length > 0 ? MONTH_NAMES[monthlyTrend.reduce((max, m) => Number(m.TOTAL_AMOUNT) > Number(max.TOTAL_AMOUNT) ? m : max).MONTH.slice(5)] || '' : ''}</strong>. Son ay değişim: <strong style={{ color: trend.r >= 0 ? '#10b981' : '#ef4444' }}>{trend.r >= 0 ? '+' : ''}{trend.r}%</strong>
          </p>
        </div>
        {/* KPI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { l: 'Toplam Ciro', v: fmtMoney(stats.TOTAL_REVENUE), highlight: true },
            { l: 'Ortalama Sipariş', v: fmtMoney(avgOrder) },
            { l: 'En Yüksek Ay', v: fmtMoney(monthlyTrend.length > 0 ? Math.max(...monthlyTrend.map(m => Number(m.TOTAL_AMOUNT))) : 0) },
            { l: 'Aylık Ortalama', v: fmtMoney(monthlyTrend.length > 0 ? monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0) / monthlyTrend.length : 0) },
          ].map((k, i) => (
            <div key={i} style={{ padding: 16, borderRadius: 12, background: k.highlight ? '#fef2f2' : '#fafafa', textAlign: 'center', border: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: 18, fontWeight: 800, color: k.highlight ? '#E81E25' : '#1a1a1a', margin: 0 }}>{k.v}</p>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 4 }}>{k.l}</p>
            </div>
          ))}
        </div>
        {/* Tablo */}
        <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '0 0 10px' }}>Aylık Detay — <span style={{ fontWeight: 500, color: '#999' }}>detay için tıklayın</span></p>
        <div style={{ borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#fafafa' }}>
            {['Ay', 'Sipariş', 'Ciro', 'Ortalama', 'Değişim', ''].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#999', textAlign: h === 'Sipariş' ? 'center' : h === 'Ay' ? 'left' : 'right' }}>{h}</th>)}
          </tr></thead><tbody>
            {monthlyTrend.map((item, idx) => {
              const mk = item.MONTH.slice(5);
              const prev = idx > 0 ? Number(monthlyTrend[idx - 1].TOTAL_AMOUNT) : 0;
              const chg = prev > 0 ? Math.round(((Number(item.TOTAL_AMOUNT) - prev) / prev) * 100) : 0;
              const expanded = expandedMonth === item.MONTH;
              const avgPerOrder = item.ORDER_COUNT > 0 ? Number(item.TOTAL_AMOUNT) / item.ORDER_COUNT : 0;
              return (
                <React.Fragment key={item.MONTH}>
                  <tr style={{ borderTop: '1px solid #f5f5f5', cursor: 'pointer', background: expanded ? '#fef2f2' : 'transparent' }}
                    onClick={() => setExpandedMonth(expanded ? null : item.MONTH)}
                    onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = '#fafafa'; }}
                    onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 500, color: '#333' }}>{MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#E81E25' }}>{item.ORDER_COUNT}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{fmtMoney(item.TOTAL_AMOUNT)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, color: '#888' }}>{fmtMoney(avgPerOrder)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>{idx > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color: chg >= 0 ? '#16a34a' : '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 2 }}>{chg >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{Math.abs(chg)}%</span> : <span style={{ color: '#ddd' }}>—</span>}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}><ChevronDown size={14} color="#ccc" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} /></td>
                  </tr>
                  <AnimatePresence>
                    {expanded && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan="6" style={{ padding: 0, background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ padding: 20 }}>
                              <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, letterSpacing: 0.5, margin: '0 0 12px', textTransform: 'uppercase' }}>📊 {MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)} Detay Analizi</p>

                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Package size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>SİPARİŞ ADEDİ</span></div>
                                  <p style={{ fontSize: 22, fontWeight: 800, color: '#E81E25', margin: 0 }}>{item.ORDER_COUNT}</p>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><DollarSign size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>TOPLAM CİRO</span></div>
                                  <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(item.TOTAL_AMOUNT)}</p>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Activity size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>ORT. SİPARİŞ</span></div>
                                  <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(avgPerOrder)}</p>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>{chg >= 0 ? <ArrowUp size={12} color="#10b981" /> : <ArrowDown size={12} color="#ef4444" />}<span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>ÖNCEKİ AY</span></div>
                                  <p style={{ fontSize: 16, fontWeight: 800, color: chg >= 0 ? '#10b981' : '#ef4444', margin: 0 }}>{idx > 0 ? `${chg >= 0 ? '+' : ''}${chg}%` : '—'}</p>
                                </div>
                              </div>

                              <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, margin: '0 0 8px' }}>📝 DÖNEM ÖZETİ</p>
                                <p style={{ fontSize: 12, color: '#333', margin: 0, lineHeight: 1.7 }}>
                                  {MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)} ayında toplam <strong>{item.ORDER_COUNT}</strong> sipariş gerçekleşti ve <strong>{fmtMoney(item.TOTAL_AMOUNT)}</strong> ciro elde edildi. Sipariş başına ortalama tutar <strong>{fmtMoney(avgPerOrder)}</strong> olup, {idx > 0 && (chg >= 0 ? <>önceki aya göre <strong style={{ color: '#10b981' }}>%{chg} artış</strong></> : <>önceki aya göre <strong style={{ color: '#ef4444' }}>%{Math.abs(chg)} düşüş</strong></>)} {idx > 0 && 'yaşandı.'} Toplam cirodaki payı <strong>%{stats.TOTAL_REVENUE > 0 ? ((Number(item.TOTAL_AMOUNT) / stats.TOTAL_REVENUE) * 100).toFixed(1) : 0}</strong>.
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody><tfoot><tr style={{ background: '#fafafa', borderTop: '2px solid #eee' }}><td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700 }}>Toplam</td><td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#E81E25' }}>{monthlyTrend.reduce((s, t) => s + t.ORDER_COUNT, 0)}</td><td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{fmtMoney(monthlyTrend.reduce((s, t) => s + Number(t.TOTAL_AMOUNT), 0))}</td><td colSpan={3} /></tr></tfoot></table>
        </div>
        </>)}
      </Modal>

      {/* ═══ FİRMALAR MODAL ═══ */}
      <Modal isOpen={activeModal === 'firms'} onClose={() => setActiveModal(null)} title="Firma Portföyü"
        subtitle={`${firmStats.length || stats.TOTAL_FIRMS} aktif müşteri firma`} icon={Building2} wide
        heroValue={stats.TOTAL_FIRMS || 0} heroLabel="Firma"
        dateRange={dateRange} onDateRangeChange={setDateRange}>
        <div style={{ background: '#fef2f2', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #fecaca', display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E81E25', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Building2 size={16} color="#fff" /></div>
          <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.7, margin: 0 }}>
            En büyük müşteri <strong>{firmStats[0]?.FIRM_NAME || '-'}</strong> firması olup toplam <strong>{fmtMoney(firmStats[0]?.TOTAL_AMOUNT)}</strong> iş hacmi bulunmaktadır. Toplam <strong>{firmStats.length || stats.TOTAL_FIRMS || 0}</strong> farklı firma ile çalışılmaktadır.
          </p>
        </div>
        <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>Firma listesi — <strong>detay için tıklayın</strong></p>
        {firmStats.map((f, idx) => {
          const maxA = firmStats[0]?.TOTAL_AMOUNT || 1;
          const pct = (Number(f.TOTAL_AMOUNT) / Number(maxA)) * 100;
          const share = stats.TOTAL_REVENUE > 0 ? ((Number(f.TOTAL_AMOUNT) / stats.TOTAL_REVENUE) * 100).toFixed(1) : 0;
          const expanded = expandedFirm === (f.ID || idx);
          const avgPerOrder = f.ORDER_COUNT > 0 ? Number(f.TOTAL_AMOUNT) / f.ORDER_COUNT : 0;
          const days = (f.FIRST_ORDER && f.LAST_ORDER) ? Math.ceil((new Date(f.LAST_ORDER) - new Date(f.FIRST_ORDER)) / (1000 * 60 * 60 * 24)) : 0;
          return (
            <motion.div key={f.ID || idx} style={{ borderRadius: 14, border: idx === 0 ? '2px solid #fecaca' : '1px solid #f0f0f0', marginBottom: 10, background: idx === 0 ? '#fef2f2' : '#fff', overflow: 'hidden' }}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.03 * idx }}>
              <div onClick={() => setExpandedFirm(expanded ? null : (f.ID || idx))}
                style={{ padding: 18, cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: idx === 0 ? '#E81E25' : '#e5e5e5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: idx === 0 ? '0 4px 12px rgba(232,30,37,0.25)' : 'none' }}><Building2 size={18} color={idx === 0 ? '#fff' : '#888'} /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 800, color: '#1a1a1a' }}>{f.FIRM_NAME}</span>
                      {idx === 0 && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#E81E25', padding: '2px 8px', borderRadius: 100 }}>LİDER</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><Package size={10} />{f.ORDER_COUNT} sipariş</span>
                      <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} />İlk: {fmtDate(f.FIRST_ORDER)}</span>
                      <span style={{ fontSize: 11, color: '#aaa', display: 'flex', alignItems: 'center', gap: 3 }}><Calendar size={10} />Son: {fmtDate(f.LAST_ORDER)}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: 18, fontWeight: 800, color: idx === 0 ? '#E81E25' : '#1a1a1a' }}>{fmtMoney(f.TOTAL_AMOUNT)}</span>
                    <p style={{ fontSize: 11, color: '#aaa', margin: '3px 0 0' }}>%{share} pay</p>
                  </div>
                  <ChevronDown size={16} color={idx === 0 ? '#E81E25' : '#ccc'} style={{ marginLeft: 4, transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ flex: 1, height: 5, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden' }}>
                    <motion.div style={{ height: '100%', borderRadius: 100, background: idx === 0 ? '#E81E25' : '#ccc' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.05 * idx, duration: 0.6 }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: idx === 0 ? '#E81E25' : '#aaa', minWidth: 36, textAlign: 'right' }}>%{pct.toFixed(0)}</span>
                </div>
              </div>

              <AnimatePresence>
                {expanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: 'hidden', borderTop: '1px solid #fecaca', background: '#fef2f2' }}>
                    <div style={{ padding: 20 }}>
                      <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, letterSpacing: 0.5, margin: '0 0 12px', textTransform: 'uppercase' }}>📊 {f.FIRM_NAME} Detay Analizi</p>

                      {/* KPI'lar */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                        <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Package size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>SİPARİŞ SAYISI</span></div>
                          <p style={{ fontSize: 22, fontWeight: 800, color: '#E81E25', margin: 0 }}>{f.ORDER_COUNT}</p>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><DollarSign size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>TOPLAM CİRO</span></div>
                          <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(f.TOTAL_AMOUNT)}</p>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Activity size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>ORT. SİPARİŞ</span></div>
                          <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(avgPerOrder)}</p>
                        </div>
                        <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Star size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>CİRO PAYI</span></div>
                          <p style={{ fontSize: 18, fontWeight: 800, color: '#E81E25', margin: 0 }}>%{share}</p>
                        </div>
                      </div>

                      {/* Zaman bilgisi */}
                      <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca', marginBottom: 12 }}>
                        <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, margin: '0 0 10px' }}>📅 İŞ İLİŞKİSİ ZAMANLAMASI</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                          <div>
                            <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>İlk Sipariş</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '3px 0 0' }}>{fmtDate(f.FIRST_ORDER)}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>Son Sipariş</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: '3px 0 0' }}>{fmtDate(f.LAST_ORDER)}</p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>İlişki Süresi</p>
                            <p style={{ fontSize: 13, fontWeight: 700, color: '#E81E25', margin: '3px 0 0' }}>{days} gün</p>
                          </div>
                        </div>
                      </div>

                      {/* Özet */}
                      <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                        <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, margin: '0 0 8px' }}>📝 FİRMA ÖZETİ</p>
                        <p style={{ fontSize: 12, color: '#333', margin: 0, lineHeight: 1.7 }}>
                          <strong>{f.FIRM_NAME}</strong> firması ile <strong>{days}</strong> gün boyunca toplam <strong>{f.ORDER_COUNT}</strong> sipariş gerçekleşti ve <strong>{fmtMoney(f.TOTAL_AMOUNT)}</strong> iş hacmi oluştu. Sipariş başına ortalama <strong>{fmtMoney(avgPerOrder)}</strong> tutarında iş yapılmakta olup, toplam cirodaki payı <strong>%{share}</strong>. {idx === 0 ? 'Bu firma portföyünüzün lideridir, ilişkiyi güçlendirmek öncelikli olmalıdır.' : idx < 3 ? 'Portföyün üst sıralarında yer alan stratejik bir müşteridir.' : 'Büyüme potansiyeli bulunan bir müşteridir.'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </Modal>

      {/* Durum Detay */}
      <Modal isOpen={activeModal === 'status'} onClose={() => setActiveModal(null)} title="Sipariş Durumları" subtitle="Tüm durumların detaylı dağılımı" icon={PieChart} iconColor="#E81E25">
        {/* Özet */}
        <div style={{ background: '#fef2f2', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #fecaca' }}>
          <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.8, margin: 0 }}>
            Siparişlerin <strong>%{deliveredPct}</strong>'i başarıyla teslim edilmiştir. Aktif süreçteki (beklemede + onaylandı + hazırlanıyor + kargoda) sipariş sayısı <strong>{(statusStats.find(s=>s.STATUS===1)?.COUNT||0) + (statusStats.find(s=>s.STATUS===2)?.COUNT||0) + (statusStats.find(s=>s.STATUS===3)?.COUNT||0) + (statusStats.find(s=>s.STATUS===4)?.COUNT||0)}</strong> adettir.
          </p>
        </div>
        {statusStats.map(item => { const s = STATUS_MAP[item.STATUS] || { label: '?', color: '#ddd', bg: '#f5f5f5', icon: Clock, desc: '' }; const Ic = s.icon; const pct = totalOrders > 0 ? ((item.COUNT / totalOrders) * 100).toFixed(0) : 0; return (
          <div key={item.STATUS} style={{ padding: 16, borderRadius: 12, border: '1px solid #f0f0f0', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><Ic size={18} style={{ color: s.color }} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{s.label}</span>
                <span style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{item.COUNT}</span>
              </div>
              <p style={{ fontSize: 11, color: '#bbb', margin: '0 0 6px' }}>{s.desc} · %{pct}</p>
              <div style={{ height: 4, background: '#f0f0f0', borderRadius: 100, overflow: 'hidden' }}><div style={{ height: '100%', borderRadius: 100, background: s.color, width: `${pct}%` }} /></div>
            </div>
          </div>
        ); })}
      </Modal>

      {/* Trend Detay */}
      <Modal isOpen={activeModal === 'trend'} onClose={() => setActiveModal(null)} title="Aylık Sipariş Trendi" subtitle="Son 12 aylık detaylı analiz" icon={BarChart3} wide
        heroValue={monthlyTrend.reduce((s, m) => s + m.ORDER_COUNT, 0)} heroLabel="Sipariş"
        dateRange={dateRange} onDateRangeChange={setDateRange}>
        {/* Özet */}
        <div style={{ background: '#fef2f2', borderRadius: 14, padding: 18, marginBottom: 20, border: '1px solid #fecaca', display: 'flex', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#E81E25', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><BarChart3 size={16} color="#fff" /></div>
          <p style={{ fontSize: 13, color: '#991b1b', lineHeight: 1.7, margin: 0 }}>
            Son 12 ayda toplam <strong>{monthlyTrend.reduce((s, m) => s + m.ORDER_COUNT, 0)}</strong> sipariş ile <strong>{fmtMoney(monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0))}</strong> ciro. Aylık ortalama <strong>{fmtMoney(monthlyTrend.length > 0 ? monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0) / monthlyTrend.length : 0)}</strong>. En yoğun ay <strong>{monthlyTrend.length > 0 ? (() => { const m = monthlyTrend.reduce((max, cur) => cur.ORDER_COUNT > max.ORDER_COUNT ? cur : max); return `${MONTH_NAMES[m.MONTH.slice(5)] || ''} (${m.ORDER_COUNT} sipariş)`; })() : '-'}</strong>.
          </p>
        </div>

        <p style={{ fontSize: 12, color: '#888', margin: '0 0 14px' }}>Aylık detay tablo — <strong>ay detayı için tıklayın</strong></p>
        <div style={{ borderRadius: 12, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}><thead><tr style={{ background: '#fafafa' }}>
            {['Ay', 'Sipariş', 'Ciro', 'Ortalama', 'Değişim', ''].map(h => <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 600, color: '#999', textAlign: h === 'Sipariş' ? 'center' : h === 'Ay' ? 'left' : 'right' }}>{h}</th>)}
          </tr></thead><tbody>
            {monthlyTrend.map((item, idx) => {
              const mk = item.MONTH.slice(5);
              const prev = idx > 0 ? Number(monthlyTrend[idx - 1].TOTAL_AMOUNT) : 0;
              const chg = prev > 0 ? Math.round(((Number(item.TOTAL_AMOUNT) - prev) / prev) * 100) : 0;
              const expanded = expandedMonth === item.MONTH;
              const avgPerOrder = item.ORDER_COUNT > 0 ? Number(item.TOTAL_AMOUNT) / item.ORDER_COUNT : 0;
              const totalRev = monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0);
              const sharePct = totalRev > 0 ? ((Number(item.TOTAL_AMOUNT) / totalRev) * 100).toFixed(1) : 0;
              const maxAmt = Math.max(...monthlyTrend.map(m => Number(m.TOTAL_AMOUNT)));
              const isHighest = Number(item.TOTAL_AMOUNT) === maxAmt;
              return (
                <React.Fragment key={item.MONTH}>
                  <tr style={{ borderTop: '1px solid #f5f5f5', cursor: 'pointer', background: expanded ? '#fef2f2' : 'transparent' }}
                    onClick={() => setExpandedMonth(expanded ? null : item.MONTH)}
                    onMouseEnter={e => { if (!expanded) e.currentTarget.style.background = '#fafafa'; }}
                    onMouseLeave={e => { if (!expanded) e.currentTarget.style.background = 'transparent'; }}>
                    <td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 500, color: '#333' }}>{MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#E81E25' }}>{item.ORDER_COUNT}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700, color: '#1a1a1a' }}>{fmtMoney(item.TOTAL_AMOUNT)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, color: '#888' }}>{fmtMoney(avgPerOrder)}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'right' }}>{idx > 0 ? <span style={{ fontSize: 11, fontWeight: 700, color: chg >= 0 ? '#16a34a' : '#dc2626', display: 'inline-flex', alignItems: 'center', gap: 2 }}>{chg >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{Math.abs(chg)}%</span> : <span style={{ color: '#ddd' }}>—</span>}</td>
                    <td style={{ padding: '10px 14px', textAlign: 'center' }}><ChevronDown size={14} color="#ccc" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} /></td>
                  </tr>
                  <AnimatePresence>
                    {expanded && (
                      <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <td colSpan="6" style={{ padding: 0, background: '#fef2f2', borderTop: '1px solid #fecaca' }}>
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
                            <div style={{ padding: 20 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, letterSpacing: 0.5, margin: 0, textTransform: 'uppercase' }}>📊 {MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)} Dönem Analizi</p>
                                {isHighest && <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#f59e0b', padding: '2px 8px', borderRadius: 100 }}>⭐ ZİRVE AYI</span>}
                              </div>

                              {/* KPI kartları */}
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Package size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>SİPARİŞ SAYISI</span></div>
                                  <p style={{ fontSize: 22, fontWeight: 800, color: '#E81E25', margin: 0 }}>{item.ORDER_COUNT}</p>
                                  <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0' }}>Ay içinde verilen</p>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><DollarSign size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>TOPLAM CİRO</span></div>
                                  <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(item.TOTAL_AMOUNT)}</p>
                                  <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0' }}>Toplam iş hacmi</p>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Activity size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>ORT. SİPARİŞ</span></div>
                                  <p style={{ fontSize: 14, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(avgPerOrder)}</p>
                                  <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0' }}>Sipariş başı</p>
                                </div>
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}><Star size={12} color="#E81E25" /><span style={{ fontSize: 10, color: '#991b1b', fontWeight: 700 }}>CİRO PAYI</span></div>
                                  <p style={{ fontSize: 18, fontWeight: 800, color: '#E81E25', margin: 0 }}>%{sharePct}</p>
                                  <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0' }}>Yıllık toplamda</p>
                                </div>
                              </div>

                              {/* Karşılaştırma */}
                              {idx > 0 && (
                                <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca', marginBottom: 12 }}>
                                  <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, margin: '0 0 10px' }}>📈 ÖNCEKİ AY KARŞILAŞTIRMASI</p>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{MONTH_NAMES[monthlyTrend[idx - 1].MONTH.slice(5)]} {monthlyTrend[idx - 1].MONTH.slice(0, 4)}</p>
                                      <p style={{ fontSize: 14, fontWeight: 700, color: '#666', margin: '3px 0 0' }}>{fmtMoney(monthlyTrend[idx - 1].TOTAL_AMOUNT)}</p>
                                    </div>
                                    <div style={{ fontSize: 24, color: '#ddd' }}>→</div>
                                    <div style={{ flex: 1 }}>
                                      <p style={{ fontSize: 10, color: '#aaa', margin: 0 }}>{MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)}</p>
                                      <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: '3px 0 0' }}>{fmtMoney(item.TOTAL_AMOUNT)}</p>
                                    </div>
                                    <div style={{ padding: '8px 16px', borderRadius: 10, background: chg >= 0 ? '#ecfdf5' : '#fef2f2', border: `1px solid ${chg >= 0 ? '#a7f3d0' : '#fecaca'}` }}>
                                      <p style={{ fontSize: 16, fontWeight: 800, color: chg >= 0 ? '#10b981' : '#ef4444', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                        {chg >= 0 ? <ArrowUp size={14} /> : <ArrowDown size={14} />}%{Math.abs(chg)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}

                              {/* Dönem Özeti */}
                              <div style={{ background: '#fff', borderRadius: 10, padding: 14, border: '1px solid #fecaca' }}>
                                <p style={{ fontSize: 11, color: '#991b1b', fontWeight: 700, margin: '0 0 8px' }}>📝 DÖNEM ÖZETİ</p>
                                <p style={{ fontSize: 12, color: '#333', margin: 0, lineHeight: 1.7 }}>
                                  <strong>{MONTH_NAMES[mk]} {item.MONTH.slice(0, 4)}</strong> ayında toplam <strong>{item.ORDER_COUNT}</strong> sipariş gerçekleşti ve <strong>{fmtMoney(item.TOTAL_AMOUNT)}</strong> ciro elde edildi. Sipariş başına ortalama <strong>{fmtMoney(avgPerOrder)}</strong> tutarında iş yapıldı. Bu ay, yıllık toplam cironun <strong>%{sharePct}</strong>'ini oluşturuyor. {idx > 0 && (chg >= 0 ? <>Bir önceki aya göre <strong style={{ color: '#10b981' }}>%{chg} artış</strong> kaydedildi.</> : <>Bir önceki aya göre <strong style={{ color: '#ef4444' }}>%{Math.abs(chg)} düşüş</strong> yaşandı.</>)} {isHighest && ' Bu ay, dönem içindeki en yüksek ciroyu kaydeden aydır.'}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              );
            })}
          </tbody><tfoot><tr style={{ background: '#fafafa', borderTop: '2px solid #eee' }}><td style={{ padding: '10px 14px', fontSize: 12, fontWeight: 700 }}>Toplam</td><td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, fontWeight: 700, color: '#E81E25' }}>{monthlyTrend.reduce((s, t) => s + t.ORDER_COUNT, 0)}</td><td style={{ padding: '10px 14px', textAlign: 'right', fontSize: 12, fontWeight: 700 }}>{fmtMoney(monthlyTrend.reduce((s, t) => s + Number(t.TOTAL_AMOUNT), 0))}</td><td colSpan={3} /></tr></tfoot></table>
        </div>
      </Modal>
    </div>
  );
});

PartnerDashboard.displayName = 'PartnerDashboard';
export default PartnerDashboard;
