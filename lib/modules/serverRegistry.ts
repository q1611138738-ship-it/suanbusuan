import { DivinationModule } from '@/types/module';
import { baziModule } from '@/modules/bazi';
import { qimenModule } from '@/modules/qimen';

// This file must ONLY be imported on the server side (e.g. API routes)
export const SERVER_MODULES: DivinationModule[] = [
  baziModule,
  qimenModule,
  // Other modules will be added here as they are implemented
];

export const getServerModuleById = (id: string): DivinationModule | undefined => {
  return SERVER_MODULES.find(m => m.id === id && m.enabled);
};
