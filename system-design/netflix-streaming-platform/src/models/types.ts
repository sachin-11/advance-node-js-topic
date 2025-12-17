// Netflix Streaming Platform Type Definitions

export type AccountStatus = 'active' | 'suspended' | 'inactive' | 'pending_verification';
export type ContentType = 'movie' | 'tv_show' | 'episode' | 'trailer' | 'clip';
export type VideoQuality = '240p' | '360p' | '480p' | '720p' | '1080p' | '4k' | '8k';
export type StreamingProtocol = 'hls' | 'dash' | 'mp4';
export type RatingType = 'thumbs_up' | 'thumbs_down' | 'star_rating';
export type DownloadStatus = 'pending' | 'downloading' | 'completed' | 'failed' | 'expired';
export type SubscriptionPlan = 'basic' | 'standard' | 'premium' | 'ultra';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

// ===========================================
// CORE ENTITIES
// ===========================================

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: Date;
  country?: string;
  account_status: AccountStatus;
  email_verified: boolean;
  phone_verified: boolean;
  subscription_plan: SubscriptionPlan;
  subscription_start_date?: Date;
  subscription_end_date?: Date;
  max_profiles: number;
  created_at: Date;
  updated_at: Date;
  last_login_at?: Date;
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  avatar_url?: string;
  is_kids_profile: boolean;
  pin_code?: string;
  language: string;
  autoplay: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  display_order: number;
  created_at: Date;
}

export interface Content {
  id: string;
  title: string;
  original_title?: string;
  description?: string;
  content_type: ContentType;
  release_date?: Date;
  duration_minutes?: number;
  language: string;
  country_of_origin?: string;
  imdb_rating?: number;
  rotten_tomatoes_score?: number;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  is_active: boolean;
  age_rating: string;
  production_year?: number;
  director?: string;
  cast: string[];
  genres: string[];
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface TVShow extends Content {
  total_seasons: number;
  total_episodes?: number;
  network?: string;
  status: string;
  first_air_date?: Date;
  last_air_date?: Date;
  episode_runtime?: number;
}

export interface Episode {
  id: string;
  tv_show_id: string;
  season_number: number;
  episode_number: number;
  title: string;
  description?: string;
  duration_minutes: number;
  air_date?: Date;
  thumbnail_url?: string;
  content_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface VideoFile {
  id: string;
  content_id: string;
  episode_id?: string;
  quality: VideoQuality;
  protocol: StreamingProtocol;
  file_path: string;
  file_size_bytes: number;
  duration_seconds: number;
  bitrate_kbps: number;
  resolution_width?: number;
  resolution_height?: number;
  manifest_url?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// USER INTERACTIONS
// ===========================================

export interface WatchHistory {
  id: string;
  profile_id: string;
  content_id: string;
  episode_id?: string;
  watched_at: Date;
  watch_duration_seconds: number;
  total_duration_seconds: number;
  completion_percentage: number;
  device_type?: string;
  device_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
  updated_at: Date;
}

export interface Rating {
  id: string;
  profile_id: string;
  content_id: string;
  rating_type: RatingType;
  rating_value?: number;
  review_text?: string;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserList {
  id: string;
  profile_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  is_public: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserListItem {
  id: string;
  list_id: string;
  content_id: string;
  added_at: Date;
  position?: number;
}

// ===========================================
// DOWNLOAD MANAGEMENT
// ===========================================

export interface Download {
  id: string;
  profile_id: string;
  content_id: string;
  episode_id?: string;
  quality: VideoQuality;
  status: DownloadStatus;
  download_path?: string;
  file_size_bytes?: number;
  expires_at?: Date;
  device_id?: string;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// RECOMMENDATION SYSTEM
// ===========================================

export interface Recommendation {
  id: string;
  profile_id: string;
  content_id: string;
  recommendation_score: number;
  recommendation_type: string;
  source_content_id?: string;
  expires_at: Date;
  created_at: Date;
}

export interface ContentSimilarity {
  id: string;
  content_id_1: string;
  content_id_2: string;
  similarity_score: number;
  similarity_type: string;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// ANALYTICS & MONITORING
// ===========================================

export interface UserSession {
  id: string;
  profile_id: string;
  session_token: string;
  device_info?: any;
  ip_address?: string;
  user_agent?: string;
  started_at: Date;
  ended_at?: Date;
  duration_minutes?: number;
  is_active: boolean;
}

export interface ContentView {
  id: string;
  content_id: string;
  episode_id?: string;
  profile_id: string;
  view_start_time: Date;
  view_end_time?: Date;
  total_view_time_seconds?: number;
  completion_rate?: number;
  quality_played?: VideoQuality;
  device_type?: string;
  location_country?: string;
  referrer?: string;
}

// ===========================================
// PAYMENT & SUBSCRIPTION
// ===========================================

export interface Payment {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  payment_method?: string;
  payment_status: PaymentStatus;
  transaction_id?: string;
  subscription_plan?: SubscriptionPlan;
  billing_period_start?: Date;
  billing_period_end?: Date;
  created_at: Date;
  updated_at: Date;
}

// ===========================================
// API REQUEST/RESPONSE TYPES
// ===========================================

export interface AuthRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: Date;
  country?: string;
}

export interface CreateProfileRequest {
  name: string;
  avatar_url?: string;
  is_kids_profile?: boolean;
  pin_code?: string;
  language?: string;
  autoplay?: boolean;
}

export interface ContentSearchRequest {
  query?: string;
  category_id?: string;
  content_type?: ContentType;
  genre?: string;
  year?: number;
  rating?: string;
  sort_by?: 'title' | 'release_date' | 'rating' | 'popularity';
  sort_order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface StreamingRequest {
  content_id: string;
  episode_id?: string;
  quality?: VideoQuality;
  profile_id: string;
}

export interface WatchProgressUpdate {
  content_id: string;
  episode_id?: string;
  current_time: number;
  total_duration: number;
}

export interface RecommendationRequest {
  profile_id: string;
  limit?: number;
  content_type?: ContentType;
}

// ===========================================
// API RESPONSE TYPES
// ===========================================

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface AuthResponse {
  user: Partial<User>;
  profile: Profile;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface StreamingResponse {
  manifest_url: string;
  content_info: Partial<Content>;
  episode_info?: Partial<Episode>;
  available_qualities: VideoQuality[];
  drm_info?: any;
}

export interface ContentBrowseResponse {
  featured: Content[];
  categories: Array<{
    category: Category;
    content: Content[];
  }>;
  trending: Content[];
  continue_watching: Array<Content & { progress: number }>;
}

// ===========================================
// UTILITY TYPES
// ===========================================

export interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
  ssl?: boolean;
  max_connections?: number;
}

export interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

export interface ElasticsearchConfig {
  node: string;
  auth?: {
    username: string;
    password: string;
  };
}

export interface AWSConfig {
  access_key_id: string;
  secret_access_key: string;
  region: string;
  s3_bucket: string;
}

export interface JWTConfig {
  secret: string;
  expires_in: string;
  refresh_expires_in: string;
}

export interface AppConfig {
  port: number;
  node_env: string;
  cors_origins: string[];
  rate_limit: {
    window_ms: number;
    max_requests: number;
  };
}