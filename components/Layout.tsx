import React from 'react';
import { Usuario, Rol } from '../types';
import { LogOut, User, Menu, BookOpen, Database } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: Usuario | null;
  onLogout: () => void;
  onNavigate: (view: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, onNavigate }) => {
  if (!user) return <>{children}</>;

  const canManageData = user.rol === Rol.SUPERUSER || user.rol === Rol.DG || user.rol === Rol.DIRECTOR;

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Rayuela Sidebar */}
      <div className="w-64 bg-rayuela-700 text-white flex flex-col shadow-xl z-20">
        <div className="h-16 flex items-center px-6 bg-rayuela-900 font-bold text-lg tracking-wider border-b border-rayuela-800">
          <BookOpen className="mr-2 h-6 w-6" /> FEOE
        </div>
        
        <div className="flex-1 py-4 overflow-y-auto">
          <div className="px-4 mb-2 text-xs text-rayuela-300 uppercase tracking-wider font-semibold">
            Menú Principal
          </div>
          <nav className="space-y-1 px-2">
            <button 
              onClick={() => onNavigate('DASHBOARD')}
              className="w-full flex items-center px-4 py-2 text-sm font-medium hover:bg-rayuela-600 rounded-md text-white transition-colors text-left"
            >
              <Menu className="mr-3 h-5 w-5" />
              Gestión de Solicitudes
            </button>
            
            {canManageData && (
              <>
                <button 
                  onClick={() => onNavigate('DATA_MANAGEMENT')}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium hover:bg-rayuela-600 rounded-md text-white transition-colors text-left mt-1"
                >
                  <Database className="mr-3 h-5 w-5" />
                  Gestión de Datos
                </button>

                <div className="mt-4 px-4 mb-2 text-xs text-rayuela-300 uppercase tracking-wider font-semibold">
                  Accesos Directos
                </div>
                <button 
                  onClick={() => onNavigate('DATA_CENTROS')}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-rayuela-100 hover:bg-rayuela-600 hover:text-white rounded-md transition-colors opacity-70 text-left"
                >
                  <span className="w-5 mr-3 text-center">•</span>
                  Centros de Trabajo
                </button>
                <button 
                  onClick={() => onNavigate('DATA_ALUMNOS')}
                  className="w-full flex items-center px-4 py-2 text-sm font-medium text-rayuela-100 hover:bg-rayuela-600 hover:text-white rounded-md transition-colors opacity-70 text-left"
                >
                  <span className="w-5 mr-3 text-center">•</span>
                  Alumnado FCT
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
            <div className="ml-3">
              <p className="text-sm font-medium text-white">{user.nombre}</p>
              <p className="text-xs text-rayuela-300 capitalize">{user.rol.toLowerCase().replace('_', ' ')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-800">Gestión de Anexos - Instrucción 34/2025</h1>
          <button 
            onClick={onLogout}
            className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Cerrar Sesión
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};