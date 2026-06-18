import { NextResponse } from "next/server";
import { getActiveRaffle, getRaffleWinner } from "@/lib/admin/raffle";

export async function GET() {
  try {
    const raffle = await getActiveRaffle();

    if (!raffle) {
      return NextResponse.json({ raffle: null });
    }

    let winner = null;

    if (raffle.status === "finished" && raffle.winnerId) {
      winner = await getRaffleWinner(raffle.id);
    }

    return NextResponse.json({ raffle, winner });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener el sorteo.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}