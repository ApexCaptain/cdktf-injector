# 주입 버그 B1~B4

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | `src/` 주입 로직 |
| **관련 코드** | `src/components/core/classes/terraform-injector.element-container.class.ts`, `src/components/core/functions/commit-injection.ts` |
| **상태** | **보류** — [특성 테스트](2026-10-26-feature-tests.md) 이후. 동작이 바뀌므로 메이저 버전 여부를 그때 검토 |
| **트리거** | 특성 테스트가 현재 동작을 고정한 뒤 |

## 배경

`tmp/check/repro.ts`로 재현했다.

```bash
pnpm exec ts-node --transpile-only --project tsconfig.dev.json tmp/check/repro.ts
```

## 문제

| ID | 내용 | 재현 | 위치 |
|----|------|------|------|
| B1 | `prototype instanceof TerraformOutput`가 `TerraformOutput` 자신에 대해 false라서 기본 설정이 섞임 | 실질적 영향 없음 (cdktf가 알려진 필드만 직렬화). 코드만 바로잡으면 됨 | element-container `initialize` |
| B2 | defaultConfigure 우선순위가 반대: 상위(app)가 하위(stack)를 이김 | 재현 `{"who":"app(root)"}` | 같은 파일, `_.merge` 루프 |
| B3 | `inject()`를 어디서 호출하느냐에 따라 상위 기본값 적용 여부가 달라짐 | 재현 (stack.inject 시 app 기본값 누락) | `commit-injection.ts` `getInjectorsUpper` |
| B4 | `_.merge`가 배열을 인덱스별로 병합 | 재현 `['d1','d2']` + `['user']` → `["user","d2"]` | 같은 `_.merge` |

## 수용 기준

- [ ] B2·B3·B4 재현 테스트가 실패 → 수정 후 통과
- [ ] B1 조건이 `TerraformOutput` 자신을 올바르게 구분한다
- [ ] 메이저 bump 여부를 사용자와 정한 뒤 반영한다

## 범위 밖

sync/async 중복, 전역 `injectorMap`, 에러 클래스 비공개 export, `getCaller` 스택 파싱, `new Promise(async …)` — 분석 03. 필요하면 새 이슈.

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-22 | `tmp/check/repro.ts`로 B1~B4 재현 |
| 2026-10-26 | 핸드오프 P3를 이 이슈로 등록 |
