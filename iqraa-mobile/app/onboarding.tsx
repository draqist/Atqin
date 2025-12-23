import { COLORS } from "@/constants/theme";
import { setOnboardingCompleted } from "@/lib/storage/onboarding";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  ChatsCircleIcon,
  PlayCircleIcon,
  RocketLaunchIcon,
} from "phosphor-react-native";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
  ViewToken,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface OnboardingSlide {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  bgColor: string;
}

const IqraaIcon = () => {
  return (
    <Image
      source={require("@/assets/images/iqraa-green.png")}
      // className="text-2xl font-bold text-slate-900 text-center mb-4"
      style={{ width: 60, height: 60 }}
      contentFit="contain"
    />
  );
};

const slides: OnboardingSlide[] = [
  {
    id: "1",
    icon: <IqraaIcon />,
    title: "Welcome to Iqraa",
    description:
      "Your gateway to authentic Islamic knowledge. Access curated books and resources from trusted scholars.",
    bgColor: "#ECFDF5",
  },
  {
    id: "2",
    icon: <PlayCircleIcon size={80} color="#6366F1" weight="duotone" />,
    title: "Learn Your Way",
    description:
      "Read PDFs, watch video explanations, and follow structured playlists. All in one place.",
    bgColor: "#EEF2FF",
  },
  {
    id: "3",
    icon: <ChatsCircleIcon size={80} color="#F59E0B" weight="duotone" />,
    title: "Join the Community",
    description:
      "Share reflections, discuss with fellow learners, and track your progress together.",
    bgColor: "#FEF3C7",
  },
  {
    id: "4",
    icon: <RocketLaunchIcon size={80} color="#EC4899" weight="duotone" />,
    title: "Start Your Journey",
    description:
      "Sign up now and begin your path to knowledge. It only takes a minute.",
    bgColor: "#FCE7F3",
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const isLastSlide = currentIndex === slides.length - 1;

  const handleNext = () => {
    if (isLastSlide) {
      handleGetStarted();
    } else {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    }
  };

  const handleSkip = async () => {
    await setOnboardingCompleted();
    router.replace("/(auth)/register");
  };

  const handleGetStarted = async () => {
    await setOnboardingCompleted();
    router.replace("/(auth)/register");
  };

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      {/* Icon Container */}
      <View
        className="w-40 h-40 rounded-full items-center justify-center mb-10"
        style={{ backgroundColor: item.bgColor }}
      >
        {item.icon}
      </View>

      {/* Text */}
      <Text className="text-2xl font-bold text-slate-900 text-center mb-4">
        {item.title}
      </Text>
      <Text className="text-base text-slate-500 text-center leading-6">
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Skip Button */}
      <View className="absolute top-16 right-6 z-10">
        <Pressable onPress={handleSkip}>
          <Text className="text-slate-500 font-medium">Skip</Text>
        </Pressable>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
      />

      {/* Bottom Section */}
      <View className="px-6 pb-8">
        {/* Dots */}
        <View className="flex-row justify-center mb-8 gap-2">
          {slides.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full"
              style={{
                width: currentIndex === index ? 24 : 8,
                backgroundColor:
                  currentIndex === index ? COLORS.primary : "#E2E8F0",
              }}
            />
          ))}
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          {!isLastSlide && (
            <Pressable
              onPress={handleSkip}
              className="flex-1 h-14 rounded-xl border border-slate-200 items-center justify-center"
            >
              <Text className="font-semibold text-slate-600">Skip</Text>
            </Pressable>
          )}

          <Pressable
            onPress={handleNext}
            className="flex-1 h-14 rounded-xl items-center justify-center"
            style={{
              backgroundColor: COLORS.primary,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
          >
            <Text className="font-bold text-white">
              {isLastSlide ? "Get Started" : "Next"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}
