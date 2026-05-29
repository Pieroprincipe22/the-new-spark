import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin/auth";

type PanelPageProps = {
  searchParams?: Promise<{
    error?: string;
    blocked?: string;
    left?: string;
    wait?: string;
  }>;
};

async function loginAction(formData: FormData) {
  "use server";

  const password = formData.get("password");

  if (typeof password !== "string") {
    redirect("/panel?error=1");
  }

  // Obtener IP del cliente desde los headers del servidor
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headerStore.get("x-real-ip") ??
    "unknown";

  const result = await loginAdmin(password, ip);

  if (result.blocked) {
    redirect(`/panel?blocked=1&wait=${result.remainingSeconds ?? 0}`);
  }

  if (!result.success) {
    const left = result.attemptsLeft ?? 0;
    redirect(`/panel?error=1&left=${left}`);
  }

  redirect("/panel/citas");
}

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const isAuthenticated = await isAdminAuthenticated();

  if (isAuthenticated) {
    redirect("/panel/citas");
  }

  const params = searchParams ? await searchParams : {};
  const hasError = params.error === "1";
  const isBlocked = params.blocked === "1";
  const attemptsLeft = params.left ? parseInt(params.left, 10) : null;
  const waitSeconds = params.wait ? parseInt(params.wait, 10) : null;
  const waitMinutes = waitSeconds ? Math.ceil(waitSeconds / 60) : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 shadow-2xl shadow-black/50">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
            Panel privado
          </p>

          <h1 className="text-3xl font-black tracking-tight">
            Acceso al panel
          </h1>

          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Introduce la contraseña para gestionar las citas de The New Spark.
          </p>
        </div>

        <form action={loginAction} className="grid gap-5">
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-bold text-white"
            >
              Contraseña
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={isBlocked}
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white disabled:cursor-not-allowed disabled:opacity-40"
              placeholder="Escribe la contraseña"
            />
          </div>

          {/* Bloqueado por demasiados intentos */}
          {isBlocked && (
            <div className="rounded-xl border border-orange-900 bg-orange-950/40 px-4 py-3 text-sm font-semibold text-orange-300">
              Acceso bloqueado por demasiados intentos.
              {waitMinutes && (
                <span> Espera {waitMinutes} minuto{waitMinutes !== 1 ? "s" : ""} e inténtalo de nuevo.</span>
              )}
            </div>
          )}

          {/* Contraseña incorrecta con intentos restantes */}
          {hasError && !isBlocked && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-300">
              Contraseña incorrecta.
              {attemptsLeft !== null && attemptsLeft > 0 && (
                <span> Te {attemptsLeft === 1 ? "queda" : "quedan"} {attemptsLeft} intento{attemptsLeft !== 1 ? "s" : ""}.</span>
              )}
              {attemptsLeft === 0 && (
                <span> Siguiente intento fallido bloqueará el acceso 15 minutos.</span>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isBlocked}
            className="rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200 disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}