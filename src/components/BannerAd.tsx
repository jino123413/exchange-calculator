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

  // SDK 초기화 (1회)
  useEffect(() => {
    if (TossAds.initialize.isSupported()) {
      TossAds.initialize({
        callbacks: {
          onInitialized: () => setIsInitialized(true),
          onInitializationFailed: () => {},
        },
      });
    }
  }, []);

  // 배너 부착 + 정리
  useEffect(() => {
    if (!isInitialized || !containerRef.current) return;

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
  }, [isInitialized]);

  if (!hasAd) return null;

  return (
    <div
      ref={containerRef}
      style={{ width: '100%', height: '96px' }}
    />
  );
}
