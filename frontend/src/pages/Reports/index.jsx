import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Download, Factory, Wallet, Activity,
  ArrowUp, ArrowDown, AlertCircle, ShoppingBag
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api.js';
import { PageShell, Card, Btn, fmtMoney } from '../../components/PageShell.jsx';

// ═══════════════════════════════════════════════════════
// Tasarım Sistemi
// ═══════════════════════════════════════════════════════
const COLORS = {
  primary: '#E81E25',
  primaryDark: '#b91c1c',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  purple: '#8b5cf6',
  text: '#0f172a',
  textMuted: '#64748b',
  textLight: '#94a3b8',
  border: '#e2e8f0',
  bg: '#f8fafc',
  cardBg: '#ffffff',
};

const DATE_RANGES = [
  { id: '3m', label: '3 Ay', months: 3 },
  { id: '6m', label: '6 Ay', months: 6 },
  { id: '12m', label: '12 Ay', months: 12 },
  { id: 'all', label: 'Tümü', months: 999 },
];

const TABS = [
  { id: 'overview', label: 'Genel Bakış', icon: Activity },
  { id: 'sales', label: 'Satış', icon: ShoppingBag },
  { id: 'finance', label: 'Finans', icon: Wallet },
  { id: 'operations', label: 'Operasyon', icon: Factory },
];

const formatShort = (v) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
  return v.toString();
};

// ═══════════════════════════════════════════════════════
// Section Header (her kart için tutarlı başlık)
// ═══════════════════════════════════════════════════════
const SectionHeader = ({ title, subtitle, right }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'flex-start', marginBottom: 24
  }}>
    <div>
      <h3 style={{
        fontSize: 15, fontWeight: 700, color: COLORS.text,
        margin: 0, letterSpacing: -0.2
      }}>{title}</h3>
      {subtitle && (
        <p style={{
          fontSize: 12, color: COLORS.textMuted,
          margin: '6px 0 0', fontWeight: 500
        }}>{subtitle}</p>
      )}
    </div>
    {right}
  </div>
);

