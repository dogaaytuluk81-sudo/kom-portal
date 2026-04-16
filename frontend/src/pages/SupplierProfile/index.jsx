import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Star, Building2, Edit3 } from 'lucide-react';
import { DarkHero, Badge, DetailGrid } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const SupplierProfile = () => {
  const user = getUser();

  return (
    <DarkHero icon={User} label="Profil" title="Firma Bilgileri" subtitle={user.firm} accentColor="#3b82f6">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20 }}>
        {/* Sol — Avatar + Puan */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <div style={{
            width: 80, height: 80, borderRadius: 20, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, fontWeight: 800, color: '#fff',
            boxShadow: '0 8px 24px rgba(59,130,246,0.3)'
          }}>{user.firm?.[0] || 'T'}</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{user.firm}</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 16px' }}>{user.name}</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: 16 }}>
            {[1,2,3,4,5].map(s => (
              <Star key={s} size={16} color="#fbbf24" fill={s <= Math.floor(user.rating || 4) ? '#fbbf24' : 'none'} />
            ))}
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginLeft: 6 }}>{user.rating || 4.0}</span>
          </div>
          <Badge tone="green">Onaylı Tedarikçi</Badge>
        </motion.div>

        {/* Sağ — Detaylar */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ background: '#fff', borderRadius: 16, padding: 28, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 20px' }}>İletişim & Firma Bilgileri</h3>
          <DetailGrid items={[
            { label: 'Firma Adı', value: user.firm },
            { label: 'Yetkili Kişi', value: user.name },
            { label: 'E-posta', value: user.email },
            { label: 'Telefon', value: user.phone },
            { label: 'Şehir', value: user.city },
            { label: 'Puan', value: `${user.rating}/5.0`, color: '#f59e0b' },
            { label: 'Vergi No', value: '1234567890', sub: 'Örnek vergi numarası' },
            { label: 'Banka', value: 'Garanti BBVA', sub: 'TR12 3456 7890 1234 5678 90' },
          ]} />
        </motion.div>
      </div>
    </DarkHero>
  );
};

export default SupplierProfile;
