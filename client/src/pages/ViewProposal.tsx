import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Loader2, Download } from "lucide-react";
import { useReactToPrint } from "react-to-print";
import { useRoute } from "wouter";
import { toast } from "sonner";
import { useEffect, useState, useRef } from "react";

export default function ViewProposal() {
  const [, params] = useRoute("/proposta/:id");
  const proposalId = params?.id ? parseInt(params.id) : 0;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const proposalRef = useRef<HTMLDivElement>(null);

  const { data: proposal, isLoading } = trpc.proposals.getById.useQuery(
    { id: proposalId },
    { enabled: proposalId > 0 }
  );

  const markAsViewedMutation = trpc.proposals.markAsViewed.useMutation();
  const markAsApprovedMutation = trpc.proposals.markAsApproved.useMutation();

  // Rastrear visualização quando a proposta é carregada
  useEffect(() => {
    if (proposal && proposalId > 0) {
      markAsViewedMutation.mutate({ id: proposalId });
    }
  }, [proposal?.id]);

  const handleAcceptProposal = async () => {
    try {
      await markAsApprovedMutation.mutateAsync({ id: proposalId });
      toast.success("Proposta aceita! Entraremos em contato em breve.");
    } catch (error) {
      toast.error("Erro ao aceitar proposta");
    }
  };

  const handleContactConsultant = () => {
    toast.info("Redirecionando para contato com consultor...");
  };

  const handlePrint = useReactToPrint({
    contentRef: proposalRef,
    documentTitle: `Proposta - ${proposal?.clientName || 'Viagem'}`,
    onBeforePrint: async () => {
      if (lightboxOpen) {
        setLightboxOpen(false);
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    },
  });

  const handleDownloadPDF = () => {
    toast.info("Abrindo janela de impressão...");
    handlePrint();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Proposta não encontrada</p>
      </div>
    );
  }

  const includedItems = JSON.parse(proposal.includedItems) as string[];
  const installmentDates = JSON.parse(proposal.installmentDates) as string[];
  const hotelPhotos = proposal.hotelPhotos ? JSON.parse(proposal.hotelPhotos) as string[] : [];

  // Função para determinar o ícone baseado no texto do item
  const getItemIcon = (item: string): string => {
    const itemLower = item.toLowerCase();
    if (itemLower.includes('aéreo') || itemLower.includes('avião') || itemLower.includes('voo')) return 'flight';
    if (itemLower.includes('hotel') || itemLower.includes('hospedagem') || itemLower.includes('acomodação')) return 'hotel';
    if (itemLower.includes('barco') || itemLower.includes('passeio') || itemLower.includes('ilha')) return 'sailing';
    if (itemLower.includes('café') || itemLower.includes('refeição') || itemLower.includes('almoço') || itemLower.includes('jantar')) return 'restaurant';
    if (itemLower.includes('transfer') || itemLower.includes('transporte')) return 'directions_car';
    if (itemLower.includes('guia') || itemLower.includes('tour')) return 'person';
    if (itemLower.includes('ingresso') || itemLower.includes('entrada')) return 'confirmation_number';
    if (itemLower.includes('seguro')) return 'security';
    return 'check_circle';
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    
    // Se já está no formato DD/MM/YYYY, retorna direto
    if (dateStr.includes('/')) {
      return dateStr;
    }
    
    // Se está no formato YYYY-MM-DD, converte para DD/MM/YYYY
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <div ref={proposalRef} className="min-h-screen bg-background">
      {/* Hero Section com imagem */}
      <div
        className="relative w-full h-80 bg-cover bg-center flex items-end"
        style={{
          backgroundImage: proposal.coverImageUrl
            ? `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url('${proposal.coverImageUrl}')`
            : `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url('https://lh3.googleusercontent.com/aida-public/AB6AXuDEYlfw-fMhVEvT7Ne4oj_Co4SQhc6ZXrb8G08XAJ3bsQ4s1d4dNIKfDBjS1yrXiV9REo0_IFHFhFhWBxv-2Ns_Ao5r5_TTAYD8qrxRgK1BLSPceywU9A8PYO6dKAZmEJ5pUQ4NGgiQwreYKWYOBHnLn0krEFCF9CDge0Oqt5TSagpr8afJ_eyYoCJMtgT__XrtNSwH60jq1dAcId9DVMvJ-3dzh-VI-_SAw3eDoSgClOdxjpl7KrDoJT-DErlwuYTCY4z4itBfdHVU')`,
        }}
      >
        {/* Logo da empresa */}
        <div className="absolute top-4 left-4">
          <img
            src="/logo-excursao-brasilia.png"
            alt="Excursão Brasília"
            className="w-24 h-24 object-contain bg-white rounded-full p-2 shadow-lg"
          />
        </div>
        
        <div className="p-6">
          <h1 className="text-white text-[28px] font-bold leading-tight">
            {proposal.packageName || "Sua Viagem para o Rio de Janeiro"}
          </h1>
        </div>
      </div>

      {/* Mensagem de boas-vindas */}
      <p className="text-foreground text-base px-4 py-4">
        Olá, {proposal.clientName}! Preparamos com carinho esta proposta exclusiva para você.
      </p>

      {/* Dias e Noites em Destaque */}
      {proposal.days != null && proposal.nights != null && proposal.days > 0 && proposal.nights > 0 && (
        <div className="px-4 pb-4">
          <div className="p-4 rounded-lg text-center" style={{ backgroundColor: 'rgba(11, 83, 148, 0.1)' }}>
            <p className="text-2xl font-bold" style={{ color: '#0B5394' }}>
              {proposal.days} {proposal.days === 1 ? 'dia' : 'dias'} / {proposal.nights} {proposal.nights === 1 ? 'noite' : 'noites'}
            </p>
          </div>
        </div>
      )}

      {/* Grid de informações do cliente */}
      <div className="px-4 pb-6">
        <div className="bg-card rounded-lg p-4 space-y-4">
          <div className="flex flex-col gap-1 border-t border-border pt-4">
            <p className="text-muted-foreground text-sm">Cliente</p>
            <p className="text-foreground text-sm font-medium">{proposal.clientName}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1 border-t border-border pt-4">
              <p className="text-muted-foreground text-sm">Data de Ida</p>
              <p className="text-foreground text-sm font-medium">{formatDate(proposal.departureDate)}</p>
            </div>
            <div className="flex flex-col gap-1 border-t border-border pt-4">
              <p className="text-muted-foreground text-sm">Data de Volta</p>
              <p className="text-foreground text-sm font-medium">{formatDate(proposal.returnDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Itens Inclusos */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-3">Itens Inclusos</h3>
        <div className="flex flex-col gap-2">
          {includedItems.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-card rounded-lg px-4 py-3">
              <div className="flex items-center gap-4">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0, 119, 182, 0.1)', color: 'rgb(0, 119, 182)' }}
                >
                  <span className="material-symbols-outlined">
                    {getItemIcon(item)}
                  </span>
                </div>
                <p className="text-foreground text-base">{item}</p>
              </div>
              <span className="material-symbols-outlined text-green-500">check_circle</span>
            </div>
          ))}
        </div>
      </div>

      {/* Galeria de Fotos do Hotel */}
      {hotelPhotos.length > 0 && (
        <div className="px-4 pb-6">
          <h3 className="text-lg font-bold mb-3">
            {proposal.hotelName || 'Hotel'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {hotelPhotos.map((photo, index) => (
              <div key={index} className="relative aspect-video overflow-hidden rounded-lg cursor-pointer hover:opacity-90 transition-opacity">
                <img
                  src={photo}
                  alt={`Hotel ${index + 1}`}
                  className="w-full h-full object-cover"
                  onClick={() => {
                    setCurrentPhotoIndex(index);
                    setLightboxOpen(true);
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox para visualização de fotos */}
      {lightboxOpen && hotelPhotos.length > 0 && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            className="absolute top-4 right-4 text-white text-4xl font-bold hover:text-gray-300 z-10"
            onClick={() => setLightboxOpen(false)}
          >
            ×
          </button>
          
          {hotelPhotos.length > 1 && (
            <>
              <button
                className="absolute left-4 text-white text-5xl font-bold hover:text-gray-300 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => prev === 0 ? hotelPhotos.length - 1 : prev - 1);
                }}
              >
                ‹
              </button>
              <button
                className="absolute right-4 text-white text-5xl font-bold hover:text-gray-300 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentPhotoIndex((prev) => prev === hotelPhotos.length - 1 ? 0 : prev + 1);
                }}
              >
                ›
              </button>
            </>
          )}
          
          <img
            src={hotelPhotos[currentPhotoIndex]}
            alt={`Hotel ${currentPhotoIndex + 1}`}
            className="max-w-[90%] max-h-[90%] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
          
          <div className="absolute bottom-4 text-white text-lg">
            {currentPhotoIndex + 1} / {hotelPhotos.length}
          </div>
        </div>
      )}

      {/* Investimento */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-3">Investimento</h3>
        <div
          className="rounded-lg p-4 border"
          style={{ backgroundColor: 'rgba(0, 119, 182, 0.05)', borderColor: 'rgba(0, 119, 182, 0.3)' }}
        >
          <div className="flex justify-between items-baseline mb-4">
            <p className="text-foreground">Valor por pessoa</p>
            <p className="text-foreground text-lg font-bold">{formatCurrency(proposal.pricePerPerson)}</p>
          </div>
          <div className="border-t border-dashed mb-4" style={{ borderColor: 'rgba(0, 119, 182, 0.4)' }}></div>
          <div className="flex justify-between items-baseline">
            <p className="text-foreground text-lg font-semibold">Valor Total ({proposal.adults + proposal.children} pessoa{proposal.adults + proposal.children !== 1 ? 's' : ''})</p>
            <p className="text-2xl font-bold" style={{ color: 'rgb(0, 119, 182)' }}>
              {formatCurrency(proposal.totalPrice)}
            </p>
          </div>
        </div>
      </div>

      {/* Formas de Pagamento */}
      <div className="px-4 pb-6">
        <h3 className="text-lg font-bold mb-3">Formas de Pagamento</h3>
        <div className="bg-card rounded-lg p-4">
          <div
            className="flex items-center gap-3 rounded-md p-3 mb-4"
            style={{ backgroundColor: 'rgba(0, 119, 182, 0.1)' }}
          >
            <span className="material-symbols-outlined" style={{ color: 'rgb(0, 119, 182)' }}>
              payments
            </span>
            <p className="text-foreground flex-1">
              <span className="font-semibold">Entrada:</span>{' '}
              <span className="font-bold text-lg">{formatCurrency(proposal.downPayment)}</span>
            </p>
          </div>

          <div className="flex items-start gap-3 mb-3">
            <span className="material-symbols-outlined" style={{ color: 'rgb(0, 119, 182)' }}>
              credit_card
            </span>
            <div className="flex-1">
              <p className="text-foreground font-semibold">
                Saldo em {proposal.installments}x de {formatCurrency(proposal.installmentValue)}
              </p>
              <p className="text-muted-foreground text-sm">sem juros no cartão de crédito</p>
            </div>
          </div>

          <div className="pl-8 flex flex-col gap-2">
            {installmentDates.map((date, index) => (
              <div key={index} className="flex justify-between items-center text-sm border-t border-dashed border-border pt-2">
                <p className="text-muted-foreground">
                  {index + 1}ª parcela em {date}
                </p>
                <p className="font-medium text-foreground">{formatCurrency(proposal.installmentValue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="px-4 py-6 flex flex-col gap-3">
        <Button
          onClick={handleDownloadPDF}
          className="w-full h-12 text-base font-bold rounded-lg flex items-center justify-center gap-2"
          style={{ backgroundColor: 'rgb(34, 139, 34)', color: 'white' }}
        >
          <Download className="h-5 w-5" />
          Baixar Proposta em PDF
        </Button>
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
            href="tel:61996418565"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">call</span>
            <span className="text-xs">Telefone</span>
          </a>
          <a
            href="mailto:thiago.sousa@excursaobrasilia.com.br"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">email</span>
            <span className="text-xs">Email</span>
          </a>
          <a
            href="https://www.instagram.com/excursao.brasilia"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
