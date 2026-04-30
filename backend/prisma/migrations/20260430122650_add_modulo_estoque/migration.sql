-- CreateEnum
CREATE TYPE "CategoriaProduto" AS ENUM ('PECA', 'LUBRIFICANTE', 'FILTRO', 'FLUIDO', 'PNEU', 'ELETRICO', 'OUTRO');

-- CreateEnum
CREATE TYPE "UnidadeProduto" AS ENUM ('UN', 'L', 'KG', 'ML');

-- CreateEnum
CREATE TYPE "TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'AJUSTE');

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "categoria" "CategoriaProduto" NOT NULL,
    "marca" TEXT,
    "unidade" "UnidadeProduto" NOT NULL,
    "precoCompra" DECIMAL(10,2) NOT NULL,
    "precoVenda" DECIMAL(10,2) NOT NULL,
    "quantidadeAtual" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "quantidadeMinima" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "fornecedor" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimentacaoEstoque" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "tipo" "TipoMovimentacao" NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "quantidadeAnterior" DECIMAL(10,3) NOT NULL,
    "quantidadeAtual" DECIMAL(10,3) NOT NULL,
    "motivo" TEXT,
    "ordemServicoId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimentacaoEstoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PecaOrdemServico" (
    "id" TEXT NOT NULL,
    "ordemServicoId" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "quantidade" DECIMAL(10,3) NOT NULL,
    "precoUnitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "PecaOrdemServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Produto_codigo_key" ON "Produto"("codigo");

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimentacaoEstoque" ADD CONSTRAINT "MovimentacaoEstoque_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PecaOrdemServico" ADD CONSTRAINT "PecaOrdemServico_ordemServicoId_fkey" FOREIGN KEY ("ordemServicoId") REFERENCES "OrdemServico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PecaOrdemServico" ADD CONSTRAINT "PecaOrdemServico_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
