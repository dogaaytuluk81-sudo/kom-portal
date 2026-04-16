import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Plus, CheckCircle2, Clock, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, FormModal, FormField, useForm } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };
const DOC_STATUS = { approved: { label: 'Onaylı', tone: 'green' }, pending: { label: 'Beklemede', tone: 'amber' }, rejected: { label: 'Reddedildi', tone: 'red' } };

const SupplierDocuments = () => {
  const user = getUser();
  const [docs, setDocs] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({ NAME: '', TYPE: 'sertifika' });

  const load = () => api.post('/api/supplier/documents', { firm: user.firm }).then(r => setDocs(r.data.data || []));
  useEffect(() => { load(); }, []);

  const upload = async () => {
    if (!form.NAME) { toast.error('Döküman adı zorunlu'); return; }
    setSaving(true);
    try { const r = await api.post('/api/supplier/documents/upload', { ...form, FIRM: user.firm }); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); } }
    catch { toast.error('Yüklenemedi'); } finally { setSaving(false); }
  };

  return (
    <DarkHero icon={FileText} label="Dökümanlar" title="Döküman Yönetimi" subtitle={`${docs.length} döküman · Sertifika ve resmi belgeler`} accentColor="#3b82f6"
      actions={<Btn icon={Plus} onClick={() => setModalOpen(true)}>Döküman Yükle</Btn>}
      stats={[
        { label: 'Toplam', value: docs.length, color: '#3b82f6' },
        { label: 'Onaylı', value: docs.filter(d => d.STATUS === 'approved').length, color: '#10b981' },
        { label: 'Bekleyen', value: docs.filter(d => d.STATUS === 'pending').length, color: '#f59e0b' },
      ]}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {docs.map((d, i) => (
          <motion.div key={d.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
            style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: 20, display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: d.STATUS === 'approved' ? '#ecfdf5' : '#fffbeb', border: `1px solid ${d.STATUS === 'approved' ? '#a7f3d0' : '#fde68a'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {d.STATUS === 'approved' ? <CheckCircle2 size={18} color="#10b981" /> : <Clock size={18} color="#f59e0b" />}
            </div>
            <div style={{ flex: 1 }}>
              <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px' }}>{d.NAME}</h4>
              <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{d.TYPE} · {d.SIZE} · {d.DATE}</p>
            </div>
            <Badge tone={DOC_STATUS[d.STATUS]?.tone}>{DOC_STATUS[d.STATUS]?.label}</Badge>
          </motion.div>
        ))}
      </div>

      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Döküman Yükle" icon={FileText} onSubmit={upload} submitting={saving}>
        <FormField label="Döküman Adı" required value={form.NAME} onChange={setField('NAME')} span={2} />
        <FormField label="Tip" type="select" value={form.TYPE} onChange={setField('TYPE')} options={['sertifika', 'resmi', 'rapor', 'fatura', 'sözleşme']} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default SupplierDocuments;
