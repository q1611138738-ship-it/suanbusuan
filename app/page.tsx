import { MODULE_METADATA } from '@/config/modules';
import { ModuleCard } from '@/components/modules/ModuleCard';
import { Navbar } from '@/components/layout/Navbar';
import { IntroOverlay } from '@/components/home/IntroOverlay';
import { LuopanHero } from '@/components/home/LuopanHero';
import Link from 'next/link';

const INTRO_TEXT = '天行健，君子以自强不息。';

export default function Home() {
  const modules = [...MODULE_METADATA].sort((a, b) => (a.order || 99) - (b.order || 99));

  return (
    <div className="min-h-dvh bg-[var(--home-bg)] text-foreground">
      <IntroOverlay text={INTRO_TEXT} />

      <Navbar />

      <main className="relative">
        <LuopanHero />

        <section id="entry-methods" className="relative px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="home-section-eyebrow mb-3 text-sm">可核对的盘面，克制的解读</p>
                <h2 className="home-section-title text-3xl font-semibold sm:text-4xl">
                  选择你的术数工具
                </h2>
              </div>
              <p className="home-section-copy max-w-xl text-sm leading-7">
                当前已开放八字与奇门遁甲，其他术数工具正在筹备中。
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>
        </section>

        <section id="metaphysics-education" className="relative px-4 py-16 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="mx-auto max-w-6xl">
            <div className="mb-10 text-center">
              <h2 className="home-section-title text-3xl font-semibold sm:text-4xl mb-4">
                术数科普
              </h2>
              <p className="home-section-copy max-w-2xl mx-auto text-[var(--home-muted)] text-base leading-8">
                诗书礼易乐道不尽人间冷暖，<br />
                山医命相卜算不尽世事无常。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* 卡片 1 */}
              <Link href="/articles/bazi-intro" className="group relative block p-8 rounded-3xl border border-[var(--home-border)] bg-[var(--home-panel)] shadow-[0_18px_48px_var(--home-shadow)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--home-gold)]">
                <h3 className="text-2xl font-serif font-semibold text-[var(--hero-title)] mb-3 group-hover:text-[var(--home-gold)] transition-colors">八字是什么？</h3>
                <p className="text-[var(--home-text)] text-sm leading-relaxed mb-6 opacity-80">
                  八字是用出生时间换算成年、月、日、时四组干支，再从五行、十神、旺衰与大运中观察一个人的结构倾向。
                </p>
                <span className="inline-flex items-center text-sm font-medium text-[var(--home-gold)]">
                  阅读八字入门 <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>

              {/* 卡片 2 */}
              <Link href="/articles/qimen-intro" className="group relative block p-8 rounded-3xl border border-[var(--home-border)] bg-[var(--home-panel)] shadow-[0_18px_48px_var(--home-shadow)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--home-gold)]">
                <h3 className="text-2xl font-serif font-semibold text-[var(--hero-title)] mb-3 group-hover:text-[var(--home-gold)] transition-colors">奇门遁甲是什么？</h3>
                <p className="text-[var(--home-text)] text-sm leading-relaxed mb-6 opacity-80">
                  奇门遁甲更像一个时间与空间的局势模型，常用于分析当下选择、方向、时机与事件变化，而不是单纯描述一个人的出生结构。
                </p>
                <span className="inline-flex items-center text-sm font-medium text-[var(--home-gold)]">
                  阅读奇门入门 <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                </span>
              </Link>
            </div>
          </div>
        </section>

        <section id="about" className="relative px-4 pb-24 pt-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl">
            <div className="about-panel">
              <div>
                <p className="home-section-eyebrow mb-3 text-sm">关于算不算</p>
                <h2 className="home-section-title text-3xl font-semibold sm:text-4xl">
                  以现代设计重新呈现传统术数
                </h2>
              </div>
              <p className="home-section-copy max-w-2xl text-base leading-8">
                排盘与解读分开：先呈现可核对的盘面，再决定是否进入 AI 解读。所有结果仅供传统文化体验与自我观察参考。
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
