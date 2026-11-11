export type TemplateId = 'template-1' | 'template-2' | 'template-3';

export type ViewMode = 'dashboard' | 'editor' | 'designs' | 'templates' | 'settings';

export interface TemplateHeader {
  leftLogoUrl: string;
  leftLogoLabel: string;
  rightLogoUrl: string;
  rightLogoLabel: string;
  showDivider: boolean;
  leftLogoSize?: number;
  rightLogoSize?: number;
}

export interface TemplateContent {
  heading: string;
  subheading?: string;
  bodyText: string;
  recommendationTitle?: string;
  recommendationHighlight?: string;
  recommendationSubtitle?: string;
  bestWishesText?: string;
  thankYouHeading?: string;
  thankYouSubtitle?: string;
}

export interface TemplateAuthor {
  name: string;
  role: string;
  company: string;
  date: string;
  signatureUrl?: string;
  signatureSize?: number;
}

export interface TemplateMedia {
  supportingPhotoUrl?: string;
  watermarkUrl?: string;
}

export interface TemplateStyling {
  primaryColor: string;
  goldColor: string;
  accentColor?: string;
  headingColor?: string;
  bgTopColor?: string;
  bgSideColor?: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
  scriptFont: string;
  headingFontSize?: number;
  bodyFontSize?: number;
  fontSizes?: Record<string, number>;
  textColors?: Record<string, string>;
}

export interface TemplateData {
  id: TemplateId;
  name: string;
  subtitle: string;
  description: string;
  width: number;
  height: number;
  header: TemplateHeader;
  content: TemplateContent;
  author: TemplateAuthor;
  media: TemplateMedia;
  styling: TemplateStyling;
}

export interface AuthUser {
  id: string;
  name: string;
  mobileNumber: string;
  downloadCount?: number;
  createdAt?: string;
}

export interface DesignRecord {
  id: string;
  title: string;
  templateId: TemplateId;
  status?: 'draft' | 'completed';
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  data: TemplateData;
  canvasJson?: any;
}

export interface SelectedObjectProperties {
  id?: string;
  type?: string;
  text?: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  fill?: string;
  textAlign?: string;
  left?: number;
  top?: number;
  width?: number;
  height?: number;
  scaleX?: number;
  scaleY?: number;
  angle?: number;
  opacity?: number;
}

