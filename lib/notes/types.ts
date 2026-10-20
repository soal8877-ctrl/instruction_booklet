import type { Note } from "@prisma/client";

export type NoteSort = "popular" | "recent";

export type NoteWithAuthor = Note & {
  author?: { id: string; name: string | null; email: string };
};

export type NoteWithLikes = {
  likesCount: number;
  likedByMe: boolean;
};

export type PublicNoteListItem = NoteWithAuthor & NoteWithLikes;
