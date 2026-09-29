-- AlterTable
ALTER TABLE "PageView" ADD COLUMN     "day" DATE NOT NULL,
ADD COLUMN     "visitorHash" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "PageView_path_visitorHash_day_key" ON "PageView"("path", "visitorHash", "day");

