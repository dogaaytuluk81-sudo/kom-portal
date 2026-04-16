import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, CheckCircle2, Truck } from 'lucide-react';
import api from '../../api.js';
import { DarkHero, Badge, fmtMoney } from '../../components/PageShell.jsx';
import { useConfetti } from '../../components/Confetti.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const SupplierOrders = () => {
  const user = getUser();
  const [orders, setOrders] = useState([]);
  const { fireCenter, ConfettiCanvas } = useConfetti();

  useEffect(() => {
    api.post('/api/supplier/orders', { firm: user.firm }).then(r => {
      const data = r.data.data || [];
      setOrders(data);
      if (data.length > 0) setTimeout(() => fireCenter(), 500);
    });
  }, []);

  return (
    <DarkHero
      icon={Package}
      label="Siparişlerim"
      title="Kazanılan Siparişler"
      subtitle={`${orders.length} sipariş · ${user.firm}`}
      accentColor="#10b981"
      stats={[
        { label: 'Toplam Sipariş', value: orders.length, color: '#10b981' },
        { label: 'Toplam Değer', value: fmtMoney(orders.reduce((s, o) => s + (o.BID?.TOTAL || 0), 0)), color: '#3b82f6' },
      ]}
    >
      <ConfettiCanvas />
      <div style={{ display: 'grid', gap: 14 }}>
        {orders.map((o, i) => (
          <motion.div key={o.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            style={{
              background: '#fff', borderRadius: 16, border: '1px solid #a7f3d0',
              overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 5, alignSelf: 'stretch', background: '#10b981', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <CheckCircle2 size={20} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{o.TENDER_NO}</span>
                    <Badge tone="green">Kazanıldı</Badge>
                    <Badge tone="blue">{o.CATEGORY}</Badge>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{o.TITLE}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    {o.QUANTITY} {o.UNIT} · Birim: ₺{o.BID?.PRICE} · Teslimat: {o.BID?.DELIVERY_DAYS} gün
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 10, color: '#059669', margin: 0, fontWeight: 700 }}>SİPARİŞ TUTARI</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: '#059669', margin: '2px 0 0', letterSpacing: -0.5 }}>
                    {fmtMoney(o.BID?.TOTAL || 0)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {orders.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <Truck size={40} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 14, color: '#64748b', fontWeight: 600, margin: 0 }}>Henüz kazanılmış sipariş yok</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Açık ihalelere teklif verin</p>
          </div>
        )}
      </div>
    </DarkHero>
  );
};

export default SupplierOrders;
