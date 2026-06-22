export interface Workspace {
  id: number;
  name: string;
  slug: string;
  api_key: string;
  plan: string;
  widget_color: string;
  widget_position: 'bottom-right' | 'bottom-left';
  widget_greeting: string;
  widget_agent_label: string;
  show_branding: boolean;
  business_hours: Record<string, unknown> | null;
}

export interface User {
  id: number;
  workspace_id: number;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'agent';
  avatar: string | null;
  status: 'online' | 'away' | 'offline';
  last_seen_at: string | null;
  workspace?: Workspace;
}

export interface Contact {
  id: number;
  workspace_id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  country: string | null;
  city: string | null;
  browser: string | null;
  os: string | null;
}

export interface Label {
  id: number;
  workspace_id: number;
  name: string;
  color: string;
}

export type ConversationStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type ConversationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Conversation {
  id: number;
  workspace_id: number;
  contact_id: number | null;
  assigned_to: number | null;
  status: ConversationStatus;
  channel: 'chat' | 'email';
  subject: string | null;
  priority: ConversationPriority;
  is_ticket: boolean;
  last_message_at: string | null;
  first_reply_at: string | null;
  resolved_at: string | null;
  created_at: string;
  contact?: Contact | null;
  assigned_agent?: User | null;
  labels?: Label[];
  latest_message?: Message | null;
  visitor_session?: VisitorSession | null;
  csat_rating?: CsatRating | null;
}

export interface VisitorSession {
  id: number;
  session_token: string;
  current_url: string | null;
  referrer: string | null;
  browser: string | null;
  os: string | null;
  country: string | null;
  city: string | null;
  ip: string | null;
  last_activity_at: string | null;
}

export type MessageSenderType = 'agent' | 'contact' | 'system';

export interface Message {
  id: number;
  conversation_id: number;
  sender_type: MessageSenderType;
  sender_id: number | null;
  content: string;
  type: 'text' | 'note' | 'file' | 'system';
  attachments: unknown[] | null;
  is_private: boolean;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: number;
    name: string;
    avatar?: string | null;
    email?: string;
  } | null;
}

export interface CannedResponse {
  id: number;
  workspace_id: number;
  title: string;
  shortcut: string | null;
  content: string;
  creator?: { id: number; name: string } | null;
}

export interface CsatRating {
  id: number;
  conversation_id: number;
  rating: number;
  feedback: string | null;
}

export interface AnalyticsOverview {
  total_conversations: number;
  open_conversations: number;
  pending_conversations: number;
  resolved_conversations: number;
  avg_first_reply_secs: number;
  avg_resolution_secs: number;
  csat_avg: number;
}

export interface TypingEvent {
  conversation_id: number;
  sender_type: MessageSenderType;
  sender_id: number | null;
  sender_name: string;
  is_typing: boolean;
}
