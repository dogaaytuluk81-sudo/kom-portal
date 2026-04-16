import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Store, Plus, MapPin, Phone, User, Star } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, fmtMoney, FormModal, FormField, useForm, DateFilter } from '../../components/PageShell.jsx';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const { form, setField, reset } = useForm({ NAME: '', CITY: '', ADDRESS: '', MANAGER: '', PHONE: '', STAFF: 1 });

  const load = () => api.post('/api/stores').then(r => setStores(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createStore = async () => {
    if (!form.NAME || !form.CITY) { toast.error('İsim ve şehir zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/stores/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const totalSales = stores.reduce((s, st) => s + st.MONTHLY_SALES, 0);
  const totalStaff = stores.reduce((s, st) => s + st.STAFF, 0);
  const avgRating = stores.length ? (stores.reduce((s, st) => s + st.RATING, 0) / stores.length).toFixed(1) : 0;
  const best = [...stores].sort((a, b) => b.MONTHLY_SALES - a.MONTHLY_SALES)[0];

  return (
    <DarkHero
      icon={Store}
      label="Mağaza Yönetimi"
      title="Mağaza & Lokasyon"
      subtitle={`${stores.length} mağaza · Performans ve personel takibi`}
      theme="management"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Mağaza</Btn>
        </>
      }
      stats={[
        { label: 'Toplam Mağaza', value: stores.length, color: '#06b6d4' },
        { label: 'Aylık Satış', value: fmtMoney(totalSales), sub: `${stores.length} mağaza toplamı`, color: '#10b981' },
        { label: 'Toplam Personel', value: totalStaff, color: '#8b5cf6' },
        { label: 'Ort. Puan', value: `${avgRating}/5`, sub: 'Müşteri değerlendirmesi', color: '#f59e0b' },
      ]}
    >
      {/* Ayın Mağazası */}
      {best && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, #0f172a, #1e293b)',
            borderRadius: 16, padding: 28, marginBottom: 20,
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative', overflow: 'hidden'
          }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(251,191,36,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Star size={24} color="#fbbf24" fill="#fbbf24" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>Ayın Mağazası</p>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: '4px 0 2px' }}>{best.NAME}</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0 }}>{best.CITY} · {best.MANAGER}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Aylık Satış</p>
              <p style={{ fontSize: 28, fontWeight: 800, color: '#fbbf24', margin: '4px 0 0', letterSpacing: -0.5 }}>{fmtMoney(best.MONTHLY_SALES)}</p>
            </div>
          </div>
        </motion.div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
        {stores.map((s, i) => (
          <motion.div key={s.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ height: 4, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={20} color="#06b6d4" />
                </div>
                <Badge tone="green">Aktif</Badge>
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{s.NAME}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748b', marginBottom: 14 }}>
                <MapPin size={12} /> {s.CITY} · {s.ADDRESS}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}><User size={11} /> {s.MANAGER}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}><Phone size={11} /> {s.PHONE}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>SATIŞ</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#E81E25', margin: '4px 0 0' }}>{fmtMoney(s.MONTHLY_SALES)}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>PERSONEL</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{s.STAFF}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>PUAN</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, marginTop: 4 }}>
                    <Star size={11} color="#fbbf24" fill="#fbbf24" />
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#0f172a' }}>{s.RATING}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Mağaza" icon={Store} onSubmit={createStore} submitting={saving}>
        <FormField label="Mağaza Adı" required value={form.NAME} onChange={setField('NAME')} span={2} />
        <FormField label="Şehir" required value={form.CITY} onChange={setField('CITY')} />
        <FormField label="Personel Sayısı" type="number" value={form.STAFF} onChange={setField('STAFF')} />
        <FormField label="Adres" value={form.ADDRESS} onChange={setField('ADDRESS')} span={2} />
        <FormField label="Müdür" value={form.MANAGER} onChange={setField('MANAGER')} />
        <FormField label="Telefon" value={form.PHONE} onChange={setField('PHONE')} />
      </FormModal>
    </DarkHero>
  );
};

export default Stores;
