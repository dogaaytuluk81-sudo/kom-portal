import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, X, TrendingUp, Package, Building2, ChevronRight, Phone, Mail, User,
  BarChart3, Star, MapPin, Hash, Calendar, DollarSign, Activity, Award, Target,
  Briefcase, FileText, ExternalLink, Info, Zap, Clock, CheckCircle2
} from 'lucide-react';
import api from '../../api.js';

const STATUS_MAP = { 1: { label: 'Beklemede', color: '#f59e0b' }, 2: { label: 'Onaylandı', color: '#3b82f6' }, 3: { label: 'Hazırlanıyor', color: '#8b5cf6' }, 4: { label: 'Kargoda', color: '#06b6d4' }, 5: { label: 'Teslim Edildi', color: '#10b981' }, 6: { label: 'İptal', color: '#ef4444' } };
const MONTH_NAMES = { '01': 'Oca', '02': 'Şub', '03': 'Mar', '04': 'Nis', '05': 'May', '06': 'Haz', '07': 'Tem', '08': 'Ağu', '09': 'Eyl', '10': 'Eki', '11': 'Kas', '12': 'Ara' };
const fmtMoney = (v) => `₺${Number(v || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// Yeni Tedarikçi Modal
const CreateModal = memo(({ isOpen, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', contactName: '', phone: '', email: '', address: '', taxOffice: '', taxNumber: '' });
  const [loading, setLoading] = useState(false);
  if (!isOpen) return null;
  const s = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const inp = { width: '100%', padding: '12px 14px', border: '2px solid #f0f0f0', borderRadius: 12, fontSize: 13, outline: 'none', fontFamily: 'inherit', background: '#fafafa' };

  return (
    <AnimatePresence>
      <motion.div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
        <motion.div style={{ position: 'relative', background: '#fff', borderRadius: 24, maxWidth: 520, width: '100%', maxHeight: '90vh', overflow: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.2)' }}
          initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} color="#E81E25" /></div>
              <div><h3 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>Yeni Tedarikçi</h3><p style={{ fontSize: 12, color: '#aaa', margin: '2px 0 0' }}>Bilgileri girin</p></div>
            </div>
            <button onClick={onClose} style={{ width: 36, height: 36, borderRadius: 10, border: 'none', background: '#f5f5f5', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={16} color="#999" /></button>
          </div>
          <form onSubmit={async e => { e.preventDefault(); if (!form.name.trim()) { toast.error('Firma adı zorunlu'); return; } setLoading(true); try { const r = await api.post('/api/partners/suppliers/create', form); if (r.data.success) { toast.success('Oluşturuldu'); onCreated(); onClose(); } } catch { toast.error('Hata'); } finally { setLoading(false); } }}
            style={{ padding: 28 }}>
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Firma Adı *</label><input value={form.name} onChange={e => s('name', e.target.value)} style={inp} placeholder="Tedarikçi firma adı" /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Yetkili Kişi</label><input value={form.contactName} onChange={e => s('contactName', e.target.value)} style={inp} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Telefon</label><input value={form.phone} onChange={e => s('phone', e.target.value)} style={inp} /></div>
            </div>
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>E-posta</label><input value={form.email} onChange={e => s('email', e.target.value)} style={inp} /></div>
            <div style={{ marginBottom: 14 }}><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Adres</label><textarea value={form.address} onChange={e => s('address', e.target.value)} style={{ ...inp, resize: 'vertical' }} rows={2} /></div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Vergi Dairesi</label><input value={form.taxOffice} onChange={e => s('taxOffice', e.target.value)} style={inp} /></div>
              <div><label style={{ fontSize: 12, fontWeight: 600, color: '#666', display: 'block', marginBottom: 6 }}>Vergi No</label><input value={form.taxNumber} onChange={e => s('taxNumber', e.target.value)} style={inp} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={loading} style={{ flex: 1, padding: 14, borderRadius: 12, border: 'none', background: '#E81E25', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.6 : 1 }}>{loading ? 'Kaydediliyor...' : 'Oluştur'}</button>
              <button type="button" onClick={onClose} style={{ flex: 1, padding: 14, borderRadius: 12, border: '2px solid #f0f0f0', background: '#fff', color: '#666', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>İptal</button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
});
CreateModal.displayName = 'CreateModal';

// Analiz Paneli - Sekmeli
const Analysis = memo(({ supplier, supplierId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ozet');

  useEffect(() => {
    if (!supplierId) return;
    setLoading(true);
    api.post('/api/partners/suppliers/analysis', { supplierId }).then(r => { if (r.data.success) setData(r.data.data); }).catch(() => toast.error('Yüklenemedi')).finally(() => setLoading(false));
  }, [supplierId]);

  if (loading) return <div style={{ padding: 60, textAlign: 'center', background: '#fff', borderRadius: 18 }}><div style={{ width: 40, height: 40, border: '3px solid #fee2e2', borderTopColor: '#E81E25', borderRadius: '50%', margin: '0 auto 12px' }} className="animate-spin" /><p style={{ color: '#ccc' }}>Yükleniyor...</p></div>;
  if (!data) return null;
  const stats = data.stats || {};
  const initials = supplier?.NAME?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Hero Başlık */}
      <div style={{ background: 'linear-gradient(135deg, #E81E25, #b91c1c)', borderRadius: 20, padding: 28, position: 'relative', overflow: 'hidden', color: '#fff' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(255,255,255,0.06)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -30, left: 50, width: 120, height: 120, background: 'rgba(255,255,255,0.04)', borderRadius: '50%' }} />
        <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, width: 36, height: 36, borderRadius: 10, border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2 }}><X size={16} color="#fff" /></button>
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 80, height: 80, borderRadius: 20, background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 800, flexShrink: 0 }}>{initials}</div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: '0 0 4px' }}>Tedarikçi Profili</p>
            <h3 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.5 }}>{data.supplier?.NAME}</h3>
            <div style={{ display: 'flex', gap: 16, marginTop: 10, flexWrap: 'wrap' }}>
              {data.supplier?.CONTACT_NAME && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}><User size={12} />{data.supplier.CONTACT_NAME}</span>}
              {data.supplier?.PHONE && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}><Phone size={12} />{data.supplier.PHONE}</span>}
              {data.supplier?.EMAIL && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', gap: 5 }}><Mail size={12} />{data.supplier.EMAIL}</span>}
            </div>
          </div>
        </div>

        {/* Mini Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 24, position: 'relative', zIndex: 1 }}>
          {[
            { label: 'Sipariş', value: stats.TOTAL_ORDERS || 0 },
            { label: 'İş Hacmi', value: fmtMoney(stats.TOTAL_AMOUNT) },
            { label: 'Ortalama', value: fmtMoney(stats.AVG_ORDER_AMOUNT) },
            { label: 'Firma', value: data.firmDistribution?.length || 0 },
          ].map((k, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 12, padding: '12px 14px', backdropFilter: 'blur(10px)' }}>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600, margin: 0, letterSpacing: 0.5 }}>{k.label.toUpperCase()}</p>
              <p style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '3px 0 0' }}>{k.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #f0f0f0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '0 20px' }}>
          {[
            { id: 'ozet', label: 'Özet', icon: Activity },
            { id: 'firma', label: 'Firmalar', icon: Building2 },
            { id: 'durum', label: 'Durumlar', icon: Target },
            { id: 'trend', label: 'Trend', icon: TrendingUp },
            { id: 'bilgi', label: 'İletişim', icon: Info },
          ].map(t => {
            const active = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding: '14px 16px', border: 'none', background: 'none', cursor: 'pointer', borderBottom: active ? '2px solid #E81E25' : '2px solid transparent', color: active ? '#E81E25' : '#888', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
                <t.icon size={13} /> {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab içerikleri */}
        <div style={{ padding: 24 }}>

          {tab === 'ozet' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {/* 3 Performance Kartı */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20 }}>
                <div style={{ padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, #fef2f2, #fee2e2)', border: '1px solid #fecaca' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Package size={16} color="#E81E25" /><span style={{ fontSize: 11, color: '#991b1b', fontWeight: 600 }}>TOPLAM SİPARİŞ</span></div>
                  <p style={{ fontSize: 28, fontWeight: 800, color: '#E81E25', margin: 0 }}>{stats.TOTAL_ORDERS || 0}</p>
                  <p style={{ fontSize: 11, color: '#991b1b', margin: '4px 0 0' }}>Tüm dönem toplam</p>
                </div>
                <div style={{ padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, #ecfdf5, #d1fae5)', border: '1px solid #a7f3d0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><DollarSign size={16} color="#10b981" /><span style={{ fontSize: 11, color: '#065f46', fontWeight: 600 }}>İŞ HACMİ</span></div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#059669', margin: 0 }}>{fmtMoney(stats.TOTAL_AMOUNT)}</p>
                  <p style={{ fontSize: 11, color: '#065f46', margin: '4px 0 0' }}>Toplam ciro</p>
                </div>
                <div style={{ padding: 18, borderRadius: 14, background: 'linear-gradient(135deg, #fffbeb, #fef3c7)', border: '1px solid #fde68a' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Star size={16} color="#f59e0b" /><span style={{ fontSize: 11, color: '#78350f', fontWeight: 600 }}>ORTALAMA SİPARİŞ</span></div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#d97706', margin: 0 }}>{fmtMoney(stats.AVG_ORDER_AMOUNT)}</p>
                  <p style={{ fontSize: 11, color: '#78350f', margin: '4px 0 0' }}>Sipariş başı</p>
                </div>
              </div>

              {/* Performans Puanı */}
              <div style={{ padding: 20, borderRadius: 14, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Award size={16} color="#E81E25" /><span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>Performans Skoru</span></div>
                  <span style={{ fontSize: 24, fontWeight: 800, color: '#E81E25' }}>8.5<span style={{ fontSize: 14, color: '#aaa' }}>/10</span></span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 12 }}>
                  {[
                    { label: 'Teslimat', score: 9 },
                    { label: 'Kalite', score: 8 },
                    { label: 'Fiyat', score: 8 },
                    { label: 'İletişim', score: 9 },
                  ].map((m, i) => (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 11, color: '#666' }}>{m.label}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#1a1a1a' }}>{m.score}/10</span>
                      </div>
                      <div style={{ height: 4, background: '#e5e5e5', borderRadius: 100, overflow: 'hidden' }}>
                        <motion.div style={{ height: '100%', borderRadius: 100, background: '#E81E25' }} initial={{ width: 0 }} animate={{ width: `${m.score * 10}%` }} transition={{ delay: 0.1 * i, duration: 0.6 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {tab === 'firma' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>Bu tedarikçi aşağıdaki firmalara hizmet vermektedir. Detaylar ve iş hacmi dağılımı:</p>
              {data.firmDistribution?.length > 0 ? data.firmDistribution.map((f, i) => {
                const maxA = data.firmDistribution[0]?.TOTAL_AMOUNT || 1;
                const pct = (Number(f.TOTAL_AMOUNT) / Number(maxA)) * 100;
                return (
                  <div key={i} style={{ marginBottom: 14, padding: 16, borderRadius: 12, background: i === 0 ? '#fef2f2' : '#fafafa', border: `1px solid ${i === 0 ? '#fecaca' : '#f0f0f0'}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: i === 0 ? '#E81E25' : '#e5e5e5', color: i === 0 ? '#fff' : '#888', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700 }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{f.FIRM_NAME || '-'}</p>
                        <p style={{ fontSize: 11, color: '#aaa', margin: '2px 0 0' }}>{f.ORDER_COUNT} sipariş gerçekleştirildi</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 16, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{fmtMoney(f.TOTAL_AMOUNT)}</p>
                        <p style={{ fontSize: 10, color: '#aaa', margin: '2px 0 0' }}>Toplam tutar</p>
                      </div>
                    </div>
                    <div style={{ height: 4, background: '#fff', borderRadius: 100, overflow: 'hidden' }}>
                      <motion.div style={{ height: '100%', borderRadius: 100, background: i === 0 ? '#E81E25' : '#ddd' }} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.1 * i, duration: 0.6 }} />
                    </div>
                  </div>
                );
              }) : <p style={{ textAlign: 'center', color: '#ccc', padding: 40 }}>Henüz firma kaydı yok</p>}
            </motion.div>
          )}

          {tab === 'durum' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>Tedarikçinin siparişlerinin mevcut durum dağılımı:</p>
              {data.statusDistribution?.length > 0 ? data.statusDistribution.map(item => {
                const s = STATUS_MAP[item.STATUS] || { label: '?', color: '#aaa' };
                const totalCount = data.statusDistribution.reduce((sum, x) => sum + x.COUNT, 0);
                const pct = (item.COUNT / totalCount * 100).toFixed(0);
                return (
                  <div key={item.STATUS} style={{ marginBottom: 12, padding: 16, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: `${s.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <CheckCircle2 size={18} color={s.color} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a' }}>{s.label}</span>
                        <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{item.COUNT}</span>
                      </div>
                      <div style={{ height: 4, background: '#e5e5e5', borderRadius: 100, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 100, background: s.color, width: `${pct}%` }} />
                      </div>
                      <p style={{ fontSize: 10, color: '#aaa', margin: '4px 0 0' }}>Siparişlerin %{pct}'i</p>
                    </div>
                  </div>
                );
              }) : <p style={{ textAlign: 'center', color: '#ccc', padding: 40 }}>Durum verisi yok</p>}
            </motion.div>
          )}

          {tab === 'trend' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p style={{ fontSize: 12, color: '#888', margin: '0 0 20px' }}>Aylık sipariş ve ciro trendi:</p>
              {data.monthlyTrend?.length > 0 ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 180, marginBottom: 20 }}>
                    {data.monthlyTrend.map((item, idx) => {
                      const maxA = Math.max(...data.monthlyTrend.map(t => Number(t.TOTAL_AMOUNT)), 1);
                      const h = (Number(item.TOTAL_AMOUNT) / maxA) * 100;
                      return (
                        <div key={item.MONTH} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#E81E25', marginBottom: 4 }}>
                            {Number(item.TOTAL_AMOUNT) >= 1000 ? `${(Number(item.TOTAL_AMOUNT) / 1000).toFixed(0)}K` : ''}
                          </span>
                          <motion.div style={{ width: '100%', borderRadius: 8, background: 'linear-gradient(180deg, #E81E25, #b91c1c)', position: 'relative', minHeight: 10, height: `${Math.max(h, 10)}%`, transformOrigin: 'bottom', boxShadow: '0 4px 12px rgba(232,30,37,0.15)' }}
                            initial={{ scaleY: 0 }} animate={{ scaleY: 1 }} transition={{ delay: 0.05 * idx, duration: 0.5 }}>
                            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 10, fontWeight: 700 }}>{item.ORDER_COUNT}</div>
                          </motion.div>
                          <span style={{ fontSize: 10, color: '#aaa', marginTop: 6, fontWeight: 500 }}>{MONTH_NAMES[item.MONTH.slice(5)]}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ padding: 14, borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca' }}>
                    <p style={{ fontSize: 12, color: '#991b1b', margin: 0 }}>
                      <strong>Analiz:</strong> Son {data.monthlyTrend.length} ayda toplam <strong>{data.monthlyTrend.reduce((s, m) => s + m.ORDER_COUNT, 0)} sipariş</strong> ve <strong>{fmtMoney(data.monthlyTrend.reduce((s, m) => s + Number(m.TOTAL_AMOUNT), 0))}</strong> iş hacmi oluştu.
                    </p>
                  </div>
                </>
              ) : <p style={{ textAlign: 'center', color: '#ccc', padding: 40 }}>Trend verisi yok</p>}
            </motion.div>
          )}

          {tab === 'bilgi' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ padding: 18, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><User size={14} color="#aaa" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>YETKİLİ KİŞİ</span></div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{data.supplier?.CONTACT_NAME || '-'}</p>
                </div>
                <div style={{ padding: 18, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Phone size={14} color="#aaa" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>TELEFON</span></div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{data.supplier?.PHONE || '-'}</p>
                </div>
                <div style={{ padding: 18, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Mail size={14} color="#aaa" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>E-POSTA</span></div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0, wordBreak: 'break-all' }}>{data.supplier?.EMAIL || '-'}</p>
                </div>
                <div style={{ padding: 18, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><Hash size={14} color="#aaa" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>VERGİ NO</span></div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{supplier?.TAX_NUMBER || '-'}</p>
                </div>
              </div>
              {supplier?.ADDRESS && (
                <div style={{ padding: 18, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}><MapPin size={14} color="#aaa" /><span style={{ fontSize: 11, color: '#aaa', fontWeight: 600 }}>ADRES</span></div>
                  <p style={{ fontSize: 13, color: '#333', margin: 0, lineHeight: 1.6 }}>{supplier.ADDRESS}</p>
                  {supplier?.CITY_NAME && <p style={{ fontSize: 12, color: '#999', margin: '4px 0 0' }}>📍 {supplier.CITY_NAME}</p>}
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
});
Analysis.displayName = 'Analysis';

// Ana Sayfa
const PartnerSuppliers = memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedId, setSelectedId] = useState(searchParams.get('id') ? parseInt(searchParams.get('id')) : null);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await api.post('/api/partners/suppliers'); if (r.data.success) setSuppliers(r.data.data); } catch { toast.error('Yüklenemedi'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = suppliers.filter(s => {
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return s.NAME?.toLowerCase().includes(t) || s.CONTACT_NAME?.toLowerCase().includes(t) || s.CITY_NAME?.toLowerCase().includes(t);
  });

  const select = useCallback((id) => {
    setSelectedId(p => p === id ? null : id);
    if (id) setSearchParams({ id: id.toString() }); else setSearchParams({});
  }, [setSearchParams]);

  const selectedSupplier = useMemo(() => suppliers.find(s => s.ID === selectedId), [suppliers, selectedId]);

  // Özet istatistikler
  const stats = useMemo(() => ({
    total: suppliers.length,
    cities: new Set(suppliers.map(s => s.CITY_NAME).filter(Boolean)).size,
    withEmail: suppliers.filter(s => s.EMAIL).length,
    withPhone: suppliers.filter(s => s.PHONE).length,
  }), [suppliers]);

  return (
    <div style={{ padding: 24, maxWidth: 1600, margin: '0 auto' }}>
      {/* Header */}
      <motion.div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div><h1 style={{ fontSize: 24, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>Tedarikçiler</h1><p style={{ fontSize: 13, color: '#aaa', margin: '4px 0 0' }}>Tedarikçi bilgileri ve performans analizi</p></div>
        <button onClick={() => setShowCreate(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 12, border: 'none', background: '#E81E25', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}><Plus size={16} /> Yeni Tedarikçi</button>
      </motion.div>

      {/* Özet Kartlar */}
      <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        {[
          { label: 'Toplam Tedarikçi', value: stats.total, icon: Briefcase, color: '#E81E25' },
          { label: 'Farklı Şehir', value: stats.cities, icon: MapPin, color: '#3b82f6' },
          { label: 'E-postası Olan', value: stats.withEmail, icon: Mail, color: '#10b981' },
          { label: 'Telefonu Olan', value: stats.withPhone, icon: Phone, color: '#f59e0b' },
        ].map((k, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: 16, border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: `${k.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><k.icon size={18} color={k.color} /></div>
            <div><p style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: 0 }}>{k.value}</p><p style={{ fontSize: 11, color: '#aaa', margin: 0 }}>{k.label}</p></div>
          </div>
        ))}
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: 20 }}>
        {/* Sol: Liste */}
        <motion.div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f0f0f0', overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', alignSelf: 'start', position: 'sticky', top: 20 }}
          initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <div style={{ padding: 16, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ position: 'relative' }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#ccc' }} />
              <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tedarikçi, yetkili veya şehir ara..."
                style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: 10, border: '2px solid #f0f0f0', fontSize: 13, outline: 'none', fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ maxHeight: 640, overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: 40, textAlign: 'center' }}><div style={{ width: 30, height: 30, border: '3px solid #fee2e2', borderTopColor: '#E81E25', borderRadius: '50%', margin: '0 auto' }} className="animate-spin" /></div>
            ) : filtered.length === 0 ? (
              <p style={{ padding: 40, textAlign: 'center', color: '#ccc', fontSize: 13 }}>Bulunamadı</p>
            ) : filtered.map((s, idx) => {
              const active = selectedId === s.ID;
              const initials = s.NAME?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
              return (
                <motion.div key={s.ID} onClick={() => select(s.ID)}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.02 * idx }}
                  whileHover={{ x: 4 }}
                  style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: '1px solid #f7f7f7', borderLeft: active ? '3px solid #E81E25' : '3px solid transparent', background: active ? '#fef2f2' : 'transparent', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: active ? '#E81E25' : '#f5f5f5', color: active ? '#fff' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0, boxShadow: active ? '0 4px 12px rgba(232,30,37,0.25)' : 'none' }}>{initials}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: active ? '#E81E25' : '#333', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.NAME}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                      {s.CONTACT_NAME && <span style={{ fontSize: 10, color: '#aaa' }}>{s.CONTACT_NAME}</span>}
                      {s.CITY_NAME && <><span style={{ fontSize: 10, color: '#ddd' }}>·</span><span style={{ fontSize: 10, color: '#aaa' }}>{s.CITY_NAME}</span></>}
                    </div>
                  </div>
                  <ChevronRight size={14} color={active ? '#E81E25' : '#ddd'} />
                </motion.div>
              );
            })}
          </div>
          <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', fontSize: 11, color: '#aaa', textAlign: 'center' }}>{filtered.length} tedarikçi gösteriliyor</div>
        </motion.div>

        {/* Sağ: Analiz */}
        <div>
          {selectedId ? (
            <Analysis supplier={selectedSupplier} supplierId={selectedId} onClose={() => select(null)} />
          ) : (
            <motion.div style={{ background: '#fff', borderRadius: 18, padding: 60, border: '1px solid #f0f0f0', textAlign: 'center' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <BarChart3 size={36} color="#E81E25" />
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#1a1a1a', margin: '0 0 8px' }}>Tedarikçi Seçin</h3>
              <p style={{ fontSize: 13, color: '#888', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>Sol listeden bir tedarikçi seçerek detaylı performans analizini, sipariş istatistiklerini, firma dağılımını, aylık trendi ve iletişim bilgilerini görüntüleyebilirsiniz.</p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 36, maxWidth: 500, margin: '36px auto 0' }}>
                {[
                  { icon: Activity, label: 'Özet' },
                  { icon: Building2, label: 'Firmalar' },
                  { icon: Target, label: 'Durumlar' },
                  { icon: TrendingUp, label: 'Trend' },
                ].map((f, i) => (
                  <div key={i} style={{ padding: 14, borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0', textAlign: 'center' }}>
                    <f.icon size={18} color="#E81E25" style={{ margin: '0 auto 6px', display: 'block' }} />
                    <p style={{ fontSize: 11, fontWeight: 600, color: '#888', margin: 0 }}>{f.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <CreateModal isOpen={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
    </div>
  );
});

PartnerSuppliers.displayName = 'PartnerSuppliers';
export default PartnerSuppliers;
