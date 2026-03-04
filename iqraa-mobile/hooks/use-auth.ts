import api from "@/lib/axios";
import { toast } from "@/lib/toast"; // Assuming you have sonner or use generic alert
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

// Types matching your Go Backend response
interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    role: string;
    email: string;
    username: string;
  };
}

export const useLogin = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL params
  const nextUrl = searchParams.get("next");
  useEffect(() => {
    if (searchParams.get("error") === "session_expired") {
      // Use setTimeout to ensure it renders after the page load
      setTimeout(() => {
        toast.error("Session expired. Please log in again.");
      }, 0);
    }
  }, [searchParams]);

  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post<AuthResponse>("/users/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      // 1. Store Token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.user.id, name: data.user.name }));

      // 2. Configure Axios to use it for future requests
      // (Ideally done in an interceptor, but this works for MVP)
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === "admin") {
        router.push("/admin");
      } else if (nextUrl) {
        // If there was a specific destination, go there!
        router.push(nextUrl);
      } else {
        // Default fallback
        router.push("/library");
      }
    },
    onError: (error: any) => {
      // Extract error message from Go backend
      const msg = error.response?.data?.error || "Login failed";
      toast.error(msg);
    },
  });
};

export const useRegister = () => {
  const router = useRouter();
  const searchParams = useSearchParams(); // Get URL params
  const nextUrl = searchParams.get("next");

  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post<AuthResponse>("/users/register", credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.user.id, name: data.user.name }));
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      toast.success("Account created successfully!");
      if (nextUrl) {
        // If there was a specific destination, go there!
        router.push(nextUrl);
      } else {
        // Default fallback
        router.push("/library");
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Registration failed";
      toast.error(msg);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = () => {
    // 1. Destroy the Token
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // 2. Clear the Cache (Critical)
    // This ensures that if another user logs in, they don't see the previous user's data 
    // flashing on the screen from the React Query cache.
    queryClient.clear();

    // 3. Feedback & Redirect
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return { logout };
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const { data } = await api.post("/users/forgot-password", { email });
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Reset link sent");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Failed to send reset link";
      toast.error(msg);
    },
  });
};

export const useResetPassword = () => {
  const router = useRouter();
  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.put("/users/reset-password", credentials);
      return data;
    },
    onSuccess: (data: any) => {
      toast.success(data.message || "Password updated successfully");
      router.push("/login");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Failed to reset password";
      toast.error(msg);
    },
  });
};