// ═══════════════════════════════════════════════════════
// Çok amaçlı Line Chart (nizami, hizalı, temiz)
// ═══════════════════════════════════════════════════════
const LineChart = ({ data, series, height = 240, yFormat = formatShort }) => {
  const width = 560;
  const padding = { top: 16, right: 20, bottom: 32, left: 52 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!data.length) {
    return (
      <div style={{ padding: 60, textAlign: 'center', color: COLORS.textLight, fontSize: 13 }}>
        Veri bulunamadı
      </div>
    );
  }

  const allValues = data.flatMap(d => series.map(s => d[s.key] || 0));
  const rawMax = Math.max(...allValues, 1);
  // Nice scale - yuvarlak step'ler
  const niceMax = Math.ceil(rawMax / Math.pow(10, Math.floor(Math.log10(rawMax)))) * Math.pow(10, Math.floor(Math.log10(rawMax)));

  const xStep = data.length > 1 ? chartW / (data.length - 1) : chartW;
  const scaleX = (i) => padding.left + i * xStep;
  const scaleY = (v) => padding.top + chartH - (v / niceMax) * chartH;

  const gridCount = 5;

  return (
    <div style={{ width: '100%' }}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', maxHeight: 260, display: 'block' }}
      >
        <defs>
          {series.map((s) => (
            <linearGradient key={s.key} id={`line-grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity="0.18" />
              <stop offset="100%" stopColor={s.color} stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>

        {/* Horizontal grid + Y labels */}
        {Array.from({ length: gridCount + 1 }).map((_, i) => {
          const y = padding.top + (chartH / gridCount) * i;
          const v = niceMax - (niceMax / gridCount) * i;
          return (
            <g key={i}>
              <line
                x1={padding.left} x2={padding.left + chartW}
                y1={y} y2={y}
                stroke={COLORS.border}
                strokeWidth="1"
                strokeDasharray={i === gridCount ? '0' : '4 4'}
                opacity={i === gridCount ? 1 : 0.5}
              />
              <text
                x={padding.left - 12} y={y + 4}
                fontSize="11" fill={COLORS.textLight}
                textAnchor="end" fontWeight="500"
                fontFamily="system-ui"
              >
                {yFormat(v)}
              </text>
            </g>
          );
        })}

        {/* Areas */}
        {series.map((s) => {
          const points = data.map((d, i) => [scaleX(i), scaleY(d[s.key] || 0)]);
          const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ');
          const areaPath = `${linePath} L ${points[points.length - 1][0]},${padding.top + chartH} L ${points[0][0]},${padding.top + chartH} Z`;
          return <path key={s.key} d={areaPath} fill={`url(#line-grad-${s.key})`} />;
        })}

        {/* Lines */}
        {series.map((s) => {
          const points = data.map((d, i) => [scaleX(i), scaleY(d[s.key] || 0)]);
          const linePath = points.map((p, i) => (i === 0 ? `M ${p[0]},${p[1]}` : `L ${p[0]},${p[1]}`)).join(' ');
          return (
            <path
              key={s.key} d={linePath}
              fill="none" stroke={s.color}
              strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            />
          );
        })}

        {/* Dots */}
        {series.map((s) =>
          data.map((d, i) => {
            const x = scaleX(i);
            const y = scaleY(d[s.key] || 0);
            return (
              <g key={`${s.key}-${i}`}>
                <circle cx={x} cy={y} r="5" fill="#fff" />
                <circle cx={x} cy={y} r="4" fill={s.color} />
                <title>{`${s.label}: ${fmtMoney(d[s.key])}`}</title>
              </g>
            );
          })
        )}

        {/* X labels */}
        {data.map((d, i) => (
          <text
            key={i}
            x={scaleX(i)} y={height - 14}
            fontSize="11" fill={COLORS.textMuted}
            textAnchor="middle" fontWeight="600"
            fontFamily="system-ui"
          >
            {d.label}
          </text>
        ))}
      </svg>

      {/* Legend */}
      {series.length > 1 && (
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center',
          marginTop: 8, fontSize: 12, fontWeight: 600
        }}>
          {series.map((s) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textMuted }}>
              <span style={{
                width: 10, height: 10, borderRadius: 3,
                background: s.color, display: 'inline-block'
              }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Column Bar Chart (aylık karşılaştırma)
// ═══════════════════════════════════════════════════════
const ColumnChart = ({ data, series, height = 240 }) => {
  const width = 560;
  const padding = { top: 16, right: 20, bottom: 32, left: 52 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  if (!data.length) return <div style={{ padding: 60, textAlign: 'center', color: COLORS.textLight }}>Veri bulunamadı</div>;

  const allValues = data.flatMap(d => series.map(s => d[s.key] || 0));
  const rawMax = Math.max(...allValues, 1);
  const niceMax = Math.ceil(rawMax / Math.pow(10, Math.floor(Math.log10(rawMax)))) * Math.pow(10, Math.floor(Math.log10(rawMax)));

  const groupW = chartW / data.length;
  const barPad = 12;
  const innerW = groupW - barPad * 2;
  const barW = (innerW - (series.length - 1) * 4) / series.length;

  const gridCount = 5;

  return (
    <div style={{ width: '100%' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', display: 'block' }}>
        {/* Grid */}
        {Array.from({ length: gridCount + 1 }).map((_, i) => {
          const y = padding.top + (chartH / gridCount) * i;
          const v = niceMax - (niceMax / gridCount) * i;
          return (
            <g key={i}>
              <line
                x1={padding.left} x2={padding.left + chartW}
                y1={y} y2={y}
                stroke={COLORS.border}
                strokeDasharray={i === gridCount ? '0' : '4 4'}
                opacity={i === gridCount ? 1 : 0.5}
              />
              <text
                x={padding.left - 12} y={y + 4}
                fontSize="11" fill={COLORS.textLight}
                textAnchor="end" fontWeight="500"
              >
                {formatShort(v)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, gi) => {
          const gx = padding.left + gi * groupW + barPad;
          return (
            <g key={gi}>
              {series.map((s, si) => {
                const v = d[s.key] || 0;
                const h = (v / niceMax) * chartH;
                const x = gx + si * (barW + 4);
                const y = padding.top + chartH - h;
                return (
                  <g key={s.key}>
                    <defs>
                      <linearGradient id={`col-${gi}-${si}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={s.color} />
                        <stop offset="100%" stopColor={s.color} stopOpacity="0.7" />
                      </linearGradient>
                    </defs>
                    <rect
                      x={x} y={y}
                      width={barW} height={h}
                      fill={`url(#col-${gi}-${si})`}
                      rx="4"
                    >
                      <title>{`${s.label}: ${fmtMoney(v)}`}</title>
                    </rect>
                  </g>
                );
              })}
              <text
                x={padding.left + gi * groupW + groupW / 2}
                y={height - 14}
                fontSize="11" fill={COLORS.textMuted}
                textAnchor="middle" fontWeight="600"
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {series.length > 1 && (
        <div style={{
          display: 'flex', gap: 24, justifyContent: 'center',
          marginTop: 8, fontSize: 12, fontWeight: 600
        }}>
          {series.map((s) => (
            <div key={s.key} style={{ display: 'flex', alignItems: 'center', gap: 8, color: COLORS.textMuted }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Horizontal Bar List (Top N listesi)
// ═══════════════════════════════════════════════════════
const HorizontalBarList = ({ items, color = COLORS.primary }) => {
  const max = Math.max(...items.map(i => i.value), 1);
  return (
    <div>
      {items.map((item, i) => (
        <div key={i} style={{ marginBottom: i === items.length - 1 ? 0 : 18 }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'baseline', marginBottom: 8
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{
                fontSize: 11, fontWeight: 700, color: COLORS.textLight,
                fontFamily: 'system-ui', minWidth: 18
              }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: COLORS.text }}>
                {item.label}
              </span>
              {item.sub && (
                <span style={{ fontSize: 11, color: COLORS.textLight, fontWeight: 500 }}>
                  {item.sub}
                </span>
              )}
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.text, fontVariantNumeric: 'tabular-nums' }}>
              {item.display || fmtMoney(item.value)}
            </span>
          </div>
          <div style={{
            height: 6, background: '#f1f5f9',
            borderRadius: 3, overflow: 'hidden', marginLeft: 30
          }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(item.value / max) * 100}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.05 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${color}, ${color}cc)`,
                borderRadius: 3
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Donut Chart (segment dağılımı)
// ═══════════════════════════════════════════════════════
const DonutChart = ({ data, size = 200, thickness = 24, centerLabel, centerValue }) => {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = size / 2 - thickness / 2 - 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
      <svg width={size} height={size} style={{ flexShrink: 0 }}>
        <circle
          cx={cx} cy={cy} r={radius}
          fill="none" stroke="#f1f5f9"
          strokeWidth={thickness}
        />
        {data.map((d, i) => {
          const dash = (d.value / total) * circumference;
          const gap = circumference - dash;
          const currentOffset = offset;
          offset += dash;
          return (
            <circle
              key={i}
              cx={cx} cy={cy} r={radius}
              fill="none"
              stroke={d.color}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-currentOffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
        })}
        {centerValue && (
          <>
            <text x={cx} y={cy - 4} fontSize="26" fontWeight="800" fill={COLORS.text} textAnchor="middle">
              {centerValue}
            </text>
            <text x={cx} y={cy + 16} fontSize="11" fontWeight="600" fill={COLORS.textLight} textAnchor="middle" letterSpacing="0.5">
              {centerLabel}
            </text>
          </>
        )}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{
              width: 10, height: 10, borderRadius: 2,
              background: d.color, flexShrink: 0
            }} />
            <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontSize: 13, color: COLORS.text, fontWeight: 600 }}>{d.label}</span>
              <span style={{ fontSize: 12, color: COLORS.textMuted, fontVariantNumeric: 'tabular-nums' }}>
                {d.value} · {((d.value / total) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Metric Card — Ana KPI kartı
// ═══════════════════════════════════════════════════════
const MetricCard = ({ label, value, delta, trend, accentColor = COLORS.primary }) => (
  <div style={{
    background: COLORS.cardBg,
    borderRadius: 16,
    padding: 24,
    border: `1px solid ${COLORS.border}`,
    position: 'relative',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: 3, height: '100%', background: accentColor
    }} />
    <p style={{
      fontSize: 12, fontWeight: 600,
      color: COLORS.textMuted, margin: 0,
      letterSpacing: 0.2
    }}>{label}</p>
    <p style={{
      fontSize: 30, fontWeight: 800,
      color: COLORS.text, margin: '10px 0 0',
      letterSpacing: -1, fontVariantNumeric: 'tabular-nums'
    }}>{value}</p>
    {delta && (
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 4,
        fontSize: 12, fontWeight: 700,
        color: trend === 'up' ? COLORS.success : COLORS.danger,
        marginTop: 12
      }}>
        {trend === 'up' ? <ArrowUp size={12} /> : <ArrowDown size={12} />}
        {delta}
        <span style={{ color: COLORS.textLight, fontWeight: 500, marginLeft: 4 }}>
          önceki döneme göre
        </span>
      </div>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════
// Compact Stat — küçük stat rozetleri
// ═══════════════════════════════════════════════════════
const CompactStat = ({ label, value, color = COLORS.text }) => (
  <div>
    <p style={{
      fontSize: 11, fontWeight: 600,
      color: COLORS.textMuted, margin: 0,
      textTransform: 'uppercase', letterSpacing: 0.5
    }}>{label}</p>
    <p style={{
      fontSize: 18, fontWeight: 800,
      color, margin: '6px 0 0',
      fontVariantNumeric: 'tabular-nums'
    }}>{value}</p>
  </div>
);

// ═══════════════════════════════════════════════════════
// Progress Ring — dairesel hedef göstergesi
// ═══════════════════════════════════════════════════════
const ProgressRing = ({ value, max, label, size = 120, color = COLORS.primary }) => {
  const pct = Math.min(value / max, 1);
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - pct);

  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="#f1f5f9" strokeWidth="8"
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
        <text
          x={size / 2} y={size / 2 + 6}
          fontSize="22" fontWeight="800"
          fill={COLORS.text} textAnchor="middle"
        >
          {(pct * 100).toFixed(0)}%
        </text>
      </svg>
      <p style={{
        fontSize: 12, fontWeight: 600,
        color: COLORS.textMuted, margin: '10px 0 0'
      }}>{label}</p>
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN REPORTS
// ═══════════════════════════════════════════════════════
const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [range, setRange] = useState('12m');
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const [sumRes, monRes, custRes, invRes, prodRes] = await Promise.all([
          api.post('/api/reports/summary'),
          api.post('/api/finance/monthly'),
          api.post('/api/crm/customers'),
          api.post('/api/inventory'),
          api.post('/api/production'),
        ]);
        if (!alive) return;
        setSummary(sumRes.data.data || {});
        setMonthly(monRes.data.data || []);
        setCustomers(custRes.data.data || []);
        setInventory(invRes.data.data || []);
        setProduction(prodRes.data.data || []);
      } catch (e) {
        console.error('Reports load error:', e);
        if (alive) setError(e?.message || 'Veri yüklenemedi');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filteredMonthly = useMemo(() => {
    const cfg = DATE_RANGES.find(r => r.id === range);
    if (!cfg || cfg.id === 'all') return monthly;
    return monthly.slice(-cfg.months);
  }, [monthly, range]);

  const chartData = useMemo(() =>
    filteredMonthly.map(m => ({
      label: m.MONTH?.slice(5) || '',
      income: m.INCOME || 0,
      expense: m.EXPENSE || 0,
      profit: m.PROFIT || 0,
    })), [filteredMonthly]);

  const kpi = useMemo(() => {
    const totalIncome = filteredMonthly.reduce((s, m) => s + (m.INCOME || 0), 0);
    const totalExpense = filteredMonthly.reduce((s, m) => s + (m.EXPENSE || 0), 0);
    const totalProfit = totalIncome - totalExpense;
    const margin = totalIncome ? ((totalProfit / totalIncome) * 100).toFixed(1) : 0;
    return { totalIncome, totalExpense, totalProfit, margin };
  }, [filteredMonthly]);

  // Segment donut data
  const segmentData = useMemo(() => {
    const segments = { vip: 0, regular: 0, new: 0 };
    customers.forEach(c => { segments[c.SEGMENT] = (segments[c.SEGMENT] || 0) + 1; });
    return [
      { label: 'VIP', value: segments.vip, color: COLORS.warning },
      { label: 'Standart', value: segments.regular, color: COLORS.info },
      { label: 'Yeni', value: segments.new, color: COLORS.success },
    ].filter(s => s.value > 0);
  }, [customers]);

  // Production status data
  const productionData = useMemo(() => {
    const byStatus = {};
    production.forEach(p => { byStatus[p.STATUS] = (byStatus[p.STATUS] || 0) + 1; });
    const LABELS = {
      design: { label: 'Tasarım', color: COLORS.purple },
      cutting: { label: 'Kesim', color: COLORS.info },
      sewing: { label: 'Dikim', color: COLORS.warning },
      quality: { label: 'Kalite', color: COLORS.success },
      packaging: { label: 'Paket', color: COLORS.primary },
      shipping: { label: 'Sevk', color: '#06b6d4' },
    };
    return Object.entries(byStatus).map(([k, v]) => ({
      label: LABELS[k]?.label || k,
      value: v,
      color: LABELS[k]?.color || COLORS.textLight
    }));
  }, [production]);

  // Top customers list
  const topCustomers = useMemo(() =>
    [...customers]
      .sort((a, b) => b.TOTAL_REVENUE - a.TOTAL_REVENUE)
      .slice(0, 5)
      .map(c => ({
        label: c.NAME,
        sub: `${c.TOTAL_ORDERS} sipariş`,
        value: c.TOTAL_REVENUE,
      })),
    [customers]);

  // Top inventory categories
  const topCategories = useMemo(() => {
    const byCategory = {};
    inventory.forEach(i => {
      byCategory[i.CATEGORY] = (byCategory[i.CATEGORY] || 0) + (i.STOCK * (i.UNIT_PRICE || 0));
    });
    return Object.entries(byCategory)
      .map(([label, value]) => ({ label, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [inventory]);

  // Critical inventory
  const criticalStock = useMemo(() =>
    inventory.filter(i => i.STATUS === 'critical').slice(0, 6),
    [inventory]);

  // CSV Export
  const exportCsv = () => {
    const headers = ['Ay', 'Gelir', 'Gider', 'Kâr', 'Kâr Marjı %'];
    const rows = filteredMonthly.map(m => [
      m.MONTH,
      m.INCOME,
      m.EXPENSE,
      m.PROFIT,
      m.INCOME ? ((m.PROFIT / m.INCOME) * 100).toFixed(1) : 0
    ]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kom-rapor-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Rapor indirildi');
  };

  if (loading) {
    return (
      <PageShell title="Raporlar" icon={PieChart}>
        <div style={{ padding: 100, textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: `3px solid #f1f5f9`, borderTopColor: COLORS.primary,
            margin: '0 auto 16px', animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{ fontSize: 13, color: COLORS.textMuted, margin: 0, fontWeight: 500 }}>Veriler yükleniyor</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </PageShell>
    );
  }

  if (error || !summary) {
    return (
      <PageShell title="Raporlar" icon={PieChart}>
        <Card style={{ padding: 60, textAlign: 'center' }}>
          <AlertCircle size={36} color={COLORS.danger} style={{ margin: '0 auto 12px' }} />
          <p style={{ fontSize: 14, color: COLORS.danger, fontWeight: 700, margin: 0 }}>Veriler yüklenemedi</p>
          <p style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>{error}</p>
        </Card>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Raporlar"
      subtitle="İş performansı ve analiz merkezi"
      icon={PieChart}
      actions={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{
            display: 'flex', background: '#fff',
            border: `1px solid ${COLORS.border}`, borderRadius: 10,
            padding: 4
          }}>
            {DATE_RANGES.map(r => (
              <button
                key={r.id}
                onClick={() => setRange(r.id)}
                style={{
                  padding: '7px 14px', borderRadius: 7,
                  border: 'none', cursor: 'pointer',
                  fontSize: 12, fontWeight: 700,
                  background: range === r.id ? COLORS.text : 'transparent',
                  color: range === r.id ? '#fff' : COLORS.textMuted,
                  transition: 'all 0.2s'
                }}
              >
                {r.label}
              </button>
            ))}
          </div>
          <Btn icon={Download} onClick={exportCsv}>Dışa Aktar</Btn>
        </div>
      }
    >
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        background: '#fff',
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 4,
        marginBottom: 24,
        width: 'fit-content'
      }}>
        {TABS.map(t => {
          const TIcon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 8,
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 700,
                background: active ? COLORS.text : 'transparent',
                color: active ? '#fff' : COLORS.textMuted,
                transition: 'all 0.2s'
              }}
            >
              <TIcon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* ════════════ GENEL BAKIŞ ════════════ */}
      {tab === 'overview' && (
        <motion.div key="overview" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* 4 ana metrik */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <MetricCard
              label="Toplam Gelir"
              value={fmtMoney(kpi.totalIncome)}
              delta="+12.4%"
              trend="up"
              accentColor={COLORS.success}
            />
            <MetricCard
              label="Toplam Gider"
              value={fmtMoney(kpi.totalExpense)}
              delta="+5.1%"
              trend="up"
              accentColor={COLORS.danger}
            />
            <MetricCard
              label="Net Kâr"
              value={fmtMoney(kpi.totalProfit)}
              delta="+18.2%"
              trend="up"
              accentColor={COLORS.primary}
            />
            <MetricCard
              label="Kâr Marjı"
              value={`${kpi.margin}%`}
              delta="+2.3%"
              trend="up"
              accentColor={COLORS.purple}
            />
          </div>

          {/* Ana trend grafiği - iki kolonlu */}
          <Card style={{ padding: 28, marginBottom: 24 }}>
            <SectionHeader
              title="Finansal Trend"
              subtitle={`${DATE_RANGES.find(r => r.id === range)?.label} · Gelir, gider ve kâr akışı`}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32, alignItems: 'center' }}>
              <LineChart
                data={chartData}
                series={[
                  { key: 'income', label: 'Gelir', color: COLORS.success },
                  { key: 'expense', label: 'Gider', color: COLORS.danger },
                  { key: 'profit', label: 'Kâr', color: COLORS.primary },
                ]}
                height={240}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {(() => {
                  const best = filteredMonthly.reduce((a, b) => (b.PROFIT > (a?.PROFIT || -Infinity) ? b : a), null);
                  const worst = filteredMonthly.reduce((a, b) => (b.PROFIT < (a?.PROFIT || Infinity) ? b : a), null);
                  const avgProfit = filteredMonthly.length ? Math.round(kpi.totalProfit / filteredMonthly.length) : 0;
                  return (
                    <>
                      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>En Yüksek Ay</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.success, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(best?.PROFIT || 0)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{best?.MONTH || '—'}</p>
                      </div>
                      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>En Düşük Ay</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.danger, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(worst?.PROFIT || 0)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{worst?.MONTH || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aylık Ortalama Kâr</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(avgProfit)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{filteredMonthly.length} ay üzerinden</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>

          {/* Alt bilgi satırı */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <Card style={{ padding: 28 }}>
              <SectionHeader title="En İyi Müşteriler" subtitle="Ciroya göre sıralanmış ilk 5" />
              <HorizontalBarList items={topCustomers} color={COLORS.primary} />
            </Card>
            <Card style={{ padding: 28 }}>
              <SectionHeader title="Hızlı Bakış" subtitle="Anahtar operasyonel metrikler" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <CompactStat label="Aktif Üretim" value={summary.production?.active || 0} />
                <CompactStat label="Personel" value={summary.hr?.employees || 0} />
                <CompactStat label="Verimlilik" value={`${summary.production?.efficiency || 0}%`} color={COLORS.success} />
                <CompactStat label="Kritik Stok" value={summary.inventory?.critical || 0} color={COLORS.danger} />
                <CompactStat label="Müşteri" value={customers.length} />
                <CompactStat label="Memnuniyet" value={`${summary.hr?.avgPerformance || 0}%`} color={COLORS.primary} />
              </div>
            </Card>
          </div>
        </motion.div>
      )}

      {/* ════════════ SATIŞ ════════════ */}
      {tab === 'sales' && (
        <motion.div key="sales" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 24 }}>
            {/* Hero - Satış özeti */}
            <Card style={{
              padding: 32,
              background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 100%)`,
              border: 'none', color: '#fff',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: -80, right: -80,
                width: 280, height: 280,
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '50%'
              }} />
              <div style={{ position: 'relative' }}>
                <p style={{
                  fontSize: 11, fontWeight: 700, margin: 0,
                  color: 'rgba(255,255,255,0.8)',
                  letterSpacing: 1.5, textTransform: 'uppercase'
                }}>Toplam Satış · {DATE_RANGES.find(r => r.id === range)?.label}</p>
                <h2 style={{
                  fontSize: 44, fontWeight: 800, margin: '10px 0 4px',
                  color: '#fff', letterSpacing: -1.5,
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  {fmtMoney(kpi.totalIncome)}
                </h2>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 700, color: '#fff', background: 'rgba(255,255,255,0.18)', padding: '6px 12px', borderRadius: 100 }}>
                  <ArrowUp size={13} />
                  +{summary.sales?.growth || 0}% büyüme
                </div>

                <div style={{ display: 'flex', gap: 40, marginTop: 32 }}>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Sipariş</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{summary.sales?.orders || 0}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Müşteri</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>{customers.length}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: 0, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Ort. Sipariş</p>
                    <p style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>
                      {fmtMoney(summary.sales?.orders ? Math.round(kpi.totalIncome / summary.sales.orders) : 0)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Hedef dairesi */}
            <Card style={{ padding: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <ProgressRing
                value={kpi.totalIncome}
                max={2500000}
                label="YILLIK HEDEFE ULAŞIM"
                size={160}
                color={COLORS.primary}
              />
              <div style={{ marginTop: 20, textAlign: 'center' }}>
                <p style={{ fontSize: 12, color: COLORS.textMuted, margin: 0 }}>Hedef</p>
                <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, margin: '4px 0 0' }}>{fmtMoney(2500000)}</p>
              </div>
            </Card>
          </div>

          {/* Satış Trendi */}
          <Card style={{ padding: 28, marginBottom: 24 }}>
            <SectionHeader
              title="Satış Trendi"
              subtitle="Aylık gelir gelişimi"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32, alignItems: 'center' }}>
              <LineChart
                data={chartData}
                series={[{ key: 'income', label: 'Gelir', color: COLORS.primary }]}
                height={220}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {(() => {
                  const best = filteredMonthly.reduce((a, b) => (b.INCOME > (a?.INCOME || -Infinity) ? b : a), null);
                  const worst = filteredMonthly.reduce((a, b) => (b.INCOME < (a?.INCOME || Infinity) ? b : a), null);
                  const avg = filteredMonthly.length ? Math.round(kpi.totalIncome / filteredMonthly.length) : 0;
                  return (
                    <>
                      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Rekor Ay</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(best?.INCOME || 0)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{best?.MONTH || '—'}</p>
                      </div>
                      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>En Düşük Ay</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(worst?.INCOME || 0)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{worst?.MONTH || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aylık Ortalama</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(avg)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{filteredMonthly.length} ay üzerinden</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>

          {/* İki sütunlu alt bilgi */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
            <Card style={{ padding: 28 }}>
              <SectionHeader
                title="En İyi Müşteriler"
                subtitle="Ciroya göre sıralanmış ilk 5"
              />
              <HorizontalBarList items={topCustomers} color={COLORS.primary} />
            </Card>

            <Card style={{ padding: 28 }}>
              <SectionHeader
                title="Müşteri Segmentleri"
                subtitle={`Toplam ${customers.length} müşteri`}
              />
              <DonutChart
                data={segmentData}
                centerLabel="MÜŞTERİ"
                centerValue={customers.length}
              />
            </Card>
          </div>
        </motion.div>
      )}

      {/* ════════════ FİNANS ════════════ */}
      {tab === 'finance' && (
        <motion.div key="finance" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* 3 büyük metrik */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
            <MetricCard
              label="Toplam Gelir"
              value={fmtMoney(kpi.totalIncome)}
              delta="+12.4%"
              trend="up"
              accentColor={COLORS.success}
            />
            <MetricCard
              label="Toplam Gider"
              value={fmtMoney(kpi.totalExpense)}
              delta="+5.1%"
              trend="up"
              accentColor={COLORS.danger}
            />
            <MetricCard
              label="Net Kâr"
              value={fmtMoney(kpi.totalProfit)}
              delta="+18.2%"
              trend="up"
              accentColor={COLORS.primary}
            />
          </div>

          {/* Bar chart - aylık karşılaştırma */}
          <Card style={{ padding: 28, marginBottom: 24 }}>
            <SectionHeader
              title="Aylık Gelir & Gider Karşılaştırması"
              subtitle="İki metriği yan yana görün"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32, alignItems: 'center' }}>
              <ColumnChart
                data={chartData}
                series={[
                  { key: 'income', label: 'Gelir', color: COLORS.success },
                  { key: 'expense', label: 'Gider', color: COLORS.danger },
                ]}
                height={220}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dönem Toplam Gelir</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.success, margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(kpi.totalIncome)}</p>
                </div>
                <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Dönem Toplam Gider</p>
                  <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.danger, margin: '6px 0 0', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(kpi.totalExpense)}</p>
                </div>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Fark (Net Kâr)</p>
                  <p style={{ fontSize: 22, fontWeight: 800, color: COLORS.primary, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(kpi.totalProfit)}</p>
                  <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>Kâr marjı: {kpi.margin}%</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Kâr Trendi - tam genişlik, sol grafik + sağ insight'lar */}
          <Card style={{ padding: 28, marginBottom: 24 }}>
            <SectionHeader
              title="Kâr Trendi"
              subtitle="Aylık net kâr gelişimi"
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32, alignItems: 'center' }}>
              <LineChart
                data={chartData}
                series={[{ key: 'profit', label: 'Kâr', color: COLORS.primary }]}
                height={220}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                {(() => {
                  const best = filteredMonthly.reduce((a, b) => (b.PROFIT > (a?.PROFIT || -Infinity) ? b : a), null);
                  const worst = filteredMonthly.reduce((a, b) => (b.PROFIT < (a?.PROFIT || Infinity) ? b : a), null);
                  const avg = filteredMonthly.length ? Math.round(kpi.totalProfit / filteredMonthly.length) : 0;
                  return (
                    <>
                      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>En Kârlı Ay</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.primary, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(best?.PROFIT || 0)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{best?.MONTH || '—'}</p>
                      </div>
                      <div style={{ paddingBottom: 16, borderBottom: `1px solid ${COLORS.border}` }}>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>En Düşük Ay</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(worst?.PROFIT || 0)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{worst?.MONTH || '—'}</p>
                      </div>
                      <div>
                        <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Aylık Ortalama</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: COLORS.text, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(avg)}</p>
                        <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>{filteredMonthly.length} ay üzerinden</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </Card>

          {/* Hedefler - tam genişlik, yatay 2 ring */}
          <Card style={{ padding: 28 }}>
            <SectionHeader title="Dönem Hedefleri" subtitle="Yıl sonu projeksiyonuna göre ilerleme" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 24,
                padding: 20, borderRadius: 12,
                background: '#fafafa', border: `1px solid ${COLORS.border}`
              }}>
                <ProgressRing
                  value={kpi.totalProfit}
                  max={800000}
                  label=""
                  color={COLORS.primary}
                  size={110}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Kâr Hedefi</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{fmtMoney(kpi.totalProfit)}</p>
                  <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>Hedef: {fmtMoney(800000)}</p>
                </div>
              </div>

              <div style={{
                display: 'flex', alignItems: 'center', gap: 24,
                padding: 20, borderRadius: 12,
                background: '#fafafa', border: `1px solid ${COLORS.border}`
              }}>
                <ProgressRing
                  value={Number(kpi.margin)}
                  max={30}
                  label=""
                  color={COLORS.purple}
                  size={110}
                />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: COLORS.textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>Marj Hedefi</p>
                  <p style={{ fontSize: 20, fontWeight: 800, color: COLORS.text, margin: '6px 0 2px', fontVariantNumeric: 'tabular-nums' }}>{kpi.margin}%</p>
                  <p style={{ fontSize: 11, color: COLORS.textLight, margin: 0, fontWeight: 500 }}>Hedef: 30%</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      )}

      {/* ════════════ OPERASYON ════════════ */}
      {tab === 'operations' && (
        <motion.div key="ops" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Operasyon metrikleri */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <MetricCard
              label="Aktif Üretim"
              value={production.length}
              accentColor={COLORS.primary}
            />
            <MetricCard
              label="Verimlilik"
              value={`${summary.production?.efficiency || 0}%`}
              delta="+2.4%"
              trend="up"
              accentColor={COLORS.success}
            />
            <MetricCard
              label="Stok Değeri"
              value={fmtMoney(summary.inventory?.value || 0)}
              accentColor={COLORS.purple}
            />
            <MetricCard
              label="Kritik Stok"
              value={summary.inventory?.critical || 0}
              accentColor={COLORS.danger}
            />
          </div>

          {/* Üretim dağılımı + kategori */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <Card style={{ padding: 28 }}>
              <SectionHeader
                title="Üretim Akışı"
                subtitle="Aşamalara göre iş dağılımı"
              />
              <DonutChart
                data={productionData}
                centerLabel="TOPLAM İŞ"
                centerValue={production.length}
              />
            </Card>

            <Card style={{ padding: 28 }}>
              <SectionHeader
                title="Envanter Kategorileri"
                subtitle="Kategoriye göre stok değeri"
              />
              <HorizontalBarList
                items={topCategories}
                color={COLORS.purple}
              />
            </Card>
          </div>

          {/* Kritik stok uyarıları */}
          {criticalStock.length > 0 && (
            <Card style={{ padding: 28 }}>
              <SectionHeader
                title="Kritik Stok Uyarıları"
                subtitle={`${criticalStock.length} ürün minimum seviyenin altında`}
                right={
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontSize: 11, fontWeight: 700,
                    color: COLORS.danger,
                    background: '#fee2e2',
                    padding: '5px 10px', borderRadius: 100
                  }}>
                    <AlertCircle size={11} />
                    Acil
                  </div>
                }
              />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                {criticalStock.map(item => (
                  <div key={item.ID} style={{
                    padding: 16, borderRadius: 12,
                    background: '#fef2f2',
                    border: '1px solid #fecaca'
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: COLORS.textLight, margin: 0, fontFamily: 'system-ui' }}>{item.CODE}</p>
                    <p style={{ fontSize: 14, fontWeight: 700, color: COLORS.text, margin: '6px 0 8px' }}>{item.NAME}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 600 }}>
                      <span style={{ color: COLORS.danger }}>{item.STOCK} {item.UNIT}</span>
                      <span style={{ color: COLORS.textMuted }}>Min: {item.MIN_STOCK}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}
    </PageShell>
  );
};

export default Reports;
