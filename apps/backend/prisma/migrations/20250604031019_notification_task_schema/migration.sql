/*
  Warnings:

  - You are about to drop the column `frequency` on the `tasks` table. All the data in the column will be lost.
  - You are about to drop the column `query` on the `tasks` table. All the data in the column will be lost.
  - Added the required column `description` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `repeatType` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledTime` to the `tasks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "frequency",
DROP COLUMN "query",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "notificationId" TEXT,
ADD COLUMN     "repeatType" TEXT NOT NULL,
ADD COLUMN     "scheduledTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;
