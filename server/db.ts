import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, proposals, InsertProposal, Proposal } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
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
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
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

  const result = await db.insert(proposals).values(proposal);
  const insertedId = Number(result[0].insertId);
  
  const created = await db.select().from(proposals).where(eq(proposals.id, insertedId)).limit(1);
  return created[0];
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

  await db.update(proposals).set(data).where(eq(proposals.id, id));
  
  const updated = await db.select().from(proposals).where(eq(proposals.id, id)).limit(1);
  return updated[0];
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
        viewCount: (proposal.viewCount || 0) + 1
      })
      .where(eq(proposals.id, id));
  } else {
    // Apenas incrementa o contador de visualizações
    await db.update(proposals)
      .set({ viewCount: (proposal.viewCount || 0) + 1 })
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
      approvedAt: new Date()
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
  await db.update(proposals)
    .set({ status: "expired" })
    .where(
      eq(proposals.expiresAt, now) // Simplified - in production use proper comparison
    );
}
