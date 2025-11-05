import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import CreateProposal from "./pages/CreateProposal";
import ProposalsList from "./pages/ProposalsList";
import ViewProposal from "./pages/ViewProposal";
import Header from "./components/Header";
import { useLocation } from "wouter";

function Router() {
  const [location] = useLocation();
  const isProposalView = location.startsWith("/proposta/");

  return (
    <>
      {/* Não mostrar header na página de visualização da proposta (cliente) */}
      {!isProposalView && <Header />}
      <Switch>
        <Route path={"/"} component={ProposalsList} />
        <Route path={"/exemplo-proposta"} component={Home} />
        <Route path={"/propostas"} component={ProposalsList} />
        <Route path={"/propostas/nova"} component={CreateProposal} />
        <Route path={"/propostas/editar/:id"} component={CreateProposal} />
        <Route path={"/propostas/duplicar/:id"} component={CreateProposal} />
        <Route path={"/criar-proposta"} component={CreateProposal} />
        <Route path={"/proposta/:id"} component={ViewProposal} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;