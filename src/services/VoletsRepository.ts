import { getSupabaseClient } from '../config/supabase';

export class VoletsRepository {
  /**
   * Récupère la liste des identifiants de volets enregistrés.
   */
  static async getAll(): Promise<string[]> {
    const { data, error } = await getSupabaseClient()
      .from('Volets')
      .select('store_id')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des volets:', error.message);
      throw new Error(`Impossible de charger la liste des volets : ${error.message}`);
    }

    return (data as { store_id: string }[]).map((row) => row.store_id);
  }

  /**
   * Enregistre un nouveau volet.
   */
  static async create(storeId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('Volets')
      .insert({ store_id: storeId });

    if (error) {
      console.error('Erreur lors de la création du volet:', error.message);
      throw new Error(
        error.code === '23505' ? 'Ce volet existe déjà.' : `Impossible de créer le volet : ${error.message}`
      );
    }
  }

  /**
   * Supprime un volet.
   */
  static async remove(storeId: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('Volets')
      .delete()
      .eq('store_id', storeId);

    if (error) {
      console.error('Erreur lors de la suppression du volet:', error.message);
      throw new Error(`Impossible de supprimer le volet : ${error.message}`);
    }
  }
}
