# devcontainer·hook 정리

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | `.devcontainer/`, `.husky/pre-commit` |
| **상태** | **보류** — 툴체인 현대화 최종 리뷰에서 Minor로 미룬 항목 |
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

- [ ] 위 항목을 하나씩 고치거나, 의도적으로 남긴다고 본문에 적는다
- [ ] `.devcontainer/.env`가 스테이징·tarball에 들어가지 않는다

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 핸드오프 P4를 이 이슈로 등록 |
