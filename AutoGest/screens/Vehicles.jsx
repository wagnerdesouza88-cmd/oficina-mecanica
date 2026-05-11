/* global React, Icons, Avatar */
// =====================================================
// AutoGest — Veículos
// =====================================================
const { useState: useStateVehicles } = React;

const COLOR_DOTS = {
  "Preto": "#0a0a0a",
  "Prata": "#c0c0c0",
  "Cinza": "#6b7280",
  "Branco": "#fafafa",
  "Vermelho": "#dc2626",
  "Azul": "#2563eb",
};

function VehiclesScreen() {
  const D = window.MOCK_DATA;
  const [q, setQ] = useStateVehicles("");
  const filtered = D.vehicles.filter(v => !q || v.plate.toLowerCase().includes(q.toLowerCase()) || v.model.toLowerCase().includes(q.toLowerCase()) || v.brand.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Veículos</h1>
          <p className="page__sub">{D.vehicles.length} veículos · 4 oficinas mecânicas em rota</p>
        </div>
        <div className="page__actions">
          <div className="input-group" style={{ width: 280 }}>
            <span className="input-group__icon"><Icons.Search size={14}/></span>
            <input className="input" placeholder="Buscar por placa, modelo, cliente…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          </div>
          <button className="btn btn--secondary"><Icons.Filter size={14}/> Filtros</button>
          <button className="btn btn--primary"><Icons.Plus size={14}/> Novo Veículo</button>
        </div>
      </div>

      <div className="card">
        <div className="card__head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Car size={16} style={{ color: "var(--text-soft)" }}/>
            <h3 className="card__title">Frota cadastrada</h3>
            <span className="badge badge--gray">{filtered.length} registros</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 110 }}>Placa</th>
                <th>Marca / Modelo</th>
                <th style={{ width: 80 }}>Ano</th>
                <th>Cor</th>
                <th>Proprietário</th>
                <th>Última visita</th>
                <th className="num" style={{ width: 80 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const owner = window.getClient(v.ownerId);
                return (
                  <tr key={v.id}>
                    <td><span className="plate">{v.plate}</span></td>
                    <td>
                      <div className="cell-stack">
                        <span style={{ fontWeight: 500 }}>{v.brand} <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>{v.model.length > 32 ? v.model.slice(0,32)+"…" : v.model}</span></span>
                      </div>
                    </td>
                    <td><span className="font-mono text-sm">{v.year}</span></td>
                    <td>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12.5 }}>
                        <span style={{ width: 12, height: 12, borderRadius: 50, background: COLOR_DOTS[v.color] || "#999", border: "1px solid var(--border)", flexShrink: 0 }}></span>
                        {v.color}
                      </span>
                    </td>
                    <td>
                      <div className="cell-avatar">
                        <Avatar name={owner.name} size={28}/>
                        <span style={{ fontSize: 12.5 }}>{owner.name.split(" ").slice(0,2).join(" ")}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: 12.5, color: v.lastServiceDays < 30 ? "var(--text)" : "var(--text-soft)" }}>
                        há {v.lastServiceDays} dia{v.lastServiceDays === 1 ? "" : "s"}
                      </span>
                    </td>
                    <td className="num">
                      <div className="actions">
                        <button className="btn btn--ghost btn--icon btn--sm" title="Editar"><Icons.Edit size={14}/></button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Excluir"><Icons.Trash size={14}/></button>
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

window.VehiclesScreen = VehiclesScreen;
