# 의존성·문서 잡무

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | lockfile, README, 예제, 저장소 잡무 |
| **상태** | **해결** — `e09a3ae`. lock은 주간 upgrade |
| **해결일** | 2026-10-26 |

## 해결 요약

`.DS_Store` 제거, README terraform feature 안내, 예제 `@cdktf/provider-aws/lib/*`. `e09a3ae`. lock `pnpm update`는 주간 `upgrade-develop`에 맡긴다.

## 배경

핸드오프 P5. 배포·peer·테스트·버그와 무관한 잔여 항목이다.

## 문제

- [x] `.DS_Store`가 커밋돼 있다 — 인덱스에서 제거하고 `.gitignore`에 넣음
- [x] `README.md` terraform Dockerfile 안내가 오래됐다 — 이 레포는 terraform **feature**를 씀
- [x] `markdown/*` 예제가 옛 provider API(`vpc.Vpc`)를 씀 — `@cdktf/provider-aws/lib/*`로 바꿈
- [ ] dev 의존성 transitive 취약점. `pnpm update`는 주간 `upgrade-develop`에 맡긴다 (2026-10-22 감사 기준 22건)
- 이후 후보(이 이슈 밖): TypeScript 6/7, pnpm 11/12, Actions SHA 고정, ESLint flat config → [툴체인 메이저](../active/2026-10-26-toolchain-majors.md)

## 수용 기준

- [x] 착수한 항목만 본문에 체크하고, 손대지 않은 항목은 남겨 둔다
- [x] 메이저 툴체인 업그레이드(TS 6, pnpm 11+)는 이 이슈에서 하지 않고 새 이슈로 뺀다

## 범위 밖

CDKTF deprecation 대응(유지보수 / 포크 / 범용 DI / 아카이브)은 방향이 정해지면 새 이슈.

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 핸드오프 P5를 이 이슈로 등록 |
| 2026-10-26 | `.DS_Store` 제거, README terraform 안내, 예제 import 경로 갱신. lock `pnpm update`는 하지 않음 |
| 2026-10-26 | `e09a3ae`. **해결** |
