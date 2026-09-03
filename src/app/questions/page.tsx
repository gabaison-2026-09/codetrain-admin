"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchAdminQuestions } from "@/lib/api";
import type { AdminQuestionSummary, QuestionStatus, QuestionType } from "@/lib/types";
import { QUESTION_TYPE_LABELS, STATUS_LABELS } from "@/lib/types";

type Filters = {
  status: string;
  type: string;
  q: string;
};

export default function QuestionsListPage() {
  const [questions, setQuestions] = useState<AdminQuestionSummary[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    status: "",
    type: "",
    q: "",
  });

  const load = useCallback(
    async (cursor?: string) => {
      try {
        const data = await fetchAdminQuestions(
          {
            status: filters.status || undefined,
            type: filters.type || undefined,
            q: filters.q || undefined,
          },
          cursor,
        );
        if (cursor) {
          setQuestions((prev) => [...prev, ...data.questions]);
        } else {
          setQuestions(data.questions);
        }
        setNextCursor(data.next_cursor);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [filters],
  );

  useEffect(() => {
    setLoading(true);
    setError(null);
    load().finally(() => setLoading(false));
  }, [load]);

  const handleLoadMore = async () => {
    if (!nextCursor) return;
    setLoadingMore(true);
    await load(nextCursor);
    setLoadingMore(false);
  };

  return (
    <>
      <div className="page-header">
        <h1>問題一覧</h1>
        <Link href="/" className="btn btn-secondary">
          レビューキュー
        </Link>
      </div>

      {/* フィルター */}
      <div className="filters">
        <select
          value={filters.status}
          onChange={(e) =>
            setFilters((f) => ({ ...f, status: e.target.value }))
          }
        >
          <option value="">すべてのステータス</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
        >
          <option value="">すべてのタイプ</option>
          {Object.entries(QUESTION_TYPE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>

        <input
          type="search"
          placeholder="タイトル・本文で検索…"
          value={filters.q}
          onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
          className="search-input"
        />
      </div>

      {error && (
        <div className="error">
          <p>{error}</p>
        </div>
      )}

      {loading && <p className="muted">読み込み中…</p>}

      {!loading && !error && questions.length === 0 && (
        <div className="empty-state">
          <p>条件に一致する問題がありません</p>
        </div>
      )}

      {questions.length > 0 && (
        <div className="question-list">
          {questions.map((q) => (
            <Link
              key={q.id}
              href={`/questions/${q.id}`}
              className="question-item"
            >
              <div className="question-item-main">
                <span className="question-item-title">{q.title}</span>
                <div className="question-item-meta">
                  <span
                    className={`tag tag-status tag-status-${q.status}`}
                  >
                    {STATUS_LABELS[q.status as QuestionStatus]}
                  </span>
                  <span className="tag tag-type">
                    {QUESTION_TYPE_LABELS[q.type as QuestionType]}
                  </span>
                  <span className="tag tag-difficulty">
                    難易度 {q.difficulty}
                  </span>
                </div>
              </div>
              <time className="question-item-date" dateTime={q.created_at}>
                {new Date(q.created_at).toLocaleDateString("ja-JP")}
              </time>
            </Link>
          ))}
        </div>
      )}

      {nextCursor && (
        <div className="load-more">
          <button
            className="btn btn-secondary"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? "読み込み中…" : "さらに読み込む"}
          </button>
        </div>
      )}
    </>
  );
}
