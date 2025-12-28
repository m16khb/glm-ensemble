#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// GLM API 설정
interface GlmConfig {
  apiKey: string;
  apiBase: string;
  model: string;
  thinkingMode: "interleaved" | "preserved" | "turn-level" | "none";
}

// 역할 정의
const ROLES = {
  analyst: {
    name: "Analyst",
    emoji: "🔍",
    systemPrompt: `당신은 심층 분석 전문가입니다. 주어진 내용을 다각도로 분석하여:
- 핵심 요소와 구조 파악
- 패턴과 관계 식별
- 잠재적 문제점 발견
- 개선 기회 도출
분석 결과를 명확하고 구조화된 형태로 제시하세요.`
  },
  reviewer: {
    name: "Reviewer",
    emoji: "📋",
    systemPrompt: `당신은 코드/문서 검토 전문가입니다. 주어진 내용을 검토하여:
- 품질 및 완성도 평가
- 베스트 프랙티스 준수 여부
- 가독성 및 유지보수성
- 문서화 수준
구체적인 개선 제안과 함께 검토 결과를 제시하세요.`
  },
  optimizer: {
    name: "Optimizer",
    emoji: "⚡",
    systemPrompt: `당신은 성능 최적화 전문가입니다. 주어진 내용을 최적화 관점에서:
- 성능 병목점 식별
- 리소스 사용 효율성
- 알고리즘/로직 개선점
- 확장성 고려사항
실행 가능한 최적화 방안을 우선순위와 함께 제시하세요.`
  },
  security: {
    name: "Security",
    emoji: "🔒",
    systemPrompt: `당신은 보안 전문가입니다. 주어진 내용을 보안 관점에서:
- 잠재적 취약점 식별 (OWASP Top 10 등)
- 인증/인가 검토
- 데이터 보호 및 암호화
- 입력 검증 및 출력 인코딩
위험 수준과 함께 구체적인 보안 권장사항을 제시하세요.`
  }
} as const;

type RoleKey = keyof typeof ROLES;

// 설정 로드 (환경변수에서)
function loadConfig(): GlmConfig {
  return {
    apiKey: process.env.GLM_API_KEY || "",
    apiBase: process.env.GLM_API_BASE || "https://api.z.ai/api/paas/v4",
    model: process.env.GLM_MODEL || "glm-4.7",
    thinkingMode: (process.env.GLM_THINKING_MODE as GlmConfig["thinkingMode"]) || "interleaved"
  };
}

