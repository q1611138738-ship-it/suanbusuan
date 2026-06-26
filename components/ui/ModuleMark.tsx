import { useId } from 'react';
import styles from './ModuleMark.module.css';

type ModuleKind = 'bazi' | 'qimen';

interface ModuleMarkProps {
  kind: ModuleKind;
  size?: number;
}

/**
 * 模块标识图标（与顶栏的太极八卦区分）：
 *  - bazi  : 四柱命盘（细金环 + 四柱星线）
 *  - qimen : 洛书九宫（细金环 + 3x3 九宫格，中宫一点金）
 * 哑光古铜金 + 暗曜石，缓慢旋转（reduced-motion 下静止）。
 */
export default function ModuleMark({ kind, size = 64 }: ModuleMarkProps) {
  const raw = useId().replace(/:/g, '');
  const gid = `mm-${kind}-${raw}-metal`;
  const glowId = `mm-${kind}-${raw}-glow`;

  return (
    <span
      className={styles.disc}
      style={{ width: size, height: size }}
      role="img"
      aria-label={kind === 'bazi' ? '八字命盘' : '奇门九宫'}
    >
      <svg className={styles.dial} viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <linearGradient id={gid} x1="18" y1="10" x2="82" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--mark-gold-hi)" />
            <stop offset="0.48" stopColor="var(--mark-gold)" />
            <stop offset="1" stopColor="var(--mark-gold-low)" />
          </linearGradient>
          <radialGradient id={glowId} cx="0.5" cy="0.5" r="0.55">
            <stop offset="0" stopColor="var(--mark-glow-core)" />
            <stop offset="1" stopColor="var(--mark-glow-edge)" />
          </radialGradient>
        </defs>

        {/* 共用外圈与刻度 */}
        <circle cx="50" cy="50" r="28" fill={`url(#${glowId})`} opacity="0.38" />
        <g fill="none" stroke={`url(#${gid})`}>
          <circle cx="50" cy="50" r="46" strokeWidth="1.25" />
          <circle cx="50" cy="50" r="38" strokeWidth="0.9" opacity="0.48" />
          <circle cx="50" cy="50" r="23" strokeWidth="0.75" opacity="0.32" />
        </g>
        <g stroke={`url(#${gid})`} strokeWidth="1" opacity="0.7" strokeLinecap="round">
          <line x1="50" y1="4" x2="50" y2="10" />
          <line x1="50" y1="90" x2="50" y2="96" />
          <line x1="4" y1="50" x2="10" y2="50" />
          <line x1="90" y1="50" x2="96" y2="50" />
          <line x1="19" y1="19" x2="22" y2="22" />
          <line x1="78" y1="78" x2="81" y2="81" />
          <line x1="81" y1="19" x2="78" y2="22" />
          <line x1="22" y1="78" x2="19" y2="81" />
        </g>

        {kind === 'bazi' ? (
          // 八字：四柱星线，避免与标题文字混在一起。
          <g fill="none" stroke={`url(#${gid})`} strokeLinecap="round" strokeLinejoin="round">
            <path d="M34 29v42" strokeWidth="2.2" />
            <path d="M45 24v52" strokeWidth="1.45" opacity="0.82" />
            <path d="M56 24v52" strokeWidth="1.45" opacity="0.82" />
            <path d="M67 29v42" strokeWidth="2.2" />
            <path d="M30 38h40M30 62h40" strokeWidth="0.9" opacity="0.42" />
            <g fill={`url(#${gid})`} stroke="none">
              <circle cx="34" cy="34" r="2.3" />
              <circle cx="45" cy="41" r="1.9" />
              <circle cx="56" cy="59" r="1.9" />
              <circle cx="67" cy="66" r="2.3" />
            </g>
          </g>
        ) : (
          // 奇门：洛书九宫格（中宫一点金）
          <g>
            <rect
              x="31"
              y="31"
              width="38"
              height="38"
              rx="2"
              fill="none"
              stroke={`url(#${gid})`}
              strokeWidth="1.8"
            />
            <g stroke={`url(#${gid})`} strokeWidth="1.25" opacity="0.86">
              <line x1="43.6" y1="31" x2="43.6" y2="69" />
              <line x1="56.3" y1="31" x2="56.3" y2="69" />
              <line x1="31" y1="43.6" x2="69" y2="43.6" />
              <line x1="31" y1="56.3" x2="69" y2="56.3" />
            </g>
            <path
              d="M50 24v7M50 69v7M24 50h7M69 50h7"
              stroke={`url(#${gid})`}
              strokeWidth="1.15"
              strokeLinecap="round"
              opacity="0.72"
            />
            <circle cx="50" cy="50" r="3" fill={`url(#${gid})`} />
          </g>
        )}
      </svg>
    </span>
  );
}
