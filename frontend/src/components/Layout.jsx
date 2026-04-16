import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  BarChart3, Package, Plus, Users, LogOut,
  Users2, FileText, Factory, Boxes, PieChart,
  Wallet, UserCircle, ShoppingBag, ShieldCheck,
  Bell, Sparkles, Store, ChevronDown, ChevronRight,
  Search, ClipboardList, Send, Gavel, Brain, Target
} from 'lucide-react';
import { logout, getUser } from '../api.js';

const Layout = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [openGroups, setOpenGroups] = useState({
    operasyon: true,
    ticaret: true,
    uretim: true,
    finans: false,
    yonetim: false,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleGroup = (key) => setOpenGroups(p => ({ ...p, [key]: !p[key] }));

  const groups = [
    {
      key: 'operasyon',
      label: 'Operasyon',
      items: [
        { to: '/app/dashboard', label: 'Analiz Merkezi', icon: BarChart3 },
        { to: '/app/akilli-ongorular', label: 'Akıllı Öngörüler', icon: Brain },
        { to: '/app/hedefler', label: 'Hedef & Planlama', icon: Target },
        { to: '/app/talep-ac', label: 'Talep Aç', icon: Send },
        { to: '/app/talepler', label: 'Talepler', icon: ClipboardList },
        { to: '/app/raporlar', label: 'Raporlar', icon: PieChart },
        { to: '/app/gorevler', label: 'Bildirimler & Görevler', icon: Bell },
      ],
    },
    {
      key: 'ticaret',
      label: 'Ticaret & Satış',
      items: [
        { to: '/app/yeni-siparis', label: 'Yeni Sipariş', icon: Plus },
        { to: '/app/siparisler', label: 'Siparişler', icon: Package },
        { to: '/app/teklifler', label: 'Teklifler', icon: FileText },
        { to: '/app/musteriler', label: 'Müşteriler (CRM)', icon: UserCircle },
        { to: '/app/tedarikciler', label: 'Tedarikçiler', icon: Users },
        { to: '/app/ihaleler', label: 'İhale & Satın Alma', icon: Gavel },
      ],
    },
    {
      key: 'uretim',
      label: 'Üretim & Ürün',
      items: [
        { to: '/app/uretim', label: 'Üretim Takibi', icon: Factory },
        { to: '/app/urunler', label: 'Ürün Kataloğu', icon: ShoppingBag },
        { to: '/app/stok', label: 'Stok & Envanter', icon: Boxes },
        { to: '/app/kalite', label: 'Kalite Kontrol', icon: ShieldCheck },
        { to: '/app/koleksiyon', label: 'Sezon & Koleksiyon', icon: Sparkles },
      ],
    },
    {
      key: 'finans',
      label: 'Finans',
      items: [
        { to: '/app/finans', label: 'Finans / Muhasebe', icon: Wallet },
      ],
    },
    {
      key: 'yonetim',
      label: 'Yönetim',
      items: [
        { to: '/app/insan-kaynaklari', label: 'İnsan Kaynakları', icon: Users2 },
        { to: '/app/magazalar', label: 'Mağaza & Lokasyon', icon: Store },
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f5f6f8' }}>
      {/* Sidebar */}
      <aside style={{
        width: 270, background: '#fff', borderRight: '1px solid #eef0f3',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #E81E25, #b91c1c)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 16, fontWeight: 800, letterSpacing: -0.5,
            boxShadow: '0 6px 18px rgba(232,30,37,0.25)'
          }}>
            KOM
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#1a1a1a', margin: 0, fontWeight: 800, letterSpacing: 0.3 }}>MAYO & TEKSTİL</p>
            <p style={{ fontSize: 10, color: '#9ca3af', margin: 0, fontWeight: 500 }}>İş Ortağı Portalı</p>
          </div>
        </div>

        {/* Search */}
        <div style={{ padding: '14px 16px 6px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '9px 12px', borderRadius: 10,
            background: '#f5f6f8', border: '1px solid #eef0f3'
          }}>
            <Search size={14} color="#9ca3af" />
            <input
              placeholder="Ara..."
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 12, flex: 1, color: '#374151'
              }}
            />
            <span style={{ fontSize: 10, color: '#9ca3af', background: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid #e5e7eb' }}>⌘K</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '8px 12px 16px', overflowY: 'auto' }}>
          {groups.map(group => (
            <div key={group.key} style={{ marginBottom: 6 }}>
              <button
                onClick={() => toggleGroup(group.key)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', padding: '10px 12px 6px',
                  border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: 10, fontWeight: 700, color: '#9ca3af',
                  letterSpacing: 1.2, textTransform: 'uppercase'
                }}
              >
                <span>{group.label}</span>
                {openGroups[group.key] ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              </button>
              {openGroups[group.key] && group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10,
                    textDecoration: 'none', marginBottom: 2,
                    color: isActive ? '#E81E25' : '#4b5563',
                    background: isActive ? '#fef2f2' : 'transparent',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: 13, transition: 'all 0.15s',
                    position: 'relative',
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span style={{
                          position: 'absolute', left: 0, top: 8, bottom: 8,
                          width: 3, borderRadius: 2, background: '#E81E25'
                        }} />
                      )}
                      <item.icon size={15} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: 14, borderTop: '1px solid #f3f4f6' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, background: '#fafafa',
            border: '1px solid #f3f4f6'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #E81E25, #b91c1c)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700,
              boxShadow: '0 4px 10px rgba(232,30,37,0.25)'
            }}>
              {user?.name?.[0] || 'A'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', margin: 0 }}>{user?.name || 'Admin'} {user?.surname || ''}</p>
              <p style={{ fontSize: 10, color: '#9ca3af', margin: 0 }}>Süper Admin</p>
            </div>
            <button
              onClick={handleLogout}
              style={{
                border: 'none', background: 'none', cursor: 'pointer',
                padding: 6, borderRadius: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center'
              }}
              title="Çıkış"
            >
              <LogOut size={16} color="#9ca3af" />
            </button>
          </div>
        </div>
      </aside>

      {/* Content */}
      <main style={{ marginLeft: 270, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
