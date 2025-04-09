// src/common/utils/route-registrar.ts
import { Express, Router } from "express";
import { config } from "../../config/app.config";

type RouteModule = {
  path: string;
  router: Router;
  middleware?: any[];
};

export const registerRoutes = (app: Express, routes: RouteModule[]) => {
  const basePath = config.BASE_PATH;

  routes.forEach(({ path, router, middleware = [] }) => {
    const fullPath = `${basePath}${path}`;
    app.use(fullPath, ...middleware, router);
  });
};
