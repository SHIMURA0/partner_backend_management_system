export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTimelineMessage?: boolean;
  timelineData?: {
    organizing: boolean;
    generating: boolean;
    completed: boolean;
    finalAnswer: string;
  };
} 