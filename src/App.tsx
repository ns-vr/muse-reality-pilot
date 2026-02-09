import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/DashboardHome";
import FutureMode from "./pages/FutureMode";
import CoachMode from "./pages/CoachMode";
import CreatorMode from "./pages/CreatorMode";
import WingmanMode from "./pages/WingmanMode";
import InventorMode from "./pages/InventorMode";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="future" element={<FutureMode />} />
            <Route path="coach" element={<CoachMode />} />
            <Route path="creator" element={<CreatorMode />} />
            <Route path="wingman" element={<WingmanMode />} />
            <Route path="inventor" element={<InventorMode />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
