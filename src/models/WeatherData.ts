export interface WeatherData {
  id: string;
  created_at: string;
  date: string | null;
  hour: string | null;
  temperature: number | null;
  humidity: number | null;
  pressure: number | null;
  light: number | null;
}
