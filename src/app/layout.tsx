import type { Metadata } from "next";
import type { ReactNode } from "react";
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
          <strong>CodeTrain Admin</strong>
          <span className="badge">local</span>
        </header>
        <main className="main">{children}</main>
      </body>
    </html>
  );
}
