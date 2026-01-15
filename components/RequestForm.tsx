import React, { useState } from 'react';
import { Usuario, TipoAnexo, Estado, Solicitud, HistorialEntrada, Alumno, Documento } from '../types';
import { Save, ArrowLeft, Upload, AlertCircle, FileText, Trash2, Eye, Calendar, UserPlus } from 'lucide-react';

interface RequestFormProps {
  user: Usuario;
  alumnos: Alumno[];
  onClose: () => void;
  onSubmit: (newReq: Partial<Solicitud>) => void;
}

const MOTIVOS_ANEXO_I = [
  "Enfermedad, accidente o causas sobrevenidas",
  "Insuficiencia de plazas formativas en el entorno laboral-productivo del centro docente",
  "Movilidad",
  "Realización en sector con funcionamiento productivo incompatible con la fragmentación",
  "Otros"
];

interface TempFile {
  file: File;
  type?: string; // Para Anexo II
}

export const RequestForm: React.FC<RequestFormProps> = ({ user, alumnos, onClose, onSubmit }) => {
  const [tipo, setTipo] = useState<TipoAnexo>(TipoAnexo.ANEXO_I);
  const [selectedAlumnos, setSelectedAlumnos] = useState<string[]>([]);
  
  // Archivos
  const [files, setFiles] = useState<TempFile[]>([]);
  
  // Estados generales de error
  const [error, setError] = useState<string | null>(null);

  // Estados Anexo I
  const [motivo, setMotivo] = useState<string>('');
  const [motivoOtros, setMotivoOtros] = useState<string>('');

  // Estados Anexo II
  const [feoeInicio, setFeoeInicio] = useState('');
  const [feoeFin, setFeoeFin] = useState('');

  const centerAlumnos = alumnos.filter(a => a.codigo_centro === user.codigo_centro);
  const availableToAdd = centerAlumnos.filter(a => !selectedAlumnos.includes(a.dni));

  const handleAddAlumno = (dni: string) => {
    if (dni && !selectedAlumnos.includes(dni)) {
      setSelectedAlumnos([...selectedAlumnos, dni]);
    }
  };

  const handleRemoveAlumno = (dni: string) => {
    setSelectedAlumnos(selectedAlumnos.filter(id => id !== dni));
  };

  const handleAddFile = (e: React.ChangeEvent<HTMLInputElement>, specificType?: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFile = e.target.files[0];
      setFiles(prev => [...prev, { file: newFile, type: specificType }]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleViewFile = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validación Anexo I
    if (tipo === TipoAnexo.ANEXO_I) {
      if (!motivo) {
        setError("Debe seleccionar un motivo para la solicitud de Anexo I.");
        return;
      }
      if (motivo === 'Otros' && !motivoOtros.trim()) {
        setError("Debe especificar el motivo si selecciona 'Otros'.");
        return;
      }
      if (files.length === 0) {
        setError("Para el Anexo I es obligatorio subir documentación justificativa.");
        return;
      }
    }

    // Validación Anexo II
    if (tipo === TipoAnexo.ANEXO_II) {
       if (!feoeInicio || !feoeFin) {
           setError("Para el Anexo II es obligatorio especificar el periodo de FEOE.");
           return;
       }
       if (feoeInicio > feoeFin) {
           setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
           return;
       }
       const hasPlan = files.some(f => f.type === 'PLAN');
       const hasConvenio = files.some(f => f.type === 'CONVENIO');
       
       if (!hasPlan || !hasConvenio) {
           setError("Para el Anexo II es obligatorio subir: 1. Plan individual de formación y 2. Convenio con la empresa.");
           return;
       }
    }

    const initialStatus = tipo === TipoAnexo.ANEXO_IX ? Estado.RESUELTA_POSITIVA : Estado.PENDIENTE_INSPECCION;

    // Crear entrada inicial del historial
    const historialInicial: HistorialEntrada[] = [
      {
        fecha: new Date().toISOString(),
        autor: user.nombre,
        rol: user.rol,
        accion: tipo === TipoAnexo.ANEXO_IX ? "Creación y Resolución Automática" : "Creación y Envío",
        estado_nuevo: initialStatus
      }
    ];

    const finalDocs: Documento[] = files.map(f => ({
        nombre: f.file.name,
        fecha: new Date().toISOString().split('T')[0],
        tipo: f.type,
        url: URL.createObjectURL(f.file) // Guardamos la URL mockeada
    }));

    const newRequest: Partial<Solicitud> = {
      tipo_anexo: tipo,
      codigo_centro: user.codigo_centro!,
      alumnos_implicados: selectedAlumnos,
      estado: initialStatus,
      documentos_adjuntos: finalDocs,
      historial: historialInicial,
      motivo: tipo === TipoAnexo.ANEXO_I ? motivo : undefined,
      motivo_otros: (tipo === TipoAnexo.ANEXO_I && motivo === 'Otros') ? motivoOtros : undefined,
      feoe_inicio: tipo === TipoAnexo.ANEXO_II ? feoeInicio : undefined,
      feoe_fin: tipo === TipoAnexo.ANEXO_II ? feoeFin : undefined,
    };

    onSubmit(newRequest);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-rayuela-700">Nueva Solicitud</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center rounded">
          <AlertCircle className="h-5 w-5 mr-2" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Anexo</label>
          <select 
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value as TipoAnexo);
              // Resetear campos
              setMotivo(''); setMotivoOtros(''); setFiles([]); setFeoeInicio(''); setFeoeFin('');
            }}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-rayuela-500 focus:border-rayuela-500 border p-2"
          >
            {Object.values(TipoAnexo).map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* ANEXO I Fields */}
        {tipo === TipoAnexo.ANEXO_I && (
          <div className="bg-blue-50 p-4 rounded-md border border-blue-100 space-y-4">
            <h3 className="text-sm font-bold text-blue-800">Detalles Anexo I</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de la solicitud <span className="text-red-500">*</span></label>
              <select 
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-rayuela-500 focus:border-rayuela-500 border p-2 text-sm"
              >
                <option value="">-- Seleccione un motivo --</option>
                {MOTIVOS_ANEXO_I.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {motivo === 'Otros' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especifique el motivo <span className="text-red-500">*</span></label>
                <textarea 
                  value={motivoOtros}
                  onChange={(e) => setMotivoOtros(e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-rayuela-500 focus:border-rayuela-500 border p-2 text-sm h-20"
                  placeholder="Describa el motivo..."
                />
              </div>
            )}
          </div>
        )}

        {/* ANEXO II Fields */}
        {tipo === TipoAnexo.ANEXO_II && (
          <div className="bg-purple-50 p-4 rounded-md border border-purple-100 space-y-4">
            <h3 className="text-sm font-bold text-purple-800">Detalles Anexo II (Intensivo)</h3>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio FEOE <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                          type="date" 
                          value={feoeInicio}
                          onChange={(e) => setFeoeInicio(e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 border p-2 text-sm pl-10"
                        />
                        <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fin FEOE <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                          type="date" 
                          value={feoeFin}
                          onChange={(e) => setFeoeFin(e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 border p-2 text-sm pl-10"
                        />
                        <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Student Selection */}
        {tipo !== TipoAnexo.ANEXO_V && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Alumnos</label>
            
            {/* Dropdown de Añadir */}
            <div className="flex gap-2 mb-4">
               <div className="relative flex-1">
                 <select
                   className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-rayuela-500 focus:border-rayuela-500 border p-2 pl-3 text-sm"
                   defaultValue=""
                   onChange={(e) => {
                     if (e.target.value) {
                       handleAddAlumno(e.target.value);
                       e.target.value = "";
                     }
                   }}
                 >
                   <option value="" disabled>-- Seleccione un alumno para añadir --</option>
                   {availableToAdd.map(alumno => (
                     <option key={alumno.dni} value={alumno.dni}>
                       {alumno.apellidos}, {alumno.nombre} ({alumno.curso})
                     </option>
                   ))}
                   {availableToAdd.length === 0 && (
                     <option disabled>No quedan alumnos disponibles</option>
                   )}
                 </select>
               </div>
            </div>

            {/* Lista de Seleccionados */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Alumnos Seleccionados ({selectedAlumnos.length})
              </label>
              {selectedAlumnos.length > 0 ? (
                <ul className="bg-white rounded-md border border-gray-200 divide-y divide-gray-100 max-h-60 overflow-y-auto">
                  {selectedAlumnos.map(dni => {
                    const alumno = centerAlumnos.find(a => a.dni === dni);
                    if (!alumno) return null;
                    return (
                      <li key={dni} className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-rayuela-100 flex items-center justify-center text-rayuela-700 font-bold text-xs mr-3">
                            {alumno.nombre.charAt(0)}{alumno.apellidos.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{alumno.apellidos}, {alumno.nombre}</p>
                            <p className="text-xs text-gray-500">{alumno.curso} • {alumno.dni}</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => handleRemoveAlumno(dni)} 
                          className="text-gray-400 hover:text-red-500 p-1 rounded-full hover:bg-red-50 transition-colors"
                          title="Eliminar de la lista"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-md bg-white">
                  <UserPlus className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 italic">No se han añadido alumnos a la solicitud.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* File Upload Section */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Documentación Adjunta</label>
          
          {tipo === TipoAnexo.ANEXO_II ? (
             <div className="space-y-4 mb-4">
                {/* Specific Uploaders for Anexo II */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-dashed border-purple-300 bg-purple-50 p-4 rounded text-center">
                        <p className="text-xs font-bold text-purple-800 mb-2">1. Plan Individual de Formación <span className="text-red-500">*</span></p>
                        <label className="cursor-pointer bg-white px-3 py-1 border border-purple-200 rounded text-xs font-medium text-purple-700 hover:bg-purple-50">
                             Seleccionar PDF
                             <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAddFile(e, 'PLAN')} />
                        </label>
                    </div>
                    <div className="border border-dashed border-purple-300 bg-purple-50 p-4 rounded text-center">
                        <p className="text-xs font-bold text-purple-800 mb-2">2. Convenio con Empresa <span className="text-red-500">*</span></p>
                        <label className="cursor-pointer bg-white px-3 py-1 border border-purple-200 rounded text-xs font-medium text-purple-700 hover:bg-purple-50">
                             Seleccionar PDF
                             <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAddFile(e, 'CONVENIO')} />
                        </label>
                    </div>
                </div>
             </div>
          ) : (
             <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-6 flex justify-center items-center bg-gray-50 mb-4">
                <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="mt-2 flex text-sm text-gray-600">
                    <label className="cursor-pointer bg-white rounded-md font-medium text-rayuela-600 hover:text-rayuela-500">
                    <span>Subir archivo genérico</span>
                    <input type="file" className="sr-only" onChange={(e) => handleAddFile(e)} />
                    </label>
                </div>
                </div>
            </div>
          )}

          {/* File List */}
          {files.length > 0 ? (
             <ul className="space-y-2">
                 {files.map((f, idx) => (
                     <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                         <div className="flex items-center overflow-hidden">
                             <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                             <div className="truncate">
                                 <span className="text-sm text-gray-800 font-medium truncate">{f.file.name}</span>
                                 {f.type && (
                                     <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                                         {f.type}
                                     </span>
                                 )}
                             </div>
                         </div>
                         <div className="flex items-center ml-2 space-x-1">
                             <button type="button" onClick={() => handleViewFile(f.file)} className="p-1 text-gray-400 hover:text-rayuela-600">
                                 <Eye className="h-4 w-4" />
                             </button>
                             <button type="button" onClick={() => handleRemoveFile(idx)} className="p-1 text-gray-400 hover:text-red-600">
                                 <Trash2 className="h-4 w-4" />
                             </button>
                         </div>
                     </li>
                 ))}
             </ul>
          ) : (
             <p className="text-sm text-gray-500 italic">No se han adjuntado documentos.</p>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="button"
            onClick={onClose}
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none mr-3"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="bg-rayuela-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-rayuela-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rayuela-500"
          >
            <Save className="h-4 w-4 inline mr-2" />
            Crear Solicitud
          </button>
        </div>
      </form>
    </div>
  );
};