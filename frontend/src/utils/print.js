// ── Helpers ──────────────────────────────────────────────────────────────────

function brl(v) {
  return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function dt(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('pt-BR')
}

function valorPorExtenso(valor) {
  const inteiro = Math.floor(valor)
  const centavos = Math.round((valor - inteiro) * 100)
  const uni = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove',
    'dez', 'onze', 'doze', 'treze', 'quatorze', 'quinze', 'dezesseis', 'dezessete', 'dezoito', 'dezenove']
  const dez = ['', '', 'vinte', 'trinta', 'quarenta', 'cinquenta', 'sessenta', 'setenta', 'oitenta', 'noventa']
  const cen = ['', 'cento', 'duzentos', 'trezentos', 'quatrocentos', 'quinhentos',
    'seiscentos', 'setecentos', 'oitocentos', 'novecentos']

  function p(n) {
    if (n === 0) return ''
    if (n === 100) return 'cem'
    if (n < 20) return uni[n]
    if (n < 100) return dez[Math.floor(n / 10)] + (n % 10 ? ' e ' + uni[n % 10] : '')
    return cen[Math.floor(n / 100)] + (n % 100 ? ' e ' + p(n % 100) : '')
  }

  function m(n) {
    if (n === 0) return 'zero'
    let r = ''
    if (n >= 1000000) {
      const x = Math.floor(n / 1000000)
      r += p(x) + (x === 1 ? ' milhão' : ' milhões')
      n %= 1000000
      if (n) r += ' e '
    }
    if (n >= 1000) {
      const x = Math.floor(n / 1000)
      r += (x === 1 ? 'mil' : p(x) + ' mil')
      n %= 1000
      if (n) r += ' e '
    }
    if (n > 0) r += p(n)
    return r
  }

  const s = m(inteiro) + (inteiro === 1 ? ' real' : ' reais') +
    (centavos > 0 ? ' e ' + p(centavos) + (centavos === 1 ? ' centavo' : ' centavos') : '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const STATUS_LABEL = {
  ABERTA: 'Aberta', EM_ANDAMENTO: 'Em Andamento', AGUARDANDO_PECA: 'Aguardando Peça',
  CONCLUIDA: 'Concluída', CANCELADA: 'Cancelada',
}
const FORMA_LABEL = {
  DINHEIRO: 'Dinheiro', DEBITO: 'Débito', CREDITO: 'Crédito', PIX: 'Pix', BOLETO: 'Boleto',
}

// ── Cabeçalho comum ──────────────────────────────────────────────────────────

function htmlCabecalho(config) {
  const endereco = [config.rua, config.numero, config.complemento, config.bairro]
    .filter(Boolean).join(', ')
  const cidadeEstado = [config.cidade, config.estado, config.cep].filter(Boolean).join(' — ')
  const contato = [
    config.telefone && `Tel: ${config.telefone}`,
    config.whatsapp && `WhatsApp: ${config.whatsapp}`,
    config.email && config.email,
  ].filter(Boolean).join('  |  ')

  return `
    <div class="header">
      ${config.logoBase64
        ? `<img src="${config.logoBase64}" alt="Logo" class="logo" />`
        : `<div class="logo-placeholder"><span>⚙</span></div>`}
      <div class="header-info">
        <div class="empresa-nome">${config.nomeFantasia || config.nomeOficina || 'AutoGest'}</div>
        ${config.nomeEmpresarial ? `<div class="empresa-razao">${config.nomeEmpresarial}</div>` : ''}
        <div class="empresa-detalhe">
          ${config.cnpj ? `CNPJ: <strong>${config.cnpj}</strong>` : ''}
          ${config.cnpj && config.inscricaoEstadual ? '  |  ' : ''}
          ${config.inscricaoEstadual ? `IE: ${config.inscricaoEstadual}` : ''}
        </div>
        ${endereco ? `<div class="empresa-detalhe">${endereco}</div>` : ''}
        ${cidadeEstado ? `<div class="empresa-detalhe">${cidadeEstado}</div>` : ''}
        ${contato ? `<div class="empresa-detalhe">${contato}</div>` : ''}
      </div>
    </div>
    <hr class="divider" />
  `
}

// ── CSS comum ────────────────────────────────────────────────────────────────

function cssBase(primary = '#1e3a5f', secondary = '#f97316') {
  return `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; font-size: 12px; color: #222; background: #fff; padding: 0; }
    .page { max-width: 210mm; margin: 0 auto; padding: 18mm 15mm; }

    /* Header */
    .header { display: flex; align-items: flex-start; gap: 16px; margin-bottom: 16px; }
    .logo { width: 72px; height: 72px; object-fit: contain; border-radius: 8px; flex-shrink: 0; }
    .logo-placeholder { width: 72px; height: 72px; background: ${primary}; border-radius: 8px;
      display: flex; align-items: center; justify-content: center; font-size: 32px; color: white; flex-shrink: 0; }
    .header-info { flex: 1; }
    .empresa-nome { font-size: 20px; font-weight: 800; color: ${primary}; letter-spacing: -0.5px; }
    .empresa-razao { font-size: 11px; color: #555; margin-top: 2px; }
    .empresa-detalhe { font-size: 10px; color: #666; margin-top: 2px; }
    .divider { border: none; border-top: 2px solid ${primary}; margin: 12px 0; }
    .divider-light { border: none; border-top: 1px solid #e0e0e0; margin: 10px 0; }

    /* Title */
    .doc-title { text-align: center; font-size: 15px; font-weight: 700; color: ${primary};
      text-transform: uppercase; letter-spacing: 2px; margin: 10px 0 16px; }
    .os-number { text-align: center; font-size: 11px; color: #777; margin-bottom: 16px; }

    /* Sections */
    .section { margin-bottom: 14px; }
    .section-title { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px;
      color: #fff; background: ${primary}; padding: 4px 10px; border-radius: 4px; margin-bottom: 8px; display: inline-block; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
    .info-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 20px; }
    .info-item { display: flex; flex-direction: column; }
    .info-label { font-size: 8px; text-transform: uppercase; color: #999; font-weight: 600; margin-bottom: 1px; }
    .info-value { font-size: 11px; color: #222; font-weight: 500; }

    /* Tables */
    table { width: 100%; border-collapse: collapse; margin-top: 6px; }
    th { background: ${primary}; color: white; font-size: 9px; text-transform: uppercase;
      padding: 5px 8px; text-align: left; font-weight: 700; letter-spacing: 0.5px; }
    td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; font-size: 11px; }
    tr:nth-child(even) td { background: #f9f9f9; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }

    /* Totais */
    .totals-box { margin-top: 10px; border: 1px solid #e0e0e0; border-radius: 6px; overflow: hidden; }
    .total-row { display: flex; justify-content: space-between; padding: 6px 12px; border-bottom: 1px solid #f0f0f0; }
    .total-row:last-child { border-bottom: none; }
    .total-label { font-size: 11px; color: #555; }
    .total-value { font-size: 11px; font-weight: 600; color: #222; }
    .total-final { background: ${primary}; }
    .total-final .total-label, .total-final .total-value { color: white; font-size: 13px; font-weight: 800; }

    /* Assinaturas */
    .signatures { display: flex; gap: 30px; margin-top: 30px; }
    .sig-block { flex: 1; text-align: center; }
    .sig-line { border-top: 1px solid #333; padding-top: 6px; margin-top: 40px; }
    .sig-label { font-size: 10px; color: #555; }

    /* Recibo específico */
    .recibo-valor-box { border: 2px solid ${primary}; border-radius: 8px; padding: 16px; margin: 16px 0; text-align: center; }
    .recibo-valor { font-size: 28px; font-weight: 900; color: ${primary}; }
    .recibo-extenso { font-size: 11px; color: #555; font-style: italic; margin-top: 4px; }

    /* Footer */
    .footer { text-align: center; font-size: 9px; color: #bbb; margin-top: 20px;
      padding-top: 10px; border-top: 1px solid #e8e8e8; }

    /* Badge status */
    .status-badge { display: inline-block; padding: 2px 8px; border-radius: 20px; font-size: 9px;
      font-weight: 700; text-transform: uppercase; background: #e8f5e9; color: #388e3c; }

    @media print {
      @page { margin: 0; size: A4; }
      body { padding: 0; }
      .page { padding: 12mm 12mm; max-width: none; }
    }
  `
}

// ── Impressão de OS ──────────────────────────────────────────────────────────

export function imprimirOS(ordem, config = {}) {
  const primary = config.corPrimaria || '#1e3a5f'
  const secondary = config.corSecundaria || '#f97316'
  const osNum = ordem.id.slice(-6).toUpperCase()
  const subtotalServicos = (ordem.itens ?? []).reduce((a, i) => a + Number(i.preco), 0)
  const subtotalPecas = (ordem.pecas ?? []).reduce((a, p) => a + Number(p.subtotal), 0)
  const total = Number(ordem.total)
  const desconto = subtotalServicos + subtotalPecas - total

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>OS #${osNum} — ${config.nomeFantasia || config.nomeOficina || 'AutoGest'}</title>
<style>${cssBase(primary, secondary)}</style>
</head>
<body>
<div class="page">
  ${htmlCabecalho(config)}

  <div class="doc-title">Ordem de Serviço</div>
  <div class="os-number">OS Nº ${osNum} &nbsp;|&nbsp; Emitida em ${dt(new Date())}</div>

  <!-- Dados da OS -->
  <div class="section">
    <span class="section-title">Dados da OS</span>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Número</span><span class="info-value">#${osNum}</span></div>
      <div class="info-item"><span class="info-label">Status</span><span class="info-value">${STATUS_LABEL[ordem.status] || ordem.status}</span></div>
      <div class="info-item"><span class="info-label">Data de Entrada</span><span class="info-value">${dt(ordem.dataEntrada)}</span></div>
      <div class="info-item"><span class="info-label">Previsão de Entrega</span><span class="info-value">${dt(ordem.previsaoEntrega)}</span></div>
      <div class="info-item"><span class="info-label">Data de Entrega</span><span class="info-value">${dt(ordem.dataEntrega)}</span></div>
      ${ordem.pagamento ? `<div class="info-item"><span class="info-label">Forma de Pagamento</span><span class="info-value">${FORMA_LABEL[ordem.pagamento.formaPagamento] || '—'}</span></div>` : ''}
    </div>
  </div>

  <hr class="divider-light" />

  <!-- Cliente -->
  <div class="section">
    <span class="section-title">Dados do Cliente</span>
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Nome</span><span class="info-value">${ordem.veiculo.cliente.nome}</span></div>
      <div class="info-item"><span class="info-label">CPF</span><span class="info-value">${ordem.veiculo.cliente.cpf || '—'}</span></div>
      <div class="info-item"><span class="info-label">Telefone</span><span class="info-value">${ordem.veiculo.cliente.telefone || '—'}</span></div>
      <div class="info-item"><span class="info-label">E-mail</span><span class="info-value">${ordem.veiculo.cliente.email || '—'}</span></div>
    </div>
  </div>

  <hr class="divider-light" />

  <!-- Veículo -->
  <div class="section">
    <span class="section-title">Dados do Veículo</span>
    <div class="info-grid-3">
      <div class="info-item"><span class="info-label">Placa</span><span class="info-value" style="font-weight:800;font-size:13px">${ordem.veiculo.placa}</span></div>
      <div class="info-item"><span class="info-label">Marca</span><span class="info-value">${ordem.veiculo.marca}</span></div>
      <div class="info-item"><span class="info-label">Modelo</span><span class="info-value">${ordem.veiculo.modelo}</span></div>
      <div class="info-item"><span class="info-label">Ano</span><span class="info-value">${ordem.veiculo.ano}</span></div>
      <div class="info-item"><span class="info-label">Cor</span><span class="info-value">${ordem.veiculo.cor || '—'}</span></div>
    </div>
  </div>

  <hr class="divider-light" />

  <!-- Serviços -->
  ${(ordem.itens ?? []).length > 0 ? `
  <div class="section">
    <span class="section-title">Serviços Realizados</span>
    <table>
      <thead>
        <tr>
          <th>Descrição do Serviço</th>
          <th class="text-right" style="width:130px">Valor</th>
        </tr>
      </thead>
      <tbody>
        ${(ordem.itens ?? []).map((i) => `
        <tr>
          <td>${i.nome}</td>
          <td class="text-right">${brl(i.preco)}</td>
        </tr>`).join('')}
        <tr>
          <td style="font-weight:700;text-align:right;color:#555">Subtotal Mão de Obra</td>
          <td class="text-right" style="font-weight:700">${brl(subtotalServicos)}</td>
        </tr>
      </tbody>
    </table>
  </div>` : ''}

  <!-- Peças -->
  ${(ordem.pecas ?? []).length > 0 ? `
  <div class="section">
    <span class="section-title">Peças Utilizadas</span>
    <table>
      <thead>
        <tr>
          <th style="width:80px">Código</th>
          <th>Descrição</th>
          <th class="text-center" style="width:70px">Qtd.</th>
          <th class="text-right" style="width:100px">Vl. Unit.</th>
          <th class="text-right" style="width:110px">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${(ordem.pecas ?? []).map((p) => `
        <tr>
          <td style="font-family:monospace;font-size:10px">${p.produto?.codigo || '—'}</td>
          <td>${p.produto?.nome || '—'}</td>
          <td class="text-center">${Number(p.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 3 })} ${p.produto?.unidade || ''}</td>
          <td class="text-right">${brl(p.precoUnitario)}</td>
          <td class="text-right">${brl(p.subtotal)}</td>
        </tr>`).join('')}
        <tr>
          <td colspan="4" style="font-weight:700;text-align:right;color:#555">Subtotal Peças</td>
          <td class="text-right" style="font-weight:700">${brl(subtotalPecas)}</td>
        </tr>
      </tbody>
    </table>
  </div>` : ''}

  ${ordem.descricao ? `
  <div class="section">
    <span class="section-title">Observações</span>
    <p style="font-size:11px;color:#444;margin-top:6px;line-height:1.5">${ordem.descricao}</p>
  </div>` : ''}

  <!-- Resumo financeiro -->
  <div class="section">
    <span class="section-title">Resumo Financeiro</span>
    <div class="totals-box">
      ${subtotalServicos > 0 ? `<div class="total-row"><span class="total-label">Subtotal Mão de Obra</span><span class="total-value">${brl(subtotalServicos)}</span></div>` : ''}
      ${subtotalPecas > 0 ? `<div class="total-row"><span class="total-label">Subtotal Peças</span><span class="total-value">${brl(subtotalPecas)}</span></div>` : ''}
      ${desconto > 0.01 ? `<div class="total-row"><span class="total-label" style="color:#e53935">Desconto</span><span class="total-value" style="color:#e53935">-${brl(desconto)}</span></div>` : ''}
      ${ordem.pagamento ? `<div class="total-row"><span class="total-label">Forma de Pagamento</span><span class="total-value">${FORMA_LABEL[ordem.pagamento.formaPagamento] || '—'}${ordem.pagamento.parcelas > 1 ? ` (${ordem.pagamento.parcelas}x de ${brl(ordem.pagamento.valorParcela)})` : ''}</span></div>` : ''}
      <div class="total-row total-final"><span class="total-label">TOTAL GERAL</span><span class="total-value">${brl(total)}</span></div>
    </div>
  </div>

  <!-- Assinaturas -->
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line"><div class="sig-label">${ordem.veiculo.cliente.nome}</div><div class="sig-label">Assinatura do Cliente</div></div>
    </div>
    <div class="sig-block">
      <div class="sig-line"><div class="sig-label">${config.nomeFantasia || config.nomeOficina || 'AutoGest'}</div><div class="sig-label">Assinatura do Responsável</div></div>
    </div>
  </div>

  <div class="footer">Documento emitido pelo AutoGest — Gestão Automotiva &nbsp;|&nbsp; ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 600)
}