// GLM API 호출
async function callGlmApi(
  config: GlmConfig,
  systemPrompt: string,
  userMessage: string,
  options?: { temperature?: number; maxTokens?: number }
): Promise<string> {
  const response = await fetch(`${config.apiBase}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${config.apiKey}`
    },
    body: JSON.stringify({
      model: config.model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      temperature: options?.temperature ?? 0.7,
      max_tokens: options?.maxTokens ?? 4096,
      thinking: config.thinkingMode !== "none" ? {
        mode: config.thinkingMode
      } : undefined
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GLM API error: ${response.status} - ${error}`);
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>;
  };

  return data.choices[0]?.message?.content || "";
}

// 병렬 GLM 호출 (앙상블)
async function callGlmParallel(
  config: GlmConfig,
  userMessage: string,
  roles: RoleKey[]
): Promise<Record<RoleKey, string>> {
  const results: Partial<Record<RoleKey, string>> = {};

  const promises = roles.map(async (roleKey) => {
    const role = ROLES[roleKey];
    try {
      const response = await callGlmApi(config, role.systemPrompt, userMessage);
      results[roleKey] = response;
    } catch (error) {
      results[roleKey] = `[오류] ${role.name} 분석 실패: ${error instanceof Error ? error.message : String(error)}`;
    }
  });

  await Promise.all(promises);
  return results as Record<RoleKey, string>;
}

// 앙상블 결과 종합
function synthesizeResults(results: Record<RoleKey, string>): string {
  const sections: string[] = [];

  for (const [roleKey, content] of Object.entries(results)) {
    const role = ROLES[roleKey as RoleKey];
    sections.push(`## ${role.emoji} ${role.name} 분석\n\n${content}`);
  }

  return sections.join("\n\n---\n\n");
}

// MCP 서버 생성
const server = new McpServer({
  name: "glm-ensemble",
  version: "0.1.0"
});

// Tool: glm_chat - 단일 GLM 호출
server.tool(
  "glm_chat",
  "GLM-4.7에 단일 질의를 수행합니다",
  {
    message: z.string().describe("GLM에 보낼 메시지"),
    role: z.enum(["analyst", "reviewer", "optimizer", "security"]).optional()
      .describe("사용할 역할 (기본: 일반 대화)"),
    temperature: z.number().min(0).max(2).optional()
      .describe("응답의 창의성 (0~2, 기본: 0.7)"),
    maxTokens: z.number().positive().optional()
      .describe("최대 토큰 수 (기본: 4096)")
  },
  async ({ message, role, temperature, maxTokens }) => {
    const config = loadConfig();

    if (!config.apiKey) {
      return {
        content: [{ type: "text", text: "❌ GLM_API_KEY가 설정되지 않았습니다. ~/.claude/glm-ensemble.local.md를 확인하세요." }]
      };
    }

    const systemPrompt = role ? ROLES[role].systemPrompt : "당신은 도움이 되는 AI 어시스턴트입니다.";

    try {
      const response = await callGlmApi(config, systemPrompt, message, { temperature, maxTokens });
      const roleInfo = role ? `${ROLES[role].emoji} **${ROLES[role].name}**\n\n` : "";

      return {
        content: [{ type: "text", text: `${roleInfo}${response}` }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ GLM 호출 실패: ${error instanceof Error ? error.message : String(error)}` }]
      };
    }
  }
);

// Tool: glm_ensemble - 병렬 멀티에이전트 호출
server.tool(
  "glm_ensemble",
  "4개 역할(분석/검토/최적화/보안)로 병렬 분석을 수행합니다",
  {
    message: z.string().describe("분석할 내용 또는 질문"),
    roles: z.array(z.enum(["analyst", "reviewer", "optimizer", "security"])).optional()
      .describe("사용할 역할들 (기본: 4개 전부)")
  },
  async ({ message, roles }) => {
    const config = loadConfig();

    if (!config.apiKey) {
      return {
        content: [{ type: "text", text: "❌ GLM_API_KEY가 설정되지 않았습니다. ~/.claude/glm-ensemble.local.md를 확인하세요." }]
      };
    }

    const selectedRoles: RoleKey[] = roles || ["analyst", "reviewer", "optimizer", "security"];

    try {
      const results = await callGlmParallel(config, message, selectedRoles);
      const synthesis = synthesizeResults(results);

      return {
        content: [{
          type: "text",
          text: `# 🎯 GLM 앙상블 분석 결과\n\n${synthesis}\n\n---\n\n## 📊 종합\n\n위 ${selectedRoles.length}개 관점의 분석을 종합하여 최적의 솔루션을 도출하세요.`
        }]
      };
    } catch (error) {
      return {
        content: [{ type: "text", text: `❌ GLM 앙상블 호출 실패: ${error instanceof Error ? error.message : String(error)}` }]
      };
    }
  }
);

// Tool: glm_config - 현재 설정 확인
server.tool(
  "glm_config",
  "현재 GLM 설정을 확인합니다",
  {},
  async () => {
    const config = loadConfig();

    const status = config.apiKey ? "✅ 설정됨" : "❌ 미설정";
    const maskedKey = config.apiKey
      ? `${config.apiKey.slice(0, 8)}...${config.apiKey.slice(-4)}`
      : "(없음)";

    const configInfo = `# GLM Ensemble 설정

| 항목 | 값 |
|------|-----|
| API Key | ${status} (${maskedKey}) |
| API Base | ${config.apiBase} |
| Model | ${config.model} |
| Thinking Mode | ${config.thinkingMode} |

## 역할 목록

| 역할 | 설명 |
|------|------|
| 🔍 Analyst | 심층 분석 |
| 📋 Reviewer | 코드/문서 검토 |
| ⚡ Optimizer | 성능 최적화 |
| 🔒 Security | 보안 검토 |

## 설정 방법

\`~/.claude/glm-ensemble.local.md\` 파일에 다음 형식으로 설정:

\`\`\`markdown
# GLM Ensemble 설정

## API 설정
- GLM_API_KEY: your-api-key
- GLM_API_BASE: https://api.z.ai/api/paas/v4
- GLM_MODEL: glm-4.7
- GLM_THINKING_MODE: interleaved
\`\`\``;

    return {
      content: [{ type: "text", text: configInfo }]
    };
  }
);

// 서버 시작
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("GLM Ensemble MCP Server started");
}

main().catch(console.error);
