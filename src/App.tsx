import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Index from "./pages/Index";
import Verification from "./pages/Verification";
import Voting from "./pages/Voting";
import Results from "./pages/Results";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import ClassBrowser from "./pages/ClassBrowser";
import { useAuth } from "./contexts/AuthContext";
import ElectionTimer from "./services/ElectionTimer";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Team from "./pages/Team";

const queryClient = new QueryClient();

// Protected route component for admin routes
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isAdmin, loading, isVerified } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser || !isAdmin || !isVerified) {
    return <Navigate to="/admin-login" />;
  }
  
  return <>{children}</>;
};

// Protected route component for authenticated users
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, loading, isVerified } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/verification" />;
  }
  
  if (!isVerified) {
    return <Navigate to="/verification" />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  const { currentUser, isAdmin, loading, isVerified } = useAuth();

  // Redirect any /admin/* path to /admin-login if not authenticated
  if (window.location.pathname.startsWith('/admin') && 
      !loading && 
      (!currentUser || !isAdmin || !isVerified) &&
      window.location.pathname !== '/admin-login') {
    return <Navigate to="/admin-login" />;
  }

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/verification" element={<Verification />} />
      <Route 
        path="/voting" 
        element={
          <ProtectedRoute>
            <Voting />
          </ProtectedRoute>
        } 
      />
      <Route path="/results" element={<Results />} />
      <Route path="/admin-login" element={<AdminLogin />} />
      <Route 
        path="/admin/*" 
        element={
          <AdminRoute>
            <Admin />
          </AdminRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/classes" 
        element={
          <ProtectedRoute>
            <ClassBrowser />
          </ProtectedRoute>
        } 
      />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/team" element={<Team />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow pt-16">
              <AppRoutes />
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;