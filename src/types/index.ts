// TimeTravel Press - Type Definitions

export interface NewspaperArticle {
  headline: string;
  subheadline?: string;
  content: string;
  category: 'main' | 'entertainment' | 'celebrity' | 'culture' | 'sports' | 'column' | 'news' | 'politics' | 'economy' | 'society' | 'editorial';
  imagePrompt?: string;
}

export interface NewspaperData {
  date: Date;
  masthead: string;
  edition: string;
  weather: string;
  mainArticle: NewspaperArticle;
  subArticles: NewspaperArticle[];
  editorial: NewspaperArticle;
  columnTitle: string;
  columnContent: string;
  advertisements: Advertisement[];
  personalMessage?: PersonalMessage;
}

export interface PersonalMessage {
  recipientName: string;
  senderName: string;
  message: string;
  occasion: string;
}

export interface Advertisement {
  title: string;
  content: string;
  style: 'vintage' | 'modern-retro';
}

export interface GenerationRequest {
  targetDate: string;
  recipientName?: string;
  senderName?: string;
  personalMessage?: string;
  occasion?: string;
  style: 'showa' | 'heisei' | 'reiwa';
}

export interface GenerationResponse {
  success: boolean;
  newspaper?: NewspaperData;
  articles?: NewspaperArticle[];
  error?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  style: 'vintage-newspaper' | 'halftone' | 'ink-bleed';
  width?: number;
  height?: number;
  highFidelity?: boolean;
}

export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  error?: string;
}

export interface PaymentIntent {
  clientSecret: string;
  amount: number;
  currency: string;
}

export interface PreviewState {
  isPreview: true;
  newspaperData: NewspaperData;
  images: null;
}

export interface ProductionState {
  isPreview: false;
  newspaperData: NewspaperData;
  images: GeneratedImages;
  pdfUrl: string;
}

export interface GeneratedImages {
  mainImage?: string;
  subImages: (string | undefined)[];
}

// Gemini 3.0 Grounding Response Types
export interface GroundedFact {
  claim: string;
  source: string;
  confidence: number;
}

export interface GeminiResponse {
  text: string;
  groundedFacts: GroundedFact[];
  searchQueries: string[];
}
