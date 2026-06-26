import { DivinationModuleMetadata } from '@/types/module';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ModuleCardProps {
  module: DivinationModuleMetadata;
}

const TOOL_COPY: Record<string, { name: string; description: string; mark: string }> = {
  bazi: {
    name: '八字排盘',
    description: '知命局，看流年，辨喜忌',
    mark: '命',
  },
  qimen: {
    name: '奇门遁甲',
    description: '观时局，择方向，断成败',
    mark: '局',
  },
  ziwei: {
    name: '紫微斗数',
    description: '星曜入命，洞见人生格局',
    mark: '星',
  },
  liuyao: {
    name: '六爻',
    description: '一卦成象，问事断机',
    mark: '卦',
  },
  meihua: {
    name: '梅花易数',
    description: '心念一动，万物皆可起卦',
    mark: '易',
  },
  fengshui: {
    name: '风水',
    description: '观形察气，调和阴阳平衡',
    mark: '气',
  },
};

function ToolGlyph({ id, enabled }: { id: string; enabled: boolean }) {
  const glyphClass = enabled ? 'tool-glyph tool-glyph-active' : 'tool-glyph tool-glyph-muted';

  if (id === 'bazi') {
    return (
      <div className={glyphClass} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" />
          <circle cx="24" cy="24" r="12" />
          <path d="M24 12a6 6 0 0 1 0 12 6 6 0 0 0 0 12 12 12 0 0 0 0-24Z" className="tool-glyph-fill" />
          <circle cx="24" cy="18" r="1.8" className="tool-glyph-fill" />
          <circle cx="24" cy="30" r="1.8" />
          <path d="M24 3.5v5M24 39.5v5M3.5 24h5M39.5 24h5" />
        </svg>
      </div>
    );
  }

  if (id === 'qimen') {
    return (
      <div className={glyphClass} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" />
          <path d="M14 14h20v20H14zM24 14v20M14 24h20" />
          <path d="m24 8 2.3 4.2 4.7.8-3.3 3.4.7 4.8-4.4-2.1-4.4 2.1.7-4.8L17 13l4.7-.8L24 8Z" className="tool-glyph-fill" />
          <path d="M10 38h28" />
        </svg>
      </div>
    );
  }

  if (id === 'ziwei') {
    return (
      <div className={glyphClass} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" />
          <path d="m24 9 3.5 9.1 9.5.5-7.4 6.1 2.5 9.3-8.1-5.1-8.1 5.1 2.5-9.3-7.4-6.1 9.5-.5L24 9Z" />
          <circle cx="24" cy="24" r="3" className="tool-glyph-fill" />
        </svg>
      </div>
    );
  }

  if (id === 'liuyao') {
    return (
      <div className={glyphClass} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" />
          <path d="M16 15h16M16 20h6M26 20h6M16 25h16M16 30h6M26 30h6M16 35h16" />
          <circle cx="24" cy="24" r="4" className="tool-glyph-fill" />
        </svg>
      </div>
    );
  }

  if (id === 'fengshui') {
    return (
      <div className={glyphClass} aria-hidden="true">
        <svg viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="18" />
          <path d="M11 31c5-7 8.5-11 13-11s8 4 13 11" />
          <path d="M14 34c3-3 6-4.5 10-4.5S31 31 34 34" />
          <path d="M15 17c3 2.8 6 3.4 9 0s6-2.8 9 0" />
          <circle cx="24" cy="24" r="2.5" className="tool-glyph-fill" />
        </svg>
      </div>
    );
  }

  return (
    <div className={glyphClass} aria-hidden="true">
      <svg viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" />
        <path d="M24 10v28M10 24h28M14 14l20 20M34 14 14 34" />
        <circle cx="24" cy="24" r="5" className="tool-glyph-fill" />
      </svg>
    </div>
  );
}

export function ModuleCard({ module }: ModuleCardProps) {
  const isEnabled = module.enabled;
  const copy = TOOL_COPY[module.id] || {
    name: module.name,
    description: module.description,
    mark: '术',
  };

  return (
    <Card
      className={`module-card group relative min-h-[260px] overflow-hidden rounded-3xl border p-0 transition duration-300 ${
        isEnabled
          ? 'module-card-enabled hover:-translate-y-1'
          : 'module-card-disabled border-dashed opacity-70 grayscale-[0.18]'
      }`}
    >
      <div className="module-card-aura absolute inset-0 opacity-95" />
      <div className="module-card-mark absolute -right-12 -top-12 flex h-32 w-32 items-center justify-center rounded-full border text-5xl font-serif transition duration-500 group-hover:scale-110">
        {copy.mark}
      </div>

      <CardHeader className="relative px-6 pb-3 pt-7">
        <div className="mb-7 flex items-center justify-between">
          <ToolGlyph id={module.id} enabled={isEnabled} />
          <span className="module-status-pill rounded-full border px-3 py-1 text-xs">
            {isEnabled ? '已开放' : '筹备中'}
          </span>
        </div>
        <CardTitle className="module-card-title font-serif text-2xl font-semibold">
          {copy.name}
        </CardTitle>
        <CardDescription className="module-card-description mt-3 text-base leading-7">
          {copy.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative mt-auto px-6 pb-6 pt-5">
        {isEnabled ? (
          <Link
            href={`/chat/${module.id}`}
            className="module-card-action inline-flex h-11 w-full items-center justify-center rounded-full px-5 text-sm font-medium transition focus:outline-none focus:ring-2"
          >
            开始入局
          </Link>
        ) : (
          <Button variant="outline" className="module-card-action module-card-action-disabled h-11 w-full cursor-not-allowed rounded-full border-dashed bg-transparent" disabled>
            敬请期待
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
