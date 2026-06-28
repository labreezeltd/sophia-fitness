// Shape returned by GET /api/overview — mirrors BusinessOverview on the server.
export interface BusinessOverview {
  totalMembers: number;
  activeMembers: number;
  activePartners: number;
  pendingPartners: number;
  totalRedemptions: number;
  memberSavings: number;
  memberMRR: number;
  partnerMRR: number;
  commissionThisMonth: number;
  totalMRR: number;
  marketingSpend: number;
  marketingSignups: number;
  blendedCAC: number;
  ltvToCac: number;
  activeAutomations: number;
  pipelineValue: number;
  openLeads: number;
  queuedMessages: number;
}

export interface ContentAsset {
  channel: string;
  label: string;
  title: string;
  body: string;
  hashtags?: string[];
  cta: string;
}

export interface Integrations {
  company: { name: string; email: string };
  email: { provider: string; configured: boolean; from: string };
  stripe: { configured: boolean };
}
