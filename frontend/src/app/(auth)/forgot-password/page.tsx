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

export default function ForgotPasswordPage() {
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
        <h1 className="text-3xl font-bold text-slate-900">Forgot password?</h1>
        <p className="text-slate-500">
          Enter your email address and we&apos;ll send you a link to reset your
          password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormErrorMessage message={errorMessage} />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="name@example.com"
                    {...field}
                    className="h-11"
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
              "Send Reset Link"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-slate-500">
        Remember your password?{" "}
        <Link
          href="/login"
          className="text-slate-900 hover:underline font-medium"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}
