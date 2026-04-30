-- CreateEnum
CREATE TYPE "TipoPecaOS" AS ENUM ('CUSTO_SERVICO', 'VENDA_DIRETA');

-- AlterTable
ALTER TABLE "ItemOrdemServico" ADD COLUMN     "custoPecas" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "valorMaoDeObra" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PecaOrdemServico" ADD COLUMN     "itemOrdemServicoId" TEXT,
ADD COLUMN     "precoCompra" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "tipo" "TipoPecaOS" NOT NULL DEFAULT 'VENDA_DIRETA';

-- AddForeignKey
ALTER TABLE "PecaOrdemServico" ADD CONSTRAINT "PecaOrdemServico_itemOrdemServicoId_fkey" FOREIGN KEY ("itemOrdemServicoId") REFERENCES "ItemOrdemServico"("id") ON DELETE SET NULL ON UPDATE CASCADE;
