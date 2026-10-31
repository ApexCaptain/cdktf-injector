# 인젝터 레지스트리가 App 경계를 넘어 섞임

| 항목 | 내용 |
|------|------|
| **등록일** | 2026-10-26 |
| **영역** | core — 인젝터 레지스트리, `inject()` 범위 계산 |
| **관련 코드** | `src/components/core/constants/terraform-injector.factory.constant.ts` (`injectorMap`), `src/components/core/functions/commit-injection.ts` (`isScopeUnder`, `getInjectorsUnder`), `src/components/core/functions/get-caller.function.ts` |
| **상태** | **해결** — 범위 계산, 동기 경로 Promise, 늦은 `afterInitElement`, `term-size` 수정. 메모리 누수는 수정하지 않기로 결정 |
| **해결일** | 2026-10-26 |

## 증상

같은 프로세스에 `App`이 둘 있고 같은 경로의 construct가 있으면(예: 두 App 모두 `'S'` 스택) 한쪽 `inject()`가 다른 App의 요소까지 생성한다. App 루트(경로 `''`)에서 `inject()`하면 프로세스의 모든 App 인젝터가 대상이 된다.

## 재현

```ts
const s1 = new TerraformStack(new App(), 'S');
const s2 = new TerraformStack(new App(), 'S');
const i2 = TerraformInjectorFactory.scopesOn(s2);
const c = i2.provide(MockElement, 'x', () => ({}));
TerraformInjectorFactory.scopesOn(s1).inject();
c.element; // 생성돼 있음 (기대: 미초기화 에러)
```

## 원인

- `injectorMap`은 모듈 전역 `Map<Construct, Injector>`이고 비워지지 않는다
- `isScopeUnder`가 `node.path` 문자열 접두어로 비교했다. 경로는 App 안에서만 유일하다

## 조치

- `isScopeUnder(ancestorScope, targetScope)`를 construct identity로 바꿨다. `node.scope`를 따라 올라가며 `===` 비교. `InvalidScopePathError` 판정도 같은 함수를 쓴다
- 회귀 테스트: `test/registry.test.ts` (다른 App 동명 스택, App 루트 inject, 다른 App 동일 경로 의존 → `InvalidScopePathError`, 접두어가 같은 형제 스택)

### 같이 발견·수정: `getCaller` 위치 오류

테스트 보강 중 발견. `getCaller(index)`가 고정 프레임 인덱스를 써서 `TerraformInjectorStack(Async)`를 거친 등록은 호출 위치가 한 칸 어긋났다 (jest 내부나 라이브러리 내부 경로가 찍힘). 라이브러리 루트(`src/` 또는 `lib/`) 밖의 첫 프레임을 고르도록 바꿨다. 프레임이 없으면 `'<unknown>'`. 테스트: `test/factory.test.ts`.

### 패치로 수정: 동기 경로 Promise, 늦은 `afterInitElement`

유지보수 모드 결정([CDKTF upstream 지원 종료](../resolved/2026-10-26-cdktf-upstream-deprecation.md))으로 메이저가 사실상 없으므로, 아래 둘은 패치로 처리했다.

| 항목 | 이전 | 이후 |
|------|------|------|
| 동기 인젝터의 Promise | configure·`afterInitElement`·`afterDependenciesInjected`·`onNewElementInjected`가 Promise를 반환하면 `void`로 버림. 작업은 `inject()` 이후에 실행되고, reject하면 처리되지 않은 rejection으로 **프로세스가 죽음**(jest 워커 다운으로 확인). configure Promise는 그대로 요소 config로 들어감 | `TerraformInjectorConflictedInjectingMethodTypeError`를 던진다. Promise에는 no-op catch를 붙여 처리되지 않은 rejection을 막는다 (`throwIfPromise`, `terraform-injector.element-container.class.ts`) |
| 늦은 `afterInitElement` | 이미 초기화된 컨테이너에 나중에 등록하면 영원히 실행 안 됨 (`afterDependenciesInjected`는 실행됨) | 다음 `inject()`에서 한 번 실행. `onNewElementInjected`는 요소당 한 번만 (`isNewElementNotified`). `isInjected`/스킵 판정은 `isSettled`(초기화 + 대기 콜백 없음) 기준 |

호환성: 동기 인터페이스 콜백 타입이 `=> void`라 async 함수를 넘겨도 컴파일된다. await 없는 async 콜백을 동기 인젝터에 쓰던 코드는 이제 throw한다. 이전에도 await가 있으면 순서가 깨지고 reject 시 프로세스가 죽었으므로 버그 수정으로 본다. 릴리스 노트에 적는다.

