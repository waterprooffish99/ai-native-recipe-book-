import React from 'react';
import { useParams, useHistory, Route, Switch } from 'react-router-dom';
import RecipeDetail from '../../components/recipes/RecipeDetail';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { Redirect } from '@docusaurus/router';

const RecipeDetailRoute: React.FC = () => {
  const { id: paramId } = useParams<{ id?: string }>();
  const history = useHistory();

  let id = paramId;

  // Fallback: manually parse ID from URL pathname to handle locale prefixes and direct hits reliably
  if (!id && typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    const recipesIdx = segments.indexOf('recipes');
    if (recipesIdx !== -1 && segments[recipesIdx + 1]) {
      id = segments[recipesIdx + 1];
    }
  }

  if (!id) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen bg-globalplate-bg-dark text-globalplate-text-primary p-8">
      <div className="max-w-6xl mx-auto">
        <RecipeDetail
          recipeId={id}
          onBack={() => history.push('/dashboard')}
        />
      </div>
    </div>
  );
};

const RecipeDetailPageWrapper: React.FC = () => {
  return (
    <BrowserOnly fallback={<div className="text-center py-12 text-globalplate-text-primary">Loading...</div>}>
      {() => {
        return (
          <Switch>
            <Route path="*/recipes/:id">
              <RecipeDetailRoute />
            </Route>
            <Route path="*">
              <RecipeDetailRoute />
            </Route>
          </Switch>
        );
      }}
    </BrowserOnly>
  );
};

export default RecipeDetailPageWrapper;
