import type { Note } from "@prisma/client";

export type NoteSort = "popular" | "recent";

export type NoteWithAuthor = Note & {
  author?: { id: string; name: string | null; email: string };
};

export type PublicNoteListItem = NoteWithAuthor & {
  likesCount: number;
  likedByMe: boolean;
};
