import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description:
    'KStoryWorld terms of service — usage rules, content licensing, and liability limitations.',
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="ksw-container" style={{ padding: '80px 32px 120px' }}>
      <article className="review-body" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Terms of Service</h1>
        <p className="meta">Effective Date: April 27, 2026 &middot; Last Updated: April 27, 2026</p>

        <p>
          Welcome to KStoryWorld, operated by JackyAILabs. By accessing or using{' '}
          <strong>kstoryworld.com</strong> (the &ldquo;Site&rdquo;), you agree to be bound by these
          Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, please do not use the Site.
        </p>

        <h2>1. Content &amp; Licensing</h2>
        <p>
          All editorial content on the Site &mdash; including reviews, analyses, guides, and
          original images &mdash; is the intellectual property of JackyAILabs unless otherwise noted.
        </p>
        <ul>
          <li>
            <strong>Personal use:</strong> You may read and share links to our content freely.
          </li>
          <li>
            <strong>Reproduction:</strong> Reproducing, distributing, or republishing our content in
            whole or in part without prior written permission is prohibited.
          </li>
          <li>
            <strong>Quoting:</strong> Brief quotations (1&ndash;2 sentences) with proper attribution
            and a link back to the original article are permitted.
          </li>
        </ul>

        <h2>2. Third-Party Content</h2>
        <p>
          The Site may contain embedded videos (e.g., YouTube), links to external websites, or brief
          quotations from third-party sources. These remain the property of their respective owners.
          We do not claim ownership of any third-party content referenced on the Site.
        </p>

        <h2>3. User Conduct</h2>
        <p>When using the Site, you agree not to:</p>
        <ul>
          <li>Scrape, crawl, or automatically extract content from the Site</li>
          <li>Attempt to gain unauthorized access to any part of the Site</li>
          <li>Use the Site for any unlawful purpose</li>
          <li>Interfere with or disrupt the Site&rsquo;s functionality</li>
        </ul>

        <h2>4. Advertisements</h2>
        <p>
          The Site displays third-party advertisements, including ads served by Google AdSense.
          Clicking on an advertisement may redirect you to a third-party website. We are not
          responsible for the content, products, or services offered by advertisers.
        </p>

        <h2>5. Disclaimer of Warranties</h2>
        <p>
          The Site and its content are provided &ldquo;as is&rdquo; without warranties of any kind,
          either express or implied. We do not guarantee the accuracy, completeness, or timeliness of
          any information on the Site.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by law, JackyAILabs shall not be liable for any indirect,
          incidental, special, or consequential damages arising from your use of the Site.
        </p>

        <h2>7. Dispute Resolution</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the Republic
          of Korea. Any disputes arising from or related to these Terms shall be subject to the
          exclusive jurisdiction of the courts of Seoul, Republic of Korea.
        </p>

        <h2>8. Changes to These Terms</h2>
        <p>
          We reserve the right to update these Terms at any time. Changes will be effective
          immediately upon posting. Your continued use of the Site constitutes acceptance of the
          updated Terms.
        </p>

        <h2>9. Contact Us</h2>
        <p>
          For questions regarding these Terms, please contact us at:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:contact@kstoryworld.com">contact@kstoryworld.com</a>
          </li>
          <li>Operator: JackyAILabs</li>
        </ul>
      </article>
    </div>
  );
}
