import React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { MessageSquare, BookOpen, PlusCircle, Star, BarChart3, Settings, User as UserIcon, LogOut, WifiOff } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { usePullToRefresh } from '../../hooks/usePullToRefresh';
import PullToRefreshIndicator from '../ui/PullToRefresh';
import Dropdown from '../ui/Dropdown';

const navItems = [
  { path: '/inbox', label: 'Inbox', icon: MessageSquare },
  { path: '/study', label: 'Study', icon: BookOpen },
  { path: '/add', label: 'Add', icon: PlusCircle, isCentral: true },
  { path: '/words', label: 'Words', icon: Star },
  { path: '/stats', label: 'Stats', icon: BarChart3 },
];

const CentralNavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(item.path);
    return (
        <NavLink to={item.path} className="flex-shrink-0 -mt-8" aria-label={item.label}>
          <div className={`
            w-16 h-16 rounded-2xl flex items-center justify-center
            shadow-float hover:shadow-elevated
            transition-all duration-base ease-ios
            active:scale-95 hover:scale-105
            ${isActive ? 'bg-gradient-to-br from-secondary to-accent' : 'bg-gradient-to-br from-primary to-primary-dark'}
          `}>
            <item.icon className="text-primary-content" size={32} strokeWidth={2.5} />
          </div>
        </NavLink>
      );
}

const StandardNavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    const location = useLocation();
    const isActive = location.pathname.startsWith(item.path);
    return (
        <NavLink
        to={item.path}
        className={`flex flex-col items-center justify-center gap-1 w-full py-2
           transition-all duration-base ease-ios
           min-h-touch ${
            isActive
              ? 'text-primary scale-105'
              : 'text-text-muted hover:text-primary active:scale-95'
          }`}
      >
        <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-xs font-semibold">{item.label}</span>
      </NavLink>
    );
}


const MainLayout: React.FC = () => {
    const { user, logout, isOnline, refreshAll } = useData();

    // Pull-to-refresh for mobile
    const { isRefreshing, pullDistance } = usePullToRefresh({
        onRefresh: refreshAll,
        threshold: 80,
    });

    // Split nav items for layout
    const leftItems = navItems.slice(0, 2);
    const centerItem = navItems.find(item => item.isCentral);
    const rightItems = navItems.slice(3, 5);


    return (
        <div className="flex flex-col h-full bg-base-100">
            {/* Pull-to-refresh indicator */}
            <PullToRefreshIndicator
                pullDistance={pullDistance}
                isRefreshing={isRefreshing}
                threshold={80}
            />

            {!isOnline && (
                <div className="bg-warning text-white text-center p-2 text-sm font-semibold flex items-center justify-center z-50 shadow-soft">
                    <WifiOff size={16} className="mr-2" />
                    You are offline. Data will be synced when you reconnect.
                </div>
            )}
            <header className="glass sticky top-0 z-40 flex items-center justify-between px-4 py-3 border-b border-base-300/50">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    Lingo Mingle
                </h1>
                 <Dropdown trigger={<span className="text-sm font-medium text-text-main">Hi, {user?.displayName}!</span>}>
                   <Link
                    to="/profile"
                    className="flex items-center w-full px-4 py-3 text-sm text-text-main hover:bg-base-200 transition-colors duration-base rounded-lg"
                    role="menuitem"
                  >
                    <UserIcon className="mr-3 h-5 w-5 text-text-secondary" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center w-full px-4 py-3 text-sm text-text-main hover:bg-base-200 transition-colors duration-base rounded-lg"
                    role="menuitem"
                  >
                    <Settings className="mr-3 h-5 w-5 text-text-secondary" />
                    <span>Settings</span>
                  </Link>
                   <div className="border-t border-base-300 my-2"></div>
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center px-4 py-3 text-sm text-error hover:bg-base-200 transition-colors duration-base rounded-lg"
                    role="menuitem"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-error" />
                    <span>Logout</span>
                  </button>
               </Dropdown>
            </header>

            <main className="flex-grow overflow-y-auto">
                <Outlet />
            </main>

            <footer className="glass flex-shrink-0 border-t border-base-300/50 sticky bottom-0 z-40">
                <nav className="flex items-center justify-around max-w-md mx-auto h-16 px-2">
                    {leftItems.map(item => <StandardNavItem key={item.path} item={item} />)}
                    {centerItem && <CentralNavItem item={centerItem} />}
                    {rightItems.map(item => <StandardNavItem key={item.path} item={item} />)}
                </nav>
                {/* iOS safe area padding */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </footer>
        </div>
    );
};

export default MainLayout;