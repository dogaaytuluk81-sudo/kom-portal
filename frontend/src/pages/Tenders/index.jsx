import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gavel, Plus, Star, Trophy, ArrowRight, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, FilterBar, SearchInput, PillFilter, Badge, Btn, fmtMoney, FormModal, FormField, useForm, DateFilter, DetailGrid, Modal } from '../../components/PageShell.jsx';
import { useConfetti } from '../../components/Confetti.jsx';

const STATUS = {
  draft: { label: 'Taslak', tone: 'gray', color: '#94a3b8' },
  open: { label: 'Açık — Teklif Bekleniyor', tone: 'amber', color: '#f59e0b' },
  evaluation: { label: 'Değerlendirme', tone: 'purple', color: '#8b5cf6' },
  awarded: { label: 'İhale Verildi', tone: 'green', color: '#10b981' },
  closed: { label: 'Kapalı', tone: 'gray', color: '#64748b' },
};

const Tenders = () => {
  const [tenders, setTenders] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [saving, setSaving] = useState(false);
  const { fireCenter, ConfettiCanvas } = useConfetti();

  const { form, setField, reset } = useForm({
    TITLE: '', DESCRIPTION: '', CATEGORY: '', QUANTITY: 0, UNIT: 'adet', BUDGET: 0, DEADLINE: ''
  });

  const load = () => {
    api.post('/api/tenders').then(r => setTenders(r.data.data || []));
    api.post('/api/tenders/stats').then(r => setStats(r.data.data || {}));
  };
  useEffect(() => { load(); }, []);

  const createTender = async () => {
    if (!form.TITLE || !form.CATEGORY) { toast.error('Başlık ve kategori zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/tenders/create', form); if (r.data.success) { toast.success(r.data.message); setCreateOpen(false); reset(); load(); } }
    catch { toast.error('Oluşturulamadı'); } finally { setSaving(false); }
  };

  const awardTender = async (tenderId, supplier) => {
    try {
      const r = await api.post('/api/tenders/award', { tenderId, supplier });
      if (r.data.success) { toast.success(r.data.message); fireCenter(); setDetailOpen(null); load(); }
    } catch { toast.error('İşlem başarısız'); }
  };

  const dateFiltered = tenders.filter(t => {
    if (dateRange === 'all') return true;
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180 }[dateRange] || 99999;
    return new Date(t.CREATED_DATE) >= new Date(Date.now() - days * 86400000);
  });

  const filtered = dateFiltered.filter(t =>
    (filter === 'all' || t.STATUS === filter) &&
    (`${t.TENDER_NO} ${t.TITLE} ${t.CATEGORY}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DarkHero
      icon={Gavel}
      label="İhale & Satın Alma"
      title="İhale Yönetimi"
      subtitle={`${dateFiltered.length} ihale · Tedarikçi teklifleri ve karşılaştırma`}
      theme="trade"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => setCreateOpen(true)}>Yeni İhale</Btn>
        </>
      }
      stats={[
        { label: 'Toplam İhale', value: stats.total || 0, color: '#8b5cf6' },
        { label: 'Açık İhaleler', value: stats.open || 0, sub: 'Teklif bekleniyor', color: '#f59e0b' },
        { label: 'Değerlendirmede', value: stats.evaluation || 0, sub: 'Karşılaştırılıyor', color: '#3b82f6' },
        { label: 'Toplam Teklif', value: stats.totalBids || 0, sub: fmtMoney(stats.totalBudget || 0) + ' bütçe', color: '#10b981' },
      ]}
    >
      <ConfettiCanvas />
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="İhale no, başlık veya kategori..." />
        <PillFilter value={filter} onChange={setFilter} options={[
          { id: 'all', label: 'Tümü' },
          { id: 'open', label: 'Açık', bg: '#fffbeb', color: '#f59e0b' },
          { id: 'evaluation', label: 'Değerlendirme', bg: '#f5f3ff', color: '#8b5cf6' },
          { id: 'awarded', label: 'Verildi', bg: '#ecfdf5', color: '#10b981' },
          { id: 'closed', label: 'Kapalı', bg: '#f1f5f9', color: '#64748b' },
        ]} />
      </FilterBar>

      <div style={{ display: 'grid', gap: 14 }}>
        {filtered.map((t, i) => {
          const st = STATUS[t.STATUS] || STATUS.open;
          const bestBid = t.BIDS.length ? [...t.BIDS].sort((a, b) => a.TOTAL - b.TOTAL)[0] : null;
          const daysLeft = t.DEADLINE ? Math.ceil((new Date(t.DEADLINE) - Date.now()) / 86400000) : null;
          return (
            <motion.div key={t.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * Math.min(i, 8) }}
              onClick={() => setDetailOpen(t)}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 5, alignSelf: 'stretch', background: st.color, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, padding: '20px 24px' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${st.color}12`, border: `1px solid ${st.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Gavel size={22} color={st.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{t.TENDER_NO}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      <Badge tone="blue">{t.CATEGORY}</Badge>
                      {t.AWARDED_TO && <Badge tone="green"><Trophy size={9} /> {t.AWARDED_TO}</Badge>}
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{t.TITLE}</h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      {t.QUANTITY} {t.UNIT} · Bütçe: {fmtMoney(t.BUDGET)}
                      {daysLeft !== null && daysLeft > 0 && t.STATUS === 'open' && <span style={{ color: '#f59e0b', fontWeight: 700 }}> · {daysLeft} gün kaldı</span>}
                      {daysLeft !== null && daysLeft <= 0 && t.STATUS === 'open' && <span style={{ color: '#ef4444', fontWeight: 700 }}> · Süre doldu</span>}
                    </p>
                  </div>

                  {/* Teklif sayısı + en iyi teklif */}
                  <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
                    <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700 }}>TEKLİF</p>
                      <p style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>{t.BIDS.length}</p>
                    </div>
                    {bestBid && (
                      <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, background: '#ecfdf5', border: '1px solid #a7f3d0' }}>
                        <p style={{ fontSize: 10, color: '#059669', margin: 0, fontWeight: 700 }}>EN İYİ</p>
                        <p style={{ fontSize: 14, fontWeight: 800, color: '#059669', margin: '2px 0 0' }}>{fmtMoney(bestBid.TOTAL)}</p>
                      </div>
                    )}
                  </div>

                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <ArrowRight size={14} color="#94a3b8" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* İhale Detay + Teklif Karşılaştırma Modal */}
      {detailOpen && (
        <Modal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={detailOpen.TITLE}
          subtitle={`${detailOpen.TENDER_NO} · ${(STATUS[detailOpen.STATUS] || STATUS.open).label}`}
          icon={Gavel} wide>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Üst bilgiler */}
            <DetailGrid items={[
              { label: 'Kategori', value: detailOpen.CATEGORY },
              { label: 'Miktar', value: `${detailOpen.QUANTITY} ${detailOpen.UNIT}` },
              { label: 'Bütçe', value: fmtMoney(detailOpen.BUDGET), color: '#E81E25' },
              { label: 'Son Tarih', value: detailOpen.DEADLINE },
              { label: 'Oluşturan', value: detailOpen.CREATED_BY },
              { label: 'Teklif Sayısı', value: detailOpen.BIDS.length },
            ]} />

            {detailOpen.DESCRIPTION && (
              <div style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Açıklama & Şartname</p>
                <p style={{ fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.6 }}>{detailOpen.DESCRIPTION}</p>
              </div>
            )}

            {/* Teklifler — Karşılaştırma Tablosu */}
            {detailOpen.BIDS.length > 0 ? (
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 14px' }}>Tedarikçi Teklifleri ({detailOpen.BIDS.length})</p>
                <div style={{ display: 'grid', gap: 10 }}>
                  {[...detailOpen.BIDS].sort((a, b) => a.TOTAL - b.TOTAL).map((bid, bi) => {
                    const isBest = bi === 0;
                    const isWinner = bid.WINNER;
                    const withinBudget = bid.TOTAL <= detailOpen.BUDGET;
                    return (
                      <div key={bid.ID} style={{
                        padding: 18, borderRadius: 14,
                        background: isWinner ? '#ecfdf5' : isBest ? '#f0fdf4' : '#fff',
                        border: `2px solid ${isWinner ? '#10b981' : isBest ? '#a7f3d0' : '#e2e8f0'}`,
                        position: 'relative'
                      }}>
                        {isWinner && (
                          <div style={{ position: 'absolute', top: -1, right: 16, background: '#10b981', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: '0 0 8px 8px', letterSpacing: 0.5 }}>
                            KAZANAN
                          </div>
                        )}
                        {isBest && !isWinner && (
                          <div style={{ position: 'absolute', top: -1, right: 16, background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: '0 0 8px 8px', letterSpacing: 0.5 }}>
                            EN UYGUN
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                          <div style={{
                            width: 44, height: 44, borderRadius: 12,
                            background: isWinner ? '#10b981' : `#8b5cf620`,
                            color: isWinner ? '#fff' : '#8b5cf6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 16, fontWeight: 800, flexShrink: 0
                          }}>
                            {isWinner ? <Trophy size={18} /> : `#${bi + 1}`}
                          </div>

                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                              <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: 0 }}>{bid.SUPPLIER}</h4>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                <Star size={11} color="#fbbf24" fill="#fbbf24" />
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{bid.RATING}</span>
                              </div>
                              {!withinBudget && <Badge tone="red">Bütçe Aşımı</Badge>}
                            </div>
                            <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                              {bid.CONTACT} · Teslimat: {bid.DELIVERY_DAYS} gün
                              {bid.WARRANTY && bid.WARRANTY !== '—' && ` · Garanti: ${bid.WARRANTY}`}
                            </p>
                            {bid.NOTE && <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', fontStyle: 'italic' }}>"{bid.NOTE}"</p>}
                          </div>

                          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0 }}>
                            <div style={{ textAlign: 'center' }}>
                              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700 }}>BİRİM</p>
                              <p style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>₺{bid.PRICE}</p>
                            </div>
                            <div style={{ textAlign: 'center', padding: '8px 16px', borderRadius: 10, background: withinBudget ? '#ecfdf5' : '#fef2f2' }}>
                              <p style={{ fontSize: 10, color: withinBudget ? '#059669' : '#dc2626', margin: 0, fontWeight: 700 }}>TOPLAM</p>
                              <p style={{ fontSize: 16, fontWeight: 800, color: withinBudget ? '#059669' : '#dc2626', margin: '2px 0 0' }}>{fmtMoney(bid.TOTAL)}</p>
                            </div>

                            {detailOpen.STATUS !== 'awarded' && detailOpen.STATUS !== 'closed' && (
                              <button onClick={(e) => { e.stopPropagation(); awardTender(detailOpen.ID, bid.SUPPLIER); }}
                                style={{
                                  padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                  background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff',
                                  fontSize: 11, fontWeight: 800, whiteSpace: 'nowrap',
                                  boxShadow: '0 4px 12px rgba(16,185,129,0.25)'
                                }}>
                                Seç
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Karşılaştırma Özeti */}
                {detailOpen.BIDS.length >= 2 && (
                  <div style={{
                    marginTop: 16, padding: 16, borderRadius: 12,
                    background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                    border: '1px solid #e2e8f0'
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: '0 0 10px' }}>Karşılaştırma Özeti</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                      {(() => {
                        const prices = detailOpen.BIDS.map(b => b.TOTAL);
                        const deliveries = detailOpen.BIDS.map(b => b.DELIVERY_DAYS);
                        const ratings = detailOpen.BIDS.map(b => b.RATING);
                        return [
                          { label: 'En Düşük Fiyat', value: fmtMoney(Math.min(...prices)), color: '#059669' },
                          { label: 'En Yüksek Fiyat', value: fmtMoney(Math.max(...prices)), color: '#dc2626' },
                          { label: 'En Hızlı Teslimat', value: `${Math.min(...deliveries)} gün`, color: '#3b82f6' },
                          { label: 'En Yüksek Puan', value: `${Math.max(...ratings).toFixed(1)}/5`, color: '#f59e0b' },
                        ].map((s, si) => (
                          <div key={si} style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
                            <p style={{ fontSize: 15, fontWeight: 800, color: s.color, margin: '4px 0 0' }}>{s.value}</p>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center', color: '#94a3b8' }}>
                <Scale size={36} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
                <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>Henüz teklif verilmemiş</p>
                <p style={{ fontSize: 12, margin: '4px 0 0' }}>Tedarikçiler son tarihe kadar teklif verebilir</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Yeni İhale Modal */}
      <FormModal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Yeni İhale Oluştur" subtitle="Tedarikçilerden teklif toplayın" icon={Gavel} onSubmit={createTender} submitting={saving}>
        <FormField label="İhale Başlığı" required value={form.TITLE} onChange={setField('TITLE')} span={2} />
        <FormField label="Kategori" type="select" required value={form.CATEGORY} onChange={setField('CATEGORY')}
          options={['Kumaş', 'İplik', 'Aksesuar', 'Kimyasal', 'Ambalaj', 'Makine', 'Hizmet']} />
        <FormField label="Son Teklif Tarihi" type="date" value={form.DEADLINE} onChange={setField('DEADLINE')} />
        <FormField label="Miktar" type="number" value={form.QUANTITY} onChange={setField('QUANTITY')} />
        <FormField label="Birim" type="select" value={form.UNIT} onChange={setField('UNIT')} options={['adet', 'metre', 'kg', 'litre', 'set']} />
        <FormField label="Bütçe (₺)" type="number" value={form.BUDGET} onChange={setField('BUDGET')} span={2} />
        <FormField label="Açıklama & Şartname" type="textarea" value={form.DESCRIPTION} onChange={setField('DESCRIPTION')} span={2} rows={4} />
      </FormModal>
    </DarkHero>
  );
};

export default Tenders;
