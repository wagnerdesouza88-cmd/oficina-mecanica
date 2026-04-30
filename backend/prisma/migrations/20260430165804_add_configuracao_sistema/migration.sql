-- CreateTable
CREATE TABLE "ConfiguracaoSistema" (
    "id" TEXT NOT NULL,
    "nomeOficina" TEXT NOT NULL DEFAULT 'Oficina Mecânica',
    "slogan" TEXT NOT NULL DEFAULT 'Mecânica Pro',
    "corPrimaria" TEXT NOT NULL DEFAULT '#1e3a5f',
    "corSecundaria" TEXT NOT NULL DEFAULT '#f97316',
    "logoBase64" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfiguracaoSistema_pkey" PRIMARY KEY ("id")
);
