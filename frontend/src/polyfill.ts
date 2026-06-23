// Global polyfill to define process for browser environments
// This prevents "process is not defined" errors in frontend code

if (typeof window !== 'undefined') {
  if (typeof process === 'undefined') {
    (window as any).process = {
      env: {
        NODE_ENV: 'development',
        REACT_APP_API_URL: (window as any).REACT_APP_API_URL || 'https://waterprooffish99-global-plate-backend.hf.space'
      }
    };
  }

  // Also ensure process exists as a global for compatibility
  if (typeof (window as any).process === 'undefined') {
    (window as any).process = {
      env: {}
    };
  }
}