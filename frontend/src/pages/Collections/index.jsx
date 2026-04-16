import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, fmtMoney, FormModal, FormField, useForm, DateFilter } from '../../components/PageShell.jsx';

const STATUS = {
  planning: { label: 'Planlama', tone: 'gray' },
  design: { label: 'Tasarım', tone: 'purple' },
  production: { label: 'Üretim', tone: 'amber' },
  launched: { label: 'Satışta', tone: 'green' },
};

const Collections = () => {
  const [collections, setCollections] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ NAME: '', SEASON: '', START_DATE: '', LAUNCH_DATE: '', PRODUCT_COUNT: 0, BUDGET: 0, COLOR: '#E81E25' });

  const load = () => api.post('/api/collections').then(r => setCollections(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createCollection = async () => {
    if (!form.NAME || !form.SEASON) { toast.error('İsim ve sezon zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/collections/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const totalBudget = collections.reduce((s, c) => s + c.BUDGET, 0);
  const totalSpent = collections.reduce((s, c) => s + c.SPENT, 0);
  const active = collections.filter(c => c.STATUS !== 'launched').length;

  return (
    <DarkHero
      icon={Sparkles}
      label="Sezon Planlama"
      title="Koleksiyon Yönetimi"
      subtitle={`${collections.length} koleksiyon · Yaşam döngüsü ve bütçe takibi`}
      theme="production"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Koleksiyon</Btn>
        </>
      }
      stats={[
        { label: 'Toplam Koleksiyon', value: collections.length, color: '#f59e0b' },
        { label: 'Aktif Geliştirme', value: active, sub: `${collections.filter(c => c.STATUS === 'launched').length} satışta`, color: '#8b5cf6' },
        { label: 'Toplam Ürün', value: collections.reduce((s, c) => s + c.PRODUCT_COUNT, 0), color: '#06b6d4' },
        { label: 'Bütçe Kullanımı', value: `${totalBudget ? Math.round((totalSpent / totalBudget) * 100) : 0}%`, sub: `${fmtMoney(totalSpent)} / ${fmtMoney(totalBudget)}`, color: '#10b981', tip: 'Harcanan bütçe / toplam planlanan bütçe × 100' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 18 }}>
        {collections.map((c, i) => {
          const spent = Math.round((c.SPENT / c.BUDGET) * 100);
          return (
            <motion.div key={c.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
            >
              <div style={{
                height: 80, padding: '18px 22px',
                background: `linear-gradient(135deg, ${c.COLOR}, ${c.COLOR}cc)`,
                position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 140, height: 140, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }} />
                <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.7)', margin: 0, letterSpacing: 2, textTransform: 'uppercase' }}>{c.SEASON}</p>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '4px 0 0', letterSpacing: -0.3 }}>{c.NAME}</h3>
                  </div>
                  <Badge tone={STATUS[c.STATUS]?.tone}>{STATUS[c.STATUS]?.label}</Badge>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>İlerleme</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: c.COLOR }}>{c.PROGRESS}%</span>
                  </div>
                  <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${c.PROGRESS}%`, height: '100%', background: c.COLOR, borderRadius: 3, transition: 'width 0.5s' }} />
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Bütçe</span>
                    <span style={{ fontSize: 11, fontWeight: 800, color: spent > 90 ? '#ef4444' : '#10b981' }}>{spent}%</span>
                  </div>
                  <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ width: `${spent}%`, height: '100%', background: spent > 90 ? '#ef4444' : '#10b981', borderRadius: 2 }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>{fmtMoney(c.SPENT)}</span>
                    <span style={{ fontSize: 10, color: '#94a3b8' }}>/ {fmtMoney(c.BUDGET)}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>ÜRÜN</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{c.PRODUCT_COUNT}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>BAŞLANGIÇ</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#0f172a', margin: '4px 0 0' }}>{c.START_DATE?.slice(5)}</p>
                  </div>
                  <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>LANSMAN</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: c.COLOR, margin: '4px 0 0' }}>{c.LAUNCH_DATE?.slice(5)}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Koleksiyon" icon={Sparkles} onSubmit={createCollection} submitting={saving}>
        <FormField label="Koleksiyon Adı" required value={form.NAME} onChange={setField('NAME')} span={2} />
        <FormField label="Sezon" type="select" required value={form.SEASON} onChange={setField('SEASON')} options={['Yaz 2026', 'Güz 2026', 'Kış 2026', 'İlkbahar 2027']} />
        <FormField label="Tema Rengi" type="color" value={form.COLOR} onChange={setField('COLOR')} />
        <FormField label="Başlangıç" type="date" value={form.START_DATE} onChange={setField('START_DATE')} />
        <FormField label="Lansman" type="date" value={form.LAUNCH_DATE} onChange={setField('LAUNCH_DATE')} />
        <FormField label="Ürün Sayısı" type="number" value={form.PRODUCT_COUNT} onChange={setField('PRODUCT_COUNT')} />
        <FormField label="Bütçe (₺)" type="number" value={form.BUDGET} onChange={setField('BUDGET')} />
      </FormModal>
    </DarkHero>
  );
};

export default Collections;
