import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, FilterBar, SearchInput, PillFilter, Badge, Btn, FormModal, FormField, useForm, DateFilter } from '../../components/PageShell.jsx';

const COLOR_MAP = {
  'Kırmızı': '#ef4444', 'Mavi': '#3b82f6', 'Siyah': '#111', 'Beyaz': '#e2e8f0',
  'Pembe': '#ec4899', 'Lacivert': '#1e3a8a', 'Gri': '#6b7280', 'Yeşil': '#10b981',
  'Sarı': '#fbbf24', 'Turuncu': '#f97316', 'Bej': '#e8d4b9',
};

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [dateRange, setDateRange] = useState('all');
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ CODE: '', NAME: '', CATEGORY: '', SEASON: '', PRICE: 0, STOCK: 0, COLORS: '', SIZES: '' });

  const load = () => api.post('/api/products').then(r => setProducts(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createProduct = async () => {
    if (!form.CODE || !form.NAME) { toast.error('Kod ve isim zorunludur'); return; }
    setSaving(true);
    try {
      const payload = { ...form, COLORS: form.COLORS ? form.COLORS.split(',').map(s => s.trim()).filter(Boolean) : [], SIZES: form.SIZES ? form.SIZES.split(',').map(s => s.trim()).filter(Boolean) : [] };
      const r = await api.post('/api/products/create', payload);
      if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); }
    } catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const categories = ['all', ...new Set(products.map(p => p.CATEGORY))];
  const filtered = products.filter(p =>
    (category === 'all' || p.CATEGORY === category) &&
    (`${p.CODE} ${p.NAME}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DarkHero
      icon={ShoppingBag}
      label="Ürün Kataloğu"
      title="Ürün Yönetimi"
      subtitle={`${products.length} ürün · Varyasyonlar ve sezon bilgileri`}
      theme="production"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Ürün</Btn>
        </>
      }
      stats={[
        { label: 'Aktif Ürün', value: products.length, color: '#06b6d4' },
        { label: 'Kategori', value: new Set(products.map(p => p.CATEGORY)).size, color: '#8b5cf6' },
        { label: 'Varyasyon', value: products.reduce((s, p) => s + (p.COLORS?.length || 0) * (p.SIZES?.length || 0), 0), sub: 'Renk × Beden', color: '#f59e0b' },
        { label: 'Toplam Stok', value: products.reduce((s, p) => s + (p.STOCK || 0), 0).toLocaleString('tr-TR'), color: '#10b981' },
      ]}
    >
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Ürün kodu veya adı..." />
        <PillFilter value={category} onChange={setCategory}
          options={categories.map(c => ({ id: c, label: c === 'all' ? 'Tümü' : c }))}
        />
      </FilterBar>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((p, i) => (
          <motion.div key={p.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * Math.min(i, 8) }}
            style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
          >
            <div style={{
              height: 140, background: `linear-gradient(135deg, ${COLOR_MAP[p.COLORS?.[0]] || '#06b6d4'}, #1e293b)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
            }}>
              <Package size={48} color="rgba(255,255,255,0.2)" />
              <span style={{ position: 'absolute', top: 10, left: 10 }}><Badge tone="red">{p.SEASON}</Badge></span>
              <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#fff', background: 'rgba(0,0,0,0.3)', padding: '3px 8px', borderRadius: 6, fontFamily: 'monospace' }}>{p.CODE}</span>
            </div>
            <div style={{ padding: 16 }}>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>{p.CATEGORY}</p>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '4px 0 10px' }}>{p.NAME}</h3>
              <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
                {p.COLORS?.slice(0, 5).map((col, ci) => (
                  <div key={ci} title={col} style={{ width: 16, height: 16, borderRadius: '50%', background: COLOR_MAP[col] || '#ccc', border: '2px solid #fff', boxShadow: '0 0 0 1px #e2e8f0' }} />
                ))}
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 14, flexWrap: 'wrap' }}>
                {p.SIZES?.map(s => (
                  <span key={s} style={{ fontSize: 10, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '3px 8px', borderRadius: 4 }}>{s}</span>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>STOK</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{p.STOCK}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>FİYAT</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#E81E25', margin: '4px 0 0' }}>₺{p.PRICE}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Ürün" icon={ShoppingBag} onSubmit={createProduct} submitting={saving}>
        <FormField label="Ürün Kodu" required value={form.CODE} onChange={setField('CODE')} />
        <FormField label="Ürün Adı" required value={form.NAME} onChange={setField('NAME')} />
        <FormField label="Kategori" type="select" value={form.CATEGORY} onChange={setField('CATEGORY')} options={['Bayan Mayo', 'Bikini', 'Erkek Mayo', 'Çocuk Mayo', 'İç Giyim', 'Ev Tekstili', 'Aksesuar']} />
        <FormField label="Sezon" type="select" value={form.SEASON} onChange={setField('SEASON')} options={['Yaz 2026', 'Kış 2026', 'Güz 2026', 'Tüm Sezon']} />
        <FormField label="Fiyat (₺)" type="number" value={form.PRICE} onChange={setField('PRICE')} />
        <FormField label="Stok" type="number" value={form.STOCK} onChange={setField('STOCK')} />
        <FormField label="Renkler (virgülle)" placeholder="Kırmızı, Mavi, Siyah" value={form.COLORS} onChange={setField('COLORS')} span={2} />
        <FormField label="Bedenler (virgülle)" placeholder="S, M, L, XL" value={form.SIZES} onChange={setField('SIZES')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default Products;
