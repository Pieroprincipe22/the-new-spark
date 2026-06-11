"use client";

import { useState, useCallback } from "react";
import Link from "next/link";

const STAMPS_FOR_REWARD = 9;

type Customer = {
  id: string;
  full_name: string;
  phone: string;
  loyalty_stamps: number;
  notes: string | null;
  created_at: string;
};

type ActionState = "idle" | "loading" | "success" | "error";

function StampsGrid({ stamps }: { stamps: number }) {
  return (
    <div className="grid grid-cols-9 gap-1.5">
      {Array.from({ length: STAMPS_FOR_REWARD }).map((_, index) => (
        <div
          key={index}
          className={[
            "flex aspect-square items-center justify-center rounded-full border text-xs font-black transition",
            index < stamps
              ? "border-white bg-white text-black"
              : "border-white/20 bg-black text-white/30",
          ].join(" ")}
        >
          {index < stamps ? "✓" : index + 1}
        </div>
      ))}
    </div>
  );
}

function CustomerCard({
  customer,
  onUpdate,
}: {
  customer: Customer;
  onUpdate: (updated: Customer) => void;
}) {
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionMessage, setActionMessage] = useState("");

  const stamps = customer.loyalty_stamps;
  const hasReward = stamps >= STAMPS_FOR_REWARD;
  const progress = Math.min(stamps, STAMPS_FOR_REWARD);

  async function handleAction(action: "add" | "redeem") {
    setActionState("loading");
    setActionMessage("");

    try {
      const response = await fetch("/api/loyalty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, customerId: customer.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "No se pudo completar la acción.");
      }

      onUpdate({ ...customer, loyalty_stamps: data.customer.loyaltyStamps });
      setActionState("success");
      setActionMessage(
        action === "add" ? "Sello añadido." : "¡Recompensa canjeada!"
      );

      setTimeout(() => {
        setActionState("idle");
        setActionMessage("");
      }, 2500);
    } catch (error) {
      setActionState("error");
      setActionMessage(
        error instanceof Error ? error.message : "Error inesperado."
      );
      setTimeout(() => {
        setActionState("idle");
        setActionMessage("");
      }, 3000);
    }
  }

  const isLoading = actionState === "loading";

  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {customer.full_name}
            </h2>
            {hasReward && (
              <span className="rounded-full border border-emerald-700 bg-emerald-950/40 px-3 py-1 text-xs font-semibold text-emerald-300">
                🎉 Recompensa disponible
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-zinc-400">{customer.phone}</p>
          {customer.notes && (
            <p className="mt-1 text-xs text-zinc-500 italic">{customer.notes}</p>
          )}
        </div>

        <div className="shrink-0 rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-center">
          <p className="text-xs text-zinc-500">Sellos</p>
          <p className="mt-1 text-3xl font-black text-white">
            {progress}
            <span className="text-lg text-zinc-500">/{STAMPS_FOR_REWARD}</span>
          </p>
        </div>
      </div>

      <div className="mt-5">
        <StampsGrid stamps={progress} />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-5">
        <button
          type="button"
          disabled={isLoading || hasReward}
          onClick={() => handleAction("add")}
          className="rounded-full border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/50 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoading ? "Procesando..." : "+ Añadir sello"}
        </button>

        {hasReward && (
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleAction("redeem")}
            className="rounded-full border border-emerald-700 bg-emerald-950/30 px-5 py-2.5 text-sm font-semibold text-emerald-300 transition hover:border-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? "Procesando..." : "Canjear recompensa"}
          </button>
        )}

        {actionMessage && (
          <p
            className={[
              "text-sm font-semibold",
              actionState === "success" ? "text-emerald-400" : "text-red-400",
            ].join(" ")}
          >
            {actionMessage}
          </p>
        )}
      </div>
    </article>
  );
}

