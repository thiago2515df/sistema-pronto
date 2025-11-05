import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Home() {
  const [, setLocation] = useLocation();
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const handleAcceptProposal = () => {
    toast.success("Proposta aceita! Entraremos em contato em breve.");
  };

  const handleContactConsultant = () => {
    toast.info("Redirecionando para contato com consultor...");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section com imagem do Rio */}
      <div className="relative w-full h-80 bg-cover bg-center flex items-end" 
           style={{
             backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEYlfw-fMhVEvT7Ne4oj_Co4SQhc6ZXrb8G08XAJ3bsQ4s1d4dNIKfDBjS1yrXiV9REo0_IFHFhFhWBxv-2Ns_Ao5r5_TTAYD8qrxRgK1BLSPceywU9A8PYO6dKAZmEJ5pUQ4NGgiQwreYKWYOBHnLn0krEFCF9CDge0Oqt5TSagpr8afJ_eyYoCJMtgT__XrtNSwH60jq1dAcId9DVMvJ-3dzh-VI-_SAw3eDoSgClOdxjpl7KrDoJT-DErlwuYTCY4z4itBfdHVU')`
           }}>
        <div className="p-6">
          <h1 className="text-white text-[28px] font-bold leading-tight">
            Sua Viagem para o Rio de Janeiro
          </h1>
        </div>
      </div>

      {/* Mensagem de boas-vindas */}
      <p className="text-foreground text-base px-4 py-4">
        Olá, Maria Silva! Preparamos com carinho esta proposta exclusiva para você.
      </p>

      {/* Grid de informações do cliente */}
      <div className="px-4 pb-6">
        <div className="bg-card rounded-lg p-4 grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <p className="text-muted-foreground text-sm">Cliente</p>
            <p className="text-foreground text-sm font-medium">Maria Silva</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <p className="text-muted-foreground text-sm">Data de Ida</p>
            <p className="text-foreground text-sm font-medium">15/10/2024</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <p className="text-muted-foreground text-sm">Passageiros</p>
            <p className="text-foreground text-sm font-medium">2 Adultos</p>
          </div>
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <p className="text-muted-foreground text-sm">Data de Volta</p>
            <p className="text-foreground text-sm font-medium">22/10/2024</p>
          </div>
        </div>
      </div>

      {/* Itens Inclusos */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-3">Itens Inclusos</h3>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: 'rgba(0, 119, 182, 0.1)', color: 'rgb(0, 119, 182)' }}>
                <span className="material-symbols-outlined">flight</span>
              </div>
              <p className="text-foreground text-base">Transporte aéreo (ida e volta)</p>
            </div>
            <span className="material-symbols-outlined text-green-500">check_circle</span>
          </div>

          <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: 'rgba(0, 119, 182, 0.1)', color: 'rgb(0, 119, 182)' }}>
                <span className="material-symbols-outlined">hotel</span>
              </div>
              <p className="text-foreground text-base">Hospedagem com café da manhã</p>
            </div>
            <span className="material-symbols-outlined text-green-500">check_circle</span>
          </div>

          <div className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center" 
                   style={{ backgroundColor: 'rgba(0, 119, 182, 0.1)', color: 'rgb(0, 119, 182)' }}>
                <span className="material-symbols-outlined">sailing</span>
              </div>
              <p className="text-foreground text-base">Passeio de barco pelas ilhas</p>
            </div>
            <span className="material-symbols-outlined text-green-500">check_circle</span>
          </div>
        </div>
      </div>

      {/* Investimento */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-3">Investimento</h3>
        <div className="rounded-lg p-4 border" 
             style={{ backgroundColor: 'rgba(0, 119, 182, 0.05)', borderColor: 'rgba(0, 119, 182, 0.3)' }}>
          <div className="flex justify-between items-baseline mb-4">
            <p className="text-foreground">Valor por pessoa</p>
            <p className="text-foreground text-lg font-bold">R$ 2.500,00</p>
          </div>
          <div className="border-t border-dashed mb-4" style={{ borderColor: 'rgba(0, 119, 182, 0.4)' }}></div>
          <div className="flex justify-between items-baseline">
            <p className="text-foreground text-lg font-semibold">Valor Total (2 pessoas)</p>
            <p className="text-2xl font-bold" style={{ color: 'rgb(0, 119, 182)' }}>R$ 5.000,00</p>
          </div>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-3">Formas de Pagamento</h3>
        <div className="bg-card rounded-lg p-4">
          <div className="flex items-center gap-3 rounded-md p-3 mb-4" 
               style={{ backgroundColor: 'rgba(0, 119, 182, 0.1)' }}>
            <span className="material-symbols-outlined" style={{ color: 'rgb(0, 119, 182)' }}>payments</span>
            <p className="text-foreground flex-1">
              <span className="font-semibold">Entrada:</span>{" "}
              <span className="font-bold text-lg">R$ 480,00</span>
            </p>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <span className="material-symbols-outlined" style={{ color: 'rgb(0, 119, 182)' }}>credit_card</span>
            <div className="flex-1">
              <p className="text-foreground font-semibold">Saldo em 4x de R$ 1.130,00</p>
              <p className="text-muted-foreground text-sm">sem juros no cartão de crédito</p>
            </div>
          </div>

          <div className="pl-8 flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-2">
              <p className="text-muted-foreground">1ª parcela em 10/07/2024</p>
              <p className="font-medium text-foreground">R$ 1.130,00</p>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-2">
              <p className="text-muted-foreground">2ª parcela em 10/08/2024</p>
              <p className="font-medium text-foreground">R$ 1.130,00</p>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-2">
              <p className="text-muted-foreground">3ª parcela em 10/09/2024</p>
              <p className="font-medium text-foreground">R$ 1.130,00</p>
            </div>
            <div className="flex justify-between items-center text-sm border-t border-dashed border-border pt-2">
              <p className="text-muted-foreground">4ª parcela em 10/10/2024</p>
              <p className="font-medium text-foreground">R$ 1.130,00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botão para acessar sistema */}
      {isAuthenticated && (
        <div className="px-4 pb-4">
          <Button
            onClick={() => setLocation("/propostas")}
            className="w-full h-12 text-base font-bold rounded-lg"
            variant="outline"
          >
            Gerenciar Propostas
          </Button>
        </div>
      )}

      {/* Botões de Ação */}
      <div className="px-4 py-6 flex flex-col gap-3">
        <Button 
          onClick={handleAcceptProposal}
          className="w-full h-12 text-base font-bold rounded-lg"
          style={{ backgroundColor: 'rgb(255, 195, 0)', color: 'black' }}
        >
          Aceitar Proposta
        </Button>
        <Button 
          onClick={handleContactConsultant}
          variant="outline"
          className="w-full h-12 text-base font-bold rounded-lg"
          style={{ borderColor: 'rgb(0, 119, 182)', color: 'rgb(0, 119, 182)' }}
        >
          Falar com um Consultor
        </Button>
      </div>

      {/* Footer com contatos */}
      <div className="bg-card mt-auto py-6 px-4 border-t border-border">
        <div className="flex justify-center items-center gap-8">
          <a 
            href="tel:11999998888" 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">call</span>
            <span className="text-xs">Telefone</span>
          </a>
          <a 
            href="mailto:contato@agencia.com" 
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">email</span>
            <span className="text-xs">Email</span>
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <svg 
              className="w-6 h-6" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              viewBox="0 0 24 24"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span className="text-xs">Instagram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
