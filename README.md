# ねこあるき（NekoAruki）

## プロジェクト概要

「ねこあるき」は、地域で見かけた猫の情報を投稿し、地図上で可視化する Web アプリケーションです。
ユーザーが見つけた猫の写真・特徴・位置情報を記録し、地域の猫スポットを共有することを目的としています。

## 主な機能

- 地図上での猫スポット表示（Google Maps JavaScript API）
- 猫の投稿（写真・特徴・位置情報・コメント）
- 投稿一覧・詳細の表示
- Google / GitHub OAuth によるログイン（Supabase Auth）

## 使用技術

### フロントエンド

- Next.js 16
- React 19
- TypeScript 5
- Tailwind CSS 4
- DaisyUI 5

### バックエンド・インフラ

- Supabase

  - 認証（Auth）
  - データベース
  - ストレージ
- Google Maps JavaScript API

※ 現在は API サーバーを別途立てておらず、バックエンド処理は Supabase に集約しています。

## ディレクトリ構成

```
nekoaruki/
├── public/      # 静的ファイル
├── src/         # Next.js アプリケーション本体
├── supabase/    # Supabase マイグレーション
└── middleware.ts
```

## 開発環境のセットアップ

```bash
cp .env.sample .env.local   # 作成後、各値を設定する
npm install
npm run dev
```

使用する Node.js / npm のバージョン：

- Node.js v24.11.1
- npm 10 以上

## 環境変数

環境変数は `.env.local` に設定してください。必要な項目は `.env.sample` を参照してください。

| 変数名 | 内容 |
| --- | --- |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API キー |
| `NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` | Google Maps の Map ID |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase プロジェクト URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key |
| `CRON_SECRET` | Vercel Cron の認証用シークレット |

※ 実際の値はリポジトリにコミットしないでください。

## 開発スケジュール

| 日付     | 内容          |
| ------ | ----------- |
| 11/28  | モック完成（中間発表） |
| 12/12  | β 版リリース     |
| 12/15〜 | ユーザー評価      |
| 12/23  | 最終発表        |

## 使用素材・クレジット

- アプリアイコン
  フリーペンシル（iconbu）
  [https://iconbu.com/](https://iconbu.com/)

## 注意事項

- `.next/` と `node_modules/` は Git に含めない（`.gitignore` に記載）
- Supabase の接続情報は `.env.local` に記述し、値は絶対に共有しない
- ブランチ名は `feature/〇〇`、`fix/〇〇` などで統一