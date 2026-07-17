const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export type PublicCourse = {
  id: string;
  title: string;
  slug: string;
  department: string;
};

export async function fetchPublicCourses(): Promise<PublicCourse[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/v1/public/courses`, {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}
