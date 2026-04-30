-- AlterTable
ALTER TABLE "OrdemServico" ADD COLUMN     "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "dataEntrega" TIMESTAMP(3),
ADD COLUMN     "previsaoEntrega" TIMESTAMP(3);
