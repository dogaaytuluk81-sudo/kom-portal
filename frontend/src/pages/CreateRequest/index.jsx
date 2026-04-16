import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Send, ChevronRight, ChevronLeft, MapPin, FileText, AlertCircle, CheckCircle2, Upload, Building2, Wrench } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { Btn } from '../../components/PageShell.jsx';

const PRIORITIES = [
  { id: 'low', label: 'Düşük', desc: 'Acil değil, planlı süreçte çözülebilir', color: '#94a3b8', bg: '#f1f5f9' },
  { id: 'medium', label: 'Normal', desc: 'Makul sürede çözülmeli', color: '#f59e0b', bg: '#fffbeb' },
  { id: 'high', label: 'Yüksek', desc: 'Hızlı aksiyon gerekli', color: '#ef4444', bg: '#fef2f2' },
  { id: 'critical', label: 'Kritik', desc: 'Üretim durdu, anında müdahale', color: '#dc2626', bg: '#fef2f2' },
];

const STEPS = [
  { id: 'service', label: 'Hizmet', icon: Wrench },
  { id: 'details', label: 'Detaylar', icon: FileText },
  { id: 'location', label: 'Lokasyon', icon: MapPin },
  { id: 'review', label: 'Önizleme', icon: CheckCircle2 },
];

