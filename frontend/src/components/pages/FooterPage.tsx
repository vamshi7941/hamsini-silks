import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '../../context/StoreContext';
import { slugify } from '@/utils/cn';
import type { FooterLink } from '@/api/admin';
import { marked } from 'marked';

export default function FooterPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { siteContent } = useStore();
  const [selectedLink, setSelectedLink] = useState<FooterLink | null>(null);

  // Extract category (help or about) and slug from the pathname
  // Paths like: /help/track-order or /about/our-heritage
  const pathSegments = location.pathname.split('/').filter(Boolean);
  const category = pathSegments[0] as 'help' | 'about';
  const slug = pathSegments[1];

  // Get the appropriate section (help or about)
  const links =
    category === 'help' ? siteContent.footer.help : siteContent.footer.about;

  // Find the selected link based on slug
  useEffect(() => {
    if (!slug || !links) {
      setSelectedLink(null);
      return;
    }

    const found = links.find((link) => slugify(link.label) === slug);
    setSelectedLink(found || null);
  }, [slug, links]);

  const handleLinkClick = (link: FooterLink) => {
    const newSlug = slugify(link.label);
    navigate(`/${category}/${newSlug}`);
  };

  const handleBackToList = () => {
    navigate(`/${category}/${slugify(links[0]?.label || '')}`);
    setTimeout(() => setSelectedLink(null), 0);
  };

  if (!links || links.length === 0) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] pt-32 pb-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl font-serif text-maroon-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-maroon-700">
            The page you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  // Show detail view if a link is selected
  if (selectedLink) {
    return (
      <div className="min-h-screen bg-[#fdf8f1] pt-32 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={handleBackToList}
            className="mb-8 flex items-center gap-2 text-gold-700 hover:text-gold-900 transition-colors"
          >
            <span className="text-lg">←</span>
            <span>Back to {category === 'help' ? 'Help' : 'About'}</span>
          </button>

          {/* Header */}
          <div className="mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl font-serif text-maroon-900 mb-4">
              {selectedLink.title || selectedLink.label}
            </h1>
            <div className="h-1 w-24 bg-gradient-to-r from-gold-400 to-gold-600" />
          </div>

          {/* Description */}
          {selectedLink.description && (
            <div className="mb-10 text-lg text-maroon-700 font-display">
              {selectedLink.description}
            </div>
          )}

          {/* Main Content */}
          <div className="prose prose-sm sm:prose max-w-none mb-12">
            <div className="bg-white rounded-lg p-4 sm:p-12 border border-gold-200/30 shadow-sm">
              <div className="text-maroon-900 leading-tight">
                <div
                  className="markdown-content"
                  dangerouslySetInnerHTML={{
                    __html: marked(
                      selectedLink.content ||
                        'No additional content available.',
                    ),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Related Links */}
          <div className="mt-16 sm:mt-20">
            <h2 className="text-2xl sm:text-3xl font-display text-maroon-900 mb-8">
              Related Topics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {links
                .filter((link) => link.label !== selectedLink.label)
                .map((link) => (
                  <button
                    key={link.label}
                    onClick={() => handleLinkClick(link)}
                    className="group text-left p-6 rounded-lg border-2 border-gold-200/30 hover:border-gold-400/50 hover:bg-gold-50/30 transition-all duration-300"
                  >
                    <h3 className="text-lg font-display text-maroon-900 mb-2 group-hover:text-gold-700 transition-colors">
                      {link.label}
                    </h3>
                    <p className="text-sm text-maroon-700/70 mb-3">
                      {link.description || 'Learn more about this topic'}
                    </p>
                    <div className="flex items-center gap-2 text-gold-600 text-sm font-medium group-hover:gap-3 transition-all">
                      <span>Read More</span>
                      <span className="text-lg">→</span>
                    </div>
                  </button>
                ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="mt-16 sm:mt-20 p-8 sm:p-12 bg-gradient-to-r from-maroon-50/50 to-gold-50/30 rounded-xl border border-gold-200/30">
            <h2 className="text-2xl font-display text-maroon-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-maroon-700 mb-6">
              If you have any other questions, feel free to reach out to our
              customer support team.
            </p>
            <div className="space-y-3 text-sm text-maroon-700">
              <div className="flex gap-3 items-start">
                <span className="text-gold-600 mt-0.5">✉</span>
                <span>
                  <strong>Email:</strong> care@hamsinisilks.com
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-gold-600 mt-0.5">✆</span>
                <span>
                  <strong>Phone:</strong> +91 98400 12345
                </span>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-gold-600 mt-0.5">📍</span>
                <span>
                  <strong>Address:</strong> No. 42, Silk Road, T. Nagar, Chennai
                  – 600017
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show grid view of all links
  return (
    <div className="min-h-screen bg-[#fdf8f1] pt-32 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif text-maroon-900 mb-4 capitalize">
            {category === 'help' ? 'Help & Support' : 'About Us'}
          </h1>
          <div className="h-1 w-24 bg-gradient-to-r from-gold-400 to-gold-600 mx-auto" />
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10">
          {links.map((link) => (
            <button
              key={link.label}
              onClick={() => handleLinkClick(link)}
              className="group text-left p-8 rounded-lg border-2 border-gold-200/30 hover:border-gold-400/50 hover:bg-gold-50/30 transition-all duration-300 hover:cursor-pointer"
            >
              <h3 className="text-xl sm:text-2xl font-display text-maroon-900 mb-3 group-hover:text-gold-700 transition-colors">
                {link.label}
              </h3>
              <p className="text-sm text-maroon-700/70 mb-4">
                {link.description || 'Learn more about this topic'}
              </p>
              <div className="flex items-center gap-2 text-gold-600 text-sm font-medium group-hover:gap-3 transition-all">
                <span>Learn More</span>
                <span className="text-lg">→</span>
              </div>
            </button>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 sm:mt-20 p-8 sm:p-12 bg-gradient-to-r from-maroon-50/50 to-gold-50/30 rounded-xl border border-gold-200/30">
          <h2 className="text-2xl font-display text-maroon-900 mb-4">
            Need More Help?
          </h2>
          <p className="text-maroon-700 mb-6">
            If you have any questions or need assistance, please don't hesitate
            to reach out to our customer support team. We're here to help!
          </p>
          <div className="space-y-3 text-sm text-maroon-700">
            <div className="flex gap-3 items-start">
              <span className="text-gold-600 mt-0.5">✉</span>
              <span>
                <strong>Email:</strong> care@hamsinisilks.com
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-gold-600 mt-0.5">✆</span>
              <span>
                <strong>Phone:</strong> +91 98400 12345
              </span>
            </div>
            <div className="flex gap-3 items-start">
              <span className="text-gold-600 mt-0.5">📍</span>
              <span>
                <strong>Address:</strong> No. 42, Silk Road, T. Nagar, Chennai –
                600017
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
