import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './api.js';

import Login from './pages/Login/index.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard/index.jsx';
import Orders from './pages/Orders/index.jsx';
import CreateOrder from './pages/CreateOrder/index.jsx';
import Suppliers from './pages/Suppliers/index.jsx';
import HR from './pages/HR/index.jsx';
import Quotes from './pages/Quotes/index.jsx';
import Production from './pages/Production/index.jsx';
import Inventory from './pages/Inventory/index.jsx';
import Reports from './pages/Reports/index.jsx';
import Finance from './pages/Finance/index.jsx';
import CRM from './pages/CRM/index.jsx';
import Products from './pages/Products/index.jsx';
import Quality from './pages/Quality/index.jsx';
import Tasks from './pages/Tasks/index.jsx';
import Collections from './pages/Collections/index.jsx';
import Stores from './pages/Stores/index.jsx';
import Requests from './pages/Requests/index.jsx';
import CreateRequest from './pages/CreateRequest/index.jsx';
import Tenders from './pages/Tenders/index.jsx';
import Forecast from './pages/Forecast/index.jsx';
import Targets from './pages/Targets/index.jsx';
import SupplierLogin from './pages/SupplierLogin/index.jsx';
import SupplierLayout from './components/SupplierLayout.jsx';
import SupplierDashboard from './pages/SupplierDashboard/index.jsx';
import SupplierTenders from './pages/SupplierTenders/index.jsx';
import SupplierMyBids from './pages/SupplierMyBids/index.jsx';
import SupplierOrders from './pages/SupplierOrders/index.jsx';
import SupplierProfile from './pages/SupplierProfile/index.jsx';
import SupplierMessages from './pages/SupplierMessages/index.jsx';
import SupplierDocuments from './pages/SupplierDocuments/index.jsx';
import SupplierInvoices from './pages/SupplierInvoices/index.jsx';
import SupplierPerformance from './pages/SupplierPerformance/index.jsx';
import SupplierNotifications from './pages/SupplierNotifications/index.jsx';
import SupplierCatalog from './pages/SupplierCatalog/index.jsx';
import SupplierDeliveries from './pages/SupplierDeliveries/index.jsx';
import SupplierContracts from './pages/SupplierContracts/index.jsx';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  if (!isAuthenticated()) return <Navigate to="/" replace state={{ from: location }} />;
  return children;
};

const SupplierPrivateRoute = ({ children }) => {
  const location = useLocation();
  if (!localStorage.getItem('kom_supplier_token')) return <Navigate to="/tedarikci" replace state={{ from: location }} />;
  return children;
};

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/app" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="siparisler" element={<Orders />} />
        <Route path="yeni-siparis" element={<CreateOrder />} />
        <Route path="tedarikciler" element={<Suppliers />} />
        <Route path="insan-kaynaklari" element={<HR />} />
        <Route path="teklifler" element={<Quotes />} />
        <Route path="uretim" element={<Production />} />
        <Route path="stok" element={<Inventory />} />
        <Route path="raporlar" element={<Reports />} />
        <Route path="finans" element={<Finance />} />
        <Route path="musteriler" element={<CRM />} />
        <Route path="urunler" element={<Products />} />
        <Route path="kalite" element={<Quality />} />
        <Route path="gorevler" element={<Tasks />} />
        <Route path="koleksiyon" element={<Collections />} />
        <Route path="magazalar" element={<Stores />} />
        <Route path="talepler" element={<Requests />} />
        <Route path="talep-ac" element={<CreateRequest />} />
        <Route path="ihaleler" element={<Tenders />} />
        <Route path="akilli-ongorular" element={<Forecast />} />
        <Route path="hedefler" element={<Targets />} />
      </Route>
      {/* Tedarikçi Portalı */}
      <Route path="/tedarikci" element={<SupplierLogin />} />
      <Route path="/tedarikci" element={<SupplierPrivateRoute><SupplierLayout /></SupplierPrivateRoute>}>
        <Route path="panel" element={<SupplierDashboard />} />
        <Route path="ihaleler" element={<SupplierTenders />} />
        <Route path="tekliflerim" element={<SupplierMyBids />} />
        <Route path="siparislerim" element={<SupplierOrders />} />
        <Route path="teslimat" element={<SupplierDeliveries />} />
        <Route path="faturalar" element={<SupplierInvoices />} />
        <Route path="katalog" element={<SupplierCatalog />} />
        <Route path="mesajlar" element={<SupplierMessages />} />
        <Route path="dokumanlar" element={<SupplierDocuments />} />
        <Route path="sozlesmeler" element={<SupplierContracts />} />
        <Route path="performans" element={<SupplierPerformance />} />
        <Route path="bildirimler" element={<SupplierNotifications />} />
        <Route path="profil" element={<SupplierProfile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
