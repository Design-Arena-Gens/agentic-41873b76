"use client";

import VoiceAgentConsole from "@/components/voice/VoiceAgentConsole";
import CatalogAutomationPanel from "@/components/catalog/CatalogAutomationPanel";
import TaskWorkspace from "@/components/tasks/TaskWorkspace";
import PerformanceInsights from "@/components/analytics/PerformanceInsights";

export default function HomePage() {
  return (
    <div className="space-y-8 pb-12">
      <section className="glass-panel overflow-hidden rounded-3xl p-8">
        <div className="grid gap-8 lg:grid-cols-[1.4fr,1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-100">
              Jarvis Commerce AI
            </div>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-slate-50 lg:text-5xl">
              Voice-first marketplace copilot for Amazon, Flipkart, Meesho, and
              Myntra sellers.
            </h1>
            <p className="mt-4 text-sm text-slate-300 lg:text-base">
              Delegate catalog prep, daily task planning, and performance pulse
              checks to Jarvis. Upload your product sheets, speak out the plan,
              and download channel-ready listings in minutes.
            </p>
            <div className="mt-6 flex flex-wrap gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
                Auto-align catalog columns
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
                Voice-driven task builder
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-900/60 px-3 py-1">
                Daily performance insights
              </span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 -translate-y-4 translate-x-4 rounded-full bg-primary-500/30 blur-3xl" />
            <div className="relative rounded-3xl border border-primary-500/40 bg-slate-900/60 p-6 shadow-2xl shadow-primary-900/40">
              <div className="text-xs uppercase tracking-wide text-primary-200">
                Quick Tip
              </div>
              <p className="mt-2 text-sm text-slate-200">
                Start with “Jarvis, prepare Amazon sheet for the festive
                kurtis.” Upload the Amazon template and your raw product data –
                you&apos;ll instantly get a ready-to-upload CSV.
              </p>
              <div className="mt-4 grid gap-3 text-xs text-slate-300">
                <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
                  <span className="text-primary-200">Voice Command</span>
                  <p className="mt-1">
                    “Plan my Amazon listings for winter jackets and sync stock
                    on Flipkart.”
                  </p>
                </div>
                <div className="rounded-xl border border-slate-700/60 bg-slate-900/40 p-3">
                  <span className="text-primary-200">Jarvis Response</span>
                  <p className="mt-1">
                    “Added tasks for Amazon winter jackets &amp; Flipkart stock
                    sync. Upload catalog sheets when ready.”
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <VoiceAgentConsole />
      <CatalogAutomationPanel />
      <TaskWorkspace />
      <PerformanceInsights />
    </div>
  );
}
