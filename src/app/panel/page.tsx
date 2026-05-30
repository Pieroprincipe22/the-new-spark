import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  isAdminAuthenticated,
  loginAdmin,
  logoutAdmin,
} from "@/lib/admin/auth";

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
    redirect("/panel/citas");
  }

  if (result.blocked) {
    redirect(`/panel?error=blocked&seconds=${result.remainingSeconds ?? 0}`);
  }

  redirect(`/panel?error=1&attempts=${result.attemptsLeft ?? 0}`);
}

async function logoutAction() {
  "use server";

  await logoutAdmin();
  redirect("/panel");
}

type PanelPageProps = {
  searchParams?: Promise<{
    error?: string;
    attempts?: string;
    seconds?: string;
  }>;
};

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const authenticated = await isAdminAuthenticated();
  const params = searchParams ? await searchParams : {};
  const error = params?.error;
  const attemptsLeft = Number(params?.attempts ?? 0);
  const blockSeconds = Number(params?.seconds ?? 0);

  if (authenticated) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <section className="mx-auto max-w-5xl">
          <div className="mb-10 flex flex-col gap-5 border-b border-white/15 pb-8 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.4em] text-white/50">
                Panel privado
              </p>

              <h1 className="text-4xl font-black uppercase md:text-5xl">
                Administración
              </h1>

              <p className="mt-4 max-w-2xl text-white/65">
                Gestiona las citas, revisa reservas y administra el contenido
                interno de The New Spark.
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-xl border border-white/20 px-5 py-3 text-sm font-bold uppercase tracking-[0.18em] text-white transition hover:bg-white hover:text-black"
              >
                Cerrar sesión
              </button>
            </form>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Link
              href="/panel/citas"
              className="block rounded-2xl border border-white/15 bg-white/3 p-6 transition hover:border-white/40 hover:bg-white/6"
            >
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/45">
                Reservas
              </p>

              <h2 className="mb-3 text-2xl font-black uppercase">
                Gestionar citas
              </h2>

              <p className="text-sm leading-6 text-white/60">
                Consulta, revisa y organiza las citas recibidas desde la web.
              </p>
            </Link>

            <div className="rounded-2xl border border-white/10 bg-white/2 p-6 opacity-70">
              <p className="mb-3 text-xs uppercase tracking-[0.35em] text-white/45">
                Próximamente
              </p>

              <h2 className="mb-3 text-2xl font-black uppercase">
                Clientes y fidelidad
              </h2>

              <p className="text-sm leading-6 text-white/60">
                Aquí podremos gestionar clientes, teléfonos y sellos de
                fidelidad digital.
              </p>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <section className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center">
        <form
          action={loginAction}
          className="w-full rounded-3xl border border-white/15 bg-white/3 p-8 shadow-2xl"
        >
          <p className="mb-4 text-center text-xs uppercase tracking-[0.45em] text-white/50">
            Panel privado
          </p>

          <h1 className="mb-4 text-center text-3xl font-black uppercase">
            Acceso al panel
          </h1>

          <p className="mb-8 text-center text-sm leading-6 text-white/60">
            Introduce el usuario y la contraseña para gestionar las citas de The
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
              defaultValue="Nick"
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
              Falta configurar ADMIN_USER o ADMIN_PASSWORD en .env.local.
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