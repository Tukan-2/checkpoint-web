import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Branches from "./pages/Branches";
import BranchDetail from "./pages/BranchDetail";
import CancelBooking from "./pages/CancelBooking";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBranches from "./pages/admin/AdminBranches";
import AdminPrices from "./pages/admin/AdminPrices";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminContent from "./pages/admin/AdminContent";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminVehicleGroups from "./pages/admin/AdminVehicleGroups";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/pobocky" element={<Branches />} />
          <Route path="/pobocky/:slug" element={<BranchDetail />} />
          <Route path="/zrusit-rezervaci" element={<CancelBooking />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="branches" element={<AdminBranches />} />
            <Route path="vehicle-groups" element={<AdminVehicleGroups />} />
            <Route path="prices" element={<AdminPrices />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="content" element={<AdminContent />} />
            <Route path="menu" element={<AdminMenu />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
