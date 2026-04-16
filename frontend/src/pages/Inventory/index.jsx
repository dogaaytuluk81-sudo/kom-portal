import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Boxes, Plus, AlertTriangle, Clock, ArrowDown, ArrowUp } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, FilterBar, SearchInput, PillFilter, Badge, Btn, fmtMoney, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid } from '../../components/PageShell.jsx';

const STATUS_MAP = {
  normal: { label: 'Normal', tone: 'green', color: '#10b981', bg: '#ecfdf5' },
  low: { label: 'Azalıyor', tone: 'amber', color: '#f59e0b', bg: '#fffbeb' },
  critical: { label: 'Kritik', tone: 'red', color: '#ef4444', bg: '#fef2f2' },
};

const generateHistory = (item) => [
  { date: '2026-04-09', type: 'Giriş', qty: 200, note: 'Tedarikçiden teslim', user: 'Emre Şahin' },
  { date: '2026-04-05', type: 'Çıkış', qty: -80, note: 'Üretim hattına sevk', user: 'Ayşe Kaya' },
  { date: '2026-04-02', type: 'Giriş', qty: 500, note: 'Toplu alım', user: 'Emre Şahin' },
  { date: '2026-03-28', type: 'Çıkış', qty: -150, note: 'Sipariş karşılama', user: 'Burak Kılıç' },
  { date: '2026-03-20', type: 'Sayım', qty: 0, note: 'Stok sayımı düzeltme', user: 'Hasan Özkan' },
];

