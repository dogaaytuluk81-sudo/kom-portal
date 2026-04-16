import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, FileCheck, Trophy, Package } from 'lucide-react';
import api from '../../api.js';
import { fmtMoney } from '../../components/PageShell.jsx';
import { useConfetti, PageSplash, StarBurst } from '../../components/Confetti.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const SupplierDashboard = () => {
  const user = getUser();
  const [stats, setStats] = useState({});
  const { fireCenter, ConfettiCanvas } = useConfetti();
  const [splashDone, setSplashDone] = useState(false);

  useEffect(() => {
    // Giriş patlaması — sadece ilk açılışta
    const timer = setTimeout(() => { fireCenter(); setSplashDone(true); }, 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    api.post('/api/supplier/stats', { firm: user.firm }).then(r => setStats(r.data.data || {}));
  }, []);

  const cards = [
    { label: 'Açık İhaleler', value: stats.activeTenders || 0, sub: 'Teklif verebilirsiniz', icon: Gavel, color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Verdiğim Teklifler', value: stats.totalBids || 0, sub: fmtMoney(stats.totalValue || 0) + ' toplam', icon: FileCheck, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Kazandığım', value: stats.wonBids || 0, sub: `%${stats.winRate || 0} başarı oranı`, icon: Trophy, color: '#10b981', bg: '#ecfdf5' },
    { label: 'Aktif Siparişler', value: stats.wonBids || 0, sub: 'Teslimat bekliyor', icon: Package, color: '#8b5cf6', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      <ConfettiCanvas />
      <PageSplash color="#3b82f6" />
      {splashDone && <StarBurst color="#fbbf24" count={16} />}
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%)',
        padding: '40px 40px 80px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -40, width: 350, height: 350, background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', maxWidth: 1200, margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '0 0 6px', fontWeight: 600 }}>Hoş geldiniz,</p>
            <h1 style={{ fontSize: 30, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: -0.5 }}>
              {user.firm || 'Tedarikçi'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', margin: 0 }}>
              {user.name} · {user.city}
            </p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginTop: 32 }}>
            {cards.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{
                  background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 22px',
                  position: 'relative', overflow: 'hidden'
                }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: c.color }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: `${c.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <c.icon size={16} color={c.color} />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{c.label}</span>
                </div>
                <p style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: -0.5 }}>{c.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', margin: 0, fontWeight: 500 }}>{c.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div style={{ maxWidth: 1200, margin: '-40px auto 0', padding: '0 40px 60px', position: 'relative' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <motion.a href="/tedarikci/ihaleler" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            style={{
              background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 20,
              transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fffbeb', border: '1px solid #fde68a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Gavel size={24} color="#f59e0b" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Açık İhaleleri Gör</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Yeni ihalelere göz atın ve teklif verin</p>
            </div>
          </motion.a>

          <motion.a href="/tedarikci/tekliflerim" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{
              background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0',
              textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 20,
              transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)', cursor: 'pointer'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileCheck size={24} color="#3b82f6" />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0 }}>Tekliflerimi Takip Et</h3>
              <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Verdiğiniz tekliflerin durumunu görün</p>
            </div>
          </motion.a>
        </div>
      </div>
    </div>
  );
};

export default SupplierDashboard;
