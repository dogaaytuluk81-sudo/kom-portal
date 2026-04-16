import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Plus, Package, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, fmtMoney, FormModal, FormField, useForm } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };

const SupplierCatalog = () => {
  const user = getUser();
  const [products, setProducts] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ NAME: '', CATEGORY: '', UNIT_PRICE: 0, UNIT: 'adet', MIN_ORDER: 100, LEAD_TIME: 7, DESCRIPTION: '' });

  const load = () => api.post('/api/supplier/products', { firm: user.firm }).then(r => setProducts(r.data.data || []));
  useEffect(() => { load(); }, []);

  const addProduct = async () => {
    if (!form.NAME) { toast.error('Ürün adı zorunlu'); return; }
    setSaving(true);
    try { const r = await api.post('/api/supplier/products/create', { ...form, FIRM: user.firm }); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Eklenemedi'); } finally { setSaving(false); }
  };

  return (
    <DarkHero icon={ShoppingBag} label="Ürün Kataloğu" title="Ürünlerim & Hizmetlerim" subtitle={`${products.length} ürün · ${user.firm}`} accentColor="#06b6d4"
      actions={<Btn icon={Plus} onClick={() => setModalOpen(true)}>Ürün Ekle</Btn>}
      stats={[
        { label: 'Toplam Ürün', value: products.length, color: '#06b6d4' },
        { label: 'Stokta', value: products.filter(p => p.IN_STOCK).length, color: '#10b981' },
        { label: 'Stok Dışı', value: products.filter(p => !p.IN_STOCK).length, color: '#ef4444' },
      ]}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {products.map((p, i) => (
          <motion.div key={p.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            style={{
              background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
              overflow: 'hidden', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
          >
            <div style={{ height: 4, background: p.IN_STOCK ? 'linear-gradient(90deg, #06b6d4, #10b981)' : 'linear-gradient(90deg, #ef4444, #f59e0b)' }} />
            <div style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: '#f0f9ff', border: '1px solid #bae6fd', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Package size={18} color="#06b6d4" />
                </div>
                {p.IN_STOCK ? <Badge tone="green"><CheckCircle2 size={9} /> Stokta</Badge> : <Badge tone="red"><XCircle size={9} /> Stok Dışı</Badge>}
              </div>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>{p.CATEGORY}</p>
              <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '4px 0 8px' }}>{p.NAME}</h3>
              <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 14px', lineHeight: 1.5 }}>{p.DESCRIPTION}</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>FİYAT</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#E81E25', margin: '4px 0 0' }}>₺{p.UNIT_PRICE}/{p.UNIT}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>MİN. SİPARİŞ</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>{p.MIN_ORDER}</p>
                </div>
                <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#f8fafc' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>TESLİMAT</p>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#3b82f6', margin: '4px 0 0' }}>{p.LEAD_TIME} gün</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Ürün Ekle" icon={ShoppingBag} onSubmit={addProduct} submitting={saving}>
        <FormField label="Ürün Adı" required value={form.NAME} onChange={setField('NAME')} span={2} />
        <FormField label="Kategori" type="select" value={form.CATEGORY} onChange={setField('CATEGORY')} options={['Kumaş', 'İplik', 'Aksesuar', 'Kimyasal', 'Ambalaj', 'Hizmet']} />
        <FormField label="Birim" type="select" value={form.UNIT} onChange={setField('UNIT')} options={['adet', 'metre', 'kg', 'litre', 'set']} />
        <FormField label="Birim Fiyat (₺)" type="number" value={form.UNIT_PRICE} onChange={setField('UNIT_PRICE')} />
        <FormField label="Min. Sipariş" type="number" value={form.MIN_ORDER} onChange={setField('MIN_ORDER')} />
        <FormField label="Teslimat Süresi (gün)" type="number" value={form.LEAD_TIME} onChange={setField('LEAD_TIME')} span={2} />
        <FormField label="Açıklama" type="textarea" value={form.DESCRIPTION} onChange={setField('DESCRIPTION')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default SupplierCatalog;