const Inventory = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [criticalOpen, setCriticalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ CODE: '', NAME: '', CATEGORY: '', UNIT: 'adet', STOCK: 0, MIN_STOCK: 0, MAX_STOCK: 0, UNIT_PRICE: 0, WAREHOUSE: '' });

  const load = () => api.post('/api/inventory').then(r => setItems(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createItem = async () => {
    if (!form.CODE || !form.NAME) { toast.error('Kod ve isim zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/inventory/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const filtered = items.filter(i =>
    (filter === 'all' || i.STATUS === filter) &&
    (`${i.CODE} ${i.NAME} ${i.CATEGORY}`.toLowerCase().includes(search.toLowerCase()))
  );

  const critical = items.filter(i => i.STATUS === 'critical');
  const totalValue = items.reduce((s, i) => s + (i.STOCK * (i.UNIT_PRICE || 0)), 0);
  const maxCap = items.reduce((s, i) => s + (i.MAX_STOCK || 0), 0);
  const curCap = items.reduce((s, i) => s + (i.STOCK || 0), 0);
  const depoPct = maxCap ? Math.round((curCap / maxCap) * 100) : 0;

  return (
    <DarkHero
      icon={Boxes}
      label="Stok & Envanter"
      title="Envanter Yönetimi"
      subtitle={`${items.length} kalem · Hammadde, yarı mamul ve ürün takibi`}
      theme="production"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn variant="ghost" icon={Clock} onClick={() => setHistoryOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>Hareketler</Btn>
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Stok Girişi</Btn>
        </>
      }
      stats={[
        { label: 'Toplam Kalem', value: items.length, color: '#E81E25' },
        { label: 'Kritik Stok', value: critical.length, sub: 'Minimum altında', color: '#ef4444' },
        { label: 'Stok Değeri', value: fmtMoney(totalValue), color: '#10b981', tip: 'Tüm ürünlerin (stok × birim fiyat) toplamı' },
        { label: 'Depo Doluluğu', value: `${depoPct}%`, sub: `${curCap} / ${maxCap}`, color: '#8b5cf6', tip: 'Toplam stok / maksimum kapasite oranı' },
      ]}
    >
      {/* Kritik Uyarı */}
      {critical.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fef2f2', borderRadius: 12, padding: 14, border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, cursor: 'pointer' }}
          onClick={() => setCriticalOpen(true)}
        >
          <AlertTriangle size={16} color="#dc2626" />
          <p style={{ fontSize: 13, fontWeight: 700, color: '#991b1b', margin: 0, flex: 1 }}>{critical.length} ürün kritik stok seviyesinde — sipariş verilmezse üretim aksayabilir</p>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#dc2626' }}>Detayları Gör →</span>
        </motion.div>
      )}

      {/* Kategori Kartları + Depo Doluluğu */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
        {/* Kategoriler */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Kategori Dağılımı</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: 8 }}>
            {(() => {
              const cats = {};
              const catColors = { 'Kumaş': '#E81E25', 'İplik': '#8b5cf6', 'Aksesuar': '#06b6d4', 'Kimyasal': '#f59e0b', 'Ambalaj': '#10b981' };
              items.forEach(i => { cats[i.CATEGORY] = (cats[i.CATEGORY] || 0) + 1; });
              return Object.entries(cats).map(([cat, count]) => (
                <div key={cat} onClick={() => { setFilter('all'); setSearch(cat); }}
                  style={{
                    padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                    background: `${catColors[cat] || '#64748b'}10`,
                    border: `1px solid ${catColors[cat] || '#64748b'}25`,
                    textAlign: 'center', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <p style={{ fontSize: 18, fontWeight: 800, color: catColors[cat] || '#0f172a', margin: 0 }}>{count}</p>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#64748b', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: 0.3 }}>{cat}</p>
                </div>
              ));
            })()}
          </div>
        </motion.div>

        {/* Depo Doluluğu Görseli */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          style={{ background: '#fff', borderRadius: 16, padding: 20, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 14px' }}>Depo Durumu</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {(() => {
              const depolar = {};
              items.forEach(i => {
                const d = i.WAREHOUSE || 'Diğer';
                if (!depolar[d]) depolar[d] = { cur: 0, max: 0, critical: 0 };
                depolar[d].cur += i.STOCK;
                depolar[d].max += i.MAX_STOCK || i.STOCK;
                if (i.STATUS === 'critical') depolar[d].critical++;
              });
              return Object.entries(depolar).map(([name, d]) => {
                const pct = d.max ? Math.round((d.cur / d.max) * 100) : 0;
                const barColor = pct > 80 ? '#10b981' : pct > 50 ? '#f59e0b' : '#ef4444';
                return (
                  <div key={name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, alignItems: 'center' }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#0f172a' }}>{name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {d.critical > 0 && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: '#fef2f2', padding: '2px 6px', borderRadius: 4 }}>{d.critical} kritik</span>}
                        <span style={{ fontSize: 11, fontWeight: 800, color: barColor }}>{pct}%</span>
                      </div>
                    </div>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.1 }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`, borderRadius: 4 }} />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </motion.div>
      </div>

      {/* Filter */}
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Ürün kodu, isim veya kategori..." />
        <PillFilter value={filter} onChange={setFilter} options={[
          { id: 'all', label: 'Tümü' },
          { id: 'normal', label: 'Normal', bg: '#ecfdf5', color: '#10b981' },
          { id: 'low', label: 'Azalıyor', bg: '#fffbeb', color: '#f59e0b' },
          { id: 'critical', label: 'Kritik', bg: '#fef2f2', color: '#ef4444' },
        ]} />
      </FilterBar>

      {/* Table */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f8fafc' }}>
              {['Kod', 'Ürün', 'Kategori', 'Stok', 'Min', 'Durum', 'Birim Fiyat', 'Toplam Değer'].map(h => (
                <th key={h} style={{ padding: '14px 18px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => {
              const ratio = item.MIN_STOCK ? (item.STOCK / item.MIN_STOCK) : 1;
              const st = STATUS_MAP[item.STATUS] || STATUS_MAP.normal;
              return (
                <tr key={item.ID} onClick={() => setDetailOpen(item)}
                  style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 18px', fontSize: 11, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{item.CODE}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{item.NAME}</td>
                  <td style={{ padding: '14px 18px' }}><Badge tone="blue">{item.CATEGORY}</Badge></td>
                  <td style={{ padding: '14px 18px', minWidth: 110 }}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>{Number(item.STOCK).toLocaleString('tr-TR')} {item.UNIT}</div>
                    <div style={{ height: 4, background: '#f1f5f9', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(ratio * 50, 100)}%`, height: '100%', background: st.color, borderRadius: 2 }} />
                    </div>
                  </td>
                  <td style={{ padding: '14px 18px', fontSize: 12, color: '#64748b' }}>{item.MIN_STOCK}</td>
                  <td style={{ padding: '14px 18px' }}><Badge tone={st.tone}>{st.label}</Badge></td>
                  <td style={{ padding: '14px 18px', fontSize: 12, color: '#64748b' }}>₺{Number(item.UNIT_PRICE || 0).toLocaleString('tr-TR')}</td>
                  <td style={{ padding: '14px 18px', fontSize: 13, fontWeight: 800, color: '#E81E25' }}>₺{Number(item.STOCK * (item.UNIT_PRICE || 0)).toLocaleString('tr-TR')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Ürün Detay Modal */}
      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)} title={detailOpen.NAME} subtitle={`${detailOpen.CODE} · ${detailOpen.CATEGORY}`} icon={Boxes}>
          <DetailGrid items={[
            { label: 'Ürün Kodu', value: detailOpen.CODE },
            { label: 'Kategori', value: detailOpen.CATEGORY },
            { label: 'Mevcut Stok', value: `${Number(detailOpen.STOCK).toLocaleString('tr-TR')} ${detailOpen.UNIT}`, color: detailOpen.STATUS === 'critical' ? '#dc2626' : '#0f172a' },
            { label: 'Durum', value: (STATUS_MAP[detailOpen.STATUS] || STATUS_MAP.normal).label, color: (STATUS_MAP[detailOpen.STATUS] || STATUS_MAP.normal).color },
            { label: 'Min. Stok', value: `${detailOpen.MIN_STOCK} ${detailOpen.UNIT}`, sub: 'Bu seviyenin altına düşmemeli' },
            { label: 'Maks. Stok', value: `${detailOpen.MAX_STOCK} ${detailOpen.UNIT}`, sub: 'Depo kapasitesi' },
            { label: 'Birim Fiyat', value: `₺${Number(detailOpen.UNIT_PRICE).toLocaleString('tr-TR')}` },
            { label: 'Toplam Değer', value: fmtMoney(detailOpen.STOCK * detailOpen.UNIT_PRICE), color: '#E81E25' },
            { label: 'Depo', value: detailOpen.WAREHOUSE || '—' },
            { label: 'Son Güncelleme', value: detailOpen.LAST_UPDATE || '—' },
          ]} />
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', margin: '0 0 12px' }}>Son Stok Hareketleri</p>
            {generateHistory(detailOpen).map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f1f5f9' : 'none' }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: h.type === 'Giriş' ? '#d1fae5' : h.type === 'Çıkış' ? '#fee2e2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {h.type === 'Giriş' ? <ArrowDown size={12} color="#059669" /> : h.type === 'Çıkış' ? <ArrowUp size={12} color="#dc2626" /> : <Clock size={12} color="#64748b" />}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', margin: 0 }}>{h.note}</p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{h.date} · {h.user}</p>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800, color: h.qty > 0 ? '#059669' : h.qty < 0 ? '#dc2626' : '#64748b' }}>
                  {h.qty > 0 ? '+' : ''}{h.qty || '±0'} {detailOpen.UNIT}
                </span>
              </div>
            ))}
          </div>
        </DetailModal>
      )}

      {/* Hareket Geçmişi */}
      <DetailModal isOpen={historyOpen} onClose={() => setHistoryOpen(false)} title="Stok Hareket Geçmişi" subtitle="Tüm giriş, çıkış ve sayım hareketleri" icon={Clock}>
        {items.slice(0, 5).flatMap(item =>
          generateHistory(item).slice(0, 2).map((h, i) => (
            <div key={`${item.ID}-${i}`} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: h.type === 'Giriş' ? '#d1fae5' : h.type === 'Çıkış' ? '#fee2e2' : '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {h.type === 'Giriş' ? <ArrowDown size={12} color="#059669" /> : <ArrowUp size={12} color="#dc2626" />}
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0 }}>{item.NAME}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{h.note} · {h.date}</p>
              </div>
              <Badge tone={h.type === 'Giriş' ? 'green' : 'red'}>{h.type}</Badge>
            </div>
          ))
        )}
      </DetailModal>

      {/* Kritik Stok Detay */}
      <DetailModal isOpen={criticalOpen} onClose={() => setCriticalOpen(false)} title="Kritik Stok Detayları" subtitle={`${critical.length} ürün minimum seviyenin altında`} icon={AlertTriangle}>
        {critical.map(item => (
          <div key={item.ID} style={{ padding: 16, borderRadius: 12, background: '#fef2f2', border: '1px solid #fecaca' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div>
                <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{item.CODE}</span>
                <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{item.NAME}</h4>
              </div>
              <Badge tone="red">Kritik</Badge>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginTop: 10 }}>
              {[
                { label: 'MEVCUT', value: `${item.STOCK} ${item.UNIT}`, color: '#dc2626' },
                { label: 'MİNİMUM', value: `${item.MIN_STOCK} ${item.UNIT}` },
                { label: 'EKSİK', value: `${item.MIN_STOCK - item.STOCK} ${item.UNIT}`, color: '#dc2626' },
                { label: 'DEPO', value: item.WAREHOUSE },
              ].map((c, ci) => (
                <div key={ci}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>{c.label}</p>
                  <p style={{ fontSize: 14, fontWeight: 800, color: c.color || '#0f172a', margin: '4px 0 0' }}>{c.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </DetailModal>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Stok Kalemi" icon={Boxes} onSubmit={createItem} submitting={saving}>
        <FormField label="Ürün Kodu" required value={form.CODE} onChange={setField('CODE')} />
        <FormField label="Ürün Adı" required value={form.NAME} onChange={setField('NAME')} />
        <FormField label="Kategori" type="select" value={form.CATEGORY} onChange={setField('CATEGORY')} options={['Kumaş', 'İplik', 'Aksesuar', 'Kimyasal', 'Ambalaj']} />
        <FormField label="Birim" type="select" value={form.UNIT} onChange={setField('UNIT')} options={['adet', 'metre', 'kg', 'litre']} />
        <FormField label="Stok Adedi" type="number" value={form.STOCK} onChange={setField('STOCK')} />
        <FormField label="Birim Fiyat (₺)" type="number" value={form.UNIT_PRICE} onChange={setField('UNIT_PRICE')} />
        <FormField label="Min. Stok" type="number" value={form.MIN_STOCK} onChange={setField('MIN_STOCK')} />
        <FormField label="Maks. Stok" type="number" value={form.MAX_STOCK} onChange={setField('MAX_STOCK')} />
        <FormField label="Depo" value={form.WAREHOUSE} onChange={setField('WAREHOUSE')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default Inventory;
