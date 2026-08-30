"use client";

import { useEffect, useState } from "react";

/**
 * ローカル環境の疎通確認用の画面。
 *
 * ここで確認していること（LOCAL_DEV.md §13-3 / §13-12）:
 *   - ホストで動く next dev（コンテナ外）から、compose の api コンテナに届くか
 *   - ブラウザから見た API の URL が NEXT_PUBLIC_API_BASE_URL で正しく渡っているか
 *
 * fetch はサーバ側ではなく**ブラウザから**行う。API のベース URL は
 * compose のサービス名 "api" ではなくホスト側ポート（http://localhost:8080）であり、
 * これはブラウザから見た URL だから（LOCAL_DEV.md §4.2）。
 *
 * レビュー画面の本体（needs_review の問題を承認する UI）は Phase 3 で実装する。
 */

type SkillNode = {
  id: number;
  slug: string;
  name: string;
  difficulty: number;
};

type Skill = {
  id: number;
  slug: string;
  name: string;
  description?: string;
  nodes?: SkillNode[];
};

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

export default function Home() {
  const [skills, setSkills] = useState<Skill[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;

    fetch(`${apiBaseUrl}/v1/skills`)
      .then(async (res) => {
        if (!res.ok) {
          throw new Error(`API が ${res.status} を返しました`);
        }
        return (await res.json()) as { skills: Skill[] };
      })
      .then((data) => {
        if (!aborted) setSkills(data.skills ?? []);
      })
      .catch((e: unknown) => {
        if (!aborted) setError(e instanceof Error ? e.message : String(e));
      });

    return () => {
      aborted = true;
    };
  }, []);

  return (
    <>
      <h1>スキルツリー</h1>
      <p className="muted">
        接続先: <code>{apiBaseUrl}</code>
      </p>

      {error && (
        <div className="error">
          <p>
            <strong>API に接続できませんでした:</strong> {error}
          </p>
          <p className="muted">
            <code>make up-product</code> で api が起動しているか、
            <code>curl {apiBaseUrl}/healthz</code> が通るかを確認してください。
          </p>
        </div>
      )}

      {!error && skills === null && <p className="muted">読み込み中…</p>}

      {skills?.length === 0 && (
        <p className="muted">
          スキルがありません。<code>make seed</code> でシードを投入してください。
        </p>
      )}

      {skills?.map((skill) => (
        <section className="card" key={skill.id}>
          <h2>
            {skill.name} <span className="muted">({skill.slug})</span>
          </h2>
          {skill.description && <p className="muted">{skill.description}</p>}
          <ul className="nodes">
            {(skill.nodes ?? []).map((node) => (
              <li key={node.id}>
                {node.name} <span className="muted">難易度 {node.difficulty}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
