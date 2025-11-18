import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { DataProvider } from "./contexts/DataContext";
import { Web3Provider } from "./contexts/Web3Context";
import { AuthGuard } from "./components/AuthGuard";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Nodes from "./pages/Nodes";
import Scenario from "./pages/Scenario";
import Docs from "./pages/Docs";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PitchDeck from "./pages/PitchDeck";

const queryClient = new QueryClient();

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isPitchDeck = location.pathname === "/pitch-deck";

  return (
    <>
      {!isPitchDeck && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          }
        />
        <Route
          path="/register"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
          }
        />
        <Route
          path="/dashboard"
          element={
            <AuthGuard>
              <Dashboard />
            </AuthGuard>
          }
        />
        <Route
          path="/nodes"
          element={
            <AuthGuard>
              <Nodes />
            </AuthGuard>
          }
        />
        <Route path="/scenario" element={<Scenario />} />
        <Route path="/docs" element={<Docs />} />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
        <Route path="/pitch-deck" element={<PitchDeck />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isPitchDeck && <Footer />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Web3Provider>
            <DataProvider>
              <Toaster />
              <Sonner />
              <AppContent />
            </DataProvider>
          </Web3Provider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
