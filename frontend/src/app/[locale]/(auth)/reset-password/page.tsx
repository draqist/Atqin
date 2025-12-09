"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useResetPassword } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormErrorMessage } from "@/components/ui/form-errors";

const formSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ... imports
import { useTranslations } from "next-intl";

// ... schema ...

export default function ResetPasswordPage() {
  const t = useTranslations("Auth");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { mutate: resetPassword, isPending, error } = useResetPassword();
  const [show, setShow] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) return;
    resetPassword({ token, password: values.password });
  }

  const errorMessage = (error as any)?.response?.data?.error || error?.message;

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <h1 className="text-3xl font-bold text-slate-900">
          {t("resetPassword.invalidLinkTitle")}
        </h1>
        <p className="text-slate-500">
          {t("resetPassword.invalidLinkDescription")}
        </p>
        <Button asChild className="mt-4 bg-emerald-600 hover:bg-emerald-700">
          <Link href="/login">{t("common.backToLogin")}</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-slate-900">
          {t("resetPassword.title")}
        </h1>
        <p className="text-slate-500">{t("resetPassword.subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormErrorMessage message={errorMessage} />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("resetPassword.newPassword")}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2 border rounded-md rtl:flex-row-reverse">
                    <Input
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="h-11 border-transparent rounded-none shadow-none focus-visible:ring-transparent rtl:text-right flex-1"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => setShow(!show)}
                      className="h-11 w-11"
                      type="button"
                    >
                      {show ? (
                        <Eye className="h-4 w-4" />
                      ) : (
                        <EyeOff className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("resetPassword.confirmNewPassword")}</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-2 border rounded-md rtl:flex-row-reverse">
                    <Input
                      type={show ? "text" : "password"}
                      placeholder="••••••••"
                      {...field}
                      className="h-11 border-transparent rounded-none shadow-none focus-visible:ring-transparent rtl:text-right flex-1"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("common.resetPassword")
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
