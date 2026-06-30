import { useEffect } from 'react';

const AD_CLIENT = 'ca-pub-9965145907448266';
const DEFAULT_AD_SLOT = '6464905370';

export default function BlogAdSlot({ className = '', slot = DEFAULT_AD_SLOT, label = 'Sponsored' }) {
  useEffect(() => {
    try {
      if (window.adsbygoogle) {
        window.adsbygoogle.push({});
      }
    } catch {
      // Ad blockers or unavailable AdSense should leave the slot shell intact.
    }
  }, []);

  return (
    <aside className={`blog-ad-slot ${className}`.trim()} aria-label={label}>
      <div className="blog-ad-slot-header">
        <span>{label}</span>
      </div>
      <div className="blog-ad-slot-body">
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={AD_CLIENT}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </aside>
  );
}
