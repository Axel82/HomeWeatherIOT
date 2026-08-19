export type StoreStatusValue = 'OPEN' | 'CLOSE' | 'MY';

export interface StoreStatus {
  id: string;
  store_id: string;
  status: StoreStatusValue;
  timestamp: string;
}
