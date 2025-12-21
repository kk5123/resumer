# monorepo-template

pnpm を使った最小構成のモノレポ テンプレートです。

## セットアップ

```bash
pnpm install
```

## ディレクトリ構成

- `pnpm-workspace.yaml` — ワークスペース定義
- `apps/` — アプリケーションを配置
- `packages/` — 再利用可能なパッケージを配置
- `docs/` — Docusaurus ドキュメント

## 使い方のヒント

1. `apps/<name>` または `packages/<name>` を作成し、`pnpm init -y` を実行
2. `package.json` に `name`, `version`, 必要な `scripts` を設定
3. 依存を追加したらルートで `pnpm install`
4. 実行例: `pnpm --filter <workspace-name> <script>`
