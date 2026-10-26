# 의존성·문서 잡무

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | lockfile, README, 예제, 저장소 잡무 |
| **상태** | **보류** |
| **트리거** | 사용자가 잡무를 재개할 때 |

## 배경

핸드오프 P5. 배포·peer·테스트·버그와 무관한 잔여 항목이다.

## 문제

- dev 의존성 transitive 취약점 22건(jest, eslint, commit-and-tag-version, @octokit, ts-node). `pnpm update`로 대부분 줄어들 가능성이 있다 (2026-10-22 감사)
- 이후 후보: TypeScript 6/7(typedoc 0.28은 TS 6.0까지), pnpm 11/12(projen `allowBuilds` 필요), Actions SHA 고정, ESLint flat config
- `.DS_Store`가 커밋돼 있다
- `README.md` terraform Dockerfile 안내가 오래됐다
- `markdown/*` 예제가 옛 provider API(`vpc.Vpc`)를 쓴다

## 수용 기준

- [ ] 착수한 항목만 본문에 체크하고, 손대지 않은 항목은 남겨 둔다
- [ ] 메이저 툴체인 업그레이드(TS 6, pnpm 11+)는 이 이슈에서 하지 않고 새 이슈로 뺀다

## 범위 밖

CDKTF deprecation 대응(유지보수 / 포크 / 범용 DI / 아카이브)은 방향이 정해지면 새 이슈.

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 핸드오프 P5를 이 이슈로 등록 |
