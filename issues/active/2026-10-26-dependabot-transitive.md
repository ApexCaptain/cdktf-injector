# Dependabot 간접 의존성 알림

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | npm lock, Dependabot |
| **관련 코드** | `pnpm-lock.yaml`, `.projenrc.ts` `pnpmOptions.workspaceYamlOptions.overrides` |
| **상태** | **적용** — lock에 패치 버전 반영. Dependabot UI는 푸시 후 닫힘 확인 |
| **출처** | [의존성·문서 잡무](../resolved/2026-10-26-deps-and-docs-chores.md)에서 주간 upgrade에 맡긴 항목 |

## 배경

주간 `upgrade-develop`만으로는 열린 알림이 안 닫혔다. 런타임(`lodash`, `term-size`)은 열려 있지 않다. 예전 `yarn.lock` 알림은 이미 `fixed`.

## 문제

모두 `pnpm-lock.yaml`. 2026-10-26 API 기준 **open**.

| # | 패키지 | 심각도 | 설치된 쪽 | 패치 |
|---|--------|--------|-----------|------|
| [140](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/140) [139](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/139) [141](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/141) | `@modelcontextprotocol/sdk` | high / medium | rulesync가 `1.31.0` 고정 | 1.32.0+ |
| [124](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/124) | `flatted` | high | eslint → flat-cache `^3.2.9` | 3.4.2+ |
| [129](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/129) [137](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/137) | `brace-expansion` | high / medium | eslint → minimatch `^1.1.7` | 1.1.21 |
| [130](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/130) [133](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/133) [134](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/134) [121](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/121) [128](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/128) | `js-yaml` 3.x | high / medium | jest·rulesync `^3.13.1` | 3.15.2 |
| [126](https://github.com/ApexCaptain/cdktf-injector/security/dependabot/126) | `picomatch` 2.x | medium | jest → anymatch `^2.0.4` | 2.3.2 |

## 접근 비교

| 방법 | 장점 | 단점 |
|------|------|------|
| `pnpm update`만 | 범위 안이면 lock만 바뀜 | rulesync가 MCP를 `1.31.0`에 고정해서 안 올라감 |
| 취약 줄만 `pnpm-workspace.yaml` overrides | Dependabot이 다시 안 내려감 | 상위가 메이저를 받을 때까지 고정 |

**추천:** MCP는 override. 나머지는 같은 줄 selector로 패치 하한만 고정 (`js-yaml@3`, `brace-expansion@1`, `picomatch@2`). 4.x/5.x는 건드리지 않는다.

## 수용 기준

- [x] 위 열린 알림 패키지가 각 패치 버전 이상이다
- [x] 런타임 dependency·peer는 바꾸지 않는다
- [x] `pnpm exec projen test` 통과

## 범위 밖

- 이미 `fixed` / `auto_dismissed`인 알림
- TS 7, pnpm 11+, ESLint flat → [툴체인 메이저](2026-10-26-toolchain-majors.md)

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | Dependabot 열린 알림 12건을 이 이슈로 등록 |
| 2026-10-26 | `pnpm-workspace.yaml` overrides: MCP `1.32.2`, flatted `3.4.4`, js-yaml@3 `3.15.2`, brace-expansion@1 `1.1.21`, picomatch@2 `2.3.2`. 테스트 32개 통과 |
