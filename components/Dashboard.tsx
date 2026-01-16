import React, { useState, useMemo, useEffect } from 'react';
import { Solicitud, Usuario, Rol, Estado, TipoAnexo, Centro, Alumno } from '../types';
import { Plus, Eye, Clock, ArrowUpDown, ArrowUp, ArrowDown, Search, AlertTriangle, Trash2, Filter, ChevronLeft, ChevronRight, X, AlertCircle } from 'lucide-react';
import { ToastType } from './Toast';

interface DashboardProps {
  user: Usuario;
  requests: Solicitud[];
  centros: Centro[]; 
  alumnos: Alumno[]; 
  onNewRequest: () => void;
  onSelectRequest: (req: Solicitud) => void;
  onDeleteRequest: (id: string) => void;
  showToast: (msg: string, type: ToastType) => void; // Nuevo prop
}

type SortKey = 'id' | 'fecha' | 'centro' | 'tipo' | 'estado';
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 10;

export const Dashboard: React.FC<DashboardProps> = ({ user, requests, centros, alumnos, onNewRequest, onSelectRequest, onDeleteRequest, showToast }) => {
  // --- Lógica de Filtros ---
  const getDefaultFilter = (u: Usuario) => {
    if (u.rol === Rol.INSPECTOR) return Estado.PENDIENTE_INSPECCION;
    if (u.rol === Rol.DG) return Estado.PENDIENTE_RESOLUCION_DG;
    if (u.rol === Rol.DELEGADO) return Estado.PENDIENTE_RESOLUCION_DELEGACION;
    return 'ALL';
  };

  const [filterEstado, setFilterEstado] = useState<string>(getDefaultFilter(user));
  const [filterTipo, setFilterTipo] = useState<string>('ALL');
  const [filterCentroText, setFilterCentroText] = useState('');
  const [filterAlumnoText, setFilterAlumnoText] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fecha', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);

  // --- ESTADO PARA MODAL DE BORRADO ---
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  useEffect(() => {
    setFilterEstado(getDefaultFilter(user));
  }, [user]);

  const getCentro = (code: string) => centros.find(c => c.codigo === code);
  
  const getNombresAlumnos = (ids: string[]) => {
    return alumnos.filter(a => ids.includes(a.dni)).map(a => `${a.nombre} ${a.apellidos}`).join(', ');
  };

  // --- Funciones Auxiliares ---
  const isStaleRequest = (req: Solicitud) => {
      if (req.estado === Estado.RESUELTA_POSITIVA || req.estado === Estado.RESUELTA_NEGATIVA || req.estado === Estado.ANULADA || req.estado === Estado.PAPELERA) return false;
      const lastEntry = req.historial.length > 0 ? req.historial[req.historial.length - 1] : null;
      const dateString = lastEntry ? lastEntry.fecha : req.fecha_creacion;
      const lastDate = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) > 10;
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // --- MANEJADORES DE BORRADO ---
  const handleTrashClick = (e: React.MouseEvent, id: string) => {
      // Detener propagación para evitar entrar en la solicitud
      e.stopPropagation();
      e.preventDefault();
      
      setItemToDelete(id);
      setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
      if (itemToDelete) {
          onDeleteRequest(itemToDelete);
          showToast("Solicitud movida a la papelera", 'SUCCESS');
          setDeleteModalOpen(false);
          setItemToDelete(null);
      }
  };

  const cancelDelete = () => {
      setDeleteModalOpen(false);
      setItemToDelete(null);
  };

  // --- Procesamiento de Datos ---
  const processedRequests = useMemo(() => {
    let result = requests.filter(req => {
      // EXCLUIR PAPELERA DEL DASHBOARD PRINCIPAL
      if (req.estado === Estado.PAPELERA) return false;

      const centro = getCentro(req.codigo_centro);
      
      if (user.rol === Rol.DIRECTOR && req.codigo_centro !== user.codigo_centro) return false;
      if (user.rol === Rol.INSPECTOR && centro?.provincia !== user.provincia) return false;
      if (user.rol === Rol.DELEGADO && centro?.provincia !== user.provincia) return false;

      if (req.estado === Estado.PENDIENTE_ANULACION && user.rol !== Rol.SUPERUSER && req.solicitante_anulacion !== user.id) return false;

      if (filterEstado !== 'ALL' && req.estado !== filterEstado) return false;
      if (filterTipo !== 'ALL' && req.tipo_anexo !== filterTipo) return false;
      if (filterCentroText) {
        const centroStr = centro ? `${centro.nombre} ${centro.localidad}`.toLowerCase() : '';
        if (!centroStr.includes(filterCentroText.toLowerCase())) return false;
      }
      if (filterAlumnoText) {
        const alumnosStr = getNombresAlumnos(req.alumnos_implicados).toLowerCase();
        if (!alumnosStr.includes(filterAlumnoText.toLowerCase())) return false;
      }
      return true;
    });

    result.sort((a, b) => {
      let valA: any = '';
      let valB: any = '';
      switch (sortConfig.key) {
        case 'id': valA = a.id; valB = b.id; break;
        case 'fecha': valA = new Date(a.fecha_creacion).getTime(); valB = new Date(b.fecha_creacion).getTime(); break;
        case 'centro': valA = getCentro(a.codigo_centro)?.nombre || ''; valB = getCentro(b.codigo_centro)?.nombre || ''; break;
        case 'tipo': valA = a.tipo_anexo; valB = b.tipo_anexo; break;
        case 'estado': valA = a.estado; valB = b.estado; break;
      }
      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [requests, user, filterEstado, filterTipo, filterCentroText, filterAlumnoText, sortConfig, centros, alumnos]);

  useEffect(() => { setCurrentPage(1); }, [filterEstado, filterTipo, filterCentroText, filterAlumnoText]);

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = processedRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(processedRequests.length / ITEMS_PER_PAGE);

  const pendingCount = processedRequests.filter(r => {
    if (r.estado === Estado.ANULADA) return false;
    if (user.rol === Rol.SUPERUSER && r.estado === Estado.PENDIENTE_ANULACION) return true;
    if (user.rol === Rol.INSPECTOR) return r.estado === Estado.PENDIENTE_INSPECCION;
    if (user.rol === Rol.DG) return r.estado === Estado.PENDIENTE_RESOLUCION_DG;
    if (user.rol === Rol.DELEGADO) return r.estado === Estado.PENDIENTE_RESOLUCION_DELEGACION;
    return false;
  }).length;

  const getStatusBadge = (estado: Estado) => {
    const styles: Record<string, string> = {
      [Estado.BORRADOR]: "bg-gray-100 text-gray-800",
      [Estado.PENDIENTE_INSPECCION]: "bg-yellow-100 text-yellow-800",
      [Estado.PENDIENTE_RESOLUCION_DG]: "bg-purple-100 text-purple-800",
      [Estado.PENDIENTE_RESOLUCION_DELEGACION]: "bg-indigo-100 text-indigo-800",
      [Estado.RESUELTA_POSITIVA]: "bg-green-100 text-green-800",
      [Estado.RESUELTA_NEGATIVA]: "bg-red-100 text-red-800",
      [Estado.PENDIENTE_ANULACION]: "bg-orange-100 text-orange-800 border border-orange-200",
      [Estado.ANULADA]: "bg-gray-600 text-white line-through"
    };
    
    let displayText = estado.replace(/_/g, ' ');
    if (estado === Estado.PENDIENTE_RESOLUCION_DG) displayText = "PEND. RES. DG";
    if (estado === Estado.PENDIENTE_RESOLUCION_DELEGACION) displayText = "PEND. RES. DELEG.";

    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[estado] || "bg-gray-100"}`}>
        {displayText}
      </span>
    );
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortConfig.key !== colKey) return <ArrowUpDown className="h-3 w-3 text-gray-400 ml-1 inline" />;
    return sortConfig.direction === 'asc' ? <ArrowUp className="h-3 w-3 text-rayuela-700 ml-1 inline" /> : <ArrowDown className="h-3 w-3 text-rayuela-700 ml-1 inline" />;
  };

  return (
    <div className="space-y-6 relative">
      {/* MODAL DE CONFIRMACIÓN DE BORRADO */}
      {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 transform scale-100 transition-transform">
                  <div className="flex items-center text-red-600 mb-4">
                      <AlertCircle className="h-8 w-8 mr-3" />
                      <h3 className="text-lg font-bold">Confirmar Eliminación</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                      ¿Está seguro de que desea mover la solicitud <strong>{itemToDelete}</strong> a la papelera? 
                      <br/><br/>
                      <span className="text-xs text-gray-500">Podrá recuperarla desde la sección de Papelera durante 30 días.</span>
                  </p>
                  <div className="flex justify-end space-x-3">
                      <button 
                          onClick={cancelDelete}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={confirmDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-sm text-sm font-bold flex items-center"
                      >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar
                      </button>
                  </div>
              </div>
          </div>
      )}

      {pendingCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700 font-medium">Tienes <strong>{pendingCount}</strong> solicitudes filtradas pendientes.</p>
          </div>
        </div>
      )}

      <div className="flex justify-end mb-4">
        {user.rol === Rol.DIRECTOR && (
          <button onClick={onNewRequest} className="bg-rayuela-700 hover:bg-rayuela-800 text-white font-bold py-2 px-4 rounded shadow-md flex items-center transition-colors">
            <Plus className="h-4 w-4 mr-2" /> Nueva Solicitud
          </button>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200 flex flex-col">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('fecha')}>ID / Fecha <SortIcon colKey="fecha" /></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center cursor-pointer hover:text-rayuela-700 mb-2" onClick={() => handleSort('centro')}>Centro <SortIcon colKey="centro" /></div>
                  <div className="relative"><input type="text" placeholder="Filtrar centro..." className="w-full text-xs p-1 pl-6 border rounded" value={filterCentroText} onChange={(e) => setFilterCentroText(e.target.value)} /><Search className="h-3 w-3 text-gray-400 absolute left-1.5 top-1.5" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <div className="flex items-center cursor-pointer hover:text-rayuela-700 mb-2" onClick={() => handleSort('tipo')}>Tipo <SortIcon colKey="tipo" /></div>
                   <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="w-full text-xs p-1 border rounded"><option value="ALL">Todos</option>{Object.values(TipoAnexo).map(t => <option key={t} value={t}>{t.split('-')[0] + '-' + t.split('-')[1]}</option>)}</select>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                   <div className="mb-2">Alumnos</div>
                   <div className="relative"><input type="text" placeholder="Buscar..." className="w-full text-xs p-1 pl-6 border rounded" value={filterAlumnoText} onChange={(e) => setFilterAlumnoText(e.target.value)} /><Search className="h-3 w-3 text-gray-400 absolute left-1.5 top-1.5" /></div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center justify-between mb-2">
                     <div className="cursor-pointer hover:text-rayuela-700" onClick={() => handleSort('estado')}>Estado <SortIcon colKey="estado" /></div>
                     {filterEstado !== 'ALL' && <button onClick={() => setFilterEstado('ALL')} className="text-[10px] bg-rayuela-100 text-rayuela-700 px-2 py-0.5 rounded border border-rayuela-300"><Filter className="h-3 w-3 inline" /> Todos</button>}
                  </div>
                  <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className={`w-full text-xs p-1 border rounded ${filterEstado !== 'ALL' ? 'bg-rayuela-50 font-bold' : ''}`}><option value="ALL">Todos</option>{Object.values(Estado).filter(e => e !== Estado.PAPELERA).map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}</select>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedRequests.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">No hay resultados.</td></tr>
              ) : (
                currentItems.map((req) => {
                  const centro = getCentro(req.codigo_centro);
                  const isStale = isStaleRequest(req);
                  const isAnulada = req.estado === Estado.ANULADA;
                  return (
                    <tr key={req.id} className={isAnulada ? "bg-gray-100 text-gray-400" : `hover:bg-gray-50 ${isStale ? 'bg-red-50' : ''}`} onClick={() => onSelectRequest(req)}>
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer">
                         <div className="flex items-center">
                            {isStale && <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />}
                            <div><div className={`text-sm font-medium ${isAnulada ? 'line-through' : 'text-rayuela-700'}`}>{req.id}</div><div className="text-xs opacity-75">{req.fecha_creacion}</div></div>
                         </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer"><div className="text-sm">{centro?.nombre}</div><div className="text-xs">{centro?.localidad}</div></td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer">{req.tipo_anexo.split('(')[0].trim()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm cursor-pointer">{req.alumnos_implicados.length > 0 ? <div className="flex flex-col"><span>{req.alumnos_implicados.length} alumnos</span>{filterAlumnoText && <span className="text-[10px] truncate max-w-[150px]">{getNombresAlumnos(req.alumnos_implicados)}</span>}</div> : <span className="text-xs italic">Sin alumnos</span>}</td>
                      <td className="px-6 py-4 whitespace-nowrap cursor-pointer">{getStatusBadge(req.estado)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                         <div className="flex items-center justify-end space-x-2">
                            {/* BOTÓN DE BORRADO SUPERUSER */}
                            {user.rol === Rol.SUPERUSER && (
                              <button 
                                type="button"
                                onClick={(e) => handleTrashClick(e, req.id)}
                                className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 flex items-center justify-center p-2 rounded shadow-sm transition-colors z-20"
                                title="ELIMINAR SOLICITUD"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                            <button type="button" onClick={(e) => { e.stopPropagation(); onSelectRequest(req); }} className={`${isAnulada ? 'text-gray-500' : 'text-rayuela-700 hover:text-rayuela-900'} flex items-center px-2 py-1 rounded hover:bg-gray-100`}><Eye className="h-4 w-4 mr-1" /> Ver</button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        {processedRequests.length > 0 && (
          <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <p className="text-sm text-gray-700">Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, processedRequests.length)} de {processedRequests.length}</p>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
                  <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};