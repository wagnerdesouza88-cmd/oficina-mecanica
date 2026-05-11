/* global React, Icons, Avatar */
// =====================================================
// AutoGest — Configurações
// =====================================================
const { useState: useStateSet } = React;

function SettingsScreen({ theme, onThemeChange }) {
  const [tab, setTab] = useStateSet("workshop");
  const [notif, setNotif] = useStateSet({ os: true, low: true, fin: false, mkt: false });

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Configurações</h1>
          <p className="page__sub">Personalize sua oficina, equipe e preferências</p>
        </div>
      </div>

      <div className="settings-grid">
        <div className="settings-tabs">
          <SetTab id="workshop" active={tab} onClick={setTab} icon="Building" label="Oficina"/>
          <SetTab id="team"     active={tab} onClick={setTab} icon="Users"    label="Equipe"/>
          <SetTab id="appear"   active={tab} onClick={setTab} icon="Sliders"  label="Aparência"/>
          <SetTab id="notif"    active={tab} onClick={setTab} icon="Bell"     label="Notificações"/>
          <SetTab id="billing"  active={tab} onClick={setTab} icon="CreditCard" label="Plano e cobrança"/>
          <SetTab id="security" active={tab} onClick={setTab} icon="ShieldUser" label="Segurança"/>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "workshop" && (
            <>
              <Section title="Identidade da oficina" sub="Dados que aparecem em ordens de serviço e relatórios.">
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  <Field label="Nome fantasia"><input className="input" defaultValue="DRIL AUTOCENTER"/></Field>
                  <Field label="Razão social"><input className="input" defaultValue="DRIL Autopeças e Serviços LTDA"/></Field>
                  <Field label="CNPJ"><input className="input" defaultValue="12.345.678/0001-90"/></Field>
                  <Field label="Inscrição estadual"><input className="input" defaultValue="206.741.382.119"/></Field>
                  <Field label="Telefone"><input className="input" defaultValue="(41) 3232-9988"/></Field>
                  <Field label="E-mail"><input className="input" defaultValue="contato@dril.com.br"/></Field>
                  <Field label="Endereço" full><input className="input" defaultValue="Av. Iguaçu, 1850 — Rebouças, Curitiba/PR"/></Field>
                </div>
              </Section>
              <Section title="Horário de funcionamento" sub="Definição dos horários em que a oficina recebe agendamentos.">
                <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 80px", gap: 10, alignItems: "center", fontSize: 13 }}>
                  {[
                    ["Seg — Sex", "08:00", "18:00", true],
                    ["Sábado",    "08:00", "12:00", true],
                    ["Domingo",   "—",     "—",     false],
                  ].map((row, i) => (
                    <React.Fragment key={i}>
                      <span style={{ color: "var(--text-muted)", fontWeight: 500 }}>{row[0]}</span>
                      <input className="input" defaultValue={row[1]}/>
                      <input className="input" defaultValue={row[2]}/>
                      <div className={"toggle" + (row[3] ? " is-on" : "")}></div>
                    </React.Fragment>
                  ))}
                </div>
              </Section>
            </>
          )}

          {tab === "appear" && (
            <Section title="Aparência" sub="Personalize a interface conforme a preferência da equipe.">
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Tema</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                    <ThemeOpt id="light" active={theme} onClick={onThemeChange} label="Claro" desc="Recepção e dia-a-dia"
                              swatch={["#f6f9fc","#ffffff","#635bff","#0a2540"]}/>
                    <ThemeOpt id="dark" active={theme} onClick={onThemeChange} label="Escuro" desc="Confortável à noite"
                              swatch={["#0a0d1f","#11152b","#8b85ff","#f0f2f8"]}/>
                    <ThemeOpt id="system" active={theme} onClick={onThemeChange} label="Sistema" desc="Acompanha o S.O."
                              swatch={["linear-gradient(135deg, #f6f9fc 50%, #0a0d1f 50%)","#ffffff","#635bff","#0a2540"]}/>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 10 }}>Cor de destaque</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {["#635bff","#008060","#0570de","#c47e0a","#d4351c","#7c3aed"].map((c,i) => (
                      <button key={i} style={{
                        width: 32, height: 32, borderRadius: 8, background: c,
                        border: i===0 ? "2px solid var(--text-strong)" : "1px solid var(--border)",
                        boxShadow: i===0 ? "var(--shadow-sm)" : "none",
                        position: "relative"
                      }}>
                        {i === 0 && <Icons.Check size={14} style={{ color: "#fff", position: "absolute", top: 7, left: 7 }}/>}
                      </button>
                    ))}
                  </div>
                </div>
                <Row2 label="Densidade da tabela" hint="Compacto exibe mais linhas por tela.">
                  <div className="chips">
                    <button className="chip">Compacto</button>
                    <button className="chip is-active">Conforto</button>
                    <button className="chip">Espaçoso</button>
                  </div>
                </Row2>
                <Row2 label="Animações" hint="Desative para reduzir movimento.">
                  <div className="toggle is-on"></div>
                </Row2>
              </div>
            </Section>
          )}

          {tab === "team" && (
            <Section title="Equipe" sub="3 mecânicos · 1 administrador" action={<button className="btn btn--primary btn--sm"><Icons.Plus size={12}/> Convidar</button>}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {[
                  { name: "Administrador",  email: "admin@oficina.com", role: "Proprietário", os: "—" },
                  { name: "Eduardo Silva",  email: "eduardo@dril.com.br", role: "Mecânico Sr.",  os: 84 },
                  { name: "Bruno Almeida",  email: "bruno@dril.com.br", role: "Mecânico",      os: 67 },
                  { name: "Carlos Moura",   email: "carlos@dril.com.br", role: "Recepção",      os: "—" },
                ].map((m,i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: i < 3 ? "1px solid var(--border-soft)" : "0" }}>
                    <Avatar name={m.name} size={36}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{m.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-soft)" }}>{m.email}</div>
                    </div>
                    <span className="badge badge--brand">{m.role}</span>
                    <span style={{ fontSize: 12, color: "var(--text-soft)", minWidth: 80, textAlign: "right" }}>
                      {m.os === "—" ? "—" : <><b style={{ color: "var(--text)" }}>{m.os}</b> OS / mês</>}
                    </span>
                    <button className="btn btn--ghost btn--icon btn--sm"><Icons.More size={14}/></button>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {tab === "notif" && (
            <Section title="Notificações" sub="Defina o que dispara alertas para você e sua equipe.">
              <NotifRow label="Nova ordem de serviço" hint="Quando uma OS é aberta ou modificada." on={notif.os} onChange={()=>setNotif({...notif, os: !notif.os})}/>
              <NotifRow label="Estoque baixo" hint="Quando uma peça atinge o estoque mínimo." on={notif.low} onChange={()=>setNotif({...notif, low: !notif.low})}/>
              <NotifRow label="Recebimentos" hint="Confirmação de pagamentos via PIX e cartão." on={notif.fin} onChange={()=>setNotif({...notif, fin: !notif.fin})}/>
              <NotifRow label="Marketing & novidades" hint="Atualizações do AutoGest e dicas." on={notif.mkt} onChange={()=>setNotif({...notif, mkt: !notif.mkt})} last/>
            </Section>
          )}

          {tab === "billing" && (
            <Section title="Plano e cobrança" sub="Próxima fatura em 28 de maio de 2026.">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{
                  padding: 18, borderRadius: 12,
                  background: "linear-gradient(135deg, var(--brand-600) 0%, var(--brand-700) 80%)",
                  color: "#fff",
                  position: "relative", overflow: "hidden"
                }}>
                  <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.85, letterSpacing: "0.06em", textTransform: "uppercase" }}>Plano atual</div>
                  <div style={{ fontSize: 24, fontWeight: 700, marginTop: 4, fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>Professional</div>
                  <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2 }}>Até 10 usuários · OS ilimitadas · Financeiro completo</div>
                  <div style={{ fontSize: 30, fontWeight: 600, marginTop: 14, fontFamily: "var(--font-display)", letterSpacing: "-0.025em" }}>
                    R$ 249<span style={{ fontSize: 14, opacity: 0.7 }}>/mês</span>
                  </div>
                  <Icons.Zap size={120} style={{ position: "absolute", right: -20, bottom: -20, opacity: 0.08 }}/>
                </div>
                <div style={{ padding: 18 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Forma de pagamento</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, border: "1px solid var(--border)", borderRadius: 10 }}>
                    <Icons.CreditCard size={20} style={{ color: "var(--accent-text)" }}/>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>Visa •••• 4242</div>
                      <div style={{ fontSize: 11.5, color: "var(--text-soft)" }}>Expira em 09/2028</div>
                    </div>
                    <button className="btn btn--ghost btn--sm">Trocar</button>
                  </div>
                  <button className="btn btn--secondary mt-3" style={{ width: "100%" }}>Ver histórico de faturas</button>
                </div>
              </div>
            </Section>
          )}

          {tab === "security" && (
            <Section title="Segurança" sub="Mantenha a conta da oficina protegida.">
              <NotifRow label="Verificação em duas etapas" hint="Exigir código no celular ao entrar." on={true}/>
              <NotifRow label="Sessões expiram em 30 dias" hint="Faça login novamente após esse período." on={true}/>
              <NotifRow label="Notificar acessos suspeitos" hint="Avisar quando um novo dispositivo entrar." on={false} last/>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

function SetTab({ id, active, onClick, icon, label }) {
  const Ic = Icons[icon];
  return (
    <button className={"settings-tab" + (active === id ? " is-active" : "")} onClick={()=>onClick(id)}>
      <Ic size={15}/> {label}
    </button>
  );
}

function Section({ title, sub, action, children }) {
  return (
    <div className="card">
      <div className="card__head">
        <div>
          <h3 className="card__title">{title}</h3>
          {sub && <div className="card__sub">{sub}</div>}
        </div>
        {action}
      </div>
      <div className="card__body">{children}</div>
    </div>
  );
}

function Field({ label, full, children }) {
  return (
    <div className="field" style={full ? { gridColumn: "1 / -1" } : null}>
      <label className="field__label">{label}</label>
      {children}
    </div>
  );
}

function Row2({ label, hint, children }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid var(--border-soft)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}>{hint}</div>}
      </div>
      {children}
    </div>
  );
}

