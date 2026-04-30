-- AlterTable
ALTER TABLE "OrdemServico" ALTER COLUMN "descricao" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TipoServico" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precoSugerido" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TipoServico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemOrdemServico" (
    "id" TEXT NOT NULL,
    "ordemId" TEXT NOT NULL,
    "tipoServicoId" TEXT,
    "nome" TEXT NOT NULL,
    "preco" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ItemOrdemServico_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ItemOrdemServico" ADD CONSTRAINT "ItemOrdemServico_ordemId_fkey" FOREIGN KEY ("ordemId") REFERENCES "OrdemServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ItemOrdemServico" ADD CONSTRAINT "ItemOrdemServico_tipoServicoId_fkey" FOREIGN KEY ("tipoServicoId") REFERENCES "TipoServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
