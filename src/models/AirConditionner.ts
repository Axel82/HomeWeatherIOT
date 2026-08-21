export interface AirConditionnerState {
  id: number;
  PowerStatus: boolean;
  TemperatureCommand: number;
  FanSpeed: number;
}

export type AirConditionnerCommand = Omit<AirConditionnerState, 'id'>;
