import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// ═══ MOCK DATA ═══
const SUPPLIERS = [
  { ID: 1, NAME: 'KOM Tekstil A.Ş.', CONTACT_NAME: 'Ahmet Yılmaz', PHONE: '0212 555 10 10', EMAIL: 'ahmet@komtekstil.com', ADDRESS: 'Merter, İstanbul', CITY_NAME: 'İstanbul', TAX_OFFICE: 'Bakırköy', TAX_NUMBER: '1234567890' },
  { ID: 2, NAME: 'Akdeniz İplik San.', CONTACT_NAME: 'Mehmet Demir', PHONE: '0322 444 20 20', EMAIL: 'mehmet@akdeniziplik.com', ADDRESS: 'Seyhan, Adana', CITY_NAME: 'Adana', TAX_OFFICE: 'Seyhan', TAX_NUMBER: '2345678901' },
  { ID: 3, NAME: 'Ege Boya Kimya Ltd.', CONTACT_NAME: 'Ayşe Kaya', PHONE: '0232 333 30 30', EMAIL: 'ayse@egeboya.com', ADDRESS: 'Bornova, İzmir', CITY_NAME: 'İzmir', TAX_OFFICE: 'Bornova', TAX_NUMBER: '3456789012' },
  { ID: 4, NAME: 'Marmara Kumaş Tic.', CONTACT_NAME: 'Fatma Çelik', PHONE: '0224 222 40 40', EMAIL: 'fatma@marmarakumas.com', ADDRESS: 'Nilüfer, Bursa', CITY_NAME: 'Bursa', TAX_OFFICE: 'Nilüfer', TAX_NUMBER: '4567890123' },
  { ID: 5, NAME: 'Anadolu Aksesuar', CONTACT_NAME: 'Ali Özkan', PHONE: '0312 111 50 50', EMAIL: 'ali@anadoluaksesuar.com', ADDRESS: 'Çankaya, Ankara', CITY_NAME: 'Ankara', TAX_OFFICE: 'Çankaya', TAX_NUMBER: '5678901234' },
  { ID: 6, NAME: 'Trakya Ambalaj San.', CONTACT_NAME: 'Hasan Aydın', PHONE: '0284 666 60 60', EMAIL: 'hasan@trakyaambalaj.com', ADDRESS: 'Çerkezköy, Tekirdağ', CITY_NAME: 'Tekirdağ', TAX_OFFICE: 'Çerkezköy', TAX_NUMBER: '6789012345' },
  { ID: 7, NAME: 'İstanbul Lojistik', CONTACT_NAME: 'Emre Şahin', PHONE: '0216 777 70 70', EMAIL: 'emre@istanbullojistik.com', ADDRESS: 'Tuzla, İstanbul', CITY_NAME: 'İstanbul', TAX_OFFICE: 'Tuzla', TAX_NUMBER: '7890123456' },
  { ID: 8, NAME: 'Bursa Etiket Ltd.', CONTACT_NAME: 'Zeynep Arslan', PHONE: '0224 888 80 80', EMAIL: 'zeynep@bursaetiket.com', ADDRESS: 'Osmangazi, Bursa', CITY_NAME: 'Bursa', TAX_OFFICE: 'Osmangazi', TAX_NUMBER: '8901234567' },
];

