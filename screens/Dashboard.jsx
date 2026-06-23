/* global React, Icons, Sparkline, RevenueChart, DonutChart, Avatar, StatusPill */
// =====================================================
// AutoGest — Dashboard
// =====================================================

function Dashboard({ onNavigate }) {
  const D = window.MOCK_DATA;
  const inMonth = D.revenueSeries[D.revenueSeries.length-1].in;
  const outMonth = D.revenueSeries[D.revenueSeries.length-1].out;
  const balance = inMonth - outMonth;

  return (
    <div className="page">
      {/* Header */}
      <div className="page__header">
        <div>
          <h1 className="page__title">Visão geral</h1>
          <p className="page__sub">Resumo da operação · 8 de maio de 2026 · sexta-feira</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icons.Calendar size={14}/> Maio 2026</button>
          <button className="btn btn--secondary"><Icons.ArrowDownRight size={14}/> Exportar</button>
          <button className="btn btn--primary" onClick={()=>onNavigate("orders")}><Icons.Plus size={14}/> Nova Ordem</button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        <Kpi label="Faturamento do mês"
             value={window.fmtBRL(inMonth)}
             delta={{ kind: "up", text: "+15.9% vs Abr" }}
             foot="6 ordens fechadas no período"
             spark={D.revenueSeries.map(d=>d.in)}
             color="var(--accent)"
             icon="Dollar"/>
        <Kpi label="Ordens abertas"
             value="14"
             delta={{ kind: "up", text: "+3 hoje" }}
             foot={<span><b style={{color:"var(--accent-text)"}}>8</b> em andamento · <b style={{color:"var(--info)"}}>6</b> abertas</span>}
             spark={[6,8,5,9,11,12,14]}
             color="var(--info)"
             icon="Clipboard"/>
        <Kpi label="Ticket médio"
             value={window.fmtBRL(872)}
             delta={{ kind: "down", text: "−4.2%" }}
             foot="Últimos 30 dias"
             spark={[920,890,850,910,880,840,872]}
             color="var(--warn)"
             icon="Receipt"/>
        <Kpi label="Clientes ativos"
             value="42"
             delta={{ kind: "up", text: "+5 este mês" }}
             foot="3 novos esta semana"
             spark={[28,30,33,35,38,40,42]}
             color="var(--success)"
             icon="Users"/>
      </div>

      {/* Charts row */}
      <div className="chart-grid mt-4">
        <div className="card">
          <div className="card__head">
            <div>
              <h3 className="card__title">Faturamento × Despesas</h3>
              <div className="card__sub">Últimos 6 meses · valores líquidos</div>
            </div>
            <div style={{ display: "flex", gap: 14, alignItems: "center", fontSize: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 2, background: "var(--accent)", borderRadius: 1 }}></span>
                <span style={{ color: "var(--text-muted)" }}>Receita</span>
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 18, height: 0, borderTop: "2px dashed var(--text-soft)", borderRadius: 1 }}></span>
                <span style={{ color: "var(--text-muted)" }}>Despesa</span>
              </span>
            </div>
          </div>
          <div className="card__body">
            <RevenueChart series={D.revenueSeries} height={260}/>
          </div>
          <div className="card__foot" style={{ display: "flex", gap: 24 }}>
            <Stat label="Recebido (Mai)" value={window.fmtBRL(inMonth)} tone="green"/>
            <Stat label="Pago (Mai)"     value={window.fmtBRL(outMonth)} tone="muted"/>
            <Stat label="Saldo (Mai)"    value={window.fmtBRL(balance)} tone="strong"/>
            <Stat label="Margem"          value={`${Math.round((balance/inMonth)*100)}%`} tone="brand"/>
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <h3 className="card__title">OS por status</h3>
              <div className="card__sub">Total acumulado · 30d</div>
            </div>
          </div>
          <div className="card__body" style={{ paddingTop: 28, paddingBottom: 28 }}>
            <DonutChart data={D.ordersByStatus}/>
          </div>
        </div>
      </div>

      {/* Activity & Top services */}
      <div className="chart-grid mt-4">
        <div className="card">
          <div className="card__head">
            <div>
              <h3 className="card__title">Atividade recente</h3>
              <div className="card__sub">Últimas movimentações</div>
            </div>
            <button className="btn btn--ghost btn--sm">Ver tudo <Icons.ChevronRight size={12}/></button>
          </div>
          <div className="activity">
            {D.recentActivity.map((a) => (
              <ActivityRow key={a.id} a={a}/>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="card__head">
            <div>
              <h3 className="card__title">Serviços mais executados</h3>
              <div className="card__sub">Últimos 30 dias</div>
            </div>
          </div>
          <div style={{ padding: "8px 0" }}>
            {D.topServices.map((s, i) => {
              const max = Math.max(...D.topServices.map(t=>t.count));
              return (
                <div key={i} style={{ padding: "10px 18px", display: "grid", gridTemplateColumns: "1fr auto", gap: 6, alignItems: "center" }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text)" }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-soft)", fontVariantNumeric: "tabular-nums" }}>
                    {s.count} <span style={{ color: "var(--text-faint)" }}>·</span> {window.fmtBRL(s.revenue)}
                  </div>
                  <div style={{ gridColumn: "1 / -1", height: 4, background: "var(--bg-muted)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ width: `${(s.count/max)*100}%`, height: "100%", background: "linear-gradient(90deg, var(--accent), var(--brand-400))", borderRadius: 2 }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick action banners */}
      <div className="mt-4" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
        <Banner
          icon="AlertTriangle" tone="warn"
          title="2 itens com estoque crítico"
          desc="Filtro de Ar e Bateria 60Ah abaixo do mínimo."
          action="Repor estoque"
          onClick={()=>onNavigate("inventory")}/>
        <Banner
          icon="Clock" tone="info"
          title="3 OS aguardando peça"
          desc="Tempo médio de espera: 2 dias."
          action="Ver ordens"
          onClick={()=>onNavigate("orders")}/>
        <Banner
          icon="Receipt" tone="brand"
          title="R$ 2.720,00 a receber"
          desc="OS #QYP5NA com vencimento em 5 dias."
          action="Abrir financeiro"
          onClick={()=>onNavigate("finance")}/>
      </div>
    </div>
  );
}

function Kpi({ label, value, delta, foot, spark, color, icon }) {
  const Ic = Icons[icon];
  return (
    <div className="kpi">
      <div className="kpi__icon" style={{
        background: `color-mix(in oklab, ${color} 14%, transparent)`,
        color: color,
      }}><Ic size={16}/></div>
      <div className="kpi__label">{label}</div>
      <div className="kpi__value" style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2 }}>{value}</div>
      <div className="kpi__foot">
        {delta && (
          <span className={"delta delta--" + delta.kind}>
            {delta.kind === "up" ? <Icons.TrendUp size={11}/> : delta.kind === "down" ? <Icons.TrendDown size={11}/> : null}
            {delta.text}
          </span>
        )}
        <span style={{ flex: 1 }}>{foot}</span>
        {spark && <Sparkline data={spark} color={color} width={68} height={22}/>}
      </div>
    </div>
  );
}

function Stat({ label, value, tone }) {
  const colorMap = {
    green: "var(--success)",
    red: "var(--danger)",
    brand: "var(--accent-text)",
    muted: "var(--text-muted)",
    strong: "var(--text-strong)",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ fontSize: 11, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 600, color: colorMap[tone] || "var(--text)" , fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function ActivityRow({ a }) {
  const ICONS = {
    os_created: "Clipboard", payment: "Dollar", stock_low: "AlertTriangle",
    os_done: "CheckCircle", client_new: "Users", stock_out: "Package",
  };
  const TONE_BG = {
    brand: "var(--accent-soft)", green: "var(--success-soft)",
    amber: "var(--warn-soft)", red: "var(--danger-soft)",
  };
  const TONE_FG = {
    brand: "var(--accent-text)", green: "var(--success-text)",
    amber: "var(--warn-text)", red: "var(--danger-text)",
  };
  const Ic = Icons[ICONS[a.kind] || "Bell"];
  return (
    <div className="activity__row">
      <div className="activity__icon" style={{ background: TONE_BG[a.tone], color: TONE_FG[a.tone] }}>
        <Ic size={15}/>
      </div>
      <div className="activity__main">
        <div className="activity__title">
          <span style={{ color: "var(--text-muted)" }}>{a.who}</span> {a.what}
        </div>
        <div className="activity__sub">{a.target}</div>
      </div>
      <div className="activity__time">{a.time}</div>
    </div>
  );
}

function Banner({ icon, tone, title, desc, action, onClick }) {
  const Ic = Icons[icon];
  const TONE_BG = {
    brand: "var(--accent-soft)", info: "var(--info-soft)",
    warn: "var(--warn-soft)", green: "var(--success-soft)",
  };
  const TONE_FG = {
    brand: "var(--accent-text)", info: "var(--info)",
    warn: "var(--warn-text)", green: "var(--success-text)",
  };
  return (
    <div className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center",
                    background: TONE_BG[tone], color: TONE_FG[tone], flexShrink: 0 }}>
        <Ic size={18}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{title}</div>
        <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 1 }}>{desc}</div>
      </div>
      <button className="btn btn--ghost btn--sm" onClick={onClick}>
        {action} <Icons.ChevronRight size={12}/>
      </button>
    </div>
  );
}

window.Dashboard = Dashboard;
