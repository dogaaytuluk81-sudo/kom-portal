import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Lock, Eye, EyeOff, Truck } from 'lucide-react';
import api from '../../api.js';

const SupplierLogin = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) { toast.error('Kullanıcı adı ve şifre zorunludur'); return; }
    setLoading(true);
    try {
      const r = await api.post('/api/supplier/login', { userName: form.username, password: form.password });
      if (r.data.success) {
        localStorage.setItem('kom_supplier_token', r.data.tokens.access);
        localStorage.setItem('kom_supplier_user', JSON.stringify(r.data.user.userDetails));
        toast.success('Giriş başarılı!');
        navigate('/tedarikci/panel');
      }
    } catch { toast.error('Bağlantı hatası'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'grid', gridTemplateColumns: '48% 52%', overflow: 'hidden' }}>
      {/* SOL — Form */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 60px', position: 'relative' }}>
        <motion.div style={{ width: '100%', maxWidth: 400 }}
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>

          <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: '#eff6ff', border: '1px solid #bfdbfe', marginBottom: 20 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />
            <span style={{ fontSize: 11, color: '#2563eb', fontWeight: 600, letterSpacing: 0.5 }}>Tedarikçi Portalı</span>
          </motion.div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: -0.5 }}>
            Hoş Geldiniz
          </h1>
          <p style={{ fontSize: 14, color: '#94a3b8', margin: '0 0 36px' }}>
            Tedarikçi hesabınızla giriş yapın
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <User size={16} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Kullanıcı Adı"
                style={{ width: '100%', padding: '16px 16px 16px 44px', border: '2px solid #e2e8f0', borderRadius: 14, fontSize: 15, outline: 'none', background: '#f8fafc', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }} />
            </div>

            <div style={{ position: 'relative', marginBottom: 28 }}>
              <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Şifre"
                style={{ width: '100%', padding: '16px 48px 16px 44px', border: '2px solid #e2e8f0', borderRadius: 14, fontSize: 15, outline: 'none', background: '#f8fafc', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#3b82f6'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#f8fafc'; }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#94a3b8' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: 16, border: 'none', borderRadius: 14,
                background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s',
                boxShadow: loading ? 'none' : '0 8px 24px rgba(59,130,246,0.3)',
                opacity: loading ? 0.6 : 1
              }}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', marginTop: 24 }}>
            Demo: akdeniz / 1234 · egetekstil / 1234 · trakya / 1234
          </p>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
              ← Admin Girişine Dön
            </a>
          </div>
        </motion.div>
      </div>

      {/* SAĞ — Mavi Panel */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
        position: 'relative', display: 'flex', flexDirection: 'column',
        justifyContent: 'flex-end', alignItems: 'flex-start', padding: 60, overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, left: -100, width: 400, height: 400, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, right: 30, width: 250, height: 250, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />

        <motion.div style={{ position: 'absolute', top: '15%', left: '12%', width: 220, height: 220, border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', pointerEvents: 'none' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />

        {[
          { top: '20%', right: '15%', size: 5 },
          { top: '55%', left: '30%', size: 4 },
          { top: '30%', right: '40%', size: 6 },
          { top: '70%', right: '25%', size: 4 },
        ].map((dot, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', top: dot.top, left: dot.left, right: dot.right, width: dot.size, height: dot.size, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }} />
        ))}

        <motion.div style={{ position: 'absolute', top: 32, right: 40, display: 'flex', alignItems: 'center', gap: 8, zIndex: 1 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', boxShadow: '0 0 12px rgba(255,255,255,0.5)' }} />
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 3, textTransform: 'uppercase', fontWeight: 600 }}>Tedarikçi Girişi</span>
        </motion.div>

        <motion.div style={{ position: 'relative', zIndex: 1, maxWidth: 420, marginBottom: 48 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <div style={{ width: 64, height: 64, borderRadius: 16, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
            <Truck size={28} color="#fff" />
          </div>
          <div style={{ width: 40, height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 2, marginBottom: 20 }} />
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, margin: 0 }}>
            KOM Mayo & Tekstil<br />Tedarikçi Portalı
          </h1>
          <p style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 360 }}>
            İhaleleri görüntüleyin, teklif verin, siparişlerinizi takip edin.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default SupplierLogin;
