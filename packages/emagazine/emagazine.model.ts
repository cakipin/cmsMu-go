export interface Magazine {
  id?: number;
  title: string;
  slug: string;
  description?: string | null;
  editionNumber?: string | null;
  publicationDate?: string | null;
  coverImage: string;
  pdfR2Key: string;
  totalPages?: number;
  previewPages?: number;
  status?: string; // 'published' | 'draft' | 'archived'
  isFree?: number; // 0 = subscription required, 1 = free
  createdAt?: string;
  updatedAt?: string;
}
