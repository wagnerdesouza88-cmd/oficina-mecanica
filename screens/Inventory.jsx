/* global React, Icons */
// =====================================================
// AutoGest — Estoque
// =====================================================
const { useState: useStateInv, useMemo: useMemoInv, useRef: useRefInv, useEffect: useEffectInv } = React;

function InventoryScreen() {
  const D = window.MOCK_DATA;
  const [q, setQ] = useStateInv("");
  const [cat, setCat] = useStateInv("all");
  const [showNew, setShowNew] = useStateInv(false);
  const [editItem, setEditItem] = useStateInv(null);
  const [adjustItem, setAdjustItem] = useStateInv(null);
  const [menuId, setMenuId] = useStateInv(null);

  const cats = useMemoInv(() => ["all", ...Array.from(new Set(D.inventory.map(i => i.category)))], []);
  const filtered = D.inventory.filter(i => {
    if (cat !== "all" && i.category !== cat) return false;
    if (!q) return true;
    return `${i.sku} ${i.name} ${i.brand} ${i.category}`.toLowerCase().includes(q.toLowerCase());
  });

  const totalItems = D.inventory.length;
  const totalUnits = D.inventory.reduce((s,i) => s + i.stock, 0);
  const totalValue = D.inventory.reduce((s,i) => s + i.stock * i.cost, 0);
  const lowCount   = D.inventory.filter(i => i.stock > 0 && i.stock <= i.min).length;
  const outCount   = D.inventory.filter(i => i.stock === 0).length;

  const stockStatus = (i) => {
    if (i.stock === 0)        return { label:"Sem estoque",  tone:"red" };
    if (i.stock <= i.min)     return { label:"Estoque baixo", tone:"amber" };
    return                           { label:"Em estoque",    tone:"green" };
  };

  function handlePrint(i) {
    const win = window.open("", "_blank", "width=600,height=400");
    win.document.write(`
      <html><head><title>Ficha de Produto</title><style>
        body{font-family:system-ui,sans-serif;padding:32px;color:#111}
        h2{margin:0 0 4px}p{margin:4px 0;color:#555}
        table{border-collapse:collapse;width:100%;margin-top:16px}
        td,th{border:1px solid #ddd;padding:8px 12px;text-align:left}
        th{background:#f5f5f5}
      </style></head><body>
      <h2>${i.name}</h2>
      <p>SKU: <b>${i.sku}</b> · Marca: <b>${i.brand}</b> · Categoria: <b>${i.category}</b></p>
      <table>
        <tr><th>Estoque atual</th><td>${i.stock} un</td></tr>
        <tr><th>Estoque mínimo</th><td>${i.min} un</td></tr>
        <tr><th>Custo unitário</th><td>${window.fmtBRL(i.cost)}</td></tr>
        <tr><th>Preço de venda</th><td>${window.fmtBRL(i.price)}</td></tr>
        <tr><th>Valor em estoque</th><td>${window.fmtBRL(i.stock * i.cost)}</td></tr>
      </table>
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Estoque</h1>
          <p className="page__sub">Gestão de peças, lubrificantes e acessórios</p>
        </div>
        <div className="page__actions">
          <div className="input-group" style={{ width:280 }}>
            <span className="input-group__icon"><Icons.Search size={14}/></span>
            <input className="input" placeholder="SKU, nome, marca…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          </div>
          <button className="btn btn--secondary" onClick={()=>alert("Importar: Selecione um arquivo CSV ou Excel")}>
            <Icons.ArrowDownRight size={14}/> Importar
          </button>
          <button className="btn btn--primary" onClick={()=>setShowNew(true)}>
            <Icons.Plus size={14}/> Novo Item
          </button>
        </div>
      </div>

      <div style={{ display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:16,marginBottom:20 }}>
        <MetricCard label="SKUs ativos"      value={totalItems} icon="Box"           tone="brand"/>
        <MetricCard label="Unidades"          value={totalUnits.toLocaleString("pt-BR")} icon="Package" tone="info"/>
        <MetricCard label="Valor em estoque"  value={window.fmtBRL(totalValue)} icon="Dollar"   tone="green"/>
        <MetricCard label="Alertas" value={
          <span>
            <span style={{ color:"var(--warn)" }}>{lowCount}</span>
            <span style={{ color:"var(--text-faint)",margin:"0 6px" }}>·</span>
            <span style={{ color:"var(--danger)" }}>{outCount}</span>
          </span>
        } icon="AlertTriangle" tone="warn" hint={`${lowCount} baixo · ${outCount} sem estoque`}/>
      </div>

      <div className="chips mt-2" style={{ marginBottom:16 }}>
        {cats.map(c => (
          <button key={c} className={"chip"+(cat===c?" is-active":"")} onClick={()=>setCat(c)}>
            {c === "all" ? "Todas as categorias" : c}
            <span className="chip__count">{c==="all" ? D.inventory.length : D.inventory.filter(i=>i.category===c).length}</span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width:130 }}>SKU</th>
                <th>Produto</th>
                <th>Categoria</th>
                <th>Estoque</th>
                <th>Status</th>
                <th className="num">Custo</th>
                <th className="num">Preço</th>
                <th className="num">Margem</th>
                <th className="num" style={{ width:110 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(i => {
                const status = stockStatus(i);
                const margin = ((i.price - i.cost) / i.price) * 100;
                const pct = Math.min(100, (i.stock / Math.max(i.min*3, 1)) * 100);
                return (
                  <tr key={i.id}>
                    <td><span className="font-mono text-xs" style={{ color:"var(--text-soft)" }}>{i.sku}</span></td>
                    <td>
                      <div className="cell-stack">
                        <span style={{ fontWeight:500 }}>{i.name}</span>
                        <span className="cell-stack-sub">{i.brand}</span>
                      </div>
                    </td>
                    <td><span className="badge badge--gray">{i.category}</span></td>
                    <td>
                      <div style={{ display:"flex",flexDirection:"column",gap:4,minWidth:110 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:12 }}>
                          <span style={{ fontWeight:600 }}>{i.stock} <span style={{ color:"var(--text-faint)" }}>un</span></span>
                          <span style={{ color:"var(--text-faint)",fontSize:11 }}>min {i.min}</span>
                        </div>
                        <div style={{ height:4,background:"var(--bg-muted)",borderRadius:2,overflow:"hidden" }}>
                          <div style={{
                            width:`${pct}%`,height:"100%",borderRadius:2,
                            background: i.stock===0?"var(--danger)":i.stock<=i.min?"var(--warn)":"var(--success)"
                          }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={"badge badge--"+status.tone}>
                        <span className="dot"></span>{status.label}
                      </span>
                    </td>
                    <td className="num text-soft">{window.fmtBRL(i.cost)}</td>
                    <td className="num"><span className="money">{window.fmtBRL(i.price)}</span></td>
                    <td className="num">
                      <span style={{
                        color: margin>50?"var(--success)":margin>30?"var(--text)":"var(--warn)",
                        fontWeight:600,fontSize:12.5
                      }}>{margin.toFixed(0)}%</span>
                    </td>
                    <td className="num">
                      <div className="actions" style={{ position:"relative" }}>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Imprimir ficha"
                          onClick={()=>handlePrint(i)}>
                          <Icons.Print size={14}/>
                        </button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Editar"
                          onClick={()=>{ setMenuId(null); setEditItem(i); }}>
                          <Icons.Edit size={14}/>
                        </button>
                        <button className="btn btn--ghost btn--icon btn--sm" title="Mais opções"
                          onClick={(e)=>{ e.stopPropagation(); setMenuId(menuId===i.id?null:i.id); }}>
                          <Icons.More size={14}/>
                        </button>
                        {menuId === i.id && (
                          <InvDropdown
                            item={i}
                            onEdit={()=>{ setMenuId(null); setEditItem(i); }}
                            onAdjust={()=>{ setMenuId(null); setAdjustItem(i); }}
                            onClose={()=>setMenuId(null)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showNew    && <NewInventoryModal   onClose={()=>setShowNew(false)}/>}
      {editItem   && <EditInventoryModal  item={editItem}   onClose={()=>setEditItem(null)}/>}
      {adjustItem && <AdjustStockModal    item={adjustItem} onClose={()=>setAdjustItem(null)}/>}
    </div>
  );
}

/* ---------- Dropdown three-dots ---------- */
function InvDropdown({ item, onEdit, onAdjust, onClose }) {
  const ref = useRefInv(null);
  useEffectInv(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) onClose(); }
    function onKey(e)   { if (e.key === "Escape") onClose(); }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown",   onKey);
    };
  }, [onClose]);

  const row = (label, icon, onClick, danger) => (
    <button onClick={()=>{ onClick(); onClose(); }} style={{
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
      position:"absolute",right:0,top:"100%",zIndex:200,
      background:"var(--bg-elev)",border:"1px solid var(--border)",
      borderRadius:8,boxShadow:"0 8px 24px rgba(0,0,0,0.18)",
      minWidth:180,padding:"4px 0",marginTop:4,
    }}>
      {row("Editar produto", <Icons.Edit size={13}/>, onEdit)}
      {row("Ajustar estoque", <Icons.Package size={13}/>, onAdjust)}
      {row("Imprimir ficha", <Icons.Print size={13}/>, ()=>{})}
      <div style={{ height:1,background:"var(--border)",margin:"4px 0" }}/>
      {row("Excluir produto", <Icons.X size={13}/>, ()=>{ if(confirm("Excluir "+item.name+"?")) alert("Produto excluído."); }, true)}
    </div>
  );
}

/* ---------- MetricCard ---------- */
function MetricCard({ label, value, icon, tone, hint }) {
  const Ic = Icons[icon];
  const TONE = {
    brand: ["var(--accent-soft)","var(--accent-text)"],
    green: ["var(--success-soft)","var(--success-text)"],
    info:  ["var(--info-soft)","var(--info)"],
    warn:  ["var(--warn-soft)","var(--warn-text)"],
  };
  const [bg,fg] = TONE[tone] || TONE.brand;
  return (
    <div className="card" style={{ padding:16 }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6 }}>
        <span style={{ fontSize:11.5,color:"var(--text-soft)",fontWeight:500 }}>{label}</span>
        <div style={{ width:28,height:28,borderRadius:8,background:bg,color:fg,display:"grid",placeItems:"center" }}><Ic size={14}/></div>
      </div>
      <div style={{ fontSize:24,fontWeight:600,color:"var(--text-strong)",letterSpacing:"-0.02em",lineHeight:1.1,fontFamily:"var(--font-display)" }}>{value}</div>
      {hint && <div style={{ fontSize:11.5,color:"var(--text-soft)",marginTop:4 }}>{hint}</div>}
    </div>
  );
}

/* ---------- Novo Item ---------- */
function NewInventoryModal({ onClose }) {
  return (
    <Modal title="Novo Item de Estoque" sub="Cadastre um novo produto ou peça"
           onClose={onClose} width={680}
           footer={<>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Cadastrar item</button>
           </>}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div className="field">
          <label className="field__label">SKU</label>
          <input className="input" placeholder="OL-5W30-LT"/>
        </div>
        <div className="field">
          <label className="field__label">Categoria</label>
          <select className="select">
            <option>Lubrificante</option><option>Filtro</option><option>Freios</option>
            <option>Elétrica</option><option>Ignição</option><option>Acessório</option>
            <option>Suspensão</option><option>Motor</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Nome do produto</label>
          <input className="input" placeholder="Óleo Sintético 5W30"/>
        </div>
        <div className="field">
          <label className="field__label">Marca</label>
          <input className="input" placeholder="Mobil"/>
        </div>
        <div className="field">
          <label className="field__label">Fornecedor</label>
          <input className="input" placeholder="Distribuidora XYZ"/>
        </div>
        <div className="field">
          <label className="field__label">Estoque inicial</label>
          <input className="input" type="number" defaultValue="0"/>
        </div>
        <div className="field">
          <label className="field__label">Estoque mínimo</label>
          <input className="input" type="number" defaultValue="10"/>
        </div>
        <div className="field">
          <label className="field__label">Custo unitário</label>
          <input className="input" placeholder="R$ 0,00"/>
        </div>
        <div className="field">
          <label className="field__label">Preço de venda</label>
          <input className="input" placeholder="R$ 0,00"/>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Editar Item ---------- */
function EditInventoryModal({ item, onClose }) {
  return (
    <Modal title="Editar Produto" sub={`${item.sku} · ${item.brand}`}
           onClose={onClose} width={680}
           footer={<>
             <button className="btn btn--ghost" style={{ marginRight:"auto",color:"var(--danger)" }}
               onClick={()=>{ if(confirm("Excluir "+item.name+"?")){ onClose(); alert("Produto excluído."); } }}>
               <Icons.X size={13}/> Excluir
             </button>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Salvar alterações</button>
           </>}>
      <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:14 }}>
        <div className="field">
          <label className="field__label">SKU</label>
          <input className="input" defaultValue={item.sku}/>
        </div>
        <div className="field">
          <label className="field__label">Categoria</label>
          <select className="select" defaultValue={item.category}>
            <option>Lubrificante</option><option>Filtro</option><option>Freios</option>
            <option>Elétrica</option><option>Ignição</option><option>Acessório</option>
            <option>Suspensão</option><option>Motor</option>
          </select>
        </div>
        <div className="field" style={{ gridColumn:"1 / -1" }}>
          <label className="field__label">Nome do produto</label>
          <input className="input" defaultValue={item.name}/>
        </div>
        <div className="field">
          <label className="field__label">Marca</label>
          <input className="input" defaultValue={item.brand}/>
        </div>
        <div className="field">
          <label className="field__label">Fornecedor</label>
          <input className="input" defaultValue={item.supplier || ""}/>
        </div>
        <div className="field">
          <label className="field__label">Estoque atual</label>
          <input className="input" type="number" defaultValue={item.stock}/>
        </div>
        <div className="field">
          <label className="field__label">Estoque mínimo</label>
          <input className="input" type="number" defaultValue={item.min}/>
        </div>
        <div className="field">
          <label className="field__label">Custo unitário</label>
          <input className="input" defaultValue={window.fmtBRL(item.cost)}/>
        </div>
        <div className="field">
          <label className="field__label">Preço de venda</label>
          <input className="input" defaultValue={window.fmtBRL(item.price)}/>
        </div>
      </div>
    </Modal>
  );
}

/* ---------- Ajuste de Estoque ---------- */
function AdjustStockModal({ item, onClose }) {
  const [type, setType] = useStateInv("add");
  return (
    <Modal title="Ajustar Estoque" sub={`${item.name} · Atual: ${item.stock} un`}
           onClose={onClose} width={420}
           footer={<>
             <button className="btn btn--ghost" onClick={onClose}>Cancelar</button>
             <button className="btn btn--primary"><Icons.Check size={14}/> Confirmar ajuste</button>
           </>}>
      <div style={{ display:"flex",flexDirection:"column",gap:14 }}>
        <div className="field">
          <label className="field__label">Tipo de ajuste</label>
          <div style={{ display:"flex",gap:8 }}>
            {[["add","Entrada / Compra"],["remove","Saída / Uso"],["set","Definir quantidade"]].map(([v,l])=>(
              <button key={v} type="button"
                onClick={()=>setType(v)}
                style={{
                  flex:1,padding:"8px 10px",borderRadius:8,border:"1px solid",fontSize:12.5,cursor:"pointer",
                  borderColor: type===v ? "var(--accent)" : "var(--border)",
                  background:  type===v ? "var(--accent-soft)" : "var(--bg-elev)",
                  color:       type===v ? "var(--accent-text)" : "var(--text-muted)",
                  fontWeight:  type===v ? 600 : 400,
                }}>
                {l}
              </button>
            ))}
          </div>
        </div>
        <div className="field">
          <label className="field__label">{type==="set" ? "Nova quantidade" : "Quantidade"}</label>
          <input className="input" type="number" min="0" defaultValue="1"
            placeholder={type==="set" ? `Atual: ${item.stock}` : "0"}/>
        </div>
        <div className="field">
          <label className="field__label">Motivo / Observação</label>
          <input className="input" placeholder={
            type==="add" ? "Ex: Compra NF 00123" :
            type==="remove" ? "Ex: Uso na OS #QYPLW" : "Ex: Inventário mensal"
          }/>
        </div>
        <div style={{
          background:"var(--bg-subtle)",borderRadius:8,padding:"10px 14px",
          fontSize:12.5,color:"var(--text-muted)"
        }}>
          Estoque após ajuste: <b style={{ color:"var(--text-strong)" }}>
            {type==="set" ? "?" : type==="add" ? `${item.stock} + ? = ?` : `${item.stock} − ? = ?`}
          </b>
        </div>
      </div>
    </Modal>
  );
}

window.InventoryScreen = InventoryScreen;
window.MetricCard = MetricCard;
