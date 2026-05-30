import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function isAuthenticated() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session")?.value;

  return Boolean(
    process.env.ADMIN_SESSION_TOKEN &&
      session === process.env.ADMIN_SESSION_TOKEN
  );
}

async function loginAction(formData: FormData) {
  "use server";

  const usuario = String(formData.get("usuario") || "").trim();
  const password = String(formData.get("password") || "").trim();

  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;

  if (!adminUser || !adminPassword || !sessionToken) {
    redirect("/panel?error=config");
  }

  if (usuario !== adminUser || password !== adminPassword) {
    redirect("/panel?error=1");
  }

  const cookieStore = await cookies();

  cookieStore.set("admin_session", sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/panel/citas");
}

async function logoutAction() {
  "use server";

  const cookieStore = await cookies();

  cookieStore.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  redirect("/panel");
}

type PanelPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

export default async function PanelPage({ searchParams }: PanelPageProps) {
  const authenticated = await isAuthenticated();
  const params = searchParams ? await searchParams : {};
  const error = params?.error;

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
            Introduce el usuario y la contraseña para gestionar las citas de
            The New Spark.
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
            </p>
          )}

          {error === "config" && (
            <p className="mb-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-300">
              Falta configurar ADMIN_USER, ADMIN_PASSWORD o ADMIN_SESSION_TOKEN
              en .env.local.
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