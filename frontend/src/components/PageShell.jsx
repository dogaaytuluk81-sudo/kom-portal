import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';

export const fmtMoney = (v) => `₺${Number(v || 0).toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`;
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';

// ═══════════════════════════════════════════════════════
// Premium Dark Hero Layout
// ═══════════════════════════════════════════════════════
// Tema preset'leri — her sayfa grubu farklı bir dünya
export const HERO_THEMES = {
  // Varsayılan — genel koyu tema
  default: {
    pageBg: '#f8fafc',
    heroBg: 'linear-gradient(135deg, #0b1120 0%, #1e293b 55%, #334155 100%)',
    pattern: 'grid',
    glow: 'rgba(59,130,246,0.12)',
    accent: '#E81E25',
    labelColor: 'rgba(255,255,255,0.55)',
    subtitleColor: 'rgba(255,255,255,0.55)',
    titleColor: '#fff',
  },

  // TİCARET & SATIŞ — sofistike mor/mavi, iş mercekleri
  trade: {
    pageBg: '#fafaf9',
    heroBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
    pattern: 'dots',
    glow: 'rgba(251,191,36,0.18)',
    accent: '#fbbf24',
    labelColor: 'rgba(251,191,36,0.8)',
    subtitleColor: 'rgba(255,255,255,0.65)',
    titleColor: '#fff',
  },

  // ÜRETİM & ÜRÜN — endüstriyel, grafen/metal dokusu
  production: {
    pageBg: '#f5f5f4',
    heroBg: 'linear-gradient(135deg, #18181b 0%, #27272a 50%, #3f3f46 100%)',
    pattern: 'diagonal',
    glow: 'rgba(249,115,22,0.18)',
    accent: '#f97316',
    labelColor: 'rgba(249,115,22,0.85)',
    subtitleColor: 'rgba(255,255,255,0.55)',
    titleColor: '#fff',
  },

  // FİNANS — yeşil & zümrüt, para/değer
  finance: {
    pageBg: '#f0fdf4',
    heroBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 40%, #065f46 100%)',
    pattern: 'bills',
    glow: 'rgba(16,185,129,0.25)',
    accent: '#10b981',
    labelColor: 'rgba(110,231,183,0.9)',
    subtitleColor: 'rgba(209,250,229,0.55)',
    titleColor: '#ecfdf5',
  },

  // YÖNETİM (İK, Mağaza) — premium lacivert, kurumsal
  management: {
    pageBg: '#fafbfc',
    heroBg: 'linear-gradient(135deg, #0c0a09 0%, #1c1917 40%, #292524 100%)',
    pattern: 'luxury',
    glow: 'rgba(217,119,6,0.18)',
    accent: '#eab308',
    labelColor: 'rgba(250,204,21,0.8)',
    subtitleColor: 'rgba(255,255,255,0.55)',
    titleColor: '#fef3c7',
  },

  // OPERASYON (Talepler, Raporlar) — teknolojik cyan/electric
  operations: {
    pageBg: '#f8fafc',
    heroBg: 'linear-gradient(135deg, #0c4a6e 0%, #0369a1 40%, #0284c7 100%)',
    pattern: 'circuit',
    glow: 'rgba(34,211,238,0.2)',
    accent: '#22d3ee',
    labelColor: 'rgba(103,232,249,0.85)',
    subtitleColor: 'rgba(224,242,254,0.6)',
    titleColor: '#fff',
  },
};

