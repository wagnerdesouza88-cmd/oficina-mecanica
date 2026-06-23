/* global React, Icons, Sparkline, Modal */
// =====================================================
// AutoGest — Financeiro
// =====================================================
const { useState: useStateFin, useRef: useRefFin, useEffect: useEffectFin } = React;

function FinanceScreen() {
  const D = window.MOCK_DATA;
  const [tab, setTab] = useStateFin("all");
  const [showNew, setShowNew] = useStateFin(false);
  const [editItem, setEditItem] = useStateFin(null);
  const [menuAnchor, setMenuAnchor] = useStateFin(null); // { item, x, y }

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

  function handlePrint(f) {
    const win = window.open("", "_blank", "width=600,height=400");
    win.document.write(`
      <html><head><title>Comprovante</title><style>
        body{font-family:system-ui,sans-serif;padding:32px;color:#111}
        h2{margin:0 0 4px}p{margin:4px 0;color:#555}
        .val{font-size:22px;font-weight:700;margin:16px 0}
      </style></head><body>
      <h2>AutoGest — Comprovante Financeiro</h2>
      <p>${f.date} · ${f.category} · ${f.method}</p>
      <div class="val">${f.type==="in"?"+ ":"− "}${window.fmtBRL(f.amount)}</div>
      <p><b>${f.desc}</b></p>
      <p>Status: ${window.FINANCE_STATUS_META[f.status].label}</p>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Financeiro</h1>
          <p className="page__sub">Fluxo de caixa, recebíveis e despesas</p>
        </div>
        <div className="page__actions">
          <button className="btn btn--secondary"><Icons.Calendar size={14}/> Maio 2026</button>
          <button className="btn btn--secondary" onClick={()=>window.print()}><Icons.ArrowDownRight size={14}/> Exportar</button>
          <button className="btn btn--primary" onClick={()=>setShowNew(true)}><Icons.Plus size={14}/> Nova movimentação</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 20 }}>
        <BigStat icon="ArrowDownRight" tone="green" label="Entradas (mês)"
                 value={window.fmtBRL(totalIn)} delta="+15.9%" spark={[14,12,18,16,21,24]}/>
        <BigStat icon="ArrowUpRight"   tone="red"   label="Saídas (mês)"
                 value={window.fmtBRL(totalOut)} delta="+8.4%" deltaDown spark={[9,7,10,11,12,14]}/>
        <BigStat icon="Dollar"         tone="brand" label="Saldo"
                 value={window.fmtBRL(balance)}
                 delta={`Margem ${Math.round((balance/totalIn)*100)}%`} deltaNeutral spark={[5,5,8,5,9,11]}/>
        <BigStat icon="Clock"          tone="warn"  label="A receber / pagar"
                 value={window.fmtBRL(pending)} delta="2 vencimentos próximos" deltaNeutral/>
      </div>

      <div className="chips" style={{ marginBottom: 16 }}>
        <button className={"chip" + (tab === "all" ? " is-active" : "")} onClick={()=>setTab("all")}>
          Todas <span className="chip__count">{D.finance.length}</span>
        </button>
        <button className={"chip" + (tab === "in" ? " is-active" : "")} onClick={()=>setTab("in")}>
          <span style={{ width:7,height:7,borderRadius:50,background:"var(--success)" }}></span>
          Entradas <span className="chip__count">{D.finance.filter(f=>f.type==="in").length}</span>
        </button>
        <button className={"chip" + (tab === "out" ? " is-active" : "")} onClick={()=>setTab("out")}>
          <span style={{ width:7,height:7,borderRadius:50,background:"var(--danger)" }}></span>
          Saídas <span className="chip__count">{D.finance.filter(f=>f.type==="out").length}</span>
        </button>
        <button className={"chip" + (tab === "pending" ? " is-active" : "")} onClick={()=>setTab("pending")}>
          <span style={{ width:7,height:7,borderRadius:50,background:"var(--warn)" }}></span>
          Pendentes <span className="chip__count">{D.finance.filter(f=>f.status==="pending"||f.status==="scheduled").length}</span>
        </button>
      </div>

      <div className="card">
        <div className="card__head">
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <Icons.Receipt size={16} style={{ color:"var(--text-soft)" }}/>
            <h3 className="card__title">Movimentações</h3>
            <span className="badge badge--gray">{filtered.length} lançamentos</span>
          </div>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:110 }}>Data</th>
                <th>Descrição</th>
                <th>Categoria</th>
                <th>Forma</th>
                <th>Status</th>
                <th className="num">Valor</th>
                <th className="num" style={{ width:100 }}>Ações</th>
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
                          width:26,height:26,borderRadius:8,flexShrink:0,
                          background: isIn ? "var(--success-soft)" : "var(--danger-soft)",
                          color: isIn ? "var(--success-text)" : "var(--danger-text)",
                          display:"grid",placeItems:"center"
                        }}>
                          {isIn ? <Icons.ArrowDownRight size={12}/> : <Icons.ArrowUpRight size={12}/>}
                        </span>
                        <span style={{ fontWeight:500 }}>{f.desc}</span>
                      </div>
                    </td>
                    <td><span className="badge badge--gray">{f.category}</span></td>
                    <td className="text-sm text-soft">{f.method}</td>
                    <td><span className={"badge badge--"+s.badge}><span className="dot"></span>{s.label}</span></td>
                    <td className="num">
                      <span className={"money "+(isIn?"money--green":"money--red")}>
                        {isIn?"+ ":"− "}{window.fmtBRL(f.amount)}
                      </span>
                    </td>
                    <td className="num">
                      <div className="actions">
                        <button className="btn btn--ghost btn--icon btn--sm" title="Imprimir"
                          onClick={()=>handlePrint(f)}>
                          <Icons.Print size={14}/>
                        </button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Editar"
                          onClick={()=>{ setMenuAnchor(null); setEditItem(f); }}>
                          <Icons.Edit size={14}/>
                        </button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Mais opções"
                          onClick={(e)=>{
                            e.stopPropagation();
                            const r = e.currentTarget.getBoundingClientRect();
                            setMenuAnchor(menuAnchor?.item?.id===f.id ? null : { item:f, x:r.right, y:r.bottom+4 });
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
      </div>

      {showNew    && <NewFinanceModal  onClose={()=>setShowNew(false)}/>}
      {editItem   && <EditFinanceModal item={editItem} onClose={()=>setEditItem(null)}/>}
      {menuAnchor && (
        <FinDropdown
          item={menuAnchor.item}
          x={menuAnchor.x}
          y={menuAnchor.y}
          onEdit={()=>{ setMenuAnchor(null); setEditItem(menuAnchor.item); }}
          onClose={()=>setMenuAnchor(null)}
        />
      )}
    </div>
  );
}

/* ---------- Dropdown three-dots (position:fixed para escapar do overflow) ---------- */
function FinDropdown({ item, x, y, onEdit, onClose }) {
  const ref = useRefFin(null);
  useEffectFin(() => {
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
      minWidth:180,padding:"4px 0",
    }}>
      {row("Editar movimentação", <Icons.Edit size={13}/>, onEdit)}
      {row("Duplicar lançamento", <Icons.Plus size={13}/>, ()=>alert("Duplicando: "+item.desc))}
      <div style={{ height:1,background:"var(--border)",margin:"4px 0" }}/>
      {row("Excluir", <Icons.X size={13}/>, ()=>{ if(confirm("Excluir este lançamento?")) alert("Excluído."); }, true)}
    </div>
  );
}

/* ---------- BigStat ---------- */
function BigStat({ icon, tone, label, value, delta, deltaDown, deltaNeutral, spark }) {
  const Ic = Icons[icon];
  const TONE = {
    green: ["var(--success-soft)","var(--success-text)","var(--success)"],
    red:   ["var(--danger-soft)", "var(--danger-text)", "var(--danger)"],
    brand: ["var(--accent-soft)", "var(--accent-text)", "var(--accent)"],
    warn:  ["var(--warn-soft)",   "var(--warn-text)",   "var(--warn)"],
  };
  const [bg,fg,line] = TONE[tone];
  return (
    <div className="card" style={{ padding:16,position:"relative",overflow:"hidden" }}>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6 }}>
        <span style={{ fontSize:11.5,color:"var(--text-soft)",fontWeight:500 }}>{label}</span>
        <div style={{ width:28,height:28,borderRadius:8,background:bg,color:fg,display:"grid",placeItems:"center" }}>
          <Ic size={14}/>
        </div>
      </div>
      <div style={{ fontSize:24,fontWeight:600,color:"var(--text-strong)",letterSpacing:"-0.02em",lineHeight:1.1,fontFamily:"var(--font-display)" }}>{value}</div>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:8 }}>
        <span className={"delta "+(deltaNeutral?"delta--flat":deltaDown?"delta--down":"delta--up")}>
          {!deltaNeutral && (deltaDown ? <Icons.TrendDown size={11}/> : <Icons.TrendUp size={11}/>)}
          {delta}
        </span>
        {spark && <Sparkline data={spark} color={line} width={64} height={20}/>}
      </div>
    </div>
  );
}

/* ---------- Nova Movimentação ---------- */
function NewFinanceModal({ onClose }) {
  return (
    <Modal title="Nova Movimentação Financeira"
           sub="Registre entradas, saídas e despesas"
           onClose={onClose} width={680}
           footer={<>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Registrar movimentação</button>
           </>}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div className="field">
          <label className="field__label">Tipo</label>
          <select className="select" defaultValue="in">
            <option value="in">Entrada (Recebimento)</option>
            <option value="out">Saída (Despesa)</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Data</label>
          <input className="input" type="text" defaultValue="08/05/2026"/>
        </div>
        <div className="field">
          <label className="field__label">Categoria</label>
          <select className="select">
            <option>Serviço</option><option>Estoque</option>
            <option>Fixo</option><option>Folha</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Forma de pagamento</label>
          <select className="select">
            <option>PIX</option><option>Cartão</option>
            <option>Boleto</option><option>Transferência</option><option>Débito</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Descrição</label>
          <input className="input" placeholder="Ex: OS #QYP5NA - Corrente do comando"/>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Valor</label>
          <input className="input" placeholder="R$ 0,00" type="text"/>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Status</label>
          <select className="select">
            <option>Recebido/Pago</option><option>Pendente</option><option>Agendado</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Editar Movimentação ---------- */
function EditFinanceModal({ item, onClose }) {
  return (
    <Modal title="Editar Movimentação"
           sub={item.desc}
           onClose={onClose} width={680}
           footer={<>
             <button className="btn btn--ghost" style={{ marginRight:"auto",color:"var(--danger)" }}
               onClick={()=>{ if(confirm("Excluir este lançamento?")){ onClose(); alert("Lançamento excluído."); } }}>
               <Icons.X size={13}/> Excluir
             </button>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Salvar alterações</button>
           </>}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div className="field">
          <label className="field__label">Tipo</label>
          <select className="select" defaultValue={item.type}>
            <option value="in">Entrada (Recebimento)</option>
            <option value="out">Saída (Despesa)</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Data</label>
          <input className="input" type="text" defaultValue={item.date}/>
        </div>
        <div className="field">
          <label className="field__label">Categoria</label>
          <select className="select" defaultValue={item.category}>
            <option>Serviço</option><option>Estoque</option>
            <option>Fixo</option><option>Folha</option>
          </select>
        </div>
        <div className="field">
          <label className="field__label">Forma de pagamento</label>
          <select className="select" defaultValue={item.method}>
            <option>PIX</option><option>Cartão</option>
            <option>Boleto</option><option>Transferência</option><option>Débito</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Descrição</label>
          <input className="input" defaultValue={item.desc}/>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Valor</label>
          <input className="input" defaultValue={window.fmtBRL(item.amount)} type="text"/>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Status</label>
          <select className="select" defaultValue={item.status}>
            <option value="paid">Recebido/Pago</option>
            <option value="pending">Pendente</option>
            <option value="scheduled">Agendado</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}

window.FinanceScreen = FinanceScreen;
