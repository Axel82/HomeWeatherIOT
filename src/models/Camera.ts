export interface Camera {
  id: string;
  name: string;
  rtsp_url: string;
  username?: string | null;
  password?: string | null;
  ip_address?: string | null;
  port?: number | null;
  channel_path?: string | null;
  location?: string | null;
  snapshot_url?: string | null;
  is_active?: boolean;
  order_index?: number;
  created_at?: string;
}

export type CameraCreateInput = Omit<Camera, 'id' | 'created_at'>;
export type CameraUpdateInput = Partial<CameraCreateInput>;

/**
 * Construit l'URL RTSP complète avec identifiants si configurés séparément,
 * ou renvoie directement l'URL RTSP si déjà complète.
 */
export function buildCameraRtspUrl(camera: Partial<Camera>): string {
  if (camera.rtsp_url && camera.rtsp_url.trim().length > 0) {
    let url = camera.rtsp_url.trim();
    // Si l'utilisateur a renseigné username/password séparément mais que l'URL ne les contient pas
    if (camera.username && camera.password && !url.includes('@')) {
      const match = url.match(/^([a-zA-Z]+:\/\/)(.*)$/);
      if (match) {
        const protocol = match[1];
        const rest = match[2];
        return `${protocol}${encodeURIComponent(camera.username)}:${encodeURIComponent(camera.password)}@${rest}`;
      }
    }
    return url;
  }

  // Sinon si ip_address est fournie
  if (camera.ip_address) {
    const port = camera.port ? `:${camera.port}` : ':554';
    const path = camera.channel_path ? (camera.channel_path.startsWith('/') ? camera.channel_path : `/${camera.channel_path}`) : '/stream1';
    const auth = camera.username && camera.password 
      ? `${encodeURIComponent(camera.username)}:${encodeURIComponent(camera.password)}@` 
      : '';
    return `rtsp://${auth}${camera.ip_address}${port}${path}`;
  }

  return '';
}
