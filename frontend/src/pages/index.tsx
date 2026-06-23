/**
 * Homepage - Redirects to Dashboard
 */

import React from 'react';
import { Redirect } from '@docusaurus/router';

function Homepage(): JSX.Element {
  return <Redirect to="/dashboard" />;
}

export default Homepage;
