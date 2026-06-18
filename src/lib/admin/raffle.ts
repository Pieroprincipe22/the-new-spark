import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type RaffleStatus = "draft" | "open" | "closed" | "finished";

export type RaffleConfig = {
  id: string;
  title: string;
  prizeName: string;
  prizeDescription: string;
  registrationEndsAt: string;
  winnerAnnouncedAt: string;
  status: RaffleStatus;
  winnerId: string | null;
  requireInstagram: boolean;
  createdAt: string;
  updatedAt: string;
};

export type RaffleEntry = {
  id: string;
  raffleId: string;
  fullName: string;
  email: string;
  phone: string;
  instagramHandle: string | null;
  consentPrivacy: boolean;
  consentNamePublic: boolean;
  isWinner: boolean;
  createdAt: string;
};

export type RaffleWinner = {
  fullName: string;
  instagramHandle: string | null;
  consentNamePublic: boolean;
};

type RaffleConfigRow = {
  id: string;
  title: string;
  prize_name: string;
  prize_description: string;
  registration_ends_at: string;
  winner_announced_at: string;
  status: string;
  winner_id: string | null;
  require_instagram: boolean;
  created_at: string;
  updated_at: string;
};

type RaffleEntryRow = {
  id: string;
  raffle_id: string;
  full_name: string;
  email: string;
  phone: string;
  instagram_handle: string | null;
  consent_privacy: boolean;
  consent_name_public: boolean;
  is_winner: boolean;
  created_at: string;
};

function toRaffleConfig(row: RaffleConfigRow): RaffleConfig {
  return {
    id: row.id,
    title: row.title,
    prizeName: row.prize_name,
    prizeDescription: row.prize_description,
    registrationEndsAt: row.registration_ends_at,
    winnerAnnouncedAt: row.winner_announced_at,
    status: row.status as RaffleStatus,
    winnerId: row.winner_id,
    requireInstagram: row.require_instagram,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toRaffleEntry(row: RaffleEntryRow): RaffleEntry {
  return {
    id: row.id,
    raffleId: row.raffle_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    instagramHandle: row.instagram_handle,
    consentPrivacy: row.consent_privacy,
    consentNamePublic: row.consent_name_public,
    isWinner: row.is_winner,
    createdAt: row.created_at,
  };
}

// ── Obtener sorteo activo (público) ────────────────────────────────────────
export async function getActiveRaffle(): Promise<RaffleConfig | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffle_configs")
    .select("*")
    .in("status", ["open", "closed", "finished"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<RaffleConfigRow>();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return toRaffleConfig(data);
}

// ── Obtener ganador del sorteo (público) ───────────────────────────────────
export async function getRaffleWinner(
  raffleId: string
): Promise<RaffleWinner | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffle_entries")
    .select("full_name, instagram_handle, consent_name_public")
    .eq("raffle_id", raffleId)
    .eq("is_winner", true)
    .maybeSingle<Pick<RaffleEntryRow, "full_name" | "instagram_handle" | "consent_name_public">>();

  if (error) throw new Error(error.message);
  if (!data) return null;

  return {
    fullName: data.full_name,
    instagramHandle: data.instagram_handle,
    consentNamePublic: data.consent_name_public,
  };
}

// ── Inscribir participante (público) ───────────────────────────────────────
export async function enterRaffle(input: {
  raffleId: string;
  fullName: string;
  email: string;
  phone: string;
  instagramHandle?: string;
  consentPrivacy: boolean;
  consentNamePublic: boolean;
}): Promise<RaffleEntry> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffle_entries")
    .insert({
      raffle_id: input.raffleId,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      instagram_handle: input.instagramHandle?.trim() || null,
      consent_privacy: input.consentPrivacy,
      consent_name_public: input.consentNamePublic,
    })
    .select("*")
    .single<RaffleEntryRow>();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya estás inscrito en este sorteo.");
    }
    throw new Error(error.message);
  }

  return toRaffleEntry(data);
}

// ── Admin: obtener todos los participantes ─────────────────────────────────
export async function getRaffleEntries(
  raffleId: string
): Promise<RaffleEntry[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffle_entries")
    .select("*")
    .eq("raffle_id", raffleId)
    .order("created_at", { ascending: true })
    .returns<RaffleEntryRow[]>();

  if (error) throw new Error(error.message);

  return data.map(toRaffleEntry);
}

// ── Admin: realizar el sorteo ──────────────────────────────────────────────
export async function drawRaffleWinner(
  raffleId: string
): Promise<RaffleEntry> {
  const supabase = createSupabaseAdminClient();

  // Obtener todos los participantes no ganadores
  const { data: entries, error: entriesError } = await supabase
    .from("raffle_entries")
    .select("*")
    .eq("raffle_id", raffleId)
    .eq("is_winner", false)
    .returns<RaffleEntryRow[]>();

  if (entriesError) throw new Error(entriesError.message);
  if (!entries || entries.length === 0) {
    throw new Error("No hay participantes en este sorteo.");
  }

  // Elegir ganador al azar
  const winnerRow = entries[Math.floor(Math.random() * entries.length)];

  // Marcar como ganador
  const { data: winner, error: winnerError } = await supabase
    .from("raffle_entries")
    .update({ is_winner: true })
    .eq("id", winnerRow.id)
    .select("*")
    .single<RaffleEntryRow>();

  if (winnerError) throw new Error(winnerError.message);

  // Actualizar el sorteo con el ID del ganador y estado finished
  const { error: updateError } = await supabase
    .from("raffle_configs")
    .update({ winner_id: winnerRow.id, status: "finished" })
    .eq("id", raffleId);

  if (updateError) throw new Error(updateError.message);

  return toRaffleEntry(winner);
}

// ── Admin: cambiar estado del sorteo ──────────────────────────────────────
export async function updateRaffleStatus(
  raffleId: string,
  status: RaffleStatus
): Promise<void> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("raffle_configs")
    .update({ status })
    .eq("id", raffleId);

  if (error) throw new Error(error.message);
}

// ── Admin: crear sorteo ───────────────────────────────────────────────────
export async function createRaffle(input: {
  title: string;
  prizeName: string;
  prizeDescription: string;
  registrationEndsAt: string;
  winnerAnnouncedAt: string;
  requireInstagram: boolean;
}): Promise<RaffleConfig> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffle_configs")
    .insert({
      title: input.title,
      prize_name: input.prizeName,
      prize_description: input.prizeDescription,
      registration_ends_at: input.registrationEndsAt,
      winner_announced_at: input.winnerAnnouncedAt,
      require_instagram: input.requireInstagram,
      status: "draft",
    })
    .select("*")
    .single<RaffleConfigRow>();

  if (error) throw new Error(error.message);

  return toRaffleConfig(data);
}

// ── Admin: obtener todos los sorteos ──────────────────────────────────────
export async function getAllRaffles(): Promise<RaffleConfig[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("raffle_configs")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<RaffleConfigRow[]>();

  if (error) throw new Error(error.message);

  return data.map(toRaffleConfig);
}