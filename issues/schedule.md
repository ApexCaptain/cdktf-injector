# 열린 이슈 일정

`issues/active/` 기준. 날짜가 있는 확인·재개만 달력에 넣고, 나머지는 트리거 대기.

원문·수용 기준은 각 이슈 문서. 이 표는 언제 무엇을 볼지만.

---

## 달력

| 언제 | 할 일 | 이슈 | 상태 |
|---|---|---|---|

---

## 날짜 없음 (트리거 대기)

| 트리거 | 할 일 | 이슈 | 상태 |
|---|---|---|---|
| 사용자 커밋 후 아카이브 | 특성 테스트 보강 완료. 버그는 고치지 않음 | [특성 테스트](active/2026-10-26-feature-tests.md) | 해결 대기 |
| 사용자 커밋·2.0.0 배포 후 아카이브 | B1~B4 + `majorVersion: 2` | [주입 버그 B1~B4](active/2026-10-26-injection-bugs-b1-b4.md) | 해결 대기 |
| 사용자 커밋 후 아카이브 | sync 스크립트, env 권한, pnpm 고정, hook 범위 | [devcontainer·hook](active/2026-10-26-devcontainer-hook-cleanup.md) | 해결 대기 |
| 사용자 커밋 후 아카이브 | `.DS_Store`·README·예제 정리. lock은 주간 upgrade | [의존성·문서 잡무](active/2026-10-26-deps-and-docs-chores.md) | 해결 대기 |
| typedoc·projen이 해당 메이저를 받을 때 | TS 6, pnpm 11+, Actions SHA, ESLint flat | [툴체인 메이저](active/2026-10-26-toolchain-majors.md) | 보류 |

---

## 갱신

이슈 상태가 바뀌거나 날짜가 확정되면 이 파일과 해당 이슈를 같이 고친다. 아카이브된 항목은 여기서 지운다.
