# 툴체인 메이저 (TS 6, pnpm 11+)

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | TypeScript, pnpm, ESLint, Actions |
| **상태** | **보류** — [의존성·문서 잡무](2026-10-26-deps-and-docs-chores.md)에서 분리 |
| **트리거** | typedoc·projen이 해당 메이저를 받을 때 |

## 배경

잡무 이슈에서 메이저 툴체인 업은 범위 밖으로 빼기로 했다.

## 문제

- TypeScript 6/7. typedoc 0.28은 TS 6.0까지
- pnpm 11/12. projen `allowBuilds`가 필요할 수 있다
- GitHub Actions SHA 고정
- ESLint flat config

## 수용 기준

- [ ] 착수한 항목만 올리고, 나머지는 이 이슈에 남긴다
- [ ] 이 레포의 `engines`·CI Node 24와 맞는지 확인한다

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 잡무 이슈에서 분리해 등록 |
