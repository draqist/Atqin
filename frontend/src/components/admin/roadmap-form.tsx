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
import { Textarea } from "@/components/ui/textarea";
import { useCreateRoadmap } from "@/lib/hooks/mutations/roadmaps";
import { Roadmap } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Map, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Validation Schema
const formSchema = z.object({
  title: z.string().min(2, "Title is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers, and hyphens only"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  cover_image_url: z.string().optional(),
  is_public: z.boolean(),
});

interface RoadmapFormProps {
  roadmap?: Roadmap; // Optional for Edit mode
}

/**
 * Form component for creating or editing a roadmap.
 * Handles roadmap metadata including title, slug, description, and visibility.
 */
export function RoadmapForm({ roadmap }: RoadmapFormProps) {
  const router = useRouter();
  const { mutate: createRoadmap, isPending } = useCreateRoadmap();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: roadmap?.title || "",
      slug: roadmap?.slug || "",
      description: roadmap?.description || "",
      cover_image_url: roadmap?.cover_image_url || "",
      is_public: roadmap?.is_public || false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // Create only for now. Update logic can be added later similar to Books.
    createRoadmap({
      ...values,
      cover_image_url: values.cover_image_url || "", // Ensure string
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">New Roadmap</h1>
              <p className="text-sm text-slate-500">
                Create a new learning track.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" onClick={() => router.back()}>
              Discard
            </Button>
            <Button
              type="submit"
              className="bg-slate-900 text-white gap-2"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Create Track
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: MAIN INFO */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                <CardTitle className="text-base font-semibold">
                  Track Details
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
                          {...field}
                          placeholder="e.g. Hanbali Fiqh Mastery"
                          className="text-lg"
                          onChange={(e) => {
                            field.onChange(e);
                            if (!roadmap) {
                              const slug = e.target.value
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, "-")
                                .replace(/(^-|-$)/g, "");
                              form.setValue("slug", slug);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <div className="flex items-center">
                        <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-md px-3 py-2 text-sm text-slate-500">
                          iqraa.com/roadmaps/
                        </span>
                        <FormControl>
                          <Input
                            {...field}
                            className="rounded-l-none font-mono text-sm"
                            placeholder="hanbali-fiqh-mastery"
                          />
                        </FormControl>
                      </div>
                      <FormDescription>
                        Unique identifier for this track.
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
                          {...field}
                          placeholder="Describe the goal of this roadmap..."
                          className="min-h-[150px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* RIGHT: SETTINGS */}
          <div className="space-y-6">
            <Card className="border-slate-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm">Visibility</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 flex items-start gap-4">
                  <div className="p-2 bg-white rounded-md border border-slate-200">
                    <Map className="w-5 h-5 text-indigo-500" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-medium text-slate-900">
                      Structure First
                    </h4>
                    <p className="text-xs text-slate-500">
                      Create the container now. You will add books and levels in
                      the next step using the builder.
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="is_public"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Publicly Visible</FormLabel>
                        <FormDescription>
                          Make this track available to students immediately.
                        </FormDescription>
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
