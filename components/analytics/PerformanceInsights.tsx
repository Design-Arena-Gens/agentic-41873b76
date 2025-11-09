"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import { Marketplace } from "@/lib/types";
import { smartCapitalize } from "@/lib/utils";

type MetricKey = "units" | "gmv" | "returns" | "visits";

interface MetricEntry {
  marketplace: Marketplace;
  date: string;
  units: number;
  gmv: number;
  returns: number;
  visits: number;
}

const MARKETPLACE_ORDER: Marketplace[] = [
  "amazon",
  "flipkart",
  "meesho",
  "myntra"
];

const METRIC_LABELS: Record<MetricKey, string> = {
  units: "Units Sold",
  gmv: "GMV (₹)",
  returns: "Returns",
  visits: "Visits"
};

const EMPTY_ENTRY: MetricEntry = {
  marketplace: "amazon",
  date: new Date().toISOString().slice(0, 10),
  units: 0,
  gmv: 0,
  returns: 0,
  visits: 0
};

export default function PerformanceInsights() {
  const [entries, setEntries] = useState<MetricEntry[]>([]);
  const [draft, setDraft] = useState<MetricEntry>(EMPTY_ENTRY);

  const totals = useMemo(() => {
    return entries.reduce(
      (acc, entry) => {
        acc.units += entry.units;
        acc.gmv += entry.gmv;
        acc.returns += entry.returns;
        acc.visits += entry.visits;
        return acc;
      },
      { units: 0, gmv: 0, returns: 0, visits: 0 }
    );
  }, [entries]);

  const conversionRate = totals.visits
    ? ((totals.units / totals.visits) * 100).toFixed(2)
    : "0.00";

  const handleAddEntry = () => {
    setEntries((prev) => [
      {
        ...draft,
        units: Number.isFinite(draft.units) ? draft.units : 0,
        gmv: Number.isFinite(draft.gmv) ? draft.gmv : 0,
        returns: Number.isFinite(draft.returns) ? draft.returns : 0,
        visits: Number.isFinite(draft.visits) ? draft.visits : 0
      },
      ...prev
    ]);
    setDraft((prev) => ({
      ...EMPTY_ENTRY,
      marketplace: prev.marketplace
    }));
  };

  return (
    <section className="glass-panel rounded-3xl p-6 lg:p-8">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary-100">
            Daily Performance Pulse
          </h2>
          <p className="text-sm text-slate-300">
            Drop in daily numbers from marketplaces and Jarvis will highlight
            momentum, risks, and conversion health.
          </p>
        </div>
        <button
          type="button"
          className="button-primary"
          onClick={handleAddEntry}
        >
          Log Today&apos;s Metrics
        </button>
      </header>

      <div className="mt-6 grid gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 lg:grid-cols-[repeat(5,minmax(0,1fr))]">
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Marketplace</label>
          <select
            value={draft.marketplace}
            onChange={(event) =>
              setDraft((prev) => ({
                ...prev,
                marketplace: event.target.value as Marketplace
              }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
          >
            {MARKETPLACE_ORDER.map((marketplace) => (
              <option key={marketplace} value={marketplace}>
                {smartCapitalize(marketplace)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-slate-400">Date</label>
          <input
            type="date"
            value={draft.date}
            onChange={(event) =>
              setDraft((prev) => ({ ...prev, date: event.target.value }))
            }
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
          />
        </div>
        {(Object.keys(METRIC_LABELS) as MetricKey[]).map((metric) => (
          <div key={metric} className="space-y-2">
            <label className="text-xs text-slate-400">
              {METRIC_LABELS[metric]}
            </label>
            <input
              type="number"
              min={0}
              value={draft[metric]}
              onChange={(event) =>
                setDraft((prev) => ({
                  ...prev,
                  [metric]: Number.parseFloat(event.target.value) || 0
                }))
              }
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-primary-500/40 bg-primary-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-primary-200">
            Units Sold
          </p>
          <p className="mt-2 text-2xl font-semibold text-primary-100">
            {totals.units.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-emerald-200">
            GMV
          </p>
          <p className="mt-2 text-2xl font-semibold text-emerald-100">
            ₹{totals.gmv.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-amber-200">
            Returns
          </p>
          <p className="mt-2 text-2xl font-semibold text-amber-100">
            {totals.returns.toLocaleString()}
          </p>
        </div>
        <div className="rounded-2xl border border-sky-500/40 bg-sky-500/10 p-4">
          <p className="text-xs uppercase tracking-wide text-sky-200">
            Conversion
          </p>
          <p className="mt-2 text-2xl font-semibold text-sky-100">
            {conversionRate}%
          </p>
        </div>
      </div>

      <div className="mt-6 max-h-[24rem] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/40">
        <table className="min-w-full text-left text-xs text-slate-200">
          <thead className="sticky top-0 bg-slate-900/80 text-slate-400">
            <tr>
              <th className="px-4 py-3 font-medium">Marketplace</th>
              <th className="px-4 py-3 font-medium">Date</th>
              {(Object.keys(METRIC_LABELS) as MetricKey[]).map((metric) => (
                <th key={metric} className="px-4 py-3 font-medium">
                  {METRIC_LABELS[metric]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-6 text-center text-slate-500"
                >
                  No metrics logged yet. Add today&apos;s performance numbers to
                  get insights.
                </td>
              </tr>
            ) : (
              entries.map((entry, index) => (
                <tr
                  key={`${entry.marketplace}-${entry.date}-${index}`}
                  className={clsx(
                    "border-t border-slate-800/60",
                    index % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"
                  )}
                >
                  <td className="px-4 py-3">
                    {smartCapitalize(entry.marketplace)}
                  </td>
                  <td className="px-4 py-3">{entry.date}</td>
                  <td className="px-4 py-3">{entry.units.toLocaleString()}</td>
                  <td className="px-4 py-3">₹{entry.gmv.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {entry.returns.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{entry.visits.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
