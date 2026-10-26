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
| 사용자 커밋·머지 승인 | `develop` 커밋 후 `main` 머지하면 1.0.141 publish. Nayuntech 버전 올리기는 이 레포 밖 | [cdktf 0.21 peer](active/2026-10-26-cdktf-0-21-peer-dependency.md) | 적용 |
| 사용자 커밋 승인 | generated 파일 규칙·`git@commit`/`git@pr`이 같은 묶음에 들어간다 | [커밋·PR generated](active/2026-10-26-github-generated-commit-pr.md) | 적용 |
| 사용자가 테스트 보강을 재개 | 현재 동작(async, lazy, defaultConfigure, output, backend, hook 순서, synth)을 테스트로 고정. 버그는 고치지 않음 | [특성 테스트](active/2026-10-26-feature-tests.md) | 보류 |
| 특성 테스트 이슈 해결 | B1~B4 수정. 메이저 bump 여부를 그때 결정 | [주입 버그 B1~B4](active/2026-10-26-injection-bugs-b1-b4.md) | 보류 |
| 사용자가 정리 작업을 재개 | sync 스크립트, env 권한, pnpm 고정, hook 범위 | [devcontainer·hook](active/2026-10-26-devcontainer-hook-cleanup.md) | 보류 |
| 사용자가 잡무를 재개 | lock 갱신, `.DS_Store`, README·예제. TS 6 / pnpm 11+는 새 이슈 | [의존성·문서 잡무](active/2026-10-26-deps-and-docs-chores.md) | 보류 |

---

## 갱신

이슈 상태가 바뀌거나 날짜가 확정되면 이 파일과 해당 이슈를 같이 고친다. 아카이브된 항목은 여기서 지운다.
