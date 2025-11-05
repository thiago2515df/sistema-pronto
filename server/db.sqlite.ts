import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { InsertUser, users, proposals, InsertProposal, Proposal } from "../drizzle/schema.sqlite";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db) {
    try {
      const sqlite = new Database('./data/proposta-viagem.db');
      _db = drizzle(sqlite);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const existing = await db.select().from(users).where(eq(users.openId, user.openId)).limit(1);
    
    if (existing.length > 0) {
      // Update
      await db.update(users)
        .set({
          name: user.name,
          email: user.email,
          loginMethod: user.loginMethod,
          role: user.role || (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
          lastSignedIn: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.openId, user.openId));
    } else {
      // Insert
      await db.insert(users).values({
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role || (user.openId === ENV.ownerOpenId ? 'admin' : 'user'),
        lastSignedIn: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Funções para propostas
export async function createProposal(proposal: InsertProposal): Promise<Proposal> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(proposals).values(proposal).returning();
  return result[0];
}

export async function getAllProposals(): Promise<Proposal[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return await db.select().from(proposals);
}

export async function getProposalById(id: number): Promise<Proposal | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateProposal(id: number, data: Partial<InsertProposal>): Promise<Proposal> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.update(proposals)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(proposals.id, id))
    .returning();
  
  return result[0];
}

export async function deleteProposal(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(proposals).where(eq(proposals.id, id));
}

export async function markProposalAsViewed(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const proposal = await getProposalById(id);
  if (!proposal) return;

  // Só marca como visualizada se ainda estiver pendente
  if (proposal.status === "pending") {
    await db.update(proposals)
      .set({ 
        status: "viewed", 
        viewedAt: new Date(),
        viewCount: (proposal.viewCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id));
  } else {
    // Apenas incrementa o contador de visualizações
    await db.update(proposals)
      .set({ 
        viewCount: (proposal.viewCount || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(proposals.id, id));
  }
}

export async function markProposalAsApproved(id: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(proposals)
    .set({ 
      status: "approved", 
      approvedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(proposals.id, id));
}

export async function updateExpiredProposals(): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const now = new Date();
  
  // Marca como expiradas as propostas que passaram da data de expiração
  const allProposals = await db.select().from(proposals);
  
  for (const proposal of allProposals) {
    if (proposal.expiresAt && proposal.expiresAt < now && proposal.status !== "expired") {
      await db.update(proposals)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(proposals.id, proposal.id));
    }
  }
}
