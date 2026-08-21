import { getSupabaseClient } from '../config/supabase';
import { AirConditionnerCommand, AirConditionnerState } from '../models/AirConditionner';

export class AirConditionnerRepository {
  /**
   * Récupère l'état courant de la climatisation (ligne unique de la table).
   */
  static async getState(): Promise<AirConditionnerState | null> {
    const { data, error } = await getSupabaseClient()
      .from('AirConditionner')
      .select('*')
      .order('id', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Erreur lors de la récupération de l'état de la climatisation:", error.message);
      throw new Error(`Impossible de charger l'état de la climatisation : ${error.message}`);
    }

    return data as AirConditionnerState | null;
  }

  /**
   * Envoie une nouvelle commande de climatisation.
   * Met à jour la ligne existante si elle existe, sinon en crée une.
   */
  static async sendCommand(command: AirConditionnerCommand, existingId?: number): Promise<AirConditionnerState> {
    const client = getSupabaseClient();

    if (existingId) {
      const { data, error } = await client
        .from('AirConditionner')
        .update(command)
        .eq('id', existingId)
        .select('*');

      if (error) {
        console.error("Erreur lors de l'envoi de la commande de climatisation:", error.message);
        throw new Error(`Impossible d'envoyer la commande de climatisation : ${error.message}`);
      }

      if (data && data.length > 0) {
        return data[0] as AirConditionnerState;
      }
      // Aucune ligne mise à jour (id obsolète) : on retombe sur une création.
    }

    const { data, error } = await client.from('AirConditionner').insert(command).select('*');

    if (error) {
      console.error("Erreur lors de l'envoi de la commande de climatisation:", error.message);
      throw new Error(`Impossible d'envoyer la commande de climatisation : ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error(
        "La commande a été enregistrée mais aucune ligne n'a été retournée. Vérifiez les policies RLS (SELECT) de la table AirConditionner."
      );
    }

    return data[0] as AirConditionnerState;
  }
}
