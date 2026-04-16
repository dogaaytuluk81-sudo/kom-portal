import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, Send, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, FilterBar, SearchInput, Badge, fmtMoney, FormModal, FormField, useForm } from '../../components/PageShell.jsx';
import { useConfetti } from '../../components/Confetti.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const SupplierTenders = () => {
  const user = getUser();
  const [tenders, setTenders] = useState([]);
  const { fireCenter, ConfettiCanvas } = useConfetti();
  const [search, setSearch] = useState('');
  const [bidOpen, setBidOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ PRICE: 0, DELIVERY_DAYS: 7, WARRANTY: '', NOTE: '' });

  const load = () => api.post('/api/supplier/tenders').then(r => setTenders(r.data.data || []));
  useEffect(() => { load(); }, []);

  const submitBid = async () => {
    if (!form.PRICE || form.PRICE <= 0) { toast.error('Birim fiyat zorunludur'); return; }
    setSaving(true);
    try {
      const r = await api.post('/api/tenders/bid', {
        tenderId: bidOpen.ID,
        SUPPLIER: user.firm,
        CONTACT: user.name,
        PRICE: form.PRICE,
        TOTAL: form.PRICE * bidOpen.QUANTITY,
        DELIVERY_DAYS: form.DELIVERY_DAYS,
        WARRANTY: form.WARRANTY,
        NOTE: form.NOTE,
        RATING: user.rating || 4.0,
      });
      if (r.data.success) { toast.success('Teklifiniz gönderildi!'); fireCenter(); setBidOpen(null); reset(); load(); }
    } catch { toast.error('Teklif gönderilemedi'); }
    finally { setSaving(false); }
  };

  const filtered = tenders.filter(t =>
    `${t.TENDER_NO} ${t.TITLE} ${t.CATEGORY}`.toLowerCase().includes(search.toLowerCase())
  );

  const alreadyBid = (tender) => tender.BIDS?.some(b => b.SUPPLIER === user.firm);

  return (
    <DarkHero
      icon={Gavel}
      label="Açık İhaleler"
      title="Teklif Verilebilir İhaleler"
      subtitle={`${filtered.length} aktif ihale · KOM Mayo & Tekstil`}
      accentColor="#3b82f6"
      stats={[
        { label: 'Açık İhale', value: filtered.length, color: '#f59e0b' },
        { label: 'Toplam Bütçe', value: fmtMoney(filtered.reduce((s, t) => s + t.BUDGET, 0)), color: '#10b981' },
      ]}
    >
      <ConfettiCanvas />
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="İhale ara..." />
      </FilterBar>

      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map((t, i) => {
          const hasBid = alreadyBid(t);
          const myBid = t.BIDS?.find(b => b.SUPPLIER === user.firm);
          const daysLeft = t.DEADLINE ? Math.ceil((new Date(t.DEADLINE) - Date.now()) / 86400000) : null;
          return (
            <motion.div key={t.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              style={{
                background: '#fff', borderRadius: 16, border: `1px solid ${hasBid ? '#a7f3d0' : '#e2e8f0'}`,
                overflow: 'hidden', transition: 'all 0.25s',
                boxShadow: hasBid ? '0 0 0 1px #10b981' : '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = hasBid ? '0 0 0 1px #10b981' : '0 1px 3px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{t.TENDER_NO}</span>
                      <Badge tone="blue">{t.CATEGORY}</Badge>
                      {t.STATUS === 'evaluation' && <Badge tone="purple">Değerlendirmede</Badge>}
                      {hasBid && <Badge tone="green">Teklif Verildi</Badge>}
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{t.TITLE}</h3>
                    <p style={{ fontSize: 13, color: '#64748b', margin: 0, lineHeight: 1.5, maxWidth: 600 }}>{t.DESCRIPTION}</p>
                  </div>
                  {daysLeft !== null && daysLeft > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 100, background: daysLeft <= 3 ? '#fef2f2' : '#fffbeb', flexShrink: 0 }}>
                      <Clock size={12} color={daysLeft <= 3 ? '#ef4444' : '#f59e0b'} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: daysLeft <= 3 ? '#ef4444' : '#f59e0b' }}>{daysLeft} gün</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 16, marginTop: 16, alignItems: 'center' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, flex: 1 }}>
                    {[
                      { label: 'Miktar', value: `${t.QUANTITY} ${t.UNIT}` },
                      { label: 'Bütçe', value: fmtMoney(t.BUDGET), color: '#E81E25' },
                      { label: 'Son Tarih', value: t.DEADLINE },
                      { label: 'Teklif Sayısı', value: `${t.BIDS?.length || 0} teklif` },
                    ].map((m, mi) => (
                      <div key={mi} style={{ padding: '8px 12px', borderRadius: 8, background: '#f8fafc', textAlign: 'center' }}>
                        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>{m.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 800, color: m.color || '#0f172a', margin: '4px 0 0' }}>{m.value}</p>
                      </div>
                    ))}
                  </div>

                  {hasBid ? (
                    <div style={{ padding: '14px 20px', borderRadius: 12, background: '#ecfdf5', border: '1px solid #a7f3d0', textAlign: 'center', minWidth: 140 }}>
                      <p style={{ fontSize: 10, color: '#059669', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Teklifiniz</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#059669', margin: '4px 0 0' }}>{fmtMoney(myBid?.TOTAL || 0)}</p>
                      <p style={{ fontSize: 10, color: '#6ee7b7', margin: '2px 0 0' }}>₺{myBid?.PRICE}/{t.UNIT}</p>
                    </div>
                  ) : t.STATUS === 'open' ? (
                    <button onClick={() => setBidOpen(t)}
                      style={{
                        padding: '14px 24px', borderRadius: 12, border: 'none', cursor: 'pointer',
                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                        color: '#fff', fontSize: 13, fontWeight: 800,
                        boxShadow: '0 6px 18px rgba(59,130,246,0.3)',
                        display: 'flex', alignItems: 'center', gap: 8, whiteSpace: 'nowrap'
                      }}>
                      <Send size={14} /> Teklif Ver
                    </button>
                  ) : null}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Teklif Ver Modal */}
      {bidOpen && (
        <FormModal isOpen={!!bidOpen} onClose={() => setBidOpen(null)}
          title={`Teklif Ver — ${bidOpen.TITLE}`}
          subtitle={`${bidOpen.QUANTITY} ${bidOpen.UNIT} · Bütçe: ${fmtMoney(bidOpen.BUDGET)}`}
          icon={Send}
          onSubmit={submitBid}
          submitting={saving}
          submitLabel="Teklifi Gönder"
        >
          <FormField label={`Birim Fiyat (₺/${bidOpen.UNIT})`} type="number" required value={form.PRICE} onChange={setField('PRICE')} />
          <FormField label="Teslimat Süresi (gün)" type="number" value={form.DELIVERY_DAYS} onChange={setField('DELIVERY_DAYS')} />
          {form.PRICE > 0 && (
            <div style={{ gridColumn: 'span 2', padding: 14, borderRadius: 10, background: '#eff6ff', border: '1px solid #bfdbfe' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#3b82f6', fontWeight: 600 }}>Toplam Teklif Tutarı</span>
                <span style={{ fontSize: 16, fontWeight: 800, color: '#1d4ed8' }}>{fmtMoney(form.PRICE * bidOpen.QUANTITY)}</span>
              </div>
              {form.PRICE * bidOpen.QUANTITY > bidOpen.BUDGET && (
                <p style={{ fontSize: 11, color: '#ef4444', margin: '6px 0 0', fontWeight: 600 }}>Bütçe aşımı: {fmtMoney(form.PRICE * bidOpen.QUANTITY - bidOpen.BUDGET)}</p>
              )}
            </div>
          )}
          <FormField label="Garanti Süresi" value={form.WARRANTY} onChange={setField('WARRANTY')} placeholder="Örn: 6 ay, 1 yıl" />
          <FormField label="Not / Açıklama" type="textarea" value={form.NOTE} onChange={setField('NOTE')} placeholder="Ek bilgi, avantajlar..." span={2} />
        </FormModal>
      )}
    </DarkHero>
  );
};

export default SupplierTenders;
