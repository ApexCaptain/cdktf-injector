---
name: generate-commit-message
description: 커밋 메시지 생성 요청 시 staged/unstaged diff 검토 후 .github/generated/commit-message.txt에 작성한다. Use when the user asks for a commit message, commit-message.txt, or similar.
targets:
  - '*'
---
# 커밋 메시지 생성

사용자가 **커밋 메시지 생성**, **commit message 작성**, **commit-message.txt** 등을 요청하면 아래 순서를 따릅니다.  
**`git commit`은 사용자가 명시적으로 요청할 때만** 실행합니다. 실행할 때는 `pnpm git@commit`을 씁니다.

> **범위:** **다음 커밋에 담을** staged/unstaged 변경만 요약한다.  
> PR title·body는 **`generate-pull-request`** skill을 따른다.

## 1. Git 변경사항 확인

다음 명령을 **병렬**로 실행합니다.

- `git status`
- `git diff` (staged + unstaged)
- `git log -5 --oneline` (최근 커밋 메시지 스타일 참고)

## 2. Secret 누출 검사

staged/unstaged 변경에 아래가 포함되면 **파일을 작성하지 않고** 사용자에게 경고합니다.

- `.env`, `credentials.json`, `*.pem`, `*.key`, kubeconfig 원문
- API token, password, private key, client secret 등 민감 값
- 커밋 대상에 secrets 파일이 있으면 제외할 것을 안내

## 3. 커밋 메시지 작성

이상 없으면 **`.github/generated/commit-message.txt`** 에만 작성합니다.

- 디렉터리가 없으면 생성
- **제목(첫 줄)** 은 반드시 아래 prefix 중 하나로 시작: `feat`, `fix`, `chore`  
  (`pull-request-lint`가 이 세 가지만 허용한다)
  - 형식: `{prefix}: {요약}` (예: `fix: widen cdktf peer to 0.21`)
  - prefix 선택 기준:
    - `feat` — 사용자·소비자에 보이는 기능 추가·변경 (minor)
    - `fix` — 버그·오동작·배포 실패·계약 구멍 수정 (patch)
    - `chore` — 빌드, CI, 의존성, 포맷, 문서, 개발 도구 등 부수 작업 (patch)
- 본문이 있으면 1~2문장, **why** 중심 (이 저장소 스타일)
- HEREDOC 등으로 파일에 직접 기록
- 채팅에는 요약만 전달해도 됨

## 하지 않을 것

- 사용자 요청 없이 `git commit` / `git push` 실행
- secret이 의심되는 변경을 무시하고 메시지 작성
- `test:` / `dev:` 등 lint가 거부하는 prefix 사용
