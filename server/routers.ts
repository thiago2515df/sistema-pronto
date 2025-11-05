import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { createProposal, getAllProposals, getProposalById, deleteProposal, markProposalAsViewed, markProposalAsApproved, updateProposal } from "./db.sqlite";
import { storagePut } from "./storage-local";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  proposals: router({
    // Listar todas as propostas
    list: publicProcedure.query(async () => {
      return await getAllProposals();
    }),

    // Buscar proposta por ID (pública para clientes acessarem)
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getProposalById(input.id);
      }),

    // Criar nova proposta
    create: publicProcedure
      .input(z.object({
        packageName: z.string().optional(),
        clientName: z.string(),
        departureDate: z.string(),
        returnDate: z.string(),
        days: z.number(),
        nights: z.number(),
        adults: z.number(),
        children: z.number(),
        childrenAges: z.string(),
        hotelName: z.string().optional(),
        coverImageUrl: z.string().optional(),
        hotelPhotos: z.string().optional(),
        includedItems: z.array(z.string()),
        pricePerPerson: z.number(),
        totalPrice: z.number(),
        downPayment: z.number(),
        installments: z.number(),
        installmentValue: z.number(),
        installmentDates: z.array(z.string()),
        firstInstallmentDate: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        instagramUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const proposal = await createProposal({
          ...input,
          includedItems: JSON.stringify(input.includedItems),
          installmentDates: JSON.stringify(input.installmentDates),
          createdBy: 1, // Usuário fixo para demonstração sem autenticação
        });
        return proposal;
      }),

    // Atualizar proposta existente
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        packageName: z.string().optional(),
        clientName: z.string(),
        departureDate: z.string(),
        returnDate: z.string(),
        days: z.number(),
        nights: z.number(),
        adults: z.number(),
        children: z.number(),
        childrenAges: z.string(),
        hotelName: z.string().optional(),
        coverImageUrl: z.string().optional(),
        hotelPhotos: z.string().optional(),
        includedItems: z.array(z.string()),
        pricePerPerson: z.number(),
        totalPrice: z.number(),
        downPayment: z.number(),
        installments: z.number(),
        installmentValue: z.number(),
        installmentDates: z.array(z.string()),
        firstInstallmentDate: z.string().optional(),
        phoneNumber: z.string().optional(),
        email: z.string().optional(),
        instagramUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const proposal = await updateProposal(id, {
          ...data,
          includedItems: JSON.stringify(data.includedItems),
          installmentDates: JSON.stringify(data.installmentDates),
        });
        return proposal;
      }),

    // Upload de imagem
    uploadImage: publicProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
	        const fileKey = `proposals/1/${Date.now()}-${input.fileName}`; // Usuário fixo para demonstração sem autenticação
        
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),

    // Deletar proposta
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteProposal(input.id);
        return { success: true };
      }),

    // Marcar como visualizada
    markAsViewed: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markProposalAsViewed(input.id);
        return { success: true };
      }),

    // Duplicar proposta
    duplicate: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const original = await getProposalById(input.id);
        if (!original) {
          throw new Error('Proposta não encontrada');
        }
        
        const proposal = await createProposal({
          packageName: original.packageName,
          clientName: `${original.clientName} (Cópia)`,
          departureDate: original.departureDate,
          returnDate: original.returnDate,
          adults: original.adults,
          children: original.children,
          childrenAges: original.childrenAges,
          days: original.days,
          nights: original.nights,
          hotelName: original.hotelName,
          coverImageUrl: original.coverImageUrl,
          hotelPhotos: original.hotelPhotos,
          includedItems: original.includedItems,
          pricePerPerson: original.pricePerPerson,
          totalPrice: original.totalPrice,
          downPayment: original.downPayment,
          installments: original.installments,
          installmentValue: original.installmentValue,
          installmentDates: original.installmentDates,
          phoneNumber: original.phoneNumber,
          email: original.email,
          instagramUrl: original.instagramUrl,
          createdBy: 1, // Usuário fixo para demonstração sem autenticação
        });
        return proposal;
      }),

    // Marcar como aprovada
    markAsApproved: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await markProposalAsApproved(input.id);
        return { success: true };
      }),

    // Obter estatísticas
    getStats: publicProcedure.query(async () => {
      const allProposals = await getAllProposals();
      
      return {
        total: allProposals.length,
        pending: allProposals.filter(p => p.status === "pending").length,
        viewed: allProposals.filter(p => p.status === "viewed").length,
        approved: allProposals.filter(p => p.status === "approved").length,
        expired: allProposals.filter(p => p.status === "expired").length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
