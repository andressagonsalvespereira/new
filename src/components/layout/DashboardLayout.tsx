
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Users, CreditCard, Settings, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Customers', path: '/customers', icon: Users },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-white pt-5 pb-4 overflow-y-auto border-r border-gray-200">
          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
            <h1 className="text-xl font-bold text-blue-600">MercadoPay</h1>
          </div>
          <div className="mt-5 flex-1 flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-50 text-blue-600'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 flex-shrink-0 h-5 w-5 ${
                        isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <button className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700">
              <LogOut className="mr-3 h-5 w-5 text-gray-400" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="md:hidden bg-white w-full flex items-center px-4 h-14 border-b border-gray-200">
        <h1 className="text-lg font-bold text-blue-600">MercadoPay</h1>
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
