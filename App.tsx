import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RequestForm } from './components/RequestForm';
import { ReviewPanel } from './components/ReviewPanel';
import { DataManagement } from './components/DataManagement';
import { RecycleBin } from './components/RecycleBin';
import { Toast, ToastType } from './components/Toast';
import { Usuario, Solicitud, Estado, Centro, Alumno, Rol, TipoAnexo } from './types';
import { USUARIOS_MOCK, SOLICITUDES_INICIALES, CENTROS as INITIAL_CENTROS, ALUMNOS as INITIAL_ALUMNOS } from './constants';
import { UserCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [requests, setRequests] = useState<Solicitud[]>(SOLICITUDES_INICIALES);
  
  const [centros, setCentros] = useState<Centro[]>(INITIAL_CENTROS);
  const [alumnos, setAlumnos] = useState<Alumno[]>(INITIAL_ALUMNOS);
  const [dataTab, setDataTab] = useState<'CENTROS' | 'ALUMNOS'>('CENTROS');

  const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'REVIEW' | 'DATA_MANAGEMENT' | 'RECYCLE_BIN'>('DASHBOARD');
  const [selectedRequest, setSelectedRequest] = useState<Solicitud | null>(null);

  const [toast, setToast] = useState<{ message: string, type: ToastType, isVisible: boolean }>({ 
      message: '', type: 'SUCCESS', isVisible: false 
  });

  const showToast = (message: string, type: ToastType) => {
      setToast({ message, type, isVisible: true });
  };

  const handleLogin = (user: Usuario) => {
    setCurrentUser(user);
    setView('DASHBOARD');
    setSelectedRequest(null);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('DASHBOARD');
  };

  const handleCreateRequest = (partialReq: Partial<Solicitud>) => {
    const centroCode = currentUser?.codigo_centro || '00000000';
    const currentYear = new Date().getFullYear();
    
    const anexoCode = partialReq.tipo_anexo?.split(' ')[1] || 'GEN';
    
    const centerRequests = requests.filter(r => 
        r.codigo_centro === centroCode && 
        r.id.startsWith(`${currentYear}-`)
    );

    let maxSequence = 0;
    centerRequests.forEach(req => {
        const parts = req.id.split('-');
        const lastPart = parts[parts.length - 1]; 
        const seq = parseInt(lastPart, 10);
        if (!isNaN(seq) && seq > maxSequence) {
            maxSequence = seq;
        }
    });

    const nextSequence = maxSequence + 1;
    const newId = `${currentYear}-${centroCode}-${anexoCode}-${nextSequence}`;
    
    const newReq: Solicitud = {
      ...partialReq as Solicitud,
      id: newId,
      fecha_creacion: new Date().toISOString().split('T')[0],
      estado: partialReq.estado || Estado.BORRADOR
    };
    
    setRequests([...requests, newReq]);
    showToast("Solicitud creada con éxito", 'SUCCESS');
    setView('DASHBOARD');
  };

  const handleUpdateRequest = (id: string, updates: Partial<Solicitud>) => {
    setRequests(requests.map(r => r.id === id ? { ...r, ...updates } : r));
    showToast("Solicitud actualizada", 'SUCCESS');
    setView('DASHBOARD');
    setSelectedRequest(null);
  };

  const handleSoftDeleteRequest = (id: string) => {
      const target = requests.find(r => r.id === id);
      if(!target) return;

      const deleteEntry = {
          fecha: new Date().toISOString(),
          autor: currentUser?.nombre || 'Desconocido',
          rol: currentUser?.rol || Rol.SUPERUSER,
          accion: "Borrado (Papelera)",
          estado_nuevo: Estado.PAPELERA,
          observaciones: "Eliminado al contenedor de reciclaje"
      };

      setRequests(requests.map(r => r.id === id ? { 
          ...r, 
          estado: Estado.PAPELERA,
          historial: [...r.historial, deleteEntry]
      } : r));
      
      setSelectedRequest(null);
      setView('DASHBOARD');
  };

  const handleRestoreRequest = (id: string) => {
      const target = requests.find(r => r.id === id);
      if(!target) return;
      
      const restoreEntry = {
          fecha: new Date().toISOString(),
          autor: currentUser?.nombre || 'Desconocido',
          rol: currentUser?.rol || Rol.SUPERUSER,
          accion: "Restauración",
          estado_nuevo: Estado.BORRADOR,
          observaciones: "Recuperado de la papelera"
      };

      setRequests(requests.map(r => r.id === id ? { 
          ...r, 
          estado: Estado.BORRADOR,
          historial: [...r.historial, restoreEntry]
      } : r));

      showToast("Solicitud restaurada a Borrador", 'SUCCESS');
  };

  const handlePermanentDelete = (id: string) => {
      setRequests(prev => prev.filter(r => r.id !== id));
      showToast("Solicitud eliminada permanentemente", 'WARNING');
  };

  const openRequest = (req: Solicitud) => {
    setSelectedRequest(req);
    setView('REVIEW');
  };

  const handleNavigation = (destination: string) => {
    if (destination === 'DATA_CENTROS') {
      setDataTab('CENTROS');
      setView('DATA_MANAGEMENT');
    } else if (destination === 'DATA_ALUMNOS') {
      setDataTab('ALUMNOS');
      setView('DATA_MANAGEMENT');
    } else {
      setView(destination as any);
    }
  };

  const pendingCount = useMemo(() => {
    if (!currentUser) return 0;
    return requests.filter(req => {
        if (req.estado === Estado.ANULADA || req.estado === Estado.PAPELERA) return false;
        if (req.estado === Estado.PENDIENTE_ANULACION) {
            return currentUser.rol === Rol.SUPERUSER;
        }

        const centro = centros.find(c => c.codigo === req.codigo_centro);
        
        if (currentUser.rol === Rol.INSPECTOR) {
            return req.estado === Estado.PENDIENTE_INSPECCION && centro?.provincia === currentUser.provincia;
        }
        if (currentUser.rol === Rol.DELEGADO) {
             if (centro?.provincia !== currentUser.provincia) return false;
             return req.estado === Estado.PENDIENTE_RESOLUCION_DELEGACION;
        }
        if (currentUser.rol === Rol.DG) {
            return req.estado === Estado.PENDIENTE_RESOLUCION_DG;
        }

        return false;
    }).length;
  }, [requests, currentUser, centros]);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-rayuela-700 mb-2">Gestor FEOE</h1>
            <p className="text-gray-600">Prototipo de Simulación de Perfiles</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {USUARIOS_MOCK.map(u => (
               <button
                 key={u.id}
                 onClick={() => handleLogin(u)}
                 className="flex items-center p-4 border rounded-lg hover:bg-rayuela-50 hover:border-rayuela-500 transition-all group text-left"
               >
                 <div className="h-10 w-10 flex-shrink-0 rounded-full bg-rayuela-100 text-rayuela-700 flex items-center justify-center mr-4 group-hover:bg-rayuela-700 group-hover:text-white transition-colors">
                   <UserCheck className="h-5 w-5" />
                 </div>
                 <div className="overflow-hidden">
                   <p className="font-bold text-gray-800 truncate">{u.nombre}</p>
                   <p className="text-xs text-gray-500 uppercase truncate">{u.rol}</p>
                 </div>
               </button>
             ))}
          </div>
          <p className="mt-8 text-center text-xs text-gray-400">
            Seleccione un usuario para simular la sesión.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
        <Layout user={currentUser} onLogout={handleLogout} onNavigate={handleNavigation} pendingCount={pendingCount}>
        {view === 'DASHBOARD' && (
            <Dashboard 
            user={currentUser} 
            requests={requests}
            centros={centros}
            alumnos={alumnos}
            onNewRequest={() => setView('CREATE')}
            onSelectRequest={openRequest}
            onDeleteRequest={handleSoftDeleteRequest}
            showToast={showToast}
            />
        )}

        {view === 'CREATE' && (
            <RequestForm 
            user={currentUser}
            alumnos={alumnos}
            centros={centros}
            onClose={() => setView('DASHBOARD')}
            onSubmit={handleCreateRequest}
            />
        )}

        {view === 'REVIEW' && selectedRequest && (
            <ReviewPanel 
            user={currentUser}
            request={selectedRequest}
            alumnos={alumnos}
            centros={centros}
            onClose={() => setView('DASHBOARD')}
            onUpdate={handleUpdateRequest}
            onDelete={handleSoftDeleteRequest}
            showToast={showToast}
            />
        )}

        {view === 'DATA_MANAGEMENT' && (
            <DataManagement 
            centros={centros}
            alumnos={alumnos}
            setCentros={setCentros}
            setAlumnos={setAlumnos}
            activeTab={dataTab}
            onTabChange={setDataTab}
            />
        )}

        {view === 'RECYCLE_BIN' && (
            <RecycleBin 
                deletedRequests={requests.filter(r => r.estado === Estado.PAPELERA)}
                centros={centros}
                onRestore={handleRestoreRequest}
                onPermanentDelete={handlePermanentDelete}
            />
        )}
        </Layout>
        
        <Toast 
            message={toast.message} 
            type={toast.type} 
            isVisible={toast.isVisible} 
            onClose={() => setToast(prev => ({ ...prev, isVisible: false }))} 
        />
    </>
  );
};

export default App;