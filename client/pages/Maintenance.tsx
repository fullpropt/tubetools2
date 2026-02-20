import {
  MAINTENANCE_BALANCE_MESSAGE,
  MAINTENANCE_ESTIMATED_RETURN_DAYS,
  MAINTENANCE_MESSAGE,
  MAINTENANCE_TITLE,
} from "@shared/maintenance";
import { Play, ShieldCheck, Wrench } from "lucide-react";

export default function Maintenance() {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-2xl items-center">
        <section className="w-full text-center">
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="rounded-lg bg-red-600 p-3">
              <Play className="h-7 w-7 text-white" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-bold">TubeTools</h2>
              <p className="text-xs text-muted-foreground">
                Discover. Engage. Influence.
              </p>
            </div>
          </div>

          <div className="card-base">
            <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-red-700">
              <Wrench className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em]">
                General Notice
              </span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl">
              {MAINTENANCE_TITLE}
            </h1>

            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              {MAINTENANCE_MESSAGE}
            </p>

            <p className="mt-2 text-sm text-muted-foreground">
              Estimated return: approximately{" "}
              <span className="font-semibold text-foreground">
                {MAINTENANCE_ESTIMATED_RETURN_DAYS} days
              </span>
              .
            </p>

            <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-center justify-center gap-2 text-emerald-700">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-sm font-semibold">
                  Balance and progress preserved
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-emerald-800">
                {MAINTENANCE_BALANCE_MESSAGE}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
