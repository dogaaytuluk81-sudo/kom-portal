import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileCheck, Trophy } from 'lucide-react';
import api from '../../api.js';
import { DarkHero, Badge, fmtMoney } from '../../components/PageShell.jsx';
import { useConfetti } from '../../components/Confetti.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const STATUS_LABEL = {
  open: { label: 'Değerlendiriliyor', tone: 'amber' },
  evaluation: { label: 'Değerlendiriliyor', tone: 'purple' },
  awarded: { label: 'Sonuçlandı', tone: 'green' },
  closed: { label: 'Kapandı', tone: 'gray' },
};

const SupplierMyBids = () => {
  const user = getUser();
  const [bids, setBids] = useState([]);
  const { fireCenter, ConfettiCanvas } = useConfetti();

  useEffect(() => {
    api.post('/api/supplier/my-bids', { firm: user.firm }).then(r => {
      const data = r.data.data || [];
      setBids(data);
      // Kazanılan teklif varsa kutla!
      if (data.some(b => b.IS_WINNER)) {
        setTimeout(() => fireCenter(), 500);
      }
    });
  }, []);

  const won = bids.filter(b => b.IS_WINNER).length;
  const pending = bids.filter(b => !b.IS_WINNER && b.TENDER_STATUS !== 'awarded' && b.TENDER_STATUS !== 'closed').length;

  return (
    <DarkHero
      icon={FileCheck}
      label="Tekliflerim"
      title="Verdiğim Teklifler"
      subtitle={`${bids.length} teklif · ${user.firm}`}
      accentColor="#3b82f6"
      stats={[
        { label: 'Toplam Teklif', value: bids.length, color: '#3b82f6' },
        { label: 'Kazanılan', value: won, sub: `%${bids.length ? Math.round((won / bids.length) * 100) : 0} başarı`, color: '#10b981' },
        { label: 'Bekleyen', value: pending, sub: 'Sonuç bekleniyor', color: '#f59e0b' },
        { label: 'Toplam Değer', value: fmtMoney(bids.reduce((s, b) => s + b.TOTAL, 0)), color: '#8b5cf6' },
      ]}
    >
      <ConfettiCanvas />
      <div style={{ display: 'grid', gap: 12 }}>
        {bids.map((bid, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            style={{
              background: '#fff', borderRadius: 16,
              border: `1px solid ${bid.IS_WINNER ? '#a7f3d0' : '#e2e8f0'}`,
              overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 5, alignSelf: 'stretch', background: bid.IS_WINNER ? '#10b981' : (STATUS_LABEL[bid.TENDER_STATUS] || STATUS_LABEL.open).tone === 'amber' ? '#f59e0b' : '#94a3b8', flexShrink: 0 }} />
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: bid.IS_WINNER ? '#ecfdf5' : '#f8fafc',
                  border: `1px solid ${bid.IS_WINNER ? '#a7f3d0' : '#e2e8f0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  {bid.IS_WINNER ? <Trophy size={18} color="#10b981" /> : <FileCheck size={18} color="#64748b" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{bid.TENDER_NO}</span>
                    <Badge tone={(STATUS_LABEL[bid.TENDER_STATUS] || STATUS_LABEL.open).tone}>
                      {(STATUS_LABEL[bid.TENDER_STATUS] || STATUS_LABEL.open).label}
                    </Badge>
                    {bid.IS_WINNER && <Badge tone="green"><Trophy size={9} /> Kazandınız</Badge>}
                    <Badge tone="blue">{bid.TENDER_CATEGORY}</Badge>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{bid.TENDER_TITLE}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Birim: ₺{bid.PRICE} · Teslimat: {bid.DELIVERY_DAYS} gün · Teklif tarihi: {bid.SUBMITTED}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700 }}>TOPLAM</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: bid.IS_WINNER ? '#10b981' : '#0f172a', margin: '2px 0 0' }}>
                    {fmtMoney(bid.TOTAL)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        {bids.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            Henüz teklif vermediniz
          </div>
        )}
      </div>
    </DarkHero>
  );
};

export default SupplierMyBids;
