export interface Item {
  id: string;
  title: string;
  description?: string;
  date?: string;
  type?: string;
  format?: string;
  coverage?: string;
  rights?: string;
  publisher?: string;
  language?: string;
  source?: string;
  creators: string[];
  contributors: string[];
  subjects: string[];
  identifiers: string[];
  created_at: string;
  updated_at: string;
  assets: Asset[];
}

export interface ItemCreate {
  title: string;
  description?: string;
  date?: string;
  type?: string;
  format?: string;
  coverage?: string;
  rights?: string;
  publisher?: string;
  language?: string;
  source?: string;
  creators?: string[];
  contributors?: string[];
  subjects?: string[];
  identifiers?: string[];
}

export interface ItemUpdate {
  title?: string;
  description?: string;
  date?: string;
  type?: string;
  format?: string;
  coverage?: string;
  rights?: string;
  publisher?: string;
  language?: string;
  source?: string;
  creators?: string[];
  contributors?: string[];
  subjects?: string[];
  identifiers?: string[];
}

export interface Asset {
  id: string;
  item_id: string;
  file_path: string;
  mime_type?: string;
  bytes: number;
  checksum?: string;
  exif_json: Record<string, any>;
  ocr_json: Record<string, any>;
  is_primary: boolean;
}