function NotifRow({ label, hint, on, onChange, last }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0", borderBottom: last ? "0" : "1px solid var(--border-soft)" }}>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 500 }}>{label}</div>
        {hint && <div style={{ fontSize: 12, color: "var(--text-soft)", marginTop: 2 }}>{hint}</div>}
      </div>
      <button type="button" className={"toggle" + (on ? " is-on" : "")} onClick={onChange}></button>
    </div>
  );
}

function ThemeOpt({ id, active, onClick, label, desc, swatch }) {
  const isActive = active === id;
  return (
    <button type="button" onClick={()=>onClick(id)}
      style={{
        padding: 12, borderRadius: 12,
        border: isActive ? "2px solid var(--accent)" : "1px solid var(--border)",
        background: "var(--bg-elev)",
        textAlign: "left",
        boxShadow: isActive ? "var(--ring)" : "none",
        transition: "all 160ms var(--ease-out)",
      }}>
      <div style={{ height: 56, borderRadius: 8, background: swatch[0], border: "1px solid var(--border)", marginBottom: 10, padding: 6, display: "flex", alignItems: "center", gap: 4, overflow: "hidden" }}>
        <div style={{ width: 24, height: 44, borderRadius: 4, background: swatch[1], flexShrink: 0 }}></div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ height: 6, background: swatch[3], opacity: 0.85, borderRadius: 2, width: "70%" }}></div>
          <div style={{ height: 5, background: swatch[3], opacity: 0.35, borderRadius: 2, width: "55%" }}></div>
          <div style={{ height: 16, background: swatch[2], borderRadius: 3, width: "40%", marginTop: 2 }}></div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-strong)" }}>{label}</div>
      <div style={{ fontSize: 11.5, color: "var(--text-soft)", marginTop: 1 }}>{desc}</div>
    </button>
  );
}

window.SettingsScreen = SettingsScreen;
