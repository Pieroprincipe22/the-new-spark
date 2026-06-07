const floatingActions = [
  {
    label: "Reservar",
    href: "#reservas",
    variant: "primary",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/nthenewspark?igsh=NzZwdGNrY3c3aXV5",
    variant: "secondary",
  },
  {
    label: "Acceso privado",
    href: "/admin",
    variant: "private",
  },
] as const;

export function FloatingActions() {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {floatingActions.map((action) => {
        const isExternal = action.href.startsWith("http");

        return (
          <a
            key={action.href}
            href={action.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className={
              action.variant === "primary"
                ? "inline-flex items-center justify-center rounded-full bg-amber-400 px-5 py-3 text-sm font-black text-neutral-950 shadow-2xl shadow-black/40 transition hover:-translate-y-0.5 hover:bg-amber-300"
                : action.variant === "secondary"
                  ? "inline-flex items-center justify-center rounded-full border border-white/15 bg-neutral-950/90 px-5 py-3 text-sm font-bold text-white shadow-2xl shadow-black/40 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-400/60 hover:text-amber-300"
                  : "inline-flex items-center justify-center rounded-full border border-neutral-700 bg-black/80 px-4 py-2 text-xs font-semibold text-neutral-400 shadow-2xl shadow-black/40 backdrop-blur transition hover:-translate-y-0.5 hover:border-amber-400/50 hover:text-amber-300"
            }
          >
            {action.label}
          </a>
        );
      })}
    </div>
  );
}

export default FloatingActions;