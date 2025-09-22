-- DropForeignKey
ALTER TABLE "public"."episodes" DROP CONSTRAINT "episodes_film_id_fkey";
ALTER TABLE "public"."film_category" DROP CONSTRAINT "film_category_category_id_fkey";
ALTER TABLE "public"."film_category" DROP CONSTRAINT "film_category_film_id_fkey";
ALTER TABLE "public"."film_histories" DROP CONSTRAINT "film_histories_episode_id_fkey";
ALTER TABLE "public"."film_histories" DROP CONSTRAINT "film_histories_user_id_fkey";
ALTER TABLE "public"."films" DROP CONSTRAINT "films_country_id_fkey";

-- AlterTable: categories
ALTER TABLE "public"."categories"
  DROP CONSTRAINT "categories_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('categories_id_seq'::regclass),
  ADD CONSTRAINT "categories_pkey" PRIMARY KEY ("id");

-- AlterTable: countries
ALTER TABLE "public"."countries"
  DROP CONSTRAINT "countries_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('countries_id_seq'::regclass),
  ADD CONSTRAINT "countries_pkey" PRIMARY KEY ("id");

-- AlterTable: episodes
ALTER TABLE "public"."episodes"
  DROP CONSTRAINT "episodes_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('episodes_id_seq'::regclass),
  ALTER COLUMN "film_id" SET DATA TYPE INTEGER USING film_id::integer,
  ADD CONSTRAINT "episodes_pkey" PRIMARY KEY ("id");

-- AlterTable: film_category
ALTER TABLE "public"."film_category"
  DROP CONSTRAINT "film_category_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('film_category_id_seq'::regclass),
  ALTER COLUMN "film_id" SET DATA TYPE INTEGER USING film_id::integer,
  ALTER COLUMN "category_id" SET DATA TYPE INTEGER USING category_id::integer,
  ADD CONSTRAINT "film_category_pkey" PRIMARY KEY ("id");

-- AlterTable: film_histories
ALTER TABLE "public"."film_histories"
  DROP CONSTRAINT "film_histories_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('film_histories_id_seq'::regclass),
  ALTER COLUMN "user_id" SET DATA TYPE INTEGER USING user_id::integer,
  ALTER COLUMN "episode_id" SET DATA TYPE INTEGER USING episode_id::integer,
  ADD CONSTRAINT "film_histories_pkey" PRIMARY KEY ("id");

-- AlterTable: films
ALTER TABLE "public"."films"
  DROP CONSTRAINT "films_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('films_id_seq'::regclass),
  ALTER COLUMN "country_id" SET DATA TYPE INTEGER USING country_id::integer,
  ADD CONSTRAINT "films_pkey" PRIMARY KEY ("id");

-- AlterTable: users
ALTER TABLE "public"."users"
  DROP CONSTRAINT "users_pkey",
  ALTER COLUMN "id" DROP DEFAULT,
  ALTER COLUMN "id" SET DATA TYPE INTEGER USING id::integer,
  ALTER COLUMN "id" SET DEFAULT nextval('users_id_seq'::regclass),
  ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "public"."films"
  ADD CONSTRAINT "films_country_id_fkey" FOREIGN KEY ("country_id")
  REFERENCES "public"."countries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."episodes"
  ADD CONSTRAINT "episodes_film_id_fkey" FOREIGN KEY ("film_id")
  REFERENCES "public"."films"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."film_category"
  ADD CONSTRAINT "film_category_category_id_fkey" FOREIGN KEY ("category_id")
  REFERENCES "public"."categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."film_category"
  ADD CONSTRAINT "film_category_film_id_fkey" FOREIGN KEY ("film_id")
  REFERENCES "public"."films"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."film_histories"
  ADD CONSTRAINT "film_histories_user_id_fkey" FOREIGN KEY ("user_id")
  REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "public"."film_histories"
  ADD CONSTRAINT "film_histories_episode_id_fkey" FOREIGN KEY ("episode_id")
  REFERENCES "public"."episodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
