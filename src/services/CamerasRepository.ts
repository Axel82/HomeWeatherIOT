import { getSupabaseClient } from '../config/supabase';
import { Camera, CameraCreateInput, CameraUpdateInput } from '../models/Camera';

export class CamerasRepository {
  /**
   * Récupère la liste de toutes les caméras enregistrées.
   */
  static async getAll(): Promise<Camera[]> {
    const { data, error } = await getSupabaseClient()
      .from('Cameras')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Erreur lors de la récupération des caméras:', error.message);
      throw new Error(`Impossible de charger les caméras : ${error.message}`);
    }

    return (data || []) as Camera[];
  }

  /**
   * Ajoute une nouvelle caméra.
   */
  static async create(camera: CameraCreateInput): Promise<Camera> {
    const { data, error } = await getSupabaseClient()
      .from('Cameras')
      .insert({
        name: camera.name,
        rtsp_url: camera.rtsp_url,
        username: camera.username || null,
        password: camera.password || null,
        ip_address: camera.ip_address || null,
        port: camera.port || 554,
        channel_path: camera.channel_path || null,
        location: camera.location || null,
        snapshot_url: camera.snapshot_url || null,
        is_active: camera.is_active ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur lors de l\'ajout de la caméra:', error.message);
      throw new Error(`Impossible d'ajouter la caméra : ${error.message}`);
    }

    return data as Camera;
  }

  /**
   * Met à jour une caméra existante.
   */
  static async update(id: string, camera: CameraUpdateInput): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('Cameras')
      .update({
        name: camera.name,
        rtsp_url: camera.rtsp_url,
        username: camera.username,
        password: camera.password,
        ip_address: camera.ip_address,
        port: camera.port,
        channel_path: camera.channel_path,
        location: camera.location,
        snapshot_url: camera.snapshot_url,
        is_active: camera.is_active,
      })
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la mise à jour de la caméra:', error.message);
      throw new Error(`Impossible de mettre à jour la caméra : ${error.message}`);
    }
  }

  /**
   * Supprime une caméra.
   */
  static async remove(id: string): Promise<void> {
    const { error } = await getSupabaseClient()
      .from('Cameras')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erreur lors de la suppression de la caméra:', error.message);
      throw new Error(`Impossible de supprimer la caméra : ${error.message}`);
    }
  }
}
