import { UsageRecord, VirtualKey } from '@/domain/types';

export interface GatewayPort {
  createKey(userId: string): Promise<VirtualKey>;
  rotateKey(keyId: string): Promise<VirtualKey>;
  deleteKey(keyId: string): Promise<void>;
  updateKeyLimits(keyId: string, weeklyLimit: number | null): Promise<void>;
  getUsage(keyId: string): Promise<UsageRecord>;
}
