import { int, mediumtext, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de propostas de viagem
 */
export const proposals = mysqlTable("proposals", {
  id: int("id").autoincrement().primaryKey(),
  
  // Nome do pacote
  packageName: varchar("packageName", { length: 255 }),
  
  // Informações do cliente
  clientName: varchar("clientName", { length: 255 }).notNull(),
  departureDate: varchar("departureDate", { length: 20 }).notNull(),
  returnDate: varchar("returnDate", { length: 20 }).notNull(),
  
  // Passageiros (campo antigo removido, substituído por adults + children)
  // passengers: varchar("passengers", { length: 100 }).notNull(),
  adults: int("adults").notNull().default(2), // número de adultos
  children: int("children").notNull().default(0), // número de crianças
  childrenAges: mediumtext("childrenAges"), // JSON array de idades das crianças
  
  // Duração da viagem
  days: int("days"), // número de dias
  nights: int("nights"), // número de noites
  
  // Imagem de capa
  coverImageUrl: text("coverImageUrl"),
  
  // Hotel
  hotelName: varchar("hotelName", { length: 255 }), // nome do hotel
  hotelPhotos: mediumtext("hotelPhotos"), // JSON array de URLs (até 16MB)
  
  // Itens inclusos (JSON array de strings)
  includedItems: mediumtext("includedItems").notNull(),
  
  // Valores
  pricePerPerson: int("pricePerPerson").notNull(), // em centavos
  totalPrice: int("totalPrice").notNull(), // em centavos
  
  // Formas de pagamento
  downPayment: int("downPayment").notNull(), // em centavos
  installments: int("installments").notNull(), // número de parcelas
  installmentValue: int("installmentValue").notNull(), // em centavos
  firstInstallmentDate: varchar("firstInstallmentDate", { length: 20 }), // data da primeira parcela
  installmentDates: mediumtext("installmentDates").notNull(), // JSON array de datas
  
  // Contatos
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  email: varchar("email", { length: 320 }),
  instagramUrl: varchar("instagramUrl", { length: 500 }),
  
  // Metadados
  createdBy: int("createdBy").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  
  // Rastreamento de status
  status: mysqlEnum("status", ["pending", "viewed", "approved", "expired"]).default("pending").notNull(),
  viewedAt: timestamp("viewedAt"),
  approvedAt: timestamp("approvedAt"),
  expiresAt: timestamp("expiresAt"),
  viewCount: int("viewCount").default(0).notNull(),
});

export type Proposal = typeof proposals.$inferSelect;
export type InsertProposal = typeof proposals.$inferInsert;