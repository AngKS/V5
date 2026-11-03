// Small adapter for the experimental document.modelContext API. No polyfill or
// private data is installed into browsers which do not support it.
type Tool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (
    args: Record<string, unknown>,
    context?: { signal?: AbortSignal },
  ) => Promise<unknown>;
};
export type PortfolioModelContext = {
  registerTool: (
    tool: Tool,
    options: { signal: AbortSignal },
  ) => Promise<unknown> | unknown;
};
const emptySchema = {
  type: "object",
  properties: {},
  additionalProperties: false,
};

export function portfolioTools(fetcher: typeof fetch = fetch): Tool[] {
  const read = async (url: string, signal?: AbortSignal) => {
    try {
      const response = await fetcher(url, {
        signal: signal
          ? AbortSignal.any([signal, AbortSignal.timeout(15000)])
          : AbortSignal.timeout(15000),
        credentials: "omit",
      });
      if (!response.ok)
        return {
          error:
            "Portfolio data is temporarily unavailable. Retry later or consult the public website.",
          status: response.status,
        };
      return await response.json();
    } catch {
      return {
        error: signal?.aborted
          ? "Request cancelled."
          : "Could not load portfolio data. Retry later.",
      };
    }
  };
  const resources = [
    [
      "profile",
      "Read Kah Shin Ang’s owner-supplied public biography and interests.",
    ],
    [
      "experience",
      "Read verified experience entries, availability status, and the LinkedIn source link. Missing roles are not inferred.",
    ],
    [
      "education",
      "Read LinkedIn-sourced education, study dates, activities and snapshot date. Future completion dates are not awarded qualifications.",
    ],
    [
      "contact",
      "Read public email, LinkedIn, GitHub and resume links. Does not send messages or retrieve resume contents.",
    ],
    [
      "writing",
      "Read available public article titles and links from the configured Medium feed, or its availability status.",
    ],
  ];
  return [
    ...resources.map(([resource, description]): Tool => ({
      name: `get_portfolio_${resource}`,
      description,
      inputSchema: emptySchema,
      annotations: {
        readOnlyHint: true,
        untrustedContentHint: resource === "writing",
      },
      execute: (args, context) => {
        if (!args || typeof args !== "object" || Object.keys(args).length)
          return Promise.resolve({
            error: "This tool accepts an empty object only.",
          });
        return read(`/api/agent?resource=${resource}`, context?.signal);
      },
    })),
    {
      name: "list_portfolio_projects",
      description:
        "Read public GitHub repositories ranked by stars then latest commit, three per page. Returns total, page, items and date fallback indicators. No private repositories are exposed.",
      inputSchema: {
        type: "object",
        properties: {
          page: {
            type: "integer",
            minimum: 0,
            maximum: 2000,
            description: "Zero-based page number; defaults to 0.",
          },
        },
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: (args, context) => {
        if (
          !args ||
          typeof args !== "object" ||
          Object.keys(args).some((key) => key !== "page")
        )
          return Promise.resolve({
            error: "Provide only an optional page integer.",
          });
        const page = args.page ?? 0;
        if (
          typeof page !== "number" ||
          !Number.isInteger(page) ||
          page < 0 ||
          page > 2000
        )
          return Promise.resolve({
            error: "page must be an integer between 0 and 2000.",
          });
        return read(`/api/projects?page=${page}&pageSize=3`, context?.signal);
      },
    },
  ];
}

export function registerPortfolioTools(context: PortfolioModelContext) {
  const controller = new AbortController();
  for (const tool of portfolioTools()) {
    try {
      Promise.resolve(
        context.registerTool(tool, { signal: controller.signal }),
      ).catch(() => {});
    } catch {
      // Experimental API or policy may reject registration; the JSON endpoints
      // remain available and a failed tool must never interrupt the page.
    }
  }
  return () => controller.abort();
}
