import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Gavel, FileCheck, Package, LogOut, Truck, User, MessageCircle, FileText, Wallet, Award, Bell, ShoppingBag, FileSignature } from 'lucide-react';

const SupplierLayout = () => {
  const navigate = useNavigate();
  const user = (() => { const u = localStorage.getItem('kom_supplier_user'); return u ? JSON.parse(u) : null; })();

  const handleLogout = () => {
    localStorage.removeItem('kom_supplier_token');
    localStorage.removeItem('kom_supplier_user');
    navigate('/tedarikci');
  };

  const navItems = [
    { to: '/tedarikci/panel', label: 'Panel', icon: LayoutDashboard },
    { to: '/tedarikci/ihaleler', label: 'Açık İhaleler', icon: Gavel },
    { to: '/tedarikci/tekliflerim', label: 'Tekliflerim', icon: FileCheck },
    { to: '/tedarikci/siparislerim', label: 'Siparişlerim', icon: Package },
    { to: '/tedarikci/teslimat', label: 'Teslimat Takibi', icon: Truck },
    { to: '/tedarikci/faturalar', label: 'Fatura & Ödeme', icon: Wallet },
    { to: '/tedarikci/katalog', label: 'Ürün Kataloğum', icon: ShoppingBag },
    { to: '/tedarikci/mesajlar', label: 'Mesajlar', icon: MessageCircle },
    { to: '/tedarikci/dokumanlar', label: 'Dökümanlar', icon: FileText },
    { to: '/tedarikci/sozlesmeler', label: 'Sözleşmeler', icon: FileSignature },
    { to: '/tedarikci/performans', label: 'Performans', icon: Award },
    { to: '/tedarikci/bildirimler', label: 'Bildirimler', icon: Bell },
    { to: '/tedarikci/profil', label: 'Profilim', icon: User },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc' }}>
      <aside style={{
        width: 260, background: '#fff', borderRight: '1px solid #e2e8f0',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
      }}>
        {/* Logo */}
        <div style={{ padding: '22px 20px 18px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12,
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 6px 18px rgba(59,130,246,0.3)'
          }}>
            <Truck size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#0f172a', margin: 0, fontWeight: 800, letterSpacing: 0.3 }}>TEDARİKÇİ</p>
            <p style={{ fontSize: 10, color: '#94a3b8', margin: 0, fontWeight: 500 }}>KOM Portalı</p>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10,
                textDecoration: 'none', marginBottom: 4,
                color: isActive ? '#3b82f6' : '#64748b',
                background: isActive ? '#eff6ff' : 'transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: 13, transition: 'all 0.15s',
                position: 'relative',
              })}>
              {({ isActive }) => (
                <>
                  {isActive && <span style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: '#3b82f6' }} />}
                  <item.icon size={15} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: 14, borderTop: '1px solid #f1f5f9' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 12, background: '#f8fafc',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              color: '#fff', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: 13, fontWeight: 700
            }}>
              {user?.firm?.[0] || 'T'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.firm || 'Tedarikçi'}</p>
              <p style={{ fontSize: 10, color: '#94a3b8', margin: 0 }}>{user?.name || ''}</p>
            </div>
            <button onClick={handleLogout} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6, borderRadius: 8, display: 'flex' }} title="Çıkış">
              <LogOut size={16} color="#94a3b8" />
            </button>
          </div>
        </div>
      </aside>

      <main style={{ marginLeft: 260, flex: 1, minHeight: '100vh' }}>
        <Outlet />
      </main>
    </div>
  );
};

export default SupplierLayout;
