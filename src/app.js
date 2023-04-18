let normalizedRoutes;
import { dynamic } from 'umi';
import { getRouteMenus } from '@/services/route/Route';
// umi3.x 需要将 routes 选项从第一个参数中解构: patchRoutes({ routes }) {}
export function patchRoutes(routes) {
  if (normalizedRoutes) {
    // console.log('routes', routes);

    mergeRoutes(normalizedRoutes, routes).map(item => {
      routes[2].routes.unshift(item);
    });
    // console.log('routes', routes);
  }
}

// oldRender 至少需要被调用一次
export function render(oldRender) {
  getRouteMenus().then(
    response => {
      //   console.log('response', response);
      normalizedRoutes = response.data.sort((a, b) => {
        return b.sort - a.sort;
      });
      oldRender();
    },
    error => {
      console.log('error', error);
    }
  );
}

const mergeRoutes = (routes, parentRoute) => {
  if (!Array.isArray(routes)) return [];
  return routes.map(route => {
    if (route.path) {
      route.path = route.path.startsWith('/')
        ? route.path
        : `${parentRoute?.path || ''}/${route.path}`;
    }
    if (route.component) {
      route.component = (component => {
        // console.log('component', component);
        if (typeof component === 'function') {
          return component;
        }
        // eslint-disable-next-line global-require, import/no-dynamic-require, prefer-template
        // return require('./pages/' + component.substr(component.indexOf('/') + 1)).default;
        // return require('./pages/' + component).default;
        // return dynamic({ component: () => import(`./pages/${component}`) });
        return AsyncComponent(component);
      })(route.component);
    }
    if (route.routes) {
      route.routes = mergeRoutes(route.routes, route);
    }
    return route;
  });
};

const AsyncComponent = componentPath => {
  return dynamic({
    loader: async function() {
      const { default: AsyncComp } = await import(`./pages/${componentPath}.js`);
      return AsyncComp;
    },
    loading: () => {
      return null;
    },
  });
};
