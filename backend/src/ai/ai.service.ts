import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * AI service for learner assistance. Uses an OpenAI-compatible chat API when
 * AI_PROVIDER + AI_API_KEY are configured; otherwise returns safe placeholders
 * so the learning experience still works without a live LLM.
 */
@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(private readonly config: ConfigService) {}

  private get enabled(): boolean {
    return !!this.config.get<string>('AI_API_KEY');
  }

  private async chat(messages: ChatMessage[]): Promise<string> {
    const apiKey = this.config.get<string>('AI_API_KEY');
    const model = this.config.get<string>('AI_MODEL') || 'gpt-4o-mini';
    const baseUrl =
      this.config.get<string>('AI_BASE_URL') || 'https://api.openai.com/v1/chat/completions';

    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ model, messages, temperature: 0.4 }),
      });
      if (!res.ok) {
        this.logger.warn(`AI provider returned ${res.status}`);
        return '';
      }
      const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      return data.choices?.[0]?.message?.content?.trim() ?? '';
    } catch (err) {
      this.logger.warn(`AI request failed: ${(err as Error).message}`);
      return '';
    }
  }

  async assist(question: string, courseId?: string, context?: string): Promise<{ answer: string }> {
    if (!this.enabled) {
      const topic = courseId ? ` for course ${courseId}` : '';
      return {
        answer: `This is a placeholder response to: "${question}"${topic}. Connect an LLM provider to enable real assistance.`,
      };
    }

    const system =
      'You are a friendly learning assistant for the Siaya Community Digital Hub. ' +
      'Help the learner understand lessons, explain concepts clearly, and suggest practice. ' +
      'Do not reveal answers to graded quizzes or assignments. Keep responses concise.';

    const userContext = context ? `\n\nLesson context:\n${context.slice(0, 4000)}` : '';
    const answer = await this.chat([
      { role: 'system', content: system },
      { role: 'user', content: `${question}${userContext}` },
    ]);
    return { answer: answer || 'Sorry, I could not generate a response right now. Please try again.' };
  }

  async suggestQuizQuestions(lessonContent: string): Promise<string[]> {
    if (!this.enabled) {
      return [
        `Sample auto-generated question based on lesson content (length: ${lessonContent.length} chars).`,
      ];
    }
    const answer = await this.chat([
      {
        role: 'system',
        content:
          'Generate 3 short quiz questions (one line each) based on the lesson content. Return only the questions, numbered.',
      },
      { role: 'user', content: lessonContent.slice(0, 4000) },
    ]);
    return answer ? answer.split('\n').filter(Boolean) : [];
  }

  async summarizeLesson(content: string): Promise<string> {
    if (!this.enabled) {
      return content.length > 280 ? `${content.slice(0, 280)}...` : content;
    }
    const answer = await this.chat([
      {
        role: 'system',
        content: 'Summarize the following lesson in 2-3 concise sentences for a learner.',
      },
      { role: 'user', content: content.slice(0, 4000) },
    ]);
    return answer || (content.length > 280 ? `${content.slice(0, 280)}...` : content);
  }
}