const ORDERS = [
  { ID: 1, ORDER_NO: 'PO-20260407-0001', TITLE: 'Mayo Kumaş Siparişi - Yaz 2026', TOTAL_PRICE: 125000.00, CURRENCY: 'TRY', STATUS: 3, ORDER_DATE: '2026-04-07', DELIVERY_DATE: '2026-04-25', QUANTITY: 500, UNIT_PRICE: 250, SUPPLIER_NAME: 'KOM Tekstil A.Ş.', FIRM_NAME: 'Migros', CUSER_NAME: 'Admin', CUSER_SURNAME: '', DESCRIPTION: 'Yaz sezonu likralı mayo kumaşı' },
  { ID: 2, ORDER_NO: 'PO-20260405-0002', TITLE: 'Polyester İplik 500kg', TOTAL_PRICE: 87500.00, CURRENCY: 'TRY', STATUS: 4, ORDER_DATE: '2026-04-05', DELIVERY_DATE: '2026-04-15', QUANTITY: 500, UNIT_PRICE: 175, SUPPLIER_NAME: 'Akdeniz İplik San.', FIRM_NAME: 'LC Waikiki', CUSER_NAME: 'Admin', CUSER_SURNAME: '', DESCRIPTION: 'Yüksek kalite polyester iplik' },
  { ID: 3, ORDER_NO: 'PO-20260403-0003', TITLE: 'Boya ve Apre Malzemeleri', TOTAL_PRICE: 62300.00, CURRENCY: 'TRY', STATUS: 5, ORDER_DATE: '2026-04-03', DELIVERY_DATE: '2026-04-10', QUANTITY: 200, UNIT_PRICE: 311.5, SUPPLIER_NAME: 'Ege Boya Kimya Ltd.', FIRM_NAME: 'Koton', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 4, ORDER_NO: 'PO-20260401-0004', TITLE: 'Bikini Aksesuarları Seti', TOTAL_PRICE: 34200.00, CURRENCY: 'TRY', STATUS: 2, ORDER_DATE: '2026-04-01', DELIVERY_DATE: '2026-04-20', QUANTITY: 1000, UNIT_PRICE: 34.2, SUPPLIER_NAME: 'Anadolu Aksesuar', FIRM_NAME: 'DeFacto', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 5, ORDER_NO: 'PO-20260330-0005', TITLE: 'Pamuklu Kumaş 1000m', TOTAL_PRICE: 156000.00, CURRENCY: 'TRY', STATUS: 5, ORDER_DATE: '2026-03-30', DELIVERY_DATE: '2026-04-08', QUANTITY: 1000, UNIT_PRICE: 156, SUPPLIER_NAME: 'Marmara Kumaş Tic.', FIRM_NAME: 'Boyner', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 6, ORDER_NO: 'PO-20260328-0006', TITLE: 'Ambalaj ve Paketleme', TOTAL_PRICE: 28500.00, CURRENCY: 'TRY', STATUS: 1, ORDER_DATE: '2026-03-28', DELIVERY_DATE: '2026-04-12', QUANTITY: 5000, UNIT_PRICE: 5.7, SUPPLIER_NAME: 'Trakya Ambalaj San.', FIRM_NAME: 'Migros', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 7, ORDER_NO: 'PO-20260325-0007', TITLE: 'Erkek Mayo Koleksiyonu Kumaş', TOTAL_PRICE: 198000.00, CURRENCY: 'TRY', STATUS: 5, ORDER_DATE: '2026-03-25', DELIVERY_DATE: '2026-04-05', QUANTITY: 800, UNIT_PRICE: 247.5, SUPPLIER_NAME: 'KOM Tekstil A.Ş.', FIRM_NAME: 'Vakko', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 8, ORDER_NO: 'PO-20260322-0008', TITLE: 'Etiket ve Hang Tag', TOTAL_PRICE: 15800.00, CURRENCY: 'TRY', STATUS: 6, ORDER_DATE: '2026-03-22', DELIVERY_DATE: '2026-04-01', QUANTITY: 10000, UNIT_PRICE: 1.58, SUPPLIER_NAME: 'Bursa Etiket Ltd.', FIRM_NAME: 'Koton', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 9, ORDER_NO: 'PO-20260320-0009', TITLE: 'Likralı Kumaş 800m', TOTAL_PRICE: 144000.00, CURRENCY: 'TRY', STATUS: 5, ORDER_DATE: '2026-03-20', DELIVERY_DATE: '2026-03-30', QUANTITY: 800, UNIT_PRICE: 180, SUPPLIER_NAME: 'KOM Tekstil A.Ş.', FIRM_NAME: 'LC Waikiki', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
  { ID: 10, ORDER_NO: 'PO-20260318-0010', TITLE: 'Kargo ve Nakliye Hizmeti', TOTAL_PRICE: 52500.00, CURRENCY: 'TRY', STATUS: 5, ORDER_DATE: '2026-03-18', DELIVERY_DATE: '2026-03-25', QUANTITY: 1, UNIT_PRICE: 52500, SUPPLIER_NAME: 'İstanbul Lojistik', FIRM_NAME: 'Boyner', CUSER_NAME: 'Admin', CUSER_SURNAME: '' },
];

const MONTHLY = [
  { MONTH: '2025-05', ORDER_COUNT: 2, TOTAL_AMOUNT: 78500.00 },
  { MONTH: '2025-06', ORDER_COUNT: 3, TOTAL_AMOUNT: 112000.00 },
  { MONTH: '2025-07', ORDER_COUNT: 4, TOTAL_AMOUNT: 145200.00 },
  { MONTH: '2025-08', ORDER_COUNT: 3, TOTAL_AMOUNT: 98700.00 },
  { MONTH: '2025-09', ORDER_COUNT: 5, TOTAL_AMOUNT: 187300.00 },
  { MONTH: '2025-10', ORDER_COUNT: 4, TOTAL_AMOUNT: 156800.00 },
  { MONTH: '2025-11', ORDER_COUNT: 6, TOTAL_AMOUNT: 234500.00 },
  { MONTH: '2025-12', ORDER_COUNT: 3, TOTAL_AMOUNT: 89200.00 },
  { MONTH: '2026-01', ORDER_COUNT: 5, TOTAL_AMOUNT: 198400.00 },
  { MONTH: '2026-02', ORDER_COUNT: 4, TOTAL_AMOUNT: 167800.00 },
  { MONTH: '2026-03', ORDER_COUNT: 5, TOTAL_AMOUNT: 212350.00 },
  { MONTH: '2026-04', ORDER_COUNT: 3, TOTAL_AMOUNT: 162000.00 },
];

const FIRMS = [
  { ID: 1, FIRM_NAME: 'Migros', ORDER_COUNT: 8, TOTAL_AMOUNT: 412500.00, FIRST_ORDER: '2025-06-10', LAST_ORDER: '2026-04-07' },
  { ID: 2, FIRM_NAME: 'LC Waikiki', ORDER_COUNT: 7, TOTAL_AMOUNT: 367000.00, FIRST_ORDER: '2025-07-15', LAST_ORDER: '2026-04-05' },
  { ID: 3, FIRM_NAME: 'Koton', ORDER_COUNT: 6, TOTAL_AMOUNT: 298400.00, FIRST_ORDER: '2025-08-20', LAST_ORDER: '2026-04-03' },
  { ID: 4, FIRM_NAME: 'Boyner', ORDER_COUNT: 5, TOTAL_AMOUNT: 256000.00, FIRST_ORDER: '2025-09-05', LAST_ORDER: '2026-03-30' },
  { ID: 5, FIRM_NAME: 'DeFacto', ORDER_COUNT: 4, TOTAL_AMOUNT: 178200.00, FIRST_ORDER: '2025-10-12', LAST_ORDER: '2026-04-01' },
  { ID: 6, FIRM_NAME: 'Vakko', ORDER_COUNT: 4, TOTAL_AMOUNT: 198000.00, FIRST_ORDER: '2025-11-01', LAST_ORDER: '2026-03-25' },
  { ID: 7, FIRM_NAME: 'Mavi', ORDER_COUNT: 3, TOTAL_AMOUNT: 132650.00, FIRST_ORDER: '2025-12-08', LAST_ORDER: '2026-02-20' },
];

// ═══ AUTH ═══
app.post('/api/auth/login', (req, res) => {
  const { userName, password } = req.body;
  if (!userName || !password) return res.status(400).json({ success: false, message: 'Kullanıcı adı ve şifre zorunlu' });
  // Mock auth - herhangi bir giriş kabul
  res.json({
    success: true,
    tokens: { access: 'mock-access-token-' + Date.now(), refresh: 'mock-refresh-token' },
    user: {
      token: 'mock-access-token',
      userDetails: { id: 1, name: 'Admin', surname: 'KOM', role: 1, u_name: userName, pass_control: 1 },
      privs: {},
      menuItems: [],
    },
  });
});

app.post('/api/auth/logout', (req, res) => res.json({ success: true }));
app.post('/api/auth/refresh', (req, res) => res.json({ success: false }));
app.get('/api/auth/csrf-token', (req, res) => res.json({ success: true, csrfToken: 'mock-csrf' }));
app.post('/api/auth/forgot-password', (req, res) => res.json({ success: true, message: 'Şifre sıfırlama bağlantısı gönderildi' }));

// ═══ TEDARİKÇİ AUTH ═══
const SUPPLIER_ACCOUNTS = [
  { ID: 1, USERNAME: 'akdeniz', PASSWORD: '1234', FIRM: 'Akdeniz İplik', CONTACT: 'Ali Çelik', EMAIL: 'ali@akdeniziplik.com', PHONE: '0242 555 11 22', CITY: 'Antalya', RATING: 4.5 },
  { ID: 2, USERNAME: 'egetekstil', PASSWORD: '1234', FIRM: 'Ege Tekstil', CONTACT: 'Veli Demir', EMAIL: 'veli@egetekstil.com', PHONE: '0232 444 33 44', CITY: 'İzmir', RATING: 4.8 },
  { ID: 3, USERNAME: 'marmarakumas', PASSWORD: '1234', FIRM: 'Marmara Kumaş', CONTACT: 'Hasan Kara', EMAIL: 'hasan@marmarakumas.com', PHONE: '0224 333 55 66', CITY: 'Bursa', RATING: 3.9 },
  { ID: 4, USERNAME: 'trakya', PASSWORD: '1234', FIRM: 'Trakya Ambalaj', CONTACT: 'Selim Arslan', EMAIL: 'selim@trakyaambalaj.com', PHONE: '0284 222 77 88', CITY: 'Edirne', RATING: 4.6 },
  { ID: 5, USERNAME: 'bursaiplik', PASSWORD: '1234', FIRM: 'Bursa İplik San.', CONTACT: 'Mustafa Yıldız', EMAIL: 'mustafa@bursaiplik.com', PHONE: '0224 111 99 00', CITY: 'Bursa', RATING: 4.2 },
  { ID: 6, USERNAME: 'egeboya', PASSWORD: '1234', FIRM: 'Ege Boya Kimya', CONTACT: 'Kemal Öz', EMAIL: 'kemal@egeboya.com', PHONE: '0232 666 44 55', CITY: 'İzmir', RATING: 4.7 },
];

app.post('/api/supplier/login', (req, res) => {
  const { userName, password } = req.body;
  // Mock — herhangi bir giriş kabul, username'e göre firma eşleştir
  const account = SUPPLIER_ACCOUNTS.find(a => a.USERNAME === userName) || SUPPLIER_ACCOUNTS[0];
  res.json({
    success: true,
    tokens: { access: 'supplier-token-' + Date.now() },
    user: {
      type: 'supplier',
      userDetails: { id: account.ID, name: account.CONTACT, firm: account.FIRM, email: account.EMAIL, phone: account.PHONE, city: account.CITY, rating: account.RATING },
    },
  });
});

// Tedarikçi — açık ihaleleri gör
app.post('/api/supplier/tenders', (req, res) => {
  const open = TENDERS.filter(t => t.STATUS === 'open' || t.STATUS === 'evaluation');
  // Tedarikçi kendi teklifini görebilmek için bids'i de döndür
  res.json({ success: true, data: open });
});

// Tedarikçi — kendi tekliflerini gör
app.post('/api/supplier/my-bids', (req, res) => {
  const { firm } = req.body;
  const myBids = [];
  TENDERS.forEach(t => {
    t.BIDS.forEach(b => {
      if (b.SUPPLIER === firm) {
        myBids.push({
          ...b,
          TENDER_NO: t.TENDER_NO,
          TENDER_TITLE: t.TITLE,
          TENDER_STATUS: t.STATUS,
          TENDER_DEADLINE: t.DEADLINE,
          TENDER_CATEGORY: t.CATEGORY,
          IS_WINNER: t.AWARDED_TO === firm,
        });
      }
    });
  });
  res.json({ success: true, data: myBids });
});

// Tedarikçi — kendi siparişlerini gör (kazandığı ihaleler)
app.post('/api/supplier/orders', (req, res) => {
  const { firm } = req.body;
  const won = TENDERS.filter(t => t.AWARDED_TO === firm).map(t => ({
    ID: t.ID, TENDER_NO: t.TENDER_NO, TITLE: t.TITLE, CATEGORY: t.CATEGORY,
    QUANTITY: t.QUANTITY, UNIT: t.UNIT,
    BID: t.BIDS.find(b => b.SUPPLIER === firm),
    AWARDED_DATE: t.CREATED_DATE,
  }));
  res.json({ success: true, data: won });
});

// Tedarikçi — dashboard istatistikleri
app.post('/api/supplier/stats', (req, res) => {
  const { firm } = req.body;
  let totalBids = 0, wonBids = 0, totalValue = 0, activeTenders = 0;
  TENDERS.forEach(t => {
    const myBid = t.BIDS.find(b => b.SUPPLIER === firm);
    if (myBid) {
      totalBids++;
      totalValue += myBid.TOTAL;
      if (t.AWARDED_TO === firm) wonBids++;
    }
    if (t.STATUS === 'open' || t.STATUS === 'evaluation') activeTenders++;
  });
  res.json({
    success: true,
    data: { totalBids, wonBids, totalValue, activeTenders, winRate: totalBids ? Math.round((wonBids / totalBids) * 100) : 0 },
  });
});

// ═══ DASHBOARD ═══
app.post('/api/partners/dashboard', (req, res) => {
  res.json({
    success: true,
    data: {
      generalStats: { TOTAL_SUPPLIERS: 8, TOTAL_ORDERS: 47, TOTAL_REVENUE: 1842750.00, TOTAL_FIRMS: 12 },
      statusStats: [
        { STATUS: 1, COUNT: 5 }, { STATUS: 2, COUNT: 8 }, { STATUS: 3, COUNT: 12 },
        { STATUS: 4, COUNT: 7 }, { STATUS: 5, COUNT: 14 }, { STATUS: 6, COUNT: 1 },
      ],
      topSuppliers: SUPPLIERS.map((s, i) => ({ ...s, ORDER_COUNT: [15, 9, 7, 6, 5, 3, 1, 1][i], TOTAL_AMOUNT: [587200, 342800, 278500, 234100, 189650, 125000, 52500, 33000][i] })),
      monthlyTrend: MONTHLY,
      recentOrders: ORDERS,
      firmStats: FIRMS,
    },
  });
});

// ═══ ORDERS ═══
app.post('/api/partners/orders', (req, res) => res.json({ success: true, data: ORDERS }));

app.post('/api/partners/orders/create', (req, res) => {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const orderNo = `PO-${today}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`;
  res.json({ success: true, message: 'Sipariş oluşturuldu!', data: { id: Math.floor(Math.random() * 1000), orderNo } });
});

app.post('/api/partners/orders/update-status', (req, res) => {
  res.json({ success: true, message: 'Durum güncellendi!' });
});

// ═══ SUPPLIERS ═══
app.post('/api/partners/suppliers', (req, res) => res.json({ success: true, data: SUPPLIERS }));

app.post('/api/partners/suppliers/create', (req, res) => {
  res.json({ success: true, message: 'Tedarikçi oluşturuldu!', data: { id: Math.floor(Math.random() * 1000) } });
});

app.post('/api/partners/suppliers/analysis', (req, res) => {
  const { supplierId } = req.body;
  const data = {
    1: {
      supplier: SUPPLIERS[0], stats: { TOTAL_ORDERS: 15, TOTAL_AMOUNT: 587200, AVG_ORDER_AMOUNT: 39146 },
      statusDistribution: [{ STATUS: 3, COUNT: 3 }, { STATUS: 4, COUNT: 2 }, { STATUS: 5, COUNT: 10 }],
      firmDistribution: [
        { FIRM_NAME: 'LC Waikiki', ORDER_COUNT: 5, TOTAL_AMOUNT: 234000 },
        { FIRM_NAME: 'Migros', ORDER_COUNT: 4, TOTAL_AMOUNT: 187200 },
        { FIRM_NAME: 'Vakko', ORDER_COUNT: 3, TOTAL_AMOUNT: 112000 },
      ],
      monthlyTrend: [
        { MONTH: '2025-09', ORDER_COUNT: 2, TOTAL_AMOUNT: 78000 },
        { MONTH: '2025-11', ORDER_COUNT: 3, TOTAL_AMOUNT: 112000 },
        { MONTH: '2026-01', ORDER_COUNT: 2, TOTAL_AMOUNT: 89000 },
        { MONTH: '2026-03', ORDER_COUNT: 3, TOTAL_AMOUNT: 125000 },
        { MONTH: '2026-04', ORDER_COUNT: 2, TOTAL_AMOUNT: 63000 },
      ],
    },
    2: {
      supplier: SUPPLIERS[1], stats: { TOTAL_ORDERS: 9, TOTAL_AMOUNT: 342800, AVG_ORDER_AMOUNT: 38088 },
      statusDistribution: [{ STATUS: 2, COUNT: 1 }, { STATUS: 4, COUNT: 2 }, { STATUS: 5, COUNT: 6 }],
      firmDistribution: [
        { FIRM_NAME: 'LC Waikiki', ORDER_COUNT: 4, TOTAL_AMOUNT: 156000 },
        { FIRM_NAME: 'DeFacto', ORDER_COUNT: 3, TOTAL_AMOUNT: 112800 },
      ],
      monthlyTrend: [
        { MONTH: '2025-10', ORDER_COUNT: 2, TOTAL_AMOUNT: 67000 },
        { MONTH: '2026-01', ORDER_COUNT: 2, TOTAL_AMOUNT: 78800 },
        { MONTH: '2026-03', ORDER_COUNT: 2, TOTAL_AMOUNT: 72500 },
      ],
    },
  };
  const result = data[supplierId] || {
    supplier: SUPPLIERS.find(s => s.ID == supplierId) || { ID: supplierId, NAME: 'Tedarikçi #' + supplierId },
    stats: { TOTAL_ORDERS: 4, TOTAL_AMOUNT: 125000, AVG_ORDER_AMOUNT: 31250 },
    statusDistribution: [{ STATUS: 5, COUNT: 4 }],
    firmDistribution: [{ FIRM_NAME: 'Migros', ORDER_COUNT: 2, TOTAL_AMOUNT: 75000 }],
    monthlyTrend: [{ MONTH: '2026-02', ORDER_COUNT: 2, TOTAL_AMOUNT: 65000 }],
  };
  res.json({ success: true, data: result });
});

// ═══ FIRM LIST (for create order dropdown) ═══
app.post('/api/firm/list', (req, res) => {
  res.json({ success: true, data: FIRMS.map(f => ({ ID: f.ID, NAME: f.FIRM_NAME })) });
});

// ═══════════════════════════════════════════════════════
// ═══ İNSAN KAYNAKLARI ═══
// ═══════════════════════════════════════════════════════
const EMPLOYEES = [
  { ID: 1, NAME: 'Mehmet', SURNAME: 'Yılmaz', POSITION: 'Genel Müdür', DEPARTMENT: 'Yönetim', EMAIL: 'mehmet@kommayo.com', PHONE: '0532 111 22 33', START_DATE: '2015-03-15', SALARY: 85000, STATUS: 'active', AVATAR_COLOR: '#E81E25', PERFORMANCE: 95, LEAVE_BALANCE: 12, BIRTH_DATE: '1980-05-22', ADDRESS: 'Kadıköy, İstanbul' },
  { ID: 2, NAME: 'Ayşe', SURNAME: 'Kaya', POSITION: 'Üretim Müdürü', DEPARTMENT: 'Üretim', EMAIL: 'ayse@kommayo.com', PHONE: '0533 222 33 44', START_DATE: '2017-06-01', SALARY: 65000, STATUS: 'active', AVATAR_COLOR: '#8b5cf6', PERFORMANCE: 92, LEAVE_BALANCE: 8, BIRTH_DATE: '1985-08-10', ADDRESS: 'Beşiktaş, İstanbul' },
  { ID: 3, NAME: 'Ali', SURNAME: 'Demir', POSITION: 'Satış Sorumlusu', DEPARTMENT: 'Satış', EMAIL: 'ali@kommayo.com', PHONE: '0534 333 44 55', START_DATE: '2019-02-20', SALARY: 45000, STATUS: 'active', AVATAR_COLOR: '#3b82f6', PERFORMANCE: 88, LEAVE_BALANCE: 14, BIRTH_DATE: '1990-03-15', ADDRESS: 'Beyoğlu, İstanbul' },
  { ID: 4, NAME: 'Fatma', SURNAME: 'Çelik', POSITION: 'Muhasebe Uzmanı', DEPARTMENT: 'Muhasebe', EMAIL: 'fatma@kommayo.com', PHONE: '0535 444 55 66', START_DATE: '2018-09-10', SALARY: 48000, STATUS: 'active', AVATAR_COLOR: '#10b981', PERFORMANCE: 90, LEAVE_BALANCE: 10, BIRTH_DATE: '1988-11-05', ADDRESS: 'Üsküdar, İstanbul' },
  { ID: 5, NAME: 'Hasan', SURNAME: 'Özkan', POSITION: 'Kalite Kontrol Şefi', DEPARTMENT: 'Kalite', EMAIL: 'hasan@kommayo.com', PHONE: '0536 555 66 77', START_DATE: '2016-11-05', SALARY: 52000, STATUS: 'active', AVATAR_COLOR: '#f59e0b', PERFORMANCE: 93, LEAVE_BALANCE: 9, BIRTH_DATE: '1982-07-18', ADDRESS: 'Şişli, İstanbul' },
  { ID: 6, NAME: 'Zeynep', SURNAME: 'Aydın', POSITION: 'Tasarımcı', DEPARTMENT: 'Tasarım', EMAIL: 'zeynep@kommayo.com', PHONE: '0537 666 77 88', START_DATE: '2020-05-12', SALARY: 42000, STATUS: 'active', AVATAR_COLOR: '#ec4899', PERFORMANCE: 87, LEAVE_BALANCE: 13, BIRTH_DATE: '1992-01-25', ADDRESS: 'Beşiktaş, İstanbul' },
  { ID: 7, NAME: 'Emre', SURNAME: 'Şahin', POSITION: 'Depo Sorumlusu', DEPARTMENT: 'Lojistik', EMAIL: 'emre@kommayo.com', PHONE: '0538 777 88 99', START_DATE: '2021-03-22', SALARY: 38000, STATUS: 'active', AVATAR_COLOR: '#06b6d4', PERFORMANCE: 85, LEAVE_BALANCE: 15, BIRTH_DATE: '1993-09-12', ADDRESS: 'Maltepe, İstanbul' },
  { ID: 8, NAME: 'Elif', SURNAME: 'Arslan', POSITION: 'Pazarlama Uzmanı', DEPARTMENT: 'Pazarlama', EMAIL: 'elif@kommayo.com', PHONE: '0539 888 99 00', START_DATE: '2022-08-15', SALARY: 40000, STATUS: 'active', AVATAR_COLOR: '#8b5cf6', PERFORMANCE: 89, LEAVE_BALANCE: 16, BIRTH_DATE: '1994-04-30', ADDRESS: 'Kadıköy, İstanbul' },
  { ID: 9, NAME: 'Burak', SURNAME: 'Kılıç', POSITION: 'Üretim Operatörü', DEPARTMENT: 'Üretim', EMAIL: 'burak@kommayo.com', PHONE: '0540 999 00 11', START_DATE: '2023-01-10', SALARY: 28000, STATUS: 'active', AVATAR_COLOR: '#3b82f6', PERFORMANCE: 82, LEAVE_BALANCE: 18, BIRTH_DATE: '1996-06-20', ADDRESS: 'Bakırköy, İstanbul' },
  { ID: 10, NAME: 'Selin', SURNAME: 'Koç', POSITION: 'Stajyer', DEPARTMENT: 'Tasarım', EMAIL: 'selin@kommayo.com', PHONE: '0541 000 11 22', START_DATE: '2024-09-01', SALARY: 15000, STATUS: 'active', AVATAR_COLOR: '#ec4899', PERFORMANCE: 78, LEAVE_BALANCE: 20, BIRTH_DATE: '2000-12-08', ADDRESS: 'Beylikdüzü, İstanbul' },
];

const LEAVES = [
  { ID: 1, EMPLOYEE_ID: 1, EMPLOYEE_NAME: 'Mehmet Yılmaz', START_DATE: '2026-04-15', END_DATE: '2026-04-18', DAYS: 4, TYPE: 'Yıllık İzin', STATUS: 'approved', REASON: 'Tatil' },
  { ID: 2, EMPLOYEE_ID: 3, EMPLOYEE_NAME: 'Ali Demir', START_DATE: '2026-04-20', END_DATE: '2026-04-22', DAYS: 3, TYPE: 'Yıllık İzin', STATUS: 'pending', REASON: 'Ailevi' },
  { ID: 3, EMPLOYEE_ID: 5, EMPLOYEE_NAME: 'Hasan Özkan', START_DATE: '2026-04-12', END_DATE: '2026-04-13', DAYS: 2, TYPE: 'Mazeret İzni', STATUS: 'approved', REASON: 'Sağlık' },
  { ID: 4, EMPLOYEE_ID: 6, EMPLOYEE_NAME: 'Zeynep Aydın', START_DATE: '2026-05-01', END_DATE: '2026-05-10', DAYS: 10, TYPE: 'Yıllık İzin', STATUS: 'pending', REASON: 'Tatil' },
  { ID: 5, EMPLOYEE_ID: 2, EMPLOYEE_NAME: 'Ayşe Kaya', START_DATE: '2026-04-08', END_DATE: '2026-04-09', DAYS: 2, TYPE: 'Mazeret İzni', STATUS: 'rejected', REASON: 'Özel' },
];

app.post('/api/hr/employees', (req, res) => res.json({ success: true, data: EMPLOYEES }));
app.post('/api/hr/leaves', (req, res) => res.json({ success: true, data: LEAVES }));
app.post('/api/hr/stats', (req, res) => {
  const totalSalary = EMPLOYEES.reduce((s, e) => s + e.SALARY, 0);
  const avgPerformance = Math.round(EMPLOYEES.reduce((s, e) => s + e.PERFORMANCE, 0) / EMPLOYEES.length);
  const depts = {};
  EMPLOYEES.forEach(e => { depts[e.DEPARTMENT] = (depts[e.DEPARTMENT] || 0) + 1; });
  res.json({
    success: true,
    data: {
      totalEmployees: EMPLOYEES.length,
      activeEmployees: EMPLOYEES.filter(e => e.STATUS === 'active').length,
      totalSalary, avgPerformance,
      departments: Object.entries(depts).map(([name, count]) => ({ name, count })),
      pendingLeaves: LEAVES.filter(l => l.STATUS === 'pending').length,
      approvedLeaves: LEAVES.filter(l => l.STATUS === 'approved').length,
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ TEKLİFLER ═══
// ═══════════════════════════════════════════════════════
const QUOTES = [
  { ID: 1, QUOTE_NO: 'TKF-20260410-001', TITLE: 'Yaz 2026 Mayo Koleksiyonu', FIRM_NAME: 'Migros', CONTACT_NAME: 'Ahmet Yıldız', STATUS: 'approved', TOTAL_PRICE: 285000, CURRENCY: 'TRY', CREATED_DATE: '2026-04-01', VALID_UNTIL: '2026-04-30', VERSION: 2, ITEMS: 12, DESCRIPTION: 'Likralı mayo, bikini ve plaj şortları karma koleksiyon' },
  { ID: 2, QUOTE_NO: 'TKF-20260408-002', TITLE: 'Bayan İç Giyim Siparişi', FIRM_NAME: 'LC Waikiki', CONTACT_NAME: 'Elif Kara', STATUS: 'pending', TOTAL_PRICE: 156000, CURRENCY: 'TRY', CREATED_DATE: '2026-04-02', VALID_UNTIL: '2026-04-15', VERSION: 1, ITEMS: 8, DESCRIPTION: 'Pamuklu iç giyim ürünleri' },
  { ID: 3, QUOTE_NO: 'TKF-20260405-003', TITLE: 'Plaj Havlusu ve Havlu Bornoz', FIRM_NAME: 'Boyner', CONTACT_NAME: 'Murat Yılmaz', STATUS: 'negotiation', TOTAL_PRICE: 98500, CURRENCY: 'TRY', CREATED_DATE: '2026-03-28', VALID_UNTIL: '2026-04-20', VERSION: 3, ITEMS: 6, DESCRIPTION: 'Mikro fiber havlu ve bornoz seti' },
  { ID: 4, QUOTE_NO: 'TKF-20260403-004', TITLE: 'Erkek Mayo & Şort Paketi', FIRM_NAME: 'Koton', CONTACT_NAME: 'Can Özdemir', STATUS: 'approved', TOTAL_PRICE: 167000, CURRENCY: 'TRY', CREATED_DATE: '2026-03-25', VALID_UNTIL: '2026-04-25', VERSION: 1, ITEMS: 10, DESCRIPTION: 'Yaz 2026 erkek mayo ve plaj şortu' },
  { ID: 5, QUOTE_NO: 'TKF-20260401-005', TITLE: 'Çocuk Mayo Koleksiyonu', FIRM_NAME: 'DeFacto', CONTACT_NAME: 'Zeynep Arslan', STATUS: 'rejected', TOTAL_PRICE: 78000, CURRENCY: 'TRY', CREATED_DATE: '2026-03-20', VALID_UNTIL: '2026-04-10', VERSION: 2, ITEMS: 15, DESCRIPTION: 'Yaşa göre çocuk mayo serisi' },
  { ID: 6, QUOTE_NO: 'TKF-20260330-006', TITLE: 'Ev Tekstili Koleksiyonu', FIRM_NAME: 'Vakko', CONTACT_NAME: 'Seda Yıldırım', STATUS: 'draft', TOTAL_PRICE: 234000, CURRENCY: 'TRY', CREATED_DATE: '2026-03-18', VALID_UNTIL: '2026-04-18', VERSION: 1, ITEMS: 18, DESCRIPTION: 'Ev tekstili - çarşaf, nevresim, havlu' },
  { ID: 7, QUOTE_NO: 'TKF-20260328-007', TITLE: 'Spor Giyim Serisi', FIRM_NAME: 'Mavi', CONTACT_NAME: 'Burak Tekin', STATUS: 'approved', TOTAL_PRICE: 145000, CURRENCY: 'TRY', CREATED_DATE: '2026-03-15', VALID_UNTIL: '2026-04-05', VERSION: 1, ITEMS: 9, DESCRIPTION: 'Spor taytı ve antrenman tişörtleri' },
];

app.post('/api/quotes', (req, res) => res.json({ success: true, data: QUOTES }));
app.post('/api/quotes/stats', (req, res) => {
  const statusCount = {};
  QUOTES.forEach(q => { statusCount[q.STATUS] = (statusCount[q.STATUS] || 0) + 1; });
  res.json({
    success: true,
    data: {
      total: QUOTES.length,
      totalValue: QUOTES.reduce((s, q) => s + q.TOTAL_PRICE, 0),
      approvedValue: QUOTES.filter(q => q.STATUS === 'approved').reduce((s, q) => s + q.TOTAL_PRICE, 0),
      statusCount,
      winRate: Math.round((QUOTES.filter(q => q.STATUS === 'approved').length / QUOTES.length) * 100),
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ ÜRETİM TAKİBİ (KANBAN) ═══
// ═══════════════════════════════════════════════════════
const PRODUCTIONS = [
  { ID: 1, ORDER_NO: 'URT-001', TITLE: 'Mayo Kumaş Kesimi - Yaz Kol.', STATUS: 'design', PRIORITY: 'high', DEADLINE: '2026-04-15', PROGRESS: 100, ASSIGNED: 'Zeynep Aydın', MACHINE: 'Kesim Hattı 1', QUANTITY: 500, UNIT: 'adet' },
  { ID: 2, ORDER_NO: 'URT-002', TITLE: 'Bikini Dikim İşlemi', STATUS: 'cutting', PRIORITY: 'high', DEADLINE: '2026-04-18', PROGRESS: 45, ASSIGNED: 'Ayşe Kaya', MACHINE: 'Kesim Hattı 2', QUANTITY: 800, UNIT: 'adet' },
  { ID: 3, ORDER_NO: 'URT-003', TITLE: 'Plaj Şortu Üretimi', STATUS: 'sewing', PRIORITY: 'medium', DEADLINE: '2026-04-22', PROGRESS: 30, ASSIGNED: 'Burak Kılıç', MACHINE: 'Dikim Hattı A', QUANTITY: 600, UNIT: 'adet' },
  { ID: 4, ORDER_NO: 'URT-004', TITLE: 'Çocuk Mayo Seti', STATUS: 'sewing', PRIORITY: 'high', DEADLINE: '2026-04-20', PROGRESS: 65, ASSIGNED: 'Ayşe Kaya', MACHINE: 'Dikim Hattı B', QUANTITY: 1200, UNIT: 'adet' },
  { ID: 5, ORDER_NO: 'URT-005', TITLE: 'Havlu Bornoz Nakış', STATUS: 'quality', PRIORITY: 'medium', DEADLINE: '2026-04-25', PROGRESS: 85, ASSIGNED: 'Hasan Özkan', MACHINE: 'Nakış Makinesi 1', QUANTITY: 300, UNIT: 'adet' },
  { ID: 6, ORDER_NO: 'URT-006', TITLE: 'İç Giyim Paketleme', STATUS: 'packaging', PRIORITY: 'low', DEADLINE: '2026-04-12', PROGRESS: 70, ASSIGNED: 'Emre Şahin', MACHINE: 'Paketleme Hattı', QUANTITY: 2000, UNIT: 'adet' },
  { ID: 7, ORDER_NO: 'URT-007', TITLE: 'Spor Tayt Koleksiyonu', STATUS: 'shipping', PRIORITY: 'medium', DEADLINE: '2026-04-11', PROGRESS: 100, ASSIGNED: 'Emre Şahin', MACHINE: 'Sevk', QUANTITY: 450, UNIT: 'adet' },
  { ID: 8, ORDER_NO: 'URT-008', TITLE: 'Yaz Koleksiyonu Numune', STATUS: 'design', PRIORITY: 'high', DEADLINE: '2026-04-30', PROGRESS: 20, ASSIGNED: 'Zeynep Aydın', MACHINE: 'Tasarım Stüdyosu', QUANTITY: 50, UNIT: 'adet' },
  { ID: 9, ORDER_NO: 'URT-009', TITLE: 'Mayo Baskı İşlemi', STATUS: 'cutting', PRIORITY: 'medium', DEADLINE: '2026-04-28', PROGRESS: 15, ASSIGNED: 'Ayşe Kaya', MACHINE: 'Baskı Hattı', QUANTITY: 1500, UNIT: 'adet' },
];

app.post('/api/production', (req, res) => res.json({ success: true, data: PRODUCTIONS }));

// ═══════════════════════════════════════════════════════
// ═══ STOK & ENVANTER ═══
// ═══════════════════════════════════════════════════════
const INVENTORY = [
  { ID: 1, CODE: 'KMS-001', NAME: 'Likralı Mayo Kumaşı', CATEGORY: 'Kumaş', UNIT: 'metre', STOCK: 1200, MIN_STOCK: 500, MAX_STOCK: 3000, UNIT_PRICE: 180, WAREHOUSE: 'Depo A', LAST_UPDATE: '2026-04-09', STATUS: 'normal' },
  { ID: 2, CODE: 'KMS-002', NAME: 'Polyester İplik', CATEGORY: 'İplik', UNIT: 'kg', STOCK: 150, MIN_STOCK: 200, MAX_STOCK: 1000, UNIT_PRICE: 85, WAREHOUSE: 'Depo A', LAST_UPDATE: '2026-04-08', STATUS: 'critical' },
  { ID: 3, CODE: 'KMS-003', NAME: 'Pamuk Kumaşı', CATEGORY: 'Kumaş', UNIT: 'metre', STOCK: 800, MIN_STOCK: 300, MAX_STOCK: 2000, UNIT_PRICE: 120, WAREHOUSE: 'Depo B', LAST_UPDATE: '2026-04-09', STATUS: 'normal' },
  { ID: 4, CODE: 'AKS-001', NAME: 'Plastik Toka', CATEGORY: 'Aksesuar', UNIT: 'adet', STOCK: 5000, MIN_STOCK: 2000, MAX_STOCK: 15000, UNIT_PRICE: 2.5, WAREHOUSE: 'Depo B', LAST_UPDATE: '2026-04-07', STATUS: 'normal' },
  { ID: 5, CODE: 'AKS-002', NAME: 'Metal Fermuar 20cm', CATEGORY: 'Aksesuar', UNIT: 'adet', STOCK: 120, MIN_STOCK: 500, MAX_STOCK: 3000, UNIT_PRICE: 8.5, WAREHOUSE: 'Depo B', LAST_UPDATE: '2026-04-09', STATUS: 'critical' },
  { ID: 6, CODE: 'KMY-001', NAME: 'Reaktif Boya - Kırmızı', CATEGORY: 'Kimyasal', UNIT: 'kg', STOCK: 75, MIN_STOCK: 50, MAX_STOCK: 200, UNIT_PRICE: 450, WAREHOUSE: 'Kimyasal Depo', LAST_UPDATE: '2026-04-06', STATUS: 'normal' },
  { ID: 7, CODE: 'KMY-002', NAME: 'Yumuşatıcı Kimyasalı', CATEGORY: 'Kimyasal', UNIT: 'litre', STOCK: 30, MIN_STOCK: 80, MAX_STOCK: 300, UNIT_PRICE: 125, WAREHOUSE: 'Kimyasal Depo', LAST_UPDATE: '2026-04-08', STATUS: 'critical' },
  { ID: 8, CODE: 'AMB-001', NAME: 'Karton Kutu 30x20', CATEGORY: 'Ambalaj', UNIT: 'adet', STOCK: 2500, MIN_STOCK: 1000, MAX_STOCK: 8000, UNIT_PRICE: 12, WAREHOUSE: 'Depo C', LAST_UPDATE: '2026-04-05', STATUS: 'normal' },
  { ID: 9, CODE: 'AMB-002', NAME: 'Marka Etiketi', CATEGORY: 'Ambalaj', UNIT: 'adet', STOCK: 8000, MIN_STOCK: 3000, MAX_STOCK: 20000, UNIT_PRICE: 1.8, WAREHOUSE: 'Depo C', LAST_UPDATE: '2026-04-09', STATUS: 'normal' },
  { ID: 10, CODE: 'KMS-004', NAME: 'Saten Kumaş', CATEGORY: 'Kumaş', UNIT: 'metre', STOCK: 200, MIN_STOCK: 400, MAX_STOCK: 1500, UNIT_PRICE: 240, WAREHOUSE: 'Depo A', LAST_UPDATE: '2026-04-09', STATUS: 'critical' },
];

app.post('/api/inventory', (req, res) => res.json({ success: true, data: INVENTORY }));
app.post('/api/inventory/stats', (req, res) => {
  const byCategory = {};
  INVENTORY.forEach(i => {
    if (!byCategory[i.CATEGORY]) byCategory[i.CATEGORY] = { count: 0, value: 0 };
    byCategory[i.CATEGORY].count++;
    byCategory[i.CATEGORY].value += i.STOCK * i.UNIT_PRICE;
  });
  res.json({
    success: true,
    data: {
      totalItems: INVENTORY.length,
      criticalCount: INVENTORY.filter(i => i.STATUS === 'critical').length,
      totalValue: INVENTORY.reduce((s, i) => s + (i.STOCK * i.UNIT_PRICE), 0),
      categories: Object.entries(byCategory).map(([name, d]) => ({ name, ...d })),
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ FİNANS / MUHASEBE ═══
// ═══════════════════════════════════════════════════════
const FINANCE_MONTHLY = [
  { MONTH: '2025-11', INCOME: 285000, EXPENSE: 195000, PROFIT: 90000 },
  { MONTH: '2025-12', INCOME: 312000, EXPENSE: 215000, PROFIT: 97000 },
  { MONTH: '2026-01', INCOME: 298000, EXPENSE: 205000, PROFIT: 93000 },
  { MONTH: '2026-02', INCOME: 345000, EXPENSE: 225000, PROFIT: 120000 },
  { MONTH: '2026-03', INCOME: 389000, EXPENSE: 240000, PROFIT: 149000 },
  { MONTH: '2026-04', INCOME: 312000, EXPENSE: 185000, PROFIT: 127000 },
];

const INVOICES = [
  { ID: 1, INVOICE_NO: 'FTR-2026-001', TYPE: 'income', DATE: '2026-04-08', COMPANY: 'Migros', AMOUNT: 125000, STATUS: 'paid', DESCRIPTION: 'Mayo Kumaş Siparişi' },
  { ID: 2, INVOICE_NO: 'FTR-2026-002', TYPE: 'income', DATE: '2026-04-05', COMPANY: 'LC Waikiki', AMOUNT: 87500, STATUS: 'pending', DESCRIPTION: 'Polyester İplik' },
  { ID: 3, INVOICE_NO: 'GDR-2026-001', TYPE: 'expense', DATE: '2026-04-07', COMPANY: 'Akdeniz İplik', AMOUNT: 45000, STATUS: 'paid', DESCRIPTION: 'Hammadde alımı' },
  { ID: 4, INVOICE_NO: 'FTR-2026-003', TYPE: 'income', DATE: '2026-04-03', COMPANY: 'Koton', AMOUNT: 62300, STATUS: 'paid', DESCRIPTION: 'Boya ve Apre' },
  { ID: 5, INVOICE_NO: 'GDR-2026-002', TYPE: 'expense', DATE: '2026-04-06', COMPANY: 'Ege Boya Kimya', AMOUNT: 28000, STATUS: 'paid', DESCRIPTION: 'Boya malzemesi' },
  { ID: 6, INVOICE_NO: 'FTR-2026-004', TYPE: 'income', DATE: '2026-04-01', COMPANY: 'DeFacto', AMOUNT: 34200, STATUS: 'overdue', DESCRIPTION: 'Bikini Aksesuarları' },
  { ID: 7, INVOICE_NO: 'GDR-2026-003', TYPE: 'expense', DATE: '2026-04-02', COMPANY: 'Trakya Ambalaj', AMOUNT: 18500, STATUS: 'paid', DESCRIPTION: 'Ambalaj malzemesi' },
  { ID: 8, INVOICE_NO: 'FTR-2026-005', TYPE: 'income', DATE: '2026-03-30', COMPANY: 'Boyner', AMOUNT: 156000, STATUS: 'paid', DESCRIPTION: 'Pamuklu Kumaş' },
];

app.post('/api/finance/monthly', (req, res) => res.json({ success: true, data: FINANCE_MONTHLY }));
app.post('/api/finance/invoices', (req, res) => res.json({ success: true, data: INVOICES }));
app.post('/api/finance/stats', (req, res) => {
  const totalIncome = FINANCE_MONTHLY.reduce((s, m) => s + m.INCOME, 0);
  const totalExpense = FINANCE_MONTHLY.reduce((s, m) => s + m.EXPENSE, 0);
  res.json({
    success: true,
    data: {
      totalIncome, totalExpense,
      totalProfit: totalIncome - totalExpense,
      profitMargin: Math.round(((totalIncome - totalExpense) / totalIncome) * 100),
      pendingReceivables: INVOICES.filter(i => i.TYPE === 'income' && i.STATUS === 'pending').reduce((s, i) => s + i.AMOUNT, 0),
      overdueReceivables: INVOICES.filter(i => i.TYPE === 'income' && i.STATUS === 'overdue').reduce((s, i) => s + i.AMOUNT, 0),
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ CRM (MÜŞTERİ İLİŞKİLERİ) ═══
// ═══════════════════════════════════════════════════════
const CUSTOMERS = [
  { ID: 1, NAME: 'Migros', CONTACT: 'Ahmet Yıldız', PHONE: '0212 555 10 10', EMAIL: 'ahmet@migros.com.tr', CITY: 'İstanbul', TOTAL_ORDERS: 8, TOTAL_REVENUE: 412500, LAST_ORDER: '2026-04-07', SEGMENT: 'vip', SATISFACTION: 95 },
  { ID: 2, NAME: 'LC Waikiki', CONTACT: 'Elif Kara', PHONE: '0212 333 22 11', EMAIL: 'elif@lcw.com', CITY: 'İstanbul', TOTAL_ORDERS: 7, TOTAL_REVENUE: 367000, LAST_ORDER: '2026-04-05', SEGMENT: 'vip', SATISFACTION: 92 },
  { ID: 3, NAME: 'Koton', CONTACT: 'Murat Demir', PHONE: '0212 444 33 22', EMAIL: 'murat@koton.com', CITY: 'İstanbul', TOTAL_ORDERS: 6, TOTAL_REVENUE: 298400, LAST_ORDER: '2026-04-03', SEGMENT: 'regular', SATISFACTION: 88 },
  { ID: 4, NAME: 'Boyner', CONTACT: 'Zeynep Kılıç', PHONE: '0212 555 44 33', EMAIL: 'zeynep@boyner.com', CITY: 'İstanbul', TOTAL_ORDERS: 5, TOTAL_REVENUE: 256000, LAST_ORDER: '2026-03-30', SEGMENT: 'regular', SATISFACTION: 90 },
  { ID: 5, NAME: 'DeFacto', CONTACT: 'Can Özdemir', PHONE: '0212 666 55 44', EMAIL: 'can@defacto.com', CITY: 'İstanbul', TOTAL_ORDERS: 4, TOTAL_REVENUE: 178200, LAST_ORDER: '2026-04-01', SEGMENT: 'regular', SATISFACTION: 85 },
  { ID: 6, NAME: 'Vakko', CONTACT: 'Seda Yıldırım', PHONE: '0212 777 66 55', EMAIL: 'seda@vakko.com', CITY: 'İstanbul', TOTAL_ORDERS: 4, TOTAL_REVENUE: 198000, LAST_ORDER: '2026-03-25', SEGMENT: 'vip', SATISFACTION: 94 },
  { ID: 7, NAME: 'Mavi', CONTACT: 'Burak Tekin', PHONE: '0212 888 77 66', EMAIL: 'burak@mavi.com', CITY: 'İstanbul', TOTAL_ORDERS: 3, TOTAL_REVENUE: 132650, LAST_ORDER: '2026-02-20', SEGMENT: 'new', SATISFACTION: 86 },
  { ID: 8, NAME: 'Network', CONTACT: 'Aslı Güneş', PHONE: '0212 999 88 77', EMAIL: 'asli@network.com', CITY: 'İstanbul', TOTAL_ORDERS: 2, TOTAL_REVENUE: 87500, LAST_ORDER: '2026-01-15', SEGMENT: 'new', SATISFACTION: 82 },
];

app.post('/api/crm/customers', (req, res) => res.json({ success: true, data: CUSTOMERS }));

// ═══════════════════════════════════════════════════════
// ═══ ÜRÜN KATALOĞU ═══
// ═══════════════════════════════════════════════════════
const PRODUCTS = [
  { ID: 1, CODE: 'MYO-001', NAME: 'Likralı Bayan Mayo - Desenli', CATEGORY: 'Bayan Mayo', SEASON: 'Yaz 2026', PRICE: 450, STOCK: 250, COLORS: ['Kırmızı', 'Mavi', 'Siyah'], SIZES: ['S', 'M', 'L', 'XL'], STATUS: 'active' },
  { ID: 2, CODE: 'BKN-001', NAME: 'Üçgen Bikini Takımı', CATEGORY: 'Bikini', SEASON: 'Yaz 2026', PRICE: 380, STOCK: 180, COLORS: ['Beyaz', 'Pembe', 'Lacivert'], SIZES: ['S', 'M', 'L'], STATUS: 'active' },
  { ID: 3, CODE: 'MYO-002', NAME: 'Erkek Plaj Şortu', CATEGORY: 'Erkek Mayo', SEASON: 'Yaz 2026', PRICE: 280, STOCK: 320, COLORS: ['Siyah', 'Gri', 'Lacivert', 'Yeşil'], SIZES: ['M', 'L', 'XL', 'XXL'], STATUS: 'active' },
  { ID: 4, CODE: 'CCK-001', NAME: 'Çocuk Mayo Seti', CATEGORY: 'Çocuk Mayo', SEASON: 'Yaz 2026', PRICE: 220, STOCK: 400, COLORS: ['Mavi', 'Sarı', 'Turuncu'], SIZES: ['2-4', '5-7', '8-10'], STATUS: 'active' },
  { ID: 5, CODE: 'IC-001', NAME: 'Pamuk İç Çamaşırı', CATEGORY: 'İç Giyim', SEASON: 'Tüm Sezon', PRICE: 120, STOCK: 850, COLORS: ['Beyaz', 'Siyah', 'Bej'], SIZES: ['S', 'M', 'L', 'XL'], STATUS: 'active' },
  { ID: 6, CODE: 'EV-001', NAME: 'Havlu Bornoz', CATEGORY: 'Ev Tekstili', SEASON: 'Tüm Sezon', PRICE: 385, STOCK: 150, COLORS: ['Beyaz', 'Gri', 'Bej'], SIZES: ['S', 'M', 'L'], STATUS: 'active' },
  { ID: 7, CODE: 'PL-001', NAME: 'Plaj Çantası', CATEGORY: 'Aksesuar', SEASON: 'Yaz 2026', PRICE: 180, STOCK: 90, COLORS: ['Bej', 'Beyaz'], SIZES: ['Standart'], STATUS: 'active' },
  { ID: 8, CODE: 'MYO-003', NAME: 'Sporcu Tayt Mayo', CATEGORY: 'Bayan Mayo', SEASON: 'Yaz 2026', PRICE: 395, STOCK: 210, COLORS: ['Siyah', 'Lacivert'], SIZES: ['S', 'M', 'L'], STATUS: 'active' },
];

app.post('/api/products', (req, res) => res.json({ success: true, data: PRODUCTS }));

// ═══════════════════════════════════════════════════════
// ═══ RAPORLAR ═══
// ═══════════════════════════════════════════════════════
app.post('/api/reports/summary', (req, res) => {
  res.json({
    success: true,
    data: {
      sales: { total: 1842750, growth: 18, orders: 47 },
      production: { active: PRODUCTIONS.length, completed: 142, efficiency: 87 },
      inventory: { value: INVENTORY.reduce((s, i) => s + (i.STOCK * i.UNIT_PRICE), 0), critical: INVENTORY.filter(i => i.STATUS === 'critical').length },
      hr: { employees: EMPLOYEES.length, avgPerformance: 89 },
      finance: { income: FINANCE_MONTHLY.reduce((s, m) => s + m.INCOME, 0), profit: FINANCE_MONTHLY.reduce((s, m) => s + m.PROFIT, 0) },
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ KALİTE KONTROL ═══
// ═══════════════════════════════════════════════════════
const QUALITY_CHECKS = [
  { ID: 1, DATE: '2026-04-09', PRODUCT: 'Mayo Kumaş Lot 1', INSPECTOR: 'Hasan Özkan', STATUS: 'passed', DEFECT_COUNT: 3, TOTAL: 500, NOTE: 'Minimal hata' },
  { ID: 2, DATE: '2026-04-08', PRODUCT: 'Bikini Seti Lot 2', INSPECTOR: 'Hasan Özkan', STATUS: 'passed', DEFECT_COUNT: 5, TOTAL: 800, NOTE: 'Kabul edilebilir' },
  { ID: 3, DATE: '2026-04-07', PRODUCT: 'Plaj Şortu Lot 3', INSPECTOR: 'Ayşe Kaya', STATUS: 'warning', DEFECT_COUNT: 25, TOTAL: 600, NOTE: 'Renk sapması' },
  { ID: 4, DATE: '2026-04-06', PRODUCT: 'Havlu Bornoz Lot 4', INSPECTOR: 'Hasan Özkan', STATUS: 'passed', DEFECT_COUNT: 2, TOTAL: 300, NOTE: 'Mükemmel' },
  { ID: 5, DATE: '2026-04-05', PRODUCT: 'İç Giyim Lot 5', INSPECTOR: 'Ayşe Kaya', STATUS: 'failed', DEFECT_COUNT: 80, TOTAL: 400, NOTE: 'Dikişler hatalı, yeniden işleme' },
  { ID: 6, DATE: '2026-04-04', PRODUCT: 'Çocuk Mayo Lot 6', INSPECTOR: 'Hasan Özkan', STATUS: 'passed', DEFECT_COUNT: 8, TOTAL: 1200, NOTE: 'İyi' },
];

app.post('/api/quality', (req, res) => res.json({ success: true, data: QUALITY_CHECKS }));

// ═══════════════════════════════════════════════════════
// ═══ BİLDİRİMLER & GÖREVLER ═══
// ═══════════════════════════════════════════════════════
const TASKS = [
  { ID: 1, TITLE: 'Yaz 2026 teklif onayı', DESCRIPTION: 'Migros teklifinin son onayı', DUE_DATE: '2026-04-12', PRIORITY: 'high', STATUS: 'pending', ASSIGNED: 'Mehmet Yılmaz', TYPE: 'quote' },
  { ID: 2, TITLE: 'Stok kritik seviye uyarısı', DESCRIPTION: 'Polyester iplik stoğu minimumun altında', DUE_DATE: '2026-04-11', PRIORITY: 'high', STATUS: 'pending', ASSIGNED: 'Emre Şahin', TYPE: 'inventory' },
  { ID: 3, TITLE: 'İzin talebi onayı', DESCRIPTION: 'Ali Demir - 3 gün yıllık izin', DUE_DATE: '2026-04-11', PRIORITY: 'medium', STATUS: 'pending', ASSIGNED: 'Mehmet Yılmaz', TYPE: 'hr' },
  { ID: 4, TITLE: 'Üretim kalite kontrolü', DESCRIPTION: 'İç giyim lot 5 yeniden işleme', DUE_DATE: '2026-04-10', PRIORITY: 'high', STATUS: 'in_progress', ASSIGNED: 'Hasan Özkan', TYPE: 'quality' },
  { ID: 5, TITLE: 'Yeni koleksiyon numunesi', DESCRIPTION: 'Güz 2026 numune çalışması', DUE_DATE: '2026-04-20', PRIORITY: 'medium', STATUS: 'pending', ASSIGNED: 'Zeynep Aydın', TYPE: 'production' },
  { ID: 6, TITLE: 'Fatura tahsilatı', DESCRIPTION: 'DeFacto ödemesi gecikti', DUE_DATE: '2026-04-11', PRIORITY: 'high', STATUS: 'pending', ASSIGNED: 'Fatma Çelik', TYPE: 'finance' },
];

app.post('/api/tasks', (req, res) => res.json({ success: true, data: TASKS }));

// ═══════════════════════════════════════════════════════
// ═══ SEZON & KOLEKSİYON ═══
// ═══════════════════════════════════════════════════════
const COLLECTIONS = [
  { ID: 1, NAME: 'Yaz 2026 Mayo Koleksiyonu', SEASON: 'Yaz 2026', STATUS: 'production', START_DATE: '2026-01-15', LAUNCH_DATE: '2026-05-01', PRODUCT_COUNT: 45, COLOR: '#E81E25', PROGRESS: 75, BUDGET: 850000, SPENT: 620000 },
  { ID: 2, NAME: 'Kış 2026 İç Giyim', SEASON: 'Kış 2026', STATUS: 'design', START_DATE: '2026-03-01', LAUNCH_DATE: '2026-09-15', PRODUCT_COUNT: 32, COLOR: '#3b82f6', PROGRESS: 25, BUDGET: 600000, SPENT: 150000 },
  { ID: 3, NAME: 'Plaj Aksesuarları', SEASON: 'Yaz 2026', STATUS: 'launched', START_DATE: '2025-11-10', LAUNCH_DATE: '2026-03-15', PRODUCT_COUNT: 18, COLOR: '#10b981', PROGRESS: 100, BUDGET: 250000, SPENT: 245000 },
  { ID: 4, NAME: 'Çocuk Yaz Koleksiyonu', SEASON: 'Yaz 2026', STATUS: 'production', START_DATE: '2026-02-01', LAUNCH_DATE: '2026-05-15', PRODUCT_COUNT: 28, COLOR: '#f59e0b', PROGRESS: 60, BUDGET: 380000, SPENT: 220000 },
  { ID: 5, NAME: 'Ev Tekstili Güz', SEASON: 'Güz 2026', STATUS: 'planning', START_DATE: '2026-04-01', LAUNCH_DATE: '2026-10-01', PRODUCT_COUNT: 22, COLOR: '#8b5cf6', PROGRESS: 10, BUDGET: 420000, SPENT: 35000 },
];

app.post('/api/collections', (req, res) => res.json({ success: true, data: COLLECTIONS }));

// ═══════════════════════════════════════════════════════
// ═══ MAĞAZA & LOKASYON ═══
// ═══════════════════════════════════════════════════════
const STORES = [
  { ID: 1, NAME: 'KOM Flagship İstanbul', CITY: 'İstanbul', ADDRESS: 'Bağdat Cad. No:145', MANAGER: 'Murat Yıldız', PHONE: '0216 555 10 10', MONTHLY_SALES: 385000, STAFF: 12, STATUS: 'active', RATING: 4.8 },
  { ID: 2, NAME: 'KOM Ankara AVM', CITY: 'Ankara', ADDRESS: 'Kentpark AVM, No:245', MANAGER: 'Elif Kara', PHONE: '0312 444 22 11', MONTHLY_SALES: 245000, STAFF: 8, STATUS: 'active', RATING: 4.6 },
  { ID: 3, NAME: 'KOM İzmir', CITY: 'İzmir', ADDRESS: 'Alsancak Cad. No:89', MANAGER: 'Can Özdemir', PHONE: '0232 333 33 33', MONTHLY_SALES: 198000, STAFF: 6, STATUS: 'active', RATING: 4.7 },
  { ID: 4, NAME: 'KOM Antalya', CITY: 'Antalya', ADDRESS: 'Lara Cad. No:67', MANAGER: 'Zeynep Kılıç', PHONE: '0242 222 22 22', MONTHLY_SALES: 312000, STAFF: 10, STATUS: 'active', RATING: 4.9 },
  { ID: 5, NAME: 'KOM Bursa Nilüfer', CITY: 'Bursa', ADDRESS: 'Nilüfer AVM, No:156', MANAGER: 'Hasan Demir', PHONE: '0224 111 11 11', MONTHLY_SALES: 167000, STAFF: 7, STATUS: 'active', RATING: 4.5 },
  { ID: 6, NAME: 'KOM Adana Outlet', CITY: 'Adana', ADDRESS: 'M1 Outlet, No:34', MANAGER: 'Ayşe Kara', PHONE: '0322 444 44 44', MONTHLY_SALES: 123000, STAFF: 5, STATUS: 'active', RATING: 4.4 },
];

app.post('/api/stores', (req, res) => res.json({ success: true, data: STORES }));

// ═══════════════════════════════════════════════════════
// ═══ TALEPLER (REQUEST) ═══
// ═══════════════════════════════════════════════════════
const SERVICES = [
  { ID: 1, NAME: 'Kumaş Kesim', CATEGORY: 'Üretim' },
  { ID: 2, NAME: 'Dikim Hizmeti', CATEGORY: 'Üretim' },
  { ID: 3, NAME: 'Boya & Apre', CATEGORY: 'Üretim' },
  { ID: 4, NAME: 'Kalite Kontrol', CATEGORY: 'Kontrol' },
  { ID: 5, NAME: 'Ambalajlama', CATEGORY: 'Lojistik' },
  { ID: 6, NAME: 'Nakliye / Sevkiyat', CATEGORY: 'Lojistik' },
  { ID: 7, NAME: 'Numune Hazırlama', CATEGORY: 'Tasarım' },
  { ID: 8, NAME: 'Tasarım Revizyonu', CATEGORY: 'Tasarım' },
  { ID: 9, NAME: 'Hammadde Tedarik', CATEGORY: 'Tedarik' },
  { ID: 10, NAME: 'Bakım & Onarım (Makine)', CATEGORY: 'Teknik' },
];

const REQUESTS = [
  { ID: 1, REQUEST_NO: 'TLP-2026-001', SUBJECT: 'Mayo kumaşı kesim hatası', EXPLANATION: 'Lot 3 deki kesim boyutları spesifikasyona uymuyor, 200 adet etkilenmiş.', SERVICE: 'Kumaş Kesim', PRIORITY: 'high', STATUS: 'open', FIRM: 'Migros', LOCATION: 'Fabrika A - Kesimhane', CREATED_BY: 'Mehmet Yılmaz', CREATED_DATE: '2026-04-10', ASSIGNED_TO: 'Ayşe Kaya', FILES: 2 },
  { ID: 2, REQUEST_NO: 'TLP-2026-002', SUBJECT: 'Bikini dikimi kalite düşüklüğü', EXPLANATION: 'Dikim hattı B deki bikini takımlarında dikiş atlaması var. Acil kontrol gerekli.', SERVICE: 'Dikim Hizmeti', PRIORITY: 'high', STATUS: 'in_progress', FIRM: 'LC Waikiki', LOCATION: 'Fabrika A - Dikim Hattı B', CREATED_BY: 'Fatma Çelik', CREATED_DATE: '2026-04-09', ASSIGNED_TO: 'Burak Kılıç', FILES: 3 },
  { ID: 3, REQUEST_NO: 'TLP-2026-003', SUBJECT: 'Boya renk sapması tespiti', EXPLANATION: 'Reaktif kırmızı boya batch 45 de renk tonu şartnameden farklı çıktı.', SERVICE: 'Boya & Apre', PRIORITY: 'medium', STATUS: 'open', FIRM: 'Koton', LOCATION: 'Fabrika B - Boyahane', CREATED_BY: 'Zeynep Aydın', CREATED_DATE: '2026-04-08', ASSIGNED_TO: null, FILES: 1 },
  { ID: 4, REQUEST_NO: 'TLP-2026-004', SUBJECT: 'Plaj şortu numune onayı', EXPLANATION: 'Yaz 2026 koleksiyonu plaj şortu numunesi hazırlandı, onay bekleniyor.', SERVICE: 'Numune Hazırlama', PRIORITY: 'low', STATUS: 'completed', FIRM: 'Boyner', LOCATION: 'Tasarım Stüdyosu', CREATED_BY: 'Zeynep Aydın', CREATED_DATE: '2026-04-05', ASSIGNED_TO: 'Zeynep Aydın', FILES: 5 },
  { ID: 5, REQUEST_NO: 'TLP-2026-005', SUBJECT: 'Ambalaj malzemesi eksikliği', EXPLANATION: 'Karton kutu 30x20 stokta yeterli değil, 2000 adet acil sipariş gerekli.', SERVICE: 'Ambalajlama', PRIORITY: 'high', STATUS: 'open', FIRM: 'DeFacto', LOCATION: 'Depo C', CREATED_BY: 'Emre Şahin', CREATED_DATE: '2026-04-11', ASSIGNED_TO: 'Emre Şahin', FILES: 0 },
  { ID: 6, REQUEST_NO: 'TLP-2026-006', SUBJECT: 'Dikim makinesi arızası', EXPLANATION: 'Dikim Hattı A 3 nolu overlok makinesi çalışmıyor. Üretim durdu.', SERVICE: 'Bakım & Onarım (Makine)', PRIORITY: 'critical', STATUS: 'in_progress', FIRM: 'KOM İç', LOCATION: 'Fabrika A - Dikim Hattı A', CREATED_BY: 'Hasan Özkan', CREATED_DATE: '2026-04-12', ASSIGNED_TO: 'Hasan Özkan', FILES: 1 },
  { ID: 7, REQUEST_NO: 'TLP-2026-007', SUBJECT: 'Sevkiyat gecikme bildirimi', EXPLANATION: 'Vakko siparişi 2 gün gecikecek, nakliye firması bilgilendirilmeli.', SERVICE: 'Nakliye / Sevkiyat', PRIORITY: 'medium', STATUS: 'completed', FIRM: 'Vakko', LOCATION: 'Lojistik Merkez', CREATED_BY: 'Fatma Çelik', CREATED_DATE: '2026-04-07', ASSIGNED_TO: 'Emre Şahin', FILES: 0 },
  { ID: 8, REQUEST_NO: 'TLP-2026-008', SUBJECT: 'Polyester iplik tedarik talebi', EXPLANATION: 'Kritik stok seviyesinde. 500kg acil sipariş gerekli. Akdeniz İplik tercih edilsin.', SERVICE: 'Hammadde Tedarik', PRIORITY: 'high', STATUS: 'open', FIRM: 'KOM İç', LOCATION: 'Depo A', CREATED_BY: 'Emre Şahin', CREATED_DATE: '2026-04-13', ASSIGNED_TO: null, FILES: 0 },
  { ID: 9, REQUEST_NO: 'TLP-2026-009', SUBJECT: 'Çocuk mayo tasarım revizyonu', EXPLANATION: 'DeFacto müşterisi çocuk mayo serisinde renk paleti değişikliği istiyor.', SERVICE: 'Tasarım Revizyonu', PRIORITY: 'medium', STATUS: 'in_progress', FIRM: 'DeFacto', LOCATION: 'Tasarım Stüdyosu', CREATED_BY: 'Zeynep Aydın', CREATED_DATE: '2026-04-11', ASSIGNED_TO: 'Zeynep Aydın', FILES: 4 },
  { ID: 10, REQUEST_NO: 'TLP-2026-010', SUBJECT: 'İç giyim lot 5 yeniden kontrol', EXPLANATION: 'Önceki kalite kontrolden dönen lot, düzeltme sonrası yeniden kontrole hazır.', SERVICE: 'Kalite Kontrol', PRIORITY: 'medium', STATUS: 'open', FIRM: 'Mavi', LOCATION: 'Fabrika A - Kalite Lab', CREATED_BY: 'Hasan Özkan', CREATED_DATE: '2026-04-12', ASSIGNED_TO: 'Hasan Özkan', FILES: 2 },
];

const REQUEST_STATUS = {
  open: { label: 'Açık', color: '#f59e0b' },
  in_progress: { label: 'İşlemde', color: '#3b82f6' },
  completed: { label: 'Tamamlandı', color: '#10b981' },
  cancelled: { label: 'İptal', color: '#ef4444' },
};

app.post('/api/requests', (req, res) => res.json({ success: true, data: REQUESTS }));
app.post('/api/requests/services', (req, res) => res.json({ success: true, data: SERVICES }));
app.post('/api/requests/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: REQUESTS.length,
      open: REQUESTS.filter(r => r.STATUS === 'open').length,
      inProgress: REQUESTS.filter(r => r.STATUS === 'in_progress').length,
      completed: REQUESTS.filter(r => r.STATUS === 'completed').length,
      critical: REQUESTS.filter(r => r.PRIORITY === 'critical').length,
      high: REQUESTS.filter(r => r.PRIORITY === 'high').length,
    },
  });
});

app.post('/api/requests/create', (req, res) => {
  const r = {
    ID: nextId(REQUESTS),
    REQUEST_NO: `TLP-${new Date().getFullYear()}-${String(nextId(REQUESTS)).padStart(3, '0')}`,
    STATUS: 'open',
    CREATED_DATE: new Date().toISOString().slice(0, 10),
    CREATED_BY: 'Admin KOM',
    ASSIGNED_TO: null,
    FILES: 0,
    ...req.body
  };
  REQUESTS.push(r);
  res.json({ success: true, data: r, message: 'Talep oluşturuldu' });
});

// ═══════════════════════════════════════════════════════
// ═══ İHALE / SATIN ALMA ═══
// ═══════════════════════════════════════════════════════
const TENDERS = [
  {
    ID: 1, TENDER_NO: 'IHL-2026-001', TITLE: 'Likralı Mayo Kumaşı Alımı',
    DESCRIPTION: 'Yaz 2026 koleksiyonu için 5000 metre likralı mayo kumaşı tedariki. %80 polyamid, %20 elastan. En az 3 renk seçeneği.',
    CATEGORY: 'Kumaş', QUANTITY: 5000, UNIT: 'metre', BUDGET: 900000, CURRENCY: 'TRY',
    STATUS: 'open', DEADLINE: '2026-04-25', CREATED_DATE: '2026-04-10', CREATED_BY: 'Mehmet Yılmaz',
    BIDS: [
      { ID: 1, SUPPLIER: 'Akdeniz İplik', CONTACT: 'Ali Çelik', PRICE: 165, TOTAL: 825000, DELIVERY_DAYS: 14, WARRANTY: '6 ay', NOTE: 'Stokta mevcut, hemen sevk edilebilir', RATING: 4.5, SUBMITTED: '2026-04-11' },
      { ID: 2, SUPPLIER: 'Ege Tekstil', CONTACT: 'Veli Demir', PRICE: 178, TOTAL: 890000, DELIVERY_DAYS: 10, WARRANTY: '12 ay', NOTE: 'Premium kalite, renk garantisi dahil', RATING: 4.8, SUBMITTED: '2026-04-12' },
      { ID: 3, SUPPLIER: 'Marmara Kumaş', CONTACT: 'Hasan Kara', PRICE: 152, TOTAL: 760000, DELIVERY_DAYS: 21, WARRANTY: '3 ay', NOTE: 'En düşük fiyat, teslimat süresi uzun', RATING: 3.9, SUBMITTED: '2026-04-13' },
    ]
  },
  {
    ID: 2, TENDER_NO: 'IHL-2026-002', TITLE: 'Polyester İplik Tedariki',
    DESCRIPTION: 'Üretim hattı için 500kg yüksek mukavemetli polyester iplik. 150 denye, beyaz ve siyah.',
    CATEGORY: 'İplik', QUANTITY: 500, UNIT: 'kg', BUDGET: 50000, CURRENCY: 'TRY',
    STATUS: 'evaluation', DEADLINE: '2026-04-20', CREATED_DATE: '2026-04-08', CREATED_BY: 'Emre Şahin',
    BIDS: [
      { ID: 1, SUPPLIER: 'Bursa İplik San.', CONTACT: 'Mustafa Yıldız', PRICE: 82, TOTAL: 41000, DELIVERY_DAYS: 7, WARRANTY: '—', NOTE: 'Yerli üretim, ISO sertifikalı', RATING: 4.2, SUBMITTED: '2026-04-09' },
      { ID: 2, SUPPLIER: 'Akdeniz İplik', CONTACT: 'Ali Çelik', PRICE: 88, TOTAL: 44000, DELIVERY_DAYS: 5, WARRANTY: '—', NOTE: 'Hızlı teslimat, KOM ile önceki çalışma mevcut', RATING: 4.5, SUBMITTED: '2026-04-10' },
    ]
  },
  {
    ID: 3, TENDER_NO: 'IHL-2026-003', TITLE: 'Karton Ambalaj Kutusu',
    DESCRIPTION: '30x20x15cm baskılı karton kutu, 5000 adet. KOM logosu ve ürün etiketi basılı.',
    CATEGORY: 'Ambalaj', QUANTITY: 5000, UNIT: 'adet', BUDGET: 75000, CURRENCY: 'TRY',
    STATUS: 'awarded', DEADLINE: '2026-04-15', CREATED_DATE: '2026-04-02', CREATED_BY: 'Fatma Çelik',
    AWARDED_TO: 'Trakya Ambalaj',
    BIDS: [
      { ID: 1, SUPPLIER: 'Trakya Ambalaj', CONTACT: 'Selim Arslan', PRICE: 11.5, TOTAL: 57500, DELIVERY_DAYS: 12, WARRANTY: '—', NOTE: 'Özel baskı dahil, ofset baskı', RATING: 4.6, SUBMITTED: '2026-04-04', WINNER: true },
      { ID: 2, SUPPLIER: 'İstanbul Ambalaj', CONTACT: 'Ayşe Güneş', PRICE: 13.2, TOTAL: 66000, DELIVERY_DAYS: 8, WARRANTY: '—', NOTE: 'Dijital baskı, hızlı teslimat', RATING: 4.1, SUBMITTED: '2026-04-05' },
      { ID: 3, SUPPLIER: 'Anadolu Karton', CONTACT: 'Mehmet Can', PRICE: 10.8, TOTAL: 54000, DELIVERY_DAYS: 25, WARRANTY: '—', NOTE: 'En ucuz ama teslimat çok geç', RATING: 3.5, SUBMITTED: '2026-04-06' },
    ]
  },
  {
    ID: 4, TENDER_NO: 'IHL-2026-004', TITLE: 'Reaktif Boya Seti',
    DESCRIPTION: 'Kırmızı, lacivert, siyah reaktif boya. Toplam 200kg. Oeko-Tex sertifikalı olmalı.',
    CATEGORY: 'Kimyasal', QUANTITY: 200, UNIT: 'kg', BUDGET: 120000, CURRENCY: 'TRY',
    STATUS: 'open', DEADLINE: '2026-04-30', CREATED_DATE: '2026-04-12', CREATED_BY: 'Zeynep Aydın',
    BIDS: [
      { ID: 1, SUPPLIER: 'Ege Boya Kimya', CONTACT: 'Kemal Öz', PRICE: 480, TOTAL: 96000, DELIVERY_DAYS: 10, WARRANTY: '—', NOTE: 'Oeko-Tex 100 sertifikalı, tüm renkler stokta', RATING: 4.7, SUBMITTED: '2026-04-13' },
    ]
  },
  {
    ID: 5, TENDER_NO: 'IHL-2026-005', TITLE: 'Metal Fermuar 20cm',
    DESCRIPTION: 'Nikel kaplama metal fermuar, 20cm, 3000 adet. Mayo ve iç giyim için uygun.',
    CATEGORY: 'Aksesuar', QUANTITY: 3000, UNIT: 'adet', BUDGET: 30000, CURRENCY: 'TRY',
    STATUS: 'closed', DEADLINE: '2026-04-05', CREATED_DATE: '2026-03-25', CREATED_BY: 'Emre Şahin',
    AWARDED_TO: null,
    BIDS: []
  },
];

const TENDER_STATUS = {
  draft: { label: 'Taslak', color: '#94a3b8' },
  open: { label: 'Açık', color: '#f59e0b' },
  evaluation: { label: 'Değerlendirme', color: '#8b5cf6' },
  awarded: { label: 'İhale Verildi', color: '#10b981' },
  closed: { label: 'Kapalı', color: '#64748b' },
};

app.post('/api/tenders', (req, res) => res.json({ success: true, data: TENDERS }));
app.post('/api/tenders/stats', (req, res) => {
  res.json({
    success: true,
    data: {
      total: TENDERS.length,
      open: TENDERS.filter(t => t.STATUS === 'open').length,
      evaluation: TENDERS.filter(t => t.STATUS === 'evaluation').length,
      awarded: TENDERS.filter(t => t.STATUS === 'awarded').length,
      totalBids: TENDERS.reduce((s, t) => s + t.BIDS.length, 0),
      totalBudget: TENDERS.reduce((s, t) => s + t.BUDGET, 0),
    }
  });
});

app.post('/api/tenders/create', (req, res) => {
  const t = {
    ID: nextId(TENDERS),
    TENDER_NO: `IHL-${new Date().getFullYear()}-${String(nextId(TENDERS)).padStart(3, '0')}`,
    STATUS: 'open',
    CREATED_DATE: new Date().toISOString().slice(0, 10),
    CREATED_BY: 'Admin KOM',
    BIDS: [],
    ...req.body
  };
  TENDERS.push(t);
  res.json({ success: true, data: t, message: 'İhale oluşturuldu' });
});

app.post('/api/tenders/bid', (req, res) => {
  const { tenderId, ...bid } = req.body;
  const tender = TENDERS.find(t => t.ID === tenderId);
  if (!tender) return res.status(404).json({ success: false, message: 'İhale bulunamadı' });
  bid.ID = (tender.BIDS.length || 0) + 1;
  bid.SUBMITTED = new Date().toISOString().slice(0, 10);
  tender.BIDS.push(bid);
  res.json({ success: true, data: bid, message: 'Teklif eklendi' });
});

app.post('/api/tenders/award', (req, res) => {
  const { tenderId, supplier } = req.body;
  const tender = TENDERS.find(t => t.ID === tenderId);
  if (!tender) return res.status(404).json({ success: false, message: 'İhale bulunamadı' });
  tender.STATUS = 'awarded';
  tender.AWARDED_TO = supplier;
  tender.BIDS.forEach(b => { b.WINNER = b.SUPPLIER === supplier; });
  res.json({ success: true, message: `İhale ${supplier} firmasına verildi` });
});

// ═══════════════════════════════════════════════════════
// ═══ HEDEFLER & PLANLAMA ═══
// ═══════════════════════════════════════════════════════
const TARGETS = [
  { ID: 1, YEAR: 2026, STORE: 'KOM Flagship İstanbul', PRODUCT: 'Likralı Bayan Mayo', TARGET_QTY: 3000, TARGET_REVENUE: 1350000, ACHIEVED_QTY: 1820, ACHIEVED_REVENUE: 819000, MONTHLY_PLAN: [0, 150, 200, 350, 500, 620, 680, 500, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 142, 195, 340, 510, 633, 0, 0, 0, 0, 0, 0] },
  { ID: 2, YEAR: 2026, STORE: 'KOM Flagship İstanbul', PRODUCT: 'Bikini Takımı', TARGET_QTY: 2500, TARGET_REVENUE: 950000, ACHIEVED_QTY: 1540, ACHIEVED_REVENUE: 585200, MONTHLY_PLAN: [0, 100, 150, 280, 420, 530, 580, 440, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 98, 148, 275, 418, 601, 0, 0, 0, 0, 0, 0] },
  { ID: 3, YEAR: 2026, STORE: 'KOM Ankara AVM', PRODUCT: 'Likralı Bayan Mayo', TARGET_QTY: 1800, TARGET_REVENUE: 810000, ACHIEVED_QTY: 980, ACHIEVED_REVENUE: 441000, MONTHLY_PLAN: [0, 80, 120, 200, 300, 380, 420, 300, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 75, 118, 195, 290, 302, 0, 0, 0, 0, 0, 0] },
  { ID: 4, YEAR: 2026, STORE: 'KOM Ankara AVM', PRODUCT: 'Erkek Plaj Şortu', TARGET_QTY: 1500, TARGET_REVENUE: 420000, ACHIEVED_QTY: 890, ACHIEVED_REVENUE: 249200, MONTHLY_PLAN: [0, 60, 100, 180, 260, 320, 340, 240, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 58, 95, 175, 255, 307, 0, 0, 0, 0, 0, 0] },
  { ID: 5, YEAR: 2026, STORE: 'KOM İzmir', PRODUCT: 'Çocuk Mayo Seti', TARGET_QTY: 1200, TARGET_REVENUE: 264000, ACHIEVED_QTY: 720, ACHIEVED_REVENUE: 158400, MONTHLY_PLAN: [0, 50, 80, 140, 210, 260, 280, 180, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 48, 82, 138, 205, 247, 0, 0, 0, 0, 0, 0] },
  { ID: 6, YEAR: 2026, STORE: 'KOM Antalya', PRODUCT: 'Likralı Bayan Mayo', TARGET_QTY: 2800, TARGET_REVENUE: 1260000, ACHIEVED_QTY: 1890, ACHIEVED_REVENUE: 850500, MONTHLY_PLAN: [0, 120, 180, 320, 480, 580, 620, 500, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 125, 185, 335, 495, 750, 0, 0, 0, 0, 0, 0] },
  { ID: 7, YEAR: 2026, STORE: 'KOM Antalya', PRODUCT: 'Bikini Takımı', TARGET_QTY: 2200, TARGET_REVENUE: 836000, ACHIEVED_QTY: 1430, ACHIEVED_REVENUE: 543400, MONTHLY_PLAN: [0, 90, 140, 260, 380, 480, 520, 330, 0, 0, 0, 0], MONTHLY_ACTUAL: [0, 88, 138, 258, 385, 561, 0, 0, 0, 0, 0, 0] },
  { ID: 8, YEAR: 2026, STORE: 'KOM Bursa Nilüfer', PRODUCT: 'Havlu Bornoz', TARGET_QTY: 800, TARGET_REVENUE: 308000, ACHIEVED_QTY: 420, ACHIEVED_REVENUE: 161700, MONTHLY_PLAN: [60, 70, 70, 80, 90, 100, 110, 100, 60, 60, 50, 50], MONTHLY_ACTUAL: [58, 65, 72, 82, 88, 55, 0, 0, 0, 0, 0, 0] },
];

// Ürün → BOM (Bill of Materials) — hangi ürün için ne kadar hammadde gerekir
const PRODUCT_BOM = {
  'Likralı Bayan Mayo': [
    { material: 'Likralı Mayo Kumaşı', qty: 0.8, unit: 'metre' },
    { material: 'Polyester İplik', qty: 0.05, unit: 'kg' },
    { material: 'Marka Etiketi', qty: 1, unit: 'adet' },
  ],
  'Bikini Takımı': [
    { material: 'Likralı Mayo Kumaşı', qty: 0.6, unit: 'metre' },
    { material: 'Metal Fermuar 20cm', qty: 1, unit: 'adet' },
    { material: 'Polyester İplik', qty: 0.04, unit: 'kg' },
    { material: 'Marka Etiketi', qty: 1, unit: 'adet' },
  ],
  'Erkek Plaj Şortu': [
    { material: 'Pamuk Kumaşı', qty: 1.2, unit: 'metre' },
    { material: 'Plastik Toka', qty: 2, unit: 'adet' },
    { material: 'Polyester İplik', qty: 0.06, unit: 'kg' },
  ],
  'Çocuk Mayo Seti': [
    { material: 'Likralı Mayo Kumaşı', qty: 0.4, unit: 'metre' },
    { material: 'Marka Etiketi', qty: 1, unit: 'adet' },
  ],
  'Havlu Bornoz': [
    { material: 'Pamuk Kumaşı', qty: 2.0, unit: 'metre' },
    { material: 'Polyester İplik', qty: 0.1, unit: 'kg' },
    { material: 'Reaktif Boya - Kırmızı', qty: 0.02, unit: 'kg' },
  ],
};

app.post('/api/targets', (req, res) => res.json({ success: true, data: TARGETS }));

app.post('/api/targets/create', (req, res) => {
  const t = {
    ID: nextId(TARGETS),
    YEAR: 2026,
    ACHIEVED_QTY: 0, ACHIEVED_REVENUE: 0,
    MONTHLY_PLAN: Array(12).fill(0),
    MONTHLY_ACTUAL: Array(12).fill(0),
    ...req.body
  };
  // Aylık plana basitçe dağıt
  if (t.TARGET_QTY && !req.body.MONTHLY_PLAN) {
    const monthlyQty = Math.round(t.TARGET_QTY / 12);
    t.MONTHLY_PLAN = Array(12).fill(monthlyQty);
  }
  TARGETS.push(t);
  res.json({ success: true, data: t, message: 'Hedef oluşturuldu' });
});

// Üretim planı — toplam gerçekleşme açığına göre
app.post('/api/targets/production-plan', (req, res) => {
  const byProduct = {};
  TARGETS.forEach(t => {
    if (!byProduct[t.PRODUCT]) byProduct[t.PRODUCT] = { target: 0, achieved: 0 };
    byProduct[t.PRODUCT].target += t.TARGET_QTY;
    byProduct[t.PRODUCT].achieved += t.ACHIEVED_QTY;
  });
  const plan = Object.entries(byProduct).map(([product, d]) => ({
    product,
    targetQty: d.target,
    achievedQty: d.achieved,
    remainingQty: Math.max(d.target - d.achieved, 0),
    completion: d.target ? Math.round((d.achieved / d.target) * 100) : 0,
    needed: Math.max(d.target - d.achieved, 0),
  }));
  res.json({ success: true, data: plan });
});

// Satın alma önerisi — üretim planına göre hammadde ihtiyacı
app.post('/api/targets/purchase-suggestions', (req, res) => {
  const byProduct = {};
  TARGETS.forEach(t => {
    if (!byProduct[t.PRODUCT]) byProduct[t.PRODUCT] = 0;
    byProduct[t.PRODUCT] += Math.max(t.TARGET_QTY - t.ACHIEVED_QTY, 0);
  });
  const materialNeeded = {};
  Object.entries(byProduct).forEach(([product, qty]) => {
    const bom = PRODUCT_BOM[product] || [];
    bom.forEach(b => {
      const key = b.material;
      if (!materialNeeded[key]) materialNeeded[key] = { material: key, needed: 0, unit: b.unit, forProducts: [] };
      materialNeeded[key].needed += b.qty * qty;
      materialNeeded[key].forProducts.push(`${product} (${qty} adet)`);
    });
  });
  // Mevcut stokla karşılaştır
  const suggestions = Object.values(materialNeeded).map(m => {
    const stock = INVENTORY.find(i => i.NAME === m.material);
    const currentStock = stock ? stock.STOCK : 0;
    const shortage = Math.max(Math.round(m.needed - currentStock), 0);
    const urgency = shortage > 0 ? (currentStock < m.needed * 0.3 ? 'critical' : 'high') : 'ok';
    return {
      material: m.material,
      needed: Math.round(m.needed),
      currentStock,
      shortage,
      unit: m.unit,
      urgency,
      forProducts: m.forProducts,
      suggestedOrderDate: urgency === 'critical' ? 'BUGÜN' : urgency === 'high' ? 'Bu hafta' : 'Acil değil',
      estimatedCost: stock ? shortage * (stock.UNIT_PRICE || 0) : 0,
    };
  });
  res.json({ success: true, data: suggestions });
});

// ═══════════════════════════════════════════════════════
// ═══ AKILLI ÖNGÖRÜLER (AI FORECAST) ═══
// ═══════════════════════════════════════════════════════
app.post('/api/forecast', (req, res) => {
  // Mock AI tahmin verileri
  res.json({
    success: true,
    data: {
      // Satış Tahmini
      sales: {
        lastMonth: 312000,
        currentMonth: 340000,
        nextMonthForecast: 365000,
        confidence: 87,
        trend: 'up',
        growthRate: 8.2,
        recommendation: 'Satış trendi güçlü, mevcut kapasiteyi genişletin',
        monthlyForecast: [
          { month: '2026-05', predicted: 365000, lower: 340000, upper: 390000 },
          { month: '2026-06', predicted: 385000, lower: 355000, upper: 415000 },
          { month: '2026-07', predicted: 420000, lower: 380000, upper: 460000 },
        ],
      },
      // Hedef Önerileri
      targets: [
        { module: 'Satış', current: 312000, suggested: 365000, reason: 'Son 3 ay ortalama büyüme %8.2', trend: 'up' },
        { module: 'Kâr Marjı', current: 32, suggested: 35, reason: 'Maliyet optimizasyonu ile ulaşılabilir', trend: 'up' },
        { module: 'Üretim Verimliliği', current: 87, suggested: 92, reason: 'Dikim Hattı B darboğazı giderilirse', trend: 'up' },
        { module: 'Müşteri Memnuniyeti', current: 89, suggested: 92, reason: 'VIP müşterilere özel servis ile', trend: 'up' },
      ],
      // Stok Uyarıları (Öngörü)
      stockAlerts: [
        { product: 'Polyester İplik', currentStock: 150, dailyUsage: 12, daysUntilCritical: 12, urgency: 'high', suggestion: 'Bugün sipariş verin — tedarikçi teslimatı 7 gün' },
        { product: 'Metal Fermuar 20cm', currentStock: 120, dailyUsage: 8, daysUntilCritical: 15, urgency: 'high', suggestion: 'Bu hafta sipariş gerekli' },
        { product: 'Yumuşatıcı Kimyasalı', currentStock: 30, dailyUsage: 2, daysUntilCritical: 15, urgency: 'medium', suggestion: 'Önümüzdeki hafta takip edin' },
        { product: 'Saten Kumaş', currentStock: 200, dailyUsage: 10, daysUntilCritical: 20, urgency: 'medium', suggestion: 'Tedarikçiye haber verin' },
      ],
      // Nakit Akış Tahmini
      cashFlow: {
        currentCash: 847000,
        expected30Days: { in: 425000, out: 280000 },
        expected60Days: { in: 680000, out: 540000 },
        projection: 952000,
        risk: 'low',
        note: 'Nakit akış sağlıklı. Gecikmiş 34K alacak tahsil edilirse daha iyi.',
      },
      // İhale Başarı Tahmini
      tenderSuccess: {
        activeTenders: 2,
        avgWinRate: 68,
        predictedWins: 1,
        recommendations: [
          'Akdeniz İplik ihalesi: %75 kazanma olasılığı (geçmiş rekabet)',
          'Reaktif Boya ihalesi: Yalnız bir teklif geldi, kesin alım',
        ],
      },
      // Tedarikçi Performans Uyarıları
      supplierRisks: [
        { supplier: 'Marmara Kumaş', risk: 'medium', note: 'Son 3 teslimatta ortalama 3 gün gecikme', trend: 'worsening' },
        { supplier: 'Ege Tekstil', risk: 'low', note: 'Performans istikrarlı, 12 ay puan ortalaması 4.8', trend: 'stable' },
        { supplier: 'Akdeniz İplik', risk: 'low', note: 'En güvenilir tedarikçi, öncelik verin', trend: 'improving' },
      ],
      // Pazarlama Önerileri
      insights: [
        { icon: 'trending-up', title: 'Yaz sezonu yaklaşıyor', text: 'Mayo kategorisi önümüzdeki 2 ayda %40 artış gösterecek. Stoğu şimdiden artırın.', priority: 'high' },
        { icon: 'users', title: 'VIP müşteri riski', text: 'Boyner 30 gündür sipariş vermedi. Proaktif iletişim önerilir.', priority: 'medium' },
        { icon: 'dollar-sign', title: 'Fiyatlandırma fırsatı', text: 'Premium kumaş kategorisinde %5 zam rekabet avantajını korur.', priority: 'low' },
        { icon: 'alert-circle', title: 'Üretim darboğazı', text: 'Dikim Hattı B %95 kapasitede. 3 hafta içinde ek kapasite gerekli.', priority: 'high' },
        { icon: 'package', title: 'Envanter optimizasyonu', text: 'Ambalaj stoğu fazla — 2 ay yeterli, sipariş duraklatın.', priority: 'low' },
      ],
      // Genel skorlama
      healthScore: {
        overall: 84,
        sales: 91,
        production: 87,
        finance: 82,
        inventory: 76,
        supplier: 88,
      },
      generatedAt: new Date().toISOString(),
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — MESAJLAŞMA ═══
// ═══════════════════════════════════════════════════════
const MESSAGES = [
  { ID: 1, FIRM: 'Akdeniz İplik', SENDER: 'supplier', FROM: 'Ali Çelik', TEXT: 'IHL-2026-001 için numune gönderebilir miyiz?', DATE: '2026-04-11 09:30', READ: true },
  { ID: 2, FIRM: 'Akdeniz İplik', SENDER: 'admin', FROM: 'Mehmet Yılmaz', TEXT: 'Evet, numune bekliyoruz. Adres: Fabrika A, Kesimhane.', DATE: '2026-04-11 10:15', READ: true },
  { ID: 3, FIRM: 'Akdeniz İplik', SENDER: 'supplier', FROM: 'Ali Çelik', TEXT: 'Numune kargoya verildi. Takip no: TR12345678', DATE: '2026-04-12 14:00', READ: false },
  { ID: 4, FIRM: 'Ege Tekstil', SENDER: 'supplier', FROM: 'Veli Demir', TEXT: 'Kumaş örnekleri hazır, onay bekliyor', DATE: '2026-04-13 08:45', READ: false },
  { ID: 5, FIRM: 'Trakya Ambalaj', SENDER: 'admin', FROM: 'Fatma Çelik', TEXT: 'Ambalaj siparişi onaylandı. Üretim ne zaman başlar?', DATE: '2026-04-10 16:20', READ: true },
  { ID: 6, FIRM: 'Trakya Ambalaj', SENDER: 'supplier', FROM: 'Selim Arslan', TEXT: 'Baskı kalıpları hazırlanıyor, 3 gün içinde üretime geçeriz.', DATE: '2026-04-11 09:00', READ: true },
];

app.post('/api/supplier/messages', (req, res) => {
  const { firm } = req.body;
  const msgs = firm ? MESSAGES.filter(m => m.FIRM === firm) : MESSAGES;
  res.json({ success: true, data: msgs });
});

app.post('/api/supplier/messages/send', (req, res) => {
  const msg = { ID: MESSAGES.length + 1, READ: false, DATE: new Date().toISOString().replace('T', ' ').slice(0, 16), ...req.body };
  MESSAGES.push(msg);
  res.json({ success: true, data: msg, message: 'Mesaj gönderildi' });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — DÖKÜMANLAR ═══
// ═══════════════════════════════════════════════════════
const DOCUMENTS = [
  { ID: 1, FIRM: 'Akdeniz İplik', NAME: 'ISO 9001 Sertifikası', TYPE: 'sertifika', SIZE: '2.4 MB', DATE: '2026-01-15', STATUS: 'approved' },
  { ID: 2, FIRM: 'Akdeniz İplik', NAME: 'Ticaret Sicil Gazetesi', TYPE: 'resmi', SIZE: '1.8 MB', DATE: '2025-11-20', STATUS: 'approved' },
  { ID: 3, FIRM: 'Akdeniz İplik', NAME: 'Vergi Levhası 2026', TYPE: 'resmi', SIZE: '0.5 MB', DATE: '2026-03-01', STATUS: 'approved' },
  { ID: 4, FIRM: 'Ege Tekstil', NAME: 'Oeko-Tex Standard 100', TYPE: 'sertifika', SIZE: '3.1 MB', DATE: '2026-02-10', STATUS: 'approved' },
  { ID: 5, FIRM: 'Ege Tekstil', NAME: 'Kapasite Raporu', TYPE: 'rapor', SIZE: '4.2 MB', DATE: '2025-12-05', STATUS: 'pending' },
  { ID: 6, FIRM: 'Trakya Ambalaj', NAME: 'FSC Sertifikası', TYPE: 'sertifika', SIZE: '1.2 MB', DATE: '2026-01-20', STATUS: 'approved' },
];

app.post('/api/supplier/documents', (req, res) => {
  const { firm } = req.body;
  const docs = firm ? DOCUMENTS.filter(d => d.FIRM === firm) : DOCUMENTS;
  res.json({ success: true, data: docs });
});

app.post('/api/supplier/documents/upload', (req, res) => {
  const doc = { ID: DOCUMENTS.length + 1, STATUS: 'pending', DATE: new Date().toISOString().slice(0, 10), SIZE: '1.0 MB', ...req.body };
  DOCUMENTS.push(doc);
  res.json({ success: true, data: doc, message: 'Döküman yüklendi' });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — FATURA & ÖDEME ═══
// ═══════════════════════════════════════════════════════
const SUPPLIER_INVOICES = [
  { ID: 1, FIRM: 'Trakya Ambalaj', INVOICE_NO: 'TRK-2026-001', AMOUNT: 57500, DATE: '2026-04-08', DUE_DATE: '2026-05-08', STATUS: 'paid', PAID_DATE: '2026-04-20', DESCRIPTION: 'Karton kutu siparişi - IHL-2026-003' },
  { ID: 2, FIRM: 'Akdeniz İplik', INVOICE_NO: 'AKD-2026-001', AMOUNT: 825000, DATE: '2026-04-15', DUE_DATE: '2026-05-15', STATUS: 'pending', PAID_DATE: null, DESCRIPTION: 'Likralı mayo kumaşı - IHL-2026-001' },
  { ID: 3, FIRM: 'Akdeniz İplik', INVOICE_NO: 'AKD-2026-002', AMOUNT: 44000, DATE: '2026-04-12', DUE_DATE: '2026-05-12', STATUS: 'pending', PAID_DATE: null, DESCRIPTION: 'Polyester iplik - IHL-2026-002' },
  { ID: 4, FIRM: 'Ege Tekstil', INVOICE_NO: 'EGE-2026-001', AMOUNT: 156000, DATE: '2026-03-20', DUE_DATE: '2026-04-20', STATUS: 'overdue', PAID_DATE: null, DESCRIPTION: 'Önceki dönem kumaş siparişi' },
  { ID: 5, FIRM: 'Trakya Ambalaj', INVOICE_NO: 'TRK-2025-012', AMOUNT: 32000, DATE: '2025-12-15', DUE_DATE: '2026-01-15', STATUS: 'paid', PAID_DATE: '2026-01-10', DESCRIPTION: 'Etiket baskı' },
];

app.post('/api/supplier/invoices', (req, res) => {
  const { firm } = req.body;
  const invs = firm ? SUPPLIER_INVOICES.filter(i => i.FIRM === firm) : SUPPLIER_INVOICES;
  res.json({ success: true, data: invs });
});

app.post('/api/supplier/invoices/create', (req, res) => {
  const inv = { ID: SUPPLIER_INVOICES.length + 1, STATUS: 'pending', PAID_DATE: null, DATE: new Date().toISOString().slice(0, 10), ...req.body };
  SUPPLIER_INVOICES.push(inv);
  res.json({ success: true, data: inv, message: 'Fatura oluşturuldu' });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — BİLDİRİMLER ═══
// ═══════════════════════════════════════════════════════
const SUPPLIER_NOTIFICATIONS = [
  { ID: 1, FIRM: 'Akdeniz İplik', TYPE: 'tender', TITLE: 'Yeni ihale açıldı', TEXT: 'Likralı Mayo Kumaşı Alımı - 5000 metre', DATE: '2026-04-10', READ: true },
  { ID: 2, FIRM: 'Akdeniz İplik', TYPE: 'bid', TITLE: 'Teklifiniz değerlendirildi', TEXT: 'IHL-2026-001 için teklifiniz inceleniyor', DATE: '2026-04-12', READ: false },
  { ID: 3, FIRM: 'Trakya Ambalaj', TYPE: 'award', TITLE: 'İhale kazandınız!', TEXT: 'IHL-2026-003 Karton Ambalaj ihalesini kazandınız', DATE: '2026-04-07', READ: true },
  { ID: 4, FIRM: 'Trakya Ambalaj', TYPE: 'payment', TITLE: 'Ödeme yapıldı', TEXT: 'TRK-2026-001 faturası ödendi: ₺57.500', DATE: '2026-04-20', READ: false },
  { ID: 5, FIRM: 'Ege Tekstil', TYPE: 'tender', TITLE: 'Yeni ihale: Reaktif Boya', TEXT: '200kg reaktif boya tedariki, son tarih: 30 Nisan', DATE: '2026-04-12', READ: false },
  { ID: 6, FIRM: 'Akdeniz İplik', TYPE: 'message', TITLE: 'Yeni mesaj', TEXT: 'Admin numune hakkında mesaj gönderdi', DATE: '2026-04-11', READ: true },
  { ID: 7, FIRM: 'Ege Tekstil', TYPE: 'document', TITLE: 'Döküman onay bekliyor', TEXT: 'Kapasite Raporu henüz onaylanmadı', DATE: '2026-04-13', READ: false },
];

app.post('/api/supplier/notifications', (req, res) => {
  const { firm } = req.body;
  const notifs = firm ? SUPPLIER_NOTIFICATIONS.filter(n => n.FIRM === firm) : SUPPLIER_NOTIFICATIONS;
  res.json({ success: true, data: notifs });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — ÜRÜN KATALOĞU ═══
// ═══════════════════════════════════════════════════════
const SUPPLIER_PRODUCTS = [
  { ID: 1, FIRM: 'Akdeniz İplik', NAME: 'Likralı Mayo Kumaşı', CATEGORY: 'Kumaş', UNIT_PRICE: 165, UNIT: 'metre', MIN_ORDER: 500, LEAD_TIME: 14, DESCRIPTION: '%80 polyamid, %20 elastan. 10 renk seçeneği.', IN_STOCK: true },
  { ID: 2, FIRM: 'Akdeniz İplik', NAME: 'Polyester İplik 150D', CATEGORY: 'İplik', UNIT_PRICE: 88, UNIT: 'kg', MIN_ORDER: 100, LEAD_TIME: 5, DESCRIPTION: 'Yüksek mukavemet, beyaz ve siyah.', IN_STOCK: true },
  { ID: 3, FIRM: 'Akdeniz İplik', NAME: 'Pamuklu Kumaş 190gsm', CATEGORY: 'Kumaş', UNIT_PRICE: 120, UNIT: 'metre', MIN_ORDER: 300, LEAD_TIME: 10, DESCRIPTION: '%100 pamuk, penye örgü.', IN_STOCK: false },
  { ID: 4, FIRM: 'Ege Tekstil', NAME: 'Premium Likra Kumaş', CATEGORY: 'Kumaş', UNIT_PRICE: 195, UNIT: 'metre', MIN_ORDER: 200, LEAD_TIME: 7, DESCRIPTION: 'İtalyan kalitesinde, Oeko-Tex sertifikalı.', IN_STOCK: true },
  { ID: 5, FIRM: 'Trakya Ambalaj', NAME: 'Baskılı Karton Kutu', CATEGORY: 'Ambalaj', UNIT_PRICE: 11.5, UNIT: 'adet', MIN_ORDER: 1000, LEAD_TIME: 12, DESCRIPTION: 'Ofset baskı, özel tasarım.', IN_STOCK: true },
  { ID: 6, FIRM: 'Trakya Ambalaj', NAME: 'Marka Etiketi', CATEGORY: 'Ambalaj', UNIT_PRICE: 1.8, UNIT: 'adet', MIN_ORDER: 5000, LEAD_TIME: 5, DESCRIPTION: 'Dokuma etiket, çift taraflı.', IN_STOCK: true },
  { ID: 7, FIRM: 'Ege Boya Kimya', NAME: 'Reaktif Boya Kırmızı', CATEGORY: 'Kimyasal', UNIT_PRICE: 480, UNIT: 'kg', MIN_ORDER: 50, LEAD_TIME: 10, DESCRIPTION: 'Oeko-Tex 100 sertifikalı.', IN_STOCK: true },
];

app.post('/api/supplier/products', (req, res) => {
  const { firm } = req.body;
  const prods = firm ? SUPPLIER_PRODUCTS.filter(p => p.FIRM === firm) : SUPPLIER_PRODUCTS;
  res.json({ success: true, data: prods });
});

app.post('/api/supplier/products/create', (req, res) => {
  const prod = { ID: SUPPLIER_PRODUCTS.length + 1, IN_STOCK: true, ...req.body };
  SUPPLIER_PRODUCTS.push(prod);
  res.json({ success: true, data: prod, message: 'Ürün eklendi' });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — TESLİMAT TAKİBİ ═══
// ═══════════════════════════════════════════════════════
const DELIVERIES = [
  { ID: 1, FIRM: 'Trakya Ambalaj', ORDER: 'IHL-2026-003', PRODUCT: 'Baskılı Karton Kutu', QUANTITY: 5000, STATUS: 'in_transit', TRACKING: 'TR98765432', CARRIER: 'Aras Kargo', SHIP_DATE: '2026-04-14', EST_DELIVERY: '2026-04-18', STEPS: [
    { label: 'Sipariş Onayı', date: '2026-04-08', done: true },
    { label: 'Üretim Başladı', date: '2026-04-10', done: true },
    { label: 'Üretim Tamamlandı', date: '2026-04-13', done: true },
    { label: 'Kargoya Verildi', date: '2026-04-14', done: true },
    { label: 'Teslim Edildi', date: null, done: false },
  ]},
  { ID: 2, FIRM: 'Akdeniz İplik', ORDER: 'IHL-2026-001', PRODUCT: 'Likralı Mayo Kumaşı', QUANTITY: 5000, STATUS: 'production', TRACKING: null, CARRIER: null, SHIP_DATE: null, EST_DELIVERY: '2026-04-28', STEPS: [
    { label: 'Sipariş Onayı', date: '2026-04-12', done: true },
    { label: 'Üretim Başladı', date: '2026-04-14', done: true },
    { label: 'Üretim Tamamlandı', date: null, done: false },
    { label: 'Kargoya Verildi', date: null, done: false },
    { label: 'Teslim Edildi', date: null, done: false },
  ]},
];

app.post('/api/supplier/deliveries', (req, res) => {
  const { firm } = req.body;
  const dels = firm ? DELIVERIES.filter(d => d.FIRM === firm) : DELIVERIES;
  res.json({ success: true, data: dels });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — SÖZLEŞMELER ═══
// ═══════════════════════════════════════════════════════
const CONTRACTS = [
  { ID: 1, FIRM: 'Akdeniz İplik', TITLE: 'Çerçeve Tedarik Sözleşmesi 2026', STATUS: 'active', START: '2026-01-01', END: '2026-12-31', VALUE: 2000000, SIGNED_DATE: '2025-12-20', SIGNED_BY: 'Ali Çelik' },
  { ID: 2, FIRM: 'Trakya Ambalaj', TITLE: 'Ambalaj Tedarik Anlaşması', STATUS: 'active', START: '2026-03-01', END: '2026-08-31', VALUE: 350000, SIGNED_DATE: '2026-02-25', SIGNED_BY: 'Selim Arslan' },
  { ID: 3, FIRM: 'Ege Tekstil', TITLE: 'Premium Kumaş Tedarik Sözleşmesi', STATUS: 'pending', START: '2026-05-01', END: '2027-04-30', VALUE: 1500000, SIGNED_DATE: null, SIGNED_BY: null },
  { ID: 4, FIRM: 'Akdeniz İplik', TITLE: 'İplik Tedarik Ek Protokolü', STATUS: 'expired', START: '2025-06-01', END: '2025-12-31', VALUE: 500000, SIGNED_DATE: '2025-05-28', SIGNED_BY: 'Ali Çelik' },
];

app.post('/api/supplier/contracts', (req, res) => {
  const { firm } = req.body;
  const cons = firm ? CONTRACTS.filter(c => c.FIRM === firm) : CONTRACTS;
  res.json({ success: true, data: cons });
});

app.post('/api/supplier/contracts/sign', (req, res) => {
  const { contractId, signedBy } = req.body;
  const c = CONTRACTS.find(x => x.ID === contractId);
  if (c) { c.STATUS = 'active'; c.SIGNED_DATE = new Date().toISOString().slice(0, 10); c.SIGNED_BY = signedBy; }
  res.json({ success: true, message: 'Sözleşme imzalandı' });
});

// ═══════════════════════════════════════════════════════
// ═══ TEDARİKÇİ — PERFORMANS ═══
// ═══════════════════════════════════════════════════════
app.post('/api/supplier/performance', (req, res) => {
  const { firm } = req.body;
  const account = SUPPLIER_ACCOUNTS.find(a => a.FIRM === firm);
  // Mock performans verileri
  res.json({
    success: true,
    data: {
      rating: account?.RATING || 4.0,
      onTimeDelivery: 94,
      qualityScore: 97,
      responseTime: '2.4 saat',
      totalOrders: 23,
      completedOrders: 21,
      returnRate: 1.2,
      avgDeliveryDays: 11,
      monthlyPerformance: [
        { month: '2025-11', score: 88 },
        { month: '2025-12', score: 91 },
        { month: '2026-01', score: 93 },
        { month: '2026-02', score: 90 },
        { month: '2026-03', score: 95 },
        { month: '2026-04', score: 97 },
      ],
      badges: [
        { name: 'Zamanında Teslimat', icon: 'clock', earned: true },
        { name: 'Kalite Şampiyonu', icon: 'shield', earned: true },
        { name: 'Hızlı Yanıt', icon: 'zap', earned: true },
        { name: 'Güvenilir Tedarikçi', icon: 'award', earned: false },
      ],
    },
  });
});

// ═══════════════════════════════════════════════════════
// ═══ CREATE ENDPOINT'LER (Mock — in-memory) ═══
// ═══════════════════════════════════════════════════════
const nextId = (arr) => (arr.reduce((m, x) => Math.max(m, x.ID || 0), 0) + 1);

app.post('/api/hr/employees/create', (req, res) => {
  const emp = { ID: nextId(EMPLOYEES), STATUS: 'active', PERFORMANCE: 80, LEAVE_BALANCE: 14, ...req.body };
  EMPLOYEES.push(emp);
  res.json({ success: true, data: emp, message: 'Personel eklendi' });
});

app.post('/api/hr/leaves/create', (req, res) => {
  const lv = { ID: nextId(LEAVES), STATUS: 'pending', ...req.body };
  LEAVES.push(lv);
  res.json({ success: true, data: lv, message: 'İzin talebi oluşturuldu' });
});

app.post('/api/quotes/create', (req, res) => {
  const q = {
    ID: nextId(QUOTES),
    QUOTE_NO: `TKF-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${String(nextId(QUOTES)).padStart(3, '0')}`,
    STATUS: 'draft', VERSION: 1, CURRENCY: 'TRY',
    CREATED_DATE: new Date().toISOString().slice(0, 10),
    ...req.body
  };
  QUOTES.push(q);
  res.json({ success: true, data: q, message: 'Teklif oluşturuldu' });
});

app.post('/api/production/create', (req, res) => {
  const p = {
    ID: nextId(PRODUCTIONS),
    ORDER_NO: `URT-${String(nextId(PRODUCTIONS)).padStart(3, '0')}`,
    STATUS: 'design', PROGRESS: 0, UNIT: 'adet',
    ...req.body
  };
  PRODUCTIONS.push(p);
  res.json({ success: true, data: p, message: 'Üretim oluşturuldu' });
});

app.post('/api/inventory/create', (req, res) => {
  const i = {
    ID: nextId(INVENTORY), STATUS: 'normal',
    LAST_UPDATE: new Date().toISOString().slice(0, 10),
    ...req.body
  };
  INVENTORY.push(i);
  res.json({ success: true, data: i, message: 'Stok kalemi eklendi' });
});

app.post('/api/finance/invoices/create', (req, res) => {
  const prefix = req.body.TYPE === 'expense' ? 'GDR' : 'FTR';
  const inv = {
    ID: nextId(INVOICES),
    INVOICE_NO: `${prefix}-${new Date().getFullYear()}-${String(nextId(INVOICES)).padStart(3, '0')}`,
    STATUS: 'pending',
    DATE: new Date().toISOString().slice(0, 10),
    ...req.body
  };
  INVOICES.push(inv);
  res.json({ success: true, data: inv, message: 'Fatura oluşturuldu' });
});

app.post('/api/crm/customers/create', (req, res) => {
  const c = {
    ID: nextId(CUSTOMERS), TOTAL_ORDERS: 0, TOTAL_REVENUE: 0,
    SEGMENT: 'new', SATISFACTION: 80,
    LAST_ORDER: new Date().toISOString().slice(0, 10),
    ...req.body
  };
  CUSTOMERS.push(c);
  res.json({ success: true, data: c, message: 'Müşteri eklendi' });
});

app.post('/api/products/create', (req, res) => {
  const p = {
    ID: nextId(PRODUCTS), STATUS: 'active',
    COLORS: [], SIZES: [],
    ...req.body
  };
  PRODUCTS.push(p);
  res.json({ success: true, data: p, message: 'Ürün eklendi' });
});

app.post('/api/quality/create', (req, res) => {
  const q = {
    ID: nextId(QUALITY_CHECKS),
    DATE: new Date().toISOString().slice(0, 10),
    STATUS: 'passed',
    ...req.body
  };
  QUALITY_CHECKS.push(q);
  res.json({ success: true, data: q, message: 'Kalite kontrol kaydedildi' });
});

app.post('/api/tasks/create', (req, res) => {
  const t = {
    ID: nextId(TASKS), STATUS: 'pending',
    ...req.body
  };
  TASKS.push(t);
  res.json({ success: true, data: t, message: 'Görev oluşturuldu' });
});

app.post('/api/collections/create', (req, res) => {
  const c = {
    ID: nextId(COLLECTIONS), STATUS: 'planning',
    PROGRESS: 0, SPENT: 0,
    COLOR: '#E81E25',
    ...req.body
  };
  COLLECTIONS.push(c);
  res.json({ success: true, data: c, message: 'Koleksiyon oluşturuldu' });
});

app.post('/api/stores/create', (req, res) => {
  const s = {
    ID: nextId(STORES), STATUS: 'active',
    MONTHLY_SALES: 0, RATING: 0,
    ...req.body
  };
  STORES.push(s);
  res.json({ success: true, data: s, message: 'Mağaza eklendi' });
});

const PORT = 3100;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KOM Portal API çalışıyor: http://localhost:${PORT} (LAN erişimi açık)`);
});
