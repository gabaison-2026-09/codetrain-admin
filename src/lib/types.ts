export type QuestionType =
  | "code_reading"
  | "output_prediction"
  | "bug_finding"
  | "fill_in_blank"
  | "best_practice";

export type QuestionStatus = "draft" | "needs_review" | "published" | "rejected";

export type ReviewDecision = "approved" | "rejected" | "needs_edit";

export type Choice = {
  key: string;
  text: string;
};

export type ReviewQueueItem = {
  review_id: string;
  question_id: string;
  title: string;
  type: QuestionType;
  difficulty: number;
  queued_at: string;
};

export type ReviewQueueList = {
  items: ReviewQueueItem[];
  next_cursor: string | null;
};

export type AdminQuestionSummary = {
  id: string;
  status: QuestionStatus;
  type: QuestionType;
  difficulty: number;
  title: string;
  created_at: string;
};

export type AdminQuestionList = {
  questions: AdminQuestionSummary[];
  next_cursor: string | null;
};

export type ReviewEntry = {
  id: string;
  reviewer_id: string | null;
  decision: ReviewDecision | null;
  notes: string | null;
  created_at: string;
};

export type AdminQuestion = {
  id: string;
  status: QuestionStatus;
  type: QuestionType;
  difficulty: number;
  title: string;
  body: string;
  code?: string;
  code_language?: string;
  choices: Choice[];
  correct_keys: string[];
  explanation?: string;
  tags?: string[];
  skill_node_id?: string;
  raw_source_id: string;
  prompt_version?: string;
  model_id?: string;
  gen_tokens?: number;
  generated_at?: string;
  review_history: ReviewEntry[];
};

export type ReviewResult = {
  id: string;
  question_id: string;
  reviewer_id: string;
  decision: ReviewDecision;
  notes?: string;
  reviewed_at: string;
};

export type AdminQuestionPatch = {
  title?: string;
  body?: string;
  code?: string;
  code_language?: string;
  choices?: Choice[];
  correct_keys?: string[];
  explanation?: string;
  difficulty?: number;
  tags?: string[];
  skill_node_id?: string;
};

export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  code_reading: "コードリーディング",
  output_prediction: "出力予測",
  bug_finding: "バグ発見",
  fill_in_blank: "穴埋め",
  best_practice: "ベストプラクティス",
};

export const STATUS_LABELS: Record<QuestionStatus, string> = {
  draft: "下書き",
  needs_review: "レビュー待ち",
  published: "公開済み",
  rejected: "却下",
};

export const DECISION_LABELS: Record<ReviewDecision, string> = {
  approved: "承認",
  rejected: "却下",
  needs_edit: "要修正",
};
