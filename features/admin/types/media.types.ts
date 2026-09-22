export interface AdminMediaItem {
  id: string;
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
  folder?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFilterQuery {
  page?: number;
  limit?: number;
  search?: string;
  mimeType?: string;
  folder?: string;
}

export interface UpdateMediaPayload {
  alt?: string | null;
  folder?: string | null;
}
