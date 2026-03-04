import { COLORS } from "@/constants/theme";
import { useLogin } from "@/hooks/use-auth-mobile";
import { Image } from "expo-image";
import { Link } from "expo-router";
import {
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
} from "phosphor-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: login, isPending } = useLogin();

  const handleLogin = () => {
    if (!email.trim() || !password.trim()) {
      return;
    }
    login({ email: email.trim(), password });
  };

  const isValid = email.trim().length > 0 && password.length >= 1;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6 justify-center">
            {/* Logo & Header */}
            <View className="items-center mb-10">
              <View className="w-20 h-20 rounded-2xl bg-emerald-100 items-center justify-center mb-4">
                <Image
                  source={require("@/assets/images/iqraa-green.png")}
                  style={{ width: 48, height: 48 }}
                  contentFit="contain"
                />
              </View>
              <Text className="text-3xl font-bold text-slate-900 mb-2">
                Welcome Back
              </Text>
              <Text className="text-slate-500 text-center">
                Sign in to continue your learning journey
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-4">
              {/* Email Field */}
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Email or Username
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <EnvelopeIcon size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="Enter your email"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                  />
                </View>
              </View>

              {/* Password Field */}
              <View className="mt-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-slate-700">
                    Password
                  </Text>
                  <Pressable>
                    <Text className="text-sm font-medium text-emerald-600">
                      Forgot Password?
                    </Text>
                  </Pressable>
                </View>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <LockIcon size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                  />
                  <Pressable onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? (
                      <EyeIcon size={20} color="#64748B" />
                    ) : (
                      <EyeSlashIcon size={20} color="#64748B" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* Login Button */}
              <Pressable
                onPress={handleLogin}
                disabled={!isValid || isPending}
                className="mt-6"
                style={{
                  backgroundColor: isValid ? COLORS.primary : "#CBD5E1",
                  height: 56,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  shadowColor: isValid ? COLORS.primary : "transparent",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: isValid ? 4 : 0,
                }}
              >
                {isPending ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-base">
                    Sign In
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-slate-200" />
              <Text className="mx-4 text-slate-400 text-sm">or</Text>
              <View className="flex-1 h-px bg-slate-200" />
            </View>

            {/* Register Link */}
            <View className="items-center">
              <Text className="text-slate-600">
                Don't have an account?{" "}
                <Link href="/(auth)/register" asChild>
                  <Text className="font-semibold text-emerald-600">
                    Sign Up Free
                  </Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
