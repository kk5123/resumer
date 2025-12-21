---
title: モノレポ テンプレート
sidebar_position: 1
---

# pnpm モノレポ テンプレート

pnpm を使った最小構成のモノレポです。`pnpm-workspace.yaml` で `apps/*`, `packages/*`, `docs` をワークスペースとして管理します。

## セットアップ

```bash
pnpm install
```

## ディレクトリ構成

- `apps/` — アプリケーションを配置（初期状態では空）
- `packages/` — 共有ライブラリやモジュールを配置（初期状態では空）
- `docs/` — 本ドキュメント（Docusaurus）

## よく使うコマンド

- 依存インストール: `pnpm install`
- 任意のワークスペース実行: `pnpm --filter <workspace-name> <script>`
- ドキュメント開発サーバー: `pnpm --filter @monorepo/docs start`
- ドキュメントビルド: `pnpm --filter @monorepo/docs build`

## パッケージ/アプリ追加の流れ

1. `apps/<name>` もしくは `packages/<name>` を作成
2. `pnpm init -y`（または既存の package.json をコピー）
3. `package.json` に `name`, `version`, 必要な `scripts` を設定
4. 依存を追加したらルートで `pnpm install`

