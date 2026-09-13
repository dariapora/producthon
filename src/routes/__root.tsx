import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Home, RefreshCw, TriangleAlert } from "lucide-react";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { TopNav } from "@/components/layout/TopNav";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <TriangleAlert className="mx-auto size-16 text-risk-yel" aria-hidden />
        <h1 className="mt-4 text-[30px] font-bold text-foreground">Pagina nu a fost găsită</h1>
        <p className="mt-2 text-base text-muted-foreground">
          Adresa nu mai este disponibilă. Poți reveni la pagina principală.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-primary px-6 py-3 text-[17px] font-semibold text-primary-foreground"
          >
            <Home aria-hidden /> Acasă
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          Pagina nu s-a încărcat
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A apărut o problemă. Încearcă din nou sau revino acasă.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md bg-primary px-6 py-3 text-[17px] font-semibold text-primary-foreground"
          >
            <RefreshCw aria-hidden /> Încearcă din nou
          </button>
          <a
            href="/"
            className="inline-flex min-h-14 items-center justify-center gap-3 rounded-md border-2 border-input bg-background px-6 py-3 text-[17px] font-semibold text-foreground"
          >
            <Home aria-hidden /> Acasă
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "EDUconnect | Evaluarea Națională" },
      {
        name: "description",
        content:
          "Performanța la Evaluarea Națională pe județe și școli, cu parteneri ONG din apropiere.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),

  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const isHome = useRouterState({ select: (state) => state.location.pathname === "/" });

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-paper font-body text-ink antialiased">
        {isHome ? null : <TopNav />}
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        {isHome ? (
          <div className="flex flex-1 flex-col">
            <Outlet />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
    </QueryClientProvider>
  );
}
