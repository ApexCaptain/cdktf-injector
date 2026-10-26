---
root: false
targets:
  - '*'
description: AI 에이전트 rule·skill SSOT는 .rulesync와 .projenrc.ts. .cursor/rules·skills와 .claude/rules·skills는 생성물이라 직접 수정 금지
globs: []
cursor:
  alwaysApply: true
  description: AI 에이전트 rule·skill SSOT는 .rulesync와 .projenrc.ts. .cursor/rules·skills와 .claude/rules·skills는 생성물이라 직접 수정 금지
  globs: []
---

# AI 에이전트 설정 SSOT (`.rulesync/`)

rule·skill의 SSOT는 `.rulesync/`와 `.projenrc.ts`의 `rulesync.jsonc`다. 아래 경로는 `pnpm ai:generate`(rulesync, `delete: true`)가 만드는 **생성물**이며 gitignore 대상이다. 직접 고치거나 파일을 추가하면 다음 생성 때 **지워진다**.

| 생성물 | SSOT |
|---|---|
| `.cursor/rules/*.mdc`, `.claude/rules/*.md` | `.rulesync/rules/*.md` |
| `.cursor/skills/`, `.claude/skills/` | `.rulesync/skills/` |

대상은 Cursor와 Claude Code의 rules·skills다. MCP·hooks는 이 레포에서 생성하지 않는다.

## 변경 절차

- rule 추가·수정: `.rulesync/rules/`를 고친 뒤 `pnpm ai:generate`.
- skill 추가·수정: `.rulesync/skills/`를 고친 뒤 `pnpm ai:generate`.
- always rule frontmatter: `globs: []` + `cursor.alwaysApply: true` + `cursor.globs: []`. `globs: ['**/*']`는 Claude Code에서 always가 아니다(파일 접근 시에만 로드).
- 대상·삭제 정책: `.projenrc.ts`의 `rulesync.jsonc`를 고친 뒤 `pnpm projen` (`postprojen`이 generate를 실행한다).
- 검증: `pnpm ai:check`(생성물 최신 여부), `pnpm ai:doctor`(소스 검증).
- rulesync 버전은 `26.0.0` 고정. 올리려면 별도 이슈로 진행.

## 커밋·PR 초안

요청이 오면 채팅에만 쓰지 말고 아래 파일에 쓴다. 디렉터리 `.github/generated/`는 gitignore다.

| 요청 | 파일 | 실행 |
|---|---|---|
| 커밋 메시지 | `.github/generated/commit-message.txt` | `pnpm git@commit` |
| PR title·body | `.github/generated/pull-request-title.txt`, `pull-request-body.md` | `pnpm git@pr` (`--base main`) |
