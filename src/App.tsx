import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import LinkhubPage from "./pages/LinkhubPage";
import TagPage from "./pages/TagPage";
import PostPage from "./pages/PostPage";
import AboutPage from "./pages/AboutPage";
import ProjectsPage from "./pages/ProjectsPage";
import Auth from "./pages/Auth";
import AdminLayout from "./pages/admin/AdminLayout";
import Dashboard from "./pages/admin/Dashboard";
import PostsList from "./pages/admin/PostsList";
import PostEditor from "./pages/admin/PostEditor";

import AdminSettings from "./pages/admin/Settings";
import ProjectsList from "./pages/admin/ProjectsList";
import SprintsList from "./pages/admin/SprintsList";
import SprintEditor from "./pages/admin/SprintEditor";
import ContentStudio from "./pages/admin/ContentStudio";
import ContentStudioEditor from "./pages/admin/ContentStudioEditor";
import ContentStudioSchedule from "./pages/admin/ContentStudioSchedule";
import ContextPage from "./pages/admin/ContextPage";

import NotFound from "./pages/NotFound";
import LocaleSync from "./components/LocaleSync";

const queryClient = new QueryClient();

/**
 * Public route map — rendered twice: once at root (Russian) and once under
 * `/en/*` (English). Keeping them as data lets us avoid drift between locales.
 */
const PUBLIC_ROUTES: { path: string; element: JSX.Element }[] = [
  { path: "/", element: <LinkhubPage /> },
  { path: "/blog", element: <Index /> },
  { path: "/home", element: <Index /> },
  { path: "/tag/:slug", element: <TagPage /> },
  { path: "/post/:slug", element: <PostPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/projects", element: <ProjectsPage /> },
];

const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <LocaleSync />
          <Routes>
            {/* Russian (default) routes */}
            {PUBLIC_ROUTES.map(r => (
              <Route key={r.path} path={r.path} element={r.element} />
            ))}
            {/* English routes — same components, prefixed with /en. */}
            {PUBLIC_ROUTES.map(r => (
              <Route
                key={"en" + r.path}
                path={r.path === "/" ? "/en" : "/en" + r.path}
                element={r.element}
              />
            ))}
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="posts" element={<PostsList />} />
              <Route path="posts/new" element={<PostEditor />} />
              <Route path="posts/:id/edit" element={<PostEditor />} />
              <Route path="projects" element={<ProjectsList />} />
              <Route path="sprints" element={<SprintsList />} />
              <Route path="sprints/new" element={<SprintEditor />} />
              <Route path="sprints/:id" element={<SprintEditor />} />
              <Route path="content-studio" element={<ContentStudio />} />
              <Route path="content-studio/schedule" element={<ContentStudioSchedule />} />
              <Route path="content-studio/:id" element={<ContentStudioEditor />} />
              <Route path="context" element={<ContextPage />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
);

export default App;
