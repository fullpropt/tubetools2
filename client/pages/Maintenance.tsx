import {
  MAINTENANCE_BALANCE_MESSAGE,
  MAINTENANCE_ESTIMATED_RETURN_DAYS,
  MAINTENANCE_MESSAGE,
  MAINTENANCE_TITLE,
} from "@shared/maintenance";
import { ShieldCheck, Wrench } from "lucide-react";

export default function Maintenance() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-3xl items-center px-6 py-12">
        <section className="w-full rounded-2xl border border-slate-700/60 bg-slate-900/80 p-8 shadow-xl backdrop-blur">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-amber-100">
            <Wrench className="h-4 w-4" />
            <span className="text-xs font-semibold uppercase tracking-[0.14em]">
              General Notice
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-extrabold tracking-tight md:text-4xl">
            {MAINTENANCE_TITLE}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-200">
            {MAINTENANCE_MESSAGE}
          </p>

          <p className="mt-2 text-sm text-slate-300">
            Estimated return: approximately{" "}
            <span className="font-semibold text-white">
              {MAINTENANCE_ESTIMATED_RETURN_DAYS} days
            </span>
            .
          </p>

          <div className="mt-6 rounded-xl border border-emerald-300/30 bg-emerald-500/10 p-4">
            <div className="flex items-center gap-2 text-emerald-100">
              <ShieldCheck className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Balance and progress preserved
              </span>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-emerald-50">
              {MAINTENANCE_BALANCE_MESSAGE}
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
