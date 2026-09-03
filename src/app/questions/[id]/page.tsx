"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchAdminQuestion, submitReview } from "@/lib/api";
import type { AdminQuestion, ReviewDecision } from "@/lib/types";
import {
  QUESTION_TYPE_LABELS,
  STATUS_LABELS,
  DECISION_LABELS,
} from "@/lib/types";

export default function QuestionDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [question, setQuestion] = useState<AdminQuestion | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [reviewNotes, setReviewNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await fetchAdminQuestion(params.id);
      setQuestion(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleReview = async (decision: ReviewDecision) => {
    setSubmitting(true);
    setReviewError(null);
    setReviewSuccess(null);
    try {
      await submitReview(params.id, decision, reviewNotes);
      setReviewSuccess(`${DECISION_LABELS[decision]}しました`);
      setReviewNotes("");
      await load();
    } catch (e) {
      setReviewError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const hasPendingReview =
    question?.review_history.some((r) => r.decision === null) ?? false;

  if (loading) return <p className="muted">読み込み中…</p>;
  if (error)
    return (
      <div className="error">
        <p>{error}</p>
        <Link href="/">← キューに戻る</Link>
      </div>
    );
  if (!question) return null;

  return (
    <>
      <nav className="breadcrumb">
        <Link href="/">レビューキュー</Link>
        <span>/</span>
        <span>{question.title}</span>
      </nav>

      {/* ヘッダー */}
      <div className="detail-header">
        <h1>{question.title}</h1>
        <div className="detail-tags">
          <span className={`tag tag-status tag-status-${question.status}`}>
            {STATUS_LABELS[question.status]}
          </span>
          <span className="tag tag-type">
            {QUESTION_TYPE_LABELS[question.type]}
          </span>
          <span className="tag tag-difficulty">
            難易度 {question.difficulty}
          </span>
          {question.tags?.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 問題本文 */}
      <section className="detail-section">
        <h2>問題文</h2>
        <div className="detail-body">{question.body}</div>
      </section>

      {/* コード */}
      {question.code && (
        <section className="detail-section">
          <h2>
            コード
            {question.code_language && (
              <span className="muted"> ({question.code_language})</span>
            )}
          </h2>
          <pre className="code-block">
            <code>{question.code}</code>
          </pre>
        </section>
      )}

      {/* 選択肢 */}
      <section className="detail-section">
        <h2>選択肢</h2>
        <div className="choices">
          {question.choices.map((c) => (
            <div
              key={c.key}
              className={`choice ${question.correct_keys.includes(c.key) ? "choice-correct" : ""}`}
            >
              <span className="choice-key">{c.key.toUpperCase()}</span>
              <span className="choice-text">{c.text}</span>
              {question.correct_keys.includes(c.key) && (
                <span className="choice-badge">正解</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 解説 */}
      {question.explanation && (
        <section className="detail-section">
          <h2>解説</h2>
          <div className="detail-body">{question.explanation}</div>
        </section>
      )}

      {/* 生成メタデータ */}
      {question.prompt_version && (
        <section className="detail-section">
          <h2>生成情報</h2>
          <dl className="meta-grid">
            <dt>プロンプト</dt>
            <dd>{question.prompt_version}</dd>
            <dt>モデル</dt>
            <dd>{question.model_id ?? "—"}</dd>
            <dt>トークン数</dt>
            <dd>{question.gen_tokens ?? "—"}</dd>
            <dt>生成日時</dt>
            <dd>
              {question.generated_at
                ? new Date(question.generated_at).toLocaleString("ja-JP")
                : "—"}
            </dd>
          </dl>
        </section>
      )}

      {/* レビュー履歴 */}
      {question.review_history.length > 0 && (
        <section className="detail-section">
          <h2>レビュー履歴</h2>
          <div className="review-history">
            {question.review_history.map((entry) => (
              <div key={entry.id} className="review-entry">
                <div className="review-entry-header">
                  {entry.decision ? (
                    <span
                      className={`tag tag-decision tag-decision-${entry.decision}`}
                    >
                      {DECISION_LABELS[entry.decision]}
                    </span>
                  ) : (
                    <span className="tag tag-decision tag-decision-pending">
                      未レビュー
                    </span>
                  )}
                  <time dateTime={entry.created_at}>
                    {new Date(entry.created_at).toLocaleString("ja-JP")}
                  </time>
                </div>
                {entry.notes && (
                  <p className="review-entry-notes">{entry.notes}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* レビューアクション */}
      {hasPendingReview && (
        <section className="detail-section review-panel">
          <h2>レビュー</h2>

          {reviewSuccess && (
            <div className="success-message">{reviewSuccess}</div>
          )}
          {reviewError && <div className="error-inline">{reviewError}</div>}

          <textarea
            className="review-notes"
            placeholder="コメント（任意）"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
            disabled={submitting}
          />

          <div className="review-actions">
            <button
              className="btn btn-approve"
              onClick={() => handleReview("approved")}
              disabled={submitting}
            >
              承認
            </button>
            <button
              className="btn btn-needs-edit"
              onClick={() => handleReview("needs_edit")}
              disabled={submitting}
            >
              要修正
            </button>
            <button
              className="btn btn-reject"
              onClick={() => handleReview("rejected")}
              disabled={submitting}
            >
              却下
            </button>
          </div>
        </section>
      )}

      {!hasPendingReview && question.status !== "needs_review" && (
        <div className="review-done-banner">
          この問題はレビュー済みです（{STATUS_LABELS[question.status]}）
        </div>
      )}

      <div className="detail-footer">
        <button className="btn btn-secondary" onClick={() => router.back()}>
          ← 戻る
        </button>
      </div>
    </>
  );
}
