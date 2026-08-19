import { getSupabaseClient } from '../config/supabase';
import { StoreStatus, StoreStatusValue } from '../models/Volet';

export class StoreStatusRepository {
  /**
   * Envoie une nouvelle commande (OPEN/CLOSE/MY) pour un volet donné.
   */
  static async sendStatus(storeId: string, status: StoreStatusValue): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('StoreStatus')
      .insert({ store_id: storeId, status });

    if (error) {
      console.error("Erreur lors de l'envoi de la commande du volet:", error.message);
      throw new Error("Impossible d'envoyer la commande au volet.");
    }
  }

  /**
   * Récupère, pour chaque store_id fourni, la dernière ligne de statut connue.
   */
  static async getLatestStatuses(storeIds: string[]): Promise<Record<string, StoreStatus>> {
    if (storeIds.length === 0) {
      return {};
    }

    const { data, error } = await getSupabaseClient()
      .from('StoreStatus')
      .select('*')
      .in('store_id', storeIds)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des statuts des volets:', error.message);
      throw new Error('Impossible de charger les statuts des volets.');
    }

    const latestByStoreId: Record<string, StoreStatus> = {};
    for (const row of data as StoreStatus[]) {
      if (!latestByStoreId[row.store_id]) {
        latestByStoreId[row.store_id] = row;
      }
    }
    return latestByStoreId;
  }
}
