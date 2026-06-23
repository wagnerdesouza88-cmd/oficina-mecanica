/* global React, Icons */
// =====================================================
// AutoGest — Shared components
// =====================================================
const { useState, useEffect, useRef, useMemo, useCallback } = React;

/* ---------- Sidebar ---------- */
function Sidebar({ active, onNavigate, theme, onThemeToggle }) {
  const items = [
    { section: "Principal", entries: [
      { id: "dashboard",    label: "Dashboard",        icon: "Dashboard" },
    ]},
    { section: "Cadastros", entries: [
      { id: "clients",      label: "Clientes",         icon: "Users" },
      { id: "vehicles",     label: "Veículos",         icon: "Car" },
    ]},
    { section: "Operações", entries: [
      { id: "orders",       label: "Ordens de Serviço",icon: "Clipboard", badge: 3 },
      { id: "finance",      label: "Financeiro",       icon: "Dollar" },
      { id: "inventory",    label: "Estoque",          icon: "Box",       badge: 2, badgeTone: "warn" },
    ]},
    { section: "Sistema", entries: [
      { id: "settings",     label: "Configurações",    icon: "Settings" },
    ]},
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__brand-mark"><Icons.Logo size={34}/></div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">AutoGest</span>
          <span className="sidebar__brand-sub">Gestão Automotiva</span>
        </div>
      </div>

      <button className="sidebar__workspace" type="button">
        <div className="sidebar__workspace-avatar">D</div>
        <div className="sidebar__workspace-info">
          <div className="sidebar__workspace-label">Oficina</div>
          <div className="sidebar__workspace-name">DRIL AUTOCENTER</div>
        </div>
        <Icons.ChevronDown size={14}/>
      </button>

      <nav className="sidebar__nav">
        {items.map((sec) => (
          <div key={sec.section} className="sidebar__section">
            <div className="sidebar__section-label">{sec.section}</div>
            {sec.entries.map((e) => {
              const Ic = Icons[e.icon];
              const isActive = active === e.id;
              return (
                <button key={e.id} type="button"
                  className={"sidebar__item" + (isActive ? " is-active" : "")}
                  onClick={() => onNavigate(e.id)}>
                  <Ic size={16}/>
                  <span>{e.label}</span>
                  {e.badge != null && (
                    <span className="sidebar__item-badge" style={
                      e.badgeTone === "warn" ? { background: "var(--warn)", color: "#1a1100" } : {}
                    }>{e.badge}</span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="sidebar__footer">
        <div className="sidebar__user-avatar">A</div>
        <div className="sidebar__user-info">
          <div className="sidebar__user-name">Administrador</div>
          <div className="sidebar__user-mail">admin@oficina.com</div>
        </div>
        <button className="sidebar__theme-btn" onClick={onThemeToggle}
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}>
          {theme === "dark" ? <Icons.Sun size={14}/> : <Icons.Moon size={14}/>}
        </button>
      </div>
    </aside>
  );
}

/* ---------- Topbar ---------- */
const PAGE_LABELS = {
  dashboard: "Dashboard",
  clients: "Clientes",
  vehicles: "Veículos",
  orders: "Ordens de Serviço",
  finance: "Financeiro",
  inventory: "Estoque",
  settings: "Configurações",
};

function Topbar({ page, onOpenCmdK, onThemeToggle, theme }) {
  return (
    <header className="topbar">
      <div className="topbar__crumbs">
        <span>DRIL AUTOCENTER</span>
        <span className="topbar__sep"><Icons.ChevronRight size={12}/></span>
        <span className="topbar__crumb-current">{PAGE_LABELS[page]}</span>
      </div>
      <button type="button" className="topbar__search" onClick={onOpenCmdK}>
        <Icons.Search size={14}/>
        <span style={{ flex: 1, textAlign: "left" }}>Buscar OS, cliente, veículo, peça…</span>
        <kbd>⌘K</kbd>
      </button>
      <button className="topbar__icon-btn" title="Notificações" onClick={()=>alert("Você tem 3 notificações:\n\n• OS #QYPLW concluída\n• Estoque baixo: Filtro de Ar\n• Pagamento recebido: R$ 2.720,00")}>
        <Icons.Bell size={16}/>
        <span className="dot"></span>
      </button>
      <button className="topbar__icon-btn" title={theme==="dark"?"Modo claro":"Modo escuro"} onClick={onThemeToggle}>
        {theme === "dark" ? <Icons.Sun size={16}/> : <Icons.Moon size={16}/>}
      </button>
      <button type="button" className="topbar__user">
        <div className="topbar__user-avatar">A</div>
        <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
          <span className="topbar__user-name">Administrador</span>
          <span className="topbar__user-role">admin@oficina.com</span>
        </div>
        <Icons.ChevronDown size={14} style={{ color: "var(--text-faint)" }}/>
      </button>
    </header>
  );
}

/* ---------- Status Pill ---------- */
function StatusPill({ status }) {
  const meta = window.STATUS_META[status] || { label: status, color: "var(--text-faint)" };
  return (
    <span className="status-pill" style={{ color: meta.color, background: `color-mix(in oklab, ${meta.color} 12%, transparent)` }}>
      <span className="dot"></span>
      <span style={{ color: "var(--text)" }}>{meta.label}</span>
    </span>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ name, size = 30 }) {
  const ini = window.initials(name || "?");
  const bg = window.avatarBg(name || "");
  return <span className="avatar" style={{ width: size, height: size, fontSize: size*0.36, background: bg }}>{ini}</span>;
}

/* ---------- Sparkline ---------- */
function Sparkline({ data, color = "var(--accent)", width = 80, height = 24, fill = true }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => [i*step, height - ((v - min) / range) * (height - 4) - 2]);
  const path = points.map((p,i) => (i===0?"M":"L") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const area = path + ` L ${width} ${height} L 0 ${height} Z`;
  return (
    <svg className="spark" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      {fill && <path d={area} fill={color} opacity="0.12"/>}
      <path d={path} stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
    </svg>
  );
}

/* ---------- Line + Bar Chart ---------- */
function RevenueChart({ series, height = 280 }) {
  const W = 720;
  const H = height;
  const pad = { l: 44, r: 16, t: 16, b: 32 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const allVals = series.flatMap(d => [d.in, d.out]);
  const max = Math.ceil(Math.max(...allVals) / 5000) * 5000;
  const stepX = innerW / (series.length - 1);

  const yTick = (v) => pad.t + innerH - (v / max) * innerH;
  const xTick = (i) => pad.l + i * stepX;

  const linePath = (key) =>
    series.map((d,i) => (i===0?"M":"L") + xTick(i).toFixed(1) + " " + yTick(d[key]).toFixed(1)).join(" ");

  const areaPath = (key) =>
    linePath(key) + ` L ${pad.l + innerW} ${pad.t + innerH} L ${pad.l} ${pad.t + innerH} Z`;

  const ticks = [0, max*0.25, max*0.5, max*0.75, max];

  const [hover, setHover] = useState(null);

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: "block" }}
           onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="grad-in" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.25"/>
            <stop offset="100%" stopColor="var(--accent)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        {/* grid */}
        {ticks.map((v, i) => (
          <g key={i}>
            <line x1={pad.l} y1={yTick(v)} x2={pad.l + innerW} y2={yTick(v)} stroke="var(--grid-line)" strokeDasharray="2 4"/>
            <text x={pad.l - 8} y={yTick(v) + 3} fontSize="10" fill="var(--text-faint)" textAnchor="end" fontFamily="var(--font-mono)">
              {window.fmtBRLK(v)}
            </text>
          </g>
        ))}
        {/* area in */}
        <path d={areaPath("in")} fill="url(#grad-in)"/>
        {/* line in */}
        <path d={linePath("in")} fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        {/* line out (dashed) */}
        <path d={linePath("out")} fill="none" stroke="var(--text-soft)" strokeWidth="1.5" strokeDasharray="3 4" strokeLinejoin="round" strokeLinecap="round"/>
        {/* points */}
        {series.map((d,i) => (
          <g key={i}>
            <circle cx={xTick(i)} cy={yTick(d.in)} r="3.5" fill="var(--bg-elev)" stroke="var(--accent)" strokeWidth="2"/>
          </g>
        ))}
        {/* x labels */}
        {series.map((d,i) => (
          <text key={i} x={xTick(i)} y={H - 10} fontSize="11" fill="var(--text-soft)" textAnchor="middle">{d.m}</text>
        ))}
        {/* hover hit areas */}
        {series.map((d,i) => (
          <rect key={i}
                x={xTick(i) - stepX/2} y={pad.t} width={stepX} height={innerH}
                fill="transparent"
                onMouseEnter={() => setHover({ i, x: xTick(i), y: yTick(d.in), d })}/>
        ))}
        {hover && (
          <g>
            <line x1={hover.x} y1={pad.t} x2={hover.x} y2={pad.t + innerH} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6"/>
            <circle cx={hover.x} cy={hover.y} r="5" fill="var(--accent)"/>
            <circle cx={hover.x} cy={hover.y} r="9" fill="var(--accent)" opacity="0.18"/>
          </g>
        )}
      </svg>
      {hover && (
        <div style={{
          position: "absolute",
          left: `${(hover.x / W) * 100}%`,
          top: 0,
          transform: "translate(-50%, -100%)",
          marginTop: -4,
          background: "var(--text-strong)",
          color: "var(--bg)",
          padding: "8px 10px",
          borderRadius: 6,
          fontSize: 11.5,
          whiteSpace: "nowrap",
          pointerEvents: "none",
          boxShadow: "var(--shadow-md)",
        }}>
          <div style={{ fontWeight: 600, marginBottom: 2, opacity: 0.9 }}>{hover.d.m}/2026</div>
          <div style={{ display: "flex", gap: 12, fontFamily: "var(--font-mono)" }}>
            <span>↑ {window.fmtBRLK(hover.d.in)}</span>
            <span style={{ opacity: 0.7 }}>↓ {window.fmtBRLK(hover.d.out)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Donut ---------- */
function DonutChart({ data, total, size = 180, thickness = 22 }) {
  const R = size / 2 - thickness / 2;
  const C = 2 * Math.PI * R;
  const sum = total ?? data.reduce((s,d) => s + d.count, 0);
  let acc = 0;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size/2} cy={size/2} r={R} fill="none" stroke="var(--bg-muted)" strokeWidth={thickness}/>
        {data.map((d, i) => {
          const len = (d.count / sum) * C;
          const off = C - len;
          const rot = (acc / sum) * 360 - 90;
          acc += d.count;
          return (
            <circle key={i}
              cx={size/2} cy={size/2} r={R}
              fill="none" stroke={d.color} strokeWidth={thickness}
              strokeDasharray={`${len} ${C}`}
              strokeDashoffset={0}
              transform={`rotate(${rot} ${size/2} ${size/2})`}
              strokeLinecap="butt"/>
          );
        })}
        <text x={size/2} y={size/2 - 4} textAnchor="middle" fontSize="22" fontWeight="600" fill="var(--text-strong)" fontFamily="var(--font-display)" letterSpacing="-0.02em">{sum}</text>
        <text x={size/2} y={size/2 + 14} textAnchor="middle" fontSize="11" fill="var(--text-soft)">total OS</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }}></span>
            <span style={{ flex: 1, color: "var(--text-muted)" }}>{d.label}</span>
            <span style={{ fontWeight: 600, color: "var(--text-strong)", fontVariantNumeric: "tabular-nums" }}>{d.count}</span>
            <span style={{ color: "var(--text-faint)", fontSize: 11.5, minWidth: 32, textAlign: "right" }}>{Math.round((d.count/sum)*100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Modal ---------- */
function Modal({ title, sub, onClose, children, footer, width }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" style={width ? { width } : null} onClick={(e) => e.stopPropagation()}>
        <div className="modal__head">
          <div>
            <h3 className="modal__title">{title}</h3>
            {sub && <div className="modal__sub">{sub}</div>}
          </div>
          <button className="btn btn--ghost btn--icon btn--sm" onClick={onClose}><Icons.X size={14}/></button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

/* ---------- Cmd-K ---------- */
function CmdK({ onClose, onNavigate }) {
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const items = useMemo(() => {
    const navs = [
      { kind: "Navegar", label: "Dashboard", id: "dashboard", meta: "G D", icon: "Dashboard" },
      { kind: "Navegar", label: "Ordens de Serviço", id: "orders", meta: "G O", icon: "Clipboard" },
      { kind: "Navegar", label: "Clientes", id: "clients", meta: "G C", icon: "Users" },
      { kind: "Navegar", label: "Veículos", id: "vehicles", meta: "G V", icon: "Car" },
      { kind: "Navegar", label: "Estoque", id: "inventory", meta: "G E", icon: "Box" },
      { kind: "Navegar", label: "Financeiro", id: "finance", meta: "G F", icon: "Dollar" },
      { kind: "Navegar", label: "Configurações", id: "settings", meta: "G S", icon: "Settings" },
    ];
    const orders = window.MOCK_DATA.orders.map(o => ({
      kind: "Ordem de Serviço", label: `OS #${o.code} — ${window.getVehicle(o.vehicleId).plate}`, id: "orders", meta: window.fmtBRL(o.total), icon: "Clipboard"
    }));
    const clients = window.MOCK_DATA.clients.map(c => ({
      kind: "Cliente", label: c.name, id: "clients", meta: c.phone, icon: "Users"
    }));
    const vehicles = window.MOCK_DATA.vehicles.map(v => ({
      kind: "Veículo", label: `${v.plate} · ${v.brand} ${v.model}`, id: "vehicles", meta: v.year, icon: "Car"
    }));
    const all = [...navs, ...orders, ...clients, ...vehicles];
    if (!q) return navs;
    const ql = q.toLowerCase();
    return all.filter(i => i.label.toLowerCase().includes(ql) || i.kind.toLowerCase().includes(ql)).slice(0, 12);
  }, [q]);

  useEffect(() => { setActive(0); }, [q]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowDown") { setActive((a) => Math.min(items.length - 1, a + 1)); e.preventDefault(); }
      if (e.key === "ArrowUp")   { setActive((a) => Math.max(0, a - 1)); e.preventDefault(); }
      if (e.key === "Enter")     { const it = items[active]; if (it) { onNavigate(it.id); onClose(); } }
      if (e.key === "Escape")    { onClose(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items, active, onClose, onNavigate]);

  // Group rendering
  const grouped = items.reduce((acc, it) => {
    (acc[it.kind] = acc[it.kind] || []).push(it);
    return acc;
  }, {});

  let cursor = -1;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal cmdk" onClick={(e)=>e.stopPropagation()}>
        <div className="cmdk__head">
          <Icons.Search size={16} />
          <input ref={inputRef} placeholder="Buscar OS, cliente, veículo, peça…" value={q} onChange={(e)=>setQ(e.target.value)}/>
          <kbd style={{ fontFamily: "var(--font-mono)", fontSize: 11, padding: "1px 6px", background: "var(--bg-subtle)", border: "1px solid var(--border)", borderRadius: 4, color: "var(--text-soft)" }}>ESC</kbd>
        </div>
        <div className="cmdk__list">
          {Object.entries(grouped).map(([group, list]) => (
            <div key={group}>
              <div className="cmdk__group-label">{group}</div>
              {list.map((it) => {
                cursor++;
                const isActive = cursor === active;
                const Ic = Icons[it.icon];
                return (
                  <div key={cursor} className={"cmdk__item" + (isActive ? " is-active" : "")}
                       onMouseEnter={() => setActive(cursor)}
                       onClick={() => { onNavigate(it.id); onClose(); }}>
                    <Ic size={15}/>
                    <span>{it.label}</span>
                    <span className="cmdk__item-meta">{it.meta}</span>
                  </div>
                );
              })}
            </div>
          ))}
          {items.length === 0 && (
            <div style={{ padding: 24, textAlign: "center", color: "var(--text-soft)", fontSize: 13 }}>
              Nenhum resultado para “{q}”.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Empty state ---------- */
function EmptyState({ icon = "Package", title, sub, action }) {
  const Ic = Icons[icon];
  return (
    <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-soft)" }}>
      <div style={{
        width: 56, height: 56, margin: "0 auto 12px",
        borderRadius: 14, background: "var(--accent-soft)", color: "var(--accent-text)",
        display: "grid", placeItems: "center"
      }}><Ic size={24}/></div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text-strong)", marginBottom: 4 }}>{title}</div>
      <div style={{ fontSize: 13, marginBottom: 16 }}>{sub}</div>
      {action}
    </div>
  );
}

Object.assign(window, { Sidebar, Topbar, StatusPill, Avatar, Sparkline, RevenueChart, DonutChart, Modal, CmdK, EmptyState });
