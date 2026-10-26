# npm 1.0.140 배포 실패 — Trusted Publisher 미등록

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | npm 배포, `.github/workflows/release.yml`, Trusted Publishing |
| **관련 코드** | `.projenrc.ts` (`npmTrustedPublishing: true`), `.github/workflows/release.yml` (`release_npm`) |
| **상태** | **해결** — Trusted Publishing으로 `1.0.140` 게시. `NPM_TOKEN` 삭제 확인 |
| **해결일** | 2026-10-26 |

## 해결 요약

사용자가 npm Trusted Publisher(`ApexCaptain/cdktf-injector`, `release.yml`, `npm publish` 허용)를 등록한 뒤, 실패한 run `39926838425`를 재실행해 `cdktf-injector@1.0.140`을 OIDC로 게시했다. GitHub Release와 `v1.0.140` 태그도 생겼다. 사용자는 GitHub 시크릿 `NPM_TOKEN`을 지웠고, `gh secret list`에 그 이름은 없다.

## 배경

툴체인 현대화(PR #118)와 Trusted Publishing 전환(PR #119)은 `main`에 있다. `release` job은 두 번 모두 버전을 `1.0.140`으로 정했고 아티팩트도 만들었다. npm publish와 그에 의존하는 GitHub Release·`v1.0.140` 태그는 실패했다. npm 최신은 여전히 `1.0.139`.

근거: `tmp/handoff/README.md` 1절. 로컬 핸드오프는 SSOT가 아니다.

## 문제

| 실행 | 커밋 | 증상 | 원인 |
|------|------|------|------|
| run `39751341935` | `dd94c30` (PR #118) | `E404 Not Found - PUT .../cdktf-injector` | 2023-07-06 `NPM_TOKEN`을 npm이 거부 |
| run `39926838425` | `d973f85` (PR #119) | `ENEEDAUTH need auth` | OIDC 토큰 교환 실패. Trusted Publisher 미등록이 유력 |

워크플로 쪽은 이미 맞다. `release_npm`에 `permissions.id-token: write`, `NPM_TRUSTED_PUBLISHER: "true"`, `NPM_CONFIG_PROVENANCE: "true"`. 파일명은 `release.yml`. GitHub Environment는 쓰지 않는다.

## 사용자가 할 일 (Trusted Publisher 등록)

패키지 **쓰기 권한**이 있는 npm 계정으로 로그인한다. 계정 설정이 아니라 **패키지 설정**이다.

1. 브라우저에서 [https://www.npmjs.com/package/cdktf-injector/access](https://www.npmjs.com/package/cdktf-injector/access) 를 연다
2. **Trusted Publisher** / **Trusted publishing** 섹션에서 GitHub Actions를 고른다
3. 아래 값을 그대로 넣는다

   | 항목 | 값 |
   |------|------|
   | Organization or user | `ApexCaptain` |
   | Repository | `cdktf-injector` |
   | Workflow filename | `release.yml` (경로 없이 파일명만, 확장자 포함) |
   | Environment | 비워 둠 |

4. Allowed actions에서 **`npm publish`를 허용**한다. 이 레포는 `publib-npm`이 직접 publish한다. `npm stage publish`만 켜 두면 지금 워크플로는 실패한다
5. 저장한 뒤 이 채팅에 “등록했다”고 알려 준다. 코드 변경 없이 `gh run rerun 39926838425 --failed`로 같은 1.0.140 아티팩트를 다시 배포한다

문서: [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers/)

**만료:** 새로 만든 Trusted Publisher는 첫 성공 publish로 검증되기 전 **2일**이 지나면 만료된다. 등록과 재실행을 같은 날 하는 것이 안전하다. 만료되면 지우고 다시 만든다. 기존 연결은 수정할 수 없고, 바꾸려면 삭제 후 재생성이다.

## 등록 후에도 실패하면

- 실패한 job 로그에서 `npm -v` 확인. Trusted Publishing은 npm **11.5.1+**
- `publib-npm`이 `NPM_TRUSTED_PUBLISHER`를 보고 토큰 없이 publish하는지
- 확인용 커밋 없이 `gh workflow run release.yml -f dry_run=true`

## 수용 기준

- [x] npmjs.com에 위 표와 같은 Trusted Publisher가 있다
- [x] `npm view cdktf-injector version`이 `1.0.140`
- [x] GitHub Release와 `v1.0.140` 태그가 있다
- [x] 사용자 확인 후 `gh secret delete NPM_TOKEN` (더 이상 쓰지 않음)

## 범위 밖

- B안(새 granular `NPM_TOKEN` + `npmTrustedPublishing` 되돌리기)은 Trusted Publisher가 계속 실패할 때만
- peer 확대 후 publish는 [cdktf 0.21 peer](2026-10-26-cdktf-0-21-peer-dependency.md)

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-22 | PR #118 머지 후 release #1 실패 (`E404`, 옛 `NPM_TOKEN`) |
| 2026-10-23 | PR #119 Trusted Publishing 코드 머지. release #2 실패 (`ENEEDAUTH`) |
| 2026-10-26 | 핸드오프에서 P0로 정리. 사용자: Trusted Publisher 등록 방법을 몰라 아직 안 함. 이 이슈 등록 |
| 2026-10-26 | 사용자가 npm Trusted Publisher 연결 완료 (`ApexCaptain/cdktf-injector`, `release.yml`, Environment 없음, `npm publish` 허용). `gh run rerun 39926838425 --failed` |
| 2026-10-26 | 재실행 성공. `+ cdktf-injector@1.0.140`, provenance 게시. [run](https://github.com/ApexCaptain/cdktf-injector/actions/runs/39926838425), [Release](https://github.com/ApexCaptain/cdktf-injector/releases/tag/v1.0.140). `NPM_TOKEN` 삭제는 확인 대기 |
| 2026-10-26 | 사용자가 `NPM_TOKEN` 삭제. 레포 시크릿 목록에 없음. **해결** · `issues/resolved` 이동 |
