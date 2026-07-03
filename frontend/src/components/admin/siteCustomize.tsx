import { useState } from 'react';
import Features from './siteCustom/features';
import Categories from './siteCustom/categories';
import Hero from './siteCustom/hero';
import Ribbon from './siteCustom/ribbon';
import Collections from './siteCustom/collections';
import HandPicked from './siteCustom/handPicked';
import SpecialOffers from './siteCustom/specialOffers';
import Videos from './siteCustom/videos';
import Footer from './siteCustom/footer';

function SectionAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`bg-white rounded-2xl border border-gold-100 shadow-xs overflow-hidden transition-all ${
        expanded ? 'shadow-md' : ''
      }`}
    >
      <div
        className="flex flex-nowrap items-center justify-between gap-4 p-4 cursor-pointer hover:bg-maroon-50/30 transition-colors"
        onClick={() => setExpanded((current) => !current)}
      >
        <h2 className="text-sm font-semibold text-maroon-900">{title}</h2>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className={`w-4 h-4 text-maroon-400 transition-transform ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

      {expanded && (
        <div className="border-t border-gold-100 p-4 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}

export default function SiteCustomize() {
  return (
    <div className="space-y-4">
      <SectionAccordion title="Top announcement bar">
        <Ribbon />
      </SectionAccordion>

      <SectionAccordion title="Category menu section">
        <Categories />
      </SectionAccordion>

      <SectionAccordion title="Hero section content">
        <Hero />
      </SectionAccordion>

      <SectionAccordion title="Features section content">
        <Features />
      </SectionAccordion>

      <SectionAccordion title="Collections section content">
        <Collections />
      </SectionAccordion>

      <SectionAccordion title="Hand-picked section content">
        <HandPicked />
      </SectionAccordion>

      <SectionAccordion title="Special offers section content">
        <SpecialOffers />
      </SectionAccordion>

      <SectionAccordion title="Videos section content">
        <Videos />
      </SectionAccordion>

      <SectionAccordion title="Footer section content">
        <Footer />
      </SectionAccordion>
    </div>
  );
}
