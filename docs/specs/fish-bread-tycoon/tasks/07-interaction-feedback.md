# 07 — 인터랙션 피드백 (손맛)

## Outcome

PERFECT/GOOD/BURNT 판정, 콤보 상승, 판매가 일어날 때 즉각적인 시각
피드백이 나타난다: 판정 텍스트와 점수 숫자가 튀어오르는 팝업, BURNT 시
화면 흔들림과 연기 효과(플레이스홀더), 콤보 상승 시 확대/축소 애니메이션,
틀을 클릭했을 때 눌리는 듯한 즉각적인 피드백. 사운드는 이번 작업 범위에서
제외한다.

## Blockers

- 02-cooking-state-flow — 피드백을 붙일 PERFECT/GOOD/BURNT 판정 이벤트가
  필요하다.
- 03-customer-orders-and-sales — 피드백을 붙일 판매 이벤트가 필요하다.
- 04-combo-system — 피드백을 붙일 콤보 상승 이벤트가 필요하다.

## Acceptance criteria

- [ ] PERFECT 판정 시 판정 텍스트와 점수 숫자가 나타났다가 위로 이동하며
      사라진다.
- [ ] GOOD 판정 시 PERFECT보다 작은 규모의 동일한 종류의 피드백이 나타난다.
- [ ] BURNT 판정 시 화면이 짧게 흔들리고 연기 효과(플레이스홀더)가
      나타난다.
- [ ] 콤보가 오를 때 콤보 숫자가 확대되었다가 원래 크기로 돌아오는
      애니메이션이 나타난다.
- [ ] 틀을 클릭하거나 대응 키를 누르면 눌리는 듯한 시각 피드백이 즉시
      나타난다.

## Constraints

효과음은 이번 작업 범위에 포함하지 않는다 (spec.md 가정: 사운드는 최저
우선순위). 연기/파티클 등은 `assets.md`의 실제 이미지 없이 CSS/JS로
구현하거나 단순 플레이스홀더로 표현한다 (spec.md 공유 제약).

## Verification

- 자동 테스트: 각 판정/콤보 상승/판매 이벤트가 발생했을 때 대응하는
  피드백 상태(클래스나 표시 상태)가 부여되는지 검증.
- 브라우저 확인: 실제로 플레이하며 각 피드백이 시각적으로 자연스럽게
  나타나는지 확인.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
