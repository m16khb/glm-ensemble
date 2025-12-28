---
name: glm-analyze
description: 파일 또는 코드를 GLM 앙상블로 병렬 분석합니다
argument-hint: "<파일경로 또는 코드>"
allowed-tools:
  - mcp__glm-ensemble__glm_ensemble
  - mcp__glm-ensemble__glm_chat
  - Read
  - Glob
  - Grep
---

# GLM 병렬 분석

파일이나 코드를 4개 역할(분석/검토/최적화/보안)로 동시에 분석하여 종합적인 인사이트를 제공한다.

## 실행 흐름

1. **대상 파악**
   - 파일 경로가 주어지면: Read 도구로 파일 내용 읽기
   - 코드가 직접 주어지면: 해당 코드 사용
   - 디렉토리가 주어지면: Glob으로 파일 목록 확인 후 주요 파일 분석

2. **분석 실행**
   - `glm_ensemble` 도구를 사용하여 4개 역할로 병렬 분석
   - 각 역할은 전문 관점에서 독립적으로 분석 수행

3. **결과 종합**
   - 각 역할의 분석 결과 정리
   - 중복 발견사항 통합
   - 우선순위별 개선 권장사항 정리

## 사용 예시

```
/glm-analyze src/main.ts
/glm-analyze src/components/
/glm-analyze "function calculateTotal(items) { return items.reduce((sum, item) => sum + item.price, 0); }"
```

## 분석 관점

### 🔍 Analyst (분석)
- 코드 구조 및 아키텍처
- 설계 패턴 사용
- 의존성 관계
- 복잡도 분석

### 📋 Reviewer (검토)
- 코드 품질 및 가독성
- 네이밍 컨벤션
- 주석 및 문서화
- 베스트 프랙티스 준수

### ⚡ Optimizer (최적화)
- 성능 병목점
- 메모리 사용
- 알고리즘 효율성
- 캐싱 기회

### 🔒 Security (보안)
- 입력 검증
- 인증/인가
- 데이터 노출
- 취약점 패턴

## 응답 형식

```markdown
# 📁 파일 분석: [파일명]

## 개요
- 파일 유형: [유형]
- 라인 수: [수]
- 주요 기능: [설명]

## 🎯 GLM 앙상블 분석 결과

[각 역할별 분석 결과]

## 📋 종합 권장사항

### 즉시 조치 필요 (Critical)
- [항목]

### 권장 개선사항 (Recommended)
- [항목]

### 고려사항 (Nice to have)
- [항목]
```
