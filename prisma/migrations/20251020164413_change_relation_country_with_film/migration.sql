/*
  Warnings:

  - You are about to drop the column `country_id` on the `films` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."films" DROP CONSTRAINT "films_country_id_fkey";

-- AlterTable
ALTER TABLE "films" DROP COLUMN "country_id";

-- CreateTable
CREATE TABLE "CountryFilm" (
    "id" SERIAL NOT NULL,
    "film_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "CountryFilm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CountryToFilm" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_CountryToFilm_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_CountryToFilm_B_index" ON "_CountryToFilm"("B");

-- AddForeignKey
ALTER TABLE "CountryFilm" ADD CONSTRAINT "CountryFilm_film_id_fkey" FOREIGN KEY ("film_id") REFERENCES "films"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CountryFilm" ADD CONSTRAINT "CountryFilm_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToFilm" ADD CONSTRAINT "_CountryToFilm_A_fkey" FOREIGN KEY ("A") REFERENCES "countries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CountryToFilm" ADD CONSTRAINT "_CountryToFilm_B_fkey" FOREIGN KEY ("B") REFERENCES "films"("id") ON DELETE CASCADE ON UPDATE CASCADE;
