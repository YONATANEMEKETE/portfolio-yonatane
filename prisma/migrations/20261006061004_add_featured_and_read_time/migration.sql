-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "readTime" INTEGER NOT NULL DEFAULT 6;

-- CreateIndex
CREATE INDEX "Article_featured_status_publishedAt_idx" ON "Article"("featured", "status", "publishedAt");

-- Migrate existing blogs with featured = true and readTime = 6
UPDATE "Article" SET "featured" = true, "readTime" = 6;
