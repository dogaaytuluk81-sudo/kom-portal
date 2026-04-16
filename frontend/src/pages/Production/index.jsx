import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Factory, Plus, Scissors, Shirt, ShieldCheck, Package, Truck, PenTool } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid } from '../../components/PageShell.jsx';

const COLUMNS = [
  { id: 'design', label: 'Tasarım', icon: PenTool, color: '#8b5cf6' },
  { id: 'cutting', label: 'Kesim', icon: Scissors, color: '#06b6d4' },
  { id: 'sewing', label: 'Dikim', icon: Shirt, color: '#f59e0b' },
  { id: 'quality', label: 'Kalite', icon: ShieldCheck, color: '#10b981' },
  { id: 'packaging', label: 'Paket', icon: Package, color: '#E81E25' },
  { id: 'shipping', label: 'Sevk', icon: Truck, color: '#3b82f6' },
];

const PRIORITY = {
  high: { label: 'Yüksek', tone: 'red', color: '#ef4444' },
  medium: { label: 'Orta', tone: 'amber', color: '#f59e0b' },
  low: { label: 'Düşük', tone: 'gray', color: '#94a3b8' },
};

const Production = () => {
  const [items, setItems] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [dateRange, setDateRange] = useState('all');
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ TITLE: '', PRIORITY: 'medium', DEADLINE: '', ASSIGNED: '', MACHINE: '', QUANTITY: 100 });

  const load = () => api.post('/api/production').then(r => setItems(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createItem = async () => {
    if (!form.TITLE) { toast.error('Başlık zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/production/create', form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const byColumn = (id) => items.filter(i => i.STATUS === id);

  return (
    <DarkHero
      icon={Factory}
      label="Üretim Takibi"
      title="Üretim Akışı"
      subtitle={`${items.length} aktif iş · Tasarımdan sevkiyata kadar`}
      theme="production"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Üretim</Btn>
        </>
      }
      stats={[
        { label: 'Aktif Üretim', value: items.length, sub: `${items.filter(i => i.PRIORITY === 'high').length} yüksek öncelik`, color: '#E81E25' },
        { label: 'Yüksek Öncelik', value: items.filter(i => i.PRIORITY === 'high').length, sub: 'Acil işler', color: '#ef4444' },
        { label: 'Ort. Süre', value: '6.2 gün', sub: 'Tasarım → Sevk', color: '#f59e0b', tip: 'Bir üretim işinin tasarımdan sevkiyata kadar geçen ortalama süresi' },
        { label: 'Kalite Oranı', value: '98.4%', sub: 'Son 30 gün', color: '#10b981', tip: 'Kalite kontrolden geçen ürünlerin toplam üretime oranı' },
      ]}
    >
      {/* Kanban Board */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${COLUMNS.length}, minmax(210px, 1fr))`,
        gap: 12, overflowX: 'auto', paddingBottom: 20
      }}>
        {COLUMNS.map(col => {
          const colItems = byColumn(col.id);
          const ColIcon = col.icon;
          return (
            <motion.div key={col.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                background: '#fff', borderRadius: 14,
                border: '1px solid #e2e8f0',
                display: 'flex', flexDirection: 'column', minHeight: 380,
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
            >
              <div style={{
                padding: '14px 14px 12px', borderBottom: '1px solid #f1f5f9',
                display: 'flex', alignItems: 'center', gap: 10
              }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `${col.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ColIcon size={14} color={col.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: '#0f172a', margin: 0 }}>{col.label}</p>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 800, color: col.color,
                  background: `${col.color}15`, padding: '3px 8px', borderRadius: 100
                }}>{colItems.length}</span>
              </div>

              <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
                {colItems.map(item => {
                  const pri = PRIORITY[item.PRIORITY] || PRIORITY.medium;
                  return (
                    <div key={item.ID} onClick={() => setDetailOpen(item)}
                      style={{
                        background: '#fafbfc', border: '1px solid #f1f5f9',
                        borderRadius: 10, padding: 12, cursor: 'pointer',
                        transition: 'all 0.2s', borderLeft: `3px solid ${pri.color}`
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.06)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{item.ORDER_NO}</span>
                        <Badge tone={pri.tone}>{pri.label}</Badge>
                      </div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>{item.TITLE}</p>
                      <p style={{ fontSize: 10, color: '#64748b', margin: '0 0 10px' }}>{item.ASSIGNED} · {item.QUANTITY} {item.UNIT}</p>
                      <div style={{ height: 5, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ width: `${item.PROGRESS}%`, height: '100%', background: col.color, borderRadius: 3 }} />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>
                        <span>{item.PROGRESS}%</span>
                        <span>{item.DEADLINE}</span>
                      </div>
                    </div>
                  );
                })}
                {colItems.length === 0 && (
                  <div style={{ padding: 20, textAlign: 'center', fontSize: 11, color: '#cbd5e1' }}>Boş</div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={detailOpen.TITLE} subtitle={`${detailOpen.ORDER_NO} · ${COLUMNS.find(c => c.id === detailOpen.STATUS)?.label || detailOpen.STATUS}`} icon={Factory}>
          <DetailGrid items={[
            { label: 'İş No', value: detailOpen.ORDER_NO },
            { label: 'Aşama', value: COLUMNS.find(c => c.id === detailOpen.STATUS)?.label },
            { label: 'Öncelik', value: PRIORITY[detailOpen.PRIORITY]?.label, color: PRIORITY[detailOpen.PRIORITY]?.color },
            { label: 'İlerleme', value: `${detailOpen.PROGRESS}%`, color: detailOpen.PROGRESS === 100 ? '#059669' : '#E81E25' },
            { label: 'Sorumlu', value: detailOpen.ASSIGNED },
            { label: 'Makine / Hat', value: detailOpen.MACHINE || '—' },
            { label: 'Adet', value: `${detailOpen.QUANTITY} ${detailOpen.UNIT}` },
            { label: 'Son Tarih', value: detailOpen.DEADLINE },
          ]} />
        </DetailModal>
      )}

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Üretim İşi" icon={Factory} onSubmit={createItem} submitting={saving}>
        <FormField label="İş Başlığı" required value={form.TITLE} onChange={setField('TITLE')} span={2} />
        <FormField label="Öncelik" type="select" value={form.PRIORITY} onChange={setField('PRIORITY')} options={[{value:'high',label:'Yüksek'},{value:'medium',label:'Orta'},{value:'low',label:'Düşük'}]} />
        <FormField label="Bitiş Tarihi" type="date" value={form.DEADLINE} onChange={setField('DEADLINE')} />
        <FormField label="Sorumlu Kişi" value={form.ASSIGNED} onChange={setField('ASSIGNED')} />
        <FormField label="Makine / Hat" value={form.MACHINE} onChange={setField('MACHINE')} />
        <FormField label="Adet" type="number" value={form.QUANTITY} onChange={setField('QUANTITY')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default Production;
