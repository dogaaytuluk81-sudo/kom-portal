import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileSignature, CheckCircle2, AlertCircle, PenTool } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, fmtMoney, DetailModal, DetailGrid } from '../../components/PageShell.jsx';
import { useConfetti } from '../../components/Confetti.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };
const CON_STATUS = {
  active: { label: 'Aktif', tone: 'green', color: '#10b981' },
  pending: { label: 'İmza Bekliyor', tone: 'amber', color: '#f59e0b' },
  expired: { label: 'Süresi Dolmuş', tone: 'gray', color: '#94a3b8' },
};

const SupplierContracts = () => {
  const user = getUser();
  const [contracts, setContracts] = useState([]);
  const [detailOpen, setDetailOpen] = useState(null);
  const { fireCenter, ConfettiCanvas } = useConfetti();

  const load = () => api.post('/api/supplier/contracts', { firm: user.firm }).then(r => setContracts(r.data.data || []));
  useEffect(() => { load(); }, []);

  const signContract = async (contractId) => {
    try {
      const r = await api.post('/api/supplier/contracts/sign', { contractId, signedBy: user.name });
      if (r.data.success) { toast.success('Sözleşme imzalandı!'); fireCenter(); setDetailOpen(null); load(); }
    } catch { toast.error('İmza başarısız'); }
  };

  return (
    <DarkHero icon={FileSignature} label="Sözleşmeler" title="Sözleşme Yönetimi" subtitle={`${contracts.length} sözleşme · ${user.firm}`} accentColor="#8b5cf6"
      stats={[
        { label: 'Toplam', value: contracts.length, color: '#8b5cf6' },
        { label: 'Aktif', value: contracts.filter(c => c.STATUS === 'active').length, color: '#10b981' },
        { label: 'İmza Bekleyen', value: contracts.filter(c => c.STATUS === 'pending').length, color: '#f59e0b' },
        { label: 'Toplam Değer', value: fmtMoney(contracts.reduce((s, c) => s + c.VALUE, 0)), color: '#3b82f6' },
      ]}
    >
      <ConfettiCanvas />
      <div style={{ display: 'grid', gap: 14 }}>
        {contracts.map((c, i) => {
          const st = CON_STATUS[c.STATUS] || CON_STATUS.pending;
          return (
            <motion.div key={c.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              onClick={() => setDetailOpen(c)}
              style={{
                background: '#fff', borderRadius: 16, border: `1px solid ${c.STATUS === 'pending' ? '#fde68a' : '#e2e8f0'}`,
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: c.STATUS === 'pending' ? '0 0 0 1px #f59e0b33' : '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = c.STATUS === 'pending' ? '0 0 0 1px #f59e0b33' : '0 1px 3px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 5, alignSelf: 'stretch', background: st.color, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '20px 24px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${st.color}12`, border: `1px solid ${st.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    {c.STATUS === 'active' ? <CheckCircle2 size={20} color={st.color} /> : c.STATUS === 'pending' ? <PenTool size={20} color={st.color} /> : <AlertCircle size={20} color={st.color} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      {c.STATUS === 'pending' && <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', animation: 'pulse 2s infinite' }}>İmzanız bekleniyor</span>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{c.TITLE}</h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      {c.START} → {c.END}
                      {c.SIGNED_BY && ` · İmzalayan: ${c.SIGNED_BY}`}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700 }}>DEĞER</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>{fmtMoney(c.VALUE)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)} title={detailOpen.TITLE}
          subtitle={`${(CON_STATUS[detailOpen.STATUS] || CON_STATUS.pending).label} · ${detailOpen.START} — ${detailOpen.END}`} icon={FileSignature}>
          <DetailGrid items={[
            { label: 'Sözleşme Adı', value: detailOpen.TITLE },
            { label: 'Durum', value: (CON_STATUS[detailOpen.STATUS] || CON_STATUS.pending).label, color: (CON_STATUS[detailOpen.STATUS] || CON_STATUS.pending).color },
            { label: 'Başlangıç', value: detailOpen.START },
            { label: 'Bitiş', value: detailOpen.END },
            { label: 'Değer', value: fmtMoney(detailOpen.VALUE), color: '#E81E25' },
            { label: 'İmzalayan', value: detailOpen.SIGNED_BY || '—' },
            { label: 'İmza Tarihi', value: detailOpen.SIGNED_DATE || '—' },
          ]} />

          {detailOpen.STATUS === 'pending' && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12 }}>
              <Btn onClick={() => signContract(detailOpen.ID)} style={{
                background: 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: '0 6px 18px rgba(16,185,129,0.3)',
                padding: '14px 32px', fontSize: 14
              }}>
                <PenTool size={16} /> Sözleşmeyi İmzala
              </Btn>
            </div>
          )}
        </DetailModal>
      )}

      <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
    </DarkHero>
  );
};

export default SupplierContracts;
