import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { loginAdmin } from "@/lib/admin/auth";

function getClientIp(headerList: Headers) {
  const forwardedFor = headerList.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return (
    headerList.get("x-real-ip") ||
    headerList.get("cf-connecting-ip") ||
    "unknown"
  );
}

async function loginAction(formData: FormData) {
  "use server";

  const usuario = String(formData.get("usuario") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const headerList = await headers();
  const ip = getClientIp(headerList);

  let result: Awaited<ReturnType<typeof loginAdmin>>;

  try {
    result = await loginAdmin(usuario, password, ip);
  } catch {
    redirect("/panel?error=config");
  }

  if (result.success) {
    redirect("/panel/inicio");
  }

  if (result.blocked) {
    redirect(`/panel?error=blocked&seconds=${result.remainingSeconds ?? 0}`);
  }

  redirect(`/panel?error=1&attempts=${result.attemptsLeft ?? 0}`);
}

type PanelPageProps = {
  searchParams?: Promise<{
    error?: string;
    attempts?: string;
    seconds?: string;
  }>;
};

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = params?.error;
  const attemptsLeft = Number(params?.attempts ?? 0);
  const blockSeconds = Number(params?.seconds ?? 0);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
        <form
          action={loginAction}
          className="w-full rounded-3xl border border-white/15 bg-white/3 p-8 shadow-2xl"
        >
          <p className="mb-4 text-center text-xs uppercase tracking-[0.45em] text-white/50">
            Acceso privado
          </p>

          <h1 className="mb-4 text-center text-3xl font-black uppercase">
            Iniciar sesión
          </h1>

          <p className="mb-8 text-center text-sm leading-6 text-white/60">
            Introduce tus datos de acceso para entrar al panel interno de The
            New Spark.
          </p>

          <div className="mb-5">
            <label
              htmlFor="usuario"
              className="mb-2 block text-sm font-bold text-white"
            >
              Usuario
            </label>

            <input
              id="usuario"
              name="usuario"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-white/50"
            />
          </div>

          <div className="mb-6">
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
              required
              autoComplete="current-password"
              className="w-full rounded-xl border border-white/15 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-white/50"
            />
          </div>

          {error === "1" && (
            <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              Usuario o contraseña incorrectos.
              {attemptsLeft > 0
                ? ` Te quedan ${attemptsLeft} intentos antes del bloqueo temporal.`
                : ""}
            </p>
          )}

          {error === "blocked" && (
            <p className="mb-5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-200">
              Demasiados intentos fallidos. Vuelve a intentarlo en
              aproximadamente {Math.max(1, Math.ceil(blockSeconds / 60))} min.
            </p>
          )}

          {error === "config" && (
            <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              Falta configurar ADMIN_USER, ADMIN_PASSWORD_HASH o
              ADMIN_SESSION_SECRET en .env.local.
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-5 py-3 font-black uppercase tracking-[0.35em] text-black transition hover:bg-white/90"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}