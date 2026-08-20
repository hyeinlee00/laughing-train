# 04 — 콤보 시스템

## Outcome

PERFECT 판정이 연속되면 콤보 수치가 오르고, GOOD 판정은 콤보를 유지한다.
EARLY/LATE 판정, 붕어빵이 타는 것, 주문 실패 중 하나라도 발생하면 콤보가
0으로 초기화된다. 콤보 수치가 높을수록 판매 금액에 콤보 보너스가 더해진다.

## Blockers

- 02-cooking-state-flow — 콤보를 올리고 끊는 기준이 되는 PERFECT/GOOD/
  EARLY/LATE/BURNT 판정 결과가 필요하다.
- 03-customer-orders-and-sales — 콤보 보너스가 적용되는 판매 동작과 콤보를
  끊는 "주문 실패" 상황이 필요하다.

## Acceptance criteria

- [x] PERFECT 판정이 발생할 때마다 콤보가 1씩 증가한다.
- [x] GOOD 판정이 발생하면 콤보 수치가 변하지 않는다.
- [x] EARLY 또는 LATE 판정이 발생하면 콤보가 0으로 초기화된다.
- [x] 붕어빵이 탄 상태가 되면 콤보가 0으로 초기화된다.
- [x] 콤보 수치에 비례한 보너스 금액이 판매 시 매출에 반영된다.

## Constraints

None.

## Verification

- 자동 테스트: PERFECT/GOOD/EARLY/LATE/BURNT/주문 실패 각 이벤트를 순서대로
  입력해 콤보 수치 변화가 규칙대로 나오는지 검증.
- 자동 테스트: 여러 콤보 수치에서 판매 시 콤보 보너스 계산이 올바른지 검증.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: `bunx vitest run` 34/34 통과 (콤보 증가/유지/초기화 규칙,
  콤보 보너스 계산, 화면 표시 포함), `bunx tsc --noEmit` 통과. 실제
  브라우저에서 PERFECT 연속 시 콤보가 x1로 오르고 EARLY 판정 시 x0으로
  초기화되는 것을 확인함.
- Blocker: —
- Revision: 승인된 spec.md와 이전 작업들 어디에도 "주문 실패"라는 별도
  이벤트가 정의되어 있지 않음(주문에 시간제한이 없어 실패할 수 없음)을
  확인함. 최초 작업 분할 초안에 원본 문서 문구가 그대로 남아있던 것이라
  판단해 "주문 실패" 조항을 인수 기준에서 제거하고 탄 상태 조항에 통합함.
  제품 계약(spec.md)의 승인된 범위·수용 기준에는 영향 없음.
