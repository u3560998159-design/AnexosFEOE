import React, { useState } from 'react';
import { Solicitud, Centro, Estado, Rol } from '../types';
import { Trash2, RotateCcw, AlertTriangle, Search, AlertCircle } from 'lucide-react';

interface RecycleBinProps {
  deletedRequests: Solicitud[];
  centros: Centro[];
  onRestore: (id: string) => void;
  onPermanentDelete: (id: string) => void;
}

export const RecycleBin: React.FC<RecycleBinProps> = ({ deletedRequests, centros, onRestore, onPermanentDelete }) => {
  const [filterText, setFilterText] = useState('');
  
  // Modal states for permanent delete
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const getCentro = (code: string) => centros.find(c => c.codigo === code);

  const filteredRequests = deletedRequests.filter(req => {
      const search = filterText.toLowerCase();
      const centro = getCentro(req.codigo_centro);
      return req.id.toLowerCase().includes(search) || 
             centro?.nombre.toLowerCase().includes(search);
  });

  const handleDeleteClick = (id: string) => {
      setItemToDelete(id);
      setDeleteModalOpen(true);
  };

  const confirmPermanentDelete = () => {
      if (itemToDelete) {
          onPermanentDelete(itemToDelete);
          setDeleteModalOpen(false);
          setItemToDelete(null);
      }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6 border border-gray-200">
         <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Trash2 className="h-6 w-6 mr-2 text-gray-500" /> Papelera de Reciclaje
            </h2>
            <div className="bg-amber-50 text-amber-800 text-xs px-3 py-1 rounded-full border border-amber-200 flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Los elementos se eliminarán automáticamente tras 30 días.
            </div>
         </div>

         <div className="mb-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Buscar en la papelera..." 
                    className="w-full pl-10 pr-4 py-2 border rounded-md text-sm focus:ring-rayuela-500 focus:border-rayuela-500"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value)}
                />
                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Solicitud</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Centro</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha Eliminación</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRequests.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                                La papelera está vacía.
                            </td>
                        </tr>
                    ) : (
                        filteredRequests.map(req => {
                            // Find deletion entry
                            const deleteEntry = [...req.historial].reverse().find(h => h.estado_nuevo === Estado.PAPELERA);
                            const deleteDate = deleteEntry ? new Date(deleteEntry.fecha).toLocaleString() : 'Desconocida';
                            
                            return (
                                <tr key={req.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getCentro(req.codigo_centro)?.nombre}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{deleteDate}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button 
                                            onClick={() => onRestore(req.id)}
                                            className="text-rayuela-600 hover:text-rayuela-900 bg-rayuela-50 hover:bg-rayuela-100 px-3 py-1 rounded inline-flex items-center transition-colors"
                                            title="Restaurar a Borrador"
                                        >
                                            <RotateCcw className="h-4 w-4 mr-1" /> Restaurar
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteClick(req.id)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded inline-flex items-center transition-colors"
                                            title="Eliminar definitivamente"
                                        >
                                            <Trash2 className="h-4 w-4 mr-1" /> Eliminar
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

      {/* Modal Confirmación Borrado Permanente */}
      {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
              <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 border border-gray-200 transform scale-100 transition-transform">
                  <div className="flex items-center text-red-600 mb-4">
                      <AlertCircle className="h-8 w-8 mr-3" />
                      <h3 className="text-lg font-bold">Borrado Definitivo</h3>
                  </div>
                  <p className="text-gray-600 mb-6">
                      ¿Está seguro de eliminar permanentemente la solicitud <strong>{itemToDelete}</strong>?
                      <br/><br/>
                      <span className="text-xs text-red-500 font-bold uppercase">Esta acción no se puede deshacer.</span>
                  </p>
                  <div className="flex justify-end space-x-3">
                      <button 
                          onClick={() => setDeleteModalOpen(false)}
                          className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 text-sm font-medium"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={confirmPermanentDelete}
                          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 shadow-sm text-sm font-bold flex items-center"
                      >
                          <Trash2 className="h-4 w-4 mr-2" /> Eliminar para siempre
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};