// Pattern render fonksiyonu
const HeroPattern = ({ type }) => {
  if (type === 'grid') {
    return <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)',
      backgroundSize: '60px 60px', pointerEvents: 'none'
    }} />;
  }
  if (type === 'dots') {
    return <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1.5px)',
      backgroundSize: '28px 28px', pointerEvents: 'none'
    }} />;
  }
  if (type === 'diagonal') {
    return <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.025) 20px, rgba(255,255,255,0.025) 21px)',
      pointerEvents: 'none'
    }} />;
  }
  if (type === 'bills') {
    return <div style={{
      position: 'absolute', inset: 0,
      backgroundImage: 'repeating-linear-gradient(0deg, rgba(16,185,129,0.04) 0px, rgba(16,185,129,0.04) 1px, transparent 1px, transparent 40px)',
      pointerEvents: 'none'
    }} />;
  }
  if (type === 'luxury') {
    return <>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(135deg, rgba(234,179,8,0.05) 0%, transparent 50%, rgba(234,179,8,0.03) 100%)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'radial-gradient(ellipse at top, rgba(234,179,8,0.12), transparent 50%)',
        pointerEvents: 'none'
      }} />
    </>;
  }
  if (type === 'circuit') {
    return <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none' }}>
      <defs>
        <pattern id="circuit" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 10 10 L 40 10 L 40 40 L 70 40" stroke="#22d3ee" strokeWidth="0.5" fill="none" />
          <circle cx="10" cy="10" r="1.5" fill="#22d3ee" />
          <circle cx="40" cy="40" r="1.5" fill="#22d3ee" />
          <circle cx="70" cy="40" r="1.5" fill="#22d3ee" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#circuit)" />
    </svg>;
  }
  return null;
};

export const DarkHero = ({ icon: Icon, label, title, subtitle, accentColor, actions, stats, children, theme = 'default' }) => {
  const t = HERO_THEMES[theme] || HERO_THEMES.default;
  const accent = accentColor || t.accent;
  return (
  <div style={{ minHeight: '100vh', background: t.pageBg }}>
    <div style={{
      background: t.heroBg,
      padding: '40px 40px 100px', position: 'relative', overflow: 'hidden',
      borderBottom: '1px solid rgba(255,255,255,0.05)'
    }}>
      {/* Accent glow sağ üst */}
      <div style={{ position: 'absolute', top: -180, right: -100, width: 500, height: 500, background: `radial-gradient(circle, ${accent}30 0%, transparent 65%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      {/* İkincil glow sol alt */}
      <div style={{ position: 'absolute', bottom: -120, left: '20%', width: 380, height: 380, background: `radial-gradient(circle, ${t.glow} 0%, transparent 70%)`, borderRadius: '50%', pointerEvents: 'none' }} />
      {/* Pattern (her tema için farklı) */}
      <HeroPattern type={t.pattern} />

      <div style={{ position: 'relative', maxWidth: 1400, margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, gap: 24, flexWrap: 'wrap' }}
        >
          <div style={{ flex: 1, minWidth: 300 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              {Icon && (
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `linear-gradient(135deg, ${accent}33, ${accent}15)`,
                  border: `1px solid ${accent}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 0 22px ${accent}33`
                }}>
                  <Icon size={20} color={accent} />
                </div>
              )}
              {label && (
                <span style={{
                  fontSize: 11, fontWeight: 700,
                  color: t.labelColor,
                  letterSpacing: 2.5, textTransform: 'uppercase'
                }}>{label}</span>
              )}
            </div>
            <h1 style={{
              fontSize: 30, fontWeight: 800, color: t.titleColor, margin: 0,
              letterSpacing: -0.6, lineHeight: 1.15
            }}>{title}</h1>
            {subtitle && (
              <p style={{
                fontSize: 13.5, color: t.subtitleColor,
                margin: '8px 0 0', lineHeight: 1.5, maxWidth: 620
              }}>{subtitle}</p>
            )}
          </div>
          {actions && <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>{actions}</div>}
        </motion.div>

        {stats && stats.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: stats.length <= 2 ? `repeat(${stats.length}, minmax(240px, 1fr))` : `repeat(auto-fit, minmax(220px, 1fr))`,
            gap: 14
          }}>
            {stats.map((s, i) => (
              <GlassStat key={i} index={i} {...s} />
            ))}
          </div>
        )}
      </div>
    </div>

    <div style={{ maxWidth: 1400, margin: '-60px auto 0', padding: '0 40px 60px', position: 'relative' }}>
      {children}
    </div>
  </div>
  );
};

export const GlassStat = ({ label, value, sub, color = '#E81E25', tip, delta, trend, index = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    whileHover={{ y: -3, transition: { duration: 0.2 } }}
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 16, padding: '20px 22px',
      position: 'relative', overflow: 'hidden',
      cursor: 'default'
    }}
  >
    {/* Accent shine sol */}
    <div style={{
      position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
      background: `linear-gradient(180deg, ${color}, ${color}66)`
    }} />
    {/* Küçük glow üst sağ */}
    <div style={{
      position: 'absolute', top: -30, right: -30, width: 100, height: 100,
      background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
      borderRadius: '50%', pointerEvents: 'none'
    }} />

    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, gap: 8 }}>
        <p style={{
          fontSize: 10.5, color: 'rgba(255,255,255,0.5)',
          margin: 0, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 4
        }}>
          {label}
          {tip && <InfoTip text={tip} />}
        </p>
        {delta && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            fontSize: 10, fontWeight: 700,
            color: trend === 'down' ? '#fca5a5' : '#86efac',
            background: trend === 'down' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
            border: `1px solid ${trend === 'down' ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
            padding: '2px 7px', borderRadius: 100
          }}>
            {trend === 'down' ? '↓' : '↑'} {delta}
          </span>
        )}
      </div>
      <p style={{
        fontSize: 26, fontWeight: 800, color: '#fff',
        margin: 0, letterSpacing: -0.5, lineHeight: 1.1,
        fontVariantNumeric: 'tabular-nums'
      }}>{value}</p>
      {sub && (
        <p style={{
          fontSize: 11, color: 'rgba(255,255,255,0.4)',
          margin: '6px 0 0', fontWeight: 500, lineHeight: 1.4
        }}>{sub}</p>
      )}
    </div>
  </motion.div>
);

