import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/authContext";
import { VaultProvider } from "@/lib/vaultContext";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import Unlock from "@/pages/unlock";
import Vault from "@/pages/vault";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/"><Redirect to="/login" /></Route>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/unlock" component={Unlock} />
      <Route path="/vault" component={Vault} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <VaultProvider>
            <Toaster />
            <Router />
          </VaultProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;