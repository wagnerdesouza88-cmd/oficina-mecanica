/* global React, Icons, StatusPill, Avatar, Modal */
// =====================================================
// AutoGest — Ordens de Serviço
// =====================================================
const { useState: useStateOrders, useRef: useRefOrders, useEffect: useEffectOrders } = React;

function printOS(order) {
    const v = window.getVehicle(order.vehicleId);
    const c = window.getClient(order.clientId);
    const STATUS_LABEL = {
      open: "Aberta", in_progress: "Em andamento",
      waiting_part: "Aguardando peça", done: "Concluída", cancelled: "Cancelada"
    };
    const services = order.services.map((s, i) => ({
      name: s, hours: (1 + i * 0.5).toFixed(1), price: 80 + i * 40
    }));
    const subtotalServicos = services.reduce((a, b) => a + b.price, 0);
    const total = order.total;

    const linhasServicos = services.map(s => `
      <tr>
        <td>${s.name}</td>
        <td class="center">${s.hours} h</td>
        <td class="right">${window.fmtBRL(s.price)}</td>
      </tr>`).join("");

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>OS #${order.code} — AutoGest</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; font-size: 12px; color: #111; background: #fff; padding: 32px; }
  @page { size: A4; margin: 20mm; }
  @media print { body { padding: 0; } .no-print { display: none; } }

  /* Header */
  .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0a2540; padding-bottom: 16px; margin-bottom: 20px; }
  .company-name { font-size: 22px; font-weight: 700; color: #0a2540; letter-spacing: -0.5px; }
  .company-sub  { font-size: 11px; color: #555; margin-top: 2px; }
  .os-badge { text-align: right; }
  .os-number { font-size: 20px; font-weight: 700; color: #0a2540; font-family: monospace; }
  .os-status { display: inline-block; margin-top: 4px; padding: 3px 10px; border-radius: 20px;
    background: #e8eeff; color: #3730a3; font-size: 11px; font-weight: 600; }

  /* Info grid */
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
  .info-box { border: 1px solid #dde3ec; border-radius: 8px; padding: 12px 14px; }
  .info-box-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
    color: #666; margin-bottom: 8px; }
  .info-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
  .info-label { color: #666; }
  .info-value { font-weight: 600; color: #111; }

  /* Plate */
  .plate { display: inline-block; background: #f0f4ff; color: #0a2540; font-family: monospace;
    font-weight: 700; font-size: 13px; letter-spacing: 2px; padding: 3px 10px; border-radius: 6px;
    border: 1px solid #c7d2fe; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #f4f6fa; color: #444; font-size: 10px; text-transform: uppercase;
    letter-spacing: 0.06em; padding: 8px 10px; text-align: left; border-bottom: 2px solid #dde3ec; }
  td { padding: 8px 10px; border-bottom: 1px solid #eef0f5; vertical-align: top; }
  tr:last-child td { border-bottom: none; }
  .center { text-align: center; }
  .right { text-align: right; }
  .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.06em; color: #0a2540; margin-bottom: 8px; padding-bottom: 4px;
    border-bottom: 1px solid #dde3ec; }

  /* Totals */
  .totals { display: flex; justify-content: flex-end; margin-bottom: 20px; }
  .totals-box { width: 260px; border: 1px solid #dde3ec; border-radius: 8px; padding: 12px 14px; }
  .total-row { display: flex; justify-content: space-between; padding: 4px 0;
    font-size: 12px; color: #444; }
  .total-row.grand { border-top: 2px solid #0a2540; margin-top: 6px; padding-top: 8px;
    font-size: 15px; font-weight: 700; color: #0a2540; }

  /* Signatures */
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
  .sig-line { border-top: 1px solid #888; padding-top: 6px; text-align: center;
    font-size: 11px; color: #555; }

  /* Print button */
  .print-btn { display: block; margin: 24px auto 0; padding: 10px 32px; background: #0a2540;
    color: white; border: none; border-radius: 8px; font-size: 14px; cursor: pointer; }
  .print-btn:hover { background: #1e3a5f; }
</style>
</head>
<body>

<div class="header">
  <div>
    <div class="company-name">DRIL AUTOCENTER</div>
    <div class="company-sub">Oficina Mecânica — AutoGest</div>
    <div class="company-sub" style="margin-top:4px">Tel: (41) 99999-0000 · contato@drilautocenter.com.br</div>
  </div>
  <div class="os-badge">
    <div class="os-number">OS #${order.code}</div>
    <div class="os-status">${STATUS_LABEL[order.status] || order.status}</div>
    <div style="font-size:11px;color:#777;margin-top:6px">Emitido em: ${new Date().toLocaleDateString("pt-BR")}</div>
  </div>
</div>

<div class="info-grid">
  <div class="info-box">
    <div class="info-box-title">👤 Cliente</div>
    <div class="info-row"><span class="info-label">Nome</span><span class="info-value">${c.name}</span></div>
    <div class="info-row"><span class="info-label">Telefone</span><span class="info-value">${c.phone}</span></div>
    <div class="info-row"><span class="info-label">E-mail</span><span class="info-value">${c.email || "—"}</span></div>
    <div class="info-row"><span class="info-label">CPF</span><span class="info-value">${c.cpf || "—"}</span></div>
  </div>
  <div class="info-box">
    <div class="info-box-title">🚗 Veículo</div>
    <div class="info-row">
      <span class="info-label">Placa</span>
      <span class="plate">${v.plate}</span>
    </div>
    <div class="info-row"><span class="info-label">Modelo</span><span class="info-value">${v.brand} ${v.model}</span></div>
    <div class="info-row"><span class="info-label">Ano</span><span class="info-value">${v.year}</span></div>
    <div class="info-row"><span class="info-label">Cor</span><span class="info-value">${v.color || "—"}</span></div>
  </div>
</div>

<div class="info-grid" style="margin-bottom:20px">
  <div class="info-box">
    <div class="info-box-title">📋 Informações da OS</div>
    <div class="info-row"><span class="info-label">Entrada</span><span class="info-value">${order.entry}</span></div>
    <div class="info-row"><span class="info-label">Previsão</span><span class="info-value">${order.forecast}</span></div>
    <div class="info-row"><span class="info-label">Entrega</span><span class="info-value">${order.delivery !== "—" ? order.delivery : "Em aberto"}</span></div>
    <div class="info-row"><span class="info-label">Mecânico</span><span class="info-value">${order.mechanic}</span></div>
  </div>
</div>

<div class="section-title">Serviços Executados</div>
<table>
  <thead>
    <tr>
      <th>Descrição do Serviço</th>
      <th class="center" style="width:80px">Horas</th>
      <th class="right" style="width:110px">Valor</th>
    </tr>
  </thead>
  <tbody>
    ${linhasServicos}
  </tbody>
</table>

<div class="totals">
  <div class="totals-box">
    <div class="total-row"><span>Subtotal serviços</span><span>${window.fmtBRL(subtotalServicos)}</span></div>
    <div class="total-row"><span>Peças / materiais</span><span>${window.fmtBRL(0)}</span></div>
    <div class="total-row"><span>Desconto</span><span>− ${window.fmtBRL(0)}</span></div>
    <div class="total-row grand"><span>TOTAL</span><span>${window.fmtBRL(total)}</span></div>
  </div>
</div>

<div class="signatures">
  <div class="sig-line">Assinatura do Cliente</div>
  <div class="sig-line">Assinatura do Responsável Técnico</div>
</div>

<button class="print-btn no-print" onclick="window.print()">🖨️ Imprimir / Salvar PDF</button>

</body></html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
}

function OrdersScreen() {
  const D = window.MOCK_DATA;
  const [filter, setFilter] = useStateOrders("all");
  const [q, setQ] = useStateOrders("");
  const [selectedId, setSelectedId] = useStateOrders(null);
  const [showNew, setShowNew] = useStateOrders(false);
  const [editOrder, setEditOrder] = useStateOrders(null);
  const [menuAnchor, setMenuAnchor] = useStateOrders(null);

  const counts = {
    all: D.orders.length,
    open: D.orders.filter(o=>o.status==="open").length,
    in_progress: D.orders.filter(o=>o.status==="in_progress").length,
    waiting_part: D.orders.filter(o=>o.status==="waiting_part").length,
    done: D.orders.filter(o=>o.status==="done").length,
    cancelled: D.orders.filter(o=>o.status==="cancelled").length,
  };

  const filtered = D.orders.filter(o => {
    if (filter !== "all" && o.status !== filter) return false;
    if (!q) return true;
    const c = window.getClient(o.clientId);
    const v = window.getVehicle(o.vehicleId);
    const blob = `${o.code} ${c.name} ${v.plate} ${v.brand} ${v.model} ${o.services.join(" ")}`.toLowerCase();
    return blob.includes(q.toLowerCase());
  });

  const selected = selectedId ? D.orders.find(o=>o.id===selectedId) : null;

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Ordens de Serviço</h1>
          <p className="page__sub">Acompanhe execução, peças e cobrança em um só lugar.</p>
        </div>
        <div className="page__actions">
          <div className="input-group" style={{ width: 280 }}>
            <span className="input-group__icon"><Icons.Search size={14}/></span>
            <input className="input" placeholder="Buscar por OS, placa, cliente…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          </div>
          <button className="btn btn--secondary" onClick={()=>{alert("Filtros avançados em breve!")}}><Icons.Filter size={14}/> Filtros</button>
          <button className="btn btn--secondary" onClick={()=>{window.print();}}><Icons.ArrowDownRight size={14}/> Exportar</button>
          <button className="btn btn--primary" onClick={()=>setShowNew(true)}><Icons.Plus size={14}/> Nova Ordem</button>
        </div>
      </div>

      <div className="chips mt-2" style={{ marginBottom: 16 }}>
        <Chip active={filter==="all"}          onClick={()=>setFilter("all")}          label="Todas"          count={counts.all}/>
        <Chip active={filter==="open"}         onClick={()=>setFilter("open")}         label="Abertas"        count={counts.open}     dot="var(--info)"/>
        <Chip active={filter==="in_progress"}  onClick={()=>setFilter("in_progress")}  label="Em andamento"   count={counts.in_progress} dot="var(--accent)"/>
        <Chip active={filter==="waiting_part"} onClick={()=>setFilter("waiting_part")} label="Aguard. peça"   count={counts.waiting_part} dot="var(--warn)"/>
        <Chip active={filter==="done"}         onClick={()=>setFilter("done")}         label="Concluídas"     count={counts.done}        dot="var(--success)"/>
        <Chip active={filter==="cancelled"}    onClick={()=>setFilter("cancelled")}    label="Canceladas"     count={counts.cancelled}   dot="var(--text-faint)"/>
      </div>

      <div className="card">
        <div className="card__head">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icons.Clipboard size={16} style={{ color: "var(--text-soft)" }}/>
            <h3 className="card__title">{filter === "all" ? "Todas as ordens" : window.STATUS_META[filter].label}</h3>
            <span className="badge badge--gray">{filtered.length} registros</span>
          </div>
          <div style={{ display: "flex", gap: 6, alignItems: "center", color: "var(--text-soft)", fontSize: 12 }}>
            <span>Ordenar por:</span>
            <button className="btn btn--ghost btn--sm">Mais recente <Icons.ChevronDown size={12}/></button>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 90 }}>OS</th>
                <th>Veículo</th>
                <th>Cliente</th>
                <th>Serviços</th>
                <th style={{ width: 140 }}>Status</th>
                <th className="num" style={{ width: 110 }}>Total</th>
                <th style={{ width: 180 }}>Datas</th>
                <th style={{ width: 110 }} className="num">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => {
                const v = window.getVehicle(o.vehicleId);
                const c = window.getClient(o.clientId);
                return (
                  <tr key={o.id} style={{ cursor: "pointer" }} onClick={()=>setSelectedId(o.id)}>
                    <td><span className="os-code">#{o.code}</span></td>
                    <td>
                      <div className="cell-stack">
                        <span className="plate">{v.plate}</span>
                        <span className="cell-stack-sub">{v.brand} {v.model.length > 18 ? v.model.slice(0,18)+"…" : v.model}</span>
                      </div>
                    </td>
                    <td>
                      <div className="cell-avatar">
                        <Avatar name={c.name} size={28}/>
                        <div className="cell-stack">
                          <span style={{ fontWeight: 500 }}>{window.abbreviateName(c.name)}</span>
                          <span className="cell-stack-sub">{c.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="cell-stack">
                        {o.services.slice(0,2).map((s,i)=> (
                          <span key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Icons.Wrench size={11} style={{ color: "var(--text-faint)" }}/>
                            <span style={{ fontSize: 12.5 }}>{s.length > 28 ? s.slice(0,28)+"…" : s}</span>
                          </span>
                        ))}
                        {o.services.length > 2 && (
                          <span className="cell-meta">+{o.services.length - 2} serviço{o.services.length - 2 > 1 ? "s" : ""}</span>
                        )}
                        {o.products > 0 && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--success-text)", fontSize: 11.5, fontWeight: 500 }}>
                            <Icons.Package size={11}/>
                            {o.products} produto{o.products > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </td>
                    <td><StatusPill status={o.status}/></td>
                    <td className="num"><span className="money">{window.fmtBRL(o.total)}</span></td>
                    <td>
                      <div className="cell-stack" style={{ fontSize: 11.5 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Icons.Calendar size={10} style={{ color: "var(--text-faint)" }}/> Ent: <span className="text-muted">{o.entry}</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <Icons.Clock size={10} style={{ color: "var(--text-faint)" }}/> Prev: <span className="text-muted">{o.forecast}</span>
                        </span>
                        {o.delivery !== "—" && (
                          <span style={{ display: "flex", alignItems: "center", gap: 5, color: "var(--success-text)" }}>
                            <Icons.CheckCircle size={10}/> Entreg: <span>{o.delivery}</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="num" onClick={(e)=>e.stopPropagation()}>
                      <div className="actions">
                        <button className="btn btn--ghost btn--icon btn--sm" title="Imprimir OS"
                          onClick={(e)=>{ e.stopPropagation(); printOS(o); }}>
                          <Icons.Print size={14}/>
                        </button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Editar OS"
                          onClick={(e)=>{ e.stopPropagation(); setMenuAnchor(null); setEditOrder(o); }}>
                          <Icons.Edit size={14}/>
                        </button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Mais opções"
                          onClick={(e)=>{
                            e.stopPropagation();
                            const r = e.currentTarget.getBoundingClientRect();
                            setMenuAnchor(menuAnchor?.order?.id===o.id ? null : { order:o, x:r.right, y:r.bottom+4 });
                          }}>
                          <Icons.More size={14}/>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: "center", color: "var(--text-soft)", fontSize: 13 }}>
            Nenhuma ordem encontrada com os filtros atuais.
          </div>
        )}
        <div className="card__foot" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "var(--text-soft)" }}>
            Mostrando <b>{filtered.length}</b> de <b>{D.orders.length}</b> ordens
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button className="btn btn--secondary btn--sm" disabled style={{ opacity: 0.5 }}>← Anterior</button>
            <button className="btn btn--secondary btn--sm" disabled style={{ opacity: 0.5 }}>Próxima →</button>
          </div>
        </div>
      </div>

      {selected    && <OrderDetailModal order={selected}   onClose={()=>setSelectedId(null)}/>}
      {showNew     && <NewOrderModal                       onClose={()=>setShowNew(false)}/>}
      {editOrder   && <EditOrderModal   order={editOrder}  onClose={()=>setEditOrder(null)}/>}
      {menuAnchor  && (
        <OrderDropdown
          order={menuAnchor.order}
          x={menuAnchor.x}
          y={menuAnchor.y}
          onEdit={()=>{ setMenuAnchor(null); setEditOrder(menuAnchor.order); }}
          onView={()=>{ setMenuAnchor(null); setSelectedId(menuAnchor.order.id); }}
          onClose={()=>setMenuAnchor(null)}
        />
      )}
    </div>
  );
}

function Chip({ active, onClick, label, count, dot }) {
  return (
    <button className={"chip" + (active ? " is-active" : "")} onClick={onClick}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: 50, background: dot, flexShrink: 0 }}></span>}
      <span>{label}</span>
      <span className="chip__count">{count}</span>
    </button>
  );
}

function OrderDetailModal({ order, onClose }) {
  const v = window.getVehicle(order.vehicleId);
  const c = window.getClient(order.clientId);
  const services = order.services.map((s, i) => ({ name: s, hours: 1 + i*0.5, price: 80 + i*40 }));
  const subtotal = services.reduce((a, b) => a + b.price, 0);
  const discount = 0;
  const tax = subtotal * 0.05;
  const total = order.total;

  return (
    <Modal
      title={<span style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span className="os-code" style={{ fontSize: 13 }}>#{order.code}</span>
        <span>{v.brand} {v.model}</span>
      </span>}
      sub={<span>Aberta em {order.entry} · Mecânico responsável: <b style={{ color: "var(--text)" }}>{order.mechanic}</b></span>}
      onClose={onClose}
      width={920}
      footer={
        <>
          <button className="btn btn--ghost" onClick={()=>printOS(order)}><Icons.Print size={14}/> Imprimir OS</button>
          <span style={{ flex: 1 }}></span>
          <button className="btn btn--secondary" onClick={onClose}>Fechar</button>
          <button className="btn btn--primary"><Icons.Check size={14}/> Marcar concluída</button>
        </>
      }
    >
      {/* top status bar */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 18 }}>
        <StatusPill status={order.status}/>
        <span style={{ fontSize: 12, color: "var(--text-soft)" }}>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
          <Icons.Clock size={12}/> Previsão: <b style={{ color: "var(--text)" }}>{order.forecast}</b>
        </span>
        <span style={{ flex: 1 }}></span>
        <span className="money money--md">{window.fmtBRL(order.total)}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
        <InfoCard icon="Car" title="Veículo">
          <div className="cell-stack">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="plate">{v.plate}</span>
              <span style={{ fontSize: 12, color: "var(--text-soft)" }}>{v.year} · {v.color}</span>
            </div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>{v.brand} {v.model}</div>
          </div>
        </InfoCard>
        <InfoCard icon="Users" title="Cliente">
          <div className="cell-avatar">
            <Avatar name={c.name} size={32}/>
            <div className="cell-stack">
              <span style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</span>
              <span style={{ fontSize: 11.5, color: "var(--text-soft)" }}>{c.phone} · {c.email}</span>
            </div>
          </div>
        </InfoCard>
      </div>

      {/* Services */}
      <div className="card" style={{ marginBottom: 14 }}>
        <div className="card__head" style={{ padding: "12px 16px" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <Icons.Wrench size={14} style={{ color: "var(--text-soft)" }}/>
            <h4 className="card__title">Serviços executados</h4>
          </div>
          <button className="btn btn--ghost btn--sm"><Icons.Plus size={12}/> Adicionar serviço</button>
        </div>
        <table className="table">
          <thead>
            <tr><th>Serviço</th><th className="num">Horas</th><th className="num">Valor</th></tr>
          </thead>
          <tbody>
            {services.map((s,i)=>(
              <tr key={i}>
                <td>{s.name}</td>
                <td className="num text-soft">{s.hours.toFixed(1)} h</td>
                <td className="num"><span className="money">{window.fmtBRL(s.price)}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
        <div className="card">
          <div className="card__head" style={{ padding: "12px 16px" }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Icons.Receipt size={14} style={{ color: "var(--text-soft)" }}/>
              <h4 className="card__title">Histórico</h4>
            </div>
          </div>
          <div style={{ padding: 16 }}>
            <Timeline items={[
              { date: order.entry,    title: "Ordem aberta",      who: "Recepção" },
              { date: order.entry,    title: "Diagnóstico iniciado", who: order.mechanic },
              { date: order.forecast, title: "Previsão de entrega informada", who: "Sistema" },
              ...(order.delivery !== "—" ? [{ date: order.delivery, title: "Veículo entregue", who: order.mechanic, done: true }] : []),
            ]}/>
          </div>
        </div>
        <div className="card" style={{ alignSelf: "start" }}>
          <div style={{ padding: "16px 16px 8px" }}>
            <Row label="Subtotal serviços"  value={window.fmtBRL(subtotal)}/>
            <Row label="Peças"               value={window.fmtBRL(0)}/>
            <Row label="Desconto"            value={`− ${window.fmtBRL(discount)}`}/>
            <Row label="Acréscimos"          value={window.fmtBRL(tax)} muted/>
            <div style={{ height: 1, background: "var(--border-soft)", margin: "10px 0" }}></div>
            <Row label="Total" value={window.fmtBRL(total)} big/>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function InfoCard({ icon, title, children }) {
  const Ic = Icons[icon];
  return (
    <div style={{ background: "var(--bg-subtle)", border: "1px solid var(--border-soft)", borderRadius: 10, padding: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-soft)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 8 }}>
        <Ic size={12}/> {title}
      </div>
      {children}
    </div>
  );
}

function Row({ label, value, big, muted }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: big ? 14 : 12.5 }}>
      <span style={{ color: muted ? "var(--text-faint)" : "var(--text-muted)", fontWeight: big ? 600 : 400 }}>{label}</span>
      <span style={{ fontWeight: big ? 700 : 500, color: big ? "var(--text-strong)" : "var(--text)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

function Timeline({ items }) {
  return (
    <div style={{ position: "relative", paddingLeft: 20 }}>
      <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: 1, background: "var(--border)" }}></div>
      {items.map((it, i) => (
        <div key={i} style={{ position: "relative", paddingBottom: i === items.length - 1 ? 0 : 14 }}>
          <span style={{
            position: "absolute", left: -19, top: 4,
            width: 10, height: 10, borderRadius: 50,
            background: it.done ? "var(--success)" : "var(--bg-elev)",
            border: `2px solid ${it.done ? "var(--success)" : "var(--accent)"}`
          }}></span>
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text)" }}>{it.title}</div>
          <div style={{ fontSize: 11.5, color: "var(--text-soft)" }}>{it.date} · {it.who}</div>
        </div>
      ))}
    </div>
  );
}

function NewOrderModal({ onClose }) {
  return (
    <Modal title="Nova Ordem de Serviço"
           sub="Preencha os dados básicos para iniciar"
           onClose={onClose}
           width={680}
           footer={<>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Criar ordem</button>
           </>}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div className="field">
          <label className="field__label">Cliente</label>
          <select className="select" defaultValue="c1">
            {window.MOCK_DATA.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">Veículo</label>
          <select className="select" defaultValue="v2">
            {window.MOCK_DATA.vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} · {v.brand} {v.model}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field__label">Mecânico responsável</label>
          <select className="select"><option>Eduardo S.</option><option>Bruno A.</option><option>Carlos M.</option></select>
        </div>
        <div className="field">
          <label className="field__label">Previsão de entrega</label>
          <input className="input" type="text" defaultValue="08/05/2026"/>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label className="field__label">Descrição inicial</label>
          <textarea className="textarea" placeholder="Sintomas relatados pelo cliente, ruídos, alertas no painel…"></textarea>
        </div>
        <div className="field" style={{ gridColumn: "1 / -1" }}>
          <label className="field__label">Serviços</label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 2 }}>
            {["Troca de óleo", "Diagnóstico eletrônico", "Pastilhas dianteiras", "Alinhamento", "Revisão geral", "Troca de bateria"].map((s,i)=>(
              <button key={i} type="button" className="chip" style={{ height: 28, fontSize: 12 }}>
                <Icons.Plus size={11}/> {s}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Dropdown three-dots OS (position:fixed) ---------- */
function OrderDropdown({ order, x, y, onEdit, onView, onClose }) {
  const ref = useRefOrders(null);
  useEffectOrders(() => {
    function onClickOut(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    function onKey(e)      { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", onClickOut);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onClickOut);
      document.removeEventListener("keydown",   onKey);
    };
  }, [onClose]);

  const row = (label, icon, handler, danger) => (
    <button onClick={()=>{ handler(); onClose(); }} style={{
      display:"flex",alignItems:"center",gap:8,width:"100%",padding:"7px 12px",
      background:"none",border:"none",cursor:"pointer",fontSize:13,textAlign:"left",
      color: danger ? "var(--danger)" : "var(--text)",
    }}
    onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
    onMouseLeave={e=>e.currentTarget.style.background="none"}>
      {icon}{label}
    </button>
  );

  return (
    <div ref={ref} style={{
      position:"fixed", right: window.innerWidth - x, top: y, zIndex:9999,
      background:"var(--bg-elev)",border:"1px solid var(--border)",
      borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.22)",
      minWidth:190,padding:"4px 0",
    }}>
      {row("Ver detalhes",    <Icons.Clipboard size={13}/>, onView)}
      {row("Editar OS",       <Icons.Edit size={13}/>,      onEdit)}
      {row("Imprimir OS",     <Icons.Print size={13}/>,     ()=>printOS(order))}
      {row("Duplicar OS",     <Icons.Plus size={13}/>,      ()=>alert("OS duplicada!"))}
      <div style={{ height:1,background:"var(--border)",margin:"4px 0" }}/>
      {row("Cancelar OS",     <Icons.X size={13}/>,
        ()=>{ if(confirm("Cancelar OS #"+order.code+"?")) alert("OS cancelada."); }, true)}
    </div>
  );
}

/* ---------- Editar OS ---------- */
function EditOrderModal({ order, onClose }) {
  const v = window.getVehicle(order.vehicleId);
  const c = window.getClient(order.clientId);
  return (
    <Modal title={`Editar OS #${order.code}`}
           sub={`${v.plate} · ${v.brand} ${v.model} · ${c.name}`}
           onClose={onClose} width={680}
           footer={<>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Salvar alterações</button>
           </>}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div className="field">
          <label className="field__label">Cliente</label>
          <select className="select" defaultValue={order.clientId}>
            {window.MOCK_DATA.clients.map(cl=>(
              <option key={cl.id} value={cl.id}>{cl.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label">Veículo</label>
          <select className="select" defaultValue={order.vehicleId}>
            {window.MOCK_DATA.vehicles.map(vh=>(
              <option key={vh.id} value={vh.id}>{vh.plate} · {vh.brand} {vh.model}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label className="field__label">Mecânico responsável</label>
          <select className="select" defaultValue={order.mechanic}>
            <option>Eduardo S.</option><option>Bruno A.</option><option>Carlos M.</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Status</label>
          <select className="select" defaultValue={order.status}>
            <option value="open">Aberta</option>
            <option value="in_progress">Em andamento</option>
            <option value="waiting_part">Aguardando peça</option>
            <option value="done">Concluída</option>
            <option value="cancelled">Cancelada</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Data de entrada</label>
          <input className="input" type="text" defaultValue={order.entry}/>
        </div>
        <div className="field">
          <label className="field__label">Previsão de entrega</label>
          <input className="input" type="text" defaultValue={order.forecast}/>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Serviços</label>
          {order.services.map((s,i)=>(
            <div key={i} style={{ display:"flex",gap:8,alignItems:"center",marginBottom:6 }}>
              <input className="input" defaultValue={s} style={{ flex:1 }}/>
            </div>
          ))}
        </div>
        <div className="field">
          <label className="field__label">Total (R$)</label>
          <input className="input" defaultValue={window.fmtBRL(order.total)}/>
        </div>
      </div>
    </Modal>
  );
}

window.OrdersScreen = OrdersScreen;
