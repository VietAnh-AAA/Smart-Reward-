
export enum PaymentType {
  CARD = 'CARD',
  WALLET = 'WALLET',
  APP = 'APP',
  LOYALTY = 'LOYALTY'
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  provider: string;
}

export interface StructuredDeal {
  partnerName: string;
  discountDetail: string;
  category: string;
  paymentMethodSource: string;
  expiryDate: string;
  terms?: string;
  cardNetwork?: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface PromotionDatabase {
  lastUpdated: number;
  deals: StructuredDeal[];
  // Fix: Added sources to comply with Gemini Search Grounding requirements
  sources?: GroundingSource[];
}
