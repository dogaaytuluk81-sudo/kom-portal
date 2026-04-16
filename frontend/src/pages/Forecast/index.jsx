import { useEffect, useState, useRef } from 'react';
import { motion, animate } from 'framer-motion';
import {
  Brain, TrendingUp, TrendingDown, Target, DollarSign,
  Package, Users, Sparkles, Zap, ArrowUp, Activity, AlertCircle,
  Trophy, BarChart3
} from 'lucide-react';
import api from '../../api.js';
import { fmtMoney, DateFilter, InfoTip } from '../../components/PageShell.jsx';

const INSIGHT_ICONS = { 'trending-up': TrendingUp, 'users': Users, 'dollar-sign': DollarSign, 'alert-circle': AlertCircle, 'package': Package };
const PRIORITY_COLOR = { high: '#ef4444', medium: '#f59e0b', low: '#64748b' };

// Animasyonlu sayı counter
const AnimCounter = ({ value, duration = 1.5, prefix = '', suffix = '', format }) => {
  const ref = useRef(null);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const ctrl = animate(0, value, {
      duration, ease: [0.22, 1, 0.36, 1],
      onUpdate(v) {
        const num = Math.round(v);
        node.textContent = format ? format(num) : `${prefix}${num.toLocaleString('tr-TR')}${suffix}`;
      }
    });
    return () => ctrl.stop();
  }, [value, duration, prefix, suffix, format]);
  return <span ref={ref}>{prefix}0{suffix}</span>;
};

// Yüzen particle efekti
const FloatingParticles = () => (
  <>
    {Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 3 + 1;
      const startX = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 8 + Math.random() * 12;
      return (
        <motion.div key={i}
          initial={{ y: '100vh', x: `${startX}vw`, opacity: 0 }}
          animate={{ y: '-10vh', opacity: [0, 0.6, 0.6, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'linear' }}
          style={{
            position: 'absolute', width: size, height: size, borderRadius: '50%',
            background: ['#8b5cf6', '#3b82f6', '#10b981', '#E81E25'][i % 4],
            boxShadow: `0 0 ${size * 4}px currentColor`,
            pointerEvents: 'none', zIndex: 1,
          }}
        />
      );
    })}
  </>
);

// Neural network çizgileri (AI teması)
const NeuralLines = () => (
  <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.3, zIndex: 1 }}>
    <defs>
      <linearGradient id="neuralGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
      </linearGradient>
    </defs>
    {Array.from({ length: 8 }).map((_, i) => {
      const x1 = Math.random() * 100;
      const y1 = Math.random() * 100;
      const x2 = Math.random() * 100;
      const y2 = Math.random() * 100;
      return (
        <motion.line key={i}
          x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
          stroke="url(#neuralGrad)" strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: [0, 1, 0], opacity: [0, 0.6, 0] }}
          transition={{ duration: 4 + Math.random() * 3, delay: i * 0.5, repeat: Infinity }}
        />
      );
    })}
  </svg>
);

