# 특성 테스트 보강

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | `test/`, 현재 동작 고정 |
| **관련 코드** | `test/TerraformInjector.test.ts` |
| **상태** | **해결** — async/lazy/output/backend/hook/synth 테스트가 `2.0.0`에 포함 |
| **해결일** | 2026-10-26 |

## 해결 요약

`3e34dda` / [PR #121](https://github.com/ApexCaptain/cdktf-injector/pull/121) / `cdktf-injector@2.0.0`. 테스트 32개.

## 배경

현재 테스트 10개는 sync 경로의 에러 케이스만 다룬다. 분석 문서 03·핸드오프 P2. 버그 수정(B2~B4)은 동작이 바뀌므로 이 테스트가 먼저여야 한다.

## 문제

아래는 테스트가 **0개**다.

- async 루트 주입 (`describe('asynchronous root injector', () => {})`가 비어 있음)
- `provideLazily`, `setDefaultConfigure`, `addOutput`, `backend`
- `afterInitElement` / `afterDependenciesInjected`가 정해진 순서로 한 번씩만 호출되는지, `onNewElementInjected`
- `Testing.synthScope` 기반 synth 스냅샷

## 목표

위 경로의 **현재** 동작을 테스트로 고정한다. 이 이슈에서 버그를 고치지 않는다.

## 수용 기준

- [x] 위 항목마다 최소 하나의 테스트가 있다
- [x] 기존 10개와 새 테스트가 통과한다 (31)
- [x] 런타임 코드 경로는 바꾸지 않는다 (테스트·타입만)

## 범위 밖

버그 B1~B4는 [주입 버그](2026-10-26-injection-bugs-b1-b4.md).

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 핸드오프 P2를 이 이슈로 등록 |
| 2026-10-26 | `test/TerraformInjector.test.ts`에 async/lazy/defaultConfigure/output/backend/hook/synth 특성 테스트 추가. B1~B4는 현재 동작으로 고정. `src/` 변경 없음 |
| 2026-10-26 | `3e34dda` / PR #121 / `2.0.0`. **해결** |
