import { redirect } from "next/navigation";
import { isAdminAuthenticated, loginAdmin } from "@/lib/admin/auth";

type AdminPageProps = {
  searchParams?: Promise<{
    error?: string;
  }>;
};

async function loginAction(formData: FormData) {
  "use server";

  const password = formData.get("password");

  if (typeof password !== "string") {
    redirect("/admin?error=1");
  }

  const loggedIn = await loginAdmin(password);

  if (!loggedIn) {
    redirect("/admin?error=1");
  }

  redirect("/admin/citas");
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const isAuthenticated = await isAdminAuthenticated();

  if (isAuthenticated) {
    redirect("/admin/citas");
  }

  const params = searchParams ? await searchParams : {};
  const hasError = params.error === "1";

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 py-16 text-white">
      <section className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-950/70 p-8 shadow-2xl shadow-black/50">
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-zinc-500">
            Panel privado
          </p>

          <h1 className="text-3xl font-black tracking-tight">
            Acceso admin
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
              className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-white"
              placeholder="Escribe la contraseña"
            />
          </div>

          {hasError && (
            <div className="rounded-xl border border-red-900 bg-red-950/40 px-4 py-3 text-sm font-semibold text-red-300">
              Contraseña incorrecta. Inténtalo de nuevo.
            </div>
          )}

          <button
            type="submit"
            className="rounded-xl bg-white px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-black transition hover:bg-zinc-200"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}