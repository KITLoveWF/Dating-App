/*
  Warnings:

  - You are about to drop the column `fromDateUser1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `fromDateUser2` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `toDateUser1` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `toDateUser2` on the `Match` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Match" DROP COLUMN "fromDateUser1",
DROP COLUMN "fromDateUser2",
DROP COLUMN "toDateUser1",
DROP COLUMN "toDateUser2";

-- CreateTable
CREATE TABLE "Availability" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "matchId" INTEGER NOT NULL,
    "fromDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Availability_matchId_key" ON "Availability"("matchId");

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
