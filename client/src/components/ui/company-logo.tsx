import React from 'react';

interface CompanyLogoProps {
  company: string;
  className?: string;
}

const CompanyLogo: React.FC<CompanyLogoProps> = ({ company, className = "w-8 h-8" }) => {
  const logoMap: Record<string, JSX.Element> = {
    "TCS": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="10" y="30" width="80" height="40" rx="5" fill="#0052CC"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>TCS</text>
      </svg>
    ),
    "Infosys": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <circle cx="50" cy="50" r="40" fill="#007CC3"/>
        <text x="50" y="35" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>INFOSYS</text>
        <rect x="20" y="55" width="60" height="3" fill="white"/>
      </svg>
    ),
    "Wipro": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="15" y="25" width="70" height="50" rx="8" fill="#FF6B35"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>WIPRO</text>
      </svg>
    ),
    "HUL": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <ellipse cx="50" cy="50" rx="35" ry="25" fill="#0066CC"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>HUL</text>
      </svg>
    ),
    "ITC": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="20" y="30" width="60" height="40" rx="6" fill="#8B4513"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>ITC</text>
      </svg>
    ),
    "Airtel": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="#E31E24"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>airtel</text>
      </svg>
    ),
    "HDFC": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="10" y="20" width="80" height="60" rx="10" fill="#004C8F"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>HDFC</text>
      </svg>
    ),
    "ICICI": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="15" y="25" width="70" height="50" rx="8" fill="#F47C20"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-sm)', fontWeight: 'bold' }}>ICICI</text>
      </svg>
    ),
    "SBI": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <circle cx="50" cy="50" r="35" fill="#1F4E79"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-base)', fontWeight: 'bold' }}>SBI</text>
      </svg>
    ),
    "Reliance": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="10" y="30" width="80" height="40" rx="5" fill="#0066CC"/>
        <text x="50" y="45" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>RELIANCE</text>
        <text x="50" y="58" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-xs)' }}>INDUSTRIES</text>
      </svg>
    ),
    "Mahindra": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="15" y="25" width="70" height="50" rx="8" fill="#C1272D"/>
        <text x="50" y="45" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-xs)', fontWeight: 'bold' }}>MAHINDRA</text>
        <text x="50" y="58" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-xs)' }}>&amp; MAHINDRA</text>
      </svg>
    ),
    "L&T": (
      <svg viewBox="0 0 100 100" className={className} fill="currentColor">
        <rect x="20" y="30" width="60" height="40" rx="6" fill="#0056A0"/>
        <text x="50" y="55" textAnchor="middle" fill="white" style={{ fontSize: 'var(--text-lg)', fontWeight: 'bold' }}>L&amp;T</text>
      </svg>
    )
  };

  return logoMap[company] || (
    <div className={`${className} bg-gray-300 rounded flex items-center justify-center text-gray-600 text-xs font-bold`}>
      {company.substring(0, 3)}
    </div>
  );
};

export default CompanyLogo;
