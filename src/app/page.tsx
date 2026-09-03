"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { fetchReviewQueue } from "@/lib/api";
import type { ReviewQueueItem } from "@/lib/types";
import { QUESTION_TYPE_LABELS } from "@/lib/types";

export default function ReviewQueuePage() {
  const [items, setItems] = useState<ReviewQueueItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (cursor?: string) => {
    try {
      const data = await fetchReviewQueue(cursor);
      if (cursor) {
        setItems((prev) => [...prev, ...data.items]);
      } else {
        setItems(data.items);
      }
      setNextCursor(data.next_cursor);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  useEffect(() => {
    setLoading(true);
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
        <h1>レビューキュー</h1>
        <Link href="/questions" className="btn btn-secondary">
          問題一覧
        </Link>
      </div>

      {error && (
        <div className="error">
          <p>
            <strong>エラー:</strong> {error}
          </p>
          <p className="muted">
            <code>docker compose up -d</code> で API
            が起動しているか確認してください。
          </p>
        </div>
      )}

      {loading && <p className="muted">読み込み中…</p>}

      {!loading && !error && items.length === 0 && (
        <div className="empty-state">
          <p>レビュー待ちの問題はありません</p>
          <p className="muted">
            すべての問題がレビュー済みです。
            <Link href="/questions">問題一覧</Link>
            で確認できます。
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div className="queue-list">
          {items.map((item) => (
            <Link
              key={item.review_id}
              href={`/questions/${item.question_id}`}
              className="queue-item"
            >
              <div className="queue-item-main">
                <span className="queue-item-title">{item.title}</span>
                <div className="queue-item-meta">
                  <span className="tag tag-type">
                    {QUESTION_TYPE_LABELS[item.type]}
                  </span>
                  <span className="tag tag-difficulty">
                    難易度 {item.difficulty}
                  </span>
                </div>
              </div>
              <time className="queue-item-date" dateTime={item.queued_at}>
                {new Date(item.queued_at).toLocaleDateString("ja-JP")}
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
