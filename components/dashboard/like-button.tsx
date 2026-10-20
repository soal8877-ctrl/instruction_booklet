"use client";

import { useEffect, useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Props = {
  noteId: string;
  initialLiked: boolean;
  initialCount: number;
};

export function LikeButton({ noteId, initialLiked, initialCount }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setLiked(initialLiked);
    setCount(initialCount);
  }, [initialLiked, initialCount, noteId]);

  function toggleLike() {
    setError(null);
    const prev = { liked, count };
    setLiked(!liked);
    setCount((c) => (prev.liked ? Math.max(0, c - 1) : c + 1));

    startTransition(async () => {
      try {
        const res = await fetch(`/api/notes/${noteId}/like`, { method: "POST" });
        const data = (await res.json()) as {
          liked?: boolean;
          likesCount?: number;
          error?: string;
        };

        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }

        if (!res.ok) {
          setLiked(prev.liked);
          setCount(prev.count);
          setError(data.error ?? "Не удалось обновить лайк");
          return;
        }

        setLiked(Boolean(data.liked));
        setCount(data.likesCount ?? prev.count);
      } catch {
        setLiked(prev.liked);
        setCount(prev.count);
        setError("Попробуйте позже");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "h-8 gap-1.5 px-2",
          liked && "text-sky-700 bg-sky-50 hover:bg-sky-100",
        )}
        disabled={pending}
        onClick={toggleLike}
        title={liked ? "Убрать лайк" : "Нравится"}
      >
        <ThumbsUp className={cn("h-4 w-4", liked && "fill-current")} />
        <span className="text-sm tabular-nums">{count}</span>
      </Button>
      {error && <span className="max-w-[120px] text-center text-[10px] text-red-600">{error}</span>}
    </div>
  );
}
