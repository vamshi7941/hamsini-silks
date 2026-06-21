type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  light?: boolean;
};

export default function SectionHeader({ eyebrow, title, subtitle, light }: Props) {
  const textColorClass = light ? "text-gold-400" : "text-gold-500";

  return (
    <div className="text-center mb-8 sm:mb-12 max-w-2xl mx-auto px-4">
      {eyebrow && (
        <div className={`inline-flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] tracking-[0.3em] sm:tracking-[0.4em] mb-3 sm:mb-4 ${light ? "text-gold-300" : "text-gold-700"}`}>
          <span className="h-px w-6 sm:w-8 bg-current" />
          {eyebrow}
          <span className="h-px w-6 sm:w-8 bg-current" />
        </div>
      )}
      <h2 className={`font-display text-2xl sm:text-3xl lg:text-4xl sm:text-5xl mb-3 sm:mb-4 ${light ? "text-gold-100" : "text-maroon-900"}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`text-xs sm:text-base leading-relaxed ${light ? "text-gold-100/70" : "text-maroon-700/70"}`}>
          {subtitle}
        </p>
      )}
      <div className="flex justify-center mt-4 sm:mt-5">
        <svg width="60" height="12" viewBox="0 0 80 14" fill="none" className={`w-[60px] sm:w-[80px] ${textColorClass}`}>
          <path d="M0 7 L30 7 M50 7 L80 7" stroke="currentColor" strokeWidth="1" />
          <path d="M40 1 L43 7 L40 13 L37 7 Z" fill="currentColor" />
          <circle cx="32" cy="7" r="1.5" fill="currentColor" />
          <circle cx="48" cy="7" r="1.5" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}