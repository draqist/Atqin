import api from "@/lib/axios";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming you have sonner or use generic alert

// Types matching your Go Backend response
interface AuthResponse {
  token: string;
  user_id: string;
  name: string;
}

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post<AuthResponse>("/users/login", credentials);
      return data;
    },
    onSuccess: (data) => {
      // 1. Store Token
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, name: data.name }));

      // 2. Configure Axios to use it for future requests
      // (Ideally done in an interceptor, but this works for MVP)
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      toast.success(`Welcome back, ${data.name}!`);
      router.push("/library");
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

  return useMutation({
    mutationFn: async (credentials: any) => {
      const { data } = await api.post<AuthResponse>("/users/register", credentials);
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify({ id: data.user_id, name: data.name }));
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      toast.success("Account created successfully!");
      router.push("/library");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Registration failed";
      toast.error(msg);
    },
  });
};