// Ortak filtre bar (hero altında overlay)
export const FilterBar = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    style={{
      background: '#fff', borderRadius: 16, padding: '14px 16px',
      boxShadow: '0 6px 28px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
      border: '1px solid #e2e8f0',
      display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap',
      marginBottom: 20
    }}
  >
    {children}
  </motion.div>
);

// Ortak arama inputu
export const SearchInput = ({ value, onChange, placeholder = 'Ara...' }) => {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{
      flex: 1, minWidth: 250, display: 'flex', alignItems: 'center', gap: 10,
      padding: '10px 14px', background: focused ? '#fff' : '#f8fafc',
      borderRadius: 10,
      border: `1.5px solid ${focused ? '#3b82f6' : '#e2e8f0'}`,
      transition: 'all 0.2s',
      boxShadow: focused ? '0 0 0 3px rgba(59,130,246,0.12)' : 'none'
    }}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={focused ? '#3b82f6' : '#94a3b8'} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: 13, flex: 1, color: '#0f172a' }} />
    </div>
  );
};

// Ortak pill filtre grubu
export const PillFilter = ({ value, onChange, options }) => (
  <div style={{ display: 'flex', gap: 3, background: '#f1f5f9', borderRadius: 10, padding: 4 }}>
    {options.map(o => {
      const active = value === o.id;
      return (
        <button key={o.id} onClick={() => onChange(o.id)} style={{
          padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
          fontSize: 11.5, fontWeight: 700,
          background: active ? (o.bg || '#fff') : 'transparent',
          color: active ? (o.color || '#0f172a') : '#64748b',
          boxShadow: active ? '0 1px 3px rgba(15,23,42,0.08)' : 'none',
          transition: 'all 0.2s',
          whiteSpace: 'nowrap'
        }}>{o.label}</button>
      );
    })}
  </div>
);

