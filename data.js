/* global React */
// =====================================================
// AutoGest — Mock data
// =====================================================

const MOCK_DATA = {
  workshop: {
    name: "DRIL AUTOCENTER",
    plan: "Professional",
  },
  user: {
    name: "Administrador",
    email: "admin@oficina.com",
    initials: "A",
  },

  clients: [
    { id: "c1", name: "Antonio Carlos Bezerra",   phone: "(41) 98808-1520", email: "antoniocbezerra@gmail.com", cpf: "024.875.860-87", since: "30/04/2026", agoDays: 7,  vehicles: 1, totalSpent: 2720.00 },
    { id: "c2", name: "João da Silva",            phone: "(41) 9999-9999",  email: "joaodasilva@gmail.com",     cpf: "324.458.581-98", since: "29/04/2026", agoDays: 9,  vehicles: 1, totalSpent: 480.00 },
    { id: "c3", name: "Sophia Bernadoque de Souza",phone: "(41) 98806-0708", email: "sophiabernadoque@gmail.com",cpf: "156.620.879-38", since: "30/04/2026", agoDays: 7,  vehicles: 1, totalSpent: 365.00 },
    { id: "c4", name: "Wagner de Souza",          phone: "(41) 99846-6830", email: "wagnerdesouza.88@gmail.com",cpf: "060.734.649-32", since: "29/04/2026", agoDays: 9,  vehicles: 2, totalSpent: 855.00 },
    { id: "c5", name: "Marina Ferraz",            phone: "(41) 99721-4408", email: "marina.ferraz@hotmail.com", cpf: "473.998.221-04", since: "22/04/2026", agoDays: 16, vehicles: 1, totalSpent: 1240.00 },
    { id: "c6", name: "Rafael Albuquerque",       phone: "(41) 99113-7782", email: "rafa.albuq@outlook.com",    cpf: "812.045.117-66", since: "18/04/2026", agoDays: 20, vehicles: 1, totalSpent: 0 },
  ],

  vehicles: [
    { id: "v1", plate: "MBT-4E58", brand: "GM",      model: "Chevrolet Corsa Sedan Maxx 1.4",  year: 2023, color: "Preto",  ownerId: "c3", lastServiceDays: 12 },
    { id: "v2", plate: "AUM-8V64", brand: "Fiat",    model: "ARGO PRECISION 1.8 16V Flex",     year: 2018, color: "Prata",  ownerId: "c1", lastServiceDays: 8  },
    { id: "v3", plate: "FTO-6H64", brand: "GM",      model: "Chevrolet SPIN LS 1.8 8V Econoflex", year: 2014, color: "Cinza", ownerId: "c4", lastServiceDays: 4 },
    { id: "v4", plate: "HSC-1I29", brand: "Hyundai", model: "HB20 C.Style/C.Plus 1.6 Flex",    year: 2020, color: "Branco", ownerId: "c2", lastServiceDays: 22 },
    { id: "v5", plate: "QYP-5N4A", brand: "Fiat",    model: "Toro Freedom 1.8 16V Flex AT6",    year: 2021, color: "Vermelho", ownerId: "c5", lastServiceDays: 35 },
    { id: "v6", plate: "WGT-3R88", brand: "VW",      model: "Polo MPI 1.6 16V Flex",            year: 2022, color: "Branco", ownerId: "c4", lastServiceDays: 60 },
  ],

  orders: [
    {
      id: "o1", code: "1ESHP7", vehicleId: "v3", clientId: "c4",
      services: ["Diagnóstico eletrônico"],
      products: 1,
      status: "open", total: 185.00,
      entry: "04/05/2026", forecast: "05/05/2026", delivery: "05/05/2026",
      mechanic: "Eduardo S."
    },
    {
      id: "o2", code: "NIDY13", vehicleId: "v1", clientId: "c3",
      services: ["Troca de pastilhas dianteiras", "Troca de pastilhas traseiras"],
      products: 1,
      status: "in_progress", total: 365.00,
      entry: "27/04/2026", forecast: "29/04/2026", delivery: "03/05/2026",
      mechanic: "Bruno A."
    },
    {
      id: "o3", code: "QYP5NA", vehicleId: "v2", clientId: "c1",
      services: ["Troca de corrente do comando", "Troca de óleo e filtro"],
      products: 0,
      status: "open", total: 2720.00,
      entry: "28/04/2026", forecast: "08/05/2026", delivery: "29/04/2026",
      mechanic: "Eduardo S."
    },
    {
      id: "o4", code: "HMTX0N", vehicleId: "v3", clientId: "c4",
      services: ["Revisão geral", "Troca de óleo e filtro", "Alinhamento"],
      products: 0,
      status: "done", total: 670.00,
      entry: "24/04/2026", forecast: "25/04/2026", delivery: "26/04/2026",
      mechanic: "Bruno A."
    },
    {
      id: "o5", code: "K2BV9F", vehicleId: "v4", clientId: "c2",
      services: ["Troca de bateria"],
      products: 1,
      status: "done", total: 480.00,
      entry: "21/04/2026", forecast: "21/04/2026", delivery: "21/04/2026",
      mechanic: "Carlos M."
    },
    {
      id: "o6", code: "PR4NX1", vehicleId: "v5", clientId: "c5",
      services: ["Troca de embreagem"],
      products: 0,
      status: "waiting_part", total: 1240.00,
      entry: "02/05/2026", forecast: "10/05/2026", delivery: "—",
      mechanic: "Bruno A."
    },
    {
      id: "o7", code: "ZX9D44", vehicleId: "v6", clientId: "c4",
      services: ["Diagnóstico de ar-condicionado"],
      products: 0,
      status: "cancelled", total: 0,
      entry: "10/04/2026", forecast: "—", delivery: "—",
      mechanic: "—"
    },
  ],

  inventory: [
    { id: "i1", sku: "OL-5W30-LT", name: "Óleo Sintético 5W30",          category: "Lubrificante", brand: "Mobil", stock: 24, min: 10, price: 58.90,  cost: 38.00 },
    { id: "i2", sku: "FILT-AR-001", name: "Filtro de Ar Motor",          category: "Filtro",       brand: "Tecfil", stock: 4, min: 8,  price: 42.00,  cost: 22.50 },
    { id: "i3", sku: "FILT-OL-001", name: "Filtro de Óleo",              category: "Filtro",       brand: "Mann",   stock: 18, min: 6, price: 28.00,  cost: 12.40 },
    { id: "i4", sku: "PAST-DT-FRT", name: "Pastilha de Freio Dianteira", category: "Freios",       brand: "Bosch",  stock: 12, min: 4, price: 145.00, cost: 78.00 },
    { id: "i5", sku: "PAST-DT-TRS", name: "Pastilha de Freio Traseira",  category: "Freios",       brand: "Bosch",  stock: 9,  min: 4, price: 128.00, cost: 64.00 },
    { id: "i6", sku: "BAT-60AH",    name: "Bateria 60Ah",                category: "Elétrica",     brand: "Moura",  stock: 3,  min: 4, price: 480.00, cost: 320.00 },
    { id: "i7", sku: "VELA-IRD",    name: "Vela Iridium NGK",            category: "Ignição",      brand: "NGK",    stock: 36, min: 12, price: 38.00, cost: 18.00 },
    { id: "i8", sku: "PAL-GW-22",   name: "Palheta Limpador 22\"",       category: "Acessório",    brand: "Bosch",  stock: 0,  min: 6, price: 49.00, cost: 24.00 },
    { id: "i9", sku: "AMRT-DTF",    name: "Amortecedor Dianteiro",       category: "Suspensão",    brand: "Cofap",  stock: 5,  min: 2, price: 380.00, cost: 240.00 },
    { id: "i10",sku: "CORR-DENT",   name: "Correia Dentada",             category: "Motor",        brand: "Gates",  stock: 14, min: 4, price: 180.00, cost: 92.00 },
  ],

  finance: [
    { id: "f1", date: "04/05/2026", desc: "OS #1ESHP7 — Diagnóstico",     type: "in",  status: "received", amount: 185.00,  method: "PIX",        category: "Serviço" },
    { id: "f2", date: "03/05/2026", desc: "OS #NIDY13 — Pastilhas",       type: "in",  status: "received", amount: 365.00,  method: "Cartão",     category: "Serviço" },
    { id: "f3", date: "02/05/2026", desc: "Compra peças — Bosch",         type: "out", status: "paid",     amount: 1840.00, method: "Boleto",     category: "Estoque" },
    { id: "f4", date: "30/04/2026", desc: "OS #HMTX0N — Revisão geral",   type: "in",  status: "received", amount: 670.00,  method: "PIX",        category: "Serviço" },
    { id: "f5", date: "29/04/2026", desc: "OS #QYP5NA — Corrente comando",type: "in",  status: "pending",  amount: 2720.00, method: "Boleto",     category: "Serviço" },
    { id: "f6", date: "28/04/2026", desc: "Aluguel oficina — Maio",       type: "out", status: "scheduled",amount: 4200.00, method: "Transf.",    category: "Fixo" },
    { id: "f7", date: "26/04/2026", desc: "Salário Bruno A.",             type: "out", status: "paid",     amount: 3200.00, method: "Transf.",    category: "Folha" },
    { id: "f8", date: "21/04/2026", desc: "OS #K2BV9F — Bateria",         type: "in",  status: "received", amount: 480.00,  method: "Cartão",     category: "Serviço" },
    { id: "f9", date: "20/04/2026", desc: "Energia elétrica",             type: "out", status: "paid",     amount: 580.00,  method: "Débito",     category: "Fixo" },
  ],

  // Dashboard data
  revenueSeries: [
    { m: "Dez", in: 12400, out: 8800 },
    { m: "Jan", in: 14200, out: 9100 },
    { m: "Fev", in: 11900, out: 7800 },
    { m: "Mar", in: 18600, out: 10800 },
    { m: "Abr", in: 21400, out: 12200 },
    { m: "Mai", in: 24820, out: 13760 },
  ],
  ordersByStatus: [
    { label: "Concluída",   count: 24, color: "var(--success)" },
    { label: "Em andamento", count: 8,  color: "var(--accent)" },
    { label: "Aberta",       count: 6,  color: "var(--info)" },
    { label: "Aguard. peça", count: 3,  color: "var(--warn)" },
    { label: "Cancelada",    count: 2,  color: "var(--text-faint)" },
  ],
  recentActivity: [
    { id: 1, kind: "os_created",  who: "Eduardo S.", what: "abriu OS #1ESHP7", target: "FTO-6H64 · Chevrolet SPIN", time: "há 2h",   tone: "brand" },
    { id: 2, kind: "payment",     who: "Sistema",     what: "recebeu R$ 365,00", target: "OS #NIDY13 · PIX",          time: "há 4h",   tone: "green" },
    { id: 3, kind: "stock_low",   who: "Estoque",     what: "alerta de estoque baixo", target: "Filtro de Ar Motor (4 un.)", time: "há 6h", tone: "amber" },
    { id: 4, kind: "os_done",     who: "Bruno A.",    what: "concluiu OS #HMTX0N", target: "FTO-6H64 · Revisão geral", time: "há 1d",   tone: "green" },
    { id: 5, kind: "client_new",  who: "Sistema",     what: "novo cliente cadastrado", target: "Marina Ferraz",         time: "há 3d",   tone: "brand" },
    { id: 6, kind: "stock_out",   who: "Estoque",     what: "produto sem estoque", target: "Palheta Limpador 22\"",     time: "há 4d",   tone: "red" },
  ],
  topServices: [
    { name: "Troca de óleo e filtro", count: 38, revenue: 5320 },
    { name: "Revisão geral",          count: 22, revenue: 14740 },
    { name: "Pastilhas de freio",     count: 18, revenue: 6480 },
    { name: "Diagnóstico eletrônico", count: 14, revenue: 2590 },
    { name: "Alinhamento",            count: 11, revenue: 1980 },
  ],
};

