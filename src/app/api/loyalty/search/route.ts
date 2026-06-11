import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ customers: [] });
  }

  try {
    const supabase = createSupabaseAdminClient();
    const isPhone = /^[\d\s+()-]{6,}$/.test(query);

    let supabaseQuery = supabase
      .from("customers")
      .select("id, full_name, phone, loyalty_stamps, notes, created_at")
      .order("full_name", { ascending: true })
      .limit(20);

    if (isPhone) {
      // Buscar por teléfono — normalizar quitando espacios
      const cleanPhone = query.replace(/\D/g, "");
      supabaseQuery = supabaseQuery.ilike("phone", `%${cleanPhone}%`);
    } else {
      // Buscar por nombre
      supabaseQuery = supabaseQuery.ilike("full_name", `%${query}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) throw new Error(error.message);

    return NextResponse.json({ customers: data ?? [] });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al buscar clientes.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}