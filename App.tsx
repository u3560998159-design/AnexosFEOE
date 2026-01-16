import React, { useState, useMemo } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { RequestForm } from './components/RequestForm';
import { ReviewPanel } from './components/ReviewPanel';
import { DataManagement } from './components/DataManagement';
import { Usuario, Solicitud, Estado, Centro, Alumno, Rol, TipoAnexo } from './types';
import { USUARIOS_MOCK, SOLICITUDES_INICIALES, CENTROS as INITIAL_CENTROS, ALUMNOS as INITIAL_ALUMNOS, getResolverRole } from './constants';
import { UserCheck } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [requests, setRequests] = useState<Solicitud[]>(SOLICITUDES_INICIALES);
  
  // Estados para CRUD de Centros y Alumnos
  const [centros, setCentros] = useState<Centro[]>(INITIAL_CENTROS);
  const [alumnos, setAlumnos] = useState<Alumno[]>(INITIAL_ALUMNOS);
  const [dataTab, setDataTab] = useState<'CENTROS' | 'ALUMNOS'>('CENTROS');

  const [view, setView] = useState<'DASHBOARD' | 'CREATE' | 'REVIEW' | 'DATA_MANAGEMENT'>('DASHBOARD');
  const [selectedRequest, setSelectedRequest] = useState<Solicitud | null>(null);

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
    
    // Obtenemos el código corto del anexo (ej: "I", "IV-A", "VIII-B")
    // Viene de "Anexo IV-A - Solicitud..." -> split espacio -> índice 1 es "IV-A"
    const anexoCode = partialReq.tipo_anexo?.split(' ')[1] || 'GEN';
    
    // Lógica de Consecutivo por Centro:
    // 1. Filtramos todas las solicitudes de ESTE centro y ESTE año.
    const centerRequests = requests.filter(r => 
        r.codigo_centro === centroCode && 
        r.id.startsWith(`${currentYear}-`)
    );

    // 2. Buscamos el número de secuencia más alto.
    // El formato del ID es: AÑO-CENTRO-TIPO-NUMERO (El tipo puede tener guiones, el número es siempre el último segmento)
    let maxSequence = 0;
    
    centerRequests.forEach(req => {
        const parts = req.id.split('-');
        const lastPart = parts[parts.length - 1]; // El último elemento es la secuencia
        const seq = parseInt(lastPart, 10);
        
        if (!isNaN(seq) && seq > maxSequence) {
            maxSequence = seq;
        }
    });

    // 3. El nuevo número es el máximo encontrado + 1
    const nextSequence = maxSequence + 1;
    
    const newId = `${currentYear}-${centroCode}-${anexoCode}-${nextSequence}`;
    
    const newReq: Solicitud = {
      ...partialReq as Solicitud,
      id: newId,
      fecha_creacion: new Date().toISOString().split('T')[0],
      estado: partialReq.estado || Estado.BORRADOR
    };
    
    setRequests([...requests, newReq]);
    setView('DASHBOARD');
  };

  const handleUpdateRequest = (id: string, updates: Partial<Solicitud>) => {
    setRequests(requests.map(r => r.id === id ? { ...r, ...updates } : r));
    setView('DASHBOARD');
    setSelectedRequest(null);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    setView('DASHBOARD');
    setSelectedRequest(null);
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

  // Cálculo de notificaciones (Solicitudes pendientes para el usuario actual)
  const pendingCount = useMemo(() => {
    if (!currentUser) return 0;
    return requests.filter(req => {
        // Excluir anuladas del conteo de pendientes
        if (req.estado === Estado.ANULADA) return false;

        // Pendiente Anulación solo notifica a SUPERUSER
        if (req.estado === Estado.PENDIENTE_ANULACION) {
            return currentUser.rol === Rol.SUPERUSER;
        }

        const centro = centros.find(c => c.codigo === req.codigo_centro);
        
        // Inspectores: Solo ven PENDIENTE_INSPECCION (Anexos VIII) de su provincia
        if (currentUser.rol === Rol.INSPECTOR) {
            return req.estado === Estado.PENDIENTE_INSPECCION && centro?.provincia === currentUser.provincia;
        }

        // Delegados: Ven PENDIENTE_RESOLUCION pero SOLO los que ellos resuelven (IV_A y VIII) de su provincia
        if (currentUser.rol === Rol.DELEGADO) {
             if (centro?.provincia !== currentUser.provincia) return false;
             if (req.estado !== Estado.PENDIENTE_RESOLUCION) return false;
             return getResolverRole(req.tipo_anexo) === Rol.DELEGADO;
        }

        // DG: Ve PENDIENTE_RESOLUCION de los que él resuelve
        if (currentUser.rol === Rol.DG) {
            if (req.estado !== Estado.PENDIENTE_RESOLUCION) return false;
            return getResolverRole(req.tipo_anexo) === Rol.DG;
        }

        return false;
    }).length;
  }, [requests, currentUser, centros]);

  // --- LOGIN SCREEN ---
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-rayuela-700 mb-2">Gestor FEOE</h1>
            <p className="text-gray-600">Prototipo de Simulación de Perfiles</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {USUARIOS_MOCK.map(u => (
               <button
                 key={u.id}
                 onClick={() => handleLogin(u)}
                 className="flex items-center p-4 border rounded-lg hover:bg-rayuela-50 hover:border-rayuela-500 transition-all group text-left"
               >
                 <div className="h-10 w-10 rounded-full bg-rayuela-100 text-rayuela-700 flex items-center justify-center mr-4 group-hover:bg-rayuela-700 group-hover:text-white transition-colors">
                   <UserCheck className="h-5 w-5" />
                 </div>
                 <div>
                   <p className="font-bold text-gray-800">{u.nombre}</p>
                   <p className="text-xs text-gray-500 uppercase">{u.rol}</p>
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

  // --- MAIN APP ---
  return (
    <Layout user={currentUser} onLogout={handleLogout} onNavigate={handleNavigation} pendingCount={pendingCount}>
      {view === 'DASHBOARD' && (
        <Dashboard 
          user={currentUser} 
          requests={requests}
          centros={centros}
          alumnos={alumnos}
          onNewRequest={() => setView('CREATE')}
          onSelectRequest={openRequest}
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
          onDelete={handleDeleteRequest}
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
    </Layout>
  );
};

export default App;