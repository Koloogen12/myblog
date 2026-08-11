import { useEffect } from 'react';
import { NavLink, Link, Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Settings, LogOut, TrendingUp, FolderOpen, PenTool, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const adminNav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Дашборд', end: true },
  { to: '/admin/projects', icon: FolderOpen, label: 'Проекты', end: false },
  { to: '/admin/sprints', icon: TrendingUp, label: 'Спринты', end: false },
  { to: '/admin/content-studio', icon: PenTool, label: 'Content Studio', end: false },
  { to: '/admin/context', icon: Brain, label: 'Контекст AI', end: false },
  { to: '/admin/settings', icon: Settings, label: 'Настройки', end: false },
];

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isAdmin, loading, signOut } = useAuth();

  const isEditorRoute = /\/admin\/posts\/(new|\w+\/edit)/.test(location.pathname);

  // Side effect: log out non-admin users (must run in effect, not in render)
  useEffect(() => {
    if (!loading && isAuthenticated && !isAdmin) {
      signOut();
    }
  }, [loading, isAuthenticated, isAdmin, signOut]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    // Logged-in but not an admin — effect above logs them out.
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await signOut();
    navigate('/auth');
  };

  // Full-width mode for post editor
  if (isEditorRoute) {
    return (
      <div className="min-h-screen bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-56 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="text-sm font-semibold text-foreground">
            Админ-панель
          </Link>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {adminNav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? 'bg-secondary text-foreground font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-2 border-t border-border">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full justify-start gap-2 text-muted-foreground">
            <LogOut className="w-4 h-4" /> Выйти
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
