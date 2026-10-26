---
name: generate-pull-request
description: PR title·body 생성 요청 시 base branch 대비 브랜치 전체 diff 검토 후 .github/generated/pull-request-title.txt, pull-request-body.md에 작성한다. Use when the user asks for a PR body, pull request draft, or similar.
targets:
  - '*'
---
# PR title·body 생성

사용자가 **PR body**, **pull request 작성**, **pull-request**, **PR 본문** 등을 요청하면 아래 순서를 따릅니다.  
**`gh pr create` / `git push`는 사용자가 명시적으로 요청할 때만** 실행합니다. 실행할 때는 `pnpm git@pr`을 씁니다.

> **범위:** PR title·body는 **마지막으로 merge된 base branch 대비 현재 브랜치 전체 변경**을 요약한다.  
> 최신 커밋 하나, `git diff`(unstaged/staged), 작업 트리 일부만 기준으로 쓰지 않는다.  
> 단일 커밋 메시지는 **`generate-commit-message`** skill을 따른다.

## 1. Git 변경사항 확인 (PR 전체 범위)

### 1-1. base branch 결정

**병렬**로 실행:

- `git status`
- `git branch -vv` (upstream·추적 브랜치 확인)
- `git log -5 --oneline` (문체 참고용)

base branch는 아래 순서로 정한다.

1. 사용자가 base를 명시했으면 그 브랜치
2. 현재 브랜치가 `develop`이면 **`main`** (이 레포는 develop → main으로 배포한다)
3. feature 브랜치면 **`develop`**
4. 그 외는 현재 브랜치의 upstream, 없으면 `main`

원격 최신 기준: `git fetch origin` 후 `origin/<base>` 사용.

### 1-2. PR에 포함될 전체 변경 조회 (필수)

base를 `main`이라 할 때, **병렬**로 실행:

- `git log origin/main..HEAD --oneline` — PR에 실릴 **모든 커밋**
- `git diff origin/main...HEAD` — PR **전체 diff** (merge-base 기준)
- 필요 시 `git diff --stat origin/main...HEAD`

**반드시** 위 범위의 커밋·diff를 모두 검토한 뒤 title·body를 작성한다.  
unstaged/staged만 보고 PR을 쓰지 않는다. (아직 커밋 안 된 변경도 PR에 넣을 계획이면 status도 참고하되, **요약 범위는 base..HEAD가 기본**.)

## 2. PR 템플릿 참조

반드시 **`.github/pull_request_template.md`** 를 읽는다.

이 레포 템플릿은 `Fixes #` 한 줄뿐이다. GitHub Issue를 닫지 않으면 그 줄을 **넣지 않는다**. 본문은 아래 섹션만 쓴다.

| 섹션 | 필수 | 비울 때 |
|------|------|---------|
| Summary | 예 | 항상 작성 |
| Test plan | 예 | 검증 항목이 없으면 섹션 삭제 (드묾) |
| Additional notes | 아니오 | 리뷰어 참고·제한·후속 작업 없으면 **섹션 삭제** |

- HTML 주석과 placeholder는 넣지 않는다
- 빈 섹션을 `N/A` / `None` / `Fixes #` 빈 줄로 채우지 않는다
- 변경 유형은 **PR title prefix**로만 표기 — prefix 규칙은 **`generate-commit-message`** skill과 같다 (`feat` / `fix` / `chore`)

## 3. Secret 누출 검사

**`generate-commit-message`** skill과 동일한 기준으로 검사합니다. 이상 있으면 파일을 작성하지 않고 경고합니다.

## 4. PR title·body 작성

이상 없으면 아래 **두 파일만** 작성합니다. 디렉터리가 없으면 생성.

| 파일 | 내용 |
|------|------|
| **`.github/generated/pull-request-title.txt`** | PR title **한 줄만** |
| **`.github/generated/pull-request-body.md`** | 본문 (`## Summary`부터) |

- `pull-request.md` 등 **다른 경로에 쓰지 않음**
- title·body를 **한 파일에 합치지 않음**

### pull-request-title.txt

- **한 줄**, 줄바꿈 없음 (마지막 개행 1개는 허용)
- 형식: `{prefix}: {요약}` — **`generate-commit-message`** skill의 prefix 규칙과 동일
- **요약 대상:** `origin/<base>..HEAD` **전체 변경** (여러 커밋·파일이면 공통 주제로 묶음)
- 마지막 커밋 메시지를 그대로 복사하지 않음
- `pnpm git@pr` / `gh pr create --title "$(cat .github/generated/pull-request-title.txt)"` 에 그대로 사용

### pull-request-body.md

- **title 없음** — `## Summary`부터 시작
- **Summary·Test plan:** base 대비 **브랜치 전체** diff·커밋 목록 반영 (최신 커밋만 X)
- 커밋이 여러 개면 Summary bullet에 주요 변경을 모두 담거나 논리적으로 묶음
- **빈 섹션·placeholder 없이**, 내용 있는 섹션만 포함
- `pnpm git@pr` / `gh pr create --body-file .github/generated/pull-request-body.md` 에 그대로 사용

- HEREDOC 등으로 파일에 직접 기록
- 채팅에는 **PR title 한 줄** + 요약 전달해도 됨

## 하지 않을 것

- 사용자 요청 없이 `gh pr create` / `git push` 실행
- 템플릿을 읽지 않고 임의 형식으로만 작성
- secret이 의심되는 변경을 무시하고 본문 작성
- **내용 없는 섹션에 `N/A`·`None`·빈 `Fixes #`만 남기기**
- **`git diff`(staged/unstaged)나 최신 커밋만 보고 PR title/body 작성**
- **title과 body를 `pull-request.md` 한 파일에 합쳐 작성**
