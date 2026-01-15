import React, { useState, useMemo } from 'react';
import { Solicitud, Usuario, Rol, Estado, TipoAnexo, Centro, Alumno } from '../types';
import { Plus, Eye, Clock, ArrowUpDown, ArrowUp, ArrowDown, Search } from 'lucide-react';

interface DashboardProps {
  user: Usuario;
  requests: Solicitud[];
  centros: Centro[]; // Nueva prop
  alumnos: Alumno[]; // Nueva prop
  onNewRequest: () => void;
  onSelectRequest: (req: Solicitud) => void;
}

type SortKey = 'id' | 'fecha' | 'centro' | 'tipo' | 'estado';
interface SortConfig {
  key: SortKey;
  direction: 'asc' | 'desc';
}

export const Dashboard: React.FC<DashboardProps> = ({ user, requests, centros, alumnos, onNewRequest, onSelectRequest }) => {
  const [filterEstado, setFilterEstado] = useState<string>('ALL');
  const [filterTipo, setFilterTipo] = useState<string>('ALL');
  
  // Filtros de columna
  const [filterCentroText, setFilterCentroText] = useState('');
  const [filterAlumnoText, setFilterAlumnoText] = useState('');

  // Configuración de ordenación
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'fecha', direction: 'desc' });

  const getCentro = (code: string) => centros.find(c => c.codigo === code);
  
  // Helper para buscar nombres de alumnos usando la lista dinámica
  const getNombresAlumnos = (ids: string[]) => {
    return alumnos.filter(a => ids.includes(a.dni)).map(a => `${a.nombre} ${a.apellidos}`).join(', ');
  };

  const handleSort = (key: SortKey) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ colKey }: { colKey: SortKey }) => {
    if (sortConfig.key !== colKey) return <ArrowUpDown className="h-3 w-3 text-gray-400 ml-1 inline" />;
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="h-3 w-3 text-rayuela-700 ml-1 inline" />
      : <ArrowDown className="h-3 w-3 text-rayuela-700 ml-1 inline" />;
  };

  // Lógica principal de filtrado y ordenación
  const processedRequests = useMemo(() => {
    let result = requests.filter(req => {
      const centro = getCentro(req.codigo_centro);
      // Si el centro no existe (borrado), mostramos la solicitud pero sin datos de centro
      
      // 1. Permisos por Rol
      if (user.rol === Rol.DIRECTOR) {
        if (req.codigo_centro !== user.codigo_centro) return false;
      }
      
      if (user.rol === Rol.INSPECTOR && centro) {
        if (centro.provincia !== user.provincia) return false;
      }

      if (user.rol === Rol.DELEGADO && centro) {
        if (centro.provincia !== user.provincia) return false;
        const isDelegadoType = req.tipo_anexo === TipoAnexo.ANEXO_IV_A || req.tipo_anexo === TipoAnexo.ANEXO_VIII_A;
        if (!isDelegadoType) return false;
      }

      // 2. Filtros de Columna (Selects y Textos)
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

    // 4. Ordenación
    result.sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortConfig.key) {
        case 'id':
          valA = a.id;
          valB = b.id;
          break;
        case 'fecha':
          valA = new Date(a.fecha_creacion).getTime();
          valB = new Date(b.fecha_creacion).getTime();
          break;
        case 'centro':
          valA = getCentro(a.codigo_centro)?.nombre || '';
          valB = getCentro(b.codigo_centro)?.nombre || '';
          break;
        case 'tipo':
          valA = a.tipo_anexo;
          valB = b.tipo_anexo;
          break;
        case 'estado':
          valA = a.estado;
          valB = b.estado;
          break;
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [requests, user, filterEstado, filterTipo, filterCentroText, filterAlumnoText, sortConfig, centros, alumnos]);

  const pendingCount = processedRequests.filter(r => {
    if (user.rol === Rol.INSPECTOR) return r.estado === Estado.PENDIENTE_INSPECCION;
    if (user.rol === Rol.DG || user.rol === Rol.DELEGADO) return r.estado === Estado.PENDIENTE_RESOLUCION;
    return false;
  }).length;

  const getStatusBadge = (estado: Estado) => {
    const styles = {
      [Estado.BORRADOR]: "bg-gray-100 text-gray-800",
      [Estado.CREADA]: "bg-blue-100 text-blue-800",
      [Estado.PENDIENTE_INSPECCION]: "bg-yellow-100 text-yellow-800",
      [Estado.PENDIENTE_RESOLUCION]: "bg-purple-100 text-purple-800",
      [Estado.RESUELTA_POSITIVA]: "bg-green-100 text-green-800",
      [Estado.RESUELTA_NEGATIVA]: "bg-red-100 text-red-800",
    };
    return (
      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[estado]}`}>
        {estado.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Notifications Bar */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md shadow-sm flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-amber-500 mr-2" />
            <p className="text-sm text-amber-700 font-medium">
              Tienes <strong>{pendingCount}</strong> solicitudes filtradas pendientes de tu acción.
            </p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div className="flex justify-end mb-4">
        {user.rol === Rol.DIRECTOR && (
          <button 
            onClick={onNewRequest}
            className="bg-rayuela-700 hover:bg-rayuela-800 text-white font-bold py-2 px-4 rounded shadow-md flex items-center transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* ID / FECHA Header */}
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fecha')}
              >
                <div className="flex items-center h-full">
                  ID / Fecha <SortIcon colKey="fecha" />
                </div>
              </th>

              {/* CENTRO Header con Filtro */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer hover:text-rayuela-700 mb-2"
                  onClick={() => handleSort('centro')}
                >
                  Centro <SortIcon colKey="centro" />
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Filtrar centro..." 
                    className="w-full text-xs p-1 pl-6 border rounded font-normal text-gray-700 focus:outline-none focus:border-rayuela-500"
                    value={filterCentroText}
                    onChange={(e) => setFilterCentroText(e.target.value)}
                  />
                  <Search className="h-3 w-3 text-gray-400 absolute left-1.5 top-1.5" />
                </div>
              </th>

              {/* TIPO ANEXO Header con Filtro */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer hover:text-rayuela-700 mb-2"
                  onClick={() => handleSort('tipo')}
                >
                  Tipo Anexo <SortIcon colKey="tipo" />
                </div>
                <select 
                  value={filterTipo}
                  onChange={(e) => setFilterTipo(e.target.value)}
                  className="w-full text-xs p-1 border rounded font-normal text-gray-700 focus:outline-none focus:border-rayuela-500"
                >
                  <option value="ALL">Todos los Anexos</option>
                  {Object.values(TipoAnexo).map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </th>

              {/* ALUMNOS Header con Filtro */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                 <div className="flex items-center mb-2">
                  Alumnos
                </div>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Buscar alumno..." 
                    className="w-full text-xs p-1 pl-6 border rounded font-normal text-gray-700 focus:outline-none focus:border-rayuela-500"
                    value={filterAlumnoText}
                    onChange={(e) => setFilterAlumnoText(e.target.value)}
                  />
                  <Search className="h-3 w-3 text-gray-400 absolute left-1.5 top-1.5" />
                </div>
              </th>

              {/* ESTADO Header con Filtro */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div 
                  className="flex items-center cursor-pointer hover:text-rayuela-700 mb-2"
                  onClick={() => handleSort('estado')}
                >
                  Estado <SortIcon colKey="estado" />
                </div>
                <select 
                  value={filterEstado}
                  onChange={(e) => setFilterEstado(e.target.value)}
                  className="w-full text-xs p-1 border rounded font-normal text-gray-700 focus:outline-none focus:border-rayuela-500"
                >
                  <option value="ALL">Todos los Estados</option>
                  {Object.values(Estado).map(e => <option key={e} value={e}>{e.replace(/_/g, ' ')}</option>)}
                </select>
              </th>

              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedRequests.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 text-sm">
                  No hay solicitudes que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              processedRequests.map((req) => {
                const centro = getCentro(req.codigo_centro);
                return (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-rayuela-700">{req.id}</div>
                      <div className="text-xs text-gray-500">{req.fecha_creacion}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{centro?.nombre || 'Desconocido'}</div>
                      <div className="text-xs text-gray-500">{centro?.localidad || ''}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {req.tipo_anexo.split('(')[0].trim()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {req.alumnos_implicados.length > 0 ? (
                        <div className="flex flex-col">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 w-fit mb-1">
                            {req.alumnos_implicados.length} alumnos
                          </span>
                          {filterAlumnoText && (
                              <span className="text-[10px] text-rayuela-600 truncate max-w-[150px]">
                                {getNombresAlumnos(req.alumnos_implicados)}
                              </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Sin alumnos</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(req.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => onSelectRequest(req)}
                        className="text-rayuela-700 hover:text-rayuela-900 flex items-center justify-end w-full"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};