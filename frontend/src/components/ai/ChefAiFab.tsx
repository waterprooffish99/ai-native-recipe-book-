import React from 'react';
import { useTranslation } from 'react-i18next';
import { isRTL } from '../../i18n/config';

interface ChefAiFabProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ChefAiFab: React.FC<ChefAiFabProps> = ({ onClick, isOpen }) => {
  const { i18n } = useTranslation();
  const isRtl = isRTL(i18n.language);

  return (
    <button
      onClick={onClick}
      aria-label="Toggle Chef AI Chat"
      aria-expanded={isOpen}
      className={`
        fixed
        bottom-6
        ${isRtl ? 'left-6' : 'right-6'}
        z-50
        flex
        items-center
        justify-center
        w-14
        h-14
        rounded-full
        bg-gradient-to-tr
        from-violet-600
        via-indigo-600
        to-purple-500
        text-white
        shadow-lg
        shadow-indigo-500/30
        hover:shadow-indigo-500/50
        hover:scale-105
        active:scale-95
        transition-all
        duration-300
        ease-out
        focus:outline-none
        focus:ring-2
        focus:ring-indigo-400
        focus:ring-offset-2
        focus:ring-offset-slate-900
      `}
    >
      {/* Glow Ring Effect */}
      <span className="absolute inset-0 rounded-full bg-indigo-500/20 animate-ping opacity-75 pointer-events-none" />

      {isOpen ? (
        /* Close Icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-6 h-6 transition-transform duration-300 transform rotate-90"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        /* Sparkling Chef Hat + Chat Bubble Combined AI Icon */
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-7 h-7 animate-pulse-slow"
        >
          {/* Chef Hat outline */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 21v-4.875c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125V21m-7.5 0h7.5m-7.5 0H5.25A2.25 2.25 0 013 18.75c0-1.026.685-1.89 1.624-2.162a4.875 4.875 0 019.502-3.178c.365.112.72.268 1.057.465a4.875 4.875 0 017.217 4.713L21 18.75A2.25 2.25 0 0118.75 21"
          />
          {/* Sparkles */}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 3.104v-.208a.75.75 0 011.5 0v.208a3 3 0 001.218 2.4l.117.085a.75.75 0 01-.88 1.214l-.116-.085a1.5 1.5 0 01-.609-1.2v-.22m0-2.4a3 3 0 01-1.218 2.4l-.117.085a.75.75 0 01.88 1.214l.116-.085a1.5 1.5 0 00.609-1.2v-.22m3.75 4.5v-.208a.75.75 0 011.5 0v.208a3 3 0 001.218 2.4l.117.085a.75.75 0 01-.88 1.214l-.116-.085a1.5 1.5 0 01-.609-1.2v-.22"
          />
        </svg>
      )}
    </button>
  );
};

export default ChefAiFab;
