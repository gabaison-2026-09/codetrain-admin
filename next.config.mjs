/**
 * 本番は Cloudflare Pages にビルド出力をデプロイする（DESIGN.md §2）。
 * ローカルは WSL ホストで `next dev` を動かす（LOCAL_DEV.md §4.2）。
 * コンテナには入れないため、ファイル監視まわりの回避設定は不要。
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
