export interface TechStack {
  id: number;
  name: string;
  slug: string;
  category: string;
  icon_name?: string;
  color?: string;
  projects_count?: number;
}

export interface Project {
  id: number;
  title: string;
  slug: string;
  tagline: string;
  summary: string;
  description: string;
  cover_image?: string;
  demo_url?: string;
  github_url?: string;
  architecture_notes?: string;
  features?: string[];
  metrics?: Record<string, string>;
  is_featured: boolean;
  order_index: number;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  tech_stacks: TechStack[];
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface CustomPage {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content: string;
  show_in_menu: boolean;
  order_index: number;
  is_published: boolean;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
}
