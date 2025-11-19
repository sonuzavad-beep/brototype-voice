import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AdminNavigationProvider, useAdminNavigation } from "./contexts/AdminNavigationContext";
import { StudentNavigationProvider } from "./contexts/StudentNavigationContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navbar } from "./components/Navbar";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import StudentDashboard from "./pages/student/Dashboard";
import StudentComplaintDetail from "./pages/student/ComplaintDetail";
import SubmitComplaint from "./pages/student/SubmitComplaint";
import StudentComplaints from "./pages/student/Complaints";
import StudentProfile from "./pages/student/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminComplaints from "./pages/admin/Complaints";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminUsers from "./pages/admin/Users";
import AdminCategories from "./pages/admin/Categories";
import AdminProfile from "./pages/admin/Profile";
import AdminComplaintDetail from "./pages/admin/ComplaintDetail";
import { AdminDock } from "./components/AdminDock";
import { AdminMobileNav } from "./components/AdminMobileNav";
import { StudentMobileNav } from "./components/StudentMobileNav";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const { navigationType } = useAdminNavigation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/student');
  const showNavbar = location.pathname === '/';

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Student Routes */}
        <Route path="/student/dashboard" element={<ProtectedRoute requiredRole="student"><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/submit" element={<ProtectedRoute requiredRole="student"><SubmitComplaint /></ProtectedRoute>} />
        <Route path="/student/complaints" element={<ProtectedRoute requiredRole="student"><StudentComplaints /></ProtectedRoute>} />
        <Route path="/student/complaints/:id" element={<ProtectedRoute requiredRole="student"><StudentComplaintDetail /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute requiredRole="student"><StudentProfile /></ProtectedRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/complaints" element={<ProtectedRoute requiredRole="admin"><AdminComplaints /></ProtectedRoute>} />
        <Route path="/admin/complaints/:id" element={<ProtectedRoute requiredRole="admin"><AdminComplaintDetail /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
        <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><AdminCategories /></ProtectedRoute>} />
        <Route path="/admin/profile" element={<ProtectedRoute requiredRole="admin"><AdminProfile /></ProtectedRoute>} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {isAdminRoute && navigationType === "menubar" && <AdminDock />}
      {isAdminRoute && navigationType !== "menubar" && <AdminMobileNav />}
      {isStudentRoute && <StudentMobileNav />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AdminNavigationProvider>
              <StudentNavigationProvider>
                <AppContent />
              </StudentNavigationProvider>
            </AdminNavigationProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
