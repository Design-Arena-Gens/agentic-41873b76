"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  autoGenerateMapping,
  buildCatalogPreview,
  ColumnMapping,
  downloadCatalog,
  parseCatalogTemplate,
  parseDatasetFile
} from "@/lib/catalog";
import { CatalogDataset, CatalogPreview, CatalogTemplate } from "@/lib/types";
import { smartCapitalize } from "@/lib/utils";

const MARKETPLACE_TAGS: Record<string, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  meesho: "Meesho",
  myntra: "Myntra",
  generic: "Universal"
};

export default function CatalogAutomationPanel() {
  const [template, setTemplate] = useState<CatalogTemplate | null>(null);
  const [dataset, setDataset] = useState<CatalogDataset | null>(null);
  const [preview, setPreview] = useState<CatalogPreview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [marketplace, setMarketplace] = useState<string>("generic");
  const [status, setStatus] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const datasetKeys = useMemo(() => {
    if (!dataset?.records?.length) return [];
    const firstRecord = dataset.records[0];
    return Object.keys(firstRecord);
  }, [dataset]);

  const canGenerate = Boolean(template && dataset && datasetKeys.length > 0);

  const regeneratePreview = (nextMapping?: ColumnMapping) => {
    if (!template || !dataset) return;
    setIsBusy(true);
    const effectiveMapping =
      nextMapping && Object.keys(nextMapping).length > 0
        ? nextMapping
        : mapping && Object.keys(mapping).length > 0
        ? mapping
        : undefined;
    const result = buildCatalogPreview(template, dataset, effectiveMapping);
    if (!effectiveMapping) {
      setMapping(result.mapping);
    }
    setPreview(result.preview);
    setMarketplace(result.marketplace);
    setStatus(
      `Detected ${MARKETPLACE_TAGS[result.marketplace] ?? "marketplace"} template with ${result.preview.rows.length} prepared rows.`
    );
    setIsBusy(false);
  };

  useEffect(() => {
    if (template && dataset) {
      regeneratePreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template, dataset]);

  const handleTemplateUpload = async (file: File | null) => {
    if (!file) return;
    setIsBusy(true);
    try {
      const parsedTemplate = await parseCatalogTemplate(file);
      setTemplate(parsedTemplate);
      setStatus(`Template loaded with ${parsedTemplate.headers.length} columns.`);
    } catch (error) {
      console.error(error);
      setStatus("Unable to parse template. Ensure it is a CSV file.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleDatasetUpload = async (file: File | null) => {
    if (!file) return;
    setIsBusy(true);
    try {
      const parsedDataset = await parseDatasetFile(file);
      setDataset(parsedDataset);
      const autoMapping = template
        ? autoGenerateMapping(template.headers, parsedDataset.records)
        : {};
      if (autoMapping && Object.keys(autoMapping).length > 0) {
        setMapping(autoMapping);
      }
      setStatus(
        `Dataset recognised with ${parsedDataset.records.length} products.`
      );
    } catch (error) {
      console.error(error);
      setStatus("Unable to parse dataset. Upload a structured CSV file.");
    } finally {
      setIsBusy(false);
    }
  };

  const handleMappingChange = (header: string, key: string) => {
    const nextMapping: ColumnMapping = {
      ...mapping,
      [header]: key === "unassigned" ? null : key
    };
    setMapping(nextMapping);
    regeneratePreview(nextMapping);
  };

  const download = () => {
    if (!preview) return;
    const filename = `${marketplace.toLowerCase()}-catalog-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    downloadCatalog(preview, filename);
    setStatus("Catalog exported successfully.");
  };

  return (
    <section className="glass-panel rounded-3xl p-6 lg:p-8">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary-100">
            Catalog Automation Studio
          </h2>
          <p className="text-sm text-slate-300">
            Drop your marketplace template alongside your raw product sheet and
            Jarvis will align fields instantly.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="button-secondary cursor-pointer">
            Upload Template
            <input
              type="file"
              accept=".csv"
              onChange={(event) =>
                handleTemplateUpload(event.target.files?.[0] ?? null)
              }
              className="hidden"
            />
          </label>
          <label className="button-secondary cursor-pointer">
            Upload Data
            <input
              type="file"
              accept=".csv"
              onChange={(event) =>
                handleDatasetUpload(event.target.files?.[0] ?? null)
              }
              className="hidden"
            />
          </label>
          <button
            className="button-primary"
            type="button"
            onClick={download}
            disabled={!preview}
          >
            Download CSV
          </button>
        </div>
      </header>

      {status && (
        <div className="mt-4 rounded-2xl border border-primary-500/30 bg-primary-500/10 p-4 text-sm text-primary-100">
          {status}
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr,1fr]">
        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Column Mapping
          </h3>
          <p className="text-xs text-slate-400">
            Jarvis guesses the closest data source for every marketplace column.
            Adjust manually if you need to override the pairing.
          </p>
          <div className="mt-4 max-h-[24rem] overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/40">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead className="sticky top-0 bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Template Column</th>
                  <th className="px-4 py-3 font-medium">Source Field</th>
                </tr>
              </thead>
              <tbody>
                {template?.headers.map((header) => (
                  <tr
                    key={header}
                    className="border-t border-slate-800/60 hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-slate-100">{header}</td>
                    <td className="px-4 py-3">
                      <select
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
                        value={mapping[header] ?? "unassigned"}
                        onChange={(event) =>
                          handleMappingChange(header, event.target.value)
                        }
                        disabled={!datasetKeys.length}
                      >
                        <option value="unassigned">— Unassigned —</option>
                        {datasetKeys.map((key) => (
                          <option key={key} value={key}>
                            {smartCapitalize(key)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )) ?? (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-6 text-center text-slate-500"
                    >
                      Upload a marketplace template to start mapping.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-slate-100">
            Preview{" "}
            {marketplace && (
              <span className="ml-2 rounded-full bg-primary-500/20 px-2 py-1 text-xs text-primary-100">
                {MARKETPLACE_TAGS[marketplace] ?? "Marketplace"}
              </span>
            )}
          </h3>
          <p className="text-xs text-slate-400">
            Review the first few rows. The final export will include every
            product from your dataset.
          </p>
          <div className="mt-4 max-h-[24rem] overflow-x-auto overflow-y-auto rounded-2xl border border-slate-700/60 bg-slate-900/40">
            <table className="min-w-full text-left text-xs text-slate-200">
              <thead className="sticky top-0 bg-slate-900/80 text-slate-400">
                <tr>
                  {preview?.headers.map((header) => (
                    <th key={header} className="px-4 py-3 font-medium">
                      {header}
                    </th>
                  )) ?? (
                    <th className="px-4 py-3 text-center font-medium">
                      Upload template and dataset to see the preview.
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {preview?.rows.slice(0, 6).map((row, index) => (
                  <tr
                    key={`${index}-${row[0] ?? "row"}`}
                    className={clsx(
                      "border-t border-slate-800/60",
                      index % 2 === 0 ? "bg-slate-900/40" : "bg-slate-900/20"
                    )}
                  >
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        {cell || <span className="text-slate-600">—</span>}
                      </td>
                    ))}
                  </tr>
                )) ?? (
                  <tr>
                    <td className="px-4 py-6 text-center text-slate-500">
                      Preview will appear here.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            className="button-secondary mt-4"
            disabled={!canGenerate || isBusy}
            onClick={() => regeneratePreview(mapping)}
          >
            {isBusy ? "Aligning..." : "Re-align Mapping"}
          </button>
        </div>
      </div>
    </section>
  );
}
