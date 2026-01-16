import React, { useState } from 'react';
import { Solicitud, Usuario, Rol, Estado, HistorialEntrada, TipoAnexo, Documento, Alumno, Centro } from '../types';
import { getResolverRole } from '../constants';
import { CheckCircle, XCircle, FileText, ArrowLeft, Send, History, User, ShieldAlert, Edit, Save, Trash2, Upload, AlertCircle, Eye, Calendar, UserPlus, Building2, School, GraduationCap, Globe, Download, PenTool, ClipboardSignature } from 'lucide-react';
import { jsPDF } from "jspdf";

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

const CURSOS_DISPONIBLES = [
  "CUIDADOS AUXILIARES DE ENFERMERÍA",
  "DIETÉTICA",
  "DESARROLLO DE APLICACIONES MULTIPLATAFORMA",
  "DESARROLLO DE APLICACIONES WEB",
  "ADMINISTRACIÓN DE SISTEMAS INFORMÁTICOS EN RED",
  "GESTIÓN ADMINISTRATIVA",
  "ADMINISTRACIÓN Y FINANZAS",
  "ELECTROMECÁNICA DE VEHÍCULOS AUTOMÓVILES"
];

const CONDICIONES_EXTRAORDINARIAS = [
    "Fuera de la Comunidad Autónoma, dentro del territorio nacional",
    "En otros países de la Unión Europea",
    "En otros países de la Unión Europea bajo un programa Erasmus+ o similar",
    "En países de fuera de la Unión Europea, siempre que se realice bajo un Programa Erasmus+ o similar",
    "En días no lectivos",
    "En horario nocturno (por ejemplo, fuera del horario de 22:00 a 6:00 horas)",
    "Con periodo menor a dos días de descanso semanal",
    "Otros supuestos que se determinen"
];

const PROVINCIAS = [
    "Álava", "Albacete", "Alicante", "Almería", "Asturias", "Ávila", "Badajoz", "Barcelona", "Burgos", "Cáceres", "Cádiz", "Cantabria", "Castellón", 
    "Ciudad Real", "Córdoba", "Cuenca", "Gerona", "Granada", "Guadalajara", "Guipúzcoa", "Huelva", "Huesca", "Islas Baleares", "Jaén", "La Coruña", 
    "La Rioja", "Las Palmas", "León", "Lérida", "Lugo", "Madrid", "Málaga", "Murcia", "Navarra", "Orense", "Palencia", "Pontevedra", "Salamanca", 
    "Santa Cruz de Tenerife", "Segovia", "Sevilla", "Soria", "Tarragona", "Teruel", "Toledo", "Valencia", "Valladolid", "Vizcaya", "Zamora", "Zaragoza", 
    "Ceuta", "Melilla", "Extranjero"
];

