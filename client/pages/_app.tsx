import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { QueryClient, QueryClientProvider } from "react-query";
import { Toaster } from "react-hot-toast";
import MarketingLayout from "../components/MarketingLayout";
import AppLayout from "../components/AppLayout";
import "../styles/globals.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function RouteLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = router.pathname;

  const isMarketing =
    path === "/" || path === "/auth/login" || path === "/auth/register";

  if (isMarketing) {
    return <MarketingLayout>{children}</MarketingLayout>;
  }

  return <AppLayout>{children}</AppLayout>;
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouteLayout>
        <Component {...pageProps} />
      </RouteLayout>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />
    </QueryClientProvider>
  );
}
