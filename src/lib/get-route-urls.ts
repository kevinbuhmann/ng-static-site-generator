import { Routes } from '@angular/router';

export function getRouteUrls(routes: Routes, baseUrl = '/') {
  const urls: string[] = [];

  for (const route of routes) {
    const slash = route.path.length && !baseUrl.endsWith('/') ? '/' : '';
    const routeUrl = `${baseUrl}${slash}${route.path}`;

    urls.push(routeUrl);

    if (route.children && route.children.length) {
      urls.push(...getRouteUrls(route.children, routeUrl));
    }
  }

  return urls
    .filter(url => url.includes(':') === false)
    .filter(url => url.includes('*') === false)
    .filter((item, pos, self) => self.indexOf(item) === pos);
}
