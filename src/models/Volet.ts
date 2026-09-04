export type StoreStatusValue = 'OPEN' | 'CLOSE' | 'MY';

export interface StoreStatus {
  id: string;
  store_id: string;
  status: StoreStatusValue;
  timestamp: string;
}

export interface VoletInstructions {
  open_command: string | null;
  close_command: string | null;
  my_command: string | null;
}

export interface Volet extends VoletInstructions {
  id: string;
  store_id: string;
  created_at?: string;
}

