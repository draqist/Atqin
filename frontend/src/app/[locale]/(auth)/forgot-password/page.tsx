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
import { useForgotPassword } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormErrorMessage } from "@/components/ui/form-errors";

const formSchema = z.object({
  email: z.string().email("Invalid email address."),
});

// ... imports
import { useTranslations } from "next-intl";

// ... schema ...

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth");
  const { mutate: forgotPassword, isPending, error } = useForgotPassword();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    forgotPassword(values.email);
  }

  const errorMessage = (error as any)?.response?.data?.error || error?.message;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center lg:text-left">
        <h1 className="text-3xl font-bold text-slate-900">
          {t("forgotPassword.title")}
        </h1>
        <p className="text-slate-500">{t("forgotPassword.subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormErrorMessage message={errorMessage} />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.email")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    className="h-11 rtl:text-right"
                  />
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
              t("common.sendResetLink")
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-slate-500">
        {t("forgotPassword.rememberPassword")}{" "}
        <Link
          href="/login"
          className="text-slate-900 hover:underline font-medium"
        >
          {t("common.logIn")}
        </Link>
      </div>
    </div>
  );
}
