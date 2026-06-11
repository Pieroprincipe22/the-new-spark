import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  addCustomerLoyaltyStamps,
  redeemCustomerLoyaltyReward,
} from "@/lib/admin/customers";

export async function POST(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { action, customerId, stamps, reason } = body;

    if (!customerId || typeof customerId !== "string") {
      return NextResponse.json(
        { error: "ID de cliente inválido." },
        { status: 400 }
      );
    }

    if (action === "add") {
      const stampsToAdd = typeof stamps === "number" && stamps > 0 ? stamps : 1;
      const customer = await addCustomerLoyaltyStamps({
        customerId,
        stamps: stampsToAdd,
        reason: reason || "Visita registrada manualmente",
      });
      return NextResponse.json({ ok: true, customer });
    }

    if (action === "redeem") {
      const customer = await redeemCustomerLoyaltyReward({
        customerId,
        stamps: 9,
        reason: "Canje de recompensa",
      });
      return NextResponse.json({ ok: true, customer });
    }

    return NextResponse.json(
      { error: "Acción no válida." },
      { status: 400 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}