import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "@/app/layout";
import Index from "./pages/Index";
import Members from "./pages/Members";
import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Automations from "./pages/Automations";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* TaskMate routes */}
          <Route path="/" element={<Index />} />
          <Route path="/members" element={<Members />} />
          
          {/* Home Hub routes with layout */}
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Home />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
