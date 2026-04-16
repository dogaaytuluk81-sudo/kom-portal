import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, Clock, Plus, Flag, AlertCircle, FileText, Boxes, Users2, Factory, Wallet, ShieldCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { PageShell, Card, StatCard, Btn, Badge, FormModal, FormField, useForm } from '../../components/PageShell.jsx';

const PRIORITY = {
  high: { label: 'Yüksek', tone: 'red', color: '#ef4444' },
  medium: { label: 'Orta', tone: 'amber', color: '#f59e0b' },
  low: { label: 'Düşük', tone: 'gray', color: '#6b7280' },
};

const TYPE_ICON = {
  quote: FileText, inventory: Boxes, hr: Users2,
  quality: ShieldCheck, production: Factory, finance: Wallet,
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { form, setField, reset } = useForm({
    TITLE: '', DESCRIPTION: '', DUE_DATE: '', PRIORITY: 'medium', ASSIGNED: '', TYPE: 'quote'
  });

  const load = () => api.post('/api/tasks').then(r => setTasks(r.data.data || []));
  useEffect(() => { load(); }, []);

  const createTask = async () => {
    if (!form.TITLE) { toast.error('Başlık zorunludur'); return; }
    setSaving(true);
    try {
      const r = await api.post('/api/tasks/create', form);
      if (r.data.success) {
        toast.success(r.data.message);
        setModalOpen(false);
        reset();
        load();
      }
    } catch { toast.error('Kayıt başarısız'); }
    finally { setSaving(false); }
  };

  const filtered = tasks.filter(t =>
    filter === 'all' || t.PRIORITY === filter || t.STATUS === filter
  );

  const pending = tasks.filter(t => t.STATUS === 'pending').length;
  const inProgress = tasks.filter(t => t.STATUS === 'in_progress').length;
  const highPriority = tasks.filter(t => t.PRIORITY === 'high').length;

  return (
    <PageShell
      title="Bildirimler & Görevler"
      subtitle="Bekleyen görevler, hatırlatmalar ve ekip bildirimleri"
      icon={Bell}
      badge={`${pending} Beklemede`}
      actions={<Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Görev</Btn>}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        <StatCard icon={Bell} label="Toplam Görev" value={tasks.length} color="#E81E25" />
        <StatCard icon={Clock} label="Beklemede" value={pending} color="#f59e0b" />
        <StatCard icon={CheckCircle2} label="Devam Eden" value={inProgress} color="#3b82f6" />
        <StatCard icon={AlertCircle} label="Yüksek Öncelik" value={highPriority} color="#ef4444" />
      </div>

      <Card style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'high', label: 'Yüksek' },
            { id: 'medium', label: 'Orta' },
            { id: 'pending', label: 'Beklemede' },
            { id: 'in_progress', label: 'Devam Eden' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              style={{
                padding: '8px 14px', borderRadius: 8,
                border: '1px solid ' + (filter === f.id ? '#E81E25' : '#eef0f3'),
                background: filter === f.id ? '#fef2f2' : '#fff',
                color: filter === f.id ? '#E81E25' : '#6b7280',
                fontSize: 12, fontWeight: 700, cursor: 'pointer'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Card>

      <div style={{ display: 'grid', gap: 10 }}>
        {filtered.map(t => {
          const pri = PRIORITY[t.PRIORITY] || PRIORITY.medium;
          const TypeIcon = TYPE_ICON[t.TYPE] || Bell;
          return (
            <Card key={t.ID} style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${pri.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 18 }}>
                <input type="checkbox" style={{ width: 18, height: 18, accentColor: '#E81E25', cursor: 'pointer' }} />
                <div style={{
                  width: 42, height: 42, borderRadius: 10,
                  background: '#fef2f2',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <TypeIcon size={18} color="#E81E25" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <Badge tone={pri.tone}><Flag size={10} /> {pri.label}</Badge>
                    {t.STATUS === 'in_progress' && <Badge tone="blue">Devam Ediyor</Badge>}
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: '#111', margin: '0 0 2px' }}>{t.TITLE}</p>
                  <p style={{ fontSize: 12, color: '#6b7280', margin: 0 }}>{t.DESCRIPTION}</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Atanan</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: '#111', margin: '2px 0' }}>{t.ASSIGNED}</p>
                  <p style={{ fontSize: 11, color: pri.color, fontWeight: 600, margin: 0 }}>{t.DUE_DATE}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Yeni Görev"
        icon={Bell}
        onSubmit={createTask}
        submitting={saving}
      >
        <FormField label="Başlık" required value={form.TITLE} onChange={setField('TITLE')} span={2} />
        <FormField label="Açıklama" type="textarea" value={form.DESCRIPTION} onChange={setField('DESCRIPTION')} span={2} />
        <FormField
          label="Öncelik"
          type="select"
          value={form.PRIORITY}
          onChange={setField('PRIORITY')}
          options={[{value: 'high', label: 'Yüksek'}, {value: 'medium', label: 'Orta'}, {value: 'low', label: 'Düşük'}]}
        />
        <FormField
          label="Tip"
          type="select"
          value={form.TYPE}
          onChange={setField('TYPE')}
          options={[
            {value: 'quote', label: 'Teklif'},
            {value: 'inventory', label: 'Stok'},
            {value: 'hr', label: 'İK'},
            {value: 'quality', label: 'Kalite'},
            {value: 'production', label: 'Üretim'},
            {value: 'finance', label: 'Finans'},
          ]}
        />
        <FormField label="Atanan Kişi" value={form.ASSIGNED} onChange={setField('ASSIGNED')} />
        <FormField label="Son Tarih" type="date" value={form.DUE_DATE} onChange={setField('DUE_DATE')} />
      </FormModal>
    </PageShell>
  );
};

export default Tasks;
