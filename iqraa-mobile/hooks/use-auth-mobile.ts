import api from "@/lib/axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { toast } from "sonner-native";

// Types matching the Go Backend response
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

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  name: string;
  email: string;
  username?: string;
  password: string;
}

// Token storage keys
const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

/**
 * Stores the auth token securely.
 */
export async function storeToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
}

/**
 * Retrieves the stored auth token.
 */
export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

/**
 * Removes the stored auth token.
 */
export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

/**
 * Stores user data.
 */
export async function storeUser(user: { id: string; name: string }): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
}

/**
 * Retrieves stored user data.
 */
export async function getStoredUser(): Promise<{ id: string; name: string } | null> {
  const data = await SecureStore.getItemAsync(USER_KEY);
  return data ? JSON.parse(data) : null;
}

/**
 * Removes stored user data.
 */
export async function removeUser(): Promise<void> {
  await SecureStore.deleteItemAsync(USER_KEY);
}

/**
 * Hook for user login.
 */
export const useLogin = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>("/users/login", credentials);
      return data;
    },
    onSuccess: async (data) => {
      // Store token securely
      await storeToken(data.token);
      await storeUser({ id: data.user.id, name: data.user.name });

      // Configure Axios for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      // Invalidate user query to refetch
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      // Show success toast
      toast.success(`Welcome back, ${data.user.name}!`, {
        description: "You're now signed in",
      });

      // Navigate to main app
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Login failed. Please try again.";
      toast.error("Login Failed", {
        description: msg,
      });
    },
  });
};

/**
 * Hook for user registration.
 */
export const useRegister = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post<AuthResponse>("/users/register", credentials);
      return data;
    },
    onSuccess: async (data) => {
      // Store token securely
      await storeToken(data.token);
      await storeUser({ id: data.user.id, name: data.user.name });

      // Configure Axios for future requests
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;

      // Invalidate user query
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });

      // Show success toast
      toast.success("Account created!", {
        description: "Welcome to Iqraa",
      });

      // Navigate to main app
      router.replace("/(tabs)");
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || "Registration failed. Please try again.";
      toast.error("Registration Failed", {
        description: msg,
      });
    },
  });
};

/**
 * Hook for user logout.
 */
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = async () => {
    // Remove stored credentials
    await removeToken();
    await removeUser();

    // Clear axios header
    delete api.defaults.headers.common["Authorization"];

    // Clear React Query cache
    queryClient.clear();

    // Show logout toast
    toast.success("Logged out", {
      description: "See you next time!",
    });

    // Navigate to login
    router.replace("/(auth)/login");
  };

  return { logout };
};

/**
 * Initializes auth state on app start.
 * Should be called in _layout.tsx.
 */
export async function initializeAuth(): Promise<boolean> {
  const token = await getToken();
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return true;
  }
  return false;
}
