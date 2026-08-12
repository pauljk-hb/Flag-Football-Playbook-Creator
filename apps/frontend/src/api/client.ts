import type {
  CreatePlaybookDTO,
  CreatePlayDTO,
  CreateTagDTO,
  Play,
  Playbook,
  Tag,
  UpdatePlaybookDTO,
  UpdatePlayDTO,
  UpdateTagDTO,
} from "@/types/interface";

const API_BASE_URL = "http://localhost:4000";

/**
 * Zentraler Fetch-Wrapper, der sich um JSON, Fehler und Auth-Cookies kümmert.
 */
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    credentials: "include",
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(
      errorData?.message ||
        `API Error: ${response.status} ${response.statusText}`,
    );
  }

  if (
    response.status === 204 ||
    response.headers.get("content-length") === "0"
  ) {
    return null as T;
  }

  return response.json();
}

/**
 * Dein neuer API Client
 */
export const api = {
  playbooks: {
    getAll: () => fetchApi<Playbook[]>("/api/v1/playbooks"),

    create: (data: CreatePlaybookDTO) =>
      fetchApi<Playbook>("/api/v1/playbooks", {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdatePlaybookDTO) =>
      fetchApi<Playbook>(`/api/v1/playbooks/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<void>(`/api/v1/playbooks/${id}`, {
        method: "DELETE",
      }),
  },

  plays: {
    getAllByPlaybook: (playbookId: string) =>
      fetchApi<Play[]>(`/api/v1/plays/playbook/${playbookId}`),

    getById: (id: string) => fetchApi<Play>(`/api/v1/plays/${id}`),

    create: (playbookId: string, data: CreatePlayDTO) =>
      fetchApi<Play>(`/api/v1/plays/playbook/${playbookId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdatePlayDTO) =>
      fetchApi<Play>(`/api/v1/plays/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<void>(`/api/v1/plays/${id}`, {
        method: "DELETE",
      }),

    addTag: (playId: string, tagId: string) =>
      fetchApi<void>(`/api/v1/plays/${playId}/tags`, {
        method: "POST",
        body: JSON.stringify({ tagId }),
      }),

    removeTag: (playId: string, tagId: string) =>
      fetchApi<void>(`/api/v1/plays/${playId}/tags/${tagId}`, {
        method: "DELETE",
      }),
  },

  tags: {
    getAllByPlaybook: (playbookId: string) =>
      fetchApi<Tag[]>(`/api/v1/tags/playbook/${playbookId}`),

    create: (playbookId: string, playId: string, data: CreateTagDTO) =>
      fetchApi<Tag>(`/api/v1/tags/playbook/${playbookId}/play/${playId}`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateTagDTO) =>
      fetchApi<Tag>(`/api/v1/tags/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      fetchApi<void>(`/api/v1/tags/${id}`, {
        method: "DELETE",
      }),
  },
};
