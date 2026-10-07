// Helpers for the go-live Setup wizard. API: /api/setup (settings:manage).
import apiClient from "@/service/axios";

export const SETUP_API = "/setup";

// Null when it can't be loaded (e.g. no settings:manage).
export async function loadSetup() {
  try {
    const { data } = await apiClient.get(SETUP_API);
    return data.data || null;
  } catch {
    return null;
  }
}

export const isSetupRunning = (state) => !!state?.setup;

// Where each checklist item can be fixed
export const CHECKLIST_LINKS = {
  profile: { to: "/dashboard/bot-profile", label: "Open Bot Profile" },
  knowledge: { to: "/dashboard/knowledge", label: "Open Knowledge" },
  no_blockers: { to: "/dashboard/knowledge/issues", label: "Open Issues" },
  eval: { to: "/dashboard/quality", label: "Open Quality" },
  channel: { to: "/dashboard/integration?section=widget", label: "Open Website Widget" },
  handoff: { to: "/dashboard/integration?section=widget", label: "Set support number" },
  integrations: { to: "/dashboard/integration?section=api-config&tab=product-api", label: "Open API config" },
};

export const checklistProgress = (checklist) => {
  const items = checklist?.items || [];
  return { done: items.filter((i) => i.done).length, total: items.length };
};
