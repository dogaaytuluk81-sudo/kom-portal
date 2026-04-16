import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Star, Clock, ShieldCheck, Zap, TrendingUp, CheckCircle2, Package } from 'lucide-react';
import api from '../../api.js';
import { DarkHero, Badge } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };
const BADGE_ICONS = { clock: Clock, shield: ShieldCheck, zap: Zap, award: Award };

const SupplierPerformance = () => {
  const user = getUser();
  const [perf, setPerf] = useState(null);

  useEffect(() => {
    api.post('/api/supplier/performance', { firm: user.firm }).then(r => setPerf(r.data.data || null));
  }, []);

  if (!perf) return <DarkHero icon={Award} label="Performans" title="Yükleniyor..." accentColor="#3b82f6"><div /></DarkHero>;

  const metrics = [
    { label: 'Genel Puan', value: `${perf.rating}/5`, color: '#f59e0b', icon: Star },
    { label: 'Zamanında Teslimat', value: `${perf.onTimeDelivery}%`, color: '#10b981', icon: Clock },
    { label: 'Kalite Skoru', value: `${perf.qualityScore}%`, color: '#3b82f6', icon: ShieldCheck },
    { label: 'Yanıt Süresi', value: perf.responseTime, color: '#8b5cf6', icon: Zap },
  ];

  return (
    <DarkHero icon={Award} label="Performans" title="Performans Raporum" subtitle={`${user.firm} · KOM değerlendirmesi`} accentColor="#f59e0b"
      stats={metrics.map(m => ({ label: m.label, value: m.value, color: m.color }))}
    >
      {/* Detaylı Metrikler */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Sipariş İstatistikleri</h3>
          {[
            { label: 'Toplam Sipariş', value: perf.totalOrders, color: '#0f172a' },
            { label: 'Tamamlanan', value: perf.completedOrders, color: '#10b981' },
            { label: 'İade Oranı', value: `%${perf.returnRate}`, color: perf.returnRate > 3 ? '#ef4444' : '#10b981' },
            { label: 'Ort. Teslimat Süresi', value: `${perf.avgDeliveryDays} gün`, color: '#3b82f6' },
          ].map((m, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < 3 ? '1px solid #f1f5f9' : 'none' }}>
              <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{m.label}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: m.color }}>{m.value}</span>
            </div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 18px' }}>Rozetler</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {perf.badges.map((b, i) => {
              const BIcon = BADGE_ICONS[b.icon] || Award;
              return (
                <div key={i} style={{
                  padding: 16, borderRadius: 12, textAlign: 'center',
                  background: b.earned ? '#ecfdf5' : '#f8fafc',
                  border: `1px solid ${b.earned ? '#a7f3d0' : '#e2e8f0'}`,
                  opacity: b.earned ? 1 : 0.5
                }}>
                  <BIcon size={22} color={b.earned ? '#10b981' : '#94a3b8'} style={{ margin: '0 auto 8px' }} />
                  <p style={{ fontSize: 11, fontWeight: 700, color: b.earned ? '#059669' : '#94a3b8', margin: 0 }}>{b.name}</p>
                  {!b.earned && <p style={{ fontSize: 10, color: '#cbd5e1', margin: '4px 0 0' }}>Henüz kazanılmadı</p>}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Aylık Performans Trend */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 24px' }}>Aylık Performans Trendi</h3>
        <div style={{ position: 'relative', height: 180 }}>
          {/* Yatay grid çizgileri */}
          {[100, 75, 50, 25].map(v => (
            <div key={v} style={{ position: 'absolute', left: 0, right: 0, top: `${100 - v}%`, borderTop: '1px dashed #f1f5f9', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: 9, color: '#cbd5e1', fontWeight: 600, minWidth: 24 }}>{v}</span>
            </div>
          ))}
          {/* Çizgi grafik SVG */}
          <svg width="100%" height="100%" viewBox="0 0 600 180" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0 }}>
            <defs>
              <linearGradient id="perfGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const data = perf.monthlyPerformance;
              const n = data.length;
              const pts = data.map((m, i) => ({ x: (i / (n - 1)) * 540 + 30, y: 180 - (m.score / 100) * 160 }));
              const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
              const areaPath = `${linePath} L ${pts[n-1].x} 180 L ${pts[0].x} 180 Z`;
              return (
                <>
                  <path d={areaPath} fill="url(#perfGrad)" />
                  <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <circle key={i} cx={p.x} cy={p.y} r="5" fill="#fff" stroke={data[i].score >= 95 ? '#10b981' : data[i].score >= 90 ? '#3b82f6' : '#f59e0b'} strokeWidth="2.5" />
                  ))}
                </>
              );
            })()}
          </svg>
        </div>
        {/* Ay etiketleri */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, paddingLeft: 24 }}>
          {perf.monthlyPerformance.map((m, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: m.score >= 95 ? '#10b981' : m.score >= 90 ? '#3b82f6' : '#f59e0b', display: 'block' }}>{m.score}</span>
              <span style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{m.month.slice(5)}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </DarkHero>
  );
};

export default SupplierPerformance;
