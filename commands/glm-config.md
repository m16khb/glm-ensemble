---
name: glm-config
description: GLM Ensemble 설정을 확인하고 관리합니다
allowed-tools:
  - mcp__glm-ensemble__glm_config
  - Read
  - Write
---

# GLM Ensemble 설정 관리

GLM API 설정을 확인하고 관리한다.

## 실행 흐름

1. **현재 설정 확인**: `glm_config` 도구로 현재 설정 상태 조회
2. **문제 진단**: API Key 미설정 등 문제가 있으면 안내
3. **설정 가이드**: 설정 파일 위치와 형식 안내

## 설정 방법

### 방법 1: 셸 환경변수 (권장)

`~/.zshrc` 또는 `~/.bashrc`에 추가:

```bash
export GLM_API_KEY="your-api-key-here"
```

변경 후 적용:
```bash
source ~/.zshrc
```

### 방법 2: 설정 파일

`~/.claude/.env.glm` 파일 생성:

```
GLM_API_KEY=your-api-key-here
GLM_API_BASE=https://api.z.ai/api/coding/paas/v4
GLM_MODEL=glm-4.7
GLM_THINKING_MODE=interleaved
```

## 설정 우선순위

1. 셸 환경변수 (최우선)
2. `~/.claude/.env.glm`
3. 프로젝트 `.env.local`
4. 기본값

## 설정 항목 설명

| 항목              | 필수 | 기본값                              | 설명           |
| ----------------- | ---- | ----------------------------------- | -------------- |
| GLM_API_KEY       | ✅   | -                                   | z.ai API 키    |
| GLM_API_BASE      | -    | https://api.z.ai/api/coding/paas/v4 | API 엔드포인트 |
| GLM_MODEL         | -    | glm-4.7                             | 사용할 모델    |
| GLM_THINKING_MODE | -    | interleaved                         | Thinking 모드  |

## Thinking 모드 옵션

| 모드          | 설명                        |
| ------------- | --------------------------- |
| `interleaved` | 매 응답마다 thinking (권장) |
| `preserved`   | 멀티턴에서 thinking 유지    |
| `turn-level`  | 턴별 thinking 제어          |
| `none`        | Thinking 비활성화           |

## 사용 예시

```
/glm-config
```

## 문제 해결

### API Key 미설정

1. z.ai 개발자 포털에서 API 키 발급
2. 아래 중 하나 선택:
   - 셸 환경변수: `export GLM_API_KEY="your-key"`
   - 설정 파일: `~/.claude/.env.glm`에 `GLM_API_KEY=your-key`
3. MCP 서버 재연결 (`/mcp` → Reconnect)

### 연결 오류

- API Base URL 확인
- 네트워크 연결 상태 확인
- API 키 유효성 확인
