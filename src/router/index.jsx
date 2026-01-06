import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import { getRouteConfig } from "@/router/route.utils";

// Lazy load page components
const GamePage = lazy(() => import("@/components/pages/GamePage"));
const NotFound = lazy(() => import("@/components/pages/NotFound"));

// Authentication pages
const Login = lazy(() => import("@/pages/auth/Login"));
const Signup = lazy(() => import("@/pages/auth/Signup"));
const Callback = lazy(() => import("@/pages/auth/Callback"));
const ErrorPage = lazy(() => import("@/pages/auth/ErrorPage"));
const AccessDenied = lazy(() => import("@/pages/auth/AccessDenied"));
const ResetPassword = lazy(() => import("@/pages/auth/ResetPassword"));
const PromptPassword = lazy(() => import("@/pages/auth/PromptPassword"));

// Layouts
const Root = lazy(() => import("@/layouts/Root"));

const createRoute = ({
  path,
  index,
  element,
  access,
  children,
  ...meta
}) => {
  // Get config for this route
  let configPath;
  if (index) {
    configPath = "/";
  } else {
    configPath = path.startsWith('/') ? path : `/${path}`;
  }

  const config = getRouteConfig(configPath);
  const finalAccess = access || config?.allow;

  const route = {
    ...(index ? { index: true } : { path }),
    element: element ? <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center space-y-4">
      <svg className="animate-spin h-12 w-12 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>
  </div>}>{element}</Suspense> : element,
    handle: {
      access: finalAccess,
      ...meta,
    },
  };

  if (children && children.length > 0) {
    route.children = children;
  }

  return route;
};

const routes = [
  {
    path: "/",
    element: <Root />,
    children: [
      createRoute({
        index: true,
        element: <GamePage />
      }),
      
      // Authentication routes
      createRoute({
        path: "/login",
        element: <Login />
      }),
      createRoute({
        path: "/signup", 
        element: <Signup />
      }),
      createRoute({
        path: "/callback",
        element: <Callback />
      }),
      createRoute({
        path: "/error",
        element: <ErrorPage />
      }),
      createRoute({
        path: "/access-denied",
        element: <AccessDenied />
      }),
      createRoute({
        path: "/reset-password/:appId/:fields",
        element: <ResetPassword />
      }),
      createRoute({
        path: "/prompt-password/:appId/:emailAddress/:provider",
        element: <PromptPassword />
      }),
      
      // Catch all route
      createRoute({
        path: "*",
        element: <NotFound />
      })
    ]
  }
];

export const router = createBrowserRouter(routes);