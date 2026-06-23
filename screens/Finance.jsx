/* global React, Icons, Sparkline */
// =====================================================
// AutoGest — Financeiro
// =====================================================
const { useState: useStateFin } = React;

function FinanceScreen() {
  const D = window.MOCK_DATA;
  const [tab, setTab] = useStateFin("all");

  const totalIn  = D.finance.filter(f => f.type === "in").reduce((s,f) => s + f.amount, 0);
  const totalOut = D.finance.filter(f => f.type === "out").reduce((s,f) => s + f.amount, 0);
  const pending  = D.finance.filter(f => f.status === "pending" || f.status === "scheduled").reduce((s,f) => s + f.amount, 0);
  const balance  = totalIn - totalOut;

  const filtered = D.finance.filter(f => {
    if (tab === "in")  return f.type === "in";
    if (tab === "out") return f.type === "out";
    if (tab === "pending") return f.status === "pending" || f.status === "scheduled";
    return true;
  });

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Financeiro</h1>
          <p className="page__sub">Fluxo de caixa, recebíveis e despesas</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icons.Calendar size={14}/> Maio 2026</button>
          <button className="btn btn--secondary" onClick={()=>alert("Exportando relatório financeiro...")}><Icons.ArrowDownRight size={14}/> Exportar</button>
          <button className="btn btn--primary" onClick={()=>alert("Criando nova movimentação financeira...")}><Icons.Plus size={14}/> Nova movimentação</button>
        </div>
      </div>

      {/* Big stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <BigStat icon="ArrowDownRight" tone="green" label="Entradas (mês)"
                 value={window.fmtBRL(totalIn)}
                 delta="+15.9%"
                 spark={[14,12,18,16,21,24]}/>
        <BigStat icon="ArrowUpRight"   tone="red"   label="Saídas (mês)"
                 value={window.fmtBRL(totalOut)}
                 delta="+8.4%"
                 deltaDown
                 spark={[9,7,10,11,12,14]}/>
        <BigStat icon="Dollar"         tone="brand" label="Saldo"
                 value={window.fmtBRL(balance)}
                 delta={`Margem ${Math.round((balance/totalIn)*100)}%`}
                 deltaNeutral
                 spark={[5,5,8,5,9,11]}/>
        <BigStat icon="Clock"          tone="warn"  label="A receber / pagar"
                 value={window.fmtBRL(pending)}
                 delta="2 vencimentos próximos"
                 deltaNeutral/>
      </div>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button className={"chip" + (tab === "all" ? " is-active" : "")} onClick={()=>setTab("all")}>Todas <span className="chip__count">{D.finance.length}</span></button>
        <button className={"chip" + (tab === "in" ? " is-active" : "")} onClick={()=>setTab("in")}>
          <span style={{ width: 7, height: 7, borderRadius: 50, background: "var(--success)" }}></span>
          Entradas <span className="chip__count">{D.finance.filter(f=>f.type==="in").length}</span>
        </button>
        <button className={"chip" + (tab === "out" ? " is-active" : "")} onClick={()=>setTab("out")}>
          <span style={{ width: 7, height: 7, borderRadius: 50, background: "var(--danger)" }}></span>
          Saídas <span className="chip__count">{D.finance.filter(f=>f.type==="out").length}</span>
        </button>
        <button className={"chip" + (tab === "pending" ? " is-active" : "")} onClick={()=>setTab("pending")}>
          <span style={{ width: 7, height: 7, borderRadius: 50, background: "var(--warn)" }}></span>
          Pendentes <span className="chip__count">{D.finance.filter(f=>f.status==="pending"||f.status==="scheduled").length}</span>
        </button>
      </div>

      <div className="card">
        <div className="card__head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Receipt size={16} style={{ color: "var(--text-soft)" }}/>
            <h3 className="card__title">Movimentações</h3>
            <span className="badge badge--gray">{filtered.length} lançamentos</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Forma</th>
                <th>Status</th>
                <th className="num">Valor</th>
                <th className="num" style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(f => {
                const s = window.FINANCE_STATUS_META[f.status];
                const isIn = f.type === "in";
                return (
                  <tr key={f.id}>
                    <td className="font-mono text-sm text-soft">{f.date}</td>
                    <td>
                      <div className="cell-avatar">
                        <span style={{
                          width: 26, height: 26, borderRadius: 8,
                          background: isIn ? "var(--success-soft)" : "var(--danger-soft)",
                          color: isIn ? "var(--success-text)" : "var(--danger-text)",
                          display: "grid", placeItems: "center", flexShrink: 0
                        }}>
                          {isIn ? <Icons.ArrowDownRight size={12}/> : <Icons.ArrowUpRight size={12}/>}
                        </span>
                        <span style={{ fontWeight: 500 }}>{f.desc}</span>
                      </div>
                    </td>
                    <td><span className="badge badge--gray">{f.category}</span></td>
                    <td className="text-sm text-soft">{f.method}</td>
                    <td><span className={"badge badge--" + s.badge}><span className="dot"></span>{s.label}</span></td>
                    <td className="num">
                      <span className={"money " + (isIn ? "money--green" : "money--red")}>
                        {isIn ? "+ " : "− "}{window.fmtBRL(f.amount)}
                      </span>
                    </td>
                    <td className="num">
                      <div className="actions">
                        <button className="btn btn--ghost btn--icon btn--sm" onClick={()=>alert("Editando movimentação: " + f.desc)}><Icons.Edit size={14}/></button>
                        <button className="btn btn--ghost btn--icon btn--sm" onClick={()=>alert("Mais opções para: " + f.desc)}><Icons.More size={14}/></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function BigStat({ icon, tone, label, value, delta, deltaDown, deltaNeutral, spark }) {
  const Ic = Icons[icon];
  const TONE = {
    green: ["var(--success-soft)", "var(--success-text)", "var(--success)"],
    red:   ["var(--danger-soft)",  "var(--danger-text)",  "var(--danger)"],
    brand: ["var(--accent-soft)",  "var(--accent-text)",  "var(--accent)"],
    warn:  ["var(--warn-soft)",    "var(--warn-text)",    "var(--warn)"],
  };
  const [bg, fg, line] = TONE[tone];
  return (
    <div className="card" style={{ padding: 16, position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 500 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, color: fg, display: "grid", placeItems: "center" }}>
          <Ic size={14}/>
        </div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-strong)", letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>{value}</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 8 }}>
        <span className={"delta " + (deltaNeutral ? "delta--flat" : deltaDown ? "delta--down" : "delta--up")}>
          {!deltaNeutral && (deltaDown ? <Icons.TrendDown size={11}/> : <Icons.TrendUp size={11}/>)}
          {delta}
        </span>
        {spark && <Sparkline data={spark} color={line} width={64} height={20}/>}
      </div>
    </div>
  );
}

window.FinanceScreen = FinanceScreen;
