import { AdminApi, FooterContent, FooterLink } from '@/api/admin';
import { useStore } from '@/context/StoreContext';
import { useEffect, useState } from 'react';
import { slugify } from '@/utils/cn';

import SimpleMDEEditorPkg from 'react-simplemde-editor';
import 'easymde/dist/easymde.min.css';

// Normalize import shape (works with/without esModuleInterop)
const SimpleMDEEditor: any =
  (SimpleMDEEditorPkg as any)?.default || (SimpleMDEEditorPkg as any);

const emptyLink = (): FooterLink => ({
  label: '',
  href: '',
  title: '',
  description: '',
  content: '',
});

export default function Footer() {
  const { siteContent, setSiteContent, showToast } = useStore();
  const { fetchSiteContent, saveFooterContent } = AdminApi();

  const [helpLinks, setHelpLinks] = useState<FooterLink[]>([]);
  const [aboutLinks, setAboutLinks] = useState<FooterLink[]>([]);
  const [openIndices, setOpenIndices] = useState<{help: number[]; about: number[]}>({
    help: [],
    about: [],
  });

  useEffect(() => {
    setHelpLinks(
      Array.isArray(siteContent?.footer?.help) &&
        siteContent.footer.help.length > 0
        ? siteContent.footer.help
        : [],
    );
    setAboutLinks(
      Array.isArray(siteContent?.footer?.about) &&
        siteContent.footer.about.length > 0
        ? siteContent.footer.about
        : [],
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

    // Auto-generate label and href from title
    if (field === 'title') {
      updated[index] = {
        ...updated[index],
        [field]: value,
        label: value, // Title and label are the same
        href: `/${slugify(value)}`, // Auto-generate href from title
      };
    } else {
      updated[index] = { ...updated[index], [field]: value };
    }

    section === 'help' ? setHelpLinks(updated) : setAboutLinks(updated);
  };

  const handleAddLink = (section: 'help' | 'about') => {
    if (section === 'help') {
      setHelpLinks((prev) => {
        const updated = [...prev, emptyLink()];
        const newIndex = updated.length - 1;
        setOpenIndices((o) => ({ ...o, help: [...o.help, newIndex] }));
        return updated;
      });
    } else {
      setAboutLinks((prev) => {
        const updated = [...prev, emptyLink()];
        const newIndex = updated.length - 1;
        setOpenIndices((o) => ({ ...o, about: [...o.about, newIndex] }));
        return updated;
      });
    }
  };

  const handleRemoveLink = (section: 'help' | 'about', index: number) => {
    const source = section === 'help' ? helpLinks : aboutLinks;
    const updated = source.filter((_, idx) => idx !== index);
    if (section === 'help') {
      setHelpLinks(updated);
      setOpenIndices((o) => ({
        ...o,
        help: o.help
          .filter((i) => i !== index)
          .map((i) => (i > index ? i - 1 : i)),
      }));
    } else {
      setAboutLinks(updated);
      setOpenIndices((o) => ({
        ...o,
        about: o.about
          .filter((i) => i !== index)
          .map((i) => (i > index ? i - 1 : i)),
      }));
    }
  };

  const toggleAccordion = (section: 'help' | 'about', index: number) => {
    setOpenIndices((o) => {
      const arr = section === 'help' ? [...o.help] : [...o.about];
      const exists = arr.includes(index);
      const newArr = exists ? arr.filter((i) => i !== index) : [...arr, index];
      return section === 'help' ? { ...o, help: newArr } : { ...o, about: newArr };
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitized: FooterContent = {
      help: helpLinks
        .map((item) => ({
          label: item.label.trim(),
          href: item.href.trim(),
          title: item.title?.trim() || '',
          description: item.description?.trim() || '',
          content: item.content?.trim() || '',
        }))
        .filter((item) => item.label),
      about: aboutLinks
        .map((item) => ({
          label: item.label.trim(),
          href: item.href.trim(),
          title: item.title?.trim() || '',
          description: item.description?.trim() || '',
          content: item.content?.trim() || '',
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
    const open = openIndices[section];
    return links.map((link, index) => {
      const isOpen = open.includes(index);
      return (
        <div
          key={`${section}-${index}`}
          className="rounded-xl border border-gold-200/50 overflow-hidden"
        >
          <div
            className="bg-maroon-50/30 p-4 flex items-center justify-between cursor-pointer"
            onClick={() => toggleAccordion(section, index)}
          >
            <div>
              <div className="text-sm font-semibold text-maroon-900">
                {link.title || link.label || `Link ${index + 1}`}
              </div>
              <div className="text-xs text-maroon-700/70">
                {link.href || 'No URL'}
              </div>
            </div>
            <div className="text-sm text-maroon-900 font-semibold">
              {isOpen ? '−' : '+'}
            </div>
          </div>

          {isOpen && (
            <div className="bg-maroon-50/30 p-4 space-y-4">
              {/* Row 1: Title */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <input
                  value={link.title || ''}
                  onChange={(e) =>
                    handleLinkChange(section, index, 'title', e.target.value)
                  }
                  className="w-full rounded-lg border border-gold-200 px-3 py-2 text-sm"
                  placeholder="e.g., Track Your Order"
                />
                <p className="text-xs text-maroon-700/60 mt-1">
                  Label and URL will be auto-generated from this title
                </p>
              </div>

              {/* Row 2: Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-2">
                  Description
                </label>
                <textarea
                  value={link.description || ''}
                  onChange={(e) =>
                    handleLinkChange(section, index, 'description', e.target.value)
                  }
                  className="w-full rounded-lg border border-gold-200 px-3 py-2 text-sm"
                  placeholder=""
                  rows={4}
                />
              </div>

              {/* Row 3: Content */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wide text-maroon-900 mb-2">
                  Content{' '}
                  <span className="text-gray-500 font-normal">(with formatting)</span>
                </label>
                <div className="rounded-lg border border-gold-200 overflow-hidden bg-white">
                  <SimpleMDEEditor
                    value={link.content || ''}
                    onChange={(value: string) =>
                      handleLinkChange(section, index, 'content', value)
                    }
                    options={{
                      spellChecker: false,
                      toolbar: [
                        'bold',
                        'italic',
                        'heading',
                        '|',
                        'unordered-list',
                        'ordered-list',
                        '|',
                        'link',
                      ],
                      placeholder: '',
                    }}
                  />
                </div>
              </div>

              {/* Remove Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveLink(section, index)}
                  className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
                >
                  Remove Link
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gold-100 p-5 shadow-xs">
      <h4 className="font-semibold text-maroon-900 mb-6">Footer Links</h4>
      <form onSubmit={handleSave} className="space-y-8">
        {/* Help Links Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h5 className="text-sm font-semibold text-maroon-900">
                Help Links
              </h5>
              <p className="text-xs text-maroon-700/70 mt-1">
                Links shown in the Help section with title, description, and
                detailed content.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddLink('help')}
              className="rounded-lg bg-maroon-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-gold-100 hover:bg-maroon-800 transition-colors"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-4">{renderLinkRows('help')}</div>
        </div>

        {/* About Links Section */}
        <div className="space-y-4 border-t border-gold-200 pt-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h5 className="text-sm font-semibold text-maroon-900">
                About Links
              </h5>
              <p className="text-xs text-maroon-700/70 mt-1">
                Links shown in the About section with title, description, and
                detailed content.
              </p>
            </div>
            <button
              type="button"
              onClick={() => handleAddLink('about')}
              className="rounded-lg bg-maroon-900 px-4 py-2 text-sm font-semibold whitespace-nowrap text-gold-100 hover:bg-maroon-800 transition-colors"
            >
              + Add Link
            </button>
          </div>
          <div className="space-y-4">{renderLinkRows('about')}</div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gold-200">
          <button
            type="submit"
            className="rounded-lg bg-maroon-900 px-6 py-2.5 text-sm font-semibold text-gold-100 hover:bg-maroon-800 transition-colors"
          >
            Save Footer Links
          </button>
        </div>
      </form>
    </div>
  );
}
