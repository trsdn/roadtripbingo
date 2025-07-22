import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaIcons, FaCog, FaDownload } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

function Navigation() {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <h1 className="text-xl font-bold text-gray-800">{t('title')}</h1>
          
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaHome className="w-4 h-4" />
              {t('navGenerator')}
            </Link>
            
            <Link
              to="/icons"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/icons') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaIcons className="w-4 h-4" />
              {t('navIconManager')}
            </Link>
            
            <Link
              to="/settings"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/settings') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaCog className="w-4 h-4" />
              Settings
            </Link>
            
            <Link
              to="/backup"
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                isActive('/backup') 
                  ? 'bg-primary-100 text-primary-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaDownload className="w-4 h-4" />
              Backup
            </Link>
            
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm"
            >
              <option value="en">English</option>
              <option value="de">Deutsch</option>
            </select>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Navigation;