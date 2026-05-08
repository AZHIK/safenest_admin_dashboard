// Core Types for SafeNest Admin Dashboard

export interface User {
  id: string;
  phone_number: string | null;
  country_code: string | null;
  is_anonymous: boolean;
  is_verified: boolean;
  language_preference: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  trusted_contacts?: TrustedContact[];
}

export interface TrustedContact {
  id: string;
  name: string;
  phone_number: string;
  relationship: string | null;
  priority: number;
  notify_sms: boolean;
  notify_push: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Stakeholder {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  is_active: boolean;
  is_super_admin: boolean;
  email_verified: boolean;
  last_login: string | null;
  created_at: string;
  roles: string[];
  // Derived or legacy fields for UI compatibility
  role: StakeholderRole;
  first_name?: string;
  last_name?: string;
  phone_number?: string | null;
  department?: string | null;
  region?: string | null;
  updated_at?: string;
}

export type StakeholderRole = 
  | 'super_admin'
  | 'police'
  | 'legal_officer'
  | 'counselor'
  | 'help_center'
  | 'ngo_manager'
  | 'regional_manager';

export interface SOSAlert {
  id: string;
  user_id: string;
  status: SOSStatus;
  alert_type: string;
  severity: string;
  initial_latitude: number;
  initial_longitude: number;
  initial_accuracy: number | null;
  initial_address: string | null;
  message: string | null;
  contacts_notified: number;
  created_at: string;
  updated_at: string | null;
  client_created_at: string | null;
  offline_id: string | null;
  user?: User;
  recent_locations?: LocationPing[];
}

export type SOSStatus = 'active' | 'assigned' | 'escalated' | 'resolved' | 'cancelled';

export interface LocationPing {
  id: string;
  alert_id: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  battery_level: number | null;
  network_type: string | null;
  signal_strength: number | null;
  recorded_at: string;
  received_at: string;
  offline_sequence?: number;
}

export interface IncidentReport {
  id: string;
  report_number: string;
  report_type: ReportType;
  status: ReportStatus;
  is_anonymous: boolean;
  incident_date: string | null;
  incident_latitude: number | null;
  incident_longitude: number | null;
  incident_address: string | null;
  encryption_metadata: object | null;
  created_at: string;
  updated_at: string | null;
  client_created_at: string | null;
  offline_id: string | null;
  evidence_files?: EvidenceFile[];
  user?: User;
}

export type ReportType = 
  | 'assault'
  | 'harassment'
  | 'domestic_violence'
  | 'stalking'
  | 'threat'
  | 'other';

export type ReportStatus = 
  | 'new'
  | 'under_review'
  | 'intervention_active'
  | 'legal_followup'
  | 'resolved'
  | 'escalated';

export interface EvidenceFile {
  id: string;
  report_id: string;
  file_type: FileType;
  mime_type: string;
  file_size_bytes: number;
  storage_path: string;
  encryption_metadata: object | null;
  file_hash_sha256: string;
  has_gps_metadata: boolean;
  processing_status: string;
  virus_scan_status: string;
  uploaded_at: string;
  thumbnail_path: string | null;
  offline_id: string | null;
}

export type FileType = 'image' | 'audio' | 'video' | 'document';

export interface Conversation {
  id: string;
  conversation_type: ConversationType;
  title: string | null;
  is_encrypted: boolean;
  encryption_type: string;
  last_message_at: string | null;
  created_at: string;
  participants: ConversationParticipant[];
  last_message?: Message;
}

export type ConversationType = 'direct' | 'group' | 'support' | 'anonymous';

export interface ConversationParticipant {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  last_read_at: string | null;
  user?: User;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string | null;
  encrypted_content: string;
  encryption_metadata: string;
  content_type: ContentType;
  status: MessageStatus;
  sent_at: string | null;
  delivered_at: string | null;
  is_edited: boolean;
  is_deleted: boolean;
  server_created_at: string;
  client_created_at: string | null;
  reply_to_message_id?: string;
  attachment_encrypted: boolean;
  attachment_storage_path?: string;
  attachment_metadata_encrypted?: string;
  offline_sequence?: number;
  sender?: User;
}

export type ContentType = 'text' | 'image' | 'audio' | 'file' | 'location';
export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export interface SupportCenter {
  id: string;
  name: string;
  center_type: string;
  category_tags: string | null;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number;
  longitude: number;
  distance_km?: number;
  phone_primary: string | null;
  phone_emergency: string | null;
  email: string | null;
  website: string | null;
  is_24_7: boolean;
  operating_hours: string | null;
  languages_supported: string | null;
  provides_medical: boolean;
  provides_legal: boolean;
  provides_shelter: boolean;
  provides_counseling: boolean;
  provides_emergency_response: boolean;
  provides_anonymous_support: boolean;
  wheelchair_accessible: boolean;
  gender_specific: string | null;
  is_verified: boolean;
  rating_average: number;
  rating_count: number;
  is_active: boolean;
}

export interface TrainingCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon_name: string | null;
  color_code: string | null;
  sort_order: number;
  is_active: boolean;
  is_featured: boolean;
  lesson_count: number;
}

