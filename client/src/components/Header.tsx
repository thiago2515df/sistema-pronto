import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export default function Header() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  const handleLogin = () => {
    window.location.href = getLoginUrl();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setLocation("/")}
        >
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">P</span>
          </div>
          <span className="font-bold text-lg hidden sm:inline">Propostas de Viagem</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                onClick={() => setLocation("/propostas")}
              >
                Painel de Controle
              </Button>
              <Button
                variant="ghost"
                onClick={() => setLocation("/criar-proposta")}
              >
                Nova Proposta
              </Button>
            </>
          )}
        </nav>

        {/* User Menu */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted-foreground">
                {user?.name || user?.email}
              </span>
              <Button variant="outline" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <Button onClick={handleLogin}>
              Entrar
            </Button>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-2">
            {isAuthenticated && (
              <>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setLocation("/propostas");
                    setMobileMenuOpen(false);
                  }}
                >
                  Painel de Controle
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => {
                    setLocation("/criar-proposta");
                    setMobileMenuOpen(false);
                  }}
                >
                  Nova Proposta
                </Button>
                <div className="border-t my-2"></div>
                <div className="px-4 py-2 text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </div>
                <Button
                  variant="outline"
                  className="justify-start"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  Sair
                </Button>
              </>
            )}
            {!isAuthenticated && (
              <Button
                onClick={() => {
                  handleLogin();
                  setMobileMenuOpen(false);
                }}
              >
                Entrar
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
