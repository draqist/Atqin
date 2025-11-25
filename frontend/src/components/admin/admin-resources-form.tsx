"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  useCreateResource,
  useUpdateResource,
} from "@/lib/hooks/mutations/resources";
import { useBooks } from "@/lib/hooks/queries/books";
import { Resource } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, ListVideo, Loader2, Plus, Trash2 } from "lucide-react"; // New Icons
import { useRouter } from "next/navigation";
import { Resolver, useFieldArray, useForm } from "react-hook-form"; // Import useFieldArray
import * as z from "zod";

// UPDATED SCHEMA: Supports children
const formSchema = z.object({
  title: z.string().min(2, "Title required"),
  // URL is optional if it's a playlist container
  url: z.string().optional(),
  type: z.enum(["youtube_video", "pdf", "web_link", "playlist", "audio"]),
  book_id: z.string().min(1, "You must select a book"),
  is_official: z.boolean().default(false),

  // The Dynamic List
  children: z
    .array(
      z.object({
        title: z.string().min(1, "Video title required"),
        url: z.string().url("Valid YouTube URL required"),
      })
    )
    .optional(),
});

// ... schema

export function ResourceForm({ resource }: { resource?: Resource }) {
  const router = useRouter();
  const { data: books, isLoading: loadingBooks } = useBooks();
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource(resource?.id || "");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      title: resource?.title || "",
      url: resource?.url || "",
      type: (resource?.type as any) || "youtube_video",
      book_id: resource?.book_id || "",
      is_official: resource?.is_official ?? true,
      children:
        resource?.children?.map((c) => ({ title: c.title, url: c.url })) || [],
    },
  });

  // Hook for managing the dynamic list
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "children",
  });

  // Watch the type to conditionally render the playlist editor
  const resourceType = form.watch("type");

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (resource) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        {/* Header Actions (Same as before) */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          {/* ... */}
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Save Resource"
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold">
                  Resource Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Common Fields */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {resourceType === "playlist"
                          ? "Playlist Name"
                          : "Title"}
                      </FormLabel>
                      <FormControl>
                        <Input {...field} className="text-lg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL Field (Hidden for Playlist containers usually, or optional) */}
                {resourceType !== "playlist" && (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="https://..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* --- PLAYLIST EDITOR --- */}
                {resourceType === "playlist" && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <ListVideo className="w-4 h-4 text-indigo-600" />{" "}
                        Playlist Videos
                      </h3>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => append({ title: "", url: "" })}
                        className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                      >
                        <Plus className="w-3 h-3" /> Add Video
                      </Button>
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div
                          key={field.id}
                          className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group"
                        >
                          {/* Drag Handle Visual */}
                          <div className="mt-3 text-slate-400 cursor-move">
                            <GripVertical className="w-4 h-4" />
                          </div>

                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                            <FormField
                              control={form.control}
                              name={`children.${index}.title`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="Episode Title"
                                      className="bg-white h-9 text-sm"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`children.${index}.url`}
                              render={({ field }) => (
                                <FormItem className="space-y-1">
                                  <FormControl>
                                    <Input
                                      {...field}
                                      placeholder="YouTube URL"
                                      className="bg-white h-9 text-sm"
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => remove(index)}
                            className="text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}

                      {fields.length === 0 && (
                        <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                          No videos added to playlist yet.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN (Context) */}
          <div className="space-y-6">
            {/* ... Book Selector, Type Selector, Official Checkbox (Keep existing) ... */}
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-6 space-y-4">
                <FormField
                  control={form.control}
                  name="book_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Linked Book</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select book" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {books?.map((b) => (
                            <SelectItem key={b.id} value={b.id}>
                              {b.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="youtube_video">
                            Single Video
                          </SelectItem>
                          <SelectItem value="playlist">
                            Playlist (Series)
                          </SelectItem>
                          <SelectItem value="pdf">PDF Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="is_official"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Official</FormLabel>
                        <FormDescription>Verified content.</FormDescription>
                      </div>
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
