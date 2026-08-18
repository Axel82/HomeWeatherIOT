import { getSupabaseClient } from '../config/supabase';
import { WeatherData } from '../models/WeatherData';

export class WeatherRepository {
  /**
   * Récupère les données météorologiques récentes, triées par date de création décroissante.
   * @param limit Nombre de lignes à récupérer (défaut: 50)
   */
  static async getRecentWeatherData(limit: number = 50): Promise<WeatherData[]> {
    const { data, error } = await getSupabaseClient()
      .from('WeatherData')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erreur lors de la récupération des données Supabase:', error.message);
      throw new Error('Impossible de charger les données météorologiques.');
    }

    return data as WeatherData[];
  }
}
