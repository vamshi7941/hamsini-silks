import Features from './siteCustom/features';
import Categories from './siteCustom/categories';
import Hero from './siteCustom/hero';

export default function SiteCustomize() {
  return (
    <div className="space-y-6">
      <Categories />

      <Hero />

      <Features/>
    </div>
  );
}
