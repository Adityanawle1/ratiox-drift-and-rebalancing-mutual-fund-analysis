import { lazy, Suspense } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ErrorBoundary from "@/components/ErrorBoundary";
import ScrollToHash from "@/components/ScrollToHash";
import SmoothScroll from "@/components/SmoothScroll";
import PageLoader from "@/components/PageLoader";

// Route-level code-splitting with React.lazy
const Index = lazy(() => import("./pages/Index.tsx"));
const AuthPage = lazy(() => import("./pages/AuthPage.tsx"));
const Login = lazy(() => import("./pages/Login.tsx"));
const Signup = lazy(() => import("./pages/Signup.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const LearnDrift = lazy(() => import("./pages/LearnDrift.tsx"));
const TaxHarvesting = lazy(() => import("./pages/TaxHarvesting.tsx"));
const FeeAudit = lazy(() => import("./pages/FeeAudit.tsx"));
const TermsOfService = lazy(() => import("./pages/TermsOfService.tsx"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy.tsx"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const AboutUs = lazy(() => import("./pages/AboutUs.tsx"));
const Security = lazy(() => import("./pages/Security.tsx"));
const HelpCenter = lazy(() => import("./pages/HelpCenter.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes — reduces redundant API calls
      retry: 1,                  // Only 1 retry on failure (default is 3)
      refetchOnWindowFocus: false, // Don't refetch when user switches tabs
    },
  },
});

// Logged-in users can still browse the landing page
const RootRoute = () => <Index />;

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Global Cinematic Noise Overlay */}
        <div className="fixed inset-0 z-[9998] pointer-events-none opacity-[0.03] bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%20256%20256%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cfilter%20id%3D%22n%22%3E%3CfeTurbulence%20baseFrequency%3D%220.9%22/%3E%3C/filter%3E%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20filter%3D%22url(%23n)%22/%3E%3C/svg%3E')]"></div>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmoothScroll />
          <ScrollToHash />
          <AuthProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<RootRoute />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
                <Route path="/learn-drift" element={<ProtectedRoute><LearnDrift /></ProtectedRoute>} />
                <Route path="/dashboard/tax-harvesting" element={<ProtectedRoute><TaxHarvesting /></ProtectedRoute>} />
                <Route path="/dashboard/fee-audit" element={<ProtectedRoute><FeeAudit /></ProtectedRoute>} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/about" element={<AboutUs />} />
                <Route path="/security" element={<Security />} />
                <Route path="/help" element={<HelpCenter />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
