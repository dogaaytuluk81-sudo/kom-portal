import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, Store, Package, AlertTriangle, Factory, ShoppingCart, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { DarkHero, Badge, Btn, fmtMoney, FormModal, FormField, useForm } from '../../components/PageShell.jsx';

const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

const Targets = () => {
  const [targets, setTargets] = useState([]);
  const [production, setProduction] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('targets');
  const { form, setField, reset } = useForm({
    STORE: '', PRODUCT: '', TARGET_QTY: 1000, TARGET_REVENUE: 0
  });

  const load = () => {
    api.post('/api/targets').then(r => setTargets(r.data.data || []));
    api.post('/api/targets/production-plan').then(r => setProduction(r.data.data || []));
    api.post('/api/targets/purchase-suggestions').then(r => setPurchases(r.data.data || []));
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!form.STORE || !form.PRODUCT) { toast.error('Mağaza ve ürün zorunlu'); return; }
    setSaving(true);
    try {
      const r = await api.post('/api/targets/create', form);
      if (r.data.success) { toast.success(r.data.message); setModalOpen(false); reset(); load(); }
    } catch { toast.error('Kayıt başarısız'); } finally { setSaving(false); }
  };

  const totalTarget = targets.reduce((s, t) => s + t.TARGET_REVENUE, 0);
  const totalAchieved = targets.reduce((s, t) => s + t.ACHIEVED_REVENUE, 0);
  const overallCompletion = totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0;
  const onTrack = targets.filter(t => (t.ACHIEVED_QTY / t.TARGET_QTY) >= (new Date().getMonth() / 12) * 0.9).length;
  const offTrack = targets.length - onTrack;

  return (
    <DarkHero
      icon={Target}
      label="Hedef & Planlama"
      title="Yıllık Hedefler & Üretim Planı"
      subtitle={`${targets.length} hedef · 2026 · Mağaza × Ürün bazında takip`}
      theme="trade"
      actions={<Btn icon={Plus} onClick={() => setModalOpen(true)}>Yeni Hedef</Btn>}
      stats={[
        { label: 'Toplam Hedef', value: fmtMoney(totalTarget), sub: `${targets.length} hedef`, color: '#8b5cf6' },
        { label: 'Gerçekleşen', value: fmtMoney(totalAchieved), sub: `%${overallCompletion} tamamlandı`, color: '#10b981', tip: 'Yıl başından bu yana elde edilen ciro' },
        { label: 'Hedefte', value: onTrack, sub: 'Plana göre iyi gidiyor', color: '#10b981' },
        { label: 'Risk Altında', value: offTrack, sub: 'Gerçekleşme düşük', color: '#ef4444' },
      ]}
    >
      {/* Tab bar */}
      <div style={{
        display: 'flex', background: '#fff', borderRadius: 12, padding: 4,
        marginBottom: 20, border: '1px solid #e2e8f0', width: 'fit-content'
      }}>
        {[
          { id: 'targets', label: 'Hedefler', icon: Target },
          { id: 'production', label: 'Üretim Planı', icon: Factory },
          { id: 'purchase', label: 'Satın Alma İhtiyacı', icon: ShoppingCart },
        ].map(t => {
          const TIcon = t.icon;
          const active = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: active ? '#0f172a' : 'transparent',
                color: active ? '#fff' : '#64748b',
                transition: 'all 0.2s'
              }}>
              <TIcon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* HEDEFLER */}
      {activeTab === 'targets' && (
        <div style={{ display: 'grid', gap: 14 }}>
          {targets.map((t, i) => {
            const pct = Math.round((t.ACHIEVED_QTY / t.TARGET_QTY) * 100);
            const expectedPct = Math.round(((new Date().getMonth() + 1) / 12) * 100);
            const onTrackStatus = pct >= expectedPct * 0.9;
            const barColor = pct >= 100 ? '#10b981' : pct >= expectedPct * 0.9 ? '#3b82f6' : pct >= expectedPct * 0.6 ? '#f59e0b' : '#ef4444';

            return (
              <motion.div key={t.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{
                  background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
                  overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.06)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.03)'}
              >
                <div style={{ display: 'flex' }}>
                  <div style={{ width: 5, alignSelf: 'stretch', background: barColor, flexShrink: 0 }} />
                  <div style={{ flex: 1, padding: '20px 24px' }}>
                    {/* Header satırı */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                          <Store size={14} color="#64748b" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b' }}>{t.STORE}</span>
                          <span style={{ fontSize: 10, color: '#cbd5e1' }}>·</span>
                          <Package size={14} color="#64748b" />
                          <span style={{ fontSize: 12, fontWeight: 700, color: '#0f172a' }}>{t.PRODUCT}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                          <div>
                            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Miktar</p>
                            <p style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '2px 0 0' }}>
                              {t.ACHIEVED_QTY.toLocaleString('tr-TR')} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>/ {t.TARGET_QTY.toLocaleString('tr-TR')}</span>
                            </p>
                          </div>
                          <div>
                            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 600, textTransform: 'uppercase' }}>Ciro</p>
                            <p style={{ fontSize: 20, fontWeight: 800, color: '#E81E25', margin: '2px 0 0' }}>
                              {fmtMoney(t.ACHIEVED_REVENUE)} <span style={{ fontSize: 13, color: '#94a3b8', fontWeight: 600 }}>/ {fmtMoney(t.TARGET_REVENUE)}</span>
                            </p>
                          </div>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 30, fontWeight: 800, color: barColor, lineHeight: 1 }}>{pct}<span style={{ fontSize: 16 }}>%</span></div>
                        <Badge tone={onTrackStatus ? 'green' : 'red'}>
                          {onTrackStatus ? <><CheckCircle2 size={10} /> Hedefte</> : <><AlertTriangle size={10} /> Gerilik</>}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress bar — gerçekleşme + beklenen */}
                    <div style={{ position: 'relative', height: 10, background: '#f1f5f9', borderRadius: 5, overflow: 'hidden', marginBottom: 6 }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ position: 'absolute', inset: 0, width: `${Math.min(pct, 100)}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}bb)`, borderRadius: 5 }} />
                      {/* Beklenen nokta */}
                      <div style={{
                        position: 'absolute', top: -3, bottom: -3, left: `${expectedPct}%`,
                        width: 2, background: '#0f172a', borderRadius: 1
                      }} title={`Bu noktaya ulaşmış olmalıydı: %${expectedPct}`} />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#94a3b8' }}>
                      <span>Gerçek: %{pct}</span>
                      <span>Beklenen bu dönemde: %{expectedPct}</span>
                      <span>Kalan: {Math.max(t.TARGET_QTY - t.ACHIEVED_QTY, 0)} adet</span>
                    </div>

                    {/* Aylık mini grafik — her zaman görünür */}
                    {(
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        style={{ marginTop: 18, paddingTop: 18, borderTop: '1px solid #f1f5f9' }}>
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: 0.5 }}>Aylık Plan vs Gerçekleşme</p>
                        {(() => {
                          const maxVal = Math.max(...(t.MONTHLY_PLAN || []), ...(t.MONTHLY_ACTUAL || []), 1);
                          const barH = 100;
                          return (
                            <>
                              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: barH }}>
                                {MONTHS.map((m, mi) => {
                                  const plan = (t.MONTHLY_PLAN || [])[mi] || 0;
                                  const actual = (t.MONTHLY_ACTUAL || [])[mi] || 0;
                                  const planH = Math.max((plan / maxVal) * barH, plan > 0 ? 4 : 0);
                                  const actualH = Math.max((actual / maxVal) * barH, actual > 0 ? 4 : 0);
                                  const actualColor = actual >= plan ? '#10b981' : actual > 0 ? '#f59e0b' : '#e2e8f0';
                                  return (
                                    <div key={mi} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                      <div style={{ display: 'flex', gap: 2, width: '100%', alignItems: 'flex-end', height: barH }}>
                                        <div style={{ flex: 1, height: planH, background: '#e2e8f0', borderRadius: '3px 3px 0 0', minHeight: plan > 0 ? 4 : 0 }} title={`Plan: ${plan}`} />
                                        <div style={{ flex: 1, height: actualH, background: actualColor, borderRadius: '3px 3px 0 0', minHeight: actual > 0 ? 4 : 0 }} title={`Gerçek: ${actual}`} />
                                      </div>
                                      <span style={{ fontSize: 9, color: '#94a3b8', fontWeight: 600 }}>{m}</span>
                                    </div>
                                  );
                                })}
                              </div>
                              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8, fontSize: 10, color: '#64748b' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#e2e8f0', borderRadius: 2, display: 'inline-block' }} /> Plan</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#10b981', borderRadius: 2, display: 'inline-block' }} /> Hedefin üstü</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, background: '#f59e0b', borderRadius: 2, display: 'inline-block' }} /> Hedefin altı</span>
                              </div>
                            </>
                          );
                        })()}
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ÜRETİM PLANI */}
      {activeTab === 'production' && (
        <div>
          <div style={{ marginBottom: 16, padding: 16, background: '#eff6ff', borderRadius: 12, border: '1px solid #bfdbfe' }}>
            <p style={{ fontSize: 12, color: '#1e40af', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              <strong>Nasıl çalışır?</strong> Yıllık hedefler ile gerçekleşen satışlar arasındaki fark, gereken üretim miktarıdır.
              Aşağıdaki liste üretim ekibine direkt hangi üründen ne kadar üretmesi gerektiğini gösterir.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {production.map((p, i) => {
              const barColor = p.completion >= 100 ? '#10b981' : p.completion >= 70 ? '#3b82f6' : p.completion >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  style={{ background: '#fff', borderRadius: 14, padding: 20, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 12,
                    background: `${barColor}15`, border: `1px solid ${barColor}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Factory size={22} color={barColor} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{p.product}</h4>
                    <p style={{ fontSize: 12, color: '#64748b', margin: '0 0 10px' }}>
                      Toplam Hedef: <strong>{p.targetQty.toLocaleString('tr-TR')}</strong> · Gerçekleşen: <strong>{p.achievedQty.toLocaleString('tr-TR')}</strong>
                    </p>
                    <div style={{ height: 8, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(p.completion, 100)}%` }} transition={{ duration: 1 }}
                        style={{ height: '100%', background: `linear-gradient(90deg, ${barColor}, ${barColor}bb)`, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Üretilmesi Gereken</p>
                    <p style={{ fontSize: 28, fontWeight: 800, color: barColor, margin: '4px 0 0' }}>{p.remainingQty.toLocaleString('tr-TR')}</p>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>adet</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* SATIN ALMA İHTİYACI */}
      {activeTab === 'purchase' && (
        <div>
          <div style={{ marginBottom: 16, padding: 16, background: '#fef3c7', borderRadius: 12, border: '1px solid #fde68a' }}>
            <p style={{ fontSize: 12, color: '#92400e', margin: 0, lineHeight: 1.6, fontWeight: 500 }}>
              <strong>Otomatik hesaplandı.</strong> Üretim planı × ürün reçeteleri (BOM) → gereken hammadde.
              Mevcut stok düşüldükten sonra kalan eksiklik, satın alma ihtiyacıdır.
            </p>
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            {purchases.map((p, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                style={{
                  background: '#fff', borderRadius: 14,
                  border: `1px solid ${p.urgency === 'critical' ? '#fecaca' : p.urgency === 'high' ? '#fde68a' : '#e2e8f0'}`,
                  padding: 20, display: 'flex', alignItems: 'center', gap: 20,
                  boxShadow: p.urgency === 'critical' ? '0 0 0 1px #fca5a5' : 'none'
                }}>
                <div style={{
                  width: 54, height: 54, borderRadius: 12,
                  background: p.urgency === 'critical' ? '#fef2f2' : p.urgency === 'high' ? '#fffbeb' : '#ecfdf5',
                  border: `1px solid ${p.urgency === 'critical' ? '#fecaca' : p.urgency === 'high' ? '#fde68a' : '#a7f3d0'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  {p.urgency === 'critical' ? <AlertTriangle size={22} color="#ef4444" /> : p.urgency === 'high' ? <Clock size={22} color="#f59e0b" /> : <CheckCircle2 size={22} color="#10b981" />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: 0 }}>{p.material}</h4>
                    {p.urgency === 'critical' && <Badge tone="red">Kritik</Badge>}
                    {p.urgency === 'high' && <Badge tone="amber">Acil</Badge>}
                    {p.urgency === 'ok' && <Badge tone="green">Yeterli</Badge>}
                  </div>
                  <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                    Mevcut stok: <strong>{p.currentStock} {p.unit}</strong> · Gereken: <strong>{p.needed} {p.unit}</strong>
                  </p>
                  {p.shortage > 0 && (
                    <p style={{ fontSize: 11, color: p.urgency === 'critical' ? '#dc2626' : '#d97706', margin: '4px 0 0', fontWeight: 700 }}>
                      Önerilen sipariş tarihi: {p.suggestedOrderDate}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 700, textTransform: 'uppercase' }}>Sipariş Edilecek</p>
                  <p style={{ fontSize: 24, fontWeight: 800, color: p.urgency === 'critical' ? '#ef4444' : p.urgency === 'high' ? '#f59e0b' : '#10b981', margin: '4px 0 0' }}>
                    {p.shortage > 0 ? p.shortage.toLocaleString('tr-TR') : '—'}
                  </p>
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{p.shortage > 0 ? p.unit : 'gerek yok'}</p>
                  {p.estimatedCost > 0 && (
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#E81E25', margin: '4px 0 0' }}>{fmtMoney(p.estimatedCost)}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Yeni Hedef Modal */}
      <FormModal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Yeni Hedef" subtitle="Mağaza ve ürün bazında yıllık hedef belirle" icon={Target} onSubmit={create} submitting={saving}>
        <FormField label="Mağaza" type="select" required value={form.STORE} onChange={setField('STORE')}
          options={['KOM Flagship İstanbul', 'KOM Ankara AVM', 'KOM İzmir', 'KOM Antalya', 'KOM Bursa Nilüfer', 'KOM Adana Outlet']} />
        <FormField label="Ürün" type="select" required value={form.PRODUCT} onChange={setField('PRODUCT')}
          options={['Likralı Bayan Mayo', 'Bikini Takımı', 'Erkek Plaj Şortu', 'Çocuk Mayo Seti', 'Havlu Bornoz', 'İç Giyim']} />
        <FormField label="Hedef Miktar (adet)" type="number" value={form.TARGET_QTY} onChange={setField('TARGET_QTY')} />
        <FormField label="Hedef Ciro (₺)" type="number" value={form.TARGET_REVENUE} onChange={setField('TARGET_REVENUE')} />
      </FormModal>
    </DarkHero>
  );
};

export default Targets;
