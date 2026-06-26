import Link from 'next/link';
import { Metadata } from 'next';
import styles from '../ArticleActions.module.css';

export const metadata: Metadata = {
  title: "八字是什么？｜算不算",
  description: "把一个人的出生时间换算成四组干支，理解四柱八字的发展、流派、月令、五行、十神与日主强弱。",
};

export default function BaziIntroPage() {
  return (
    <div className="min-h-dvh bg-[var(--home-bg)] text-foreground selection:bg-[var(--home-gold)] selection:text-[var(--home-button-fg)]">
      <main className="relative px-4 py-16 sm:px-6 lg:px-8 max-w-3xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-[var(--home-muted)] hover:text-[var(--home-gold)] transition-colors">
            ← 返回首页
          </Link>
        </div>

        <article className="prose prose-stone dark:prose-invert prose-headings:font-serif prose-a:text-[var(--home-gold)] prose-a:no-underline hover:prose-a:underline max-w-none">
          <header className="mb-10">
            <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--hero-title)] mb-4">八字是什么？</h1>
            <p className="text-sm text-[var(--home-muted)]">阅读时间：约 5 分钟</p>
          </header>

          <div className="text-[var(--home-text)] leading-relaxed space-y-6">
            <p>把一个人的出生时间，换算成四组干支：年柱、月柱、日柱、时柱。</p>
            <p>这四组干支合在一起，就是常说的&quot;四柱八字&quot;。</p>
            <p>这里头时间到底怎么算，本身就有讲究——北京时间、地方时、真太阳时、节气交接，都会影响结果（后面会细说）。我个人更推崇使用真太阳时，因为它更接近出生地真实的太阳位置，本平台也默认按真太阳时起盘。但也要承认，不少师傅不用真太阳时、手动排盘，照样断得准。</p>
            <p>所以八字不是死规则，而是一套结构分析方法。排盘要严谨，判断要看整体。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">一、八字的发展：从年命到子平法</h2>
            <p>八字不是一开始就是今天这个样子。</p>
            <p>早期命理多看&quot;年命&quot;，重点在出生年份、纳音、神煞。简单说，就是以年为主，看一个人的大方向。</p>
            <p>到了唐代，李虚中以年、月、日的干支论命，但仍以年柱为重。命理由此开始从单一的&quot;年命&quot;，走向多柱参看。</p>
            <p>真正的转折在五代至宋初。徐子平一系逐渐把&quot;日干&quot;立为核心，再经后世整理，形成后来常说的&quot;子平法&quot;。这一步很关键：八字不再只看你生在哪一年，而是以日干代表自己，再看其他干支和日主之间的生克关系。</p>
            <p>此后历宋明以降，《渊海子平》《三命通会》《滴天髓》《子平真诠》等书相继问世，把格局、旺衰、用神、十神、大运等体系逐渐整理成型。</p>
            <p>今天我们说的八字，主流就是以日主为核心的子平四柱法。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">二、八字主要有哪些流派</h2>
            <p>八字发展到后来，形成了很多看法。常见的主流方向，大概有几类。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">1. 格局派</h3>
            <p>格局派重视月令和成格。</p>
            <p>它关心的是：这个命局有没有形成某种结构，比如正官格、七杀格、财格、印格、食伤格等。</p>
            <p>格局派的核心不是&quot;缺什么补什么&quot;，而是看这个盘有没有成气候，有没有清纯，有没有破格。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">2. 旺衰派</h3>
            <p>旺衰派重视日主强弱。</p>
            <p>它先判断日主是强还是弱，再看应该扶还是抑。日主弱，可能要印比帮身；日主强，可能要财官食伤泄耗制化。</p>
            <p>但旺衰不能机械判断。只看强弱，不看结构，很容易断偏。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">3. 调候派</h3>
            <p>调候派重视寒暖燥湿。</p>
            <p>比如冬天生人，命局太寒，可能需要火来暖局；夏天生人，火土太燥，可能需要水来润局。</p>
            <p>调候派看的是气候，不只是五行数量。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">4. 象法、盲派</h3>
            <p>象法和盲派更重视干支组合、宫位、刑冲合害、十神落点和具体象意。</p>
            <p>它更像是从命局里&quot;读画面&quot;。优点是直观，缺点是非常吃经验，不能只背口诀。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">5. 神煞、纳音</h3>
            <p>神煞和纳音在古法里很常见，但在现代子平体系里，通常只能当辅助。</p>
            <p>它们可以提供参考，但不能压过四柱结构、五行生克、十神关系和大运流转。</p>
            <p>说回我们自己的立场：本平台以子平格局为主、旺衰调候为辅，神煞纳音仅作参考——既尊重传统，也尽量不被零散口诀带偏。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">三、八字不是一句结论，而是一张结构图</h2>
            <p>八字更像一张传统时间结构图。</p>
            <p>年柱通常代表时代背景、家族环境、早年信息；月柱代表季节、成长环境，也是判断旺衰和格局的关键；日柱以日干为核心，日干就是&quot;日主&quot;，代表自己；时柱多看后天发展、长期结果、晚年、子女等信息。</p>
            <p>真正的分析，不是看到某一个字就下结论，而是看整张盘的配合。</p>
            <p>天干地支之间有生克、合化、刑冲、穿害，也有力量大小。把这些关系放在一起，才能看清这个盘到底是什么结构。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">四、为什么月令最关键</h2>
            <p>八字最看重月令。</p>
            <p>因为月令代表出生时的季节之气。同样一个五行，生在不同月份，力量完全不同。</p>
            <p>木在春天有力，火在夏天旺，金在秋天强，水在冬天得势。判断日主强弱、格局成败、五行流通，都绕不开月令。</p>
            <p>所以八字不是按农历月份简单排。传统八字以二十四节气为分界，尤其年柱、月柱都和节气有关。</p>
            <p>排盘如果节气错了，月柱就可能错；月柱错了，后面基本都会偏。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">五、五行和十神到底看什么</h2>
            <p>八字里的五行，是木、火、土、金、水。</p>
            <p>五行不是&quot;缺什么补什么&quot;。真正要看的是：谁生谁，谁克谁，谁有力量，谁被制住，谁能流通。</p>
            <p>十神则是从日主出发，看其他干支和自己的关系。</p>
            <p>十神有：比肩、劫财、食神、伤官、正财、偏财、正官、七杀、正印、偏印。</p>
            <p>十神不是好坏标签。财不一定就是钱，官不一定就是官，印不一定就是学历，伤官也不一定就是坏。</p>
            <p>它们只是关系符号，必须放回命局结构里看。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">六、日主强弱只是入口，不是结论</h2>
            <p>很多人一看八字，就说日主强、日主弱。</p>
            <p>这只是入口，不是结论。</p>
            <p>日主强弱要结合月令、根气、透干、生扶、克泄、大运一起看。同样是日主弱，有的人需要印，有的人需要比劫，有的人反而不能乱补。</p>
            <p>八字最忌讳简单化。</p>
            <p>只看五行数量，是错的；只看缺什么补什么，是浅的；只看强弱不看格局，也容易偏。</p>
          </div>
        </article>

        <div className="mt-16 pt-8 border-t border-[var(--home-border)] flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/chat/bazi" className="home-primary-button w-full sm:w-auto">
            开始八字排盘
          </Link>
          <Link href="/#entry-methods" className={`home-secondary-button w-full sm:w-auto ${styles.moreToolsButton}`}>
            查看更多工具
          </Link>
        </div>
      </main>
    </div>
  );
}