export const ReviewPanel: React.FC<ReviewPanelProps> = ({ request, user, alumnos: allAlumnos, centros, onClose, onUpdate }) => {
  const [observaciones, setObservaciones] = useState('');
  
  // Modos de Edición (Director)
  const [isEditing, setIsEditing] = useState(false);
  const [editAlumnos, setEditAlumnos] = useState<string[]>(request.alumnos_implicados);
  const [editDocs, setEditDocs] = useState<Documento[]>(request.documentos_adjuntos);
  const [newFiles, setNewFiles] = useState<{file: File, type?: string}[]>([]);
  
  // Edit Fields specific
  const [editMotivo, setEditMotivo] = useState<string>(request.motivo || '');
  const [editMotivoOtros, setEditMotivoOtros] = useState<string>(request.motivo_otros || '');
  const [editFeoeInicio, setEditFeoeInicio] = useState(request.feoe_inicio || '');
  const [editFeoeFin, setEditFeoeFin] = useState(request.feoe_fin || '');
  const [editNumeroConvenio, setEditNumeroConvenio] = useState(request.numero_convenio || '');
  const [editOrganismoPublico, setEditOrganismoPublico] = useState(request.organismo_publico || '');
  
  // Edit Fields IV-B
  const [editTutorDestino, setEditTutorDestino] = useState(request.tutor_dual_destino || '');
  const [editCentroDestino, setEditCentroDestino] = useState(request.centro_destino_codigo || '');

  // Edit Fields V
  const [editCursoDual, setEditCursoDual] = useState(request.curso_dual || '');

  // Edit Fields VIII-A y VIII-B
  const [editExtraCondicion, setEditExtraCondicion] = useState(request.condicion_extraordinaria || '');
  const [editExtraJustificacion, setEditExtraJustificacion] = useState(request.justificacion_extraordinaria || '');
  const [editEmpresaNombre, setEditEmpresaNombre] = useState(request.empresa_nombre || '');
  const [editEmpresaLocalidad, setEditEmpresaLocalidad] = useState(request.empresa_localidad || '');
  const [editEmpresaProvincia, setEditEmpresaProvincia] = useState(request.empresa_provincia || '');
  const [editEmpresaDireccion, setEditEmpresaDireccion] = useState(request.empresa_direccion_extranjera || '');
  const [editTutorEmpresa, setEditTutorEmpresa] = useState(request.tutor_empresa || '');

  // Edit Fields XIII
  const [editNefeJustificacion, setEditNefeJustificacion] = useState(request.justificacion_nefe || '');
  
  // Admin states
  const [adminTargetState, setAdminTargetState] = useState<Estado>(request.estado);
  const [adminReason, setAdminReason] = useState('');

  const centro = centros.find(c => c.codigo === request.codigo_centro);
  const centroDestinoInfo = centros.find(c => c.codigo === request.centro_destino_codigo);

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
  
  // Regla: Una vez creada (no BORRADOR), no se puede editar por el director.
  const canEdit = isDirector && request.estado === Estado.BORRADOR;

  // Lógica de Firmas (extraer del historial)
  const getSignatureAction = (actionType: 'CREATION' | 'INSPECTION' | 'RESOLUTION') => {
      const reversedHistory = [...request.historial].reverse();
      let entry: HistorialEntrada | undefined;

      if (actionType === 'CREATION') {
          // Buscamos la primera entrada de creación
          entry = request.historial.find(h => h.accion.includes("Creación"));
      } else if (actionType === 'INSPECTION') {
          entry = reversedHistory.find(h => h.accion.includes("Informe Favorable") || h.accion.includes("Informe Desfavorable"));
      } else if (actionType === 'RESOLUTION') {
          entry = reversedHistory.find(h => h.accion.includes("Resolución Estimatoria") || h.accion.includes("Resolución Desestimatoria"));
      }

      if (!entry) return null;

      let text = "";
      if (actionType === 'CREATION') text = `Solicitada por ${entry.autor}`;
      if (actionType === 'INSPECTION') text = entry.accion.includes('Favorable') ? `Informada Favorablemente por ${entry.autor}` : `Informada Desfavorablemente por ${entry.autor}`;
      if (actionType === 'RESOLUTION') text = entry.accion.includes('Estimatoria') ? `Resuelta Favorablemente por ${entry.autor}` : `Resuelta Desfavorablemente por ${entry.autor}`;

      return {
          text,
          date: new Date(entry.fecha).toLocaleString('es-ES')
      };
  };

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
    // Lógica Actualizada: Tanto Favorable como Desfavorable pasan al siguiente revisor (Pendiente Resolución).
    // El informe desfavorable no cierra la solicitud, la eleva para su resolución negativa.
    const nuevoEstado = Estado.PENDIENTE_RESOLUCION; 
    const accion = favorable ? "Informe Favorable de Inspección" : "Informe Desfavorable de Inspección";

    onUpdate(request.id, {
      estado: nuevoEstado,
      observaciones_inspeccion: observaciones, 
      historial: [...request.historial, createHistoryEntry(accion, nuevoEstado, observaciones)]
    });
    onClose();
  };

  const handleResolution = (approved: boolean) => {
    // VALIDACIÓN OBLIGATORIA: Si se deniega (approved = false), observaciones son obligatorias.
    if (!approved && !observaciones.trim()) {
        alert("Para emitir una Resolución Desestimatoria (Denegada) es OBLIGATORIO indicar la fundamentación legal o motivo en las observaciones.");
        return;
    }

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
    
    if (request.tipo_anexo === TipoAnexo.ANEXO_II || request.tipo_anexo === TipoAnexo.ANEXO_XIII) {
       if (!editFeoeInicio || !editFeoeFin) { alert("Periodo FEOE obligatorio."); return; }
       if (request.tipo_anexo === TipoAnexo.ANEXO_XIII && !editNefeJustificacion) {
           alert("Justificación obligatoria."); return;
       }
    }

    if (request.tipo_anexo === TipoAnexo.ANEXO_IV_A) {
        if (!editNumeroConvenio) { alert("Número de convenio obligatorio"); return; }
        if (!editOrganismoPublico) { alert("Organismo público obligatorio"); return; }
        const convenioRegex = /^\d{8}-.+$/;
        if (!convenioRegex.test(editNumeroConvenio)) {
             alert("El formato del Número de Convenio no es válido. Debe ser: CódigoCentro-Número");
             return;
        }
    }

    if (request.tipo_anexo === TipoAnexo.ANEXO_IV_B) {
        if (!editTutorDestino) { alert("Tutor dual obligatorio"); return; }
        if (!editCentroDestino) { alert("Centro de destino obligatorio"); return; }
    }

    if (request.tipo_anexo === TipoAnexo.ANEXO_V) {
        if (!editCursoDual) { alert("Curso dual obligatorio"); return; }
    }

    if (request.tipo_anexo === TipoAnexo.ANEXO_VIII_A || request.tipo_anexo === TipoAnexo.ANEXO_VIII_B) {
        if (!editExtraCondicion) { alert("Condición obligatoria"); return; }
        if (!editEmpresaNombre) { alert("Empresa obligatoria"); return; }
        if (!editEmpresaProvincia) { alert("Provincia obligatoria"); return; }
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
      numero_convenio: editNumeroConvenio,
      organismo_publico: editOrganismoPublico,
      tutor_dual_destino: editTutorDestino,
      centro_destino_codigo: editCentroDestino,
      curso_dual: editCursoDual,
      condicion_extraordinaria: editExtraCondicion,
      justificacion_extraordinaria: editExtraJustificacion,
      empresa_nombre: editEmpresaNombre,
      empresa_localidad: editEmpresaLocalidad,
      empresa_provincia: editEmpresaProvincia,
      empresa_direccion_extranjera: editEmpresaDireccion,
      tutor_empresa: editTutorEmpresa,
      justificacion_nefe: editNefeJustificacion,
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

  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.text("Consejería de Educación - FEOE", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Solicitud: ${request.id}`, 105, 30, { align: "center" });
    
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);
    
    // Details
    doc.setFontSize(10);
    let y = 45;
    const lineHeight = 7;
    
    doc.setFont("helvetica", "bold"); doc.text("Tipo:", 20, y); doc.setFont("helvetica", "normal");
    doc.text(request.tipo_anexo, 60, y); y += lineHeight;
    
    doc.setFont("helvetica", "bold"); doc.text("Estado:", 20, y); doc.setFont("helvetica", "normal");
    doc.text(request.estado.replace(/_/g, " "), 60, y); y += lineHeight;
    
    doc.setFont("helvetica", "bold"); doc.text("Fecha:", 20, y); doc.setFont("helvetica", "normal");
    doc.text(request.fecha_creacion, 60, y); y += lineHeight;
    
    if (centro) {
        doc.setFont("helvetica", "bold"); doc.text("Centro:", 20, y); doc.setFont("helvetica", "normal");
        doc.text(`${centro.nombre} (${centro.localidad})`, 60, y); y += lineHeight;
    }

    y += 5;

    // Campos específicos según tipo
    if (request.tipo_anexo === TipoAnexo.ANEXO_I && request.motivo) {
        doc.setFont("helvetica", "bold"); doc.text("Motivo:", 20, y); doc.setFont("helvetica", "normal");
        doc.text(request.motivo, 60, y); y += lineHeight;
        if(request.motivo_otros) {
            doc.text(`Detalle: ${request.motivo_otros}`, 60, y); y += lineHeight;
        }
    }
    
    if (request.feoe_inicio) {
         doc.setFont("helvetica", "bold"); doc.text("Periodo FEOE:", 20, y); doc.setFont("helvetica", "normal");
         doc.text(`Del ${request.feoe_inicio} al ${request.feoe_fin}`, 60, y); y += lineHeight;
    }
    
    if (request.justificacion_nefe) {
        doc.setFont("helvetica", "bold"); doc.text("Justificación NEFE:", 20, y); doc.setFont("helvetica", "normal");
        const splitText = doc.splitTextToSize(request.justificacion_nefe, 130);
        doc.text(splitText, 60, y);
        y += (splitText.length * lineHeight);
    }
    
    // Alumnos
    y += 5;
    doc.setFont("helvetica", "bold"); doc.text("Alumnos Implicados:", 20, y); y += lineHeight;
    doc.setFont("helvetica", "normal");
    alumnosSolicitud.forEach(a => {
        doc.text(`- ${a.apellidos}, ${a.nombre} (${a.dni}) - ${a.curso}`, 25, y);
        y += lineHeight;
    });

    // Firma
    y += 20;
    doc.text("Firmado:", 20, y);
    doc.setFont("helvetica", "bold");
    doc.text(centro?.nombre_director || "Director/a del Centro", 40, y);
    
    doc.save(`Solicitud_${request.id}.pdf`);
  };

  const showDocs = request.tipo_anexo !== TipoAnexo.ANEXO_IV_B && request.tipo_anexo !== TipoAnexo.ANEXO_V;
  const isAnexoVIII = request.tipo_anexo === TipoAnexo.ANEXO_VIII_A || request.tipo_anexo === TipoAnexo.ANEXO_VIII_B;

  return (
    <div className="bg-white shadow-xl rounded-lg border border-gray-200 flex flex-col h-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <div>
          <h2 className="text-lg font-bold text-gray-800">{request.tipo_anexo.split(' - ')[0]}</h2>
          <p className="text-xs text-gray-500 mt-1">{request.tipo_anexo.split(' - ')[1] || ''}</p>
          <p className="text-sm text-gray-500 mt-1">ID: {request.id} | {centro?.nombre || 'Centro Desconocido'}</p>
        </div>
        <div className="flex items-center space-x-3">
             <button onClick={generatePDF} className="flex items-center text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 px-3 py-1.5 rounded text-sm shadow-sm transition-colors">
                <Download className="h-4 w-4 mr-2" /> PDF
            </button>
            {canEdit && !isEditing && (
                <button onClick={() => setIsEditing(true)} className="flex items-center text-rayuela-700 font-medium hover:bg-rayuela-50 px-3 py-1.5 rounded border border-rayuela-200 transition-colors text-sm">
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
          
          {/* ... (Previous Sections for FEOE Period, IV-A, IV-B, V, VIII - no changes) ... */}
          {/* I'll include the relevant sections but omit unchanged internal JSX for brevity if possible, 
              but to ensure full file replacement I must include everything. */}
          
          {/* FEOE Periodo (Anexo II y XIII) */}
          {(request.tipo_anexo === TipoAnexo.ANEXO_II || request.tipo_anexo === TipoAnexo.ANEXO_XIII || isEditing) && (request.tipo_anexo === TipoAnexo.ANEXO_II || request.tipo_anexo === TipoAnexo.ANEXO_XIII) && (
             <section className={`${request.tipo_anexo === TipoAnexo.ANEXO_II ? 'bg-purple-50 border-purple-100' : 'bg-pink-50 border-pink-100'} border p-4 rounded-md`}>
                 <h3 className={`text-sm font-semibold ${request.tipo_anexo === TipoAnexo.ANEXO_II ? 'text-purple-800' : 'text-pink-800'} uppercase tracking-wider mb-3 flex items-center`}>
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
                     <div className={`text-sm ${request.tipo_anexo === TipoAnexo.ANEXO_II ? 'text-purple-900' : 'text-pink-900'} font-medium`}>
                         Del {request.feoe_inicio || '---'} al {request.feoe_fin || '---'}
                     </div>
                 )}
             </section>
          )}

           {/* Anexo XIII Details */}
           {(request.tipo_anexo === TipoAnexo.ANEXO_XIII || isEditing) && request.tipo_anexo === TipoAnexo.ANEXO_XIII && (
             <section className="bg-pink-50 border border-pink-100 p-4 rounded-md mt-4">
                 <h3 className="text-sm font-semibold text-pink-800 uppercase tracking-wider mb-3 flex items-center">
                     <FileText className="h-4 w-4 mr-2" /> Justificación NEFE
                 </h3>
                 {isEditing ? (
                     <div>
                         <label className="block text-xs text-gray-500 mb-1">Texto Justificativo</label>
                         <textarea 
                             value={editNefeJustificacion}
                             onChange={e => setEditNefeJustificacion(e.target.value)}
                             className="w-full text-sm border p-1 rounded h-32"
                         />
                     </div>
                 ) : (
                     <div className="text-sm text-gray-800 whitespace-pre-wrap bg-white p-2 rounded border border-pink-200">
                         {request.justificacion_nefe || '---'}
                     </div>
                 )}
             </section>
           )}

          {/* Anexo IV-A Details */}
          {(request.tipo_anexo === TipoAnexo.ANEXO_IV_A || isEditing) && request.tipo_anexo === TipoAnexo.ANEXO_IV_A && (
            <section className="bg-amber-50 border border-amber-100 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-amber-800 uppercase tracking-wider mb-3 flex items-center">
                    <Building2 className="h-4 w-4 mr-2" /> Detalles Organismo Público
                </h3>
                 {isEditing ? (
                     <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Número Convenio</label>
                            <input 
                                type="text" 
                                value={editNumeroConvenio} 
                                onChange={e => setEditNumeroConvenio(e.target.value)} 
                                className="w-full text-sm border p-1 rounded" 
                                placeholder="00000000-XXX"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Organismo Público</label>
                            <textarea 
                                value={editOrganismoPublico} 
                                onChange={e => setEditOrganismoPublico(e.target.value)} 
                                className="w-full text-sm border p-1 rounded h-20"
                            />
                            <p className="text-[10px] text-gray-400 italic mt-1">(Identificar ministerio, consejería, diputación...)</p>
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         <div>
                             <p className="text-xs text-gray-500 uppercase">Convenio</p>
                             <p className="text-sm font-bold text-gray-800">{request.numero_convenio || '---'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 uppercase">Organismo</p>
                             <p className="text-sm text-gray-800 whitespace-pre-wrap">{request.organismo_publico || '---'}</p>
                         </div>
                     </div>
                 )}
            </section>
          )}

           {/* Anexo IV-B Details */}
           {(request.tipo_anexo === TipoAnexo.ANEXO_IV_B || isEditing) && request.tipo_anexo === TipoAnexo.ANEXO_IV_B && (
            <section className="bg-teal-50 border border-teal-100 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-teal-800 uppercase tracking-wider mb-3 flex items-center">
                    <School className="h-4 w-4 mr-2" /> Detalles Centro Educativo
                </h3>
                 {isEditing ? (
                     <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Tutor/a Dual en Destino</label>
                            <input 
                                type="text" 
                                value={editTutorDestino} 
                                onChange={e => setEditTutorDestino(e.target.value)} 
                                className="w-full text-sm border p-1 rounded" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Centro de Destino</label>
                            <select
                                value={editCentroDestino}
                                onChange={(e) => setEditCentroDestino(e.target.value)}
                                className="w-full text-sm border p-1 rounded"
                            >
                                <option value="">-- Seleccionar --</option>
                                {centros.map(c => <option key={c.codigo} value={c.codigo}>{c.nombre} ({c.localidad})</option>)}
                            </select>
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         <div>
                             <p className="text-xs text-gray-500 uppercase">Tutor/a Dual</p>
                             <p className="text-sm font-bold text-gray-800">{request.tutor_dual_destino || '---'}</p>
                         </div>
                         <div>
                             <p className="text-xs text-gray-500 uppercase">Centro de Destino</p>
                             <p className="text-sm text-gray-800">
                                 {centroDestinoInfo ? `${centroDestinoInfo.nombre} (${centroDestinoInfo.localidad})` : request.centro_destino_codigo}
                             </p>
                         </div>
                     </div>
                 )}
            </section>
          )}

          {/* Anexo V Details */}
          {(request.tipo_anexo === TipoAnexo.ANEXO_V || isEditing) && request.tipo_anexo === TipoAnexo.ANEXO_V && (
            <section className="bg-indigo-50 border border-indigo-100 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-indigo-800 uppercase tracking-wider mb-3 flex items-center">
                    <GraduationCap className="h-4 w-4 mr-2" /> Compromiso de Dualización
                </h3>
                 {isEditing ? (
                     <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Ciclo Formativo</label>
                            <select
                                value={editCursoDual}
                                onChange={(e) => setEditCursoDual(e.target.value)}
                                className="w-full text-sm border p-1 rounded"
                            >
                                <option value="">-- Seleccionar --</option>
                                {CURSOS_DISPONIBLES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         <div>
                             <p className="text-xs text-gray-500 uppercase">Ciclo Formativo Solicitado</p>
                             <p className="text-sm font-bold text-gray-800">{request.curso_dual || '---'}</p>
                         </div>
                     </div>
                 )}
            </section>
          )}

          {/* Anexo VIII-A y VIII-B Details */}
          {(isAnexoVIII || isEditing) && isAnexoVIII && (
            <section className="bg-orange-50 border border-orange-100 p-4 rounded-md">
                <h3 className="text-sm font-semibold text-orange-800 uppercase tracking-wider mb-3 flex items-center">
                    <Globe className="h-4 w-4 mr-2" /> {request.tipo_anexo === TipoAnexo.ANEXO_VIII_B ? "Detalles Anexo VIII-B (Mes de Julio)" : "Condiciones Extraordinarias"}
                </h3>
                 {isEditing ? (
                     <div className="space-y-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Condición</label>
                            {request.tipo_anexo === TipoAnexo.ANEXO_VIII_B ? (
                                <input 
                                    type="text" 
                                    value="FEOE durante el mes de julio" 
                                    disabled 
                                    className="w-full text-sm border p-1 rounded bg-gray-100 text-gray-600"
                                />
                            ) : (
                                <select
                                    value={editExtraCondicion}
                                    onChange={(e) => setEditExtraCondicion(e.target.value)}
                                    className="w-full text-sm border p-1 rounded"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {CONDICIONES_EXTRAORDINARIAS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Justificación</label>
                            <textarea 
                                value={editExtraJustificacion}
                                onChange={(e) => setEditExtraJustificacion(e.target.value)}
                                className="w-full text-sm border p-1 rounded h-20"
                            />
                        </div>
                        <div className="border-t pt-2 mt-2">
                             <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Empresa</label>
                                    <input type="text" value={editEmpresaNombre} onChange={e => setEditEmpresaNombre(e.target.value)} className="w-full text-sm border p-1 rounded" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Tutor/a</label>
                                    <input type="text" value={editTutorEmpresa} onChange={e => setEditTutorEmpresa(e.target.value)} className="w-full text-sm border p-1 rounded" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Localidad</label>
                                    <input type="text" value={editEmpresaLocalidad} onChange={e => setEditEmpresaLocalidad(e.target.value)} className="w-full text-sm border p-1 rounded" />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Provincia</label>
                                    <select value={editEmpresaProvincia} onChange={e => setEditEmpresaProvincia(e.target.value)} className="w-full text-sm border p-1 rounded">
                                        <option value="">-- Seleccionar --</option>
                                        {PROVINCIAS.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                             </div>
                             {editEmpresaProvincia === 'Extranjero' && (
                                 <div className="mt-2">
                                     <label className="block text-xs text-gray-500 mb-1">Dirección Extranjera</label>
                                     <textarea value={editEmpresaDireccion} onChange={e => setEditEmpresaDireccion(e.target.value)} className="w-full text-sm border p-1 rounded h-16" />
                                 </div>
                             )}
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-3">
                         <div>
                             <p className="text-xs text-gray-500 uppercase">Condición</p>
                             <p className="text-sm font-bold text-gray-800">{request.condicion_extraordinaria || '---'}</p>
                             {request.justificacion_extraordinaria && (
                                 <p className="text-xs text-gray-600 mt-1 italic">"{request.justificacion_extraordinaria}"</p>
                             )}
                         </div>
                         <div className="grid grid-cols-2 gap-2 border-t border-orange-200 pt-2">
                             <div>
                                 <p className="text-xs text-gray-500 uppercase">Empresa</p>
                                 <p className="text-sm font-medium">{request.empresa_nombre}</p>
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500 uppercase">Tutor/a</p>
                                 <p className="text-sm font-medium">{request.tutor_empresa}</p>
                             </div>
                             <div>
                                 <p className="text-xs text-gray-500 uppercase">Ubicación</p>
                                 <p className="text-sm font-medium">{request.empresa_localidad} ({request.empresa_provincia})</p>
                             </div>
                         </div>
                         {request.empresa_provincia === 'Extranjero' && (
                              <div className="bg-orange-100 p-2 rounded text-xs">
                                  <span className="font-bold">Dirección:</span> {request.empresa_direccion_extranjera}
                              </div>
                         )}
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
            {showDocs ? (
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
                         {request.tipo_anexo === TipoAnexo.ANEXO_IV_A && (
                             <label className="cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-700 px-3 py-1 rounded text-xs flex items-center border border-amber-200">
                                 + Convenio
                                 <input type="file" className="hidden" onChange={(e) => handleAddNewFile(e, 'CONVENIO')} />
                             </label>
                         )}
                         {isAnexoVIII && (
                             <label className="cursor-pointer bg-orange-50 hover:bg-orange-100 text-orange-700 px-3 py-1 rounded text-xs flex items-center border border-orange-200">
                                 + Convenio
                                 <input type="file" className="hidden" onChange={(e) => handleAddNewFile(e, 'CONVENIO')} />
                             </label>
                         )}
                    </div>
                )}
            </div>
            ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-sm text-gray-500 italic">
                    Este tipo de solicitud no requiere documentación adjunta.
                </div>
            )}
          </section>

          <div className="border-t pt-4 mt-6">
                <p className="text-sm text-gray-600 font-medium">Firmado por el Director:</p>
                <div className="flex items-center mt-2 text-gray-800 bg-gray-100 p-2 rounded w-fit px-4 border border-gray-300">
                    <PenTool className="h-4 w-4 mr-2 text-gray-500" />
                    <span className="font-bold">{centro?.nombre_director || "Director/a del Centro"}</span>
                </div>
           </div>

          {/* FIRMAS / TRAZABILIDAD SECTION */}
          <section className="border-t pt-4 mt-4">
              <div className="flex items-center mb-3">
                  <ClipboardSignature className="h-5 w-5 text-gray-400 mr-2" />
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Firmas y Trazabilidad</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Creación */}
                  {(() => {
                      const sig = getSignatureAction('CREATION');
                      return sig ? (
                          <div className="bg-gray-50 p-3 rounded border border-gray-200 shadow-sm">
                              <p className="text-xs text-gray-500 font-bold uppercase mb-1">Solicitud</p>
                              <p className="text-sm text-gray-800 font-medium">{sig.text}</p>
                              <p className="text-xs text-gray-400 mt-1">{sig.date}</p>
                          </div>
                      ) : null;
                  })()}
                  
                  {/* Inspección */}
                   {(() => {
                      const sig = getSignatureAction('INSPECTION');
                      return sig ? (
                          <div className="bg-blue-50 p-3 rounded border border-blue-200 shadow-sm">
                              <p className="text-xs text-blue-500 font-bold uppercase mb-1">Informe Inspección</p>
                              <p className="text-sm text-blue-900 font-medium">{sig.text}</p>
                              <p className="text-xs text-blue-400 mt-1">{sig.date}</p>
                          </div>
                      ) : null;
                  })()}

                  {/* Resolución */}
                   {(() => {
                      const sig = getSignatureAction('RESOLUTION');
                      return sig ? (
                          <div className="bg-green-50 p-3 rounded border border-green-200 shadow-sm">
                              <p className="text-xs text-green-600 font-bold uppercase mb-1">Resolución</p>
                              <p className="text-sm text-green-900 font-medium">{sig.text}</p>
                              <p className="text-xs text-green-500 mt-1">{sig.date}</p>
                          </div>
                      ) : null;
                  })()}
              </div>
          </section>

          {/* Timeline */}
          <section className="border-t pt-4 mt-4">
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
                 <p className="text-xs text-gray-500 text-center italic">Ambas acciones envían la solicitud a Resolución.</p>
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
                 <button onClick={() => { onUpdate(request.id, { estado: Estado.PENDIENTE_RESOLUCION, historial: [...request.historial, createHistoryEntry("Envío a Inspección", Estado.PENDIENTE_RESOLUCION)] }); onClose(); }} className="w-full bg-blue-600 text-white py-2 rounded text-sm flex justify-center items-center"><Send className="h-4 w-4 mr-2" /> Enviar</button>
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