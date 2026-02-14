export type CoolifyProject = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
};

export type CoolifyServiceCreateRequest = {
  type: string;
  name: string;
  description?: string;
  project_uuid: string;
  environment_name: string;
  environment_uuid?: string;
  server_uuid: string;
  destination_uuid: string;
  instant_deploy?: boolean;
  docker_compose_raw: string;
  urls?: Array<{ name: string; url: string }>;
  force_domain_override?: boolean;
};

export type CoolifyServiceCreateResponse = {
  uuid: string;
  domains?: string[];
};

export type CoolifyService = {
  id: number;
  uuid: string;
  name: string;
  description: string | null;
  docker_compose_raw: string;
  docker_compose: string;
  destination_type: string;
  destination_id: number;
  connect_to_docker_network: boolean;
  config_hash: string;
  service_type: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export class CoolifyClient {
  constructor(
    private readonly baseUrl: string,
    private readonly token: string,
  ) {}

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${this.baseUrl.replace(/\/$/, "")}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.token}`,
        ...(init?.headers ?? {}),
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(
        `Coolify API ${init?.method ?? "GET"} ${path} failed (${res.status}): ${body}`,
      );
    }

    // Some endpoints return empty body.
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }

  listProjects(): Promise<CoolifyProject[]> {
    return this.request<CoolifyProject[]>("/projects");
  }

  createProject(input: { name: string; description?: string }): Promise<{ uuid: string }> {
    return this.request<{ uuid: string }>("/projects", {
      method: "POST",
      body: JSON.stringify({
        name: input.name,
        description: input.description ?? "",
      }),
    });
  }

  createService(req: CoolifyServiceCreateRequest): Promise<CoolifyServiceCreateResponse> {
    return this.request<CoolifyServiceCreateResponse>("/services", {
      method: "POST",
      body: JSON.stringify(req),
    });
  }

  getService(uuid: string): Promise<CoolifyService> {
    return this.request<CoolifyService>(`/services/${uuid}`);
  }

  stopService(uuid: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/services/${uuid}/stop`);
  }

  restartService(uuid: string, opts?: { latest?: boolean }): Promise<{ message: string }> {
    const q = opts?.latest ? "?latest=true" : "";
    return this.request<{ message: string }>(`/services/${uuid}/restart${q}`);
  }

  deleteService(
    uuid: string,
    opts?: {
      delete_configurations?: boolean;
      delete_volumes?: boolean;
      docker_cleanup?: boolean;
      delete_connected_networks?: boolean;
    },
  ): Promise<{ message: string }> {
    const p = new URLSearchParams();
    p.set(
      "delete_configurations",
      String(opts?.delete_configurations ?? true),
    );
    p.set("delete_volumes", String(opts?.delete_volumes ?? true));
    p.set("docker_cleanup", String(opts?.docker_cleanup ?? true));
    p.set(
      "delete_connected_networks",
      String(opts?.delete_connected_networks ?? true),
    );
    return this.request<{ message: string }>(`/services/${uuid}?${p.toString()}`, {
      method: "DELETE",
    });
  }

  deployByUuid(uuid: string, opts?: { force?: boolean }): Promise<{
    deployments: Array<{ message: string; resource_uuid: string; deployment_uuid: string }>;
  }> {
    const p = new URLSearchParams();
    p.set("uuid", uuid);
    if (opts?.force) p.set("force", "true");
    return this.request(`/deploy?${p.toString()}`);
  }
}
