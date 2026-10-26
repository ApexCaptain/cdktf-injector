# devcontainer·hook 정리

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | `.devcontainer/`, `.husky/pre-commit` |
| **상태** | **해결 대기** — 스크립트·hook 정리 완료. 사용자 커밋 후 아카이브 |
| **트리거** | 사용자가 정리 작업을 재개할 때 |

## 배경

Node 24·pnpm 전환은 끝났다. 아래는 동작에는 필수가 아닌 정리 목록이다.

## 문제

- `synchronizeProject.sh`: `set -euo pipefail` 없음. `pnpm i --no-frozen-lockfile`을 컨테이너를 켤 때마다 실행해 lock이 바뀔 수 있다
- `updateContentCommand.sh`: `corepack prepare pnpm@latest`를 `pnpm@10.33.0`으로. `parallel`로 작업 1개를 도는 것은 불필요
- `initializeCommand.sh`: `.env`(GH_TOKEN)가 기본 umask. `chmod 600` 또는 `umask 077`
- 컨테이너를 켤 때마다 `npm i -g @anthropic-ai/claude-code`를 버전 고정 없이 설치
- devcontainer projen feature가 버전 고정 없는 전역 projen을 설치 (실제로는 로컬 `pnpm projen`만 씀)
- `docker-compose.dev.yml`의 `USER_NAME` build arg는 사용처 없음. `postStartCommand.sh`의 `git pull`은 `--ff-only`가 낫다
- pre-commit docgen이 스테이징이 아니라 작업 트리 기준

## 수용 기준

- [x] 위 항목을 하나씩 고치거나, 의도적으로 남긴다고 본문에 적는다
- [x] `.devcontainer/.env`가 스테이징·tarball에 들어가지 않는다 (`.devcontainer/.gitignore` + `.npmignore`의 `.devcontainer`)

## 조치

| 항목 | 조치 |
|------|------|
| `synchronizeProject.sh` | `set -euo pipefail`, `pnpm i --frozen-lockfile` |
| `updateContentCommand.sh` | `pnpm@10.33.0` 고정. `parallel` 제거 (apt 패키지에서도 제거) |
| `initializeCommand.sh` | `umask 077` + `chmod 600` |
| claude-code | 버전은 고정하지 않음 (CLI가 자주 올라감). 이미 있으면 재설치하지 않음 |
| projen feature | `devcontainer.json`에서 제거. `pnpm projen`만 사용 |
| `USER_NAME` | compose build arg 제거. Dockerfile이 쓰지 않음 |
| `git pull` | `--ff-only` |
| pre-commit | staged `src/`·`typedoc.json`이 있을 때만 docgen. unstaged `src`가 있으면 `stash --keep-index` |

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 핸드오프 P4를 이 이슈로 등록 |
| 2026-10-26 | 위 표대로 정리. claude-code 버전 고정만 의도적으로 남김 |
