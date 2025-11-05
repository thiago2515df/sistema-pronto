import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { 
  Loader2, Plus, Trash2, Copy, Eye, CheckCircle, Clock, XCircle, 
  MapPin, Calendar, Users, DollarSign, Grid3x3, List, Edit, Files
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";

type StatusFilter = "all" | "pending" | "viewed" | "approved" | "expired";
type ViewMode = "grid" | "list";

export default function ProposalsList() {
  const [, setLocation] = useLocation();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: proposals, isLoading, refetch } = trpc.proposals.list.useQuery();
  const deleteMutation = trpc.proposals.delete.useMutation({
    onSuccess: () => {
      toast.success("Proposta deletada com sucesso!");
      refetch();
    },
  });

  const copyProposalLink = (id: number) => {
    const url = `${window.location.origin}/proposta/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado para a área de transferência!");
  };

  const duplicateProposal = (id: number) => {
    // Redireciona para o formulário com os dados pré-preenchidos
    setLocation(`/propostas/duplicar/${id}`);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(cents / 100);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // Se já estiver no formato DD/MM/YYYY, retorna direto
    if (dateStr.includes('/')) {
      return dateStr;
    }
    // Se estiver no formato YYYY-MM-DD, converte
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

    const getImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `/storage/${url}`;
  };

  const getStatusInfo = (status: string) => {
    const statusConfig = {
      pending: { label: "Em Orçamento", color: "bg-yellow-100 text-yellow-800", icon: Clock },
      viewed: { label: "Visualizada", color: "bg-blue-100 text-blue-800", icon: Eye },
      approved: { label: "Aprovada", color: "bg-green-100 text-green-800", icon: CheckCircle },
      expired: { label: "Expirada", color: "bg-red-100 text-red-800", icon: XCircle },
    };
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
  };

  // Estatísticas
  const stats = {
    total: proposals?.length || 0,
    pending: proposals?.filter(p => p.status === "pending").length || 0,
    viewed: proposals?.filter(p => p.status === "viewed").length || 0,
    approved: proposals?.filter(p => p.status === "approved").length || 0,
    expired: proposals?.filter(p => p.status === "expired").length || 0,
  };

  // Filtrar propostas
  const filteredProposals = proposals?.filter(p => {
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    const matchesSearch = searchQuery === "" || 
      p.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.packageName && p.packageName.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  }) || [];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Propostas</h1>
            <p className="text-gray-600 mt-1">Gerencie suas propostas de viagem</p>
          </div>
          <Button
            onClick={() => setLocation("/propostas/nova")}
            className="bg-[#0B5394] hover:bg-[#084270]"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nova Proposta
          </Button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <Card className="border-l-4 border-l-blue-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Propostas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-yellow-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Em Orçamento</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-purple-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Visualizadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.viewed}</p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Eye className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aprovadas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Expiradas</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stats.expired}</p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Buscar propostas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              className={statusFilter === "all" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              Todas
            </Button>
            <Button
              variant={statusFilter === "pending" ? "default" : "outline"}
              onClick={() => setStatusFilter("pending")}
              className={statusFilter === "pending" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              Em Orçamento
            </Button>
            <Button
              variant={statusFilter === "viewed" ? "default" : "outline"}
              onClick={() => setStatusFilter("viewed")}
              className={statusFilter === "viewed" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              Visualizadas
            </Button>
            <Button
              variant={statusFilter === "approved" ? "default" : "outline"}
              onClick={() => setStatusFilter("approved")}
              className={statusFilter === "approved" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              Aprovadas
            </Button>
            <Button
              variant={statusFilter === "expired" ? "default" : "outline"}
              onClick={() => setStatusFilter("expired")}
              className={statusFilter === "expired" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              Expiradas
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-[#0B5394] hover:bg-[#084270]" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Grid de Propostas */}
        {filteredProposals.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Nenhuma proposta encontrada</p>
          </Card>
        ) : (
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4"}>
            {filteredProposals.map((proposal) => {
              const statusInfo = getStatusInfo(proposal.status);
              const StatusIcon = statusInfo.icon;

              return (
                <Card key={proposal.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {/* Imagem */}
                  <div className="relative h-32 bg-gray-200">
                    {proposal.coverImageUrl ? (
                      <img
                        src={getImageUrl(proposal.coverImageUrl)}
                        alt={proposal.packageName || "Proposta"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-600">
                        <MapPin className="h-16 w-16 text-white opacity-50" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <Badge className={`${statusInfo.color} font-medium`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusInfo.label}
                      </Badge>
                    </div>
                  </div>

                  {/* Conteúdo */}
                  <div className="p-3 space-y-2">
                    <div>
                      <h3 className="font-bold text-base text-gray-900 truncate">
                        {proposal.packageName || "Sua Viagem para o Rio de Janeiro"}
                      </h3>
                      <p className="text-xs text-gray-600 uppercase tracking-wide">
                        {proposal.clientName}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>Rio de Janeiro</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span>{formatDate(proposal.departureDate)} - {formatDate(proposal.returnDate)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{proposal.adults + proposal.children} pessoa{proposal.adults + proposal.children !== 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-600">Valor Total</span>
                        <span className="text-lg font-bold text-[#0B5394]">
                          {formatCurrency(proposal.pricePerPerson * (proposal.adults + proposal.children))}
                        </span>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="flex gap-1 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/proposta/${proposal.id}`, '_blank')}
                        className="flex-1"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyProposalLink(proposal.id)}
                        className="flex-1"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateProposal(proposal.id)}
                      >
                        <Files className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation(`/propostas/editar/${proposal.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (confirm("Tem certeza que deseja deletar esta proposta?")) {
                            deleteMutation.mutate({ id: proposal.id });
                          }
                        }}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
