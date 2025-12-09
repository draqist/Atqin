"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"; // Ensure this path is correct based on where you saved the hook
import { Input } from "@/components/ui/input";
import { useLogin } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

// 1. Validation Schema
const formSchema = z.object({
  email: z.string().min(1, "Email or Username is required."), // Relaxed validation to allow username
  password: z.string().min(1, "Password is required."),
});

// ... imports
import { useTranslations } from "next-intl";

// ... schema ...

export default function LoginPage() {
  const t = useTranslations("Auth");
  // 2. Use the Mutation Hook
  const { mutate: login, isPending } = useLogin();

  // 3. Form Setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 4. Handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    login(values);
  }

  return (
    <div className="w-full max-w-sm mx-auto space-y-6">
      {/* Header Text */}
      <div className="flex flex-col space-y-2 text-center ltr:lg:text-left rtl:lg:text-right">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          {t("login.title")}
        </h1>
        <p className="text-sm text-slate-500">{t("login.subtitle")}</p>
      </div>

      {/* The Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Email Field */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("login.emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("login.emailPlaceholder")}
                    {...field}
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 rtl:text-right"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password Field */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>{t("common.password")}</FormLabel>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    {...field}
                    className="h-11 bg-slate-50 border-slate-200 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 rtl:text-right"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-lg shadow-slate-200/50 transition-all hover:-translate-y-0.5"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("common.signIn")
            )}
          </Button>
        </form>
      </Form>

      {/* Footer Links */}
      <div className="text-center text-sm text-slate-500 relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-400">{t("common.or")}</span>
        </div>
      </div>

      <div className="text-center text-sm text-slate-600">
        {t("login.noAccount")}{" "}
        <Link
          href="/register"
          className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
        >
          {t("login.signUpFree")}
        </Link>
      </div>
    </div>
  );
}
