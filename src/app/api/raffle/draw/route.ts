import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import {
  getActiveRaffle,
  getRaffleEntries,
  drawRaffleWinner,
} from "@/lib/admin/raffle";
import { sendWinnerEmail } from "@/lib/email/raffle-winner";

export async function POST(request: NextRequest) {
  const isAuthenticated = await isAdminAuthenticated();

  if (!isAuthenticated) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { raffleId } = body;

    if (!raffleId || typeof raffleId !== "string") {
      return NextResponse.json(
        { error: "ID de sorteo inválido." },
        { status: 400 }
      );
    }

    // Verificar que el sorteo existe y está cerrado
    const raffle = await getActiveRaffle();

    if (!raffle || raffle.id !== raffleId) {
      return NextResponse.json(
        { error: "Sorteo no encontrado." },
        { status: 404 }
      );
    }

    if (raffle.status === "finished") {
      return NextResponse.json(
        { error: "Este sorteo ya tiene un ganador." },
        { status: 400 }
      );
    }

    // Verificar que hay participantes
    const entries = await getRaffleEntries(raffleId);

    if (entries.length === 0) {
      return NextResponse.json(
        { error: "No hay participantes en este sorteo." },
        { status: 400 }
      );
    }

    // Realizar el sorteo
    const winner = await drawRaffleWinner(raffleId);

    // Enviar email al ganador
    try {
      await sendWinnerEmail({
        toEmail: winner.email,
        toName: winner.fullName,
        prizeName: raffle.prizeName,
        instagramHandle: winner.instagramHandle,
      });
    } catch (emailError) {
      console.error("[raffle/draw] Error enviando email:", emailError);
      // No fallamos el sorteo si el email falla
    }

    return NextResponse.json({
      ok: true,
      message: "¡Sorteo realizado con éxito!",
      winner: {
        fullName: winner.fullName,
        email: winner.email,
        instagramHandle: winner.instagramHandle,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al realizar el sorteo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}