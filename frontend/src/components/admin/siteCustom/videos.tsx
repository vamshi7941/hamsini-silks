import { useEffect, useState } from 'react';
import { AdminApi, VideoItem } from '@/api/admin';
import { useStore } from '@/context/StoreContext';

const emptyVideo = (): VideoItem => ({
  url: '',
  aspectRatio: '16/9',
});

export default function Videos() {
  const { siteContent, setSiteContent, showToast } = useStore();
  const { fetchSiteContent, saveVideoContent } = AdminApi();
  const [videosForm, setVideosForm] = useState<VideoItem[]>([]);

  useEffect(() => {
    if (siteContent?.videos?.length) {
      setVideosForm(
        siteContent.videos.map((video) => ({
          url: video.url || '',
          aspectRatio: video.aspectRatio || '16/9',
        })),
      );
      return;
    }
    setVideosForm([emptyVideo()]);
  }, [siteContent.videos]);

  const handleInputChange = (
    index: number,
    field: keyof VideoItem,
    value: string,
  ) => {
    setVideosForm((prev) =>
      prev.map((item, idx) =>
        idx === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const handleAddVideo = () => {
    setVideosForm((prev) => [...prev, emptyVideo()]);
  };

  const handleRemoveVideo = (index: number) => {
    setVideosForm((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const sanitized = videosForm
      .filter((video) => video.url?.trim())
      .map((video) => ({
        url: video.url.trim(),
        aspectRatio: video.aspectRatio?.trim() || '16/9',
      }));

    if (!sanitized.length) {
      showToast('Add at least one video URL before saving.', 'info');
      return;
    }

    const saved = await saveVideoContent(sanitized);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          videos: refreshed.videos || [],
        }));
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h4 className="font-semibold text-maroon-900">Video Testimonials</h4>
          <p className="text-sm text-maroon-700">
            Add YouTube or Instagram embed links and optional titles. The
            customer page will render each video.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddVideo}
          className="inline-flex items-center justify-center rounded-full border border-gold-200 bg-gold-50 px-4 py-2 text-sm font-semibold text-maroon-900 transition hover:bg-gold-100"
        >
          Add Video
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-4 mt-5">
        {videosForm.map((video, index) => (
          <div
            key={`${video.url}-${index}`}
            className="rounded-3xl border border-gold-100 bg-gold-50/60 p-4"
          >
            <div className="flex items-center justify-between gap-3 mb-4">
              <h5 className="text-sm font-semibold text-maroon-900">
                Video {index + 1}
              </h5>
              <button
                type="button"
                onClick={() => handleRemoveVideo(index)}
                className="text-xs font-semibold uppercase tracking-wider text-maroon-700 transition hover:text-maroon-900"
              >
                Remove
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:gap-6">
              <div className="w-full">
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                  Video URL
                </label>
                <input
                  value={video.url}
                  onChange={(e) =>
                    handleInputChange(index, 'url', e.target.value)
                  }
                  placeholder="https://youtu.be/... or https://www.instagram.com/reel/..."
                  className="w-full rounded-xl border border-gold-200 px-3 py-2"
                />
              </div>
              <div className="w-full">
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
                  Aspect Ratio
                </label>
                <select
                  value={video.aspectRatio || '16/9'}
                  onChange={(e) =>
                    handleInputChange(index, 'aspectRatio', e.target.value)
                  }
                  className="w-full rounded-xl border border-gold-200 px-3 py-2 bg-white"
                >
                  <option value="16/9">16:9 (Video)</option>
                  <option value="9/16">9:16 (Reel)</option>
                </select>
              </div>
            </div>
          </div>
        ))}

        <div className="pt-4 border-t border-gold-100">
          <button
            type="submit"
            className="inline-flex items-center justify-center rounded-full bg-maroon-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-maroon-800"
          >
            Save Videos
          </button>
        </div>
      </form>
    </div>
  );
}
