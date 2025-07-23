-- CreateTable
CREATE TABLE "testimonial_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "client_email" TEXT NOT NULL,
    "client_name" TEXT NOT NULL,
    "project_name" TEXT,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "testimonial_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "used_at" TIMESTAMP(3),

    CONSTRAINT "testimonial_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "testimonial_tokens_token_key" ON "testimonial_tokens"("token");
