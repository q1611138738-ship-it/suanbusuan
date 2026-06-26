import Link from 'next/link';
import { Metadata } from 'next';
import styles from '../ArticleActions.module.css';

export const metadata: Metadata = {
  title: "奇门遁甲是什么？它和八字有什么不同｜算不算",
  description: "通俗介绍奇门遁甲的局、九宫、八门、九星、八神，以及它和八字在使用场景上的区别。",
};

export default function QimenIntroPage() {
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
            <h1 className="text-3xl sm:text-4xl font-semibold text-[var(--hero-title)] mb-4">奇门遁甲是什么？它和八字有什么不同</h1>
            <p className="text-sm text-[var(--home-muted)]">阅读时间：约 5 分钟</p>
          </header>

          <div className="text-[var(--home-text)] leading-relaxed space-y-6">
            <p>奇门遁甲，是一种以时间、空间、方位、人物、事件为核心的术数模型。</p>
            <p>如果说八字更像一张“出生结构图”，那奇门遁甲更像一张“当下局势图”。</p>
            <p>八字多看一个人的长期结构；奇门更重视某一件事、某一个时间点、某一个方向上的成败变化。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">一、奇门遁甲的发展</h2>
            <p>奇门遁甲最早和军事、方位、择时关系很深。</p>
            <p>古人打仗，不只是看兵力，还要看天时、地利、人和。什么时候出兵，走哪个方向，何处设伏，何时进退，都需要一套判断局势的方法。</p>
            <p>所以奇门遁甲一开始带有很强的兵家色彩。</p>
            <p>后世常说诸葛亮排兵布阵会用到奇门遁甲，这种说法未必能逐条考证到具体史实，但它反映了一点：在传统印象里，奇门遁甲和军事谋略、阵法布局、择时择方关系非常深。</p>
            <p>后来，奇门逐渐从军事领域扩展到民间，用来判断出行、求财、合作、婚恋、考试、疾病、官司、寻找失物等具体事情。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">二、奇门遁甲在术数里的位置</h2>
            <p>传统术数里常说“三式”：太乙、六壬、奇门。</p>
            <p>太乙偏看大势和国运；六壬偏看人事和占断；奇门偏看时空、方位、行动和局势。</p>
            <p>奇门的特点，是把时间和空间放到同一张盘里看。</p>
            <p>它不是单独看一个符号，而是看整个局：九宫怎么分布，八门落在哪里，九星代表什么气势，八神显示什么状态，天盘地盘如何互动，用神在哪里，旺衰如何，格局是否有力。</p>
            <p>所以奇门不是一句“吉”或“凶”，而是一张局势图。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">三、奇门主要有哪些流派</h2>
            <p>奇门发展到后来，流派很多。常见方向大概有几类。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">1. 转盘奇门</h3>
            <p>转盘奇门是现在较常见的体系。</p>
            <p>它重视九宫、八门、九星、八神、天盘、地盘之间的排布和运转。很多现代奇门排盘软件，基本都以转盘奇门为主。</p>
            <p>它的优点是结构清楚，适合系统学习。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">2. 飞盘奇门</h3>
            <p>飞盘奇门更强调星、门、神、干在九宫中的飞布变化。</p>
            <p>它的盘面逻辑和转盘不同，判断方式也不完全一样。优点是变化细，缺点是学习门槛更高。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">3. 置闰法和拆补法</h3>
            <p>这是奇门排局时的重要分歧。</p>
            <p>置闰法重视节气累积误差的调整；拆补法则按节气前后拆分、补足来起局。</p>
            <p>两者不是谁一定对谁一定错，而是起局规则不同。规则不同，盘就可能不同；盘不同，判断也会变。</p>
            <p>所以使用奇门时，必须先确认起局方式。</p>

            <h3 className="text-xl font-medium mt-6 mb-3 text-[var(--hero-title)]">4. 时家、日家、月家、年家奇门</h3>
            <p>时家奇门最常见，用具体时辰起局，适合看具体事情。</p>
            <p>日家奇门、月家奇门、年家奇门，则时间尺度更大。看短事，多用时家；看较长周期，才会考虑其他体系。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">四、奇门看的是“局”</h2>
            <p>奇门最核心的字，就是“局”。</p>
            <p>一个奇门局里，常见要素包括：</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>九宫，代表空间位置；</li>
              <li>八门，代表事情状态和行动入口；</li>
              <li>九星，代表气势、资源和趋势；</li>
              <li>八神，代表隐含状态和象意；</li>
              <li>天干，代表人物、事情、关系和变化；</li>
              <li>值符、值使，代表一局的核心力量。</li>
            </ul>
            <p>判断奇门，不能孤立看某一个符号。</p>
            <p>看到开门，不一定就一定好；看到死门，也不一定就一定坏；看到凶格，也要看用神旺衰、宫位、事情类型和整体配合。</p>
            <p>奇门真正看的，是局势之间的关系。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">五、八门、九星、八神大概看什么</h2>
            <p>八门可以理解为事情的入口和状态。</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>开门多主开放、机会、工作；</li>
              <li>休门多主休整、缓和、人情；</li>
              <li>生门多主生机、收益、资源；</li>
              <li>伤门多主冲突、损伤、行动；</li>
              <li>杜门多主阻隔、隐藏、技术；</li>
              <li>景门多主表现、文书、传播；</li>
              <li>死门多主停滞、结束、压力；</li>
              <li>惊门多主口舌、惊扰、消息。</li>
            </ul>
            <p>九星更像局里的气势和资源。</p>
            <p>八神则偏象意，用来辅助判断背后的状态，比如贵助、阻力、虚实、变动、暗昧等。</p>
            <p>但这些都不能当成死口诀。奇门最忌讳看到一个符号就下结论。</p>

            <h2 className="text-2xl font-semibold mt-10 mb-4 text-[var(--hero-title)]">六、奇门和八字最大的区别</h2>
            <p>八字看长期结构，奇门看当下局势。</p>
            <p><strong>八字适合问：</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>我是什么性格结构；</li>
              <li>我的优势和短板在哪里；</li>
              <li>哪些阶段容易变化；</li>
              <li>为什么某类关系模式反复出现。</li>
            </ul>
            <p className="mt-4"><strong>奇门适合问：</strong></p>
            <ul className="list-disc pl-5 space-y-1">
              <li>这件事现在能不能推进；</li>
              <li>这个合作有没有阻力；</li>
              <li>这次面试、谈判、出行要注意什么；</li>
              <li>现在适合主动还是保守；</li>
              <li>哪个方向、哪个选择更有利。</li>
            </ul>
          </div>
        </article>

        <div className="mt-16 pt-8 border-t border-[var(--home-border)] flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/chat/qimen" className="home-primary-button w-full sm:w-auto">
            开始奇门排盘
          </Link>
          <Link href="/#entry-methods" className={`home-secondary-button w-full sm:w-auto ${styles.moreToolsButton}`}>
            查看更多工具
          </Link>
        </div>
      </main>
    </div>
  );
}
