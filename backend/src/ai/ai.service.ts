import { Injectable } from '@nestjs/common';

/**
 * Placeholder AI service for the Siaya Community Digital Hub Learning Platform.
 * Intended future scope (not implemented here): quiz question suggestions,
 * lesson summarization, learner progress insights. Kept intentionally minimal
 * per project scope constraints.
 */
@Injectable()
export class AiService {
  async suggestQuizQuestions(lessonContent: string): Promise<string[]> {
    // Placeholder - integrate with an LLM provider in a future iteration.
    return [
      `Sample auto-generated question based on lesson content (length: ${lessonContent.length} chars).`,
    ];
  }

  async summarizeLesson(content: string): Promise<string> {
    // Placeholder - simple truncation until a real summarization service is wired in.
    return content.length > 280 ? `${content.slice(0, 280)}...` : content;
  }

  async assist(question: string, courseId?: string, context?: string): Promise<{ answer: string }> {
    // Placeholder - integrate with an LLM provider in a future iteration.
    const topic = courseId ? ` for course ${courseId}` : '';
    const ctx = context ? ` Context: ${context.slice(0, 200)}` : '';
    return {
      answer: `This is a placeholder response to: "${question}"${topic}.${ctx} Connect an LLM provider for real answers.`,
    };
  }
}
