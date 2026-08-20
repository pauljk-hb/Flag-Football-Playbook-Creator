export type ExtendedUser = {
  lastPlaybookId?: string | null;
};

export interface Playbook {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;

  plays?: Play[];
  tags?: Tag[];
}

export interface Tag {
  id: string;
  playbookId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface Play {
  id: string;
  playbookId: string;
  name: string;
  description: string | null;
  canvasData: string;
  thumbnail: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;

  tags?: Tag[];
}

export interface CreatePlaybookDTO {
  name: string;
  description?: string;
}

export interface UpdatePlaybookDTO {
  name?: string;
  description?: string;
}

export interface CreateTagDTO {
  name: string;
  color?: string;
}

export interface UpdateTagDTO {
  name?: string;
  color?: string;
}

export interface CreatePlayDTO {
  name: string;
  canvasData: string | null;
  thumbnail?: string;
  description?: string;
  sortOrder?: number;
}

export interface UpdatePlayDTO {
  name?: string;
  canvasData?: string;
  thumbnail?: string;
  description?: string;
  sortOrder?: number;
}

export interface ThumbnailOptions {
  format?: "png" | "jpeg" | "webp";
  quality?: number;
  width?: number;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface PDFExportOptions {
  pageWidth: number;
  pageHeight: number;
  columns: number;
  rows: number;
  playbookTitle?: string;
  margin: Margin;
  gap: number;
  routeStrokeWidth?: number;
  showLabels?: boolean;
  fontSize?: number;
}

export interface ExportPreset {
  id: string;
  name: string;
  options: PDFExportOptions;
}

export interface SelectedPlayItem {
  id: string;
  title: string;
  description?: string;
  thumbnail: string;
  data: string; // JSON String für die Playbook-Engine
}
