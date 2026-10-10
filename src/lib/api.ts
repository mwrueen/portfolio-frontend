import { Project, TechStack } from '@/types';
import { API_BASE_URL, BASE_URL } from './config';

export { API_BASE_URL, BASE_URL };

export async function getProjects(params?: { featured?: boolean; tech?: string; search?: string }): Promise<Project[]> {
  try {
    const url = new URL(`${API_BASE_URL}/projects`);
    if (params?.featured) url.searchParams.append('featured', '1');
    if (params?.tech) url.searchParams.append('tech', params.tech);
    if (params?.search) url.searchParams.append('search', params.search);

    const res = await fetch(url.toString(), {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch projects: ${res.statusText}`);
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('API Error getProjects:', error);
    return [];
  }
}

export async function getProjectBySlug(slug: string): Promise<{ data: Project | null; related: Project[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${slug}`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      return { data: null, related: [] };
    }

    const json = await res.json();
    return { data: json.data, related: json.related || [] };
  } catch (error) {
    console.error(`API Error getProjectBySlug (${slug}):`, error);
    return { data: null, related: [] };
  }
}

export async function getTechStacks(): Promise<TechStack[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/tech-stacks`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return [];
    }

    const json = await res.json();
    return json.data || [];
  } catch (error) {
    console.error('API Error getTechStacks:', error);
    return [];
  }
}