export const PageShell = ({ title, subtitle, icon: Icon, badge, actions, children }) => (
  <div style={{ padding: '32px 40px 60px', minHeight: '100vh', background: '#f5f6f8' }}>
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: 28, gap: 16, flexWrap: 'wrap'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {Icon && (
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #E81E25, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(232,30,37,0.25)',
          }}>
            <Icon size={24} color="#fff" />
          </div>
        )}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: '#111', margin: 0, letterSpacing: -0.5 }}>
              {title}
            </h1>
            {badge && (
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#E81E25',
                background: '#fef2f2', padding: '4px 10px', borderRadius: 100,
                border: '1px solid #fecaca'
              }}>{badge}</span>
            )}
          </div>
          {subtitle && <p style={{ fontSize: 13, color: '#6b7280', margin: '4px 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div style={{ display: 'flex', gap: 10 }}>{actions}</div>}
    </motion.div>
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      {children}
    </motion.div>
  </div>
);

export const Card = ({ children, style, ...props }) => (
  <div
    style={{
      background: '#fff', borderRadius: 16, padding: 20,
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.03)',
      ...style
    }}
    {...props}
  >
    {children}
  </div>
);

export const StatCard = ({ icon: Icon, label, value, delta, color = '#E81E25' }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: `${color}15`, display: 'flex',
        alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={18} color={color} />
      </div>
      {delta && (
        <span style={{
          fontSize: 11, fontWeight: 700,
          color: delta.startsWith('-') ? '#ef4444' : '#10b981',
          background: delta.startsWith('-') ? '#fee2e2' : '#d1fae5',
          padding: '3px 8px', borderRadius: 6
        }}>{delta}</span>
      )}
    </div>
    <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 4px', fontWeight: 600 }}>{label}</p>
    <p style={{ fontSize: 24, fontWeight: 800, color: '#111', margin: 0, letterSpacing: -0.5 }}>{value}</p>
  </Card>
);

export const Btn = ({ variant = 'primary', icon: Icon, children, disabled, ...props }) => {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #E81E25, #b91c1c)', color: '#fff', border: 'none',
      boxShadow: '0 6px 18px rgba(232,30,37,0.28), 0 2px 4px rgba(232,30,37,0.12)',
    },
    ghost: {
      background: '#fff', color: '#334155', border: '1px solid #e2e8f0',
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    },
    subtle: {
      background: '#f1f5f9', color: '#334155', border: '1px solid transparent',
    },
    dark: {
      background: 'linear-gradient(135deg, #0f172a, #1e293b)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)',
      boxShadow: '0 6px 18px rgba(15,23,42,0.25)',
    },
  };
  return (
    <button
      {...props}
      disabled={disabled}
      onMouseEnter={e => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(-1px)';
        if (variant === 'primary') e.currentTarget.style.boxShadow = '0 10px 28px rgba(232,30,37,0.38), 0 3px 6px rgba(232,30,37,0.18)';
        if (variant === 'ghost') { e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#fafafa'; }
        if (variant === 'subtle') e.currentTarget.style.background = '#e2e8f0';
      }}
      onMouseLeave={e => {
        if (disabled) return;
        e.currentTarget.style.transform = 'translateY(0)';
        if (variant === 'primary') e.currentTarget.style.boxShadow = styles.primary.boxShadow;
        if (variant === 'ghost') { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }
        if (variant === 'subtle') e.currentTarget.style.background = '#f1f5f9';
      }}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '10px 16px', borderRadius: 10,
        fontSize: 13, fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.2s',
        whiteSpace: 'nowrap',
        ...styles[variant],
        ...props.style
      }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════
// Modal, Form Field ve FormModal
// ═══════════════════════════════════════════════════════

