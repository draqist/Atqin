"use client";

import { AppStore, makeStore } from "@/lib/store";
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Provider } from "react-redux";
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import { toast } from "sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  // 1. TanStack Query Client
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60 * 5 * 1000 } },
        // queryCache: new QueryCache({
        //   onError: (error) => {
        //     if (error.message === "Failed to fetch") {
        //       console.log(error);
        //       toast.error("Something went wrong: Network error");
        //     } else {
        //       toast.error(`Something went wrong: ${error.message}`);
        //     }
        //   },
        // }),
        mutationCache: new MutationCache({
          onError: (error) => {
            if (error.message === "Failed to fetch") {
              toast.error("Something went wrong: Network error");
            } else {
              toast.error(`Something went wrong: ${error.message}`);
            }
          },
        }),
      })
  );

  // 2. Redux Store (Ensure it's created only once per session)
  const storeRef = useRef<AppStore | null>(null);
  const persistorRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  if (!storeRef.current) {
    storeRef.current = makeStore();
    persistorRef.current = persistStore(storeRef.current);
  }

  return (
    <Provider store={storeRef.current}>
      <PersistGate loading={null} persistor={persistorRef.current}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
