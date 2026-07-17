import api from '@/lib/api';

export interface MessageUser {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ChatMessage {
  id: string;
  courseId: string;
  senderId: string;
  recipientId: string;
  body: string;
  readAt: string | null;
  createdAt: string;
  sender: MessageUser;
  recipient: MessageUser;
}

export interface ConversationSummary {
  courseId: string;
  courseTitle: string;
  counterpartId: string;
  counterpartName: string;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
}

export const messagesService = {
  conversations: (courseId?: string) =>
    api
      .get<ConversationSummary[]>('/messages/conversations', {
        params: courseId ? { courseId } : undefined,
      })
      .then((r) => r.data),

  thread: (courseId: string, userId: string) =>
    api.get<ChatMessage[]>(`/messages/course/${courseId}/with/${userId}`).then((r) => r.data),

  send: (payload: { courseId: string; recipientId: string; body: string }) =>
    api.post<ChatMessage>('/messages', payload).then((r) => r.data),
};
