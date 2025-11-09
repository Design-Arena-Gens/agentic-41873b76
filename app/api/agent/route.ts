"use server";

import { NextRequest, NextResponse } from "next/server";
import { AgentResponse, Marketplace, AgentTask } from "@/lib/types";
import { nanoid, smartCapitalize } from "@/lib/utils";

function detectMarketplace(text: string): Marketplace {
  const lower = text.toLowerCase();
  if (lower.includes("amazon") || lower.includes("asin")) return "amazon";
  if (lower.includes("flipkart")) return "flipkart";
  if (lower.includes("meesho")) return "meesho";
  if (lower.includes("myntra")) return "myntra";
  return "generic";
}

function extractDueDate(prompt: string): string | undefined {
  const lower = prompt.toLowerCase();
  if (lower.includes("today")) return new Date().toISOString();
  if (lower.includes("tomorrow")) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    return date.toISOString();
  }
  const dayMatch = lower.match(/in (\d{1,2}) days/);
  if (dayMatch) {
    const days = Number.parseInt(dayMatch[1] ?? "0", 10);
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }
  return undefined;
}

function parseTasks(prompt: string): AgentTask[] {
  const lower = prompt.toLowerCase();
  const marketplace = detectMarketplace(lower);
  const tasks: AgentTask[] = [];

  const commands = lower
    .split(/(?:and|then|,|\n)/g)
    .map((command) => command.trim())
    .filter(Boolean);

  commands.forEach((command) => {
    if (
      command.includes("list") ||
      command.includes("upload") ||
      command.includes("add") ||
      command.includes("create")
    ) {
      const productMatch = command.match(
        /(list|upload|add|create)\s+(a|an|the)?\s*(?<product>.+?)(?:\s+on\s+(?<platform>[a-z]+))?$/
      );
      const product = smartCapitalize(
        productMatch?.groups?.product?.replace(/on\s+(amazon|flipkart|meesho|myntra).*/, "")?.trim() ??
          "Product Listing"
      );
      const platform =
        (productMatch?.groups?.platform as Marketplace | undefined) ??
        marketplace;

      tasks.push({
        id: nanoid(),
        title: `Prepare listing for ${product}`,
        marketplace: platform,
        status: "pending",
        priority: lower.includes("urgent") ? "high" : "medium",
        dueDate: extractDueDate(prompt)
      });
    }
  });

  if (tasks.length === 0) {
    tasks.push({
      id: nanoid(),
      title: smartCapitalize(prompt),
      marketplace,
      status: "pending",
      priority: "medium",
      dueDate: extractDueDate(prompt)
    });
  }

  return tasks;
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, context } = await request.json();
    const lower = `${prompt ?? ""}`.toLowerCase();

    if (!prompt) {
      return NextResponse.json(
        {
          type: "error",
          message: "I need a command to get started."
        } satisfies AgentResponse,
        { status: 400 }
      );
    }

    if (
      lower.includes("task") ||
      lower.includes("to-do") ||
      lower.includes("listing") ||
      lower.includes("list the product")
    ) {
      const tasks = parseTasks(prompt);
      const response: AgentResponse = {
        type: "task",
        message: `I've prepared ${tasks.length} task${
          tasks.length > 1 ? "s" : ""
        } for you. Check the board to review and track progress.`,
        summary: tasks.map((task) => task.title).join("; "),
        payload: { tasks }
      };
      return NextResponse.json(response);
    }

    if (
      lower.includes("catalog") ||
      lower.includes("sheet") ||
      lower.includes("template")
    ) {
      const response: AgentResponse = {
        type: "catalog",
        message:
          "Upload the marketplace template and your product data. I'll align columns automatically and give you a downloadable sheet.",
        payload: {
          expectation: "catalog_preparation",
          incomingContext: context ?? null
        }
      };
      return NextResponse.json(response);
    }

    if (
      lower.includes("performance") ||
      lower.includes("summary") ||
      lower.includes("report")
    ) {
      const response: AgentResponse = {
        type: "analytics",
        message:
          "I'm ready to analyse performance once you provide daily sales or traffic data. Upload a CSV and I'll surface trends for you.",
        payload: {
          expectation: "analytics",
          metrics: ["units_sold", "gmv", "returns", "conversion_rate"]
        }
      };
      return NextResponse.json(response);
    }

    const response: AgentResponse = {
      type: "general",
      message:
        "I'm listening. You can ask me to set up marketplace tasks, prepare catalog sheets, or brief you on store performance.",
      payload: {}
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Unexpected error while processing your command."
      } satisfies AgentResponse,
      { status: 500 }
    );
  }
}