export const Modal = ({ isOpen, onClose, title, subtitle, icon: Icon, children, wide }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{
          position: 'fixed', inset: 0, zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16
        }}
      >
        <div
          style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25 }}
          style={{
            position: 'relative', background: '#fff', borderRadius: 20,
            boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
            width: '100%', maxWidth: wide ? 900 : 560,
            maxHeight: '92vh', overflow: 'hidden',
            display: 'flex', flexDirection: 'column'
          }}
        >
          {/* Kırmızı gradient header */}
          <div style={{
            background: 'linear-gradient(135deg, #E81E25, #b91c1c)',
            padding: '22px 28px 22px 72px', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.08)', borderRadius: '50%' }} />
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: 18, left: 18, width: 34, height: 34, borderRadius: 10,
                border: 'none', background: 'rgba(255,255,255,0.15)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              <X size={16} color="#fff" />
            </button>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 14 }}>
              {Icon && (
                <div style={{
                  width: 46, height: 46, borderRadius: 12,
                  background: 'rgba(255,255,255,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(255,255,255,0.2)'
                }}>
                  <Icon size={22} color="#fff" />
                </div>
              )}
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.3 }}>{title}</h2>
                {subtitle && <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '3px 0 0' }}>{subtitle}</p>}
              </div>
            </div>
          </div>

          <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
            {children}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const FormField = ({ label, type = 'text', value, onChange, placeholder, options, required, span = 1, rows }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label style={{
      display: 'block', fontSize: 11, fontWeight: 700,
      color: '#374151', marginBottom: 6, letterSpacing: 0.3,
      textTransform: 'uppercase'
    }}>
      {label} {required && <span style={{ color: '#E81E25' }}>*</span>}
    </label>
    {type === 'select' ? (
      <select
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
          background: '#fff', cursor: 'pointer',
          transition: 'border 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#E81E25'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      >
        <option value="">Seçiniz...</option>
        {options?.map(o => (
          <option key={typeof o === 'object' ? o.value : o} value={typeof o === 'object' ? o.value : o}>
            {typeof o === 'object' ? o.label : o}
          </option>
        ))}
      </select>
    ) : type === 'textarea' ? (
      <textarea
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows || 3}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
          background: '#fff', resize: 'vertical', fontFamily: 'inherit',
          transition: 'border 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#E81E25'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    ) : (
      <input
        type={type}
        value={value || ''}
        onChange={e => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', padding: '11px 14px', borderRadius: 10,
          border: '1.5px solid #e5e7eb', fontSize: 13, outline: 'none',
          background: '#fff', transition: 'border 0.2s'
        }}
        onFocus={e => e.target.style.borderColor = '#E81E25'}
        onBlur={e => e.target.style.borderColor = '#e5e7eb'}
      />
    )}
  </div>
);

export const FormModal = ({ isOpen, onClose, title, subtitle, icon, onSubmit, submitLabel = 'Kaydet', children, wide, submitting }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} icon={icon} wide={wide}>
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
        {children}
      </div>
      <div style={{
        display: 'flex', gap: 10, justifyContent: 'flex-end',
        marginTop: 8, paddingTop: 16, borderTop: '1px solid #f3f4f6'
      }}>
        <Btn type="button" variant="ghost" onClick={onClose}>İptal</Btn>
        <Btn type="submit" disabled={submitting}>
          {submitting ? 'Kaydediliyor...' : submitLabel}
        </Btn>
      </div>
    </form>
  </Modal>
);

// Form içinde useState wrapper hook
export const useForm = (initial) => {
  const [form, setForm] = useState(initial);
  const setField = (key) => (val) => setForm(p => ({ ...p, [key]: val }));
  const reset = () => setForm(initial);
  return { form, setForm, setField, reset };
};

// ═══════════════════════════════════════════════════════
// Tarih Filtresi (her sayfa üstüne eklenir)
// ═══════════════════════════════════════════════════════
export const DATE_RANGE_OPTIONS = [
  { id: '7d', label: 'Son 7 Gün', days: 7 },
  { id: '30d', label: 'Son 30 Gün', days: 30 },
  { id: '3m', label: 'Son 3 Ay', days: 90 },
  { id: '6m', label: 'Son 6 Ay', days: 180 },
  { id: 'all', label: 'Tümü', days: 99999 },
];

