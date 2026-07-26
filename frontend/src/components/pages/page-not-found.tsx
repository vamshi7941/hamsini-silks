import { Link } from 'react-router-dom';
import { LotusIcon } from '../Icons';

const PageNotFound = () => {
  return (
    <div className="min-h-screen bg-[#fdf8f1] flex flex-col items-center justify-center px-4 animate-fadeIn">
      <div className="text-center max-w-lg">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center border border-gold-200">
            <LotusIcon className="h-10 w-10 text-gold-500" />
          </div>
        </div>

        <h1 className="font-display text-7xl sm:text-8xl gold-shimmer mb-4">
          404
        </h1>

        <p className="text-maroon-800 text-lg sm:text-xl font-serif italic mb-2">
          The page you&apos;re looking for has gone weaving elsewhere.
        </p>

        <p className="text-maroon-600 text-sm mb-8">
          The link may be broken or the page may have been moved.
        </p>

        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-maroon-900 text-gold-100 rounded-full text-sm font-medium tracking-wide hover:bg-maroon-800 transition-colors cursor-pointer"
        >
          Return Home
        </Link>
      </div>

      <div className="mt-12 pattern-paisley w-full h-16 opacity-40" />
    </div>
  );
};

export default PageNotFound;