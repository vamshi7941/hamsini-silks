import { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { useStore } from '@/context/StoreContext';
import SectionHeader from './SectionHeader';

// Extend window interface for YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

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
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const playersRef = useRef<{ [key: number]: any }>({});
  const iframeRefs = useRef<{ [key: number]: HTMLIFrameElement | null }>({});
  const videoTimersRef = useRef<{ [key: number]: NodeJS.Timeout | null }>({});

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

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);

      (window as any).onYouTubeIframeAPIReady = () => {
        // API ready
      };
    }
  }, []);

  const advanceToNextVideo = useCallback(() => {
    setCurrentVideoIndex((prevIndex) => {
      if (prevIndex < videos.length - 1) {
        return prevIndex + 1;
      }
      return 0;
    });
  }, [videos.length]);

  // Handle video state changes
  useEffect(() => {
    if (!window.YT || videos.length === 0) return;

    const currentIframe = iframeRefs.current[currentVideoIndex];
    if (!currentIframe) return;

    const isYouTube = currentIframe.src.includes('youtube.com');

    if (isYouTube) {
      // Clear any existing timer
      if (videoTimersRef.current[currentVideoIndex]) {
        clearTimeout(videoTimersRef.current[currentVideoIndex]!);
      }

      // Create or get player
      const createPlayer = () => {
        try {
          if (!playersRef.current[currentVideoIndex] && window.YT?.Player) {
            playersRef.current[currentVideoIndex] = new window.YT.Player(
              currentIframe,
              {
                events: {
                  onStateChange: (event: any) => {
                    // 0 = ended, 1 = playing, 2 = paused, 3 = buffering, 5 = video cued
                    if (event.data === window.YT.PlayerState.ENDED) {
                      advanceToNextVideo();
                    }
                  },
                },
              },
            );
          }

          const player = playersRef.current[currentVideoIndex];
          if (player && player.playVideo) {
            setTimeout(() => {
              player.playVideo();
            }, 100);
          }
        } catch (error) {
          console.error('Error creating YouTube player:', error);
        }
      };

      if (window.YT?.Player) {
        createPlayer();
      } else {
        // Wait for YT API to be ready
        const timer = setTimeout(createPlayer, 500);
        videoTimersRef.current[currentVideoIndex] = timer;
      }
    }

    return () => {
      if (videoTimersRef.current[currentVideoIndex]) {
        clearTimeout(videoTimersRef.current[currentVideoIndex]!);
      }
    };
  }, [currentVideoIndex, videos, advanceToNextVideo]);

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
              // Only autoplay the current video, others should not autoplay
              const shouldAutoplay = index === currentVideoIndex;
              const src = `${video.embedUrl}${video.embedUrl.includes('?') ? '&' : '?'}${shouldAutoplay ? 'autoplay=1' : 'autoplay=0'}&mute=1&playsinline=1`;

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
                      ref={(el) => {
                        if (el) {
                          iframeRefs.current[index] = el;
                        }
                      }}
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
