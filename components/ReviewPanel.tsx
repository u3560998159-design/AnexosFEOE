import React, { useState } from 'react';
import { Solicitud, Usuario, Rol, Estado, HistorialEntrada, TipoAnexo, Documento, Alumno, Centro } from '../types';
import { getResolverRole } from '../constants';
import { CheckCircle, XCircle, FileText, ArrowLeft, Send, History, User, ShieldAlert, Edit, Save, Trash2, Upload, AlertCircle, Eye, Calendar, UserPlus } from 'lucide-react';

interface ReviewPanelProps {
  request: Solicitud;
  user: Usuario;
  alumnos: Alumno[];
  centros: Centro[];
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Solicitud>) => void;
}

const MOTIVOS_ANEXO_I = [
  "Enfermedad, accidente o causas sobrevenidas",
  "Insuficiencia de plazas formativas en el entorno laboral-productivo del centro docente",
  "Movilidad",
  "Realización en sector con funcionamiento productivo incompatible con la fragmentación",
  "Otros"
];

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ request, user, alumnos: allAlumnos, centros, onClose, onUpdate }) => {
  const [observaciones, setObservaciones] = useState('');
  
  // Modos de Edición (Director)
  const [isEditing, setIsEditing] = useState(false);
  const [editAlumnos, setEditAlumnos] = useState<string[]>(request.alumnos_implicados);
  const [editDocs, setEditDocs] = useState<Documento[]>(request.documentos_adjuntos);
  const [newFiles, setNewFiles] = useState<{file: File, type?: string}[]>([]);
  const [editMotivo, setEditMotivo] = useState<string>(request.motivo || '');
  const [editMotivoOtros, setEditMotivoOtros] = useState<string>(request.motivo_otros || '');
  const [editFeoeInicio, setEditFeoeInicio] = useState(request.feoe_inicio || '');
  const [editFeoeFin, setEditFeoeFin] = useState(request.feoe_fin || '');
  
  // Admin states
  const [adminTargetState, setAdminTargetState] = useState<Estado>(request.estado);
  const [adminReason, setAdminReason] = useState('');

  const centro = centros.find(c => c.codigo === request.codigo_centro);
  const alumnosSolicitud = allAlumnos.filter(a => request.alumnos_implicados.includes(a.dni));
  const availableAlumnos = allAlumnos.filter(a => a.codigo_centro === request.codigo_centro);
  const unselectedEditAlumnos = availableAlumnos.filter(a => !editAlumnos.includes(a.dni));

  const canInspect = user.rol === Rol.INSPECTOR && request.estado === Estado.PENDIENTE_INSPECCION;
  
  const targetResolver = getResolverRole(request.tipo_anexo);
  const isTargetResolver = targetResolver === user.rol;
  
  const canResolve = request.estado === Estado.PENDIENTE_RESOLUCION && 
                     (user.rol === Rol.DG || user.rol === Rol.DELEGADO || user.rol === Rol.SUPERUSER) &&
                     (user.rol === Rol.SUPERUSER || isTargetResolver);
  
  const isSuperUser = user.rol === Rol.SUPERUSER;
  const isDirector = user.rol === Rol.DIRECTOR && user.codigo_centro === request.codigo_centro;
  const canEdit = isDirector && request.estado !== Estado.RESUELTA_POSITIVA && request.estado !== Estado.RESUELTA_NEGATIVA;

  const createHistoryEntry = (accion: string, nuevoEstado: Estado, obs?: string): HistorialEntrada => ({
    fecha: new Date().toISOString(),
    autor: user.nombre,
    rol: user.rol,
    accion,
    estado_nuevo: nuevoEstado,
    observaciones: obs
  });

  const handleInspection = (favorable: boolean) => {
    if (!observaciones && !favorable) {
      alert("Debe indicar observaciones si el informe es desfavorable.");
      return;
    }
    const nuevoEstado = favorable ? Estado.PENDIENTE_RESOLUCION : Estado.RESUELTA_NEGATIVA;
    const accion = favorable ? "Informe Favorable de Inspección" : "Informe Desfavorable de Inspección";

    onUpdate(request.id, {
      estado: nuevoEstado,
      observaciones_inspeccion: observaciones, 
      historial: [...request.historial, createHistoryEntry(accion, nuevoEstado, observaciones)]
    });
    onClose();
  };

  const handleResolution = (approved: boolean) => {
    const nuevoEstado = approved ? Estado.RESUELTA_POSITIVA : Estado.RESUELTA_NEGATIVA;
    const accion = approved ? "Resolución Estimatoria" : "Resolución Desestimatoria";

    onUpdate(request.id, {
      estado: nuevoEstado,
      observaciones_resolucion: observaciones,
      autor_resolucion: user.nombre,
      historial: [...request.historial, createHistoryEntry(accion, nuevoEstado, observaciones)]
    });
    onClose();
  };
  
  const handleSaveChanges = () => {
    // Validaciones
    if (request.tipo_anexo === TipoAnexo.ANEXO_I) {
       if (!editMotivo) { alert("Motivo obligatorio."); return; }
       if (editMotivo === 'Otros' && !editMotivoOtros) { alert("Especifique 'Otros'."); return; }
    }
    
    if (request.tipo_anexo === TipoAnexo.ANEXO_II) {
       if (!editFeoeInicio || !editFeoeFin) { alert("Periodo FEOE obligatorio."); return; }
    }

    const processedNewDocs: Documento[] = newFiles.map(f => ({ 
        nombre: f.file.name, 
        fecha: new Date().toISOString().split('T')[0],
        tipo: f.type,
        url: URL.createObjectURL(f.file)
    }));

    const finalDocs = [...editDocs, ...processedNewDocs];

    onUpdate(request.id, {
      alumnos_implicados: editAlumnos,
      documentos_adjuntos: finalDocs,
      motivo: editMotivo,
      motivo_otros: editMotivoOtros,
      feoe_inicio: editFeoeInicio,
      feoe_fin: editFeoeFin,
      historial: [...request.historial, createHistoryEntry("Modificación (Subsanación)", request.estado, "Datos modificados por el director.")]
    });
    setIsEditing(false);
  };

  const addEditAlumno = (dni: string) => {
    if (dni && !editAlumnos.includes(dni)) {
      setEditAlumnos([...editAlumnos, dni]);
    }
  };

  const removeEditAlumno = (dni: string) => {
    setEditAlumnos(editAlumnos.filter(id => id !== dni));
  };

  const removeExistingDoc = (index: number) => {
    if(confirm("¿Seguro que quiere eliminar este documento?")) {
        const newDocs = [...editDocs];
        newDocs.splice(index, 1);
        setEditDocs(newDocs);
    }
  };

  const viewDocument = (doc: Documento) => {
      if (doc.url) {
          window.open(doc.url, '_blank');
      } else {
          alert(`Simulación: Visualizando documento "${doc.nombre}". En un entorno real se abriría el PDF.`);
      }
  };

  const handleAddNewFile = (e: React.ChangeEvent<HTMLInputElement>, type?: string) => {
      if(e.target.files?.[0]) {
          setNewFiles([...newFiles, { file: e.target.files[0], type }]);
      }
  };

  const handleAdminChange = () => {
    if (!adminReason) { alert("Indique motivo."); return; }
    if (adminTargetState === request.estado) return;

    onUpdate(request.id, {
        estado: adminTargetState,
        historial: [...request.historial, createHistoryEntry("Cambio Admin", adminTargetState, adminReason)]
    });
    onClose();
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{request.tipo_anexo}</h2>
          <p className="text-sm text-gray-500">ID: {request.id} | {centro?.nombre || 'Centro Desconocido'}</p>
        </div>
        <div className="flex items-center space-x-3">
            {canEdit && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center text-rayuela-700 font-medium hover:bg-rayuela-50 px-3 py-1 rounded border border-rayuela-200 transition-colors">
                    <Edit className="h-4 w-4 mr-1" /> Editar
                </button>
            )}
            {isEditing && (
                 <div className="flex items-center space-x-2">
                     <button onClick={() => setIsEditing(false)} className="text-gray-500 text-sm hover:text-gray-700 px-2">Cancelar</button>
                     <button onClick={handleSaveChanges} className="flex items-center bg-rayuela-700 text-white font-medium px-4 py-1.5 rounded hover:bg-rayuela-800 transition-colors shadow-sm text-sm">
                        <Save className="h-4 w-4 mr-1" /> Guardar
                     </button>
                 </div>
            )}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 flex items-center ml-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Volver
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Data */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* FEOE Periodo (Anexo II) */}
          {(request.tipo_anexo === TipoAnexo.ANEXO_II || isEditing) && request.tipo_anexo === TipoAnexo.ANEXO_II && (
             <section className="bg-purple-50 border border-purple-100 p-4 rounded-md">
                 <h3 className="text-sm font-semibold text-purple-800 uppercase tracking-wider mb-3 flex items-center">
                     <Calendar className="h-4 w-4 mr-2" /> Periodo FEOE
                 </h3>
                 {isEditing ? (
                     <div className="grid grid-cols-2 gap-4">
                         <div>
                             <label className="block text-xs text-gray-500 mb-1">Inicio</label>
                             <input type="date" value={editFeoeInicio} onChange={e => setEditFeoeInicio(e.target.value)} className="w-full text-sm border p-1 rounded" />
                         </div>
                         <div>
                             <label className="block text-xs text-gray-500 mb-1">Fin</label>
                             <input type="date" value={editFeoeFin} onChange={e => setEditFeoeFin(e.target.value)} className="w-full text-sm border p-1 rounded" />
                         </div>
                     </div>
                 ) : (
                     <div className="text-sm text-purple-900 font-medium">
                         Del {request.feoe_inicio || '---'} al {request.feoe_fin || '---'}
                     </div>
                 )}
             </section>
          )}

          {/* Motivo (Anexo I) */}
          {request.tipo_anexo === TipoAnexo.ANEXO_I && (
             <section className="bg-blue-50 border border-blue-100 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-blue-800 uppercase tracking-wider mb-2">Motivo</h3>
                {isEditing ? (
                  <div className="space-y-3">
                      <select value={editMotivo} onChange={(e) => setEditMotivo(e.target.value)} className="w-full text-sm border p-2 rounded">
                         <option value="">-- Seleccionar --</option>
                         {MOTIVOS_ANEXO_I.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      {editMotivo === 'Otros' && <textarea value={editMotivoOtros} onChange={(e) => setEditMotivoOtros(e.target.value)} className="w-full text-sm border p-2 rounded" placeholder="Especifique..." />}
                  </div>
                ) : (
                  <div className="text-sm text-blue-900">
                      <p className="font-medium">{request.motivo}</p>
                      {request.motivo === 'Otros' && <p className="italic">"{request.motivo_otros}"</p>}
                  </div>
                )}
             </section>
          )}

          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Alumnos ({isEditing ? editAlumnos.length : alumnosSolicitud.length})</h3>
            {isEditing ? (
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <div className="mb-3">
                        <select 
                            className="w-full text-sm border p-2 rounded focus:ring-rayuela-500 focus:border-rayuela-500"
                            defaultValue=""
                            onChange={(e) => {
                                if(e.target.value) {
                                    addEditAlumno(e.target.value);
                                    e.target.value = "";
                                }
                            }}
                        >
                            <option value="" disabled>-- Añadir alumno a la lista --</option>
                            {unselectedEditAlumnos.map(a => (
                                <option key={a.dni} value={a.dni}>{a.apellidos}, {a.nombre} ({a.curso})</option>
                            ))}
                            {unselectedEditAlumnos.length === 0 && <option disabled>No hay alumnos disponibles</option>}
                        </select>
                    </div>

                    <div className="space-y-2">
                        {editAlumnos.map(dni => {
                            const a = availableAlumnos.find(al => al.dni === dni);
                            if(!a) return null;
                            return (
                                <div key={dni} className="flex justify-between items-center bg-white p-2 rounded border shadow-sm">
                                    <div className="flex items-center">
                                         <div className="h-6 w-6 rounded-full bg-rayuela-100 flex items-center justify-center text-[10px] text-rayuela-700 font-bold mr-2">
                                            {a.nombre.charAt(0)}{a.apellidos.charAt(0)}
                                         </div>
                                         <div className="text-sm">
                                            <div className="font-medium text-gray-900">{a.apellidos}, {a.nombre}</div>
                                            <div className="text-xs text-gray-500">{a.curso}</div>
                                         </div>
                                    </div>
                                    <button onClick={() => removeEditAlumno(dni)} className="text-gray-400 hover:text-red-600 p-1 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            );
                        })}
                        {editAlumnos.length === 0 && (
                            <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-md bg-white">
                                <UserPlus className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                                <p className="text-xs text-gray-400">Sin alumnos</p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <ul className="bg-white border rounded-md divide-y">
                    {alumnosSolicitud.length > 0 ? alumnosSolicitud.map(a => (
                      <li key={a.dni} className="px-4 py-3 text-sm flex justify-between">
                        <span>{a.apellidos}, {a.nombre}</span><span className="text-gray-500">{a.curso}</span>
                      </li>
                    )) : <li className="px-4 py-3 text-sm text-gray-500 italic">Sin alumnos asignados.</li>}
                </ul>
            )}
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Documentos</h3>
            <div className="space-y-2">
                {/* Existing Docs */}
                {(!isEditing ? request.documentos_adjuntos : editDocs).map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded border text-sm">
                        <div className="flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-400" />
                            <span className="font-medium text-gray-700">{doc.nombre}</span>
                            {doc.tipo && <span className="ml-2 bg-purple-100 text-purple-700 text-[10px] px-1 rounded font-bold">{doc.tipo}</span>}
                        </div>
                        <div className="flex space-x-1">
                            <button onClick={() => viewDocument(doc)} className="text-gray-500 hover:text-rayuela-600 p-1"><Eye className="h-4 w-4" /></button>
                            {isEditing && (
                                <button onClick={() => removeExistingDoc(idx)} className="text-gray-500 hover:text-red-600 p-1"><Trash2 className="h-4 w-4" /></button>
                            )}
                        </div>
                    </div>
                ))}
                
                {/* New Files Pending Upload */}
                {isEditing && newFiles.map((nf, idx) => (
                    <div key={`new-${idx}`} className="flex items-center justify-between px-3 py-2 bg-green-50 rounded border border-green-200 text-sm">
                        <span className="text-green-700 flex items-center">
                            <Upload className="h-3 w-3 mr-2" /> {nf.file.name} {nf.type && `(${nf.type})`}
                        </span>
                        <button onClick={() => setNewFiles(newFiles.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                ))}

                {isEditing && (
                    <div className="flex gap-2 mt-2">
                         <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-xs flex items-center border">
                            <Upload className="h-3 w-3 mr-1" /> Añadir Archivo
                            <input type="file" className="hidden" onChange={(e) => handleAddNewFile(e)} />
                         </label>
                         {request.tipo_anexo === TipoAnexo.ANEXO_II && (
                             <>
                                <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs flex items-center border border-purple-200">
                                    + Plan
                                    <input type="file" className="hidden" onChange={(e) => handleAddNewFile(e, 'PLAN')} />
                                </label>
                                <label className="cursor-pointer bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1 rounded text-xs flex items-center border border-purple-200">
                                    + Convenio
                                    <input type="file" className="hidden" onChange={(e) => handleAddNewFile(e, 'CONVENIO')} />
                                </label>
                             </>
                         )}
                    </div>
                )}
            </div>
          </section>

          {/* Timeline */}
          <section className="border-t pt-4">
               <div className="flex items-center mb-4"><History className="h-5 w-5 text-gray-400 mr-2" /><h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Historial</h3></div>
               <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pb-2">
                 {request.historial?.map((entry, idx) => (
                   <div key={idx} className="relative pl-8">
                     <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-white border-2 border-rayuela-500"></div>
                     <div className="flex justify-between mb-1"><span className="font-bold text-gray-800 text-sm">{entry.accion}</span><span className="text-xs text-gray-400">{formatDate(entry.fecha)}</span></div>
                     <div className="text-xs text-rayuela-700 mb-2"><User className="h-3 w-3 inline mr-1" />{entry.autor} ({entry.rol})</div>
                     {entry.observaciones && <div className="bg-yellow-50 p-3 rounded text-sm text-gray-700 italic">"{entry.observaciones}"</div>}
                   </div>
                 ))}
               </div>
          </section>
        </div>

        {/* Right Col: Actions */}
        <div className="space-y-6">
          <div className="bg-white border rounded-lg shadow-sm p-4 sticky top-4">
             <h3 className="font-bold text-gray-800 mb-4">Estado: <span className="text-rayuela-600">{request.estado.replace(/_/g, ' ')}</span></h3>
             
             {canInspect && (
               <div className="space-y-3">
                 <textarea className="w-full border rounded-md p-2 text-sm h-32" placeholder="Observaciones..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
                 <div className="flex gap-2">
                   <button onClick={() => handleInspection(true)} className="flex-1 bg-green-600 text-white py-2 rounded text-sm">Favorable</button>
                   <button onClick={() => handleInspection(false)} className="flex-1 bg-red-600 text-white py-2 rounded text-sm">Desfavorable</button>
                 </div>
               </div>
             )}

             {canResolve && (
               <div className="space-y-3">
                 <textarea className="w-full border rounded-md p-2 text-sm h-32" placeholder="Fundamento legal..." value={observaciones} onChange={(e) => setObservaciones(e.target.value)}></textarea>
                 <div className="flex gap-2">
                   <button onClick={() => handleResolution(true)} className="flex-1 bg-rayuela-700 text-white py-2 rounded text-sm flex justify-center"><CheckCircle className="h-4 w-4 mr-1"/> Aprobar</button>
                   <button onClick={() => handleResolution(false)} className="flex-1 bg-gray-600 text-white py-2 rounded text-sm flex justify-center"><XCircle className="h-4 w-4 mr-1"/> Denegar</button>
                 </div>
               </div>
             )}
             
             {isDirector && request.estado === Estado.BORRADOR && (
                 <button onClick={() => { onUpdate(request.id, { estado: Estado.PENDIENTE_INSPECCION, historial: [...request.historial, createHistoryEntry("Envío a Inspección", Estado.PENDIENTE_INSPECCION)] }); onClose(); }} className="w-full bg-blue-600 text-white py-2 rounded text-sm flex justify-center items-center"><Send className="h-4 w-4 mr-2" /> Enviar a Inspección</button>
             )}

             {isSuperUser && (
               <div className="mt-8 border-t-2 border-red-200 pt-4 bg-red-50 rounded-lg p-4">
                 <div className="flex items-center text-red-800 font-bold text-sm mb-3"><ShieldAlert className="h-4 w-4 mr-2" /> Admin Zone</div>
                 <div className="space-y-3">
                    <select value={adminTargetState} onChange={(e) => setAdminTargetState(e.target.value as Estado)} className="w-full text-xs border rounded p-1">{Object.values(Estado).map(e => <option key={e} value={e}>{e}</option>)}</select>
                    <textarea value={adminReason} onChange={(e) => setAdminReason(e.target.value)} className="w-full text-xs border rounded p-1 h-16" placeholder="Motivo..."></textarea>
                    <button onClick={handleAdminChange} className="w-full bg-red-700 text-white text-xs font-bold py-2 rounded">Forzar Cambio</button>
                 </div>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};