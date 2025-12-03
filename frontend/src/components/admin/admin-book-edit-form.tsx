"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  Image as ImageIcon,
  Loader2,
  Save,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useDeleteBook, useUpdateBook } from "@/lib/hooks/mutations/books";
import { Book } from "@/lib/types";

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  original_author: z.string().min(2, "Author is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  cover_image_url: z.url("Must be a valid URL").optional().or(z.literal("")),
});

interface BookEditFormProps {
  book: Book;
}

/**
 * Form component for editing an existing book.
 * Handles updating book details, metadata, and deletion.
 */
export function BookEditForm({ book }: BookEditFormProps) {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState(book.cover_image_url || "");

  // Hooks
  const { mutate: saveChanges, isPending: isSaving } = useUpdateBook(book.id);
  const { mutate: removeBook, isPending: isDeleting } = useDeleteBook();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: book.title,
      original_author: book.original_author,
      description: book.description,
      // Safely access metadata category
      category: (book.metadata as any)?.category || "tajweed",
      cover_image_url: book.cover_image_url || "",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((vals) => saveChanges(vals))}
        className="space-y-8 pb-20"
      >
        {/* 1. HEADER ACTION BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="h-10 w-10 border-slate-200 text-slate-500"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Edit Book
              </h1>
              <p className="text-sm text-slate-500">
                Manage metadata and settings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Delete with Confirmation */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    the book
                    <span className="font-bold text-slate-900">
                      {" "}
                      "{book.title}"
                    </span>{" "}
                    and all associated resources.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => removeBook(book.id)}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? "Deleting..." : "Delete Book"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: MAIN CONTENT */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold text-slate-900">
                  Book Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} className="text-base h-10" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[200px] resize-y leading-relaxed"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: METADATA */}
          <div className="space-y-6">
            {/* Organization Card */}
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Organization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="original_author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-slate-500">
                        Author
                      </FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-slate-500">
                        Category
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="tajweed">
                            Tajweed & Qira'at
                          </SelectItem>
                          <SelectItem value="aqeedah">Aqeedah</SelectItem>
                          <SelectItem value="hadith">Hadith</SelectItem>
                          <SelectItem value="grammar">
                            Arabic Grammar
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Media Card */}
            <Card className="border-slate-200 shadow-sm overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">
                  Cover Media
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Live Preview Box */}
                <div className="aspect-video w-full bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden border border-dashed border-slate-300 relative group">
                  {previewImage ? (
                    <>
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium">
                        Preview
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <ImageIcon className="w-8 h-8 opacity-50" />
                      <span className="text-xs">No image URL</span>
                    </div>
                  )}
                </div>

                <FormField
                  control={form.control}
                  name="cover_image_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs uppercase tracking-wider text-slate-500">
                        Image URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            setPreviewImage(e.target.value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
