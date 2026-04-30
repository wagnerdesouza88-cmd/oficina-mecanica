import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const servicos = [
  // ── PREVENTIVA ──────────────────────────────────────────────────────────────
  { nome: 'Troca de óleo e filtro',          categoria: 'PREVENTIVA',        precoSugerido: 120  },
  { nome: 'Troca de filtro de ar',           categoria: 'PREVENTIVA',        precoSugerido: 60   },
  { nome: 'Troca de filtro de combustível',  categoria: 'PREVENTIVA',        precoSugerido: 80   },
  { nome: 'Troca de filtro de cabine',       categoria: 'PREVENTIVA',        precoSugerido: 70   },
  { nome: 'Revisão geral',                   categoria: 'PREVENTIVA',        precoSugerido: 350  },
  { nome: 'Troca de velas',                  categoria: 'PREVENTIVA',        precoSugerido: 150  },
  { nome: 'Troca de correia dentada',        categoria: 'PREVENTIVA',        precoSugerido: 400  },
  { nome: 'Troca de correia auxiliar',       categoria: 'PREVENTIVA',        precoSugerido: 180  },
  { nome: 'Troca de fluido de freio',        categoria: 'PREVENTIVA',        precoSugerido: 90   },
  { nome: 'Troca de fluido de embreagem',    categoria: 'PREVENTIVA',        precoSugerido: 90   },
  { nome: 'Troca de líquido de arrefecimento', categoria: 'PREVENTIVA',      precoSugerido: 120  },
  { nome: 'Troca de óleo de câmbio',         categoria: 'PREVENTIVA',        precoSugerido: 150  },
  { nome: 'Troca de óleo do diferencial',    categoria: 'PREVENTIVA',        precoSugerido: 150  },

  // ── FREIOS ──────────────────────────────────────────────────────────────────
  { nome: 'Troca de pastilhas dianteiras',   categoria: 'FREIOS',            precoSugerido: 180  },
  { nome: 'Troca de pastilhas traseiras',    categoria: 'FREIOS',            precoSugerido: 160  },
  { nome: 'Troca de disco de freio',         categoria: 'FREIOS',            precoSugerido: 250  },
  { nome: 'Troca de tambor',                 categoria: 'FREIOS',            precoSugerido: 200  },
  { nome: 'Troca de sapata',                 categoria: 'FREIOS',            precoSugerido: 150  },
  { nome: 'Sangria de freios',               categoria: 'FREIOS',            precoSugerido: 80   },
  { nome: 'Reparo de cilindro de roda',      categoria: 'FREIOS',            precoSugerido: 120  },
  { nome: 'Reparo de cilindro mestre',       categoria: 'FREIOS',            precoSugerido: 180  },

  // ── SUSPENSAO_DIRECAO ────────────────────────────────────────────────────────
  { nome: 'Alinhamento',                     categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 80   },
  { nome: 'Balanceamento',                   categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 60   },
  { nome: 'Troca de amortecedor',            categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 300  },
  { nome: 'Troca de mola',                   categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 200  },
  { nome: 'Troca de pivô',                   categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 250  },
  { nome: 'Troca de bandeja',                categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 350  },
  { nome: 'Troca de barra estabilizadora',   categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 200  },
  { nome: 'Troca de cubo de roda',           categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 280  },
  { nome: 'Troca de rolamento',              categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 220  },
  { nome: 'Reparo na direção hidráulica',    categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 400  },
  { nome: 'Troca de bomba de direção',       categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 500  },
  { nome: 'Troca de caixa de direção',       categoria: 'SUSPENSAO_DIRECAO', precoSugerido: 800  },

  // ── MOTOR ────────────────────────────────────────────────────────────────────
  { nome: 'Retífica de motor completa',      categoria: 'MOTOR',             precoSugerido: 3500 },
  { nome: 'Retífica de cabeçote',            categoria: 'MOTOR',             precoSugerido: 1200 },
  { nome: 'Troca de junta do cabeçote',      categoria: 'MOTOR',             precoSugerido: 800  },
  { nome: 'Troca de bronzina',               categoria: 'MOTOR',             precoSugerido: 600  },
  { nome: 'Troca de tuchos',                 categoria: 'MOTOR',             precoSugerido: 400  },
  { nome: 'Troca de corrente do motor',      categoria: 'MOTOR',             precoSugerido: 600  },
  { nome: 'Regulagem de válvulas',           categoria: 'MOTOR',             precoSugerido: 200  },
  { nome: 'Limpeza de bicos injetores',      categoria: 'MOTOR',             precoSugerido: 250  },
  { nome: 'Troca de bomba de óleo',          categoria: 'MOTOR',             precoSugerido: 350  },
  { nome: "Troca de bomba d'água",           categoria: 'MOTOR',             precoSugerido: 280  },
  { nome: 'Troca de termostato',             categoria: 'MOTOR',             precoSugerido: 150  },
  { nome: 'Reparo no sistema de arrefecimento', categoria: 'MOTOR',          precoSugerido: 300  },

  // ── ELETRICA ─────────────────────────────────────────────────────────────────
  { nome: 'Troca de bateria',                categoria: 'ELETRICA',          precoSugerido: 400  },
  { nome: 'Reparo no alternador',            categoria: 'ELETRICA',          precoSugerido: 450  },
  { nome: 'Reparo no motor de partida',      categoria: 'ELETRICA',          precoSugerido: 350  },
  { nome: 'Diagnóstico eletrônico',          categoria: 'ELETRICA',          precoSugerido: 150  },
  { nome: 'Reparo em sensor',                categoria: 'ELETRICA',          precoSugerido: 200  },
  { nome: 'Instalação de som',               categoria: 'ELETRICA',          precoSugerido: 200  },
  { nome: 'Reparo em ar condicionado',       categoria: 'ELETRICA',          precoSugerido: 300  },
  { nome: 'Recarga de ar condicionado',      categoria: 'ELETRICA',          precoSugerido: 120  },
  { nome: 'Troca de compressor AC',          categoria: 'ELETRICA',          precoSugerido: 1200 },

  // ── CAMBIO_TRANSMISSAO ───────────────────────────────────────────────────────
  { nome: 'Reparo em câmbio manual',         categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 800  },
  { nome: 'Reparo em câmbio automático',     categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 1500 },
  { nome: 'Troca de embreagem completa',     categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 600  },
  { nome: 'Troca de disco de embreagem',     categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 350  },
  { nome: 'Troca de cubo de embreagem',      categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 280  },
  { nome: 'Troca de semi-eixo',              categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 400  },
  { nome: 'Troca de junta homocinética',     categoria: 'CAMBIO_TRANSMISSAO', precoSugerido: 250  },

  // ── FUNILARIA_PINTURA ────────────────────────────────────────────────────────
  { nome: 'Reparo de amassado',              categoria: 'FUNILARIA_PINTURA', precoSugerido: 300  },
  { nome: 'Pintura parcial',                 categoria: 'FUNILARIA_PINTURA', precoSugerido: 500  },
  { nome: 'Pintura completa',                categoria: 'FUNILARIA_PINTURA', precoSugerido: 2500 },
  { nome: 'Polimento',                       categoria: 'FUNILARIA_PINTURA', precoSugerido: 200  },
  { nome: 'Vitrificação',                    categoria: 'FUNILARIA_PINTURA', precoSugerido: 350  },
  { nome: 'Troca de parabrisa',              categoria: 'FUNILARIA_PINTURA', precoSugerido: 450  },
  { nome: 'Reparo de parabrisa',             categoria: 'FUNILARIA_PINTURA', precoSugerido: 150  },
]

async function main() {
  console.log(`Semeando ${servicos.length} tipos de serviço...`)
  const result = await prisma.tipoServico.createMany({ data: servicos, skipDuplicates: true })
  console.log(`✓ ${result.count} serviços inseridos.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
