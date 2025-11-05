import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation, useRoute } from "wouter";
import { Loader2, Plus, X, Calendar as CalendarIcon } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import "react-day-picker/dist/style.css";

export default function CreateProposal() {
  const [, setLocation] = useLocation();
  const [matchEdit, paramsEdit] = useRoute("/propostas/editar/:id");
  const [matchDuplicate, paramsDuplicate] = useRoute("/propostas/duplicar/:id");
  
  const isEditing = !!matchEdit;
  const isDuplicating = !!matchDuplicate;
  const proposalId = matchEdit ? (paramsEdit?.id ? parseInt(paramsEdit.id) : null) : 
                      matchDuplicate ? (paramsDuplicate?.id ? parseInt(paramsDuplicate.id) : null) : null;
  
  const { data: existingProposal, isLoading: loadingProposal } = trpc.proposals.getById.useQuery(
    { id: proposalId! },
    { enabled: (isEditing || isDuplicating) && proposalId !== null }
  );

  // Estados básicos
  const [packageName, setPackageName] = useState("");
  const [clientName, setClientName] = useState("");
  
  // Datas com calendário de intervalo
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [days, setDays] = useState(0);
  const [nights, setNights] = useState(0);

  const getImageUrl = (url: string) => {
    if (url.startsWith('http')) {
      return url;
    }
    return `/storage/${url}`;
  };
  
  // Passageiros separados
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [childrenAges, setChildrenAges] = useState<number[]>([]);
  
  // Hotel
  const [hotelName, setHotelName] = useState("");
  
  // Imagens
  // Foto de capa (separada)
  const [coverPhoto, setCoverPhoto] = useState<File | null>(null);
  const [coverPhotoPreview, setCoverPhotoPreview] = useState<string>("");
  
  // Fotos do hotel (separadas)
  const [hotelPhotos, setHotelPhotos] = useState<File[]>([]);
  const [hotelPhotoPreviews, setHotelPhotoPreviews] = useState<string[]>([]);
  
  // Itens inclusos
  const [includedItems, setIncludedItems] = useState<string[]>([
    "Transporte aéreo (ida e volta)",
    "Hospedagem com café da manhã",
    "Passeio de barco pelas ilhas"
  ]);
  const [newItem, setNewItem] = useState("");
  
  // Valores financeiros
  const [pricePerPerson, setPricePerPerson] = useState("");
  const [totalPrice, setTotalPrice] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [installments, setInstallments] = useState("4");
  const [installmentValue, setInstallmentValue] = useState("");
  const [firstInstallmentDate, setFirstInstallmentDate] = useState<Date | undefined>(undefined);
  
  // Contatos fixos
  const phoneNumber = "61996418565";
  const email = "thiago.sousa@excursaobrasilia.com.br";
  const instagramUrl = "https://www.instagram.com/excursao.brasilia";

  // Calcular dias e noites quando o intervalo de datas mudar
  useEffect(() => {
    if (dateRange.from && dateRange.to) {
      const daysDiff = differenceInDays(dateRange.to, dateRange.from);
      setDays(daysDiff + 1); // Incluir o dia de partida
      setNights(daysDiff);
    } else {
      setDays(0);
      setNights(0);
    }
  }, [dateRange]);

  // Ajustar array de idades quando número de crianças mudar
  useEffect(() => {
    if (children > childrenAges.length) {
      // Adicionar mais idades
      setChildrenAges([...childrenAges, ...Array(children - childrenAges.length).fill(0)]);
    } else if (children < childrenAges.length) {
      // Remover idades extras
      setChildrenAges(childrenAges.slice(0, children));
    }
  }, [children]);

  // Calcular valor total baseado em valor por pessoa e número total de passageiros
  useEffect(() => {
    if (pricePerPerson) {
      const price = parseFloat(pricePerPerson);
      const totalPassengers = adults + children;
      if (!isNaN(price) && totalPassengers > 0) {
        setTotalPrice((price * totalPassengers).toFixed(2));
      }
    }
  }, [pricePerPerson, adults, children]);

  // Calcular entrada (10% do valor total)
  useEffect(() => {
    if (totalPrice) {
      const total = parseFloat(totalPrice);
      if (!isNaN(total)) {
        setDownPayment((total * 0.1).toFixed(2));
      }
    }
  }, [totalPrice]);

  // Calcular valor das parcelas
  useEffect(() => {
    if (totalPrice && downPayment && installments) {
      const total = parseFloat(totalPrice);
      const down = parseFloat(downPayment);
      const numInstallments = parseInt(installments);
      
      if (!isNaN(total) && !isNaN(down) && !isNaN(numInstallments) && numInstallments > 0) {
        const remaining = total - down;
        setInstallmentValue((remaining / numInstallments).toFixed(2));
      }
    }
  }, [totalPrice, downPayment, installments]);

  // Carregar dados da proposta existente ao editar ou duplicar
  useEffect(() => {
    if (existingProposal && (isEditing || isDuplicating)) {
      setPackageName(existingProposal.packageName || "");
      setClientName(existingProposal.clientName);
      
      // Carregar datas
      if (existingProposal.departureDate && existingProposal.returnDate) {
        try {
          let fromDate: Date;
          let toDate: Date;
          
          // Verificar se está no formato DD/MM/YYYY ou YYYY-MM-DD
          if (existingProposal.departureDate.includes('/')) {
            // Formato DD/MM/YYYY
            const [dayDep, monthDep, yearDep] = existingProposal.departureDate.split('/');
            const [dayRet, monthRet, yearRet] = existingProposal.returnDate.split('/');
            fromDate = new Date(parseInt(yearDep), parseInt(monthDep) - 1, parseInt(dayDep));
            toDate = new Date(parseInt(yearRet), parseInt(monthRet) - 1, parseInt(dayRet));
          } else {
            // Formato YYYY-MM-DD
            const [yearDep, monthDep, dayDep] = existingProposal.departureDate.split('-');
            const [yearRet, monthRet, dayRet] = existingProposal.returnDate.split('-');
            fromDate = new Date(parseInt(yearDep), parseInt(monthDep) - 1, parseInt(dayDep));
            toDate = new Date(parseInt(yearRet), parseInt(monthRet) - 1, parseInt(dayRet));
          }
          
          // Validar se as datas são válidas
          if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            setDateRange({
              from: fromDate,
              to: toDate,
            });
          }
        } catch (error) {
          console.error('Erro ao carregar datas:', error);
        }
      }
      
      // Carregar passageiros
      setAdults(existingProposal.adults);
      setChildren(existingProposal.children);
      if (existingProposal.childrenAges) {
        try {
          setChildrenAges(JSON.parse(existingProposal.childrenAges));
        } catch (e) {
          setChildrenAges([]);
        }
      }
      
      // Carregar hotel
      setHotelName(existingProposal.hotelName || "");
      
      // Carregar valores
      setPricePerPerson((existingProposal.pricePerPerson / 100).toString());
      setTotalPrice((existingProposal.totalPrice / 100).toString());
      setDownPayment((existingProposal.downPayment / 100).toString());
      setInstallments(existingProposal.installments.toString());
      setInstallmentValue((existingProposal.installmentValue / 100).toString());
      
      // Carregar data da primeira parcela
      if (existingProposal.firstInstallmentDate) {
        try {
          let date: Date;
          // Verificar se está no formato DD/MM/YYYY ou YYYY-MM-DD
          if (existingProposal.firstInstallmentDate.includes('/')) {
            const [day, month, year] = existingProposal.firstInstallmentDate.split('/');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          } else {
            const [year, month, day] = existingProposal.firstInstallmentDate.split('-');
            date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
          }
          if (!isNaN(date.getTime())) {
            setFirstInstallmentDate(date);
          }
        } catch (error) {
          console.error('Erro ao carregar data da primeira parcela:', error);
        }
      }
      
      // Contatos são fixos, não precisa carregar
      
      // Carregar foto de capa
      if (existingProposal.coverImageUrl) {
        setCoverPhotoPreview(getImageUrl(existingProposal.coverImageUrl));
      }
      
      // Carregar fotos do hotel
      if (existingProposal.hotelPhotos) {
        try {
          const photos = JSON.parse(existingProposal.hotelPhotos);
          setHotelPhotoPreviews(photos.map(getImageUrl));
        } catch (e) {
          setHotelPhotoPreviews([]);
        }
      }
      
      // Carregar itens inclusos
      if (existingProposal.includedItems) {
        try {
          setIncludedItems(JSON.parse(existingProposal.includedItems));
        } catch (e) {
          setIncludedItems([]);
        }
      }
    }
    
    // Se estiver duplicando, modificar o nome do cliente para indicar que é uma cópia
    if (existingProposal && isDuplicating) {
      setClientName(`${existingProposal.clientName} (Cópia)`);
    }
  }, [existingProposal, isEditing, isDuplicating]);

  const uploadImageMutation = trpc.proposals.uploadImage.useMutation();
  const createProposalMutation = trpc.proposals.create.useMutation();
  const updateProposalMutation = trpc.proposals.update.useMutation();

  // Função para upload da foto de capa (separada)
  const handleCoverPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Sem validação de tamanho - aceita qualquer tamanho
      setCoverPhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHotelPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setHotelPhotos([...hotelPhotos, ...newFiles]);
      
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setHotelPhotoPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeHotelPhoto = (index: number) => {
    setHotelPhotos(hotelPhotos.filter((_, i) => i !== index));
    setHotelPhotoPreviews(hotelPhotoPreviews.filter((_, i) => i !== index));
  };

  const addIncludedItem = () => {
    if (newItem.trim()) {
      setIncludedItems([...includedItems, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeIncludedItem = (index: number) => {
    setIncludedItems(includedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!clientName.trim()) {
      toast.error("Nome do cliente é obrigatório");
      return;
    }
    if (!dateRange.from || !dateRange.to) {
      toast.error("Selecione as datas de ida e volta");
      return;
    }
    if (!pricePerPerson || parseFloat(pricePerPerson) <= 0) {
      toast.error("Valor por pessoa é obrigatório");
      return;
    }

    try {
      let coverImageUrl = coverPhotoPreview; // Manter URL existente se não houver nova foto
      const hotelPhotoUrls: string[] = [...hotelPhotoPreviews]; // Manter URLs existentes

      // Upload da foto de capa (se houver nova foto)
      if (coverPhoto) {
        try {
          toast.info('Fazendo upload da foto de capa...');
          
          // Validar apenas o tipo de arquivo (sem limite de tamanho)
          if (!coverPhoto.type.startsWith('image/')) {
            toast.error('Arquivo de capa não é uma imagem válida.');
            throw new Error('Tipo de arquivo inválido');
          }

          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = reader.result as string;
              if (result && result.includes(',')) {
                resolve(result.split(',')[1]);
              } else {
                reject(new Error('Erro ao ler arquivo'));
              }
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsDataURL(coverPhoto);
          });

          const result = await uploadImageMutation.mutateAsync({
            fileName: coverPhoto.name,
            fileData: base64,
            mimeType: coverPhoto.type,
          });
          coverImageUrl = result.url;
          toast.success('Foto de capa enviada com sucesso!');
        } catch (error) {
          console.error('Erro ao fazer upload da foto de capa:', error);
          toast.error('Erro ao fazer upload da foto de capa');
          throw error;
        }
      }

      // Upload das fotos do hotel (apenas novas)
      if (hotelPhotos.length > 0) {
        toast.info(`Fazendo upload de ${hotelPhotos.length} foto(s) do hotel...`);
      }
      
      for (let i = 0; i < hotelPhotos.length; i++) {
        const photo = hotelPhotos[i];
        try {
          // Validar apenas o tipo de arquivo (sem limite de tamanho)
          if (!photo.type.startsWith('image/')) {
            toast.error(`Arquivo ${photo.name} não é uma imagem válida.`);
            continue;
          }

          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => {
              const result = reader.result as string;
              if (result && result.includes(',')) {
                resolve(result.split(',')[1]);
              } else {
                reject(new Error('Erro ao ler arquivo'));
              }
            };
            reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
            reader.readAsDataURL(photo);
          });

          const result = await uploadImageMutation.mutateAsync({
            fileName: photo.name,
            fileData: base64,
            mimeType: photo.type,
          });
          hotelPhotoUrls.push(result.url);
          
          // Mostrar progresso
          if (i < hotelPhotos.length - 1) {
            toast.info(`Foto ${i + 1}/${hotelPhotos.length} enviada com sucesso`);
          } else {
            toast.success(`Todas as ${hotelPhotos.length} fotos foram enviadas!`);
          }
        } catch (error) {
          console.error(`Erro ao fazer upload da foto ${photo.name}:`, error);
          toast.error(`Erro ao fazer upload da foto ${photo.name}`);
          // Continua com as outras fotos mesmo se uma falhar
        }
      }

      await createProposalWithData(coverImageUrl, hotelPhotoUrls);
    } catch (error) {
      console.error("Erro ao salvar proposta:", error);
      
      // Mensagem de erro mais detalhada
      let errorMessage = "Erro ao salvar proposta";
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String((error as any).message);
      }
      
      toast.error(`Erro ao salvar: ${errorMessage}`);
    }
  };

  const createProposalWithData = async (coverImageUrl: string, hotelPhotoUrls: string[]) => {
    // Gerar datas das parcelas
    const installmentDates: string[] = [];
    const baseDate = firstInstallmentDate || new Date();
    for (let i = 0; i < parseInt(installments); i++) {
      const date = new Date(baseDate);
      date.setMonth(date.getMonth() + i);
      installmentDates.push(date.toLocaleDateString('pt-BR'));
    }

    const proposalData = {
      packageName: packageName || undefined,
      clientName,
      departureDate: dateRange.from ? format(dateRange.from, 'dd/MM/yyyy') : '',
      returnDate: dateRange.to ? format(dateRange.to, 'dd/MM/yyyy') : '',
      days,
      nights,
      adults,
      children,
      childrenAges: JSON.stringify(childrenAges),
      hotelName: hotelName || undefined,
      coverImageUrl: coverImageUrl || undefined,
      hotelPhotos: hotelPhotoUrls.length > 0 ? JSON.stringify(hotelPhotoUrls) : undefined,
      includedItems,
      pricePerPerson: Math.round(parseFloat(pricePerPerson) * 100),
      totalPrice: Math.round(parseFloat(totalPrice) * 100),
      downPayment: Math.round(parseFloat(downPayment) * 100),
      installments: parseInt(installments),
      installmentValue: Math.round(parseFloat(installmentValue) * 100),
      installmentDates,
      firstInstallmentDate: firstInstallmentDate ? format(firstInstallmentDate, 'dd/MM/yyyy') : undefined,
      phoneNumber: '61996418565',
      email: 'thiago.sousa@excursaobrasilia.com.br',
      instagramUrl: 'https://www.instagram.com/excursao.brasilia',
    };

    if (isEditing && proposalId && !isDuplicating) {
      // Modo de edição: atualiza a proposta existente
      await updateProposalMutation.mutateAsync({
        id: proposalId,
        ...proposalData,
      });
      toast.success("Proposta atualizada com sucesso!");
    } else {
      // Modo de criação ou duplicação: cria nova proposta
      await createProposalMutation.mutateAsync(proposalData);
      toast.success(isDuplicating ? "Proposta duplicada com sucesso!" : "Proposta criada com sucesso!");
    }

    setLocation(`/propostas`);
  };

  const isLoading = uploadImageMutation.isPending || createProposalMutation.isPending || updateProposalMutation.isPending;

  if (loadingProposal) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6" style={{ color: '#0B5394' }}>
          {isEditing ? "Editar Proposta" : isDuplicating ? "Duplicar Proposta" : "Criar Nova Proposta"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="packageName">Nome do Pacote (opcional)</Label>
                <Input
                  id="packageName"
                  placeholder="Ex: Pacote Completo Rio de Janeiro"
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="clientName">Nome do Cliente *</Label>
                <Input
                  id="clientName"
                  placeholder="Ex: Maria Silva"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Datas da Viagem */}
          <Card>
            <CardHeader>
              <CardTitle>Datas da Viagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Selecione o período da viagem *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from && dateRange.to ? (
                        <>
                          {format(dateRange.from, 'dd/MM/yyyy', { locale: ptBR })} - {format(dateRange.to, 'dd/MM/yyyy', { locale: ptBR })}
                        </>
                      ) : (
                        <span>Selecione as datas</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="range"
                      selected={dateRange}
                      onSelect={(range: any) => setDateRange(range || { from: undefined, to: undefined })}
                      locale={ptBR}
                      disabled={{ before: new Date() }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {days > 0 && nights > 0 && (
                <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(11, 83, 148, 0.1)' }}>
                  <p className="text-lg font-bold" style={{ color: '#0B5394' }}>
                    {days} {days === 1 ? 'dia' : 'dias'} / {nights} {nights === 1 ? 'noite' : 'noites'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Passageiros */}
          <Card>
            <CardHeader>
              <CardTitle>Passageiros</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="adults">Adultos *</Label>
                  <Input
                    id="adults"
                    type="number"
                    min="1"
                    value={adults}
                    onChange={(e) => setAdults(parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="children">Crianças</Label>
                  <Input
                    id="children"
                    type="number"
                    min="0"
                    value={children}
                    onChange={(e) => setChildren(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
              
              {children > 0 && (
                <div className="space-y-2">
                  <Label>Idades das Crianças</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {childrenAges.map((age, index) => (
                      <div key={index}>
                        <Label htmlFor={`child-age-${index}`} className="text-sm">Criança {index + 1}</Label>
                        <Input
                          id={`child-age-${index}`}
                          type="number"
                          min="0"
                          max="17"
                          placeholder="Idade"
                          value={age || ''}
                          onChange={(e) => {
                            const newAges = [...childrenAges];
                            newAges[index] = parseInt(e.target.value) || 0;
                            setChildrenAges(newAges);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium">
                  Total de passageiros: {adults + children}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Hotel */}
          <Card>
            <CardHeader>
              <CardTitle>Hotel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hotelName">Nome do Hotel (opcional)</Label>
                <Input
                  id="hotelName"
                  placeholder="Ex: Hotel Copacabana Palace"
                  value={hotelName}
                  onChange={(e) => setHotelName(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Este nome aparecerá em destaque na galeria de fotos
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Foto de Capa */}
          <Card>
            <CardHeader>
              <CardTitle>Foto de Capa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverPhoto">Imagem Principal da Proposta</Label>
                <Input
                  id="coverPhoto"
                  type="file"
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Esta imagem aparecerá como capa da proposta. Sem limite de tamanho.
                </p>
                {coverPhotoPreview && (
                  <div className="mt-2 relative">
                    <img
                      src={getImageUrl(coverPhotoPreview)}
                      alt="Preview da capa"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPhoto(null);
                        setCoverPhotoPreview("");
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Fotos do Hotel */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Hotel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hotelPhotos">Adicionar Fotos</Label>
                <Input
                  id="hotelPhotos"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleHotelPhotosChange}
                />
                {hotelPhotoPreviews.length > 0 && (
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    {hotelPhotoPreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={getImageUrl(preview)}
                          alt={`Hotel ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeHotelPhoto(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Itens Inclusos */}
          <Card>
            <CardHeader>
              <CardTitle>Itens Inclusos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Adicionar item incluso"
                  value={newItem}
                  onChange={(e) => setNewItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addIncludedItem();
                    }
                  }}
                />
                <Button type="button" onClick={addIncludedItem}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {includedItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-3 rounded-lg">
                    <span>{item}</span>
                    <button
                      type="button"
                      onClick={() => removeIncludedItem(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardHeader>
              <CardTitle>Valores</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="pricePerPerson">Valor por Pessoa (R$) *</Label>
                <Input
                  id="pricePerPerson"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="2500.00"
                  value={pricePerPerson}
                  onChange={(e) => setPricePerPerson(e.target.value)}
                  required
                />
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(11, 83, 148, 0.05)', borderColor: 'rgba(11, 83, 148, 0.3)', border: '1px solid' }}>
                <div className="flex justify-between items-baseline mb-2">
                  <p className="text-foreground">Valor Total</p>
                  <p className="text-2xl font-bold" style={{ color: '#0B5394' }}>
                    R$ {parseFloat(totalPrice || '0').toFixed(2)}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {adults + children} {adults + children === 1 ? 'pessoa' : 'pessoas'} × R$ {parseFloat(pricePerPerson || '0').toFixed(2)}
                </p>
              </div>

              <div>
                <Label htmlFor="downPayment">Entrada (R$)</Label>
                <Input
                  id="downPayment"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="500.00"
                  value={downPayment}
                  onChange={(e) => setDownPayment(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Calculado automaticamente como 10% do valor total (editável)
                </p>
              </div>

              <div>
                <Label htmlFor="installments">Número de Parcelas</Label>
                <Input
                  id="installments"
                  type="number"
                  min="1"
                  max="12"
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                />
              </div>

              <div className="p-3 rounded-lg bg-muted">
                <p className="text-sm font-medium">
                  Valor de cada parcela: R$ {parseFloat(installmentValue || '0').toFixed(2)}
                </p>
              </div>

              <div>
                <Label>Data da Primeira Parcela</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {firstInstallmentDate ? (
                        format(firstInstallmentDate, 'dd/MM/yyyy', { locale: ptBR })
                      ) : (
                        <span>Selecione a data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <DayPicker
                      mode="single"
                      selected={firstInstallmentDate}
                      onSelect={setFirstInstallmentDate}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
          </Card>

          {/* Contatos */}
          {/* Botão de Submissão */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation('/propostas')}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              style={{ backgroundColor: '#0B5394' }}
              className="text-white hover:opacity-90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Edição"
              ) : (
                "Criar Proposta"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
