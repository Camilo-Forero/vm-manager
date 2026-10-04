import React from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Server, Sun, Moon, LogOut, Shield, User as UserIcon } from "lucide-react";

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/30">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-brand-600 to-indigo-500 bg-clip-text text-transparent">
              IFX Cloud VM Manager
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">Enterprise Virtualization Dashboard</p>
          </div>
        </div>

        {/* Universal Menu Tabs */}
        <nav className="hidden md:flex items-center gap-1">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-300 transition-colors flex items-center gap-2">
            <Server className="w-4 h-4" />
            Main Page
          </button>
        </nav>

        {/* Right Controls: Dark Mode Toggle & User Profile */}
        <div className="flex items-center gap-4">
          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle Theme"
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
          >
            {darkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
          </button>

          {/* User Info & Logout */}
          {user && (
            <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-gray-700">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">{user.name}</div>
                <div className="flex items-center justify-end gap-1 text-xs text-gray-500 dark:text-gray-400">
                  {user.role === "admin" ? (
                    <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Shield className="w-3 h-3" /> Admin
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 font-medium">
                      <UserIcon className="w-3 h-3" /> Client
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
