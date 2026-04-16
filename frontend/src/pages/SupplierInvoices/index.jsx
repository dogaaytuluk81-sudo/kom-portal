import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, Plus, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, fmtMoney, FormModal, FormField, useForm } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };
const INV_STATUS = { paid: { label: 'Ödendi', tone: 'green', icon: CheckCircle2, color: '#10b981' }, pending: { label: 'Beklemede', tone: 'amber', icon: Clock, color: '#f59e0b' }, overdue: { label: 'Gecikmiş', tone: 'red', icon: AlertTriangle, color: '#ef4444' } };

const SupplierInvoices = () => {
  const user = getUser();
  const [invoices, setInvoices] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ INVOICE_NO: '', AMOUNT: 0, DUE_DATE: '', DESCRIPTION: '' });

  const load = () => api.post('/api/supplier/invoices', { firm: user.firm }).then(r => setInvoices(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createInv = async () => {
    if (!form.INVOICE_NO || !form.AMOUNT) { toast.error('Fatura no ve tutar zorunlu'); return; }
    setSaving(true);
    try { const r = await api.post('/api/supplier/invoices/create', { ...form, FIRM: user.firm }); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Oluşturulamadı'); } finally { setSaving(false); }
  };

  const paid = invoices.filter(i => i.STATUS === 'paid').reduce((s, i) => s + i.AMOUNT, 0);
  const pending = invoices.filter(i => i.STATUS === 'pending').reduce((s, i) => s + i.AMOUNT, 0);
  const overdue = invoices.filter(i => i.STATUS === 'overdue').reduce((s, i) => s + i.AMOUNT, 0);

  return (
    <DarkHero icon={Wallet} label="Faturalar" title="Fatura & Ödeme Takibi" subtitle={`${invoices.length} fatura · ${user.firm}`} accentColor="#3b82f6"
      actions={<Btn icon={Plus} onClick={() => setModalOpen(true)}>Fatura Oluştur</Btn>}
      stats={[
        { label: 'Ödenen', value: fmtMoney(paid), color: '#10b981' },
        { label: 'Bekleyen', value: fmtMoney(pending), color: '#f59e0b' },
        { label: 'Gecikmiş', value: fmtMoney(overdue), sub: overdue > 0 ? 'Takip edin!' : '', color: '#ef4444' },
      ]}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {invoices.map((inv, i) => {
          const st = INV_STATUS[inv.STATUS] || INV_STATUS.pending;
          const StIcon = st.icon;
          return (
            <motion.div key={inv.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
              style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 5, alignSelf: 'stretch', background: st.color, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 16, padding: '18px 22px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${st.color}12`, border: `1px solid ${st.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <StIcon size={18} color={st.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{inv.INVOICE_NO}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: '0 0 2px' }}>{inv.DESCRIPTION}</p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: 0 }}>Tarih: {inv.DATE} · Vade: {inv.DUE_DATE}{inv.PAID_DATE ? ` · Ödeme: ${inv.PAID_DATE}` : ''}</p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 20, fontWeight: 800, color: st.color, margin: 0 }}>{fmtMoney(inv.AMOUNT)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Fatura Oluştur" icon={Wallet} onSubmit={createInv} submitting={saving}>
        <FormField label="Fatura No" required value={form.INVOICE_NO} onChange={setField('INVOICE_NO')} />
        <FormField label="Tutar (₺)" type="number" required value={form.AMOUNT} onChange={setField('AMOUNT')} />
        <FormField label="Vade Tarihi" type="date" value={form.DUE_DATE} onChange={setField('DUE_DATE')} />
        <FormField label="Açıklama" type="textarea" value={form.DESCRIPTION} onChange={setField('DESCRIPTION')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default SupplierInvoices;
