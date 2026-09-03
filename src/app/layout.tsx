import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CodeTrain Admin",
  description: "問題レビュー画面（ローカル開発）",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="header">
          <Link href="/" className="header-title">
            <strong>CodeTrain Admin</strong>
          </Link>
          <nav className="header-nav">
            <Link href="/" className="header-link">
              レビューキュー
            </Link>
            <Link href="/questions" className="header-link">
              問題一覧
            </Link>
          </nav>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
