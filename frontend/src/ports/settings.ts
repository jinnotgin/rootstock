import { GlobalSettings } from '@/domain/types';

export interface SettingsPort {
  getSettings(): Promise<GlobalSettings>;
  updateSettings(settings: GlobalSettings): Promise<GlobalSettings>;
}
