import { getSupabaseClient } from '../config/supabase';
import { VoletInstructions } from '../models/Volet';

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
   * Récupère les instructions de commande pour un volet donné.
   */
  static async getInstructions(storeId: string): Promise<VoletInstructions> {
    const { data, error } = await getSupabaseClient()
      .from('Volets')
      .select('open_command, close_command, my_command')
      .eq('store_id', storeId)
      .maybeSingle();

    if (error) {
      console.error('Erreur lors de la récupération des instructions:', error.message);
      throw new Error(`Impossible de charger les instructions : ${error.message}`);
    }

    return {
      open_command: data?.open_command ?? '',
      close_command: data?.close_command ?? '',
      my_command: data?.my_command ?? '',
    };
  }

  /**
   * Met à jour les instructions de commande pour un volet donné.
   */
  static async updateInstructions(storeId: string, instructions: VoletInstructions): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('Volets')
      .update({
        open_command: instructions.open_command,
        close_command: instructions.close_command,
        my_command: instructions.my_command,
      })
      .eq('store_id', storeId);

    if (error) {
      console.error('Erreur lors de la mise à jour des instructions:', error.message);
      throw new Error(`Impossible de mettre à jour les instructions : ${error.message}`);
    }
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

