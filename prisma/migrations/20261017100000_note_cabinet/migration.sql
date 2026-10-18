-- DropTag M2M (больше не используется в кабинете)
DROP TABLE IF EXISTS "_NoteToTag";
DROP TABLE IF EXISTS "Tag";

-- AlterTable Note
ALTER TABLE "Note" ADD COLUMN "content" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Note" ADD COLUMN "isPublic" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Note" ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Note" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Note_authorId_idx" ON "Note"("authorId");
CREATE INDEX "Note_isPublic_idx" ON "Note"("isPublic");
CREATE INDEX "Note_authorId_isFavorite_idx" ON "Note"("authorId", "isFavorite");
