import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users2, Mail, Phone, Calendar, UserPlus } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, FilterBar, SearchInput, PillFilter, Badge, Btn, fmtMoney, FormModal, FormField, useForm, DateFilter, DetailModal, DetailGrid } from '../../components/PageShell.jsx';

const HR = () => {
  const [employees, setEmployees] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState({});
  const [tab, setTab] = useState('employees');
  const [search, setSearch] = useState('');
  const [dept, setDept] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(null);
  const [leaveDetailOpen, setLeaveDetailOpen] = useState(null);
  const [saving, setSaving] = useState(false);

  const empForm = useForm({ NAME: '', SURNAME: '', POSITION: '', DEPARTMENT: '', EMAIL: '', PHONE: '', SALARY: 0 });
  const leaveForm = useForm({ EMPLOYEE_NAME: '', TYPE: 'Yıllık İzin', START_DATE: '', END_DATE: '', DAYS: 1 });

  const loadAll = () => {
    api.post('/api/hr/employees').then(r => setEmployees(r.data.data || []));
    api.post('/api/hr/leaves').then(r => setLeaves(r.data.data || []));
    api.post('/api/hr/stats').then(r => setStats(r.data.data || {}));
  };
  useEffect(() => { loadAll(); }, []);

  const createEmployee = async () => {
    if (!empForm.form.NAME || !empForm.form.SURNAME) { toast.error('İsim ve soyisim zorunludur'); return; }
    setSaving(true);
    try { const r = await api.post('/api/hr/employees/create', empForm.form); if (r.data.success) { toast.success(r.data.message); setModalOpen(false); empForm.reset(); loadAll(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const createLeave = async () => {
    if (!leaveForm.form.EMPLOYEE_NAME || !leaveForm.form.START_DATE) { toast.error('Personel ve başlangıç zorunlu'); return; }
    setSaving(true);
    try { const r = await api.post('/api/hr/leaves/create', leaveForm.form); if (r.data.success) { toast.success(r.data.message); setLeaveModalOpen(false); leaveForm.reset(); loadAll(); } }
    catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const departments = ['all', ...new Set(employees.map(e => e.DEPARTMENT))];
  const filtered = employees.filter(e =>
    (dept === 'all' || e.DEPARTMENT === dept) &&
    (`${e.NAME} ${e.SURNAME} ${e.POSITION}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DarkHero
      icon={Users2}
      label="İnsan Kaynakları"
      title="Personel Yönetimi"
      subtitle={`${employees.length} personel · Performans ve izin takibi`}
      theme="management"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn variant="ghost" icon={Calendar} onClick={() => setLeaveModalOpen(true)} style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)' }}>Yeni İzin</Btn>
          <Btn icon={UserPlus} onClick={() => setModalOpen(true)}>Yeni Personel</Btn>
        </>
      }
      stats={[
        { label: 'Toplam Personel', value: stats.totalEmployees || employees.length, sub: `${stats.activeEmployees || employees.length} aktif`, color: '#8b5cf6' },
        { label: 'Ort. Performans', value: `${stats.avgPerformance || 88}%`, sub: 'Yıllık değerlendirme', color: '#10b981', tip: 'Tüm personelin yıllık performans değerlendirme ortalaması. Kriterler: İş kalitesi %30, Verimlilik %25, Takım çalışması %20, İnisiyatif %15, Devam %10' },
        { label: 'Aktif İzinler', value: leaves.filter(l => l.STATUS === 'approved').length, sub: `${leaves.filter(l => l.STATUS === 'pending').length} beklemede`, color: '#06b6d4' },
        { label: 'Bu Ay Maaş', value: `₺${((stats.totalSalary || 0) / 1000).toFixed(0)}K`, sub: 'Brüt maaş toplamı', color: '#E81E25', tip: 'Bu ayki brüt maaş toplam gideri' },
      ]}
    >
      {/* Tabs */}
      <FilterBar>
        <PillFilter value={tab} onChange={setTab} options={[
          { id: 'employees', label: 'Personel Listesi' },
          { id: 'leaves', label: 'İzin Talepleri' },
          { id: 'performance', label: 'Performans' },
        ]} />
        {tab === 'employees' && <SearchInput value={search} onChange={setSearch} placeholder="Personel ara..." />}
      </FilterBar>

      {tab === 'employees' && (
        <>
          {departments.length > 2 && (
            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {departments.map(d => (
                <button key={d} onClick={() => setDept(d)} style={{
                  padding: '7px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700,
                  background: dept === d ? '#0f172a' : '#fff', color: dept === d ? '#fff' : '#64748b',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)', transition: 'all 0.2s'
                }}>{d === 'all' ? 'Tümü' : d}</button>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {filtered.map((emp, i) => (
              <motion.div key={emp.ID} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * Math.min(i, 8) }}
                onClick={() => setDetailOpen(emp)}
                style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ height: 4, background: `linear-gradient(90deg, #8b5cf6, #06b6d4)` }} />
                <div style={{ padding: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 14,
                      background: 'linear-gradient(135deg, #8b5cf620, #06b6d410)',
                      border: '1px solid #8b5cf625',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 18, fontWeight: 800, color: '#8b5cf6'
                    }}>{emp.NAME[0]}{emp.SURNAME[0]}</div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 2px' }}>{emp.NAME} {emp.SURNAME}</h3>
                      <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{emp.POSITION}</p>
                    </div>
                    <Badge tone="purple">{emp.DEPARTMENT}</Badge>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: 12, background: '#f8fafc', borderRadius: 10, marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}><Mail size={11} /> {emp.EMAIL || '—'}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: '#64748b' }}><Phone size={11} /> {emp.PHONE || '—'}</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                    <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>MAAŞ</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#0f172a', margin: '4px 0 0' }}>₺{(emp.SALARY / 1000).toFixed(0)}K</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>PERF.</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: emp.PERFORMANCE >= 90 ? '#10b981' : '#8b5cf6', margin: '4px 0 0' }}>{emp.PERFORMANCE}%</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '8px 0', borderRadius: 8, background: '#fafafa' }}>
                      <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600 }}>İZİN</p>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#E81E25', margin: '4px 0 0' }}>{emp.LEAVE_BALANCE}g</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {tab === 'leaves' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Personel', 'Tip', 'Başlangıç', 'Bitiş', 'Gün', 'Durum'].map(h => (
                  <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map(l => (
                <tr key={l.ID} onClick={() => setLeaveDetailOpen(l)}
                  style={{ borderTop: '1px solid #f1f5f9', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{l.EMPLOYEE_NAME}</td>
                  <td style={{ padding: '14px 20px' }}><Badge tone="blue">{l.TYPE}</Badge></td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>{l.START_DATE}</td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>{l.END_DATE}</td>
                  <td style={{ padding: '14px 20px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{l.DAYS}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <Badge tone={l.STATUS === 'approved' ? 'green' : l.STATUS === 'pending' ? 'amber' : 'red'}>
                      {l.STATUS === 'approved' ? 'Onaylandı' : l.STATUS === 'pending' ? 'Beklemede' : 'Reddedildi'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {tab === 'performance' && (
        <>
          <div style={{ background: '#eff6ff', borderRadius: 12, padding: 16, border: '1px solid #bfdbfe', marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: '#1e40af', margin: 0, lineHeight: 1.6 }}>
              <strong>Performans puanı nasıl hesaplanır?</strong> Yönetici değerlendirmesi:
              <strong> İş kalitesi</strong> %30 · <strong>Verimlilik</strong> %25 ·
              <strong> Takım çalışması</strong> %20 · <strong>İnisiyatif</strong> %15 · <strong>Devam</strong> %10.
              <span style={{ color: '#64748b' }}> — 90+ Mükemmel, 80-89 İyi, 70-79 Gelişmeli, 70 altı Yetersiz.</span>
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
            {[...employees].sort((a, b) => b.PERFORMANCE - a.PERFORMANCE).slice(0, 8).map((emp, i) => (
              <motion.div key={emp.ID} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * i }}
                onClick={() => setDetailOpen(emp)}
                style={{
                  background: '#fff', borderRadius: 14, padding: 18,
                  border: '1px solid #e2e8f0', cursor: 'pointer',
                  transition: 'all 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: i < 3 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : '#f8fafc',
                    color: i < 3 ? '#fff' : '#8b5cf6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 800, border: i < 3 ? 'none' : '1px solid #e2e8f0'
                  }}>#{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: 0 }}>{emp.NAME} {emp.SURNAME}</p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '2px 0 8px' }}>{emp.POSITION} · {emp.DEPARTMENT}</p>
                    <div style={{ height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{
                        width: `${emp.PERFORMANCE}%`, height: '100%',
                        background: emp.PERFORMANCE >= 90 ? '#10b981' : emp.PERFORMANCE >= 80 ? '#8b5cf6' : '#f59e0b',
                        borderRadius: 3
                      }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 20, fontWeight: 800, color: emp.PERFORMANCE >= 90 ? '#10b981' : '#8b5cf6' }}>{emp.PERFORMANCE}%</div>
                    <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600, marginTop: 2 }}>
                      {emp.PERFORMANCE >= 90 ? 'Mükemmel' : emp.PERFORMANCE >= 80 ? 'İyi' : 'Gelişmeli'}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Personel Detay */}
      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={`${detailOpen.NAME} ${detailOpen.SURNAME}`} subtitle={`${detailOpen.POSITION} · ${detailOpen.DEPARTMENT}`} icon={Users2}>
          <DetailGrid items={[
            { label: 'İsim', value: `${detailOpen.NAME} ${detailOpen.SURNAME}` },
            { label: 'Pozisyon', value: detailOpen.POSITION },
            { label: 'Departman', value: detailOpen.DEPARTMENT },
            { label: 'E-posta', value: detailOpen.EMAIL || '—' },
            { label: 'Telefon', value: detailOpen.PHONE || '—' },
            { label: 'İşe Giriş', value: detailOpen.START_DATE || '—' },
            { label: 'Maaş (Brüt)', value: fmtMoney(detailOpen.SALARY), color: '#E81E25' },
            { label: 'Kalan İzin', value: `${detailOpen.LEAVE_BALANCE} gün`, sub: 'Yıllık izin hakkı' },
            { label: 'Performans', value: `${detailOpen.PERFORMANCE}%`, color: detailOpen.PERFORMANCE >= 90 ? '#059669' : '#8b5cf6', sub: detailOpen.PERFORMANCE >= 90 ? 'Mükemmel (90+)' : detailOpen.PERFORMANCE >= 80 ? 'İyi (80-89)' : 'Gelişmeli' },
            { label: 'Durum', value: 'Aktif', color: '#059669' },
          ]} />
        </DetailModal>
      )}

      {/* İzin Detay */}
      {leaveDetailOpen && (
        <DetailModal isOpen={!!leaveDetailOpen} onClose={() => setLeaveDetailOpen(null)}
          title={`İzin — ${leaveDetailOpen.EMPLOYEE_NAME}`} subtitle={leaveDetailOpen.TYPE} icon={Calendar} wide={false}>
          <DetailGrid items={[
            { label: 'Personel', value: leaveDetailOpen.EMPLOYEE_NAME },
            { label: 'İzin Tipi', value: leaveDetailOpen.TYPE },
            { label: 'Başlangıç', value: leaveDetailOpen.START_DATE },
            { label: 'Bitiş', value: leaveDetailOpen.END_DATE },
            { label: 'Gün', value: `${leaveDetailOpen.DAYS} gün` },
            { label: 'Durum', value: leaveDetailOpen.STATUS === 'approved' ? 'Onaylandı' : leaveDetailOpen.STATUS === 'pending' ? 'Beklemede' : 'Reddedildi', color: leaveDetailOpen.STATUS === 'approved' ? '#059669' : '#d97706' },
          ]} />
        </DetailModal>
      )}

      {/* Modaller */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Personel" icon={UserPlus} onSubmit={createEmployee} submitting={saving}>
        <FormField label="İsim" required value={empForm.form.NAME} onChange={empForm.setField('NAME')} />
        <FormField label="Soyisim" required value={empForm.form.SURNAME} onChange={empForm.setField('SURNAME')} />
        <FormField label="Pozisyon" value={empForm.form.POSITION} onChange={empForm.setField('POSITION')} span={2} />
        <FormField label="Departman" type="select" value={empForm.form.DEPARTMENT} onChange={empForm.setField('DEPARTMENT')} options={['Yönetim', 'Üretim', 'Satış', 'Finans', 'İK', 'Tasarım', 'Lojistik', 'Kalite']} />
        <FormField label="Maaş (₺)" type="number" value={empForm.form.SALARY} onChange={empForm.setField('SALARY')} />
        <FormField label="E-posta" type="email" value={empForm.form.EMAIL} onChange={empForm.setField('EMAIL')} />
        <FormField label="Telefon" value={empForm.form.PHONE} onChange={empForm.setField('PHONE')} />
      </FormModal>

      <FormModal isOpen={leaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Yeni İzin Talebi" icon={Calendar} onSubmit={createLeave} submitting={saving}>
        <FormField label="Personel" type="select" required value={leaveForm.form.EMPLOYEE_NAME} onChange={leaveForm.setField('EMPLOYEE_NAME')} options={employees.map(e => `${e.NAME} ${e.SURNAME}`)} span={2} />
        <FormField label="İzin Türü" type="select" value={leaveForm.form.TYPE} onChange={leaveForm.setField('TYPE')} options={['Yıllık İzin', 'Mazeret İzni', 'Hastalık İzni', 'Ücretsiz İzin', 'Doğum İzni']} span={2} />
        <FormField label="Başlangıç" type="date" required value={leaveForm.form.START_DATE} onChange={leaveForm.setField('START_DATE')} />
        <FormField label="Bitiş" type="date" value={leaveForm.form.END_DATE} onChange={leaveForm.setField('END_DATE')} />
        <FormField label="Gün Sayısı" type="number" value={leaveForm.form.DAYS} onChange={leaveForm.setField('DAYS')} span={2} />
      </FormModal>
    </DarkHero>
  );
};

export default HR;
