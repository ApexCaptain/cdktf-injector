# cdktf 0.21 peer 범위 확대

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | 공개 계약 (`peerDependencies`) |
| **관련 코드** | `.projenrc.ts` `peerDeps` |
| **상태** | **해결** — `cdktf-injector@1.0.141` peer `>=0.20.3 <0.22` |
| **해결일** | 2026-10-26 |

## 배경

Nayuntech.IaC는 `cdktf-injector@1.0.139`를 cdktf **0.21.0**과 같이 쓴다. 현재 peer는 `cdktf ^0.20.3`이라 0.21에서 경고가 난다. Nayuntech 이슈 `2026-09-01-cdktf-injector-cdktf-0.21-peer-dependency.md`의 수용 기준을 이 레포에서 맞춘다.

툴체인 현대화 때 peer는 의도적으로 유지했다 ([resolved](../resolved/2026-10-22-toolchain-modernization.md)).

## 해결 요약

`1.0.141`을 npm에 올렸다. peer는 `cdktf >=0.20.3 <0.22`. Nayuntech에서 버전을 올리는 일은 이 레포 밖이다.

## 현재 상태

- peer: `cdktf >=0.20.3 <0.22`, `constructs ^10.3.0` (`1.0.141`)
- devDep `cdktf`는 하한 `0.20.3` 유지

이전: peer `cdktf ^0.20.3`.

## 목표

- injector에 cdktf 0.21을 허용하는 버전을 publish한다
- Nayuntech에서 그 버전으로 올린다 (그 레포 작업)
- Nayuntech에서 `pnpm projen` 때 peer 경고가 없다

## 추천

`.projenrc.ts`의 `peerDeps`를 `'cdktf@>=0.20.3 <0.22'`로 바꾼다. devDep `cdktf`는 `0.20.3`으로 두고, 0.21.0으로도 한 번 테스트한다 (CI 매트릭스 또는 수동).

## 수용 기준

- [x] peer가 `cdktf >=0.20.3 <0.22` (또는 동등 범위)
- [x] 0.20.3과 0.21.0에서 기존 테스트가 통과한다
- [x] 그 범위로 npm publish가 끝난다

## 범위 밖

Nayuntech 쪽 버전 올리기는 이 레포 밖이다. 특성 테스트·버그 수정은 별도 이슈. 배포 복구는 [resolved](../resolved/2026-10-26-npm-trusted-publishing.md).

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-22 | 툴체인 계획에서 Phase 2로 분리. peer 유지 |
| 2026-10-26 | 핸드오프 P1을 이 이슈로 등록 |
| 2026-10-26 | `1.0.140` npm 게시 완료 ([resolved](../resolved/2026-10-26-npm-trusted-publishing.md)). 착수 가능 |
| 2026-10-26 | `.projenrc.ts` peer를 `cdktf@>=0.20.3 <0.22`로 변경. `pnpm exec projen test` 10/10 (cdktf 0.20.3). 임시 `cdktf@0.21.0`에서도 10/10. devDep는 0.20.3으로 복구. 커밋 전 |
| 2026-10-26 | `02f2e74` 커밋, PR #120 머지, `cdktf-injector@1.0.141` 게시. **해결** |
