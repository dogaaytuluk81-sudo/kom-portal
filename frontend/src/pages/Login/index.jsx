import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import { login } from '../../api.js';

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.password.trim()) {
      toast.error('Kullanıcı adı ve şifre zorunludur');
      return;
    }
    setLoading(true);
    try {
      const r = await login({ userName: form.username, password: form.password });
      if (r.success) {
        toast.success('Giriş başarılı!');
        navigate('/app/dashboard');
      } else {
        toast.error(r.message || 'Giriş başarısız');
      }
    } catch (err) {
      toast.error('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'grid', gridTemplateColumns: '52% 48%', overflow: 'hidden' }}>

      {/* SOL - Kırmızı Panel */}
      <div style={{ background: 'linear-gradient(135deg, #E81E25, #b91c1c)', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'flex-start', padding: 60, overflow: 'hidden' }}>
        {/* Dekoratif */}
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: 30, width: 250, height: 250, background: 'rgba(255,255,255,0.03)', borderRadius: '50%' }} />

        {/* Dönen halka */}
        <motion.div style={{ position: 'absolute', top: '15%', right: '12%', width: 220, height: 220, border: '1px solid rgba(255,255,255,0.1)', borderTop: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', pointerEvents: 'none' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} />

        {/* Yüzen noktalar */}
        {[
          { top: '20%', left: '15%', size: 5 },
          { top: '55%', right: '30%', size: 4 },
          { top: '30%', left: '60%', size: 6 },
          { top: '70%', left: '25%', size: 4 },
        ].map((dot, i) => (
          <motion.div key={i}
            style={{ position: 'absolute', top: dot.top, left: dot.left, right: dot.right, width: dot.size, height: dot.size, borderRadius: '50%', background: 'rgba(255,255,255,0.35)' }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 8 + i, repeat: Infinity, ease: 'easeInOut', delay: i * 0.5 }} />
        ))}

        {/* Sol üst */}

        {/* İçerik */}
        <motion.div style={{ position: 'relative', zIndex: 1, maxWidth: 420, marginBottom: 48 }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
          <img src="/images/kom-logo.svg" alt="KOM" style={{ width: 180, height: 'auto', filter: 'brightness(0) invert(1)', marginBottom: 28 }} />
          <div style={{ width: 40, height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 2, marginBottom: 20 }} />
          <h1 style={{ fontSize: '2rem', color: '#fff', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, margin: 0 }}>
            Mayo & Tekstil<br />Yönetim Paneli
          </h1>
          <p style={{ marginTop: 14, fontSize: 14, color: 'rgba(255,255,255,0.75)', lineHeight: 1.7, maxWidth: 360 }}>
            Tedarik zinciri yönetimi, sipariş takibi ve iş ortaklığı süreçlerinizi tek noktadan yönetin.
          </p>
        </motion.div>
      </div>

      {/* SAĞ - Login Form */}
      <div style={{ background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 60px', position: 'relative' }}>
        <motion.div style={{ width: '100%', maxWidth: 400 }}
          initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>

          <motion.div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 100, background: '#FEF2F2', border: '1px solid #FECACA', marginBottom: 20 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#E81E25' }} />
            <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600, letterSpacing: 0.5 }}>Güvenli Bağlantı</span>
          </motion.div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111', lineHeight: 1.2, margin: '0 0 8px', letterSpacing: -0.5 }}>
            Tekrar hoş geldiniz
          </h1>
          <p style={{ fontSize: 14, color: '#999', margin: '0 0 36px' }}>
            Hesabınıza giriş yaparak devam edin
          </p>

          <form onSubmit={handleSubmit}>
            {/* Username */}
            <div style={{ position: 'relative', marginBottom: 16 }}>
              <User size={16} color="#bbb" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type="text" value={form.username} onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Kullanıcı Adı"
                style={{ width: '100%', padding: '16px 16px 16px 44px', border: '2px solid #eee', borderRadius: 14, fontSize: 15, outline: 'none', background: '#fafafa', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#111'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#eee'; e.target.style.background = '#fafafa'; }} />
            </div>

            {/* Password */}
            <div style={{ position: 'relative', marginBottom: 28 }}>
              <Lock size={16} color="#bbb" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                placeholder="Şifre"
                style={{ width: '100%', padding: '16px 48px 16px 44px', border: '2px solid #eee', borderRadius: 14, fontSize: 15, outline: 'none', background: '#fafafa', transition: 'all 0.2s' }}
                onFocus={e => { e.target.style.borderColor = '#111'; e.target.style.background = '#fff'; }}
                onBlur={e => { e.target.style.borderColor = '#eee'; e.target.style.background = '#fafafa'; }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#ccc' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: 16, border: 'none', borderRadius: 14, background: '#E81E25', color: '#fff', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.3s', boxShadow: loading ? 'none' : '0 8px 24px rgba(232,30,37,0.25)', opacity: loading ? 0.6 : 1 }}>
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>

          <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 24 }}>
            Demo: Herhangi bir kullanıcı adı ve şifre ile giriş yapabilirsiniz
          </p>

          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <a href="/tedarikci" style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none', fontWeight: 600 }}>
              Tedarikçi Portalına Git →
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
