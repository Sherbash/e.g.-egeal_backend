export interface IAffiliate {
  influencerId: string;
  toolId: string;
  affiliateUrl: string;
  clicks: number;
  conversions: number;
  commissionRate: number;
  earning: number;
  sourceClicks?: { [source: string]: number };
}
