import Features from './siteCustom/features';
import Categories from './siteCustom/categories';
import Hero from './siteCustom/hero';
import Ribbon from './siteCustom/ribbon';
import Collections from './siteCustom/collections';

export default function SiteCustomize() {
  return (
    <div className="space-y-6">
      {/* Top announcement bar */}
      <Ribbon />

      <Categories />

      <Hero />

      <Features />

      <Collections />
    </div>
  );
}
