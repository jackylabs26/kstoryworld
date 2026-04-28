'use client';

import { useEffect } from 'react';

export function ReviewRedirect({ target }: { target: string }) {
  useEffect(() => {
    window.location.replace(target);
  }, [target]);

  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${target}`} />
      <div style={{ padding: 64, textAlign: 'center', fontFamily: 'system-ui' }}>
        <p>Redirecting to <a href={target}>{target}</a>…</p>
      </div>
    </>
  );
}