테스트: `test/lifecycle.test.ts`(늦은 등록 3건, 동기 Promise 5건), `test/async.test.ts`(비동기 늦은 등록, 대기 중인 중첩 async 인젝터).

## 해결 요약

- App 경계·`getCaller`·동기 경로 Promise·늦은 `afterInitElement`는 위 조치대로 수정
- `term-size` 제거, 아래 "남은 일 처리" 참고
- 메모리 누수는 수정하지 않기로 결정 (근거는 아래)

## 남은 일 (등록 당시)

| 항목 | 내용 |
|------|------|
| 메모리 | `injectorMap`이 App이 사라져도 인젝터를 붙잡는다. 루트 construct 기준 `WeakMap`으로 나누면 해결되지만 공개 export `injectorMap`(`Map`)의 형태가 바뀐다. 유지보수 모드에서는 실사용 문제가 생길 때만 |
| `term-size` | 순환 에러 메시지 폭 계산에만 쓴다. 터미널 폭이 15 미만이면 `RegExp('.{1,-n}')`로 깨질 수 있다. `process.stdout.columns ?? 80` + 하한으로 대체 |

이전 "남은 일 (다음 메이저)"에 있던 동기 경로 Promise 무시·늦은 `afterInitElement`는 위에서 패치로 처리했다.

## 남은 일 처리

| 항목 | 결정 | 내용 |
|------|------|------|
| `term-size` | 수정 | 의존성 제거. 폭은 `Math.max(process.stdout.columns ?? 80, 40)` (`terraform-injector.element-container-dependency-cycle.error.ts`). 테스트: `test/dependency.test.ts` (columns `undefined`·1·10) |
| 메모리 | 수정 안 함 | 아래 근거 |

메모리 누수를 고치지 않는 근거:

- cdktf 사용은 `cdktf synth`/`deploy`가 `main.ts`를 한 번 실행하고 프로세스가 끝나는 형태다. 프로세스 종료와 함께 `injectorMap`도 사라진다
- Jest는 테스트 파일마다 모듈 레지스트리를 새로 만들므로 `injectorMap`도 파일 단위로 초기화된다. 파일 안의 App 수십~수백 개는 체감 문제가 없다
- 같은 프로세스에서 App을 계속 만드는 경우(watch, 서버 내 synth)만 누적되는데 cdktf에서 흔하지 않고, upstream 아카이브로 새 사용처도 기대하기 어렵다
- 고치려면 공개 export `injectorMap`(`Map`) 형태가 바뀌어 메이저가 필요하다. 유지보수 모드([CDKTF upstream 지원 종료](../resolved/2026-10-26-cdktf-upstream-deprecation.md))와 맞지 않는다
- 비파괴 대안(`TerraformInjectorFactory.reset()` 같은 정리 함수)도 요청한 사용처가 없어 넣지 않는다. 실제 요구가 생기면 새 이슈로 연다

## 수용 기준

- [x] 다른 App의 같은 경로 construct가 `inject()` 범위에 들어가지 않는다
- [x] 다른 App 요소 의존은 `TerraformInjectorInvalidScopePathError`
- [x] 회귀 테스트 추가, 전체 테스트 통과
- [x] 동기 경로 Promise 감지, 늦은 `afterInitElement` 실행
- [x] 메모리·`term-size` 처리 또는 별도 이슈로 분리 (`term-size` 제거, 메모리는 수정 안 함으로 결정)

## 타임라인

| 일시 | 내용 |
|------|------|
| 2026-10-26 | 프로젝트 평가 중 임시 테스트로 재현해 등록 |
| 2026-10-26 | identity 기반 `isScopeUnder`로 수정, `test/registry.test.ts` 추가. 테스트 재구성 중 `getCaller` 오프셋 버그 발견·수정. 125개 테스트 통과 |
| 2026-10-26 | 유지보수 모드 결정에 따라 동기 경로 Promise 감지·늦은 `afterInitElement`를 패치로 수정. 135개 테스트 통과 |
| 2026-10-26 | `term-size` 제거, `process.stdout.columns` + 하한 40으로 대체. 메모리 누수는 cdktf 실행 형태(단발 프로세스)·Jest 파일 단위 모듈 초기화를 근거로 수정 안 함 결정. 138개 테스트 통과. 해결 처리, `issues/resolved`로 이동 |
