"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Field } from "@base-ui/react/field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const name = formData.get("name") as string;

    try {
      if (isRegister) {
        const res = await authClient.signUp.email({ email, password, name });
        if (res.error) throw new Error(res.error.message);
      } else {
        const res = await authClient.signIn.email({ email, password });
        if (res.error) throw new Error(res.error.message);
      }
      router.push("/dashboard");
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan. Silakan coba lagi."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-6 select-none">
      <Card className="w-full max-w-md border border-border/40 shadow-lg bg-card/95 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {isRegister ? "Buat Akun" : "Selamat Datang Kembali"}
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            {isRegister
              ? "Daftar untuk mulai mengelola budget dengan metode 50-30-20"
              : "Masuk ke akun Budget Tracker kamu"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <Field.Root>
                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    required
                    disabled={isLoading}
                  />
                </div>
              </Field.Root>
            )}

            <Field.Root>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@example.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </Field.Root>

            <Field.Root>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Minimal 8 karakter"
                  required
                  disabled={isLoading}
                  minLength={8}
                />
              </div>
            </Field.Root>

            <Button
              type="submit"
              className="w-full text-base font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Memproses..." : isRegister ? "Daftar" : "Masuk"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            {isRegister ? "Sudah punya akun? " : "Belum punya akun? "}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              className="font-medium text-primary hover:text-primary/80 underline-offset-4 hover:underline transition-colors"
              disabled={isLoading}
            >
              {isRegister ? "Masuk" : "Daftar"}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
