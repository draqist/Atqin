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
import { useRegister } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { FormErrorMessage } from "@/components/ui/form-errors";

const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters."),
    email: z.string().email("Invalid email address."),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters.")
      .or(z.literal("")),
    password: z.string().min(6, "Password must be at least 6 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// ... imports
import { useTranslations } from "next-intl";

// ... schema ...

export default function RegisterPage() {
  const t = useTranslations("Auth");
  const { mutate: register, isPending, error } = useRegister();
  const [show, setShow] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const { confirmPassword, ...data } = values;
    register(data);
  }

  const errorMessage = (error as any)?.response?.data?.error || error?.message;

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center  ltr:lg:text-left rtl:lg:text-right">
        <h1 className="text-3xl font-bold text-slate-900">
          {t("register.title")}
        </h1>
        <p className="text-slate-500">{t("register.subtitle")}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormErrorMessage message={errorMessage} />
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.fullName")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("register.namePlaceholder")}
                    {...field}
                    className="h-11 rtl:text-right"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.username")}</FormLabel>
                <FormControl>
                  <Input
                    placeholder={t("register.usernamePlaceholder")}
                    {...field}
                    className="h-11 rtl:text-right"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("common.password")}</FormLabel>
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
                <FormLabel>{t("common.confirmPassword")}</FormLabel>
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

          <Button
            type="submit"
            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={isPending || !form.formState.isValid}
          >
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              t("common.createAccount")
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-slate-500">
        {t("register.alreadyHaveAccount")}{" "}
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
