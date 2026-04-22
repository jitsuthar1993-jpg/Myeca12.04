interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-9 h-9',
    md: 'w-[46px] h-[46px]',
    lg: 'w-16 h-16'
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm relative overflow-hidden group focus:outline-none focus:ring-0`}>
      {/* Subtle light pulse background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50/30 opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>

      <svg
        viewBox="0 0 40 40"
        className={`${iconSizeClasses[size]} text-slate-900 fill-current relative z-10 group-hover:scale-110 transition-transform duration-300`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Main Body - Larger and more defined */}
        <rect x="4" y="6" width="32" height="30" rx="4" className="fill-none stroke-slate-900 stroke-[2.5]" />

        {/* Screen - More detailed */}
        <rect x="8" y="10" width="24" height="8" rx="2" className="fill-slate-100/80 stroke-slate-900 stroke-[0.75]" />
        <line x1="10" y1="14" x2="20" y2="14" className="stroke-slate-900 stroke-[1.5] stroke-round opacity-40" />

        {/* Keypad Grid - Better spacing and sizing */}
        <rect x="8" y="22" width="6" height="4" rx="1" className="fill-slate-900" />
        <rect x="17" y="22" width="6" height="4" rx="1" className="fill-slate-900" />
        <rect x="26" y="22" width="6" height="4" rx="1" className="fill-slate-900" />

        <rect x="8" y="29" width="6" height="4" rx="1" className="fill-slate-900" />
        <rect x="17" y="29" width="6" height="4" rx="1" className="fill-slate-900" />
        <rect x="26" y="29" width="6" height="4" rx="1" className="fill-blue-600" />

        {/* Accent line */}
        <path d="M16 4 L24 4" className="stroke-slate-900 stroke-[2.5] stroke-round" />
      </svg>
    </div>
  );
}
