import { DivinationModuleMetadata } from '@/types/module';
import { baziMetadata } from '@/modules/bazi';
import { qimenMetadata } from '@/modules/qimen';

export const MODULE_METADATA: DivinationModuleMetadata[] = [
  baziMetadata,
  qimenMetadata,
  { id: 'ziwei', name: '紫微斗数', description: '紫微星盘，洞察命运起伏', enabled: false, order: 2, inputSchema: [] },
  { id: 'liuyao', name: '六爻', description: '铜钱摇卦，解答心中疑惑', enabled: false, order: 4, inputSchema: [] },
  { id: 'meihua', name: '梅花易数', description: '心念一动，万物皆可起卦', enabled: false, order: 5, inputSchema: [] },
  { id: 'fengshui', name: '风水', description: '环境气场，调和阴阳平衡', enabled: false, order: 6, inputSchema: [] },
];

export const getModuleMetadataById = (id: string): DivinationModuleMetadata | undefined => {
  return MODULE_METADATA.find(m => m.id === id);
};
