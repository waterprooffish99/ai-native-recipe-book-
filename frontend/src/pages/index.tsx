import React from 'react';
import { Redirect } from '@docusaurus/router';
import { useLocation } from '@docusaurus/router';

function Homepage(): JSX.Element {
  const location = useLocation();

  // Redirect to the personalized dashboard as the homepage
  return <Redirect to="/dashboard" />;
}

export default Homepage;