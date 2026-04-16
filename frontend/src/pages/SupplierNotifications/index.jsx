import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Gavel, FileCheck, Trophy, Wallet, MessageCircle, FileText } from 'lucide-react';
import api from '../../api.js';
import { DarkHero, Badge } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };
const TYPE_ICON = { tender: Gavel, bid: FileCheck, award: Trophy, payment: Wallet, message: MessageCircle, document: FileText };
const TYPE_COLOR = { tender: '#f59e0b', bid: '#3b82f6', award: '#10b981', payment: '#8b5cf6', message: '#06b6d4', document: '#64748b' };

const SupplierNotifications = () => {
  const user = getUser();
  const [notifs, setNotifs] = useState([]);

  useEffect(() => {
    api.post('/api/supplier/notifications', { firm: user.firm }).then(r => setNotifs(r.data.data || []));
  }, []);

  const unread = notifs.filter(n => !n.READ).length;

  return (
    <DarkHero icon={Bell} label="Bildirimler" title="Bildirimlerim" subtitle={`${unread} okunmamış · ${notifs.length} toplam`} accentColor="#3b82f6"
      stats={[
        { label: 'Toplam', value: notifs.length, color: '#3b82f6' },
        { label: 'Okunmamış', value: unread, color: '#ef4444' },
      ]}
    >
      <div style={{ display: 'grid', gap: 10 }}>
        {notifs.map((n, i) => {
          const NIcon = TYPE_ICON[n.TYPE] || Bell;
          const color = TYPE_COLOR[n.TYPE] || '#64748b';
          return (
            <motion.div key={n.ID} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.03 * i }}
              style={{
                background: n.READ ? '#fff' : '#eff6ff', borderRadius: 14,
                border: `1px solid ${n.READ ? '#e2e8f0' : '#bfdbfe'}`,
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: `${color}15`, border: `1px solid ${color}25`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <NIcon size={16} color={color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                  <h4 style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: 0 }}>{n.TITLE}</h4>
                  {!n.READ && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6' }} />}
                </div>
                <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{n.TEXT}</p>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, flexShrink: 0 }}>{n.DATE}</span>
            </motion.div>
          );
        })}
      </div>
    </DarkHero>
  );
};

export default SupplierNotifications;
