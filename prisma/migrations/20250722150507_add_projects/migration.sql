/*
  Warnings:

  - You are about to drop the `quote_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quote_template_items` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quote_templates` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quotes` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "quote_items" DROP CONSTRAINT "quote_items_quote_id_fkey";

-- DropForeignKey
ALTER TABLE "quote_template_items" DROP CONSTRAINT "quote_template_items_template_id_fkey";

-- DropForeignKey
ALTER TABLE "quotes" DROP CONSTRAINT "quotes_client_id_fkey";

-- DropTable
DROP TABLE "quote_items";

-- DropTable
DROP TABLE "quote_template_items";

-- DropTable
DROP TABLE "quote_templates";

-- DropTable
DROP TABLE "quotes";

-- DropEnum
DROP TYPE "QuoteStatus";

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "technologies" TEXT[],
    "category" TEXT NOT NULL DEFAULT 'web',
    "isPublished" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);
