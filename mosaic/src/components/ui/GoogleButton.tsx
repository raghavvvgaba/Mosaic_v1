import React from 'react';

type Props = {
  label?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" aria-hidden="true" focusable="false" {...props}>
      <path fill="#EA4335" d="M533.5 278.4c0-18.5-1.7-36.3-4.9-53.4H272v101h147.1c-6.3 34-25 62.8-53.4 82v68h86.2c50.5-46.6 81.6-115.3 81.6-197.6z"/>
      <path fill="#34A853" d="M272 544.3c73.8 0 135.7-24.5 181-66.3l-86.2-68c-24 16.1-54.7 25.7-94.8 25.7-72.7 0-134.4-49.1-156.5-115.1H26.7v71.9c45 89.3 137.6 151.8 245.3 151.8z"/>
      <path fill="#4A90E2" d="M115.5 320.6c-10.8-32-10.8-66.7 0-98.7V150H26.7c-43.6 86.9-43.6 190.6 0 277.5l88.8-70.9z"/>
      <path fill="#FBBC05" d="M272 106.6c39.9-.6 69.7 14 91.1 32.2l68.1-68.1C407.6 25.4 345.7 0 272 0 164.3 0 71.7 62.5 26.7 151.8l88.8 71.9C137.6 157.7 199.3 106.6 272 106.6z"/>
    </svg>
  );
}

export default function GoogleButton({ label = 'Login with Google', onClick, className = '', ariaLabel }: Props) {
  const base = 'btn-outline inline-flex items-center justify-center gap-3 w-full py-3';
  return (
    <button
      type="button"
      aria-label={ariaLabel ?? label}
      className={`${base} ${className}`}
      onClick={onClick}
    >
      <GoogleIcon className="h-5 w-5" />
      <span>{label}</span>
    </button>
  );
}