export const DateFilter = ({ value, onChange, options, variant = 'dark' }) => {
  const opts = options || DATE_RANGE_OPTIONS;
  const isDark = variant === 'dark';
  return (
    <div style={{
      display: 'inline-flex',
      background: isDark ? 'rgba(255,255,255,0.08)' : '#fff',
      border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : '#e2e8f0'}`,
      borderRadius: 10, padding: 3,
      backdropFilter: isDark ? 'blur(12px)' : 'none',
      WebkitBackdropFilter: isDark ? 'blur(12px)' : 'none',
    }}>
      {opts.map(r => {
        const active = value === r.id;
        return (
          <button
            key={r.id}
            onClick={() => onChange(r.id)}
            style={{
              padding: '6px 12px', borderRadius: 7,
              border: 'none', cursor: 'pointer',
              fontSize: 11, fontWeight: 700,
              background: active ? (isDark ? '#fff' : '#0f172a') : 'transparent',
              color: active ? (isDark ? '#0f172a' : '#fff') : (isDark ? 'rgba(255,255,255,0.6)' : '#64748b'),
              transition: 'all 0.2s'
            }}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════
// Detay Modal (tıklanabilir kartlar için — geniş, çok alan)
// ═══════════════════════════════════════════════════════
export const DetailModal = ({ isOpen, onClose, title, subtitle, icon, children, wide = true }) => (
  <Modal isOpen={isOpen} onClose={onClose} title={title} subtitle={subtitle} icon={icon} wide={wide}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {children}
    </div>
  </Modal>
);

// Detay satırı helper
export const DetailRow = ({ label, value, color }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
    <span style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>{label}</span>
    <span style={{ fontSize: 13, fontWeight: 700, color: color || '#0f172a' }}>{value}</span>
  </div>
);

// Detay grid (iki sütunlu alanlar)
export const DetailGrid = ({ items }) => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
    {items.map((item, i) => (
      <div key={i} style={{
        padding: 14, borderRadius: 10,
        background: '#f8fafc', border: '1px solid #e2e8f0'
      }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', margin: 0, textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</p>
        <p style={{ fontSize: 16, fontWeight: 800, color: item.color || '#0f172a', margin: '6px 0 0' }}>{item.value}</p>
        {item.sub && <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{item.sub}</p>}
      </div>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════════
// Info Tooltip — yüzdeliklerin açıklaması
// ═══════════════════════════════════════════════════════
export const InfoTip = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <span
      style={{ position: 'relative', display: 'inline-flex', cursor: 'help', marginLeft: 4 }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span style={{
        width: 14, height: 14, borderRadius: '50%',
        background: '#e2e8f0', color: '#64748b',
        fontSize: 9, fontWeight: 800,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center'
      }}>?</span>
      {show && (
        <span style={{
          position: 'absolute', bottom: '100%', left: '50%',
          transform: 'translateX(-50%)', marginBottom: 6,
          background: '#0f172a', color: '#fff',
          fontSize: 11, fontWeight: 500, lineHeight: 1.5,
          padding: '8px 12px', borderRadius: 8,
          whiteSpace: 'nowrap', zIndex: 100,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}>
          {text}
        </span>
      )}
    </span>
  );
};

export const Badge = ({ tone = 'gray', children }) => {
  const tones = {
    gray: { bg: '#f3f4f6', fg: '#6b7280' },
    red: { bg: '#fee2e2', fg: '#dc2626' },
    green: { bg: '#d1fae5', fg: '#059669' },
    blue: { bg: '#dbeafe', fg: '#2563eb' },
    amber: { bg: '#fef3c7', fg: '#d97706' },
    purple: { bg: '#ede9fe', fg: '#7c3aed' },
    cyan: { bg: '#cffafe', fg: '#0891b2' },
  };
  const t = tones[tone] || tones.gray;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 700,
      color: t.fg, background: t.bg,
      padding: '3px 8px', borderRadius: 6
    }}>
      {children}
    </span>
  );
};
