import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonProps = {
  href?: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
}: ButtonProps) {
  const styles = cn(
    "inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold transition",
    variant === "primary" && "bg-amber-400 text-black hover:bg-amber-300",
    variant === "secondary" &&
      "border border-amber-400/60 text-white hover:bg-amber-400/10",
    className,
  );

  if (href) {
    return (
      <Link href={href} className={styles}>
        {children}
      </Link>
    );
  }

  return <button className={styles}>{children}</button>;
}