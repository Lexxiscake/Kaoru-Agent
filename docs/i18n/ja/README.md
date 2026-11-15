<div align="center">

<img src="../../../screenshots/02-overlay-character.png" width="150" alt="Live2Dデスクトップアシスタント Kaoru" />

# Kaoru

### デスクトップに寄り添う、知的な存在

**状況を理解する · 大切なことを覚える · 行動する前に確認する**

[Español](../../../README.md) · **日本語** · [English](../en/README.md)

</div>

---

## デモ

<div align="center">

https://github.com/user-attachments/assets/51607f76-a4db-4959-baf5-92f70caec34d

<details>
<summary><b>クイックデモ (GIF)</b></summary>
<br/>
<img src="../../../screenshots/demo.gif" alt="Kaoru のデモ" width="860" />
</details>

</div>

---

Kaoru は Electron と Live2D アバターで構築された Windows／Linux 向けデスクトップアシスタントです。会話、ローカルの意味記憶、OS のシグナル、権限を考慮したツールエージェントを統合します。センサー起点の働きかけは、LLM が文章を生成する前に決定論的なポリシーで評価されます。

> **状態:** ベータ版です。一部は実験的で、外部での検証が必要です。技術文書の詳細は主にスペイン語で保守されています。本ページは要点の案内です。

## Kaoru の特徴

- **状況把握:** OS、Git、LSP、集中時間、アイドル状態などのセンサーを設定可能。
- **ローカル記憶:** StateGraph が事実・好み・エピソード・意図を保存し、意味検索と時間減衰を行います。
- **監査可能な自発性:** センサー信号を `ACT` / `QUEUE` / `DROP` / `ESCALATE` に分類。
- **統制された操作:** 提案、権限ポリシー、同意、実行、検証、復旧を分離。
- **拡張性:** ローカルプラグイン、skills、サブエージェント、LSP に対応。
- **デスクトップ上の存在感:** Live2D オーバーレイ、ジェスチャー、音声、Markdown ストリーミングチャット。

## セキュリティモデル

LLM は認可主体ではありません。ツールの影響分類、`allow`／`ask`／`deny` ルール、セッション承認、workspace のパス制御、実行境界はモデル出力の外側で強制されます。

コマンド sandbox は OS に依存します（Windows: AppContainer、Linux: `bubblewrap` があれば利用、macOS: 現在追加の process sandbox なし）。Electron renderer の sandbox は別の制御です。

## クイックスタート

要件: Node.js 18 以上、npm 9 以上。実装済み OS センサーは Windows と Linux 向けです。

```bash
git clone https://github.com/Lexxiscake/Kaoru-Agent.git
cd Kaoru-Agent
npm install
npm run rebuild
npm start
```

```bash
npm run lint
npm run typecheck
npm run format:check
npm test
```

> `better-sqlite3`／`sqlite-vec` を使うテストは Electron の Node runtime が必要です（`npm test` が処理します）。

## ドキュメント

メモリ、埋め込み、設定、テレメトリはローカルに保存されます。選択されたコンテキストは設定した LLM、音声サービス、連携先に送信される場合があります。デスクトップ権限はアプリ、ブラウザ、画面、ポインター、キーボード、プロセス、カメラごとに設定できます。

- [ドキュメントセンター](../../README.md)
- [メイン README（スペイン語）](../../../README.md)
- [Web サイトと使い方](../../web/ja/index.html)
- [プライバシー通知](../../web/ja/privacy.html)
- [利用規約](../../web/ja/terms.html)
- [アーキテクチャ（スペイン語）](../../arquitectura.md)
- [Core](../../../core/README.md) · [IPC](../../../ipc/README.md) · [テスト](../../../tests/README.md)

<div align="center">

*デスクトップ AI が、確認することを忘れずに役立てるよう、丁寧に作られています。*

</div>
