/*
  Warnings:

  - You are about to drop the `CountryFilm` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CountryFilm" DROP CONSTRAINT "CountryFilm_country_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."CountryFilm" DROP CONSTRAINT "CountryFilm_film_id_fkey";

-- DropTable
DROP TABLE "public"."CountryFilm";

-- CreateTable
CREATE TABLE "public"."country_film" (
    "id" SERIAL NOT NULL,
    "film_id" INTEGER NOT NULL,
    "country_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "country_film_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."country_film" ADD CONSTRAINT "country_film_film_id_fkey" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."country_film" ADD CONSTRAINT "country_film_country_id_fkey" FOREIGN KEY ("country_id") REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
