-- CreateEnum
CREATE TYPE "ProjectStance" AS ENUM ('FAVOR', 'AGAINST');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'USUARIO');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('GRATIS', 'PRO');

-- CreateEnum
CREATE TYPE "SocialNetwork" AS ENUM ('INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE');

-- CreateEnum
CREATE TYPE "PostType" AS ENUM ('VIDEO', 'IMAGEN', 'TEXTO', 'OTRO', 'PAGINA', 'PUBLICACION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('LISTA', 'GENERANDO', 'GENERADA', 'CANCELADA', 'REINTENTAR', 'COMPLETADA');

-- CreateEnum
CREATE TYPE "CommentStatus" AS ENUM ('PENDIENTE', 'PUBLICADO', 'CANCELADO', 'SINPUBLICAR');

-- CreateEnum
CREATE TYPE "IntegrationSource" AS ENUM ('N8N');

-- CreateEnum
CREATE TYPE "IntegrationEventType" AS ENUM ('WEBHOOK_RECEIVED', 'WEBHOOK_REJECTED', 'COMMENTS_PERSISTED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('COMENTARIO', 'MEGUSTA', 'COMPARTIR', 'SEGUIMIENTO', 'REPORTE');

-- CreateEnum
CREATE TYPE "DeviceStatus" AS ENUM ('OCUPADO', 'LIBRE', 'BLOQUEADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "usernameLower" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USUARIO',
    "plan" "Plan" NOT NULL DEFAULT 'GRATIS',
    "commentLimit" INTEGER NOT NULL DEFAULT 500,
    "commentsUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameLower" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "targetId" TEXT,
    "stance" "ProjectStance" NOT NULL DEFAULT 'FAVOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Target" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'Sin Nombre',
    "userId" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Target_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BotOrder" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "url" TEXT NOT NULL,
    "orderName" TEXT NOT NULL DEFAULT 'Orden',
    "socialNetwork" "SocialNetwork" NOT NULL,
    "postType" "PostType" NOT NULL,
    "intent" TEXT,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'LISTA',
    "sentAt" TIMESTAMP(3),
    "generatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BotOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenComment" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "projectId" TEXT,
    "text" TEXT NOT NULL,
    "deviceId" TEXT,
    "publishAt" TEXT,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GenComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenLike" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenLike_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenShare" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenShare_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenFollow" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenFollow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenReport" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "CommentStatus" NOT NULL DEFAULT 'PENDIENTE',
    "deviceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispositivos" (
    "id" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "personName" TEXT,
    "urlTiktok" TEXT,
    "urlFacebook" TEXT,
    "urlInstagram" TEXT,
    "status" "DeviceStatus" NOT NULL DEFAULT 'LIBRE',
    "blockedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "dispositivos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL,
    "source" "IntegrationSource" NOT NULL,
    "eventType" "IntegrationEventType" NOT NULL,
    "userId" TEXT,
    "projectId" TEXT,
    "orderId" TEXT,
    "payload" JSONB,
    "error" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegrationLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_usernameLower_key" ON "User"("usernameLower");

-- CreateIndex
CREATE INDEX "Project_userId_createdAt_idx" ON "Project"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Project_userId_nameLower_key" ON "Project"("userId", "nameLower");

-- CreateIndex
CREATE INDEX "BotOrder_projectId_createdAt_idx" ON "BotOrder"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "BotOrder_userId_createdAt_idx" ON "BotOrder"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BotOrder_status_createdAt_idx" ON "BotOrder"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GenComment_orderId_createdAt_idx" ON "GenComment"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "GenComment_userId_createdAt_idx" ON "GenComment"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "GenComment_deviceId_createdAt_idx" ON "GenComment"("deviceId", "createdAt");

-- CreateIndex
CREATE INDEX "GenLike_orderId_createdAt_idx" ON "GenLike"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "GenShare_orderId_createdAt_idx" ON "GenShare"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "GenFollow_orderId_createdAt_idx" ON "GenFollow"("orderId", "createdAt");

-- CreateIndex
CREATE INDEX "GenReport_orderId_createdAt_idx" ON "GenReport"("orderId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "dispositivos_deviceName_key" ON "dispositivos"("deviceName");

-- CreateIndex
CREATE INDEX "IntegrationLog_source_createdAt_idx" ON "IntegrationLog"("source", "createdAt");

-- CreateIndex
CREATE INDEX "IntegrationLog_eventType_createdAt_idx" ON "IntegrationLog"("eventType", "createdAt");

-- CreateIndex
CREATE INDEX "IntegrationLog_orderId_createdAt_idx" ON "IntegrationLog"("orderId", "createdAt");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "Target"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotOrder" ADD CONSTRAINT "BotOrder_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BotOrder" ADD CONSTRAINT "BotOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenComment" ADD CONSTRAINT "GenComment_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenComment" ADD CONSTRAINT "GenComment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BotOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenComment" ADD CONSTRAINT "GenComment_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenComment" ADD CONSTRAINT "GenComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenLike" ADD CONSTRAINT "GenLike_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenLike" ADD CONSTRAINT "GenLike_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BotOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenLike" ADD CONSTRAINT "GenLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenShare" ADD CONSTRAINT "GenShare_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenShare" ADD CONSTRAINT "GenShare_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BotOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenShare" ADD CONSTRAINT "GenShare_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenFollow" ADD CONSTRAINT "GenFollow_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenFollow" ADD CONSTRAINT "GenFollow_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BotOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenFollow" ADD CONSTRAINT "GenFollow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenReport" ADD CONSTRAINT "GenReport_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "dispositivos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenReport" ADD CONSTRAINT "GenReport_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BotOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenReport" ADD CONSTRAINT "GenReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "BotOrder"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegrationLog" ADD CONSTRAINT "IntegrationLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
