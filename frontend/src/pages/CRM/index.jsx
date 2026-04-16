import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Plus, Search, Phone, Mail, Crown, Zap } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { fmtMoney, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid, InfoTip, Badge, Btn } from '../../components/PageShell.jsx';

const SEGMENTS = {
  vip: { label: 'VIP', tone: 'amber', icon: Crown, color: '#f59e0b', bg: '#fffbeb' },
  regular: { label: 'Standart', tone: 'blue', icon: UserCircle, color: '#3b82f6', bg: '#eff6ff' },
  new: { label: 'Yeni', tone: 'green', icon: Zap, color: '#10b981', bg: '#ecfdf5' },
};

const CRM = () => {
  const [customers, setCustomers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ NAME: '', CONTACT: '', PHONE: '', EMAIL: '', CITY: '', SEGMENT: 'new' });

  const load = () => api.post('/api/crm/customers').then(r => setCustomers(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createCustomer = async () => {
    if (!form.NAME) { toast.error('Firma adı zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/crm/customers/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const dateFiltered = customers.filter(c => {
    if (dateRange === 'all') return true;
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180 }[dateRange] || 99999;
    return new Date(c.LAST_ORDER) >= new Date(Date.now() - days * 86400000);
  });

  const filtered = dateFiltered.filter(c =>
    (filter === 'all' || c.SEGMENT === filter) &&
    (`${c.NAME} ${c.CONTACT} ${c.CITY}`.toLowerCase().includes(search.toLowerCase()))
  );

  const totalRevenue = dateFiltered.reduce((s, c) => s + c.TOTAL_REVENUE, 0);
  const vipCount = dateFiltered.filter(c => c.SEGMENT === 'vip').length;
  const avgSatisfaction = dateFiltered.length ? Math.round(dateFiltered.reduce((s, c) => s + c.SATISFACTION, 0) / dateFiltered.length) : 0;
  const totalOrders = dateFiltered.reduce((s, c) => s + c.TOTAL_ORDERS, 0);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* HERO */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        padding: '36px 40px 80px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: 100, width: 350, height: 350, background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCircle size={18} color="#8b5cf6" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>Müşteri İlişkileri</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.5 }}>CRM Yönetimi</h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>{dateFiltered.length} müşteri · Segmentasyon ve performans takibi</p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <DateFilter value={dateRange} onChange={setDateRange} />
              <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Müşteri</Btn>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Toplam Müşteri', value: dateFiltered.length, sub: `${vipCount} VIP`, color: '#8b5cf6' },
              { label: 'Toplam Ciro', value: fmtMoney(totalRevenue), sub: `${totalOrders} sipariş`, color: '#10b981', tip: 'Seçili dönemdeki müşterilerin toplam cirosu' },
              { label: 'Ort. Memnuniyet', value: `${avgSatisfaction}%`, sub: 'Anket ortalaması', color: '#f59e0b', tip: 'Müşteri memnuniyet anketlerinin ortalaması (0-100)' },
              { label: 'Ort. Müşteri Değeri', value: fmtMoney(dateFiltered.length ? totalRevenue / dateFiltered.length : 0), sub: 'Müşteri başına ciro', color: '#3b82f6' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: s.color }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>{s.label}{s.tip && <InfoTip text={s.tip} />}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '8px 0 4px', letterSpacing: -0.5 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 500 }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1400, margin: '-44px auto 0', padding: '0 40px 60px', position: 'relative' }}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ background: '#fff', borderRadius: 16, padding: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
          <div style={{ flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Müşteri, kişi, şehir ara..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1 }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 10, padding: 3 }}>
            {['all', 'vip', 'regular', 'new'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 700,
                background: filter === s ? (SEGMENTS[s]?.bg || '#0f172a') : 'transparent',
                color: filter === s ? (SEGMENTS[s]?.color || '#fff') : '#94a3b8', transition: 'all 0.2s'
              }}>{s === 'all' ? 'Tümü' : SEGMENTS[s]?.label}</button>
            ))}
          </div>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {filtered.map((c, i) => {
            const seg = SEGMENTS[c.SEGMENT] || SEGMENTS.regular;
            return (
              <motion.div key={c.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * Math.min(i, 8) }}
                onClick={() => setDetailOpen(c)}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
              >
                {/* Üst gradient */}
                <div style={{ height: 4, background: `linear-gradient(90deg, ${seg.color}, ${seg.color}88)` }} />

                <div style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `linear-gradient(135deg, ${seg.color}20, ${seg.color}08)`, border: `1px solid ${seg.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 800, color: seg.color }}>
                      {c.NAME[0]}
                    </div>
                    <Badge tone={seg.tone}>{seg.label}</Badge>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{c.NAME}</h3>
                  <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 16px' }}>{c.CONTACT} · {c.CITY}</p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}><Phone size={11} /> {c.PHONE}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}><Mail size={11} /> {c.EMAIL}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    {[
                      { label: 'Sipariş', value: c.TOTAL_ORDERS, color: '#0f172a' },
                      { label: 'Ciro', value: fmtMoney(c.TOTAL_REVENUE), color: '#E81E25' },
                      { label: 'Memn.', value: `${c.SATISFACTION}%`, color: '#10b981' },
                    ].map((m, mi) => (
                      <div key={mi} style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                        <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.3 }}>{m.label}</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: m.color, margin: '4px 0 0' }}>{m.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)} title={detailOpen.NAME}
          subtitle={`${(SEGMENTS[detailOpen.SEGMENT] || SEGMENTS.regular).label} Müşteri · ${detailOpen.CITY}`} icon={UserCircle}>
          <DetailGrid items={[
            { label: 'Yetkili Kişi', value: detailOpen.CONTACT },
            { label: 'Segment', value: (SEGMENTS[detailOpen.SEGMENT] || SEGMENTS.regular).label },
            { label: 'Telefon', value: detailOpen.PHONE },
            { label: 'E-posta', value: detailOpen.EMAIL },
            { label: 'Şehir', value: detailOpen.CITY },
            { label: 'Son Sipariş', value: detailOpen.LAST_ORDER },
            { label: 'Toplam Sipariş', value: detailOpen.TOTAL_ORDERS },
            { label: 'Toplam Ciro', value: fmtMoney(detailOpen.TOTAL_REVENUE), color: '#E81E25' },
            { label: 'Memnuniyet', value: `${detailOpen.SATISFACTION}%`, color: '#10b981', sub: 'Son anket sonucu (0-100 arası puan)' },
          ]} />
        </DetailModal>
      )}

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Müşteri" icon={UserCircle} onSubmit={createCustomer} submitting={saving}>
        <FormField label="Firma Adı" required value={form.NAME} onChange={setField('NAME')} span={2} />
        <FormField label="Yetkili Kişi" value={form.CONTACT} onChange={setField('CONTACT')} />
        <FormField label="Segment" type="select" value={form.SEGMENT} onChange={setField('SEGMENT')} options={[{value:'vip',label:'VIP'},{value:'regular',label:'Standart'},{value:'new',label:'Yeni'}]} />
        <FormField label="Telefon" value={form.PHONE} onChange={setField('PHONE')} />
        <FormField label="E-posta" type="email" value={form.EMAIL} onChange={setField('EMAIL')} />
        <FormField label="Şehir" value={form.CITY} onChange={setField('CITY')} span={2} />
      </FormModal>
    </div>
  );
};

export default CRM;
