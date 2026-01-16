import React, { useState } from 'react';
import { Usuario, Rol } from '../types';
import { LogOut, Menu as MenuIcon, BookOpen, Database, Bell, Trash2, X } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: Usuario | null;
  onLogout: () => void;
  onNavigate: (view: any) => void;
  pendingCount?: number; 
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate, pendingCount = 0 }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return <>{children}</>;

  const canManageData = user.rol === Rol.SUPERUSER || user.rol === Rol.DG || user.rol === Rol.DIRECTOR;
  const isSuperUser = user.rol === Rol.SUPERUSER;

  const handleNavClick = (view: string) => {
    onNavigate(view);
    setIsMobileMenuOpen(false); // Close mobile menu on navigate
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden relative">
      
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Rayuela Sidebar - Responsive */}
      <div className={`
        fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-rayuela-700 text-white flex flex-col shadow-xl z-30
      `}>
        <div className="h-16 flex items-center justify-between px-6 bg-rayuela-900 font-bold text-lg tracking-wider border-b border-rayuela-800">
          <div className="flex items-center">
            <BookOpen className="mr-2 h-6 w-6" /> FEOE
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white">
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2 text-xs text-rayuela-300 uppercase tracking-wider font-semibold">
            Menú Principal
          </div>
          <nav className="space-y-1 px-2">
            <button 
              onClick={() => handleNavClick('DASHBOARD')}
              className="w-full flex items-center px-4 py-2 text-sm font-medium hover:bg-rayuela-600 rounded-md text-white transition-colors text-left"
            >
              <MenuIcon className="mr-3 h-5 w-5" />
              Gestión de Solicitudes
            </button>
            
            {canManageData && (
              <>
                <button 
                  onClick={() => handleNavClick('DATA_MANAGEMENT')}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium hover:bg-rayuela-600 rounded-md text-white transition-colors text-left mt-1"
                >
                  <Database className="mr-3 h-5 w-5" />
                  Gestión de Datos
                </button>

                <div className="mt-4 px-4 mb-2 text-xs text-rayuela-300 uppercase tracking-wider font-semibold">
                  Accesos Directos
                </div>
                <button 
                  onClick={() => handleNavClick('DATA_CENTROS')}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-rayuela-100 hover:bg-rayuela-600 hover:text-white rounded-md transition-colors opacity-70 text-left"
                >
                  <span className="w-5 mr-3 text-center">•</span>
                  Centros de Trabajo
                </button>
                <button 
                  onClick={() => handleNavClick('DATA_ALUMNOS')}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-rayuela-100 hover:bg-rayuela-600 hover:text-white rounded-md transition-colors opacity-70 text-left"
                >
                  <span className="w-5 mr-3 text-center">•</span>
                  Alumnado FP
                </button>
              </>
            )}

            {isSuperUser && (
                <>
                    <div className="mt-4 px-4 mb-2 text-xs text-rayuela-300 uppercase tracking-wider font-semibold">
                         Administración
                    </div>
                    <button 
                        onClick={() => handleNavClick('RECYCLE_BIN')}
                        className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-100 hover:bg-red-800 hover:text-white rounded-md transition-colors opacity-90 text-left"
                    >
                        <Trash2 className="mr-3 h-5 w-5" />
                        Papelera de Reciclaje
                    </button>
                </>
            )}
          </nav>
        </div>

        <div className="p-4 bg-rayuela-800 border-t border-rayuela-600">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-rayuela-500 flex items-center justify-center text-sm font-bold">
                {user.nombre.charAt(0)}
              </div>
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.nombre}</p>
              <p className="text-xs text-rayuela-300 capitalize truncate">{user.rol.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 z-10 border-b border-gray-200">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-500 hover:text-gray-700 mr-3"
            >
              <MenuIcon className="h-6 w-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">Gestión Anexos FEOE</h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
             {/* Notificaciones */}
             <div className="relative group cursor-pointer" title="Solicitudes pendientes de revisar">
                <Bell className="h-6 w-6 text-gray-500 group-hover:text-rayuela-700 transition-colors" />
                {pendingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                        {pendingCount}
                    </span>
                )}
                {pendingCount > 0 && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-gray-200 shadow-lg rounded-md p-3 hidden group-hover:block z-50">
                        <p className="text-sm text-gray-700 font-medium">Tiene {pendingCount} Solicitudes pendientes de revisar.</p>
                    </div>
                )}
             </div>

             <div className="h-6 w-px bg-gray-300 mx-1 sm:mx-2"></div>

             <button 
                onClick={onLogout}
                className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
             >
                <LogOut className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
             </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-4 sm:p-6 w-full">
          {children}
        </main>
      </div>
    </div>
  );
};