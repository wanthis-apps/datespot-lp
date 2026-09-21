# DateSpot

カップル向けのデートスポット検索アプリです。Expo（SDK 57）と Supabase を使い、スポット一覧・地図・クーポン・お気に入りをひとつのアプリにまとめています。

## できること

- スポット一覧・詳細（画像・エリア・カテゴリー・クーポン）
- 地図上のピン表示とプレビュー
- エリア / カテゴリー / 関係性タグ / キーワードでの絞り込み
- お気に入りの追加・解除
- クーポンの一覧と利用（利用履歴は `user_coupons_history` に記録）
- 起動時の匿名セッション確保（Supabase Auth）

## 必要環境

- Node.js 22 以降（Expo SDK 57 推奨）
- npm
- Expo Go（実機確認用）または Android / iOS シミュレータ
- Supabase プロジェクト

## 環境変数

プロジェクト直下に `.env` を置きます。雛形は `.env.example` です。

Expo がアプリに埋め込むのは **`EXPO_PUBLIC_` で始まる値だけ**です。サービスロールキーは入れないでください。

```bash
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

| 変数名 | 必須 | 説明 |
| --- | --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | はい | Supabase プロジェクトの URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | はい | anon / publishable キー（公開してよいキー） |

設定後はキャッシュを消して起動してください。

```bash
npx expo start --clear
```

## セットアップ

```bash
npm install
copy .env.example .env
```

macOS / Linux では `cp .env.example .env` でも構いません。`.env` のダミー値を、自分の Supabase プロジェクトの値に書き換えてください。

### データベース

Supabase の SQL Editor で、次の順に実行します。

1. `supabase/schema.sql`（テーブル・ENUM・RLS）
2. `supabase/seed.sql`（サンプルのスポットとクーポン）

やり直すときだけ、先に `supabase/reset.sql` を実行します。

クーポン利用と会員行の作成には、Auth の **匿名ログイン（Anonymous sign-ins）** を有効にしてください。無効のままでもスポット閲覧はできます。

## 起動

```bash
npx expo start --clear
```

QR コードから Expo Go で開くか、ターミナルのショートカットを使います。

```bash
npm run android
npm run ios
npm run web
```

## 型チェック

```bash
npx tsc --noEmit
```

## 主な構成

```
src/
  components/     共通 UI（画像フォールバック、読み込み・エラー表示）
  features/       スポット / 地図 / クーポン / 認証 / 課金 UI
  navigation/     タブ + スポット詳細スタック
  services/       Supabase クライアントと環境変数
  types/          アプリ型と Database 型
supabase/
  schema.sql
  seed.sql
  reset.sql
```

## 注意

- `.env` は Git に含めません。値は `.env.example` のダミー表記を参考にしてください。
- 環境変数を変えたあとは、必ず `npx expo start --clear` で Metro を再起動してください。
