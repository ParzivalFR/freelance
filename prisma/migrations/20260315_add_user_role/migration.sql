-- Add role column to users table
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'CLIENT';

-- Set the admin email to ADMIN role
UPDATE "User" SET "role" = 'ADMIN' WHERE "email" = 'parzivaleu@gmail.com';