const CreateRequest = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [services, setServices] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    SERVICE: '', SUBJECT: '', EXPLANATION: '', PRIORITY: 'medium',
    FIRM: '', LOCATION: '', PROCESS_NO: ''
  });

  useEffect(() => {
    api.post('/api/requests/services').then(r => setServices(r.data.data || []));
  }, []);

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
  const canNext = () => {
    if (step === 0) return !!form.SERVICE;
    if (step === 1) return form.SUBJECT.trim().length >= 3 && form.EXPLANATION.trim().length >= 10;
    if (step === 2) return !!form.FIRM;
    return true;
  };

  const submit = async () => {
    setSubmitting(true);
    try {
      const r = await api.post('/api/requests/create', form);
      if (r.data.success) {
        toast.success('Talep başarıyla oluşturuldu!');
        navigate('/app/talepler');
      }
    } catch { toast.error('Talep oluşturulamadı'); }
    finally { setSubmitting(false); }
  };

  const grouped = {};
  services.forEach(s => { if (!grouped[s.CATEGORY]) grouped[s.CATEGORY] = []; grouped[s.CATEGORY].push(s); });

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
      {/* Dark Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        padding: '36px 40px 60px', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -100, right: -40, width: 350, height: 350, background: 'radial-gradient(circle, rgba(232,30,37,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
        <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(232,30,37,0.2)', border: '1px solid rgba(232,30,37,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} color="#E81E25" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.5)', letterSpacing: 2, textTransform: 'uppercase' }}>Yeni Talep</span>
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#fff', margin: '0 0 24px', letterSpacing: -0.5 }}>Talep Oluştur</h1>

          {/* Steps */}
          <div style={{ display: 'flex', gap: 8 }}>
            {STEPS.map((s, i) => {
              const active = i === step;
              const done = i < step;
              const SIcon = s.icon;
              return (
                <div key={s.id} style={{
                  flex: 1, display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', borderRadius: 12,
                  background: active ? 'rgba(232,30,37,0.2)' : done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${active ? 'rgba(232,30,37,0.4)' : done ? 'rgba(16,185,129,0.3)' : 'rgba(255,255,255,0.08)'}`,
                  cursor: done ? 'pointer' : 'default',
                  transition: 'all 0.2s'
                }}
                  onClick={() => done && setStep(i)}
                >
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: active ? '#E81E25' : done ? '#10b981' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 800, color: '#fff'
                  }}>
                    {done ? <CheckCircle2 size={14} /> : <SIcon size={14} />}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : done ? '#10b981' : 'rgba(255,255,255,0.4)', margin: 0 }}>{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: '-24px auto 0', padding: '0 40px 60px', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            style={{
              background: '#fff', borderRadius: 20, padding: 32,
              boxShadow: '0 4px 24px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0',
              minHeight: 400
            }}
          >
            {/* STEP 0 — Hizmet Seçimi */}
            {step === 0 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Hizmet Türü Seçin</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>Talebiniz hangi hizmet alanıyla ilgili?</p>

                {Object.entries(grouped).map(([cat, items]) => (
                  <div key={cat} style={{ marginBottom: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', margin: '0 0 10px', letterSpacing: 1, textTransform: 'uppercase' }}>{cat}</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                      {items.map(s => {
                        const selected = form.SERVICE === s.NAME;
                        return (
                          <div key={s.ID} onClick={() => set('SERVICE', s.NAME)}
                            style={{
                              padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                              background: selected ? '#fef2f2' : '#f8fafc',
                              border: `2px solid ${selected ? '#E81E25' : '#e2e8f0'}`,
                              transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => !selected && (e.currentTarget.style.borderColor = '#cbd5e1')}
                            onMouseLeave={e => !selected && (e.currentTarget.style.borderColor = '#e2e8f0')}
                          >
                            <p style={{ fontSize: 13, fontWeight: 700, color: selected ? '#E81E25' : '#0f172a', margin: 0 }}>{s.NAME}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* STEP 1 — Detaylar */}
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Talep Detayları</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>Sorunu açıklayın ve öncelik belirleyin</p>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Konu <span style={{ color: '#E81E25' }}>*</span>
                  </label>
                  <input value={form.SUBJECT} onChange={e => set('SUBJECT', e.target.value)} placeholder="Kısa ve net bir başlık"
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#E81E25'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{form.SUBJECT.length}/100 karakter</p>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                    Açıklama <span style={{ color: '#E81E25' }}>*</span>
                  </label>
                  <textarea value={form.EXPLANATION} onChange={e => set('EXPLANATION', e.target.value)}
                    placeholder="Sorunu detaylı anlatın... Ne oldu, ne zaman fark edildi, kaç ürün etkilendi?"
                    rows={5}
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', transition: 'border 0.2s' }}
                    onFocus={e => e.target.style.borderColor = '#E81E25'}
                    onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                  />
                  <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0' }}>{form.EXPLANATION.length}/500 karakter</p>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.3 }}>Öncelik</label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {PRIORITIES.map(p => {
                      const selected = form.PRIORITY === p.id;
                      return (
                        <div key={p.id} onClick={() => set('PRIORITY', p.id)}
                          style={{
                            padding: '14px 16px', borderRadius: 12, cursor: 'pointer', textAlign: 'center',
                            background: selected ? p.bg : '#f8fafc',
                            border: `2px solid ${selected ? p.color : '#e2e8f0'}`,
                            transition: 'all 0.2s'
                          }}>
                          <div style={{ width: 10, height: 10, borderRadius: '50%', background: p.color, margin: '0 auto 8px' }} />
                          <p style={{ fontSize: 13, fontWeight: 800, color: selected ? p.color : '#0f172a', margin: '0 0 2px' }}>{p.label}</p>
                          <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, lineHeight: 1.4 }}>{p.desc}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2 — Lokasyon & Firma */}
            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Firma & Lokasyon</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>Talebin hangi firma ve lokasyonla ilgili olduğunu belirtin</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>
                      Firma <span style={{ color: '#E81E25' }}>*</span>
                    </label>
                    <select value={form.FIRM} onChange={e => set('FIRM', e.target.value)}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      <option value="">Firma seçin...</option>
                      {['KOM İç', 'Migros', 'LC Waikiki', 'Koton', 'Boyner', 'DeFacto', 'Vakko', 'Mavi'].map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>Lokasyon</label>
                    <select value={form.LOCATION} onChange={e => set('LOCATION', e.target.value)}
                      style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none', background: '#fff', cursor: 'pointer' }}>
                      <option value="">Lokasyon seçin...</option>
                      {['Fabrika A - Kesimhane', 'Fabrika A - Dikim Hattı A', 'Fabrika A - Dikim Hattı B', 'Fabrika A - Kalite Lab', 'Fabrika B - Boyahane', 'Depo A', 'Depo B', 'Depo C', 'Tasarım Stüdyosu', 'Lojistik Merkez'].map(l => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#374151', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.3 }}>İşlem Numarası (Opsiyonel)</label>
                  <input value={form.PROCESS_NO} onChange={e => set('PROCESS_NO', e.target.value)} placeholder="Sipariş no, lot no, vs."
                    style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '2px solid #e2e8f0', fontSize: 14, outline: 'none' }} />
                </div>
              </div>
            )}

            {/* STEP 3 — Önizleme */}
            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>Talep Önizleme</h2>
                <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 24px' }}>Bilgileri kontrol edip gönderin</p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {[
                    { label: 'Hizmet', value: form.SERVICE },
                    { label: 'Öncelik', value: PRIORITIES.find(p => p.id === form.PRIORITY)?.label, color: PRIORITIES.find(p => p.id === form.PRIORITY)?.color },
                    { label: 'Firma', value: form.FIRM },
                    { label: 'Lokasyon', value: form.LOCATION || '—' },
                    { label: 'İşlem No', value: form.PROCESS_NO || '—' },
                  ].map((item, i) => (
                    <div key={i} style={{ padding: 14, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
                      <p style={{ fontSize: 14, fontWeight: 700, color: item.color || '#0f172a', margin: '6px 0 0' }}>{item.value}</p>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 16, padding: 16, borderRadius: 12, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Konu</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#0f172a', margin: '6px 0 8px' }}>{form.SUBJECT}</p>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Açıklama</p>
                  <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0', lineHeight: 1.6 }}>{form.EXPLANATION}</p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 20, padding: '16px 0'
        }}>
          <div>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 20px', borderRadius: 12,
                  border: '1px solid #e2e8f0', background: '#fff',
                  color: '#64748b', fontSize: 13, fontWeight: 700,
                  cursor: 'pointer'
                }}>
                <ChevronLeft size={16} /> Geri
              </button>
            )}
          </div>
          <div>
            {step < 3 ? (
              <button onClick={() => canNext() && setStep(s => s + 1)}
                disabled={!canNext()}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '12px 24px', borderRadius: 12,
                  border: 'none',
                  background: canNext() ? 'linear-gradient(135deg, #E81E25, #b91c1c)' : '#e2e8f0',
                  color: canNext() ? '#fff' : '#94a3b8',
                  fontSize: 13, fontWeight: 700,
                  cursor: canNext() ? 'pointer' : 'not-allowed',
                  boxShadow: canNext() ? '0 6px 18px rgba(232,30,37,0.25)' : 'none'
                }}>
                Devam <ChevronRight size={16} />
              </button>
            ) : (
              <button onClick={submit} disabled={submitting}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '14px 28px', borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  color: '#fff', fontSize: 14, fontWeight: 800,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  boxShadow: '0 6px 18px rgba(16,185,129,0.25)',
                  opacity: submitting ? 0.6 : 1
                }}>
                <Send size={16} /> {submitting ? 'Gönderiliyor...' : 'Talebi Gönder'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRequest;
