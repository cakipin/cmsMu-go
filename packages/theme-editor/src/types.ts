/**
 * 🎨 @cmsmu/theme-editor
 * Kontrak tipe data, schema field, dan manifest untuk Canvas Visual Builder & Theme Studio.
 */

export interface FieldDefinition {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "color" | "image" | "array";
  options?: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: any;
  arrayFields?: Record<string, FieldDefinition>;
}

export interface BlockManifest {
  type: string;
  name: string;
  category: "header" | "hero" | "content" | "media" | "layout" | "footer";
  icon: string;
  description: string;
  defaultProps: Record<string, any>;
  fields: Record<string, FieldDefinition>;
}

export interface CanvasBlockInstance {
  id?: string;
  type: string;
  props: Record<string, any>;
}

export interface CanvasPageData {
  content: CanvasBlockInstance[];
  root: {
    props: {
      title: string;
      [key: string]: any;
    };
  };
  zones?: Record<string, CanvasBlockInstance[]>;
}

export interface CanvasPresetItem {
  id: string;
  title: string;
  description: string;
  badge: string;
  icon: string;
  blocks: { type: string; props?: Record<string, any> }[];
}

export interface ThemeEditorLocaleItem {
  code: string;
  name: string;
  direction: "ltr" | "rtl";
  isDefault: number;
  isActive: number;
}
