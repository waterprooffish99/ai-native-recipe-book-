import React from 'react';
// Import the polyfill to ensure process is defined globally
import '../polyfill';

// Import the default layout from Docusaurus
import OriginalLayout from '@theme-original/Layout';

// Create a wrapper component that ensures polyfill is loaded before rendering
const Layout = (props) => {
  return (
    <OriginalLayout {...props}>
      {props.children}
    </OriginalLayout>
  );
};

export default Layout;