# 나만의 환율계산기

Apps in Toss 미니앱 `exchange-calculator`의 운영 문서입니다.

## 1) 앱 개요
- 목적: 나만의 환율계산기
- 분류: 유틸/생산성/생활
- 디렉터리: `exchange-calculator`

## 2) 식별 정보
| 항목 | 값 |
|---|---|
| displayName | 나만의 환율계산기 |
| appName | exchange-calculator |
| package name | exchange-calculator |
| version | 1.0.0 |
| primaryColor | #3182F6 |
| icon | https://raw.githubusercontent.com/jino123413/app-logos/master/exchange-calculator.png |

## 3) 개발/빌드/배포
```bash
npm install --legacy-peer-deps
npm run dev
npm run build
npm run deploy
```

### 스크립트 목록
| script | command |
|---|---|
| build | `granite build` |
| deploy | `ait deploy` |
| dev | `granite dev` |

## 4) 기술 스냅샷
- dependencies: 7개
- devDependencies: 7개
- 주요 의존성: @apps-in-toss/web-framework, @granite-js/native, react, react-dom, react-refresh, remixicon, tailwindcss

## 5) 문서/정책 체크
- 이용약관(`docs/terms.html`): True
- 개인정보처리방침(`docs/privacy.html`): True
- 레이아웃 구조(`docs/layout-structure.md`): True
- 아키텍처(`docs/architecture.md`): True
- 차별화(`docs/differentiation.md`): True
- 앱 내부 `.git`: True

## 6) docs 파일
- docs/architecture.md
- docs/differentiation.md
- docs/layout-structure.md
- docs/privacy.html
- docs/terms.html

## 7) 릴리즈 감독
- 루트에서 아래 명령으로 전체 게이트 점검:
```powershell
powershell -ExecutionPolicy Bypass -File .\audit-release-gates.ps1 -RootPath . -VaultPath .\wlsgh
```
