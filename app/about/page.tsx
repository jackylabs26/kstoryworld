import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About KStoryWorld',
  description:
    'About KStoryWorld — an editorial platform curating K-Drama, K-Pop, and Korean culture stories in Korean and English.',
};

export default function AboutPage() {
  return (
    <div className="ksw-container" style={{ padding: '80px 32px 120px' }}>
      <article className="review-body" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>About KStoryWorld</h1>
        <p className="meta">EDITOR-CURATED &middot; BILINGUAL &middot; SEOUL</p>

        <p>
          <strong>KStoryWorld</strong> is an editorial platform dedicated to bridging Korean culture
          with a global audience. We publish in-depth reviews, character analyses, language guides,
          and cultural commentary on K-Drama, K-Pop, K-Food, K-Beauty, and K-Literature &mdash; all
          in Korean and English.
        </p>

        <h2>Our Mission</h2>
        <p>
          We believe that the best way to appreciate Korean stories is to understand the language,
          history, and emotions behind them. Every article on KStoryWorld is crafted to help readers
          go beyond subtitles and experience Korean culture on a deeper level.
        </p>

        <h2>What We Do</h2>
        <ul>
          <li>
            <strong>K-Drama Reviews &amp; Guides:</strong> Detailed, episode-by-episode reviews with
            cultural context and language insights.
          </li>
          <li>
            <strong>Language Learning:</strong> Korean and English expressions found in real K-Drama
            dialogue, explained with grammar and cultural notes.
          </li>
          <li>
            <strong>Cultural Commentary:</strong> Explorations of K-Food, K-Beauty, K-Literature,
            and the creative forces behind Korean pop culture.
          </li>
        </ul>

        <h2>Who We Are</h2>
        <p>
          KStoryWorld is operated by <strong>JackyAILabs</strong>, a Seoul-based company focused on
          AI-powered content and technology solutions. Our editorial team curates, researches, and
          writes every piece to ensure accuracy and depth.
        </p>

        <h2>Editorial Standards</h2>
        <p>
          All content on this Site is original editorial work. When we reference external sources, we
          provide proper attribution. Embedded media (such as YouTube videos) links directly to
          official channels. We are committed to producing original, trustworthy content for our
          readers.
        </p>

        <h2>Contact</h2>
        <p>
          We&rsquo;d love to hear from you &mdash; whether it&rsquo;s feedback, partnership
          inquiries, or just a recommendation for the next drama to review.
        </p>
        <ul>
          <li>
            General inquiries:{' '}
            <a href="mailto:hello@kstoryworld.com">hello@kstoryworld.com</a>
          </li>
          <li>
            Partnerships:{' '}
            <a href="mailto:partner@kstoryworld.com">partner@kstoryworld.com</a>
          </li>
          <li>
            Privacy-related:{' '}
            <a href="mailto:privacy@kstoryworld.com">privacy@kstoryworld.com</a>
          </li>
        </ul>

        <p style={{ marginTop: 48, fontSize: 14, color: 'rgba(0,0,0,0.45)' }}>
          &copy; 2026 KStoryWorld &middot; Operated by JackyAILabs &middot; Seoul, Republic of Korea
        </p>
      </article>
    </div>
  );
}
