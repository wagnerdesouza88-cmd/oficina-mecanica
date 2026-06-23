/* global React, Icons */
// =====================================================
// AutoGest — Estoque
// =====================================================
const { useState: useStateInv, useMemo: useMemoInv } = React;

function InventoryScreen() {
  const D = window.MOCK_DATA;
  const [q, setQ] = useStateInv("");
  const [cat, setCat] = useStateInv("all");

  const cats = useMemoInv(() => ["all", ...Array.from(new Set(D.inventory.map(i => i.category)))], []);
  const filtered = D.inventory.filter(i => {
    if (cat !== "all" && i.category !== cat) return false;
    if (!q) return true;
    const blob = `${i.sku} ${i.name} ${i.brand} ${i.category}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  const totalItems  = D.inventory.length;
  const totalUnits  = D.inventory.reduce((s,i) => s + i.stock, 0);
  const totalValue  = D.inventory.reduce((s,i) => s + i.stock * i.cost, 0);
  const lowCount    = D.inventory.filter(i => i.stock > 0 && i.stock <= i.min).length;
  const outCount    = D.inventory.filter(i => i.stock === 0).length;

  const stockStatus = (i) => {
    if (i.stock === 0) return { label: "Sem estoque", tone: "red" };
    if (i.stock <= i.min) return { label: "Estoque baixo", tone: "amber" };
    return { label: "Em estoque", tone: "green" };
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Estoque</h1>
          <p className="page__sub">Gestão de peças, lubrificantes e acessórios</p>
        </div>
        <div className="page__actions">
          <div className="input-group" style={{ width: 280 }}>
            <span className="input-group__icon"><Icons.Search size={14}/></span>
            <input className="input" placeholder="SKU, nome, marca…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          </div>
          <button className="btn btn--secondary" onClick={()=>alert("Importar estoque: Selecione um arquivo CSV ou Excel")}><Icons.ArrowDownRight size={14}/> Importar</button>
          <button className="btn btn--primary" onClick={()=>alert("Criando novo item no estoque...")}><Icons.Plus size={14}/> Novo Item</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <MetricCard label="SKUs ativos"   value={totalItems} icon="Box"      tone="brand"/>
        <MetricCard label="Unidades"      value={totalUnits.toLocaleString("pt-BR")} icon="Package"  tone="info"/>
        <MetricCard label="Valor em estoque" value={window.fmtBRL(totalValue)} icon="Dollar" tone="green"/>
        <MetricCard label="Alertas" value={
          <span>
            <span style={{ color: "var(--warn)" }}>{lowCount}</span>
            <span style={{ color: "var(--text-faint)", margin: "0 6px" }}>·</span>
            <span style={{ color: "var(--danger)" }}>{outCount}</span>
          </span>
        } icon="AlertTriangle" tone="warn" hint={`${lowCount} baixo · ${outCount} sem estoque`}/>
      </div>

      <div className="chips mt-2" style={{ marginBottom: 16 }}>
        {cats.map(c => (
          <button key={c} className={"chip" + (cat === c ? " is-active" : "")} onClick={()=>setCat(c)}>
            {c === "all" ? "Todas as categorias" : c}
            <span className="chip__count">{c === "all" ? D.inventory.length : D.inventory.filter(i=>i.category===c).length}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 130 }}>SKU</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Estoque</th>
                <th>Status</th>
                <th className="num">Custo</th>
                <th className="num">Preço</th>
                <th className="num">Margem</th>
                <th className="num" style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => {
                const status = stockStatus(i);
                const margin = ((i.price - i.cost) / i.price) * 100;
                const pct = Math.min(100, (i.stock / Math.max(i.min*3, 1)) * 100);
                return (
                  <tr key={i.id}>
                    <td><span className="font-mono text-xs" style={{ color: "var(--text-soft)" }}>{i.sku}</span></td>
                    <td>
                      <div className="cell-stack">
                        <span style={{ fontWeight: 500 }}>{i.name}</span>
                        <span className="cell-stack-sub">{i.brand}</span>
                      </div>
                    </td>
                    <td><span className="badge badge--gray">{i.category}</span></td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 110 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                          <span style={{ fontWeight: 600 }}>{i.stock} <span style={{ color: "var(--text-faint)" }}>un</span></span>
                          <span style={{ color: "var(--text-faint)", fontSize: 11 }}>min {i.min}</span>
                        </div>
                        <div style={{ height: 4, background: "var(--bg-muted)", borderRadius: 2, overflow: "hidden" }}>
                          <div style={{ width: `${pct}%`, height: "100%", background: i.stock === 0 ? "var(--danger)" : i.stock <= i.min ? "var(--warn)" : "var(--success)", borderRadius: 2 }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={"badge badge--" + status.tone}>
                        <span className="dot"></span>{status.label}
                      </span>
                    </td>
                    <td className="num text-soft">{window.fmtBRL(i.cost)}</td>
                    <td className="num"><span className="money">{window.fmtBRL(i.price)}</span></td>
                    <td className="num">
                      <span style={{ color: margin > 50 ? "var(--success)" : margin > 30 ? "var(--text)" : "var(--warn)", fontWeight: 600, fontSize: 12.5 }}>
                        {margin.toFixed(0)}%
                      </span>
                    </td>
                    <td className="num">
                      <div className="actions">
                        <button className="btn btn--ghost btn--icon btn--sm" onClick={()=>alert("Editando item: " + i.name)}><Icons.Edit size={14}/></button>
                        <button className="btn btn--ghost btn--icon btn--sm" onClick={()=>alert("Mais opções para: " + i.name)}><Icons.More size={14}/></button>
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

function MetricCard({ label, value, icon, tone, hint }) {
  const Ic = Icons[icon];
  const TONE = {
    brand: ["var(--accent-soft)", "var(--accent-text)"],
    green: ["var(--success-soft)", "var(--success-text)"],
    info:  ["var(--info-soft)", "var(--info)"],
    warn:  ["var(--warn-soft)", "var(--warn-text)"],
  };
  const [bg, fg] = TONE[tone] || TONE.brand;
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 11.5, color: "var(--text-soft)", fontWeight: 500 }}>{label}</span>
        <div style={{ width: 28, height: 28, borderRadius: 8, background: bg, color: fg, display: "grid", placeItems: "center" }}><Ic size={14}/></div>
      </div>
      <div style={{ fontSize: 24, fontWeight: 600, color: "var(--text-strong)", letterSpacing: "-0.02em", lineHeight: 1.1, fontFamily: "var(--font-display)" }}>{value}</div>
      {hint && <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

window.InventoryScreen = InventoryScreen;
window.MetricCard = MetricCard;
