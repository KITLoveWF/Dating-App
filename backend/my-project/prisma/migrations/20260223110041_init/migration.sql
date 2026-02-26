-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "bio" TEXT,
    "email" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" SERIAL NOT NULL,
    "user1Id" INTEGER NOT NULL,
    "user2Id" INTEGER NOT NULL,
    "isMutal" BOOLEAN NOT NULL DEFAULT false,
    "fromDateUser1" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toDateUser1" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fromDateUser2" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "toDateUser2" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_email_key" ON "Profile"("email");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user1Id_fkey" FOREIGN KEY ("user1Id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
