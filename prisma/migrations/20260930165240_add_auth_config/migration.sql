-- CreateTable
CREATE TABLE "AuthConfig" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "passcodeHash" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthConfig_pkey" PRIMARY KEY ("id")
);
