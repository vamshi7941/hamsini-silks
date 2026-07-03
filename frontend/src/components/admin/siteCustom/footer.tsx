import { AdminApi, FooterContent, FooterLink } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { useEffect, useState } from 'react';

const emptyLink = (): FooterLink => ({ label: '', href: '' });

export default function Footer() {
  const { siteContent, setSiteContent, showToast } = useStore();
  const { fetchSiteContent, saveFooterContent } = AdminApi();

  const [helpLinks, setHelpLinks] = useState<FooterLink[]>([
    emptyLink(),
    emptyLink(),
  ]);
  const [aboutLinks, setAboutLinks] = useState<FooterLink[]>([
    emptyLink(),
    emptyLink(),
  ]);

  useEffect(() => {
    setHelpLinks(
      Array.isArray(siteContent?.footer?.help) &&
        siteContent.footer.help.length > 0
        ? siteContent.footer.help
        : [
            { label: 'Track Order', href: '/login' },
            { label: 'Shipping & Delivery', href: '/shop' },
          ],
    );
    setAboutLinks(
      Array.isArray(siteContent?.footer?.about) &&
        siteContent.footer.about.length > 0
        ? siteContent.footer.about
        : [
            { label: 'Our Heritage', href: '/shop' },
            { label: 'Sustainability', href: '/shop' },
          ],
    );
  }, [siteContent?.footer]);

  const handleLinkChange = (
    section: 'help' | 'about',
    index: number,
    field: keyof FooterLink,
    value: string,
  ) => {
    const source = section === 'help' ? helpLinks : aboutLinks;
    const updated = [...source];
    updated[index] = { ...updated[index], [field]: value };
    section === 'help' ? setHelpLinks(updated) : setAboutLinks(updated);
  };

  const handleAddLink = (section: 'help' | 'about') => {
    if ((section === 'help' ? helpLinks : aboutLinks).length >= 8) {
      showToast('You can only add up to 8 links per footer section.', 'info');
      return;
    }
    section === 'help'
      ? setHelpLinks((prev) => [...prev, emptyLink()])
      : setAboutLinks((prev) => [...prev, emptyLink()]);
  };

  const handleRemoveLink = (section: 'help' | 'about', index: number) => {
    const source = section === 'help' ? helpLinks : aboutLinks;
    const updated = source.filter((_, idx) => idx !== index);
    section === 'help' ? setHelpLinks(updated) : setAboutLinks(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitized: FooterContent = {
      help: helpLinks
        .map((item) => ({
          label: item.label.trim(),
          href: item.href.trim(),
        }))
        .filter((item) => item.label),
      about: aboutLinks
        .map((item) => ({
          label: item.label.trim(),
          href: item.href.trim(),
        }))
        .filter((item) => item.label),
    };

    const saved = await saveFooterContent(sanitized);
    if (saved?.success) {
      const refreshed = await fetchSiteContent();
      if (refreshed?.success) {
        setSiteContent((prev) => ({
          ...prev,
          footer: refreshed.footer || prev.footer,
        }));
        showToast('Footer links updated successfully', 'success');
      }
    }
  };

  const renderLinkRows = (section: 'help' | 'about') => {
    const links = section === 'help' ? helpLinks : aboutLinks;
    return links.map((link, index) => (
      <div
        key={`${section}-${index}`}
        className="grid grid-cols-[1fr_1fr_auto] gap-3 items-end"
      >
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            Label
          </label>
          <input
            value={link.label}
            onChange={(e) =>
              handleLinkChange(section, index, 'label', e.target.value)
            }
            className="w-full rounded-xl border border-gold-200 px-3 py-2"
            placeholder="Link text"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-1">
            URL
          </label>
          <input
            value={link.href}
            onChange={(e) =>
              handleLinkChange(section, index, 'href', e.target.value)
            }
            className="w-full rounded-xl border border-gold-200 px-3 py-2"
            placeholder="/shop or /login"
          />
        </div>
        <button
          type="button"
          onClick={() => handleRemoveLink(section, index)}
          className="rounded-xl border border-gold-200 bg-[#fff8f0] px-3 py-2 text-xs font-semibold text-maroon-900"
        >
          Remove
        </button>
      </div>
    ));
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <h4 className="font-semibold text-maroon-900 mb-4">Footer Links</h4>
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h5 className="text-sm font-semibold text-maroon-900">
                  Help Links
                </h5>
              </div>
              <button
                type="button"
                onClick={() => handleAddLink('help')}
                className="rounded-xl bg-maroon-900 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-gold-100"
              >
                Add Link
              </button>
            </div>
            <div className="space-y-3">{renderLinkRows('help')}</div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h5 className="text-sm font-semibold text-maroon-900">
                  About Links
                </h5>
                <p className="text-xs text-maroon-700/80">
                  Links shown under the About section.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleAddLink('about')}
                className="rounded-xl bg-maroon-900 px-3.5 py-2 text-sm font-semibold whitespace-nowrap text-gold-100"
              >
                Add Link
              </button>
            </div>
            <div className="space-y-3">{renderLinkRows('about')}</div>
          </div>
        </div>
        <button
          type="submit"
          className="rounded-xl bg-maroon-900 px-4 py-2.5 text-sm font-semibold text-gold-100"
        >
          Save Footer Links
        </button>
      </form>
    </div>
  );
}
