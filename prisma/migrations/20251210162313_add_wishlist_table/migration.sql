-- CreateTable
CREATE TABLE "public"."wish_lists" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "film_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "wish_lists_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."wish_lists" ADD CONSTRAINT "wish_lists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."wish_lists" ADD CONSTRAINT "wish_lists_film_id_fkey" FOREIGN KEY ("film_id") REFERENCES "public"."films"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
