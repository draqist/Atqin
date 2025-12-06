"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
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
import { useCreateBook } from "@/lib/hooks/mutations/books";
import { toast } from "@/lib/toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Image as ImageIcon, Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  original_author: z.string().min(2, "Author is required"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  cover_image_url: z.url("Must be a valid URL").optional().or(z.literal("")),
});

/**
 * Form component for creating a new book.
 * Handles book creation with title, author, description, category, and cover image.
 */
export function BookForm() {
  const router = useRouter();
  const [previewImage, setPreviewImage] = useState("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      original_author: "",
      description: "",
      category: "tajweed",
      cover_image_url: "",
    },
  });

  const { mutateAsync: createBook, isPending } = useCreateBook();

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const payload = {
        title: values.title,
        original_author: values.original_author,
        description: values.description,
        cover_image_url: values.cover_image_url,
        metadata: { category: values.category },
        is_public: true,
      };
      await createBook(payload);

      router.push("/admin/books");
      router.refresh();
    } catch (error) {
      toast.error("Failed to create book");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
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
                New Book Entry
              </h1>
              <p className="text-sm text-slate-500">
                Add a new text to the library catalog.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Create Book
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN: CORE INFO (2/3) */}
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
                        <Input
                          placeholder="e.g. Matn Ash-Shatibiyyah"
                          {...field}
                          className="text-base h-10"
                        />
                      </FormControl>
                      <FormDescription>
                        The canonical title of the text.
                      </FormDescription>
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
                          placeholder="Write a brief summary regarding the significance of this text..."
                          className="min-h-[200px] resize-y focus-visible:ring-1 leading-relaxed"
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

          {/* RIGHT COLUMN: METADATA & MEDIA (1/3) */}
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
                        Author / Scholar
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Imam Ash-Shatibi" {...field} />
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
                      <span className="text-xs">No image URL provided</span>
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
                          placeholder="https://..."
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
