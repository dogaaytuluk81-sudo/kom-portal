import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, CheckCircle2, AlertTriangle, XCircle, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid } from '../../components/PageShell.jsx';

const STATUS = {
  passed: { label: 'Başarılı', tone: 'green', icon: CheckCircle2, color: '#10b981' },
  warning: { label: 'Uyarı', tone: 'amber', icon: AlertTriangle, color: '#f59e0b' },
  failed: { label: 'Başarısız', tone: 'red', icon: XCircle, color: '#ef4444' },
};

const Quality = () => {
  const [checks, setChecks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ PRODUCT: '', INSPECTOR: '', STATUS: 'passed', TOTAL: 0, DEFECT_COUNT: 0, NOTE: '' });

  const load = () => api.post('/api/quality').then(r => setChecks(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createCheck = async () => {
    if (!form.PRODUCT || !form.INSPECTOR) { toast.error('Ürün ve denetçi zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/quality/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const dateFiltered = checks.filter(c => {
    if (dateRange === 'all') return true;
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180 }[dateRange] || 99999;
    return new Date(c.DATE) >= new Date(Date.now() - days * 86400000);
  });

  const passed = dateFiltered.filter(c => c.STATUS === 'passed').length;
  const failed = dateFiltered.filter(c => c.STATUS === 'failed').length;
  const warning = dateFiltered.filter(c => c.STATUS === 'warning').length;
  const successRate = dateFiltered.length ? Math.round((passed / dateFiltered.length) * 100) : 0;

  return (
    <DarkHero
      icon={ShieldCheck}
      label="Kalite Kontrol"
      title="Kalite Yönetimi"
      subtitle={`${dateFiltered.length} kontrol · Ürün kalite denetimleri ve hata analizi`}
      theme="production"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Kontrol</Btn>
        </>
      }
      stats={[
        { label: 'Başarı Oranı', value: `${successRate}%`, sub: 'Başarılı / Toplam', color: '#10b981', tip: 'Kalite kontrolden başarılı geçen kontrollerin toplam kontrole oranı' },
        { label: 'Başarılı', value: passed, color: '#10b981' },
        { label: 'Uyarılı', value: warning, color: '#f59e0b' },
        { label: 'Başarısız', value: failed, color: '#ef4444' },
      ]}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {dateFiltered.map((c, i) => {
          const st = STATUS[c.STATUS] || STATUS.passed;
          const StIcon = st.icon;
          const defectRate = c.TOTAL ? ((c.DEFECT_COUNT / c.TOTAL) * 100).toFixed(1) : 0;
          return (
            <motion.div key={c.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * Math.min(i, 6) }}
              onClick={() => setDetailOpen(c)}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)', borderLeft: `4px solid ${st.color}`
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: 20 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${st.color}15`, border: `1px solid ${st.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <StIcon size={20} color={st.color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Badge tone={st.tone}>{st.label}</Badge>
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600 }}>{c.DATE}</span>
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{c.PRODUCT}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>Denetçi: {c.INSPECTOR} · {c.NOTE}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, flexShrink: 0 }}>
                  <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, background: '#f8fafc' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700 }}>TOPLAM</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>{c.TOTAL}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, background: '#f8fafc' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700 }}>HATA</p>
                    <p style={{ fontSize: 18, fontWeight: 800, color: st.color, margin: '2px 0 0' }}>{defectRate}%</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={detailOpen.PRODUCT} subtitle={`Denetçi: ${detailOpen.INSPECTOR} · ${detailOpen.DATE}`} icon={ShieldCheck}>
          <DetailGrid items={[
            { label: 'Ürün / Lot', value: detailOpen.PRODUCT },
            { label: 'Denetçi', value: detailOpen.INSPECTOR },
            { label: 'Tarih', value: detailOpen.DATE },
            { label: 'Sonuç', value: STATUS[detailOpen.STATUS]?.label, color: STATUS[detailOpen.STATUS]?.color },
            { label: 'Toplam Kontrol', value: detailOpen.TOTAL, sub: 'Kontrol edilen toplam ürün adedi' },
            { label: 'Hatalı Adet', value: detailOpen.DEFECT_COUNT, color: detailOpen.DEFECT_COUNT > 20 ? '#dc2626' : '#0f172a' },
            { label: 'Hata Oranı', value: `${detailOpen.TOTAL ? ((detailOpen.DEFECT_COUNT / detailOpen.TOTAL) * 100).toFixed(1) : 0}%`, sub: 'Hatalı adet / toplam kontrol × 100', color: detailOpen.DEFECT_COUNT / detailOpen.TOTAL > 0.05 ? '#dc2626' : '#059669' },
            { label: 'Not', value: detailOpen.NOTE || '—' },
          ]} />
        </DetailModal>
      )}

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Kalite Kontrol" icon={ShieldCheck} onSubmit={createCheck} submitting={saving}>
        <FormField label="Ürün / Lot" required value={form.PRODUCT} onChange={setField('PRODUCT')} span={2} />
        <FormField label="Denetçi" required value={form.INSPECTOR} onChange={setField('INSPECTOR')} />
        <FormField label="Sonuç" type="select" value={form.STATUS} onChange={setField('STATUS')} options={[{value:'passed',label:'Başarılı'},{value:'warning',label:'Uyarı'},{value:'failed',label:'Başarısız'}]} />
        <FormField label="Toplam Adet" type="number" value={form.TOTAL} onChange={setField('TOTAL')} />
        <FormField label="Hata Sayısı" type="number" value={form.DEFECT_COUNT} onChange={setField('DEFECT_COUNT')} />
        <FormField label="Not" type="textarea" value={form.NOTE} onChange={setField('NOTE')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default Quality;
