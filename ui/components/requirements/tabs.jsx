import React from 'react';
import { Link } from 'react-router';

function Tab({ active, link, tabName }) {
  if (active) {
    return <li className="inline-block mr4 bold">{ tabName }</li>;
  }
  return (
    <li className="inline-block mr4">
      <Link to={link} >{ tabName }</Link>
    </li>
  );
}
Tab.defaultProps = {
  active: false,
  link: { pathname: '', query: {} },
  tabName: '',
};
Tab.propTypes = {
  active: React.PropTypes.bool,
  link: React.PropTypes.shape({
    pathname: React.PropTypes.string,
    query: React.PropTypes.shape({}),
  }),
  tabName: React.PropTypes.string,
};

export default function Tabs({ router }) {
  if (router.routes.length < 2) {
    return null;
  }
  const parentRoute = router.routes[router.routes.length - 2];
  const currentPath = router.routes[router.routes.length - 1].path;

  const modifiedQuery = Object.assign({}, router.location.query);
  delete modifiedQuery.page;

  const pathprefix = router.routes.filter(r => r.path && r.path !== '/').map(r => r.path);
  pathprefix.pop();

  const tabs = parentRoute.childRoutes.map(childRoute => ({
    key: childRoute.path,
    active: childRoute.path === currentPath,
    tabName: childRoute.tabName,
    link: {
      pathname: `/${pathprefix.concat([childRoute.path]).join('/')}`,
      query: modifiedQuery,
    },
  }));

  return (
    <div>
      <span className="mr4">Organize by</span>
      <ul className="organize-tabs list-reset inline-block">
        { tabs.map(tab => <Tab {...tab} />) }
      </ul>
    </div>
  );
}
Tabs.defaultProps = {
  router: { routes: [], location: { query: {} } },
};
Tabs.propTypes = {
  router: React.PropTypes.shape({
    routes: React.PropTypes.arrayOf(React.PropTypes.shape({})),
    location: React.PropTypes.shape({
      query: React.PropTypes.shape({}),
    }),
  }),
};