const Forecast = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    api.post('/api/forecast').then(r => { setData(r.data.data); setLoading(false); });
  }, []);

  if (loading || !data) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0e1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            border: '3px solid rgba(139,92,246,0.2)', borderTopColor: '#8b5cf6',
            margin: '0 auto 20px', animation: 'spin 1s linear infinite'
          }} />
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', fontWeight: 500 }}>AI modeli analiz ediyor...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const health = data.healthScore;

  return (
    <div style={{ minHeight: '100vh', background: '#0a0e1a', position: 'relative', overflow: 'hidden' }}>
      {/* Grid pattern overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        pointerEvents: 'none',
      }} />

      {/* Animated background orbs */}
      <motion.div
        animate={{ x: [0, 80, -40, 0], y: [0, -60, 40, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: -200, left: -100, width: 600, height: 600,
          background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
      <motion.div
        animate={{ x: [0, -60, 40, 0], y: [0, 80, -30, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: 300, right: -100, width: 500, height: 500,
          background: 'radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'absolute', bottom: -100, left: '30%', width: 400, height: 400,
          background: 'radial-gradient(circle, rgba(232,30,37,0.1) 0%, transparent 70%)',
          borderRadius: '50%', pointerEvents: 'none',
        }} />

      {/* Yüzen parçacıklar */}
      <FloatingParticles />

      {/* Neural network çizgileri */}
      <NeuralLines />

      {/* HEADER */}
      <div style={{ padding: '36px 40px 20px', position: 'relative' }}>
        <div style={{ maxWidth: 1400, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(139,92,246,0.5)',
                    position: 'relative'
                  }}>
                  <Brain size={20} color="#fff" />
                  {/* Orbiting nokta */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                    style={{ position: 'absolute', inset: -6, borderRadius: 14 }}
                  >
                    <div style={{
                      position: 'absolute', top: -2, left: '50%', marginLeft: -3,
                      width: 6, height: 6, borderRadius: '50%',
                      background: '#10b981', boxShadow: '0 0 10px #10b981'
                    }} />
                  </motion.div>
                </motion.div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>AI Destekli</p>
                  <h1 style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '2px 0 0', letterSpacing: -0.5 }}>Akıllı Öngörüler</h1>
                </div>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
                Geçmiş verilerden makine öğrenmesi ile yapay zeka destekli tahmin ve öneriler
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <DateFilter value={dateRange} onChange={setDateRange} />
              <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  padding: '8px 14px', borderRadius: 100,
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)'
                }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: '#10b981', letterSpacing: 0.5 }}>CANLI ANALİZ</span>
              </motion.div>
            </div>
          </motion.div>

          {/* HEALTH SCORE — Ana skor */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(59,130,246,0.08))',
              border: '1px solid rgba(139,92,246,0.2)',
              borderRadius: 20, padding: 28, marginBottom: 20,
              backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden'
            }}>
            <div style={{ position: 'absolute', top: -40, right: 40, width: 200, height: 200, background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 32, alignItems: 'center' }}>
              <div>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', margin: 0, letterSpacing: 2, textTransform: 'uppercase' }}>İşletme Sağlık Skoru</p>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 8 }}>
                  <motion.span
                    initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                    style={{
                      fontSize: 72, fontWeight: 900, color: '#fff', letterSpacing: -3, lineHeight: 1,
                      textShadow: '0 0 40px rgba(139,92,246,0.6)',
                      fontVariantNumeric: 'tabular-nums'
                    }}>
                    <AnimCounter value={health.overall} duration={2} />
                  </motion.span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'rgba(255,255,255,0.4)' }}>/100</span>
                  {/* Pulse halkası */}
                  <motion.span
                    animate={{ scale: [1, 1.5, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    style={{
                      position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                      border: '2px solid rgba(139,92,246,0.3)', pointerEvents: 'none',
                      marginLeft: -40, marginTop: -20
                    }}
                  />
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10, padding: '6px 12px', borderRadius: 100, background: health.overall >= 80 ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.2)', border: `1px solid ${health.overall >= 80 ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                  <Sparkles size={12} color={health.overall >= 80 ? '#10b981' : '#f59e0b'} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: health.overall >= 80 ? '#10b981' : '#f59e0b' }}>
                    {health.overall >= 90 ? 'Mükemmel' : health.overall >= 80 ? 'Güçlü' : health.overall >= 60 ? 'Normal' : 'Dikkat'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
                {[
                  { label: 'Satış', value: health.sales, color: '#10b981' },
                  { label: 'Üretim', value: health.production, color: '#3b82f6' },
                  { label: 'Finans', value: health.finance, color: '#E81E25' },
                  { label: 'Envanter', value: health.inventory, color: '#f59e0b' },
                  { label: 'Tedarikçi', value: health.supplier, color: '#8b5cf6' },
                ].map((m, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                    style={{ textAlign: 'center' }}>
                    <div style={{ position: 'relative', width: 64, height: 64, margin: '0 auto 8px' }}>
                      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="4" />
                        <motion.circle
                          cx="32" cy="32" r="26" fill="none"
                          stroke={m.color} strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 26}
                          initial={{ strokeDashoffset: 2 * Math.PI * 26 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 26 * (1 - m.value / 100) }}
                          transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                        />
                      </svg>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{m.value}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.3 }}>{m.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 40px 60px', position: 'relative' }}>
        {/* Satış Tahmini + Nakit Akış */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Satış Tahmini */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28, backdropFilter: 'blur(12px)', position: 'relative', overflow: 'hidden'
            }}>
            <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
            <div style={{ position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <TrendingUp size={16} color="#10b981" />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>Satış Tahmini</h3>
                    <InfoTip text="Son 6 ayın trendine göre AI tarafından tahmin edildi" />
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 100, background: 'rgba(16,185,129,0.15)' }}>
                  <Activity size={10} color="#10b981" />
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>%{data.sales.confidence} güven</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Geçen Ay', value: fmtMoney(data.sales.lastMonth), color: 'rgba(255,255,255,0.5)' },
                  { label: 'Bu Ay', value: fmtMoney(data.sales.currentMonth), color: '#fff', big: true },
                  { label: 'Gelecek Ay (Tahmin)', value: fmtMoney(data.sales.nextMonthForecast), color: '#10b981', big: true, badge: `+%${data.sales.growthRate}` },
                ].map((m, i) => (
                  <div key={i} style={{
                    padding: 16, borderRadius: 12,
                    background: m.big ? 'rgba(255,255,255,0.04)' : 'transparent',
                    border: m.big ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{m.label}</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: m.color, margin: '6px 0 0' }}>{m.value}</p>
                    {m.badge && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, fontWeight: 700, color: '#10b981', marginTop: 4 }}><ArrowUp size={10} />{m.badge}</span>}
                  </div>
                ))}
              </div>

              {/* Forecast chart */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 100, padding: '0 4px' }}>
                {data.sales.monthlyForecast.map((m, i) => {
                  const max = Math.max(...data.sales.monthlyForecast.map(x => x.upper));
                  const h = (m.predicted / max) * 100;
                  const lowerH = (m.lower / max) * 100;
                  const upperH = (m.upper / max) * 100;
                  return (
                    <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981' }}>{fmtMoney(m.predicted)}</div>
                      <div style={{ position: 'relative', width: '100%', flex: 1, display: 'flex', alignItems: 'flex-end' }}>
                        {/* Belirsizlik bandı */}
                        <div style={{
                          position: 'absolute', left: '25%', right: '25%',
                          bottom: `${lowerH}%`, height: `${upperH - lowerH}%`,
                          background: 'linear-gradient(180deg, rgba(16,185,129,0.4), rgba(16,185,129,0.1))',
                          borderRadius: 4
                        }} />
                        {/* Tahmin noktası */}
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
                          style={{ width: '100%', background: 'linear-gradient(180deg, #10b981, #059669)', borderRadius: '8px 8px 0 0', position: 'relative', zIndex: 2 }}
                        />
                      </div>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>{m.month.slice(5)}</span>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 16, padding: 14, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)', display: 'flex', alignItems: 'center', gap: 10 }}>
                <Sparkles size={14} color="#10b981" />
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: 0, fontWeight: 500 }}>{data.sales.recommendation}</p>
              </div>
            </div>
          </motion.div>

          {/* Nakit Akış */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28, backdropFilter: 'blur(12px)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(59,130,246,0.2)', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} color="#3b82f6" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>Nakit Akış</h3>
            </div>

            <p style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase' }}>Mevcut Nakit</p>
            <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '6px 0 20px', letterSpacing: -0.5 }}>{fmtMoney(data.cashFlow.currentCash)}</p>

            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: '0 0 8px', textTransform: 'uppercase' }}>30 Gün Tahmini</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, marginBottom: 4 }}>
                <ArrowUp size={12} color="#10b981" />
                <span style={{ color: '#10b981', fontWeight: 700 }}>{fmtMoney(data.cashFlow.expected30Days.in)}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>giriş</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                <TrendingDown size={12} color="#ef4444" />
                <span style={{ color: '#ef4444', fontWeight: 700 }}>{fmtMoney(data.cashFlow.expected30Days.out)}</span>
                <span style={{ color: 'rgba(255,255,255,0.3)' }}>çıkış</span>
              </div>
            </div>

            <div style={{ padding: 14, borderRadius: 10, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
              <p style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.4)', margin: 0, textTransform: 'uppercase' }}>60 Gün Projeksiyonu</p>
              <p style={{ fontSize: 20, fontWeight: 800, color: '#3b82f6', margin: '6px 0 4px' }}>{fmtMoney(data.cashFlow.projection)}</p>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.4 }}>{data.cashFlow.note}</p>
            </div>
          </motion.div>
        </div>

        {/* Hedef Önerileri */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 28, marginBottom: 16, backdropFilter: 'blur(12px)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(232,30,37,0.2)', border: '1px solid rgba(232,30,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={16} color="#E81E25" />
            </div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>Bu Ay İçin Önerilen Hedefler</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>AI tarafından geçmiş performansa göre belirlendi</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {data.targets.map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                style={{
                  padding: 18, borderRadius: 14,
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)'
                }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t.module}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 100, background: 'rgba(16,185,129,0.15)' }}>
                    <ArrowUp size={10} color="#10b981" />
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981' }}>ÖNERİLEN</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textDecoration: 'line-through' }}>
                    {typeof t.current === 'number' && t.current > 1000 ? fmtMoney(t.current) : `${t.current}${typeof t.current === 'number' && t.current < 100 ? '%' : ''}`}
                  </span>
                  <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: -0.5 }}>
                    {typeof t.suggested === 'number' && t.suggested > 1000 ? fmtMoney(t.suggested) : `${t.suggested}${typeof t.suggested === 'number' && t.suggested < 100 ? '%' : ''}`}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                  <Sparkles size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4, color: '#8b5cf6' }} />
                  {t.reason}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stok Uyarıları + İhale Başarı */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Stok Öngörüleri */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28, backdropFilter: 'blur(12px)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={16} color="#f59e0b" />
              </div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>Stok Öngörü Uyarıları</h3>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Günlük tüketim hızına göre tükenme tahmini</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.stockAlerts.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: 14, borderRadius: 12,
                  background: s.urgency === 'high' ? 'rgba(239,68,68,0.08)' : 'rgba(245,158,11,0.06)',
                  border: `1px solid ${s.urgency === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)'}`
                }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 10,
                    background: s.urgency === 'high' ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.15)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <span style={{ fontSize: 16, fontWeight: 800, color: s.urgency === 'high' ? '#ef4444' : '#f59e0b', lineHeight: 1 }}>{s.daysUntilCritical}</span>
                    <span style={{ fontSize: 8, fontWeight: 700, color: s.urgency === 'high' ? '#ef4444' : '#f59e0b', textTransform: 'uppercase' }}>gün</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{s.product}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 4px' }}>
                      Stok: {s.currentStock} · Günlük tüketim: {s.dailyUsage}
                    </p>
                    <p style={{ fontSize: 11, color: s.urgency === 'high' ? '#ef4444' : '#f59e0b', margin: 0, fontWeight: 600 }}>
                      {s.suggestion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* İhale Başarı */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 28, backdropFilter: 'blur(12px)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Trophy size={16} color="#8b5cf6" />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>İhale Başarı Tahmini</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Aktif İhale</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '6px 0 0' }}>{data.tenderSuccess.activeTenders}</p>
              </div>
              <div style={{ padding: 14, borderRadius: 10, background: 'rgba(255,255,255,0.03)' }}>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Kazanma Ort.</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#10b981', margin: '6px 0 0' }}>%{data.tenderSuccess.avgWinRate}</p>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.tenderSuccess.recommendations.map((r, i) => (
                <div key={i} style={{ padding: '10px 12px', borderRadius: 8, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                  <Zap size={12} color="#8b5cf6" style={{ flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.8)', margin: 0, lineHeight: 1.4 }}>{r}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Tedarikçi Riskleri */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 28, marginBottom: 16, backdropFilter: 'blur(12px)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(6,182,212,0.2)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={16} color="#06b6d4" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>Tedarikçi Performans Analizi</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {data.supplierRisks.map((s, i) => (
              <div key={i} style={{
                padding: 16, borderRadius: 12,
                background: s.risk === 'high' ? 'rgba(239,68,68,0.08)' : s.risk === 'medium' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${s.risk === 'high' ? 'rgba(239,68,68,0.2)' : s.risk === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: 0 }}>{s.supplier}</p>
                  <span style={{
                    fontSize: 9, fontWeight: 800, padding: '3px 8px', borderRadius: 100,
                    color: s.risk === 'high' ? '#ef4444' : s.risk === 'medium' ? '#f59e0b' : '#10b981',
                    background: s.risk === 'high' ? 'rgba(239,68,68,0.15)' : s.risk === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)'
                  }}>{s.risk === 'high' ? 'YÜKSEK RİSK' : s.risk === 'medium' ? 'ORTA RİSK' : 'DÜŞÜK RİSK'}</span>
                </div>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.5 }}>{s.note}</p>
                <p style={{ fontSize: 10, color: s.trend === 'improving' ? '#10b981' : s.trend === 'worsening' ? '#ef4444' : 'rgba(255,255,255,0.3)', margin: '8px 0 0', fontWeight: 600, textTransform: 'uppercase' }}>
                  Trend: {s.trend === 'improving' ? '↑ İyileşiyor' : s.trend === 'worsening' ? '↓ Kötüleşiyor' : '→ Stabil'}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* AI İçgörüleri */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.04))',
            border: '1px solid rgba(139,92,246,0.15)',
            borderRadius: 20, padding: 28, backdropFilter: 'blur(12px)'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}
              style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(139,92,246,0.5)' }}>
              <Sparkles size={16} color="#fff" />
            </motion.div>
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', margin: 0 }}>AI İçgörüleri & Öneriler</h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: '2px 0 0' }}>Kişiselleştirilmiş stratejik öneriler</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
            {data.insights.map((ins, i) => {
              const Icon = INSIGHT_ICONS[ins.icon] || Sparkles;
              const color = PRIORITY_COLOR[ins.priority];
              return (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
                  style={{
                    padding: 16, borderRadius: 14,
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid ${color}33`,
                    position: 'relative', overflow: 'hidden'
                  }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: color }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `${color}20`, border: `1px solid ${color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={14} color={color} />
                    </div>
                    <span style={{ fontSize: 9, fontWeight: 800, color, textTransform: 'uppercase', letterSpacing: 0.5, padding: '3px 7px', borderRadius: 100, background: `${color}15` }}>
                      {ins.priority === 'high' ? 'Yüksek' : ins.priority === 'medium' ? 'Orta' : 'Düşük'} Öncelik
                    </span>
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#fff', margin: '0 0 6px' }}>{ins.title}</p>
                  <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: 1.5 }}>{ins.text}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Footer */}
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textAlign: 'center', marginTop: 24, fontWeight: 500 }}>
          <BarChart3 size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
          Son güncelleme: {new Date(data.generatedAt).toLocaleString('tr-TR')}
          · Model: KOM-AI v2.4 · Veri kaynağı: Son 12 ay
        </p>
      </div>
    </div>
  );
};

export default Forecast;
