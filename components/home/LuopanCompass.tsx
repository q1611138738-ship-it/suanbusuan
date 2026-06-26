const twentyFourMountains = [
  '壬',
  '子',
  '癸',
  '丑',
  '艮',
  '寅',
  '甲',
  '卯',
  '乙',
  '辰',
  '巽',
  '巳',
  '丙',
  '午',
  '丁',
  '未',
  '坤',
  '申',
  '庚',
  '酉',
  '辛',
  '戌',
  '乾',
  '亥',
];

const trigrams = ['☰', '☱', '☲', '☳', '☴', '☵', '☶', '☷'];
const earthlyBranches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const CENTER = 250;

function polarPoint(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;

  return {
    x: CENTER + radius * Math.cos(radians),
    y: CENTER + radius * Math.sin(radians),
  };
}

function RingText({
  items,
  radius,
  className,
  offset = 0,
}: {
  items: string[];
  radius: number;
  className: string;
  offset?: number;
}) {
  return (
    <>
      {items.map((item, index) => {
        const angle = offset + (360 / items.length) * index;
        const point = polarPoint(radius, angle);

        return (
          <text
            key={`${className}-${item}-${index}`}
            x={point.x}
            y={point.y}
            className={className}
            transform={`rotate(${angle} ${point.x} ${point.y})`}
          >
            {item}
          </text>
        );
      })}
    </>
  );
}

function TickRing({
  count,
  innerRadius,
  outerRadius,
  className,
}: {
  count: number;
  innerRadius: number;
  outerRadius: number;
  className: string;
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => {
        const angle = (360 / count) * index;
        const inner = polarPoint(innerRadius, angle);
        const outer = polarPoint(outerRadius, angle);

        return (
          <line
            key={`${className}-${index}`}
            className={className}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
          />
        );
      })}
    </>
  );
}

export function LuopanCompass() {
  return (
    <div className="compass-wrap luopan-compass-wrap" aria-hidden="true">
      <svg className="luopan-compass" viewBox="0 0 500 500" role="img">
        <defs>
          <radialGradient id="luopanPaper" cx="50%" cy="50%" r="58%">
            <stop offset="0%" stopColor="var(--luopan-paper-core)" />
            <stop offset="64%" stopColor="var(--luopan-paper)" />
            <stop offset="100%" stopColor="var(--luopan-paper-edge)" />
          </radialGradient>
          <radialGradient id="luopanCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--home-gold)" stopOpacity="0.38" />
            <stop offset="78%" stopColor="var(--home-gold)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--home-gold)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle className="luopan-aura" cx={CENTER} cy={CENTER} r="238" />
        <circle className="luopan-plate" cx={CENTER} cy={CENTER} r="224" />
        <circle className="luopan-ring-line luopan-ring-line-outer" cx={CENTER} cy={CENTER} r="224" />
        <circle className="luopan-ring-line" cx={CENTER} cy={CENTER} r="196" />
        <circle className="luopan-ring-line" cx={CENTER} cy={CENTER} r="160" />
        <circle className="luopan-ring-line" cx={CENTER} cy={CENTER} r="126" />
        <circle className="luopan-ring-line" cx={CENTER} cy={CENTER} r="92" />
        <circle className="luopan-ring-line luopan-ring-line-inner" cx={CENTER} cy={CENTER} r="58" />

        <g className="luopan-ring luopan-ring-outer">
          <TickRing count={24} innerRadius={196} outerRadius={224} className="luopan-sector-tick luopan-sector-tick-major" />
          <TickRing count={72} innerRadius={214} outerRadius={224} className="luopan-sector-tick luopan-sector-tick-minor" />
          <RingText items={twentyFourMountains} radius={210} className="luopan-text luopan-text-mountain" />
        </g>

        <g className="luopan-ring luopan-ring-middle">
          <TickRing count={8} innerRadius={126} outerRadius={160} className="luopan-sector-tick luopan-sector-tick-major" />
          <RingText items={trigrams} radius={143} className="luopan-text luopan-text-trigram" offset={22.5} />
        </g>

        <g className="luopan-ring luopan-ring-inner">
          <TickRing count={12} innerRadius={92} outerRadius={126} className="luopan-sector-tick luopan-sector-tick-major" />
          <RingText items={earthlyBranches} radius={109} className="luopan-text luopan-text-branch" />
        </g>

        <circle className="luopan-center-glow" cx={CENTER} cy={CENTER} r="72" />
        <g transform={`translate(${CENTER} ${CENTER})`}>
          <g className="luopan-taiji">
            <circle className="luopan-taiji-disc" cx="0" cy="0" r="44" />
            <path className="luopan-taiji-dark" d="M 0 -44 A 44 44 0 0 1 0 44 A 22 22 0 0 1 0 0 A 22 22 0 0 0 0 -44" />
            <circle className="luopan-taiji-dot-light" cx="0" cy="-22" r="6" />
            <circle className="luopan-taiji-dot-dark" cx="0" cy="22" r="6" />
            <circle className="luopan-taiji-ring" cx="0" cy="0" r="44" />
          </g>
        </g>
      </svg>
    </div>
  );
}