// ── Impressão de Recibo ──────────────────────────────────────────────────────

export function imprimirRecibo(ordem, config = {}) {
  const primary = config.corPrimaria || '#1e3a5f'
  const secondary = config.corSecundaria || '#f97316'
  const osNum = ordem.id.slice(-6).toUpperCase()
  const pag = ordem.pagamento
  if (!pag) return
  const reciboNum = `REC-${new Date().getFullYear()}-${pag.id.slice(-6).toUpperCase()}`
  const subtotalServicos = (ordem.itens ?? []).reduce((a, i) => a + Number(i.preco), 0)
  const subtotalPecas = (ordem.pecas ?? []).reduce((a, p) => a + Number(p.subtotal), 0)
  const total = Number(pag.valor)

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Recibo ${reciboNum}</title>
<style>${cssBase(primary, secondary)}</style>
</head>
<body>
<div class="page">
  ${htmlCabecalho(config)}

  <div class="doc-title">Recibo de Pagamento</div>
  <div class="os-number">Recibo Nº ${reciboNum}</div>

  <!-- Valor em destaque -->
  <div class="recibo-valor-box">
    <div style="font-size:10px;color:#777;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Valor Recebido</div>
    <div class="recibo-valor">${brl(total)}</div>
    <div class="recibo-extenso">${valorPorExtenso(total)}</div>
  </div>

  <!-- Corpo do recibo -->
  <div class="section">
    <div class="info-grid">
      <div class="info-item"><span class="info-label">Data do Pagamento</span><span class="info-value">${dt(pag.dataPagamento)}</span></div>
      <div class="info-item"><span class="info-label">Forma de Pagamento</span><span class="info-value">${FORMA_LABEL[pag.formaPagamento] || pag.formaPagamento}${pag.parcelas > 1 ? ` (${pag.parcelas}x de ${brl(pag.valorParcela)})` : ''}</span></div>
      <div class="info-item"><span class="info-label">Referente à OS</span><span class="info-value">#${osNum}</span></div>
      <div class="info-item"><span class="info-label">Número do Recibo</span><span class="info-value">${reciboNum}</span></div>
    </div>
  </div>

  <hr class="divider-light" />

  <div class="section">
    <p style="font-size:12px;line-height:1.8;color:#333">
      Recebi de <strong>${ordem.veiculo.cliente.nome}</strong>
      ${ordem.veiculo.cliente.cpf ? `, CPF <strong>${ordem.veiculo.cliente.cpf}</strong>,` : ''}
      a importância de <strong>${brl(total)}</strong> (<em>${valorPorExtenso(total)}</em>),
      referente aos serviços realizados na Ordem de Serviço <strong>#${osNum}</strong>
      no veículo <strong>${ordem.veiculo.marca} ${ordem.veiculo.modelo}</strong>,
      placa <strong>${ordem.veiculo.placa}</strong>, ano <strong>${ordem.veiculo.ano}</strong>.
    </p>
  </div>

  <hr class="divider-light" />

  <!-- Detalhamento -->
  ${(ordem.itens ?? []).length > 0 ? `
  <div class="section">
    <span class="section-title">Serviços</span>
    <table>
      <thead><tr><th>Descrição</th><th class="text-right" style="width:130px">Valor</th></tr></thead>
      <tbody>
        ${(ordem.itens ?? []).map((i) => `<tr><td>${i.nome}</td><td class="text-right">${brl(i.preco)}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  ${(ordem.pecas ?? []).length > 0 ? `
  <div class="section">
    <span class="section-title">Peças</span>
    <table>
      <thead><tr><th>Descrição</th><th class="text-center" style="width:80px">Qtd.</th><th class="text-right" style="width:110px">Subtotal</th></tr></thead>
      <tbody>
        ${(ordem.pecas ?? []).map((p) => `<tr><td>${p.produto?.nome || '—'}</td><td class="text-center">${Number(p.quantidade).toLocaleString('pt-BR', { minimumFractionDigits: 3 })} ${p.produto?.unidade || ''}</td><td class="text-right">${brl(p.subtotal)}</td></tr>`).join('')}
      </tbody>
    </table>
  </div>` : ''}

  <!-- Total -->
  <div class="totals-box" style="margin-top:10px">
    ${subtotalServicos > 0 ? `<div class="total-row"><span class="total-label">Subtotal Mão de Obra</span><span class="total-value">${brl(subtotalServicos)}</span></div>` : ''}
    ${subtotalPecas > 0 ? `<div class="total-row"><span class="total-label">Subtotal Peças</span><span class="total-value">${brl(subtotalPecas)}</span></div>` : ''}
    <div class="total-row total-final"><span class="total-label">TOTAL PAGO</span><span class="total-value">${brl(total)}</span></div>
  </div>

  <!-- Local e data + assinatura -->
  <div style="margin-top:24px;display:flex;justify-content:space-between;align-items:flex-end">
    <div style="font-size:11px;color:#555">
      ${config.cidade || '_______________'}, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
    </div>
  </div>
  <div class="signatures">
    <div class="sig-block">
      <div class="sig-line"><div class="sig-label">${config.nomeFantasia || config.nomeOficina || 'AutoGest'}</div><div class="sig-label">Assinatura do Responsável</div></div>
    </div>
    <div class="sig-block" style="flex:0 0 auto;min-width:180px">
      <div class="sig-line" style="text-align:center"><div class="sig-label" style="font-size:9px;color:#aaa">Carimbo (opcional)</div></div>
    </div>
  </div>

  <div class="footer" style="margin-top:16px;padding-top:8px;border-top:1px solid #eee;color:#aaa;font-size:9px">
    Este recibo é válido como comprovante de pagamento &nbsp;|&nbsp;
    Emitido pelo AutoGest — Gestão Automotiva &nbsp;|&nbsp; ${new Date().toLocaleDateString('pt-BR')}
  </div>
</div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=700')
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 600)
}
