# 나만의 환율계산기 - Architecture

- app: exchange-calculator
- domain: 유틸/생산성/생활

## Component Layers
- App shell (routing/state root)
- Feature components
- Shared UI/util hooks

## Data Flow
1. User input
2. Core computation / lookup
3. Result rendering
4. Optional ad-gated extension

## Integrations
- Apps in Toss Web Framework
- Local storage / ad / haptic (if used)

## Risks
- Document app-specific edge cases and fallbacks.
