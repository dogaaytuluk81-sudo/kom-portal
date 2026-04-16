import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, AlertTriangle, Plus, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, FilterBar, PillFilter, fmtMoney, Btn, Badge, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid } from '../../components/PageShell.jsx';

const INV_STATUS = {
  paid: { label: 'Ödendi', tone: 'green', color: '#10b981', bg: '#ecfdf5' },
  pending: { label: 'Beklemede', tone: 'amber', color: '#f59e0b', bg: '#fffbeb' },
  overdue: { label: 'Gecikmiş', tone: 'red', color: '#ef4444', bg: '#fef2f2' },
};

const Finance = () => {
  const [monthly, setMonthly] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState('overview');
  const [dateRange, setDateRange] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ TYPE: 'income', COMPANY: '', AMOUNT: 0, DESCRIPTION: '' });

  const load = () => {
    api.post('/api/finance/monthly').then(r => setMonthly(r.data.data || []));
    api.post('/api/finance/invoices').then(r => setInvoices(r.data.data || []));
    api.post('/api/finance/stats').then(r => setStats(r.data.data || {}));
  };
  useEffect(() => { load(); }, []);

  const createInvoice = async () => {
    if (!form.COMPANY || !form.AMOUNT) { toast.error('Firma ve tutar zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/finance/invoices/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const filteredMonthly = (() => {
    if (dateRange === 'all') return monthly;
    const months = { '7d': 1, '30d': 1, '3m': 3, '6m': 6 }[dateRange] || 999;
    return monthly.slice(-months);
  })();

  const totalIncome = filteredMonthly.reduce((s, m) => s + (m.INCOME || 0), 0);
  const totalExpense = filteredMonthly.reduce((s, m) => s + (m.EXPENSE || 0), 0);
  const totalProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome ? ((totalProfit / totalIncome) * 100).toFixed(1) : 0;

  const filteredInvoices = invoices.filter(inv => {
    if (dateRange === 'all') return true;
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180 }[dateRange] || 99999;
    return new Date(inv.DATE) >= new Date(Date.now() - days * 86400000);
  });

  const exportCsv = () => {
    const headers = ['Fatura No', 'Tip', 'Tarih', 'Firma', 'Tutar', 'Durum', 'Açıklama'];
    const rows = filteredInvoices.map(i => [i.INVOICE_NO, i.TYPE === 'income' ? 'Gelir' : 'Gider', i.DATE, i.COMPANY, i.AMOUNT, INV_STATUS[i.STATUS]?.label || i.STATUS, i.DESCRIPTION]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `kom-finans-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    toast.success('Finans raporu indirildi');
  };

  // Bar Chart
  const BarChart = () => {
    if (!filteredMonthly.length) return <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Veri yok</div>;
    const maxVal = Math.max(...filteredMonthly.flatMap(m => [m.INCOME || 0, m.EXPENSE || 0]), 1);
    const w = 560, h = 200;
    const pad = { top: 10, right: 10, bottom: 28, left: 48 };
    const cw = w - pad.left - pad.right, ch = h - pad.top - pad.bottom;
    const gw = cw / filteredMonthly.length, bp = 8;
    const bw = (gw - bp * 2 - 4) / 2;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        {[0, 0.25, 0.5, 0.75, 1].map((r, i) => {
          const y = pad.top + ch * (1 - r);
          return (<g key={i}><line x1={pad.left} x2={pad.left + cw} y1={y} y2={y} stroke="#f1f5f9" strokeDasharray="3 3" /><text x={pad.left - 6} y={y + 3} fontSize="9" fill="#94a3b8" textAnchor="end" fontWeight="600">{(maxVal * r / 1000).toFixed(0)}K</text></g>);
        })}
        {filteredMonthly.map((m, gi) => {
          const gx = pad.left + gi * gw + bp;
          const incH = ((m.INCOME || 0) / maxVal) * ch, expH = ((m.EXPENSE || 0) / maxVal) * ch;
          return (<g key={gi}>
            <rect x={gx} y={pad.top + ch - incH} width={bw} height={incH} fill="#10b981" rx="3"><title>Gelir: {fmtMoney(m.INCOME)}</title></rect>
            <rect x={gx + bw + 4} y={pad.top + ch - expH} width={bw} height={expH} fill="#ef4444" rx="3"><title>Gider: {fmtMoney(m.EXPENSE)}</title></rect>
            <text x={pad.left + gi * gw + gw / 2} y={h - 8} fontSize="9" fill="#94a3b8" textAnchor="middle" fontWeight="600">{m.MONTH?.slice(5)}</text>
          </g>);
        })}
      </svg>
    );
  };

  return (
    <DarkHero
      icon={Wallet}
      label="Finans & Muhasebe"
      title="Gelir-Gider Yönetimi"
      subtitle="Nakit akış, fatura takibi ve finansal performans"
      theme="finance"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn variant="ghost" icon={Download} onClick={exportCsv} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>CSV İndir</Btn>
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Fatura</Btn>
        </>
      }
      stats={[
        { label: 'Toplam Gelir', value: fmtMoney(totalIncome), sub: `${filteredMonthly.length} ay`, color: '#10b981' },
        { label: 'Toplam Gider', value: fmtMoney(totalExpense), sub: `Maliyet toplamı`, color: '#ef4444' },
        { label: 'Net Kâr', value: fmtMoney(totalProfit), sub: 'Gelir - Gider', color: '#E81E25' },
        { label: 'Kâr Marjı', value: `${profitMargin}%`, sub: 'Net Kâr / Gelir', color: '#8b5cf6', tip: 'Net Kâr / Toplam Gelir × 100. Gelirin ne kadarının kâra dönüştüğünü gösterir.' },
      ]}
    >
      {stats.overdueReceivables > 0 && (
        <div style={{ background: '#fef2f2', borderRadius: 12, padding: 14, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <AlertTriangle size={16} color="#dc2626" />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', margin: 0 }}>Gecikmiş Alacaklar: {fmtMoney(stats.overdueReceivables)}</p>
        </div>
      )}

      <FilterBar>
        <PillFilter value={tab} onChange={setTab} options={[
          { id: 'overview', label: 'Genel Bakış' },
          { id: 'invoices', label: 'Faturalar' },
        ]} />
      </FilterBar>

      {tab === 'overview' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 18px' }}>Aylık Gelir & Gider</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32, alignItems: 'center' }}>
            <div>
              <BarChart />
              <div style={{ display: 'flex', gap: 20, justifyContent: 'center', marginTop: 10, fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#10b981' }} /> Gelir</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: '#ef4444' }} /> Gider</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dönem Gelir</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#10b981', margin: '6px 0 0' }}>{fmtMoney(totalIncome)}</p>
              </div>
              <div style={{ paddingBottom: 16, borderBottom: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dönem Gider</p>
                <p style={{ fontSize: 18, fontWeight: 800, color: '#ef4444', margin: '6px 0 0' }}>{fmtMoney(totalExpense)}</p>
              </div>
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Net Kâr</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: '#E81E25', margin: '6px 0 2px' }}>{fmtMoney(totalProfit)}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>Kâr marjı: {profitMargin}%</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {tab === 'invoices' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Fatura No', 'Tip', 'Tarih', 'Firma', 'Açıklama', 'Tutar', 'Durum'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.map(inv => (
                <tr key={inv.ID} onClick={() => setDetailOpen(inv)}
                  style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{inv.INVOICE_NO}</td>
                  <td style={{ padding: '14px 20px' }}><Badge tone={inv.TYPE === 'income' ? 'green' : 'red'}>{inv.TYPE === 'income' ? 'Gelir' : 'Gider'}</Badge></td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>{inv.DATE}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{inv.COMPANY}</td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>{inv.DESCRIPTION}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 800, color: inv.TYPE === 'income' ? '#10b981' : '#ef4444' }}>
                    {inv.TYPE === 'income' ? '+' : '-'}{fmtMoney(inv.AMOUNT)}
                  </td>
                  <td style={{ padding: '14px 20px' }}><Badge tone={INV_STATUS[inv.STATUS]?.tone}>{INV_STATUS[inv.STATUS]?.label}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={detailOpen.INVOICE_NO} subtitle={`${detailOpen.TYPE === 'income' ? 'Gelir' : 'Gider'} Faturası · ${detailOpen.COMPANY}`} icon={Wallet} wide={false}>
          <DetailGrid items={[
            { label: 'Fatura No', value: detailOpen.INVOICE_NO },
            { label: 'Tip', value: detailOpen.TYPE === 'income' ? 'Gelir' : 'Gider', color: detailOpen.TYPE === 'income' ? '#059669' : '#dc2626' },
            { label: 'Tarih', value: detailOpen.DATE },
            { label: 'Firma', value: detailOpen.COMPANY },
            { label: 'Tutar', value: fmtMoney(detailOpen.AMOUNT), color: '#E81E25' },
            { label: 'Durum', value: INV_STATUS[detailOpen.STATUS]?.label, color: INV_STATUS[detailOpen.STATUS]?.color },
          ]} />
          {detailOpen.DESCRIPTION && (
            <div style={{ padding: 16, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Açıklama</p>
              <p style={{ fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.6 }}>{detailOpen.DESCRIPTION}</p>
            </div>
          )}
        </DetailModal>
      )}

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Fatura" icon={Wallet} onSubmit={createInvoice} submitting={saving}>
        <FormField label="Fatura Tipi" type="select" value={form.TYPE} onChange={setField('TYPE')} options={[{value:'income',label:'Gelir'},{value:'expense',label:'Gider'}]} span={2} />
        <FormField label="Firma" required value={form.COMPANY} onChange={setField('COMPANY')} span={2} />
        <FormField label="Tutar (₺)" type="number" required value={form.AMOUNT} onChange={setField('AMOUNT')} span={2} />
        <FormField label="Açıklama" type="textarea" value={form.DESCRIPTION} onChange={setField('DESCRIPTION')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default Finance;
