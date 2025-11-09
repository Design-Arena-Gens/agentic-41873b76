"use client";

import { FormEvent, useMemo, useState } from "react";
import clsx from "clsx";
import { useAgentStore } from "@/lib/state/agentStore";
import { AgentTask, Marketplace, TaskStatus } from "@/lib/types";
import { smartCapitalize } from "@/lib/utils";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  blocked: "Blocked",
  completed: "Completed"
};

const MARKETPLACE_OPTIONS: { value: Marketplace; label: string }[] = [
  { value: "generic", label: "General" },
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "meesho", label: "Meesho" },
  { value: "myntra", label: "Myntra" }
];

export default function TaskWorkspace() {
  const { tasks, addTask, updateTaskStatus } = useAgentStore();
  const [filterMarketplace, setFilterMarketplace] = useState<Marketplace>("generic");
  const [newTask, setNewTask] = useState({
    title: "",
    marketplace: "generic" as Marketplace,
    priority: "medium" as AgentTask["priority"]
  });

  const filteredTasks = useMemo(() => {
    if (filterMarketplace === "generic") return tasks;
    return tasks.filter((task) => task.marketplace === filterMarketplace);
  }, [tasks, filterMarketplace]);

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce(
      (acc, task) => {
        acc[task.status].push(task);
        return acc;
      },
      {
        pending: [] as AgentTask[],
        in_progress: [] as AgentTask[],
        blocked: [] as AgentTask[],
        completed: [] as AgentTask[]
      }
    );
  }, [filteredTasks]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!newTask.title.trim()) return;
    addTask({
      title: smartCapitalize(newTask.title.trim()),
      marketplace: newTask.marketplace,
      status: "pending",
      priority: newTask.priority
    });
    setNewTask({
      title: "",
      marketplace: newTask.marketplace,
      priority: newTask.priority
    });
  };

  const totalPending = groupedTasks.pending.length + groupedTasks.in_progress.length;

  return (
    <section className="glass-panel rounded-3xl p-6 lg:p-8">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-primary-100">
            Marketplace Mission Board
          </h2>
          <p className="text-sm text-slate-300">
            Track every listing, optimization, and support task in one view.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-wide text-slate-400">
            Focus
          </label>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            value={filterMarketplace}
            onChange={(event) => setFilterMarketplace(event.target.value as Marketplace)}
          >
            <option value="generic">All Marketplaces</option>
            {MARKETPLACE_OPTIONS.filter((option) => option.value !== "generic").map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="flex flex-col text-right text-xs text-slate-400">
            <span>{tasks.length} Total Tasks</span>
            <span>{totalPending} Active</span>
          </div>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-6 grid gap-3 rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4 lg:grid-cols-[1.6fr,1fr,auto]"
      >
        <input
          type="text"
          className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
          placeholder="e.g. Optimise bullet points for festive kurti listing"
          value={newTask.title}
          onChange={(event) =>
            setNewTask((prev) => ({ ...prev, title: event.target.value }))
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            value={newTask.marketplace}
            onChange={(event) =>
              setNewTask((prev) => ({
                ...prev,
                marketplace: event.target.value as Marketplace
              }))
            }
          >
            {MARKETPLACE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-300"
            value={newTask.priority}
            onChange={(event) =>
              setNewTask((prev) => ({
                ...prev,
                priority: event.target.value as AgentTask["priority"]
              }))
            }
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <button type="submit" className="button-primary">
          Add Task
        </button>
      </form>

      <div className="mt-8 grid gap-4 lg:grid-cols-4">
        {(
          Object.keys(STATUS_LABELS) as TaskStatus[]
        ).map((status) => {
          const items = groupedTasks[status];
          return (
            <div
              key={status}
              className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-4"
            >
              <header className="flex items-center justify-between text-sm font-semibold text-slate-200">
                <span>{STATUS_LABELS[status]}</span>
                <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-400">
                  {items.length}
                </span>
              </header>
              <div className="mt-3 space-y-3">
                {items.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No tasks in this stage.
                  </p>
                )}
                {items.map((task) => (
                  <article
                    key={task.id}
                    className={clsx(
                      "rounded-xl border px-3 py-3 text-sm shadow",
                      {
                        "border-primary-500/40 bg-primary-500/10":
                          task.priority === "high",
                        "border-emerald-500/40 bg-emerald-500/10":
                          task.priority === "medium",
                        "border-slate-700/60 bg-slate-800/40":
                          task.priority === "low"
                      }
                    )}
                  >
                    <h4 className="text-slate-100">{task.title}</h4>
                    <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
                      <span className="rounded-full bg-slate-900 px-2 py-1">
                        {smartCapitalize(task.marketplace)}
                      </span>
                      {task.dueDate && (
                        <span className="text-slate-500">
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {(Object.keys(STATUS_LABELS) as TaskStatus[]).map(
                        (targetStatus) => (
                          <button
                            key={targetStatus}
                            type="button"
                            className={clsx(
                              "rounded-full border px-2 py-1 transition",
                              targetStatus === task.status
                                ? "border-primary-400 bg-primary-500/20 text-primary-100"
                                : "border-slate-700 text-slate-400 hover:border-primary-400 hover:text-primary-100"
                            )}
                            onClick={() => updateTaskStatus(task.id, targetStatus)}
                          >
                            {STATUS_LABELS[targetStatus]}
                          </button>
                        )
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
