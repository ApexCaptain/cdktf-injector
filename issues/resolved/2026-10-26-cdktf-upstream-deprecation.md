# CDKTF upstream 지원 종료 — 프로젝트 방향 결정

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | 프로젝트 전체 (peer `cdktf`, `constructs`) |
| **상태** | **해결** — A안(유지보수 모드) 결정, README 공지 반영 |
| **해결일** | 2026-10-26 |
| **트리거** | 없음. 커뮤니티 fork가 npm에 릴리스되면 B안 재검토는 선택 |

## 배경

이 라이브러리는 cdktf `TerraformStack`/`TerraformElement` 위에서만 동작한다. peer는 `cdktf >=0.20.3 <0.22` ([resolved](../resolved/2026-10-26-cdktf-0-21-peer-dependency.md)).

## 실측

| 확인 | 결과 |
|------|------|
| `gh api repos/hashicorp/terraform-cdk` | `archived: true`, 마지막 push 2025-12-10 |
| `npm view cdktf version time.modified` | `0.21.0`, 2025-06-04 이후 릴리스 없음. npm `deprecated` 표시는 없음 |

## 문제

upstream이 더 이상 Terraform·provider 변화에 맞춰 갱신되지 않는다. 사용자는 점차 다른 도구로 이동하고, 이 레포의 툴체인 작업([툴체인 메이저](../active/2026-10-26-toolchain-majors.md))의 가치도 줄어든다.

## 접근 비교

| 안 | 내용 | 비용 | 위험 |
|----|------|------|------|
| A. 유지보수 모드 | 버그·보안 패치만. README에 upstream 아카이브 명시 | 낮음 | 사용자 이탈은 그대로 |
| B. 커뮤니티 fork 추종 | fork가 생기면 peer를 fork 패키지로 확장 | 중간 | fork 생존 불확실 |
| C. construct 일반화 | `constructs` 위 범용 DI로 분리하고 cdktf/AWS CDK 어댑터 | 높음 | 사실상 새 프로젝트 |
| D. 아카이브 | npm deprecate + GitHub archive | 낮음 | Nayuntech 등 기존 사용처 이전 필요 |

## 추천

**A**. 실사용처(Nayuntech.IaC)가 cdktf 0.21에 머무는 동안은 패치만 낸다. 메이저 툴체인 업은 보안·빌드 깨짐이 있을 때만. B의 트리거(fork 릴리스)가 오면 재검토.

## 결정

메인테이너가 **A안(유지보수 모드)** 을 골랐다. 폐기(D)는 하지 않는다. 현재 peer 범위에서 버그·보안 패치만 내고 새 기능은 넣지 않는다.

- README 상단에 유지보수 모드 공지 추가 (npm 페이지에도 다음 publish 때 반영)
- npm `deprecate`는 하지 않는다
- 툴체인 메이저는 보안·빌드 깨짐이 있을 때만 ([툴체인 메이저](../active/2026-10-26-toolchain-majors.md))

## 수용 기준

- [x] 메인테이너가 안을 고른다
- [x] A/D면 README와 npm 메타에 upstream 상태를 명시한다 (README. npm은 다음 publish 때 README로 반영)
- [x] 툴체인 메이저 이슈의 우선순위를 결정에 맞춘다

## 범위 밖

실제 이전(어댑터 작성, fork 대응)은 결정 후 별도 이슈.

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 프로젝트 평가 중 등록. upstream 아카이브 확인 |
| 2026-10-26 | 메인테이너가 A안(유지보수 모드) 결정. README 공지 추가, 툴체인 메이저 이슈 트리거 조정 |
| 2026-10-26 | 수용 기준 충족, 해결 처리. fork 릴리스 시 B안 재검토는 선택 사항으로 남김. `issues/resolved`로 이동 |
