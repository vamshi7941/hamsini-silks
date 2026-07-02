import { useMemo } from 'react';
import { useStore } from '@/context/StoreContext';
import SectionHeader from './SectionHeader';

const getEmbedUrl = (url: string) => {
  const trimmed = url.trim();
  if (!trimmed) return '';

  const youtubeMatch = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?rel=0&showinfo=0&enablejsapi=1&playsinline=1`;
  }

  const instagramMatch = trimmed.match(
    /instagram\.com\/(?:p|reel)\/([^\/\?]+)/,
  );
  if (instagramMatch) {
    return `https://www.instagram.com/p/${instagramMatch[1]}/embed`;
  }

  return trimmed;
};

const parseAspectRatio = (aspectRatio?: string) => {
  if (!aspectRatio) return 56.25;
  const parts = aspectRatio.split('/').map((value) => Number(value.trim()));
  if (parts.length === 2 && parts[0] > 0 && parts[1] > 0) {
    return (parts[1] / parts[0]) * 100;
  }
  return 56.25;
};

export default function Testimonials() {
  const { siteContent } = useStore();
  const videos = useMemo(
    () =>
      (siteContent.videos || [])
        .map((video) => ({
          ...video,
          embedUrl: getEmbedUrl(video.url),
          aspectRatio: parseAspectRatio(video.aspectRatio),
        }))
        .filter((video) => video.embedUrl),
    [siteContent.videos],
  );

  if (!videos.length) {
    return null;
  }

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-maroon-50/40 to-[#fdf8f1]">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow="FROM OUR PATRONS"
          title="Video Stories"
          subtitle="Real moments from our community, presented with flexible aspect ratios."
        />

        <div
          className="mt-8 overflow-x-auto pb-6 scroll-smooth snap-x snap-mandatory"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <div className="flex flex-nowrap gap-6 sm:justify-center px-2 sm:px-4 items-stretch">
            {videos.map((video, index) => {
              const src = `${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}autoplay=1&mute=1&playsinline=1`;

              return (
                <div
                  key={`${video.url}-${index}`}
                  className="snap-center flex-shrink-0 rounded-3xl border border-gold-100 bg-white shadow-sm transition-all duration-500 w-[min(50vw,560px)] sm:w-[min(16vw,560px)] opacity-100"
                >
                  <div
                    className="relative w-full overflow-hidden rounded-3xl"
                    style={{ paddingBottom: `${video.aspectRatio}%` }}
                  >
                    <iframe
                      className="absolute inset-0 h-full w-full"
                      src={src}
                      title={`Video testimonial ${index + 1}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
