import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, Search, CheckCircle2, Clock, XCircle, FileEdit, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { fmtMoney, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid, InfoTip, Badge, Btn } from '../../components/PageShell.jsx';

const STATUS = {
  draft: { label: 'Taslak', tone: 'gray', icon: FileEdit, color: '#94a3b8', bg: '#f1f5f9' },
  pending: { label: 'Beklemede', tone: 'blue', icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
  negotiation: { label: 'Müzakere', tone: 'amber', icon: FileEdit, color: '#f59e0b', bg: '#fffbeb' },
  approved: { label: 'Onaylandı', tone: 'green', icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
  rejected: { label: 'Reddedildi', tone: 'red', icon: XCircle, color: '#ef4444', bg: '#fef2f2' },
};

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({
    TITLE: '', FIRM_NAME: '', CONTACT_NAME: '', TOTAL_PRICE: 0, ITEMS: 1, VALID_UNTIL: '', DESCRIPTION: ''
  });

  const load = () => api.post('/api/quotes').then(r => setQuotes(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createQuote = async () => {
    if (!form.TITLE || !form.FIRM_NAME) { toast.error('Başlık ve firma zorunludur'); return; }
    setSaving(true);
    try {
      const r = await api.post('/api/quotes/create', form);
      if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); }
    } catch (e) { toast.error(e?.response?.data?.message || 'Kayıt başarısız'); }
    finally { setSaving(false); }
  };

  const dateFiltered = quotes.filter(q => {
    if (dateRange === 'all') return true;
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180 }[dateRange] || 99999;
    return new Date(q.CREATED_DATE) >= new Date(Date.now() - days * 86400000);
  });

  const filtered = dateFiltered.filter(q =>
    (filter === 'all' || q.STATUS === filter) &&
    (`${q.QUOTE_NO} ${q.TITLE} ${q.FIRM_NAME}`.toLowerCase().includes(search.toLowerCase()))
  );

  const approved = dateFiltered.filter(q => q.STATUS === 'approved');
  const approvedTotal = approved.reduce((s, q) => s + q.TOTAL_PRICE, 0);
  const totalValue = dateFiltered.reduce((s, q) => s + q.TOTAL_PRICE, 0);
  const winRate = dateFiltered.length ? Math.round(approved.length / dateFiltered.length * 100) : 0;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* HERO BANNER */}
      <div style={{
        background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
        padding: '36px 40px 80px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -120, right: -60, width: 400, height: 400, background: 'radial-gradient(circle, rgba(232,30,37,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -80, left: '30%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(232,30,37,0.2)', border: '1px solid rgba(232,30,37,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <FileText size={18} color="#E81E25" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>Teklif Yönetimi</span>
              </div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.5 }}>
                Müşteri Teklifleri
              </h1>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', margin: '6px 0 0' }}>
                Revizyonlar, onay süreçleri ve teklif performansı
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <DateFilter value={dateRange} onChange={setDateRange} />
              <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Teklif</Btn>
            </div>
          </div>

          {/* Glassmorphism Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
            {[
              { label: 'Toplam Teklif', value: dateFiltered.length, sub: fmtMoney(totalValue), color: '#E81E25' },
              { label: 'Onaylanan', value: approved.length, sub: fmtMoney(approvedTotal), color: '#10b981' },
              { label: 'Kazanma Oranı', value: `${winRate}%`, sub: 'Onay / Toplam', color: '#8b5cf6', tip: 'Onaylanan tekliflerin toplam tekliflere oranı' },
              { label: 'Ort. Teklif Değeri', value: fmtMoney(dateFiltered.length ? totalValue / dateFiltered.length : 0), sub: `${dateFiltered.length} teklif üzerinden`, color: '#3b82f6' },
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                style={{
                  background: 'rgba(255,255,255,0.07)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 16, padding: '20px 22px',
                  position: 'relative', overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: s.color }} />
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {s.label}
                  {s.tip && <InfoTip text={s.tip} />}
                </p>
                <p style={{ fontSize: 26, fontWeight: 800, color: '#fff', margin: '8px 0 4px', letterSpacing: -0.5 }}>{s.value}</p>
                <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 500 }}>{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{ maxWidth: 1400, margin: '-44px auto 0', padding: '0 40px 60px', position: 'relative' }}>
        {/* Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: '#fff', borderRadius: 16, padding: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
            marginBottom: 20
          }}
        >
          <div style={{ flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <Search size={14} color="#94a3b8" />
            <input placeholder="Teklif no, başlık veya müşteri..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1, color: '#0f172a' }} />
          </div>
          <div style={{ display: 'flex', gap: 4, background: '#f8fafc', borderRadius: 10, padding: 3 }}>
            {['all', 'draft', 'pending', 'negotiation', 'approved', 'rejected'].map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{
                padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700,
                background: filter === s ? (STATUS[s]?.bg || '#0f172a') : 'transparent',
                color: filter === s ? (STATUS[s]?.color || '#fff') : '#94a3b8',
                transition: 'all 0.2s'
              }}>{s === 'all' ? 'Tümü' : STATUS[s]?.label}</button>
            ))}
          </div>
        </motion.div>

        {/* Quote Cards */}
        <div style={{ display: 'grid', gap: 14 }}>
          {filtered.map((q, i) => {
            const st = STATUS[q.STATUS] || STATUS.draft;
            const StIcon = st.icon;
            const daysLeft = q.VALID_UNTIL ? Math.ceil((new Date(q.VALID_UNTIL) - Date.now()) / 86400000) : null;
            return (
              <motion.div
                key={q.ID}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * Math.min(i, 6) }}
                onClick={() => setDetailOpen(q)}
                style={{
                  background: '#fff',
                  borderRadius: 16,
                  border: '1px solid #e2e8f0',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.25s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {/* Sol renk şeridi */}
                  <div style={{ width: 5, alignSelf: 'stretch', background: st.color, flexShrink: 0 }} />

                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px' }}>
                    {/* Teklif ikonu */}
                    <div style={{
                      width: 56, height: 56, borderRadius: 14,
                      background: `linear-gradient(135deg, ${st.color}20, ${st.color}08)`,
                      border: `1px solid ${st.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <StIcon size={24} color={st.color} />
                    </div>

                    {/* İçerik */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: 0.5 }}>{q.QUOTE_NO}</span>
                        <Badge tone={st.tone}>{st.label}</Badge>
                        {q.VERSION > 1 && <Badge tone="purple">v{q.VERSION}</Badge>}
                        {daysLeft !== null && daysLeft <= 7 && daysLeft > 0 && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#f59e0b', background: '#fffbeb', padding: '2px 8px', borderRadius: 100 }}>
                            {daysLeft} gün kaldı
                          </span>
                        )}
                        {daysLeft !== null && daysLeft <= 0 && q.STATUS !== 'approved' && q.STATUS !== 'rejected' && (
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 8px', borderRadius: 100 }}>
                            Süresi doldu
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>{q.TITLE}</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                        {q.FIRM_NAME} · {q.CONTACT_NAME || 'Yetkili belirtilmemiş'} · {q.ITEMS} kalem
                      </p>
                    </div>

                    {/* Fiyat */}
                    <div style={{ textAlign: 'right', flexShrink: 0, marginRight: 8 }}>
                      <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: -0.5, fontVariantNumeric: 'tabular-nums' }}>
                        {fmtMoney(q.TOTAL_PRICE)}
                      </p>
                      <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', fontWeight: 500 }}>
                        Geçerlilik: {q.VALID_UNTIL || '—'}
                      </p>
                    </div>

                    {/* Ok */}
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: '#f8fafc', border: '1px solid #e2e8f0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <ArrowRight size={14} color="#94a3b8" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
              Sonuç bulunamadı
            </div>
          )}
        </div>
      </div>

      {/* Detay Modal */}
      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={detailOpen.TITLE}
          subtitle={`${detailOpen.QUOTE_NO} · ${(STATUS[detailOpen.STATUS] || STATUS.draft).label}`}
          icon={FileText}
        >
          <DetailGrid items={[
            { label: 'Teklif No', value: detailOpen.QUOTE_NO },
            { label: 'Durum', value: (STATUS[detailOpen.STATUS] || STATUS.draft).label, color: (STATUS[detailOpen.STATUS] || STATUS.draft).color },
            { label: 'Firma', value: detailOpen.FIRM_NAME },
            { label: 'Yetkili', value: detailOpen.CONTACT_NAME || '—' },
            { label: 'Toplam Tutar', value: fmtMoney(detailOpen.TOTAL_PRICE), color: '#E81E25' },
            { label: 'Para Birimi', value: detailOpen.CURRENCY || 'TRY' },
            { label: 'Kalem Sayısı', value: detailOpen.ITEMS },
            { label: 'Versiyon', value: `v${detailOpen.VERSION}`, sub: detailOpen.VERSION > 1 ? 'Revize edilmiş' : 'İlk teklif' },
            { label: 'Oluşturulma', value: detailOpen.CREATED_DATE },
            { label: 'Geçerlilik', value: detailOpen.VALID_UNTIL },
          ]} />
          {detailOpen.DESCRIPTION && (
            <div style={{ padding: 16, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Açıklama</p>
              <p style={{ fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.6 }}>{detailOpen.DESCRIPTION}</p>
            </div>
          )}
        </DetailModal>
      )}

      {/* Yeni Teklif Modal */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Teklif" subtitle="Müşteri için yeni teklif oluşturun" icon={FileText} onSubmit={createQuote} submitting={saving}>
        <FormField label="Teklif Başlığı" required value={form.TITLE} onChange={setField('TITLE')} span={2} />
        <FormField label="Firma" required value={form.FIRM_NAME} onChange={setField('FIRM_NAME')} />
        <FormField label="Yetkili Kişi" value={form.CONTACT_NAME} onChange={setField('CONTACT_NAME')} />
        <FormField label="Toplam Tutar (₺)" type="number" value={form.TOTAL_PRICE} onChange={setField('TOTAL_PRICE')} />
        <FormField label="Kalem Sayısı" type="number" value={form.ITEMS} onChange={setField('ITEMS')} />
        <FormField label="Geçerlilik Tarihi" type="date" value={form.VALID_UNTIL} onChange={setField('VALID_UNTIL')} span={2} />
        <FormField label="Açıklama" type="textarea" value={form.DESCRIPTION} onChange={setField('DESCRIPTION')} span={2} />
      </FormModal>
    </div>
  );
};

export default Quotes;
