import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'KStoryWorld privacy policy — learn how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="ksw-container" style={{ padding: '80px 32px 120px' }}>
      <article className="review-body" style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1>Privacy Policy</h1>
        <p className="meta">Effective Date: April 27, 2026 &middot; Last Updated: April 27, 2026</p>

        <p>
          KStoryWorld (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is operated by
          JackyAILabs. This Privacy Policy explains how we collect, use, and safeguard your
          information when you visit <strong>kstoryworld.com</strong> (the &ldquo;Site&rdquo;).
        </p>

        <h2>1. Information We Collect</h2>

        <h3>Automatically Collected Information</h3>
        <p>
          When you visit the Site, certain information is collected automatically through cookies and
          similar technologies, including:
        </p>
        <ul>
          <li>IP address and approximate geographic location</li>
          <li>Browser type, operating system, and device information</li>
          <li>Pages visited, time spent, and referral source</li>
        </ul>

        <h3>Cookies &amp; Advertising Identifiers</h3>
        <p>
          We use cookies to improve your browsing experience and to serve relevant advertisements.
          Third-party vendors, including Google, use cookies to serve ads based on your prior visits
          to this and other websites.
        </p>
        <ul>
          <li>
            <strong>Google AdSense &amp; Google Analytics:</strong> Google&rsquo;s use of advertising
            cookies enables it and its partners to serve ads based on your visit to this Site and/or
            other sites on the Internet. You may opt out of personalized advertising by visiting{' '}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Ads Settings
            </a>.
          </li>
          <li>
            <strong>Third-party cookies:</strong> Other advertising networks may also use cookies.
            You can opt out of some third-party vendor advertising cookies at{' '}
            <a
              href="https://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
            >
              aboutads.info
            </a>.
          </li>
        </ul>

        <h3>Newsletter Subscription</h3>
        <p>
          If you subscribe to our newsletter, we collect your email address. This information is used
          solely to send you editorial updates and is never sold to third parties.
        </p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li>To operate and improve the Site</li>
          <li>To analyze traffic and usage patterns</li>
          <li>To serve and measure advertisements</li>
          <li>To send newsletters (only with your consent)</li>
        </ul>

        <h2>3. Third-Party Services</h2>
        <p>
          We may share anonymized or aggregated data with third-party service providers, including
          Google (Analytics, AdSense), for analytics and advertising purposes. These services have
          their own privacy policies governing the use of your information.
        </p>

        <h2>4. Data Retention</h2>
        <p>
          Automatically collected data (analytics, logs) is retained for up to 26 months. Newsletter
          email addresses are retained until you unsubscribe.
        </p>

        <h2>5. Your Rights</h2>
        <p>You may:</p>
        <ul>
          <li>Disable cookies through your browser settings</li>
          <li>Opt out of personalized ads via Google Ads Settings</li>
          <li>Unsubscribe from our newsletter at any time using the link in any email</li>
          <li>Request deletion of your personal data by contacting us</li>
        </ul>

        <h2>6. Children&rsquo;s Privacy</h2>
        <p>
          The Site is not intended for children under 13. We do not knowingly collect personal
          information from children.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Changes will be posted on this page
          with an updated &ldquo;Last Updated&rdquo; date.
        </p>

        <h2>8. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <ul>
          <li>
            Email: <a href="mailto:privacy@kstoryworld.com">privacy@kstoryworld.com</a>
          </li>
          <li>Operator: JackyAILabs</li>
        </ul>
      </article>
    </div>
  );
}