export interface TrainingLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  duration_minutes: number | null;
  difficulty_level: string;
  is_active: boolean;
  is_premium: boolean;
  category_id: string;
  thumbnail_url: string | null;
  view_count: number;
  sort_order: number;
  created_at: string;
  content_blocks?: ContentBlock[];
  video_url?: string;
  audio_url?: string;
  pdf_url?: string;
  tags?: string;
  related_lesson_ids?: string[];
  completion_count?: number;
  rating_average?: number;
  rating_count?: number;
}

export interface ContentBlock {
  type: 'text' | 'video' | 'audio' | 'image' | 'quiz' | 'interactive';
  content: string | null;
  url: string | null;
  metadata: object | null;
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  stakeholder_id: string | null;
  action: AuditAction;
  resource_type: ResourceType;
  resource_id: string | null;
  details: object | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  user?: User;
  stakeholder?: Stakeholder;
}

export type AuditAction = 
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'login'
  | 'logout'
  | 'assign'
  | 'escalate'
  | 'resolve'
  | 'cancel';

export type ResourceType = 
  | 'sos_alert'
  | 'incident_report'
  | 'evidence_file'
  | 'conversation'
  | 'message'
  | 'support_center'
  | 'training_content'
  | 'user'
  | 'stakeholder';

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_next: boolean;
  has_prev: boolean;
}

// Dashboard Analytics Types
export interface DashboardMetrics {
  active_sos_alerts: number;
  pending_reports: number;
  responders_online: number;
  unresolved_cases: number;
  emergency_notifications: number;
  average_response_time: number;
  case_closure_rate: number;
  regional_incident_volume: RegionalIncidentVolume[];
  sos_trends: SOSTrend[];
  stakeholder_activity: StakeholderActivity[];
}

export interface RegionalIncidentVolume {
  region: string;
  volume: number;
  percentage_change: number;
}

export interface SOSTrend {
  date: string;
  count: number;
  resolved: number;
}

export interface StakeholderActivity {
  stakeholder_id: string;
  stakeholder_name: string;
  role: StakeholderRole;
  actions_today: number;
  last_activity: string;
}

// WebSocket Event Types
export interface WebSocketEvent {
  type: WebSocketEventType;
  payload: any;
  timestamp: string;
}

export type WebSocketEventType = 
  | 'sos_triggered'
  | 'sos_updated'
  | 'location_update'
  | 'message_received'
  | 'case_assigned'
  | 'case_updated'
  | 'stakeholder_online'
  | 'stakeholder_offline'
  | 'emergency_broadcast';

// Form Types
export interface LoginForm {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SOSUpdateForm {
  status: SOSStatus;
  resolution_notes?: string;
  assigned_responder_id?: string;
}

export interface CaseUpdateForm {
  status: ReportStatus;
  assigned_to?: string;
  notes?: string;
  escalation_reason?: string;
}

export interface SupportCenterForm {
  name: string;
  center_type: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  latitude: number;
  longitude: number;
  phone_primary: string;
  phone_emergency?: string;
  email?: string;
  website?: string;
  is_24_7: boolean;
  operating_hours?: string;
  languages_supported?: string;
  provides_medical: boolean;
  provides_legal: boolean;
  provides_shelter: boolean;
  provides_counseling: boolean;
  provides_emergency_response: boolean;
  provides_anonymous_support: boolean;
  wheelchair_accessible: boolean;
  gender_specific?: string;
  is_active: boolean;
}
