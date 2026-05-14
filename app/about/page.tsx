import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'About KStoryWorld',
  description:
    'KStoryWorld is an editorial platform that brings the depth and richness of Korean culture to a global audience — bilingual, editor-curated, Seoul-based. Operated by JackyAILabs.',
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About KStoryWorld',
    description:
      'Editor-curated Korean culture in Korean and English. Operated by JackyAILabs in Seoul.',
    type: 'website',
    locale: 'en_US',
    url: '/about',
    siteName: 'KStoryWorld',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About KStoryWorld',
    description:
      'Editor-curated Korean culture in Korean and English. Operated by JackyAILabs in Seoul.',
  },
};

export default function AboutPage() {
  return (
    <div className="ksw-container" style={{ padding: 'clamp(40px, 8vw, 80px) var(--gutter) clamp(60px, 10vw, 120px)' }}>
      <article className="review-body" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>About KStoryWorld</h1>
        <p className="meta">EDITOR-CURATED &middot; BILINGUAL &middot; SEOUL</p>

        <p>
          <strong>KStoryWorld</strong> is an editorial platform that brings the depth
          and richness of Korean culture to a global audience. We publish in-depth
          reviews, cultural commentary, language guides, and curated recommendations
          across six content verticals &mdash; all in Korean and English, simultaneously.
        </p>

        <p>
          Our mission: <em>To tell every Korean story with the texture it deserves.</em>
        </p>

        <p>
          We don&rsquo;t do clickbait. We don&rsquo;t write academic papers. We write
          like curators who love what they cover &mdash; observational, context-rich, and
          always with a human editor&rsquo;s fingerprint.
        </p>

        <h2>Who We Are</h2>
        <h3>The Team Behind KStoryWorld</h3>
        <p>
          KStoryWorld is operated by <strong>JackyAILabs</strong>, a Seoul-based company
          specializing in AI-powered content technology and editorial solutions. We
          combine deep domain expertise in Korean culture with modern publishing
          infrastructure to deliver content that is accurate, timely, and genuinely
          useful.
        </p>

        <h3>Jacky (김성수) &mdash; Founder &amp; Editor-in-Chief</h3>
        <Image
          src="/images/team/jacky.jpg"
          alt="Jacky, Founder and Editor-in-Chief of KStoryWorld"
          width={200}
          height={200}
          style={{ borderRadius: '50%', margin: '12px 0 24px' }}
        />

        <blockquote>
          <em>&ldquo;제주 막걸리집 카운터 톤으로 한국 문화를 외국인에게 풀어주는 형&rdquo;</em>
          <br />
          <em>
            (&ldquo;The guy who explains Korean culture to foreigners in the tone of a
            Jeju makgeolli bar counter.&rdquo;)
          </em>
        </blockquote>

        <p>
          <strong>Background.</strong> Born and raised in Korea, Jacky spent 25 years
          building and operating IT systems for global hotels and casinos &mdash; the
          kind of environments where VIP guests from every continent arrive nightly with
          their own questions about Korean dramas, K-Pop, and Korean food. He moved to
          Seoul in his mid-40s, then founded JackyAILabs to build AI-powered content
          infrastructure, and launched KStoryWorld as its flagship editorial property.
          He lives between Jeju and Seoul.
        </p>

        <p>
          <strong>Expertise.</strong> Twenty-five years on the operator&rsquo;s side of
          hospitality IT taught him to read systems, but more importantly, to read the
          gap between what foreign guests actually wanted to know about Korea and what
          Korean writers were publishing. That gap is the editorial brief he writes from
          every day.
        </p>

        <p>
          <strong>Languages.</strong> Korean (native) &middot; English (business proficient).
        </p>

        <p>
          <strong>Focus areas.</strong> K-Drama &middot; K-Food &middot; K-Travel (Jeju-based).
        </p>

        <p>
          <strong>Picks (the personal stuff).</strong> Favorite K-Drama:{' '}
          <strong>〈Signal (시그널)〉</strong> &mdash; for its taut, suspense-loaded
          storytelling. Drink of choice: <strong>Jeju makgeolli</strong>. Favorite Jeju
          walk: <strong>the path up to Gwaneumsa Temple (관음사)</strong>.
        </p>

        <p>
          <strong>On the record.</strong>
          <br />
          <a
            href="https://jacky-kdrama.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Jacky&rsquo;s K-Drama Blog
          </a>
          {' · '}
          <a
            href="https://www.linkedin.com/in/성수-김-5990b8348/?locale=en"
            target="_blank"
            rel="noopener noreferrer"
          >
            LinkedIn
          </a>
        </p>

        <blockquote>
          <em>
            &ldquo;After 25 years serving global guests in hotel and casino IT, I noticed
            the same gap every day &mdash; the Korean details foreign guests really
            wanted to know weren&rsquo;t showing up in Korean writers&rsquo; articles, and
            the contexts Koreans take for granted weren&rsquo;t explained well by foreign
            media. KStoryWorld is our attempt to bridge those two gaps. We&rsquo;re not
            critics &mdash; we&rsquo;re operators who live in Korea but understand the
            outside view too.&rdquo;
          </em>
          <br />
          &mdash; Jacky
        </blockquote>

        <h3>Sabina &mdash; Cultural Bridge Editor</h3>
        <Image
          src="/images/team/sabina.jpg"
          alt="Sabina, Cultural Bridge Editor of KStoryWorld"
          width={200}
          height={200}
          style={{ borderRadius: '50%', margin: '12px 0 24px' }}
        />

        <blockquote>
          <em>&ldquo;23년 비행에서 배운 건 &mdash; 언어는 단어가 아니라 연결&rdquo;</em>
          <br />
          <em>
            (&ldquo;Twenty-three years in the cabin taught me one thing &mdash; language
            isn&rsquo;t about words, it&rsquo;s about connection.&rdquo;)
          </em>
        </blockquote>

        <p>
          <strong>Background.</strong> Sabina studied music at Hanyang University before
          joining a foreign airline as cabin crew, where she spent 23 years working
          long-haul routes between Seoul, Hong Kong, and Dubai &mdash; most of them in
          business and first class, the seats where international travelers tend to ask
          the most curious questions about Korean culture. After returning home to Seoul,
          she opened <strong>My Jazz Garden</strong>, a private English-language jazz
          club where Korean and international guests gather weekly to talk, listen, and
          practice language through music. The same dual lens &mdash; Korean home,
          foreign perspective &mdash; now shows up daily in the multicultural household
          she lives in.
        </p>

        <p>
          <strong>Expertise.</strong> Two decades in galleys and a private jazz club in
          Seoul gave her a particular ear: she hears where foreign readers stumble in
          Korean content before they say it. Her editorial instinct is to translate the{' '}
          <em>feeling</em> across languages, not just the words.
        </p>

        <p>
          <strong>Languages.</strong> Korean (native) &middot; English (fluent) &middot;
          Cantonese (광동어).
        </p>

        <p>
          <strong>Focus areas.</strong> K-Drama &middot; K-Travel &middot; K-Literature
          &middot; K-Food.
        </p>

        <p>
          <strong>Picks (the personal stuff).</strong> Favorite K-Drama:{' '}
          <strong>〈Descendants of the Sun (태양의 후예)〉</strong> &mdash; first watched on
          Hong Kong layovers, when its restless emotional rhythm matched her own.
          Favorite Korean city: <strong>Mokpo (목포)</strong>. Comfort dish:{' '}
          <strong>bibimbap</strong>. Reading habit: <strong>philosophy</strong>.
        </p>

        <p>
          <strong>On the record.</strong>
          <br />
          <a
            href="https://sabina-vibe-k-life.blogspot.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Sabina Vibe K-Life Blog
          </a>
          {' · '}
          <a
            href="https://www.instagram.com/myjazzgarden/"
            target="_blank"
            rel="noopener noreferrer"
          >
            My Jazz Garden (Instagram)
          </a>
          {' · '}
          <a href="mailto:cxsabina@gmail.com">cxsabina@gmail.com</a>
        </p>

        <blockquote>
          <em>
            &ldquo;Across 23 years of flying, the questions foreign passengers asked
            about Korean content were almost always the same. &lsquo;How does this scene
            sound to a Korean?&rsquo; &lsquo;What does this word really mean?&rsquo;
            Those galley conversations should have been curation notes from the start.
            After coming home to Seoul and opening an English jazz club where I meet
            learners every week, I became certain &mdash; language isn&rsquo;t about
            words. It&rsquo;s about connection. KStoryWorld is where those galley
            conversations and jazz-club conversations finally land on the page.&rdquo;
          </em>
          <br />
          &mdash; Sabina
        </blockquote>

        <h3>Our Editorial Team</h3>
        <p>
          Beyond our two named editors, KStoryWorld publishes through a curated roster
          of narrative personas &mdash; each with a distinct voice, expertise, and
          cultural lens. These personas aren&rsquo;t fictional characters. They represent
          our editorial team&rsquo;s different perspectives and writing styles, ensuring
          that a K-Drama deep-dive reads differently from a K-Beauty trend report,
          because the subjects demand different approaches. Every article carries a
          clearly identified narrator persona, and every persona&rsquo;s tone, focus
          categories, and forbidden topics are defined and reviewed by the editor-in-chief.
        </p>

        <h2>Our Content</h2>
        <h3>Six Verticals, One Standard</h3>
        <p>
          KStoryWorld covers Korean culture through six dedicated content categories.
          Each vertical has its own editorial rhythm, tone, and depth &mdash; but all
          share the same commitment to accuracy, original research, and bilingual
          accessibility.
        </p>

        <h3>K-Drama (K-드라마) &mdash; Our Anchor Vertical</h3>
        <p>
          In-depth drama reviews with episode-by-episode analysis, character studies,
          cultural context that explains <em>why</em> a scene resonates, and Korean
          language expressions drawn from real dialogue. We don&rsquo;t just rate dramas
          &mdash; we help you understand the cultural soil they grow from.
        </p>
        <p>
          <strong>Tone:</strong> Analytical yet warm. Like discussing a drama with a
          knowledgeable friend over coffee.
        </p>

        <h3>K-Pop (K-팝)</h3>
        <p>
          Artist spotlights, album reviews, industry analysis, and the cultural phenomena
          behind the music. We cover both mainstream acts and indie artists pushing
          boundaries, always contextualizing K-Pop within Korea&rsquo;s broader cultural
          landscape.
        </p>
        <p>
          <strong>Tone:</strong> Energetic, informed, celebratory without being uncritical.
        </p>

        <h3>K-Beauty (K-뷰티)</h3>
        <p>
          Trend analysis, ingredient deep-dives, routine guides, and honest product
          commentary. We explain <em>why</em> Korean beauty culture innovates the way it
          does &mdash; the climate, the philosophy, the science &mdash; not just{' '}
          <em>what</em> to buy.
        </p>
        <p>
          <strong>Tone:</strong> Expert-adjacent guide. Approachable science, never
          prescriptive health claims.
        </p>

        <h3>K-Food (K-푸드)</h3>
        <p>
          Recipes, restaurant culture, food history, and the stories behind Korea&rsquo;s
          culinary traditions. From street food to royal court cuisine, we explore Korean
          food as a living culture &mdash; not a trend.
        </p>
        <p>
          <strong>Tone:</strong> Warm, sensory, rooted in lived experience. We cook what
          we write about.
        </p>

        <h3>K-Travel (K-트래블)</h3>
        <p>
          Destination guides, cultural etiquette, seasonal recommendations, and
          itineraries designed by people who live in Korea. Practical information layered
          with cultural context that guidebooks miss.
        </p>
        <p>
          <strong>Tone:</strong> Practical insider. Local knowledge shared generously,
          not gatekept.
        </p>

        <h3>K-Literature (K-문학)</h3>
        <p>
          Book reviews, author profiles, translation analysis, and literary criticism
          that bridges Korean and global literary traditions. We cover contemporary
          fiction, poetry, manhwa, and the growing international recognition of Korean
          literature.
        </p>
        <p>
          <strong>Tone:</strong> Thoughtful, literary, accessible. Critical without being
          exclusionary.
        </p>

        <h2>Editorial &amp; Publishing Policy</h2>
        <h3>How We Create Content</h3>
        <p>
          Every piece published on KStoryWorld follows a rigorous editorial pipeline:
        </p>
        <ol>
          <li>
            <strong>Research &amp; Sourcing.</strong> Topics are identified through
            cultural relevance, reader interest, and editorial judgment. All factual
            claims require at least two independent sources for cross-verification.
          </li>
          <li>
            <strong>AI-Assisted Drafting.</strong> We use AI tools as research assistants
            and first-draft generators &mdash; never as the final voice. AI helps us work
            faster; it does not replace human judgment, cultural knowledge, or editorial
            taste.
          </li>
          <li>
            <strong>Human Editorial Review.</strong> Every article passes through human
            editors &mdash; Jacky, Sabina, or both &mdash; who verify facts, refine
            language, add personal insight from lived experience, and ensure the piece
            meets our quality standards. Our editors add what AI cannot: actually
            watching the dramas, eating the food, walking the streets, and living in
            Korea.
          </li>
          <li>
            <strong>Quality Gate.</strong> Before publication, content passes a
            multi-point checklist covering factual accuracy, source attribution, language
            quality (both Korean and English), appropriate imagery, and brand voice
            alignment.
          </li>
          <li>
            <strong>Bilingual Publication.</strong> All content is published
            simultaneously in Korean and English. This is not machine translation &mdash;
            each language version is crafted to read naturally to native speakers.
          </li>
        </ol>

        <h3>What We Don&rsquo;t Do</h3>
        <ul>
          <li>
            We never publish content that is purely AI-generated without human editorial
            oversight.
          </li>
          <li>We never make unsubstantiated health, medical, or efficacy claims.</li>
          <li>We never use clickbait headlines that misrepresent content.</li>
          <li>We never publish without proper attribution for external sources.</li>
          <li>We never embed media from unofficial or pirated sources.</li>
        </ul>

        <h3>Source Attribution</h3>
        <p>
          When we reference external information, we cite our sources. Embedded media
          (such as YouTube videos) always links to official channels. Images are sourced
          exclusively from licensed or Creative Commons-compliant providers (Unsplash,
          Pexels, Pixabay, Wikimedia Commons).
        </p>

        <h2>Corrections &amp; Updates Policy</h2>
        <p>We are committed to accuracy. When errors are identified:</p>
        <ul>
          <li>
            <strong>Minor factual corrections</strong> (dates, names, figures) are
            updated immediately with an editor&rsquo;s note at the bottom of the article
            indicating the change date and nature of correction.
          </li>
          <li>
            <strong>Significant errors</strong> that materially change the meaning of an
            article are corrected with a prominent notice at the top of the article.
          </li>
          <li>
            <strong>Outdated information</strong> (a restaurant that has closed, a drama
            that has been removed from streaming) is updated and marked accordingly.
          </li>
        </ul>
        <p>
          Readers can report errors or request corrections by emailing{' '}
          <a href="mailto:hello@kstoryworld.com">hello@kstoryworld.com</a>. We respond
          within five business days.
        </p>
        <p>
          Our complete editorial pipeline (5-stage research-to-publish workflow with
          bilingual review) is documented in the{' '}
          <strong>Editorial &amp; Publishing Policy</strong> section above. Dedicated
          standards pages will be added as the publication grows.
        </p>

        <h2>Contact Us</h2>
        <p>
          We welcome feedback, corrections, partnership inquiries, and story suggestions.
        </p>
        <ul>
          <li>
            General inquiries &amp; feedback:{' '}
            <a href="mailto:hello@kstoryworld.com">hello@kstoryworld.com</a>
          </li>
          <li>
            Partnership &amp; collaboration:{' '}
            <a href="mailto:partner@kstoryworld.com">partner@kstoryworld.com</a>
          </li>
          <li>
            Corrections &amp; factual errors:{' '}
            <a href="mailto:hello@kstoryworld.com">hello@kstoryworld.com</a>
          </li>
          <li>
            Privacy-related requests:{' '}
            <a href="mailto:privacy@kstoryworld.com">privacy@kstoryworld.com</a>
          </li>
          <li>
            Direct to Sabina (Cultural Bridge Editor):{' '}
            <a href="mailto:cxsabina@gmail.com">cxsabina@gmail.com</a>
          </li>
        </ul>
        <p>
          <strong>Location:</strong> Seoul, Republic of Korea
          <br />
          <strong>Operating Entity:</strong> JackyAILabs
        </p>

        <h2>Trust &amp; Transparency</h2>
        <p>
          KStoryWorld is independently operated. We are not affiliated with any
          entertainment company, talent agency, or brand featured in our content. When
          we feature products or services, it is based on editorial judgment &mdash; not
          paid placement. Any sponsored or affiliated content will be clearly and
          prominently disclosed.
        </p>
        <p>We publish under our real identities because we stand behind our work.</p>

        <p style={{ marginTop: 48, fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>
          &copy; 2026 KStoryWorld &middot; Operated by JackyAILabs &middot; Seoul,
          Republic of Korea
        </p>
      </article>
    </div>
  );
}
