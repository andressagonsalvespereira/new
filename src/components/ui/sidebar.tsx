
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart,
  Users,
  CreditCard,
  Home,
  LogOut,
  Settings,
  Sliders,
  DollarSign,
  Package,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  href: string;
}

const SidebarItem = ({ icon: Icon, label, href }: SidebarItemProps) => {
  const location = useLocation();
  // Check if current path starts with the href to handle nested routes
  const isActive = location.pathname === href || 
                   (href !== "/" && location.pathname.startsWith(href));

  return (
    <Link
      to={href}
      className={cn(
        "flex items-center py-3 px-4 text-gray-700 rounded-md hover:bg-gray-100 transition-colors duration-200",
        isActive && "bg-gray-100 font-medium"
      )}
    >
      <Icon className="mr-3 h-5 w-5" />
      {label}
    </Link>
  );
};

export const Sidebar = () => {
  return (
    <aside className="w-64 border-r border-gray-200 min-h-screen hidden md:block bg-white">
      <div className="p-4">
        <Link to="/" className="text-xl font-bold flex items-center">
          <CreditCard className="mr-2 h-6 w-6 text-blue-600" />
          Payment Admin
        </Link>
      </div>
      <nav className="mt-6 px-2">
        <div className="space-y-1">
          <SidebarItem icon={Home} label="Home" href="/" />
          <SidebarItem icon={BarChart} label="Dashboard" href="/dashboard" />
          <SidebarItem icon={Users} label="Customers" href="/customers" />
          <SidebarItem icon={CreditCard} label="Payments" href="/payments" />
          <SidebarItem icon={Package} label="Products" href="/admin/products" />
          <SidebarItem icon={ShoppingCart} label="Orders" href="/admin/orders" />
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="px-4 text-xs font-semibold text-gray-500 uppercase mb-2">
            Administration
          </p>
          <div className="space-y-1">
            <SidebarItem icon={DollarSign} label="Payment Settings" href="/admin/settings/payment" />
            <SidebarItem icon={Tag} label="Pixel Settings" href="/admin/pixel-settings" />
            <SidebarItem icon={Settings} label="General Settings" href="/settings" />
          </div>
        </div>
      </nav>
    </aside>
  );
};