export default function PanelFidelidadPage() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchState, setSearchState] = useState<ActionState>("idle");
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (query.trim().length < 2) return;

    setSearchState("loading");
    setSearched(true);

    try {
      const response = await fetch(
        `/api/loyalty/search?q=${encodeURIComponent(query.trim())}`
      );
      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      setCustomers(data.customers ?? []);
      setSearchState("idle");
    } catch {
      setSearchState("error");
      setCustomers([]);
    }
  }, [query]);

  function handleUpdateCustomer(updated: Customer) {
    setCustomers((current) =>
      current.map((c) => (c.id === updated.id ? updated : c))
    );
  }

  const totalStamps = customers.reduce((sum, c) => sum + c.loyalty_stamps, 0);
  const withReward = customers.filter(
    (c) => c.loyalty_stamps >= STAMPS_FOR_REWARD
  ).length;

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <section className="mx-auto flex max-w-6xl flex-col gap-8">

        {/* Cabecera */}
        <div className="flex flex-col gap-5 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-zinc-500">
              Panel privado
            </p>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Fidelidad
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
              Busca un cliente por nombre o teléfono para gestionar sus sellos.
              Si un cliente pierde su tarjeta, búscalo por teléfono y recupera
              su historial al instante.
            </p>
          </div>
          <Link
            href="/panel/inicio"
            className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-semibold text-white transition hover:border-white"
          >
            Volver al panel
          </Link>
        </div>

        {/* Buscador */}
        <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5">
          <p className="mb-3 text-sm font-semibold text-white">
            Buscar cliente
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nombre o teléfono del cliente..."
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
            />
            <button
              type="button"
              onClick={handleSearch}
              disabled={query.trim().length < 2 || searchState === "loading"}
              className="shrink-0 rounded-xl bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.15em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {searchState === "loading" ? "Buscando..." : "Buscar"}
            </button>
          </div>
          <p className="mt-3 text-xs text-zinc-500">
            Escribe al menos 2 caracteres. Busca por nombre o número de
            teléfono. Si hay varios clientes con el mismo nombre, aparecerán
            todos — identifícalos por el teléfono.
          </p>
        </div>

        {/* Resultados */}
        {searched && searchState !== "loading" && (
          <>
            {customers.length > 0 && (
              <div className="flex flex-wrap gap-5">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-5 py-3 text-center">
                  <p className="text-xs text-zinc-500">Clientes encontrados</p>
                  <p className="mt-1 text-2xl font-black text-white">{customers.length}</p>
                </div>
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-5 py-3 text-center">
                  <p className="text-xs text-zinc-500">Sellos totales</p>
                  <p className="mt-1 text-2xl font-black text-white">{totalStamps}</p>
                </div>
                {withReward > 0 && (
                  <div className="rounded-2xl border border-emerald-800 bg-emerald-950/40 px-5 py-3 text-center">
                    <p className="text-xs text-emerald-500">Con recompensa</p>
                    <p className="mt-1 text-2xl font-black text-emerald-300">{withReward}</p>
                  </div>
                )}
              </div>
            )}

            {customers.length === 0 ? (
              <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8">
                <h2 className="text-xl font-semibold text-white">
                  No se encontró ningún cliente
                </h2>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  No hay resultados para{" "}
                  <span className="font-semibold text-white">
                    &quot;{query}&quot;
                  </span>
                  . Prueba con el teléfono completo o solo el apellido.
                </p>
              </div>
            ) : (
              <div className="grid gap-5">
                {customers.map((customer) => (
                  <CustomerCard
                    key={customer.id}
                    customer={customer}
                    onUpdate={handleUpdateCustomer}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Estado inicial — sin búsqueda */}
        {!searched && (
          <div className="rounded-3xl border border-dashed border-zinc-800 bg-black p-8 text-center">
            <h2 className="text-lg font-semibold text-white">
              Introduce un nombre o teléfono para empezar
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-400">
              Cada cliente tiene una tarjeta digital con {STAMPS_FOR_REWARD} sellos.
              Al completarla puede canjear su recompensa.
            </p>
          </div>
        )}

      </section>
    </main>
  );
}