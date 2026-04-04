import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Index from "./pages/Index";
import ListingDetail from "./pages/ListingDetail";
import BookingPage from "./pages/BookingPage";
import AuthPage from "./pages/AuthPage";
import WishlistPage from "./pages/WishlistPage";
import DashboardPage from "./pages/DashboardPage";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import SupportPage from "./pages/SupportPage";
import BookingDetailPage from "./pages/BookingDetailPage";
import BookingsPage from "./pages/BookingsPage";
import ShareSpacePage from "./pages/ShareSpacePage";
import SupportBubble from "./components/SupportBubble";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SupportBubble />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<Index />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/booking/:id" element={<BookingPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/wishlists" element={<WishlistPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route path="/booking-detail/:id" element={<BookingDetailPage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
