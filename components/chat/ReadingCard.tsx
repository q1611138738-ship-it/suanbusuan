import { Card, CardContent } from '@/components/ui/card';
import { Compass, Palette, Hash, Briefcase } from 'lucide-react';

export interface ReadingData {
  命局总论: string;
  板块: { 标题: string; 内容: string }[];
  开运: {
    幸运色: string[];
    忌讳色: string[];
    有利方位: string;
    幸运数字: string[];
    适合行业: string[];
  };
  免责: string;
  error?: string;
}

interface Props {
  data: ReadingData;
  chart: any;
}

export function ReadingCard({ data, chart }: Props) {
  if (!data || data.error) {
    return <div className="text-red-500 text-center py-4 bg-red-50 rounded-lg">解析失败或数据格式异常</div>;
  }
  
  const baziStr = chart && chart.pillars 
    ? `${chart.pillars.year?.gan || '-'}${chart.pillars.year?.zhi || '-'} ${chart.pillars.month?.gan || '-'}${chart.pillars.month?.zhi || '-'} ${chart.pillars.day?.gan || '-'}${chart.pillars.day?.zhi || '-'} ${chart.pillars.hour?.gan || '-'}${chart.pillars.hour?.zhi || '-'}`
    : '---- ---- ---- ----';
  const name = chart?.input?.name || '命主';
  const gender = chart?.input?.gender === 'F' ? '女' : '男';
  
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-6 font-serif">
      {/* Hero Section */}
      <Card className="overflow-hidden border border-border/50 shadow-lg bg-background/40 backdrop-blur-md rounded-3xl transition-all duration-300 hover:shadow-[0_0_20px_rgba(197,163,101,0.15)]">
        <div className="px-6 py-10 sm:px-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center space-x-2 bg-primary/10 px-4 py-1.5 rounded-full text-sm font-medium text-foreground mb-6 border border-border/50 shadow-sm">
            <span>{name}</span>
            <span className="w-1 h-1 rounded-full bg-primary/50"></span>
            <span>{gender}造</span>
          </div>
          
          <div className="text-2xl sm:text-3xl font-bold tracking-widest text-primary mb-8 font-serif">
            {baziStr}
          </div>
          
          <div className="relative w-full">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border/50"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-background text-sm text-primary font-medium tracking-widest rounded-full border border-border/50">批断要旨</span>
            </div>
          </div>
          
          <p className="mt-8 text-lg sm:text-xl text-foreground font-medium leading-relaxed max-w-lg text-justify">
            {data.命局总论}
          </p>
        </div>
      </Card>
      
      {/* Sections */}
      <div className="grid grid-cols-1 gap-6">
        {data.板块?.map((section, idx) => (
          <Card key={idx} className="border border-border/50 shadow-sm bg-background/20 backdrop-blur-sm rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-[0_0_15px_rgba(197,163,101,0.1)] hover:-translate-y-1 hover:border-primary/30">
            <CardContent className="p-6 sm:p-8">
              <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="w-1.5 h-5 rounded-full bg-primary"></span>
                {section.标题}
              </h3>
              <p className="text-muted-foreground leading-relaxed sm:leading-loose text-justify">
                {section.内容}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Lucky Card */}
      {data.开运 && (
        <Card className="border border-primary/30 shadow-[0_0_20px_rgba(197,163,101,0.15)] bg-primary/10 backdrop-blur-md text-foreground rounded-3xl overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <h3 className="text-lg font-bold mb-6 text-center tracking-widest text-primary">开运指南</h3>
            <div className="grid grid-cols-2 gap-y-8 gap-x-4">
              <div className="flex flex-col items-center text-center space-y-2">
                <Palette className="w-6 h-6 opacity-80" />
                <div className="text-sm opacity-60">幸运色彩</div>
                <div className="font-medium text-lg">{data.开运.幸运色?.join(' / ') || '无'}</div>
                {data.开运.忌讳色?.length > 0 && (
                  <div className="text-xs opacity-50 mt-1">忌：{data.开运.忌讳色.join('/')}</div>
                )}
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Compass className="w-6 h-6 opacity-80" />
                <div className="text-sm opacity-60">有利方位</div>
                <div className="font-medium text-lg">{data.开运.有利方位 || '无'}</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Hash className="w-6 h-6 opacity-80" />
                <div className="text-sm opacity-60">幸运数字</div>
                <div className="font-medium text-lg">{data.开运.幸运数字?.join(' / ') || '无'}</div>
              </div>
              <div className="flex flex-col items-center text-center space-y-2">
                <Briefcase className="w-6 h-6 opacity-80" />
                <div className="text-sm opacity-60">适合行业</div>
                <div className="font-medium text-sm leading-tight max-w-[120px]">{data.开运.适合行业?.join(' / ') || '无'}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="text-center text-xs text-muted-foreground pb-8 px-4">
        {data.免责 || "仅供传统文化角度参考，不构成医疗、法律、财务等专业建议。"}
      </div>
    </div>
  );
}
