# 툴체인 현대화 (Node 24 · projen 0.104 · pnpm 10)

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-22 |
| **해결일** | 2026-10-22 |
| **영역** | 개발·CI 툴체인 (Node, projen, pnpm, TypeScript, devcontainer) |
| **관련 코드** | `.projenrc.ts`, `package.json`, `pnpm-lock.yaml`, `.github/workflows/`, `.devcontainer/`, `projenrc/generate-husky-hooks.ts` |
| **상태** | **해결** — 라이브러리 동작과 공개 계약은 유지한 채 툴체인만 이전했다. `develop`에 있고 `main`에도 머지되었다 |

## 해결 요약

Node 24, projen 0.104.11, pnpm 10.33.0, TypeScript ~5.9.3, Jest 30, typedoc 0.28, husky 9로 옮겼다. `engines.node`는 `>= 22.0.0`이다. peer는 `cdktf ^0.20.3`, `constructs ^10.3.0` 그대로다. 배포 tarball 최상위는 `LICENSE`, `README.md`, `lib`, `package.json`만 남도록 package ignore를 맞췄다.

실행 순서: yarn을 유지한 채 projen·TS를 올린 뒤, lock을 pnpm으로 옮기고, devcontainer에서 Node 24를 고정하고 yarn을 제거했다.

## 배경

요청(2026-10-22)은 Node 최신 고정, projen 최신화, yarn classic에서 pnpm으로의 전환이었다. 소비자 계약(peer, 런타임 dependency, `src/` 동작)은 이번 범위가 아니었다.

로컬 작업 계획 `tmp/plans/2026-10-22-toolchain-modernization.md`와 `tmp/plans/README.md`는 git에 없다. 이 문서가 그 결정과 결과의 SSOT다.

## 결정

| 결정 | 근거 |
|------|------|
| projen 업그레이드 후 pnpm 전환 | 메이저 업그레이드와 패키지 매니저 전환을 한 단계에 섞지 않는다 |
| pnpm **10.33.0** | 레퍼런스와 같은 버전. projen 0.104는 pnpm 11+의 `allowBuilds`를 지원하지 않는다 |
| Node **24**, `engines.node >= 22.0.0` | 2026-10-22 기준 24가 Active LTS. 22는 2027-04까지 유지보수 |
| TypeScript **~5.9.3** | projen 0.104의 eslint가 TS 4.4를 받지 않는다. typedoc 0.28은 TS 7을 지원하지 않고, 6은 tsconfig deprecation 대응이 따로 필요했다 |
| husky 9 + `projenrc/generate-husky-hooks.ts` | 기존 `project/` 보조 코드는 husky v7 API에 묶여 있었다 |
| pre-commit은 `git add docs`만 | `git add -A`가 작업 트리 전체를 스테이징하던 위험을 없앤다. pre-push 토픽 배포는 `deploy-topics` 수동 태스크 |
| `test/tmp.ts`와 `@cdktf/provider-aws` devDep 삭제 | 테스트가 아닌 스크래치 |
| peer 범위 유지 | 소비자 계약 변경은 후속 이슈 |

## 수용 기준

- [x] `package.json`의 projen `^0.104.11`, `packageManager` `pnpm@10.33.0`, `engines.node` `>= 22.0.0`
- [x] peer `cdktf ^0.20.3`, `constructs ^10.3.0`. 런타임 dependency는 당시 `lodash ^4.17.21`, `term-size 2.2.1` 유지
- [x] CI `node-version`은 24, pnpm action `10.33.0`. `upload-artifact@v1/v2`, `set-output`, Node 14 워크플로 없음
- [x] `yarn.lock` 삭제, `pnpm-lock.yaml`·`pnpm-workspace.yaml` 생성. devcontainer sync가 yarn을 끄고 pnpm·husky를 실행
- [x] 공개 export는 `TerraformInjectorFactory`, `TerraformInjectorStack`, `TerraformInjectorStackAsync`
- [x] pre-commit hook은 `pnpm exec projen docgen && git add docs`만 실행

## 후속 (범위 밖, 이슈 없음)

아래는 당시 “별도 계획”으로 남긴 항목이다. 일정이 없어서 `issues/schedule.md`에는 올리지 않았다. 착수할 때 `issues/active/`에 새 이슈를 만든다.

| 단계 | 내용 |
|------|------|
| 2 | peer를 `cdktf >=0.20.3 <0.22`로 넓히고 publish |
| 3 | 특성 테스트 보강 (async, lazy, defaultConfigure, addOutput, backend, 콜백) |
| 4 | 버그 B1~B4, sync/async 로직 통합 (3단계 테스트 이후) |
| 5 | TypeScript 6, pnpm 11/12, Actions SHA 고정, `minimumReleaseAge` |
| — | CDKTF deprecation 대응 방향 |

이 이슈를 닫은 뒤 별도 커밋으로 lodash 하한을 `^4.18.1`로 올렸고, typedoc 소스 링크 수정, VS Code TypeScript SDK, npm trusted publishing이 이어졌다. 그 커밋들은 이 이슈의 범위가 아니다.

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-22 | 현대화 목표와 실행 계획 작성 |
| 2026-10-22 | `2eec4c5` projen 0.104·툴체인 업그레이드. `59023cf` prettier 3 포맷. `7571e50` typedoc 0.28 문서 재생성 |
| 2026-10-22 | `b2aaf93` yarn classic → pnpm 10.33.0 |
| 2026-10-22 | `2d2c9f2` devcontainer Node 24 고정, sync를 pnpm으로 전환, husky 활성화. **해결** |
| 2026-10-22 | PR #118로 `main`에 머지 (`dd94c30`) |
| 2026-10-26 | 이 문서로 `issues/resolved`에 아카이브. 로컬 `tmp/plans` 체크리스트는 완료 표시를 하지 않은 채 남아 있다 |
