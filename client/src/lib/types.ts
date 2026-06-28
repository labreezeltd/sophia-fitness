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
}
