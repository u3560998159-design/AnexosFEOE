import React from 'react';
import { Alumno, Centro } from '../types';
import { Plus, Trash2, Database } from 'lucide-react';

interface DataManagementProps {
  centros: Centro[];
  alumnos: Alumno[];
  setCentros: React.Dispatch<React.SetStateAction<Centro[]>>;
  setAlumnos: React.Dispatch<React.SetStateAction<Alumno[]>>;
  activeTab: 'CENTROS' | 'ALUMNOS';
  onTabChange: (tab: 'CENTROS' | 'ALUMNOS') => void;
}

export const DataManagement: React.FC<DataManagementProps> = ({ 
  centros, 
  alumnos, 
  setCentros, 
  setAlumnos,
  activeTab,
  onTabChange
}) => {
  // Forms states
  const [newCentro, setNewCentro] = React.useState<Partial<Centro>>({ codigo: '', nombre: '', localidad: '', provincia: 'Badajoz' });
  const [newAlumno, setNewAlumno] = React.useState<Partial<Alumno>>({ dni: '', nombre: '', apellidos: '', codigo_centro: '', curso: '', grupo: '' });

  const handleAddCentro = () => {
    if (newCentro.codigo && newCentro.nombre) {
      setCentros([...centros, newCentro as Centro]);
      setNewCentro({ codigo: '', nombre: '', localidad: '', provincia: 'Badajoz' });
    }
  };

  const handleDeleteCentro = (codigo: string) => {
    if (confirm("¿Eliminar centro? Esto podría afectar a solicitudes históricas visualmente.")) {
      setCentros(centros.filter(c => c.codigo !== codigo));
    }
  };

  const handleAddAlumno = () => {
    if (newAlumno.dni && newAlumno.nombre && newAlumno.codigo_centro) {
      setAlumnos([...alumnos, newAlumno as Alumno]);
      setNewAlumno({ dni: '', nombre: '', apellidos: '', codigo_centro: '', curso: '', grupo: '' });
    }
  };

  const handleDeleteAlumno = (dni: string) => {
    if (confirm("¿Eliminar alumno?")) {
      setAlumnos(alumnos.filter(a => a.dni !== dni));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <DatabaseIcon className="h-6 w-6 mr-2 text-rayuela-700" /> Gestión de Datos Maestros
        </h2>
        
        <div className="flex space-x-4 border-b mb-6">
            <button 
                onClick={() => onTabChange('CENTROS')}
                className={`pb-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'CENTROS' ? 'border-rayuela-700 text-rayuela-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Centros Educativos
            </button>
            <button 
                onClick={() => onTabChange('ALUMNOS')}
                className={`pb-2 px-4 font-medium text-sm transition-colors border-b-2 ${activeTab === 'ALUMNOS' ? 'border-rayuela-700 text-rayuela-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
                Alumnado FP
            </button>
        </div>

        {activeTab === 'CENTROS' && (
            <div className="space-y-6">
                {/* Add Form */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Código</label>
                        <input type="text" value={newCentro.codigo} onChange={e => setNewCentro({...newCentro, codigo: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Ej: 0600..." />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
                        <input type="text" value={newCentro.nombre} onChange={e => setNewCentro({...newCentro, nombre: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Nombre del centro" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Localidad</label>
                        <input type="text" value={newCentro.localidad} onChange={e => setNewCentro({...newCentro, localidad: e.target.value})} className="w-full border p-2 rounded text-sm" />
                    </div>
                    <button onClick={handleAddCentro} className="bg-rayuela-700 text-white p-2 rounded hover:bg-rayuela-800 flex justify-center items-center">
                        <Plus className="h-5 w-5" /> Añadir
                    </button>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombre</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Localidad</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {centros.map(c => (
                                <tr key={c.codigo}>
                                    <td className="px-4 py-2 text-sm font-mono">{c.codigo}</td>
                                    <td className="px-4 py-2 text-sm">{c.nombre}</td>
                                    <td className="px-4 py-2 text-sm">{c.localidad} ({c.provincia})</td>
                                    <td className="px-4 py-2 text-right">
                                        <button onClick={() => handleDeleteCentro(c.codigo)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        )}

        {activeTab === 'ALUMNOS' && (
            <div className="space-y-6">
                {/* Add Form */}
                <div className="bg-gray-50 p-4 rounded border border-gray-200 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">DNI</label>
                        <input type="text" value={newAlumno.dni} onChange={e => setNewAlumno({...newAlumno, dni: e.target.value})} className="w-full border p-2 rounded text-sm" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Nombre</label>
                        <input type="text" value={newAlumno.nombre} onChange={e => setNewAlumno({...newAlumno, nombre: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Nombre" />
                    </div>
                     <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase">Apellidos</label>
                        <input type="text" value={newAlumno.apellidos} onChange={e => setNewAlumno({...newAlumno, apellidos: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Apellidos" />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Centro</label>
                        <select value={newAlumno.codigo_centro} onChange={e => setNewAlumno({...newAlumno, codigo_centro: e.target.value})} className="w-full border p-2 rounded text-sm">
                             <option value="">Seleccione</option>
                             {centros.map(c => <option key={c.codigo} value={c.codigo}>{c.nombre}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase">Curso</label>
                        <input type="text" value={newAlumno.curso} onChange={e => setNewAlumno({...newAlumno, curso: e.target.value})} className="w-full border p-2 rounded text-sm" placeholder="Ej: 2º DAM" />
                    </div>
                    <button onClick={handleAddAlumno} className="bg-rayuela-700 text-white p-2 rounded hover:bg-rayuela-800 flex justify-center items-center">
                        <Plus className="h-5 w-5" />
                    </button>
                </div>

                {/* List */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">DNI</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Alumno</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Centro</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {alumnos.map(a => {
                                const centro = centros.find(c => c.codigo === a.codigo_centro);
                                return (
                                    <tr key={a.dni}>
                                        <td className="px-4 py-2 text-sm font-mono">{a.dni}</td>
                                        <td className="px-4 py-2 text-sm">{a.apellidos}, {a.nombre}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{centro?.nombre || a.codigo_centro}</td>
                                        <td className="px-4 py-2 text-sm">{a.curso}</td>
                                        <td className="px-4 py-2 text-right">
                                            <button onClick={() => handleDeleteAlumno(a.dni)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

const DatabaseIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
      <path d="M3 5v14c0 1.66 4 3 9 3s 9-1.34 9-3V5"></path>
    </svg>
);