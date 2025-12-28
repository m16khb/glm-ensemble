---
name: glm-ask
description: GLM-4.7 멀티에이전트 앙상블로 질문에 답변합니다
argument-hint: "<질문>"
allowed-tools:
  - mcp__glm-ensemble__glm_ensemble
  - mcp__glm-ensemble__glm_chat
  - Read
  - Glob
  - Grep
---

# GLM 멀티에이전트 질의

사용자의 질문을 GLM-4.7 앙상블 시스템으로 분석하여 최상의 답변을 제공한다.

## 실행 흐름

1. **질문 분석**: 사용자 질문의 유형과 복잡도 파악
2. **역할 선택**: 질문 유형에 따라 적절한 역할 조합 결정
   - 코드 관련: analyst, reviewer, optimizer, security
   - 개념 질문: analyst, reviewer
   - 성능 문제: analyst, optimizer
   - 보안 관련: analyst, security
3. **병렬 호출**: `glm_ensemble` 도구로 선택된 역할들에게 동시 질의
4. **결과 종합**: 각 역할의 분석 결과를 종합하여 최적의 답변 도출

## 사용 예시

```
/glm-ask 이 함수의 시간 복잡도를 개선할 방법이 있을까?
/glm-ask React 컴포넌트의 리렌더링을 최소화하려면?
/glm-ask 이 API 설계에서 보안 취약점이 있을까?
```

## 인자 처리

- 인자가 없으면: 사용자에게 질문 입력 요청
- 파일 경로가 포함되면: 해당 파일을 먼저 읽어서 컨텍스트에 포함
- 코드 블록이 포함되면: 코드 분석 모드로 전환

## 응답 형식

```markdown
# 🎯 GLM 앙상블 분석 결과

## 🔍 Analyst 분석
[분석 내용]

## 📋 Reviewer 검토
[검토 내용]

## ⚡ Optimizer 제안
[최적화 제안]

## 🔒 Security 검토
[보안 검토]

---

## 📊 종합 결론
[모든 관점을 종합한 최종 답변]
```
