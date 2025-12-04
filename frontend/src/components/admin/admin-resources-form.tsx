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
import api from "@/lib/axios";
import {
  useCreateResource,
  useUpdateResource,
} from "@/lib/hooks/mutations/resources";
import { useBooks } from "@/lib/hooks/queries/books";
import { toast } from "@/lib/toast";
import { Resource } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { GripVertical, ListVideo, Loader2, Plus, Trash2 } from "lucide-react"; // New Icons
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Resolver, useFieldArray, useForm } from "react-hook-form"; // Import useFieldArray
import * as z from "zod";
import { FileUpload } from "./admin-file-upload";
import { YouTubePicker } from "./youtube-picker";

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

/**
 * Form component for creating or editing a resource.
 * Supports various resource types including YouTube videos, playlists, and PDFs.
 * Handles playlist imports and dynamic child resource management.
 */
export function ResourceForm({ resource }: { resource?: Resource }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedBookId = searchParams.get("bookId");

  const { data: books, isLoading: loadingBooks } = useBooks();
  const createMutation = useCreateResource();
  const updateMutation = useUpdateResource(resource?.id || "");
  const [importLoading, setImportLoading] = useState(false);
  const [playlistInput, setPlaylistInput] = useState("");

  const handleManualImport = async () => {
    if (!playlistInput) return;

    // Extract ID from URL if user pasted full link
    let playlistId = playlistInput;
    const urlMatch = playlistInput.match(/[?&]list=([^&]+)/);
    if (urlMatch) {
      playlistId = urlMatch[1];
    }

    setImportLoading(true);
    try {
      const { data: videos } = await api.post("/tools/youtube-playlist", {
        playlist_id: playlistId,
      });
      form.setValue("children", videos);
      toast.success(`Imported ${videos.length} videos!`);
      setPlaylistInput(""); // Clear input
    } catch (e) {
      toast.error("Failed to fetch playlist. Check ID/Permissions.");
    } finally {
      setImportLoading(false);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as Resolver<z.infer<typeof formSchema>>,
    defaultValues: {
      title: resource?.title || "",
      url: resource?.url || "",
      type: (resource?.type as any) || "youtube_video",
      book_id: resource?.book_id || preselectedBookId || "",
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
  const handlePlaylistSelect = async (playlistId: string) => {
    // 1. Call your existing fetchYouTubePlaylistHandler endpoint
    // (We reuse the logic from the "Manual ID" import button)
    try {
      const { data: videos } = await api.post("/tools/youtube-playlist", {
        playlist_id: playlistId,
      });

      // 2. Populate the form
      form.setValue("children", videos);
      form.setValue("type", "playlist"); // Switch type automatically
      toast.success(`Imported ${videos.length} videos!`);
    } catch (e) {
      toast.error("Failed to import playlist");
    }
  };
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
                        <Input
                          {...field}
                          className="text-base"
                          placeholder="Explanation of Matn Ash-Shaatibiyah"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* URL Field (Hidden for Playlist containers usually, or optional) */}
                {resourceType !== "playlist" && form.watch("type") === "pdf" ? (
                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Upload PDF</FormLabel>
                        <FormControl>
                          <FileUpload
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            accept="application/pdf"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : (
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
                  <>
                    <div className="mt-8 border-t border-slate-100 pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                          <ListVideo className="w-4 h-4 text-indigo-600" />{" "}
                          Playlist Videos
                        </h3>
                        <div className="flex gap-2">
                          <YouTubePicker onSelect={handlePlaylistSelect} />{" "}
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => append({ title: "", url: "" })}
                            className="gap-2 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                          >
                            <Plus className="w-3 h-3" /> Add Manually
                          </Button>
                        </div>
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
                    <div className="flex gap-2 items-center bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <Input
                        placeholder="Paste YouTube Playlist URL or ID"
                        className="bg-white h-9 text-sm"
                        value={playlistInput}
                        onChange={(e) => setPlaylistInput(e.target.value)}
                      />
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleManualImport}
                        disabled={importLoading || !playlistInput}
                      >
                        {importLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Import"
                        )}
                      </Button>
                    </div>
                  </>
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
                        defaultValue={preselectedBookId ?? field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select book" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {books?.pages
                            .flatMap((p) => p.books)
                            .map((b) => (
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
