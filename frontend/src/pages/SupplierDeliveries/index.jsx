import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Truck, CheckCircle2, Clock, Package } from 'lucide-react';
import api from '../../api.js';
import { DarkHero, Badge } from '../../components/PageShell.jsx';

const getUser = () => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : {}; };
const DEL_STATUS = { production: { label: 'Üretimde', tone: 'amber' }, in_transit: { label: 'Yolda', tone: 'blue' }, delivered: { label: 'Teslim', tone: 'green' } };

const SupplierDeliveries = () => {
  const user = getUser();
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    api.post('/api/supplier/deliveries', { firm: user.firm }).then(r => setDeliveries(r.data.data || []));
  }, []);

  return (
    <DarkHero icon={Truck} label="Teslimat" title="Teslimat Takibi" subtitle={`${deliveries.length} aktif teslimat · ${user.firm}`} accentColor="#3b82f6"
      stats={[
        { label: 'Aktif Teslimat', value: deliveries.length, color: '#3b82f6' },
        { label: 'Yolda', value: deliveries.filter(d => d.STATUS === 'in_transit').length, color: '#f59e0b' },
        { label: 'Üretimde', value: deliveries.filter(d => d.STATUS === 'production').length, color: '#8b5cf6' },
      ]}
    >
      <div style={{ display: 'grid', gap: 16 }}>
        {deliveries.map((del, i) => {
          const st = DEL_STATUS[del.STATUS] || DEL_STATUS.production;
          const completedSteps = del.STEPS.filter(s => s.done).length;
          const totalSteps = del.STEPS.length;
          return (
            <motion.div key={del.ID} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
              style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
              <div style={{ padding: 24 }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', fontFamily: 'monospace' }}>{del.ORDER}</span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: '0 0 4px' }}>{del.PRODUCT}</h3>
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>{del.QUANTITY} adet · Tahmini teslim: {del.EST_DELIVERY}</p>
                    {del.TRACKING && <p style={{ fontSize: 11, color: '#3b82f6', margin: '4px 0 0', fontWeight: 600 }}>Takip: {del.TRACKING} · {del.CARRIER}</p>}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: 0, fontWeight: 600 }}>İLERLEME</p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: '#3b82f6', margin: '2px 0 0' }}>{completedSteps}/{totalSteps}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 0 }}>
                  {del.STEPS.map((step, si) => {
                    const isLast = si === del.STEPS.length - 1;
                    return (
                      <div key={si} style={{ flex: 1, position: 'relative' }}>
                        {/* Bağlantı çizgisi */}
                        {!isLast && (
                          <div style={{
                            position: 'absolute', top: 11, left: '50%', right: '-50%',
                            height: 3, background: step.done ? '#10b981' : '#f1f5f9', zIndex: 0
                          }} />
                        )}
                        {/* Nokta */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                          <div style={{
                            width: 24, height: 24, borderRadius: '50%',
                            background: step.done ? '#10b981' : '#f1f5f9',
                            border: `2px solid ${step.done ? '#10b981' : '#e2e8f0'}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: 8
                          }}>
                            {step.done && <CheckCircle2 size={12} color="#fff" />}
                          </div>
                          <p style={{ fontSize: 10, fontWeight: 700, color: step.done ? '#0f172a' : '#94a3b8', margin: 0, textAlign: 'center', lineHeight: 1.3 }}>{step.label}</p>
                          {step.date && <p style={{ fontSize: 9, color: '#94a3b8', margin: '2px 0 0' }}>{step.date}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          );
        })}
        {deliveries.length === 0 && (
          <div style={{ padding: 60, textAlign: 'center', color: '#94a3b8' }}>
            <Package size={36} color="#e2e8f0" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontSize: 13, margin: 0, fontWeight: 600 }}>Aktif teslimat yok</p>
          </div>
        )}
      </div>
    </DarkHero>
  );
};

export default SupplierDeliveries;
