"use client";

import { useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Note } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { createNote, updateNote } from "@/lib/actions/notes";
import { noteFormSchema, type NoteFormValues } from "@/lib/validations/note";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note?: Note | null;
};

export function NoteDialog({ open, onOpenChange, note }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(note);

  const form = useForm<NoteFormValues>({
    resolver: zodResolver(noteFormSchema),
    defaultValues: {
      title: "",
      content: "",
      isPublic: false,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: note?.title ?? "",
        content: note?.content ?? "",
        isPublic: note?.isPublic ?? false,
      });
    }
  }, [open, note, form]);

  function onSubmit(values: NoteFormValues) {
    startTransition(async () => {
      if (isEdit && note) {
        await updateNote(note.id, values);
      } else {
        await createNote(values);
      }
      onOpenChange(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Редактировать заметку" : "Новая заметка"}</DialogTitle>
          <DialogDescription>
            Заголовок и текст. Публичные заметки видны в разделе «Публичные».
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Заголовок</Label>
            <Input id="title" {...form.register("title")} />
            {form.formState.errors.title && (
              <p className="text-xs text-red-600">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">Текст</Label>
            <Textarea id="content" {...form.register("content")} />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Публичная заметка</p>
              <p className="text-xs text-muted-foreground">Доступна другим пользователям</p>
            </div>
            <Switch
              checked={form.watch("isPublic")}
              onCheckedChange={(checked) => form.setValue("isPublic", checked)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Сохранение…" : "Сохранить"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
