# 툴체인 메이저 (TS 6, pnpm 11+)

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | TypeScript, pnpm, ESLint, Actions |
| **상태** | **진행중** — TS 6.0과 Actions SHA부터. TS 7·pnpm 11+·ESLint flat은 보류 |
| **트리거** | 남은 항목: typedoc이 TS 7을 받을 때, projen이 pnpm `allowBuilds`·ESLint flat을 받을 때 |

## 배경

잡무 이슈에서 메이저 툴체인 업은 범위 밖으로 빼기로 했다.

## 문제

- [x] TypeScript 6. `typescriptVersion: '~6.0.3'`. typedoc 0.28.20 peer는 `6.0.x`까지. ts-jest 29.4.15는 `<7`, `@typescript-eslint/*` 8.72.0은 `<6.1.0`
- [ ] TypeScript 7. typedoc 0.28.20 peer에 `7.x` 없음
- [ ] pnpm 11/12. projen 0.104 `PnpmWorkspaceYamlSchema`에 `allowBuilds` 없음
- [x] GitHub Actions SHA 고정. `pnpm/action-setup`, `setup-node`, `stale`, `create-pull-request`를 해당 태그 커밋에 고정
- [ ] ESLint flat config. projen 0.104 `EslintOptions`는 `.eslintrc.json`만

## 수용 기준

- [x] 착수한 항목만 올리고, 나머지는 이 이슈에 남긴다
- [x] 이 레포의 `engines`·CI Node 24와 맞는지 확인한다

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 잡무 이슈에서 분리해 등록 |
| 2026-10-26 | typedoc 0.28.20이 TS 6.0을 받음. TS `~6.0.3`과 남은 Actions SHA 고정 착수. TS 7·pnpm 11+·flat은 그대로 보류 |
| 2026-10-26 | `tsc --build` 경고 없음. 테스트 32개 통과. `engines.node >= 22`, CI Node 24 유지 |
