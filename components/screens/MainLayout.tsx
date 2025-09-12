import React from 'react';
import { Outlet, NavLink, useLocation, Link } from 'react-router-dom';
import { MessageSquare, BookOpen, PlusCircle, Star, BarChart3, Settings, User as UserIcon, LogOut, WifiOff } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
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
          <div className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-105 ${isActive ? 'bg-secondary' : 'bg-primary'}`}>
            <item.icon className="text-primary-content" size={32} />
          </div>
        </NavLink>
      );
}

const StandardNavItem: React.FC<{ item: typeof navItems[0] }> = ({ item }) => {
    return (
        <NavLink
        to={item.path}
        className={({ isActive }) =>
          `flex flex-col items-center justify-center space-y-1 w-full pt-2 pb-1 transition-colors ${
            isActive ? 'text-primary' : 'text-text-muted hover:text-primary'
          }`
        }
      >
        <item.icon size={24} />
        <span className="text-xs font-medium">{item.label}</span>
      </NavLink>
    );
}


const MainLayout: React.FC = () => {
    const { user, logout, isOnline } = useData();

    // Split nav items for layout
    const leftItems = navItems.slice(0, 2);
    const centerItem = navItems.find(item => item.isCentral);
    const rightItems = navItems.slice(3, 5);


    return (
        <div className="flex flex-col h-full bg-base-100">
            {!isOnline && (
                <div className="bg-yellow-500 text-yellow-900 text-center p-2 text-sm font-semibold flex items-center justify-center z-50">
                    <WifiOff size={16} className="mr-2" />
                    You are offline. Data will be synced when you reconnect.
                </div>
            )}
            <header className="flex items-center justify-between p-4 bg-base-200 border-b border-base-300">
                <h1 className="text-xl font-bold text-primary">Lingo Mingle</h1>
                 <Dropdown trigger={<span className="text-sm">Hi, {user?.displayName}!</span>}>
                   <Link
                    to="/profile"
                    className="flex items-center w-full px-4 py-2 text-sm text-text-main hover:bg-base-200"
                    role="menuitem"
                  >
                    <UserIcon className="mr-3 h-5 w-5 text-text-muted" />
                    <span>Profile</span>
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center w-full px-4 py-2 text-sm text-text-main hover:bg-base-200"
                    role="menuitem"
                  >
                    <Settings className="mr-3 h-5 w-5 text-text-muted" />
                    <span>Settings</span>
                  </Link>
                   <div className="border-t border-base-300 my-1"></div>
                  <button
                    onClick={logout}
                    className="w-full text-left flex items-center px-4 py-2 text-sm text-text-main hover:bg-base-200"
                    role="menuitem"
                  >
                    <LogOut className="mr-3 h-5 w-5 text-text-muted" />
                    <span>Logout</span>
                  </button>
               </Dropdown>
            </header>

            <main className="flex-grow overflow-y-auto">
                <Outlet />
            </main>

            <footer className="flex-shrink-0 bg-base-200 border-t border-base-300">
                <nav className="flex items-center justify-around max-w-md mx-auto h-16">
                    {leftItems.map(item => <StandardNavItem key={item.path} item={item} />)}
                    {centerItem && <CentralNavItem item={centerItem} />}
                    {rightItems.map(item => <StandardNavItem key={item.path} item={item} />)}
                </nav>
            </footer>
        </div>
    );
};

export default MainLayout;