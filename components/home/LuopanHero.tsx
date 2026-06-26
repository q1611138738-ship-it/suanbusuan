import Link from 'next/link';
import { LuopanCompass } from '@/components/home/LuopanCompass';
import { MountainLayers } from '@/components/home/MountainLayers';
import { StarField } from '@/components/home/StarField';
import { HomeHashLink } from '@/components/home/HomeHashLink';

const toolLinks = [
  { label: '八字排盘', href: '/chat/bazi' },
  { label: '奇门遁甲', href: '/chat/qimen' },
];

export function LuopanHero() {
  return (
    <section id="top" className="luopan-hero">
      <StarField />
      <LuopanCompass />
      <div className="hero-readable-mask" aria-hidden="true" />
      <MountainLayers />

      <div className="luopan-hero-content">
        <p className="eyebrow luopan-kicker">东方术数 · Verify First · AI 辅助解读</p>

        <h1 className="hero-title luopan-title" aria-label="算不算">
          <span>算</span>
          <span>不</span>
          <span>算</span>
        </h1>

        <div className="luopan-title-rule" aria-hidden="true" />

        <p className="hero-poem luopan-tagline">
          指引迷路君子，点拨久困英雄；
          <br />
          善解少女心事，成全世间相逢。
        </p>

        <div className="luopan-actions">
          <HomeHashLink hash="#entry-methods" className="primary-cta home-primary-button">
            开始测算
          </HomeHashLink>
          <Link href="#metaphysics-education" className="secondary-cta home-secondary-button">
            术数科普
          </Link>
        </div>

        <div className="luopan-tool-chips" aria-label="快捷工具入口">
          {toolLinks.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              {tool.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
