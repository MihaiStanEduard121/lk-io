export interface TVProgram {
  id: string;
  title: string;
  description: string;
  category: string;
  streamUrl: string;
  embedCode: string;
  thumbnail: string;
  banner: string;
  status: 'online' | 'offline';
  quality: 'SD' | 'HD' | '4K';
  tags: string[];
  views: number;
  rating: number;
  createdAt: string;
  isFeatured?: boolean;
}

export interface AdminStats {
  totalPrograms: number;
  totalViews: number;
  onlinePrograms: number;
  categories: Record<string, number>;
}

export interface ArticleCategory {
  id: string;
  name: string;
  slug: string;
}

export interface ProgramCategory {
  id: string;
  name: string;
  slug: string;
}

export interface Comment {
  id: string;
  articleId: string;
  author: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

export interface TVScheduleItem {
  id: string;
  time: string;
  title: string;
  description: string;
  date: string;
  channelId?: string;
}

export interface HomepageConfig {
  heroTitle: string;
  heroSubtitle: string;
  heroBackgroundImage: string;
  heroLink?: string;
  featuredArticleId?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  coverImage: string;
  images?: string[];
  status: 'draft' | 'published';
  author: string;
  publishedAt: string;
  categoryId?: string;
  isBreakingNews?: boolean;
  views?: number;
}

export interface Show {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  banner: string;
  createdAt: string;
  isFeatured?: boolean;
}

export interface Episode {
  id: string;
  showId: string;
  title: string;
  description: string;
  videoUrl: string;
  embedCode?: string;
  thumbnail: string;
  episodeNumber: number;
  createdAt: string;
}
