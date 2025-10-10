import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Code2,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  ListTodo,
} from 'lucide-react';
import { Avatar } from '../ui/avatar';
import { Dropdown } from '../ui/dropdown';
import { logout } from '../../store/slices/authSlice';
import type { RootState } from '../../store/store';
import { cn } from '../../lib/utils';

export function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { path: '/problems', label: 'Problems', icon: <ListTodo className="w-4 h-4" /> },
  ];

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const userMenuItems = [
    {
      label: 'Profile',
      value: 'profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate(`/profile/${user?.name.toLowerCase().replace(/\s+/g, '-')}`),
    },
    {
      label: 'Settings',
      value: 'settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/settings'),
    },
    {
      label: 'Logout',
      value: 'logout',
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
    },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-primary/20 bg-gradient-to-r from-background via-background to-background/95 backdrop-blur-xl shadow-card supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo with Gradient */}
          <Link to="/dashboard" className="flex items-center gap-2 mr-6 group">
            <div className="p-2 rounded-lg bg-gradient-primary shadow-glow transition-smooth group-hover:scale-110">
              <Code2 className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient-primary hidden sm:inline">CodePlatform</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth relative',
                  isActive(link.path)
                    ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                )}
              >
                {link.icon}
                <span>{link.label}</span>
                {isActive(link.path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary" />
                )}
              </Link>
            ))}
          </div>

          {/* Search Bar with Gradient Border on Focus */}
          <div className="hidden lg:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search problems..."
                className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary focus:bg-card transition-smooth shadow-sm focus:shadow-glow-sm"
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Search Icon (Mobile) */}
            <button
              className="lg:hidden p-2 rounded-md text-muted-text hover:text-text hover:bg-muted transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications with Gradient Badge */}
            <button
              className="relative p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-smooth"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Animated Notification Badge */}
              <span className="absolute top-1.5 right-1.5 flex">
                <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-destructive opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-gradient-to-r from-destructive to-warning"></span>
              </span>
            </button>

            {/* User Dropdown with Gradient Ring */}
            {user && (
              <Dropdown
                trigger={
                  <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/50 transition-smooth cursor-pointer group">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-primary rounded-full blur-sm opacity-0 group-hover:opacity-75 transition-smooth" />
                      <Avatar src={null} fallback={user.name} size="sm" className="ring-2 ring-primary/30 ring-offset-2 ring-offset-background relative" />
                    </div>
                    <span className="hidden sm:inline text-sm font-medium text-foreground">
                      {user.name}
                    </span>
                  </div>
                }
                items={userMenuItems}
                align="right"
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation with Gradient */}
      <div className="md:hidden border-t border-primary/20 bg-gradient-to-r from-background/95 via-primary/5 to-background/95 px-4 py-2">
        <div className="flex items-center justify-around">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-smooth relative',
                isActive(link.path)
                  ? 'text-primary bg-primary-subtle'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
              )}
            >
              {link.icon}
              <span>{link.label}</span>
              {isActive(link.path) && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-primary rounded-full" />
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
