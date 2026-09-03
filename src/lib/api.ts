import type {
  AdminQuestion,
  AdminQuestionList,
  AdminQuestionPatch,
  ReviewDecision,
  ReviewQueueList,
  ReviewResult,
} from "./types";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

const DEV_USER = "seed-user-01";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "X-Dev-User": DEV_USER,
      ...init?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const msg =
      body?.error?.message ?? body?.message ?? `API error ${res.status}`;
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

export async function fetchReviewQueue(
  cursor?: string,
  limit = 20,
): Promise<ReviewQueueList> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  return request(`/v1/admin/review-queue?${params}`);
}

export async function fetchAdminQuestions(
  filters: {
    status?: string;
    type?: string;
    language?: string;
    skill_id?: string;
    q?: string;
  } = {},
  cursor?: string,
  limit = 20,
): Promise<AdminQuestionList> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set("cursor", cursor);
  for (const [k, v] of Object.entries(filters)) {
    if (v) params.set(k, v);
  }
  return request(`/v1/admin/questions?${params}`);
}

export async function fetchAdminQuestion(id: string): Promise<AdminQuestion> {
  return request(`/v1/admin/questions/${id}`);
}

export async function updateAdminQuestion(
  id: string,
  patch: AdminQuestionPatch,
): Promise<AdminQuestion> {
  return request(`/v1/admin/questions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}

export async function submitReview(
  questionId: string,
  decision: ReviewDecision,
  notes?: string,
): Promise<ReviewResult> {
  return request(`/v1/admin/questions/${questionId}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decision, notes: notes || undefined }),
  });
}
