# 커밋·PR 초안을 `.github/generated`에 쓰기

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | 개발 워크플로, rulesync skills, npm scripts |
| **관련 코드** | `.rulesync/skills/generate-commit-message/`, `.rulesync/skills/generate-pull-request/`, `.projenrc.ts` |
| **상태** | **적용** — 스킬·스크립트·gitignore를 넣음. 커밋은 사용자 승인 후 |

## 배경

Nayuntech.IaC는 커밋 메시지와 PR title/body를 `.github/generated/` 파일로 쓰고 `pnpm git@commit` / `pnpm git@pr`로 실행한다. 이 레포에는 그 규칙이 없어서 에이전트가 채팅에만 문구를 남겼다.

## 현재 상태

- 스킬 SSOT: `.rulesync/skills/`
- 스크립트: `git@commit`, `git@pr` (`--base main`)
- `.github/generated`와 생성 skill 디렉터리는 gitignore
- prefix는 PR lint와 같이 `feat` / `fix` / `chore`만

## 수용 기준

- [x] 커밋 메시지 요청 시 `.github/generated/commit-message.txt`에 쓴다
- [x] PR 요청 시 title·body 두 파일을 쓴다
- [x] `package.json`에 `git@commit`, `git@pr`이 있다
- [ ] 사용자 승인 후 이 변경이 커밋된다

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 사용자가 Nayuntech와 같은 generated 파일 규칙·스크립트를 요청. 스킬과 `git@*` 스크립트 추가 |
