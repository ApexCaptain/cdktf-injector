# 툴체인 메이저 (TS 6, pnpm 11+)

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | TypeScript, pnpm, ESLint, Actions |
| **상태** | **보류** — TS 6.0·Actions SHA는 완료. 유지보수 모드 결정으로 나머지는 필요할 때만 |
| **트리거** | 보안 권고 또는 빌드·CI 깨짐. (이전: typedoc이 TS 7을 받을 때, projen이 pnpm `allowBuilds`·ESLint flat을 받을 때) |
| **재검토일** | 2026-12-01 — TS 7 지원 typedoc 릴리스 확인 (메인테이너 조사: 2026-11월 말~12월 초 예상) |

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
| 2026-10-26 | CDKTF 유지보수 모드 결정([CDKTF upstream 지원 종료](../resolved/2026-10-26-cdktf-upstream-deprecation.md))에 따라 보류. TS 7·pnpm 11+·ESLint flat은 보안·빌드 문제가 있을 때만 |
| 2026-10-26 | 메인테이너 조사로 TS 7 지원 typedoc이 2026-11월 말~12월 초 나올 것으로 예상. 재검토일 2026-12-01로 TS 7 재확인 등록. pnpm 11+·ESLint flat은 기존 트리거 유지 |
