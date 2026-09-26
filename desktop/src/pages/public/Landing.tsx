import { Hero } from '@/components/public/Hero';
import { FeatureGrid } from '@/components/public/FeatureGrid';
import { DownloadsSection } from '@/components/public/DownloadsSection';
import { PublicChatWidget } from '@/components/public/PublicChatWidget';

export default function Landing() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <DownloadsSection />
      <PublicChatWidget />
    </>
  );
}