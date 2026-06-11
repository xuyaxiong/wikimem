/**
 * Pipeline prompt defaults and user-override resolution.
 *
 * The ingest pipeline has two editable prompts for the llm-compile step:
 *  - "llm-compile-system": the system prompt sent to the LLM
 *  - "llm-compile-user":   the user-facing instruction block appended after the document
 *
 * User overrides are stored in config.yaml under pipeline.prompts:
 *   pipeline:
 *     prompts:
 *       llm-compile-system: "Custom system prompt…"
 *       llm-compile-user: "Custom instruction block…"
 */

export const PROMPT_STEP_LABELS: Record<string, string> = {
  'llm-compile-system': 'LLM Compile — System Prompt',
  'llm-compile-user': 'LLM Compile — User Instructions',
};

export const DEFAULT_PROMPTS: Record<string, string> = {
  'llm-compile-system':
    '你是一个 Wiki 维护员。处理源文档后生成结构化的 wiki 页面，使用 markdown 格式和 [[wikilinks]] 交叉引用。严格遵循 AGENTS.md 中的 schema 定义。要求内容准确、详尽，交叉引用完备。\n\n重要原则 — 忠实于原文：页面内容必须忠实反映源文档的信息，不得遗漏重要细节、数值或分类。\n\n重要：所有页面内容使用中文编写。标题、摘要、TLDR、标签、小节标题及正文均须使用中文，禁止使用英文标题，除非源文档本身为其他语言。',

  'llm-compile-user': `处理这份源文档并生成 wiki 页面。所有内容使用中文编写。每个页面按以下格式输出：

\`\`\`page
TITLE: 页面标题
CATEGORY: sources | entities | concepts | syntheses
TAGS: 标签1, 标签2, 标签3
SUMMARY: 用于索引的一句话摘要
TLDR: 一两句话概括本页最重要的信息
---
Markdown 格式的页面正文，使用 [[wikilinks]] 链接到其他页面。
\`\`\`

生成以下页面：
1. 源文档摘要页面（放在 sources/）
2. 涉及的重要人物、工具、组织等实体页面（放在 entities/）
3. 关键概念或框架的概念页面（放在 concepts/）

广泛使用 [[wikilinks]] 连接页面。每项陈述都应引用来源。

重要原则：
- 完整性：源文档中的所有重要事实、数值、分类和细节都必须在页面中体现，不得因概括而丢失信息
- 层级关系：如果源文档包含多级分类或多层结构，每一级都应可见，不得只保留最高或最低一级
- 源文档摘要页面（sources/）应包含最完整的信息；概念页面（concepts/）可适当归纳，但关键细节不可丢失`,
};

export type PromptStep = keyof typeof DEFAULT_PROMPTS;

export const PROMPT_STEP_IDS = Object.keys(DEFAULT_PROMPTS) as PromptStep[];

/**
 * Resolve the prompt for a given step, preferring user overrides from config.
 * @param step    The step ID (e.g. 'llm-compile-system')
 * @param overrides  The pipeline.prompts map from config.yaml (may be undefined)
 */
export function getPrompt(
  step: string,
  overrides?: Record<string, string>,
): string {
  const defaultPrompt = DEFAULT_PROMPTS[step];
  if (defaultPrompt === undefined) {
    throw new Error(`Unknown pipeline prompt step: "${step}"`);
  }
  const override = overrides?.[step];
  if (override && override.trim().length > 0) {
    return override.trim();
  }
  return defaultPrompt;
}
