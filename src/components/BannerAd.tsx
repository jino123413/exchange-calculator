import { useEffect, useRef, useState } from 'react';
import { TossAds } from '@apps-in-toss/web-framework';

interface BannerAdProps {
  adGroupId: string;
  theme?: 'auto' | 'light' | 'dark';
  tone?: 'blackAndWhite' | 'grey';
  variant?: 'expanded' | 'card';
}

export default function BannerAd({
  adGroupId,
  theme = 'auto',
  tone = 'blackAndWhite',
  variant = 'expanded',
}: BannerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasAd, setHasAd] = useState(true);

  useEffect(() => {
    try {
      if (!TossAds?.initialize?.isSupported?.()) return;

      TossAds.initialize({
        callbacks: {
          onInitialized: () => setIsInitialized(true),
          onInitializationFailed: () => setHasAd(false),
        },
      });
    } catch {
      setHasAd(false);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

    try {
      if (!TossAds?.attachBanner?.isSupported?.()) return;

      const attached = TossAds.attachBanner(adGroupId, containerRef.current, {
        theme,
        tone,
        variant,
        callbacks: {
          onAdRendered: () => setHasAd(true),
          onNoFill: () => setHasAd(false),
          onAdFailedToRender: () => setHasAd(false),
        },
      });

      return () => {
        attached?.destroy();
      };
    } catch {
      setHasAd(false);
    }
  }, [isInitialized, adGroupId, theme, tone, variant]);

  if (!hasAd) return null;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: 96 }}
    />
  );
}
