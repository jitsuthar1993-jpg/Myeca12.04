interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function Logo({ className = "", size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} flex items-center justify-center bg-white border border-blue-50/50 rounded-xl shadow-sm relative overflow-hidden group focus:outline-none focus:ring-0`}>
      {/* Subtle light pulse background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-100 group-hover:opacity-80 transition-opacity duration-300"></div>

      <svg
        viewBox="0 0 40 40"
        className={`${iconSizeClasses[size]} text-blue-600 fill-current relative z-10 group-hover:scale-110 transition-transform duration-300`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Calculator base - using a cleaner stroke-only approach for premium light look */}
        <rect x="8" y="10" width="24" height="24" rx="3" className="fill-none stroke-blue-600 stroke-[2] opacity-100" />

        {/* Screen */}
        <rect x="11" y="13" width="18" height="6" rx="1.5" className="fill-blue-500/20 stroke-blue-600 stroke-[0.5]" />

        {/* Buttons grid */}
        <circle cx="14" cy="24" r="1.5" className="fill-blue-600" />
        <circle cx="20" cy="24" r="1.5" className="fill-blue-600" />
        <circle cx="26" cy="24" r="1.5" className="fill-blue-600" />

        <circle cx="14" cy="29" r="1.5" className="fill-blue-600" />
        <circle cx="20" cy="29" r="1.5" className="fill-blue-600" />
        <circle cx="26" cy="29" r="1.5" className="fill-emerald-500" />

        {/* Logo text accent */}
        <path d="M18 8 L22 8" className="stroke-indigo-600 stroke-[2] stroke-round" />
      </svg>
    </div>
  );
}