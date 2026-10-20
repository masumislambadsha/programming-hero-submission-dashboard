import Link from "next/link";
import { Logo } from "@/components/navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Shared frame for /login and /signup — starfield background, PH branding,
 * and a glowing card. Client component so the forms inside can be interactive.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <main className="starfield relative grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-3">
          <Logo size="lg" />
          <span className="font-heading text-xl font-semibold text-foreground">
            Programming <span className="text-primary">Hero</span>
          </span>
        </Link>

        <Card className="border-border/70 bg-card/80 backdrop-blur-sm glow-sm">
          <CardHeader className="space-y-1.5 pb-2 text-center">
            <CardTitle className="font-heading text-2xl">{title}</CardTitle>
            <CardDescription className="text-muted-foreground">{subtitle}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>

        <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
      </div>
    </main>
  );
}
