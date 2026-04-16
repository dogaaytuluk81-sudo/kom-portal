import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Search, Clock, AlertCircle, CheckCircle2, ArrowRight, Flame } from 'lucide-react';
import api from '../../api.js';
import { DarkHero, FilterBar, SearchInput, PillFilter, Badge, Btn, DateFilter, DetailModal, DetailGrid } from '../../components/PageShell.jsx';

const STATUS_MAP = {
  open: { label: 'Açık', tone: 'amber', color: '#f59e0b', icon: Clock },
  in_progress: { label: 'İşlemde', tone: 'blue', color: '#3b82f6', icon: ArrowRight },
  completed: { label: 'Tamamlandı', tone: 'green', color: '#10b981', icon: CheckCircle2 },
  cancelled: { label: 'İptal', tone: 'red', color: '#ef4444', icon: AlertCircle },
};

const PRIORITY_MAP = {
  critical: { label: 'Kritik', tone: 'red', color: '#dc2626' },
  high: { label: 'Yüksek', tone: 'red', color: '#ef4444' },
  medium: { label: 'Normal', tone: 'amber', color: '#f59e0b' },
  low: { label: 'Düşük', tone: 'gray', color: '#94a3b8' },
};

const Requests = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({});
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [detailOpen, setDetailOpen] = useState(null);

  useEffect(() => {
    api.post('/api/requests').then(r => setRequests(r.data.data || []));
    api.post('/api/requests/stats').then(r => setStats(r.data.data || {}));
  }, []);

  const dateFiltered = requests.filter(r => {
    if (dateRange === 'all') return true;
    const days = { '7d': 7, '30d': 30, '3m': 90, '6m': 180 }[dateRange] || 99999;
    return new Date(r.CREATED_DATE) >= new Date(Date.now() - days * 86400000);
  });

  const filtered = dateFiltered.filter(r =>
    (filter === 'all' || r.STATUS === filter || r.PRIORITY === filter) &&
    (`${r.REQUEST_NO} ${r.SUBJECT} ${r.FIRM} ${r.SERVICE}`.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DarkHero
      icon={ClipboardList}
      label="Talep Yönetimi"
      title="Talepler"
      subtitle={`${dateFiltered.length} talep · Takip ve çözüm süreçleri`}
      theme="operations"
      actions={
        <>
          <DateFilter value={dateRange} onChange={setDateRange} />
          <Btn icon={Plus} onClick={() => navigate('/app/talep-ac')}>Talep Aç</Btn>
        </>
      }
      stats={[
        { label: 'Toplam Talep', value: stats.total || dateFiltered.length, color: '#f59e0b' },
        { label: 'Açık', value: stats.open || 0, sub: 'Çözüm bekliyor', color: '#f59e0b' },
        { label: 'İşlemde', value: stats.inProgress || 0, sub: 'Üzerinde çalışılıyor', color: '#3b82f6' },
        { label: 'Kritik', value: (stats.critical || 0) + (stats.high || 0), sub: 'Acil müdahale', color: '#ef4444' },
      ]}
    >
      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Talep no, konu, firma veya hizmet ara..." />
        <PillFilter value={filter} onChange={setFilter} options={[
          { id: 'all', label: 'Tümü' },
          { id: 'open', label: 'Açık', bg: '#fffbeb', color: '#f59e0b' },
          { id: 'in_progress', label: 'İşlemde', bg: '#eff6ff', color: '#3b82f6' },
          { id: 'completed', label: 'Tamamlandı', bg: '#ecfdf5', color: '#10b981' },
          { id: 'critical', label: 'Kritik', bg: '#fef2f2', color: '#ef4444' },
        ]} />
      </FilterBar>

      <div style={{ display: 'grid', gap: 12 }}>
        {filtered.map((r, i) => {
          const st = STATUS_MAP[r.STATUS] || STATUS_MAP.open;
          const pri = PRIORITY_MAP[r.PRIORITY] || PRIORITY_MAP.medium;
          const StIcon = st.icon;
          return (
            <motion.div key={r.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.04 * Math.min(i, 8) }}
              onClick={() => setDetailOpen(r)}
              style={{
                background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ width: 5, alignSelf: 'stretch', background: pri.color, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 18, padding: '18px 22px' }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${st.color}12`, border: `1px solid ${st.color}25`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <StIcon size={20} color={st.color} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace', letterSpacing: 0.5 }}>{r.REQUEST_NO}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                      <Badge tone={pri.tone}>{pri.label}</Badge>
                      {r.PRIORITY === 'critical' && <Flame size={12} color="#dc2626" />}
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 4px', lineHeight: 1.3 }}>{r.SUBJECT}</h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      {r.SERVICE} · {r.FIRM} · {r.LOCATION}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 600 }}>{r.CREATED_DATE}</p>
                    <p style={{ fontSize: 11, color: '#64748b', margin: '4px 0 0', fontWeight: 600 }}>
                      {r.ASSIGNED_TO || 'Atanmamış'}
                    </p>
                    {r.FILES > 0 && <p style={{ fontSize: 10, color: '#94a3b8', margin: '4px 0 0' }}>{r.FILES} dosya</p>}
                  </div>
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
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>Talep bulunamadı</div>
        )}
      </div>

      {detailOpen && (
        <DetailModal isOpen={!!detailOpen} onClose={() => setDetailOpen(null)}
          title={detailOpen.SUBJECT}
          subtitle={`${detailOpen.REQUEST_NO} · ${(STATUS_MAP[detailOpen.STATUS] || STATUS_MAP.open).label}`}
          icon={ClipboardList}
        >
          <DetailGrid items={[
            { label: 'Talep No', value: detailOpen.REQUEST_NO },
            { label: 'Durum', value: (STATUS_MAP[detailOpen.STATUS] || STATUS_MAP.open).label, color: (STATUS_MAP[detailOpen.STATUS] || STATUS_MAP.open).color },
            { label: 'Öncelik', value: (PRIORITY_MAP[detailOpen.PRIORITY] || PRIORITY_MAP.medium).label, color: (PRIORITY_MAP[detailOpen.PRIORITY] || PRIORITY_MAP.medium).color },
            { label: 'Hizmet', value: detailOpen.SERVICE },
            { label: 'Firma', value: detailOpen.FIRM },
            { label: 'Lokasyon', value: detailOpen.LOCATION },
            { label: 'Oluşturan', value: detailOpen.CREATED_BY },
            { label: 'Tarih', value: detailOpen.CREATED_DATE },
            { label: 'Atanan', value: detailOpen.ASSIGNED_TO || 'Henüz atanmamış', sub: detailOpen.ASSIGNED_TO ? '' : 'Talep bir personele atanacak' },
            { label: 'Dosya', value: `${detailOpen.FILES} dosya` },
          ]} />
          <div style={{ padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: '0 0 6px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Açıklama</p>
            <p style={{ fontSize: 13, color: '#0f172a', margin: 0, lineHeight: 1.7 }}>{detailOpen.EXPLANATION}</p>
          </div>
        </DetailModal>
      )}
    </DarkHero>
  );
};

export default Requests;
