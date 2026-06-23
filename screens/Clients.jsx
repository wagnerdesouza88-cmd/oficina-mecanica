/* global React, Icons, Avatar */
// =====================================================
// AutoGest — Clientes
// =====================================================
const { useState: useStateClients } = React;

function ClientsScreen() {
  const D = window.MOCK_DATA;
  const [q, setQ] = useStateClients("");
  const filtered = D.clients.filter(c => !q || c.name.toLowerCase().includes(q.toLowerCase()) || c.email.toLowerCase().includes(q.toLowerCase()) || c.cpf.includes(q));

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Clientes</h1>
          <p className="page__sub">{D.clients.length} clientes cadastrados · 3 novos este mês</p>
        </div>
        <div className="page__actions">
          <div className="input-group" style={{ width: 280 }}>
            <span className="input-group__icon"><Icons.Search size={14}/></span>
            <input className="input" placeholder="Buscar por nome, e-mail, CPF…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          </div>
          <button className="btn btn--secondary"><Icons.ArrowDownRight size={14}/> Importar</button>
          <button className="btn btn--primary"><Icons.Plus size={14}/> Novo Cliente</button>
        </div>
      </div>

      {/* Mini stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <MiniStat label="Total"          value={D.clients.length} icon="Users" tone="brand"/>
        <MiniStat label="Novos (mês)"    value="3" delta="+50%" icon="TrendUp" tone="green"/>
        <MiniStat label="Com OS aberta"  value="4" icon="Clipboard" tone="info"/>
        <MiniStat label="Inativos 90d+"  value="1" icon="Clock" tone="warn"/>
      </div>

      <div className="card">
        <div className="card__head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Users size={16} style={{ color: "var(--text-soft)" }}/>
            <h3 className="card__title">Todos os clientes</h3>
            <span className="badge badge--gray">{filtered.length} registros</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>CPF</th>
                <th>Veículos</th>
                <th className="num">Total gasto</th>
                <th>Cliente desde</th>
                <th className="num" style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td>
                    <div className="cell-avatar">
                      <Avatar name={c.name} size={32}/>
                      <div className="cell-stack">
                        <span style={{ fontWeight: 500 }}>{c.name}</span>
                        <span className="cell-stack-sub">{c.email}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5 }}>
                      <Icons.Phone size={11} style={{ color: "var(--text-faint)" }}/> {c.phone}
                    </span>
                  </td>
                  <td className="font-mono text-sm text-soft">{c.cpf}</td>
                  <td>
                    <span className="badge badge--brand">
                      <Icons.Car size={11}/> {c.vehicles}
                    </span>
                  </td>
                  <td className="num">
                    <span className="money">{window.fmtBRL(c.totalSpent)}</span>
                  </td>
                  <td>
                    <div className="cell-stack">
                      <span style={{ fontSize: 12.5 }}>{c.since}</span>
                      <span className="cell-meta">há {c.agoDays} dias</span>
                    </div>
                  </td>
                  <td className="num">
                    <div className="actions">
                      <button className="btn btn--ghost btn--icon btn--sm" title="Editar"><Icons.Edit size={14}/></button>
                      <button className="btn btn--ghost btn--icon btn--sm" title="Mais"><Icons.More size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MiniStat({ label, value, icon, tone, delta }) {
  const Ic = Icons[icon];
  const TONE = {
    brand: "var(--accent-text)", green: "var(--success-text)",
    info: "var(--info)", warn: "var(--warn-text)", red: "var(--danger-text)"
  };
  const TONE_BG = {
    brand: "var(--accent-soft)", green: "var(--success-soft)",
    info: "var(--info-soft)", warn: "var(--warn-soft)", red: "var(--danger-soft)"
  };
  return (
    <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: TONE_BG[tone], color: TONE[tone], display: "grid", placeItems: "center" }}>
        <Ic size={16}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: "var(--text-strong)", letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>{value}</div>
      </div>
      {delta && <span className="delta delta--up">{delta}</span>}
    </div>
  );
}

window.ClientsScreen = ClientsScreen;
