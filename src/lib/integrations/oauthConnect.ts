import { httpRequest } from "../net/http";

export type ConnectProvider = "slack" | "discord" | "notion" | "google";

export interface ProviderConfigState {
  configured: boolean;
  missing: string[];
}

export type ProvidersConfigResponse = Record<ConnectProvider, ProviderConfigState>;

interface StartSessionResponse {
  sessionId: string;
  authorizeUrl: string;
  statusUrl: string;
}

interface PollSessionResponse {
  status: "pending" | "completed" | "failed";
  message?: string;
  settings?: Record<string, string>;
}

export async function startConnectSession(
  backendBaseUrl: string,
  provider: ConnectProvider,
): Promise<StartSessionResponse> {
  const baseUrl = backendBaseUrl.replace(/\/$/, "");
  const response = await httpRequest(`${baseUrl}/api/connect/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ provider }),
  });

  return (await response.json()) as StartSessionResponse;
}

export async function assertConnectBackendReachable(
  backendBaseUrl: string,
): Promise<void> {
  const baseUrl = backendBaseUrl.replace(/\/$/, "");
  try {
    await httpRequest(`${baseUrl}/health`, {
      method: "GET",
    });
  } catch {
    throw new Error(
      `OAuth backend is unreachable at ${baseUrl}. Start it with: npm run auth:dev`,
    );
  }
}

export async function pollConnectSession(
  statusUrl: string,
): Promise<PollSessionResponse> {
  const response = await httpRequest(statusUrl, {
    method: "GET",
  });
  return (await response.json()) as PollSessionResponse;
}

export async function waitForConnectCompletion(
  statusUrl: string,
  timeoutMs = 120_000,
  intervalMs = 2_000,
): Promise<PollSessionResponse> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const state = await pollConnectSession(statusUrl);
    if (state.status === "completed" || state.status === "failed") {
      return state;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return {
    status: "failed",
    message: "Timed out waiting for OAuth callback. Please try again.",
  };
}

export async function getConnectProvidersConfig(
  backendBaseUrl: string,
): Promise<ProvidersConfigResponse> {
  const baseUrl = backendBaseUrl.replace(/\/$/, "");
  const response = await httpRequest(`${baseUrl}/api/connect/providers`, {
    method: "GET",
  });

  return (await response.json()) as ProvidersConfigResponse;
}
