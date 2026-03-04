import { COLORS } from "@/constants/theme";
import { useRegister } from "@/hooks/use-auth-mobile";
import { Image } from "expo-image";
import { Link, useRouter } from "expo-router";
import {
  ArrowLeftIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  LockIcon,
  UserIcon,
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
import { toast } from "sonner-native";

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const { mutate: register, isPending } = useRegister();

  const handleRegister = () => {
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    register({
      name: name.trim(),
      email: email.trim(),
      username: username.trim() || undefined,
      password,
    });
  };

  const isValid =
    name.trim().length >= 2 &&
    email.includes("@") &&
    password.length >= 6 &&
    password === confirmPassword;

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        {/* Header */}
        <View className="flex-row items-center px-4 h-14">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <ArrowLeftIcon size={24} color="#64748B" />
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 px-6">
            {/* Logo & Header */}
            <View className="items-center mb-8">
              <View className="w-16 h-16 rounded-2xl bg-emerald-100 items-center justify-center mb-4">
                <Image
                  source={require("@/assets/images/iqraa-green.png")}
                  style={{ width: 40, height: 40 }}
                  contentFit="contain"
                />
              </View>
              <Text className="text-2xl font-bold text-slate-900 mb-1">
                Create Account
              </Text>
              <Text className="text-slate-500 text-center">
                Join the community of learners
              </Text>
            </View>

            {/* Form */}
            <View className="space-y-3">
              {/* Name Field */}
              <View>
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Full Name
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <UserIcon size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="Enter your name"
                    placeholderTextColor="#94A3B8"
                    value={name}
                    onChangeText={setName}
                    autoComplete="name"
                  />
                </View>
              </View>

              {/* Username Field */}
              <View className="mt-3">
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Username{" "}
                  <Text className="text-slate-400 font-normal">(optional)</Text>
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <Text className="text-slate-400">@</Text>
                  <TextInput
                    className="flex-1 ml-2 text-base text-slate-900"
                    placeholder="Choose a username"
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
                  />
                </View>
              </View>

              {/* Email Field */}
              <View className="mt-3">
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Email
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <EnvelopeIcon size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="name@example.com"
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
              <View className="mt-3">
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <LockIcon size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="At least 6 characters"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
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

              {/* Confirm Password Field */}
              <View className="mt-3">
                <Text className="text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </Text>
                <View className="flex-row items-center bg-slate-50 border border-slate-200 rounded-xl px-4 h-14">
                  <LockIcon size={20} color="#64748B" />
                  <TextInput
                    className="flex-1 ml-3 text-base text-slate-900"
                    placeholder="Re-enter your password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showPassword}
                    autoComplete="password-new"
                  />
                </View>
                {confirmPassword.length > 0 && password !== confirmPassword && (
                  <Text className="text-red-500 text-xs mt-1">
                    Passwords do not match
                  </Text>
                )}
              </View>

              {/* Register Button */}
              <Pressable
                onPress={handleRegister}
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
                    Create Account
                  </Text>
                )}
              </Pressable>
            </View>

            {/* Login Link */}
            <View className="items-center mt-6">
              <Text className="text-slate-600">
                Already have an account?{" "}
                <Link href="/(auth)/login" asChild>
                  <Text className="font-semibold text-emerald-600">Log In</Text>
                </Link>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
