# codetrain-admin

問題レビュー画面（Next.js / App Router）。本番は Cloudflare Pages。

## コンテナに入れない

**このリポジトリだけは compose に含まれず、WSL のホストで `next dev` として動く**
（[Document/LOCAL_DEV.md](../Document/LOCAL_DEV.md) §4.2）。

理由: 本番成果物は Pages に置くビルド出力であり実行時のコンテナが存在しないこと、
コンテナ越しのファイル監視は inotify の伝播が不安定で HMR が遅くなること。

## 起動

```bash
cd ../codetrain-admin
nvm install            # .nvmrc の版（初回のみ。以後は nvm use）
npm ci
cp .env.local.example .env.local

cd ../codetrain-devenv
make dev-admin         # nvm use → next dev -H 0.0.0.0 -p 3000
```

- **フォアグラウンドで動き続けるので専用のターミナルを1枚使う。** `make down` の対象外。
- `-H 0.0.0.0` は必須。既定の localhost バインドだと、WSL2 が NAT モードのとき
  Windows 側のブラウザから届かない（LOCAL_DEV.md §2.2）。
- 先に `make up-product` で api を起動しておくこと。

## 環境変数

compose 管理外なので、`codetrain-devenv/.env` ではなく **`.env.local`** から読む。

| 変数 | 既定 | 備考 |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | **ブラウザから見た** URL。compose のサービス名 `api` ではない |

## Node のバージョン

`.nvmrc` が**実行に使われる唯一の指定**（ホスト実行のため）。
Cloudflare Pages のビルド設定と CI もこの値に合わせる（LOCAL_DEV.md §9.2）。
