
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
import { useAuth } from "./contexts/AuthContext";

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

  // Redirect /admin to /admin-login if not authenticated
  if (window.location.pathname.startsWith('/admin') && 
      !loading && 
      (!currentUser || !isAdmin || !isVerified)) {
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