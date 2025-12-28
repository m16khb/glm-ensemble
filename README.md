# glm-ensemble

z.ai GLM-4.7 기반 멀티에이전트 앙상블 시스템. 4개 역할(분석/검토/최적화/보안)의 병렬 처리로 최상의 응답을 제공합니다.

## 기능

- **병렬 멀티에이전트**: 4개 전문 역할이 동시에 분석
  - 🔍 Analyst: 심층 분석
  - 📋 Reviewer: 코드/문서 검토
  - ⚡ Optimizer: 성능 최적화
  - 🔒 Security: 보안 검토
- **앙상블 종합**: 모든 관점을 통합한 최적 솔루션
- **하이브리드 트리거**: 명령어 + 키워드 자동 감지

## 설치

```bash
# GitHub에서 클론
git clone https://github.com/m16khb/glm-ensemble.git ~/.claude/plugins/glm-ensemble

# MCP 서버 의존성 설치
cd ~/.claude/plugins/glm-ensemble/mcp-server
npm install
```

## 설정

`~/.claude/glm-ensemble.local.md` 파일 생성:

```markdown
# GLM Ensemble 설정

## API 설정
- GLM_API_KEY: your-api-key-here
- GLM_API_BASE: https://api.z.ai/api/coding/paas/v4
- GLM_MODEL: glm-4.7

## 병렬 처리 설정
- MAX_PARALLEL: 4
- THINKING_MODE: interleaved
```

## 사용법

### 명령어

```bash
# 멀티에이전트로 질문
/glm-ask 이 코드를 어떻게 개선할 수 있을까?

# 코드/문서 병렬 분석
/glm-analyze src/main.ts

# 설정 확인
/glm-config
```

### 자동 트리거

다음 키워드가 포함되면 자동으로 GLM 앙상블이 활성화됩니다:
- "분석해줘", "분석해주세요"
- "최적화해줘", "최적화해주세요"
- "GLM으로", "GLM 사용해서"
- "검토해줘", "리뷰해줘"

## 아키텍처

```
┌─────────────────────────────────────────────────────────────┐
│                     glm-ensemble                             │
├─────────────────────────────────────────────────────────────┤
│   사용자 요청 ──▶ glm-coordinator                            │
│                         │                                    │
│         ┌───────────────┼───────────────┐                   │
│         ▼               ▼               ▼               ▼   │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│   │ Analyst  │  │ Reviewer │  │ Optimizer│  │ Security │   │
│   │ (분석)    │  │ (검토)    │  │ (최적화)  │  │ (보안)    │   │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│         │               │               │               │   │
│         └───────────────┴───────────────┴───────────────┘   │
│                         ▼                                    │
│                  앙상블 종합 결과                             │
└─────────────────────────────────────────────────────────────┘
```

## 구성 요소

| 컴포넌트 | 설명 |
|----------|------|
| `/glm-ask` | 멀티에이전트 질의 명령어 |
| `/glm-analyze` | 병렬 분석 명령어 |
| `/glm-config` | 설정 관리 명령어 |
| `glm-coordinator` | 결과 조율 에이전트 |
| `glm-prompting` | GLM 활용 가이드 스킬 |
| `glm-api` | MCP 서버 (GLM API 통신) |

## 라이선스

MIT