const STATUS_META = {
  open:         { label: "Aberta",       color: "var(--info)",    badge: "blue"  },
  in_progress:  { label: "Em andamento", color: "var(--accent)",  badge: "brand" },
  waiting_part: { label: "Aguard. peça", color: "var(--warn)",    badge: "amber" },
  done:         { label: "Concluída",    color: "var(--success)", badge: "green" },
  cancelled:    { label: "Cancelada",    color: "var(--text-faint)", badge: "gray"},
};

const FINANCE_STATUS_META = {
  received:  { label: "Recebido",   badge: "green" },
  paid:      { label: "Pago",       badge: "gray"  },
  pending:   { label: "Pendente",   badge: "amber" },
  scheduled: { label: "Agendado",   badge: "blue"  },
};

// helpers
const fmtBRL = (n) => "R$ " + (n || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtBRLK = (n) => {
  if (Math.abs(n) >= 1000) return "R$" + (n/1000).toFixed(n%1000===0?0:1).replace(".",",") + "k";
  return "R$" + n;
};
const initials = (name) => name.split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase();
const getClient = (id) => MOCK_DATA.clients.find(c => c.id === id) || { name: "—", id };
const getVehicle = (id) => MOCK_DATA.vehicles.find(v => v.id === id) || { plate: "—", brand: "", model: "" };

// Avatar bg color from name (deterministic, palette-aware)
const AVATAR_PALETTE = [
  "linear-gradient(135deg, #635bff, #4339c9)",
  "linear-gradient(135deg, #008060, #006a4e)",
  "linear-gradient(135deg, #c47e0a, #9a6308)",
  "linear-gradient(135deg, #0570de, #0353a4)",
  "linear-gradient(135deg, #d4351c, #b02d18)",
  "linear-gradient(135deg, #06b6d4, #0891b2)",
  "linear-gradient(135deg, #ec4899, #be185d)",
  "linear-gradient(135deg, #84cc16, #4d7c0f)",
];
const avatarBg = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};

const abbreviateName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return parts.join(" ");
  return parts[0] + " " + parts[parts.length - 1];
};

window.MOCK_DATA = MOCK_DATA;
window.STATUS_META = STATUS_META;
window.FINANCE_STATUS_META = FINANCE_STATUS_META;
window.fmtBRL = fmtBRL;
window.fmtBRLK = fmtBRLK;
window.initials = initials;
window.getClient = getClient;
window.getVehicle = getVehicle;
window.avatarBg = avatarBg;
window.abbreviateName = abbreviateName;
