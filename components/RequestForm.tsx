import React, { useState } from 'react';
import { Usuario, TipoAnexo, Estado, Solicitud, HistorialEntrada, Alumno, Documento, Centro } from '../types';
import { getTargetResolutionState } from '../constants';
import { Save, ArrowLeft, Upload, AlertCircle, FileText, Trash2, Eye, Calendar, UserPlus, Building2, School, GraduationCap, Globe, PenTool, Search, AlertTriangle } from 'lucide-react';

interface RequestFormProps {
  user: Usuario;
  alumnos: Alumno[];
  centros: Centro[];
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

interface TempFile {
  file: File;
  type?: string; 
}

export const RequestForm: React.FC<RequestFormProps> = ({ user, alumnos, centros, onClose, onSubmit }) => {
  const [tipo, setTipo] = useState<TipoAnexo>(TipoAnexo.ANEXO_I);
  const [selectedAlumnos, setSelectedAlumnos] = useState<string[]>([]);
  
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [ageWarning, setAgeWarning] = useState<string | null>(null);
  
  const [files, setFiles] = useState<TempFile[]>([]);
  
  const [error, setError] = useState<string | null>(null);

  const [motivo, setMotivo] = useState<string>('');
  const [motivoOtros, setMotivoOtros] = useState<string>('');

  const [feoeInicio, setFeoeInicio] = useState('');
  const [feoeFin, setFeoeFin] = useState('');

  const [numeroConvenio, setNumeroConvenio] = useState('');
  const [selectedConvenioList, setSelectedConvenioList] = useState(''); // Para el dropdown
  const [organismoPublico, setOrganismoPublico] = useState('');

  const [tutorDestino, setTutorDestino] = useState('');
  const [centroDestino, setCentroDestino] = useState('');

  const [cursoDual, setCursoDual] = useState('');

  const [extraCondicion, setExtraCondicion] = useState('');
  const [extraJustificacion, setExtraJustificacion] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [empresaLocalidad, setEmpresaLocalidad] = useState('');
  const [empresaProvincia, setEmpresaProvincia] = useState('');
  const [empresaDireccion, setEmpresaDireccion] = useState('');
  const [tutorEmpresa, setTutorEmpresa] = useState('');

  const [nefeJustificacion, setNefeJustificacion] = useState('');

  const currentCentro = centros.find(c => c.codigo === user.codigo_centro);
  const centerAlumnos = alumnos.filter(a => a.codigo_centro === user.codigo_centro);
  
  const availableToAdd = centerAlumnos
    .filter(a => !selectedAlumnos.includes(a.dni))
    .filter(a => {
        if(!studentSearchTerm) return true;
        const search = studentSearchTerm.toLowerCase();
        return a.nombre.toLowerCase().includes(search) || a.apellidos.toLowerCase().includes(search);
    });

  const handleAddAlumno = (dni: string) => {
    if (dni && !selectedAlumnos.includes(dni)) {
      const alumno = centerAlumnos.find(a => a.dni === dni);
      
      // Chequeo de edad (Simulado con DNI específico según requisitos)
      if (alumno && (alumno.dni === '87654321X' || (alumno.fecha_nacimiento && new Date(alumno.fecha_nacimiento).getFullYear() >= 2009))) {
          setAgeWarning(`Cuidado el alumno ${alumno.nombre} ${alumno.apellidos} tiene 15 años, asegúrese de que en la fecha de inicio de FEOE haya cumplido 16 años.`);
          // Auto-hide warning
          setTimeout(() => setAgeWarning(null), 8000);
      }

      setSelectedAlumnos([...selectedAlumnos, dni]);
      setStudentSearchTerm(''); 
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

  const checkAugust = (dateString: string) => {
      const d = new Date(dateString);
      return d.getMonth() === 7; // 0-indexed, 7 es Agosto
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

    // Validación Fechas (Para todos los que las usen)
    if (feoeInicio && feoeFin) {
        if (feoeInicio > feoeFin) {
           setError("La fecha de inicio no puede ser posterior a la fecha de fin.");
           return;
        }
        if (checkAugust(feoeInicio) || checkAugust(feoeFin)) {
            setError("Las fechas de inicio o fin no pueden ser en el mes de Agosto (inhábil).");
            return;
        }
    }

    // Validación Anexo II y XIII
    if (tipo === TipoAnexo.ANEXO_II || tipo === TipoAnexo.ANEXO_XIII) {
       if (!feoeInicio || !feoeFin) {
           setError("Es obligatorio especificar el periodo de FEOE.");
           return;
       }
       if (tipo === TipoAnexo.ANEXO_II) {
           const hasPlan = files.some(f => f.type === 'PLAN');
           if (!hasPlan) { setError("Es obligatorio subir el Plan individual de formación."); return; }
           if (!selectedConvenioList) { setError("Debe seleccionar un Convenio de la lista."); return; }
       }
        if (tipo === TipoAnexo.ANEXO_XIII) {
             if(!nefeJustificacion.trim()) {
                 setError("Para el Anexo XIII es obligatorio incluir una justificación.");
                 return;
             }
        }
    }

    // Validación Anexo IV-A
    if (tipo === TipoAnexo.ANEXO_IV_A) {
        if (!numeroConvenio.trim()) {
            setError("Debe indicar el Número de Convenio.");
            return;
        }
        const convenioRegex = /^\d{8}-.+$/;
        if (!convenioRegex.test(numeroConvenio)) {
            setError("El formato del Número de Convenio no es válido. Debe ser: CódigoCentro-Número (Ej: 06006899-123).");
            return;
        }
        if (!organismoPublico.trim()) {
            setError("Debe indicar el Organismo Público.");
            return;
        }
        const hasConvenio = files.some(f => f.type === 'CONVENIO');
        if (!hasConvenio) {
            setError("Para el Anexo IV-A es obligatorio subir el documento del Convenio.");
            return;
        }
    }

    // Validación Anexo IV-B
    if (tipo === TipoAnexo.ANEXO_IV_B) {
        if (!tutorDestino.trim()) {
            setError("Debe indicar el nombre del Tutor/a Dual en destino.");
            return;
        }
        if (!centroDestino) {
            setError("Debe seleccionar un Centro de Trabajo (Educativo) de destino.");
            return;
        }
        if (!selectedConvenioList) { setError("Debe seleccionar un Convenio."); return; }
    }

    // Validación Anexo V
    if (tipo === TipoAnexo.ANEXO_V) {
        if (!cursoDual) {
            setError("Debe seleccionar el Ciclo Formativo para la dualización.");
            return;
        }
    }

    // Validación Anexo VIII-A y VIII-B
    if (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) {
        if (!extraCondicion) {
            setError("Debe seleccionar una condición extraordinaria.");
            return;
        }
        
        // VIII-A: Si es "Otros", justificación obligatoria.
        if (tipo === TipoAnexo.ANEXO_VIII_A && extraCondicion === 'Otros supuestos que se determinen' && !extraJustificacion.trim()) {
            setError("Debe justificar la condición extraordinaria si selecciona 'Otros'.");
            return;
        }
        // VIII-B: Justificación SIEMPRE obligatoria
        if (tipo === TipoAnexo.ANEXO_VIII_B && !extraJustificacion.trim()) {
            setError("Para el Anexo VIII-B la justificación es obligatoria.");
            return;
        }

        if (!empresaNombre.trim()) { setError("El nombre de la empresa es obligatorio."); return; }
        if (!empresaLocalidad.trim()) { setError("La localidad de la empresa es obligatoria."); return; }
        if (!empresaProvincia) { setError("La provincia es obligatoria."); return; }
        if (empresaProvincia === 'Extranjero' && !empresaDireccion.trim()) { setError("Debe indicar la dirección completa si es en el extranjero."); return; }
        if (!tutorEmpresa.trim()) { setError("El tutor/a de la empresa es obligatorio."); return; }

        if (!selectedConvenioList) { setError("Debe seleccionar un Convenio de la lista."); return; }
    }

    let initialStatus: Estado;
    const requiresInspection = 
        tipo === TipoAnexo.ANEXO_VIII_A || 
        tipo === TipoAnexo.ANEXO_VIII_B || 
        tipo === TipoAnexo.ANEXO_XIII;

    if (requiresInspection) {
        initialStatus = Estado.PENDIENTE_INSPECCION;
    } else {
        initialStatus = getTargetResolutionState(tipo);
    }

    const historialInicial: HistorialEntrada[] = [
      {
        fecha: new Date().toISOString(),
        autor: user.nombre,
        rol: user.rol,
        accion: "Creación y Envío",
        estado_nuevo: initialStatus
      }
    ];

    const finalDocs: Documento[] = files.map(f => ({
        nombre: f.file.name,
        fecha: new Date().toISOString().split('T')[0],
        tipo: f.type,
        url: URL.createObjectURL(f.file) 
    }));

    const newRequest: Partial<Solicitud> = {
      tipo_anexo: tipo,
      codigo_centro: user.codigo_centro!,
      alumnos_implicados: selectedAlumnos,
      estado: initialStatus,
      documentos_adjuntos: finalDocs,
      historial: historialInicial,
      leida: true, // El creador la ha "leído"
      motivo: tipo === TipoAnexo.ANEXO_I ? motivo : undefined,
      motivo_otros: (tipo === TipoAnexo.ANEXO_I && motivo === 'Otros') ? motivoOtros : undefined,
      feoe_inicio: (tipo === TipoAnexo.ANEXO_II || tipo === TipoAnexo.ANEXO_XIII) ? feoeInicio : undefined,
      feoe_fin: (tipo === TipoAnexo.ANEXO_II || tipo === TipoAnexo.ANEXO_XIII) ? feoeFin : undefined,
      // Usar selectedConvenioList si existe, sino el manual (IV-A)
      numero_convenio: selectedConvenioList ? selectedConvenioList : (tipo === TipoAnexo.ANEXO_IV_A ? numeroConvenio : undefined),
      organismo_publico: tipo === TipoAnexo.ANEXO_IV_A ? organismoPublico : undefined,
      tutor_dual_destino: tipo === TipoAnexo.ANEXO_IV_B ? tutorDestino : undefined,
      centro_destino_codigo: tipo === TipoAnexo.ANEXO_IV_B ? centroDestino : undefined,
      curso_dual: tipo === TipoAnexo.ANEXO_V ? cursoDual : undefined,
      condicion_extraordinaria: (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) ? extraCondicion : undefined,
      justificacion_extraordinaria: (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) ? extraJustificacion : undefined,
      empresa_nombre: (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) ? empresaNombre : undefined,
      empresa_localidad: (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) ? empresaLocalidad : undefined,
      empresa_provincia: (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) ? empresaProvincia : undefined,
      empresa_direccion_extranjera: ((tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) && empresaProvincia === 'Extranjero') ? empresaDireccion : undefined,
      tutor_empresa: (tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B) ? tutorEmpresa : undefined,
      justificacion_nefe: tipo === TipoAnexo.ANEXO_XIII ? nefeJustificacion : undefined,
    };

    window.alert("Solicitud creada y enviada correctamente.");
    onSubmit(newRequest);
  };

  const showFileUpload = tipo !== TipoAnexo.ANEXO_IV_B && tipo !== TipoAnexo.ANEXO_V;
  const isAnexoVIII = tipo === TipoAnexo.ANEXO_VIII_A || tipo === TipoAnexo.ANEXO_VIII_B;
  const shouldUseConvenioDropdown = tipo === TipoAnexo.ANEXO_II || tipo === TipoAnexo.ANEXO_IV_B || isAnexoVIII;

  return (
    <div className="bg-white shadow-lg rounded-lg border border-gray-200 p-4 sm:p-6 w-full max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6 border-b pb-4">
        <h2 className="text-xl font-bold text-rayuela-700">Nueva Solicitud</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="h-5 w-5" />
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 flex items-center rounded">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {ageWarning && (
         <div className="mb-4 bg-yellow-50 border-l-4 border-yellow-500 p-4 text-yellow-800 flex items-center rounded animate-pulse">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm font-bold">{ageWarning}</span>
         </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Anexo</label>
          <select 
            value={tipo}
            onChange={(e) => {
              const newTipo = e.target.value as TipoAnexo;
              setTipo(newTipo);
              setMotivo(''); setMotivoOtros(''); setFiles([]); setFeoeInicio(''); setFeoeFin('');
              setNumeroConvenio(''); setOrganismoPublico(''); setTutorDestino(''); setCentroDestino('');
              setCursoDual(''); setExtraCondicion(''); setExtraJustificacion(''); setEmpresaNombre(''); 
              setEmpresaLocalidad(''); setEmpresaProvincia(''); setEmpresaDireccion(''); setTutorEmpresa('');
              setNefeJustificacion(''); setSelectedConvenioList('');
              
              if (newTipo === TipoAnexo.ANEXO_VIII_B) {
                  setExtraCondicion("FEOE durante el mes de julio");
              }
            }}
            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-rayuela-500 focus:border-rayuela-500 border p-2 text-sm" 
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

        {/* ANEXO II & XIII Fields (Fechas) */}
        {(tipo === TipoAnexo.ANEXO_II || tipo === TipoAnexo.ANEXO_XIII) && (
          <div className={`${tipo === TipoAnexo.ANEXO_II ? 'bg-purple-50 border-purple-100' : 'bg-pink-50 border-pink-100'} p-4 rounded-md border space-y-4`}>
            <h3 className={`text-sm font-bold ${tipo === TipoAnexo.ANEXO_II ? 'text-purple-800' : 'text-pink-800'}`}>
                {tipo === TipoAnexo.ANEXO_II ? "Detalles Anexo II (Intensivo)" : "Detalles Anexo XIII (NEFE)"}
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inicio FEOE <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input 
                          type="date" 
                          value={feoeInicio}
                          onChange={(e) => setFeoeInicio(e.target.value)}
                          className={`block w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm pl-10 ${tipo === TipoAnexo.ANEXO_II ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-pink-500 focus:border-pink-500'}`}
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
                          className={`block w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm pl-10 ${tipo === TipoAnexo.ANEXO_II ? 'focus:ring-purple-500 focus:border-purple-500' : 'focus:ring-pink-500 focus:border-pink-500'}`}
                        />
                        <Calendar className="h-4 w-4 text-gray-400 absolute left-3 top-2.5" />
                    </div>
                </div>
            </div>

            {tipo === TipoAnexo.ANEXO_XIII && (
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Justificación de la adaptación <span className="text-red-500">*</span></label>
                    <textarea 
                        value={nefeJustificacion}
                        onChange={(e) => setNefeJustificacion(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 border p-2 text-sm h-32"
                        placeholder="Explique las necesidades educativas y la adaptación requerida..."
                    />
                 </div>
            )}
          </div>
        )}

        {/* ANEXO IV-A Fields */}
        {tipo === TipoAnexo.ANEXO_IV_A && (
          <div className="bg-amber-50 p-4 rounded-md border border-amber-100 space-y-4">
            <h3 className="text-sm font-bold text-amber-800 flex items-center">
                <Building2 className="h-4 w-4 mr-2" />
                Detalles Anexo IV-A (Organismo Público)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número de Convenio <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={numeroConvenio}
                      onChange={(e) => setNumeroConvenio(e.target.value)}
                      placeholder={`${user.codigo_centro || '00000000'}-XXX`}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 border p-2 text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1">Formato válido: CódigoCentro-Número</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Organismo Público <span className="text-red-500">*</span></label>
                    <textarea 
                      value={organismoPublico}
                      onChange={(e) => setOrganismoPublico(e.target.value)}
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 border p-2 text-sm h-24"
                      placeholder="Nombre del organismo..."
                    />
                </div>
            </div>
          </div>
        )}

        {/* ANEXO IV-B Fields */}
        {tipo === TipoAnexo.ANEXO_IV_B && (
          <div className="bg-teal-50 p-4 rounded-md border border-teal-100 space-y-4">
            <h3 className="text-sm font-bold text-teal-800 flex items-center">
                <School className="h-4 w-4 mr-2" />
                Detalles Anexo IV-B (Centro Educativo)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tutor/a Dual en destino <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      value={tutorDestino}
                      onChange={(e) => setTutorDestino(e.target.value)}
                      placeholder="Nombre y apellidos"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2 text-sm"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Centro de Destino <span className="text-red-500">*</span></label>
                    <select
                        value={centroDestino}
                        onChange={(e) => setCentroDestino(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 border p-2 text-sm"
                    >
                        <option value="">-- Seleccione un Centro --</option>
                        {centros.map(c => (
                            <option key={c.codigo} value={c.codigo}>
                                {c.nombre} ({c.localidad})
                            </option>
                        ))}
                    </select>
                </div>
            </div>
          </div>
        )}

        {/* ANEXO V Fields */}
        {tipo === TipoAnexo.ANEXO_V && (
          <div className="bg-indigo-50 p-5 rounded-md border border-indigo-100 space-y-5">
             <h3 className="text-sm font-bold text-indigo-800 flex items-center">
                <GraduationCap className="h-4 w-4 mr-2" />
                Compromiso de Dualización
            </h3>
            {/* ... Content remains same ... */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seleccione Ciclo Formativo (Curso) <span className="text-red-500">*</span></label>
                <select
                    value={cursoDual}
                    onChange={(e) => setCursoDual(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 border p-2 text-sm"
                >
                    <option value="">-- Seleccione un Ciclo --</option>
                    {CURSOS_DISPONIBLES.map(c => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
            </div>
          </div>
        )}

        {/* ANEXO VIII-A y VIII-B Fields */}
        {isAnexoVIII && (
          <div className="bg-orange-50 p-4 rounded-md border border-orange-100 space-y-4">
             <h3 className="text-sm font-bold text-orange-800 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                {tipo === TipoAnexo.ANEXO_VIII_B ? "Detalles Anexo VIII-B (Mes de Julio)" : "Condiciones Extraordinarias"}
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Condición <span className="text-red-500">*</span></label>
                {tipo === TipoAnexo.ANEXO_VIII_B ? (
                     <input 
                        type="text" 
                        value="FEOE durante el mes de julio" 
                        disabled 
                        className="block w-full border-gray-300 rounded-md bg-gray-100 text-gray-600 border p-2 text-sm"
                     />
                ) : (
                    <select
                        value={extraCondicion}
                        onChange={(e) => setExtraCondicion(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm"
                    >
                        <option value="">-- Seleccione una condición --</option>
                        {CONDICIONES_EXTRAORDINARIAS.map(c => (
                            <option key={c} value={c}>{c}</option>
                        ))}
                    </select>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Justificación 
                    {tipo === TipoAnexo.ANEXO_VIII_B ? <span className="text-red-500">*</span> : <span className="text-xs font-normal text-gray-500"> (Obligatorio si selecciona 'Otros')</span>}
                </label>
                <textarea
                    value={extraJustificacion}
                    onChange={(e) => setExtraJustificacion(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm h-20"
                    placeholder="Especifique los motivos..."
                />
            </div>

            <div className="border-t border-orange-200 pt-4 mt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Empresa <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={empresaNombre}
                            onChange={(e) => setEmpresaNombre(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Localidad <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={empresaLocalidad}
                            onChange={(e) => setEmpresaLocalidad(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm"
                        />
                    </div>
                    {/* ... Provincia/Tutor/Dirección */}
                    <div>
                         <label className="block text-sm font-medium text-gray-700 mb-1">Provincia <span className="text-red-500">*</span></label>
                         <select
                            value={empresaProvincia}
                            onChange={(e) => setEmpresaProvincia(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm"
                        >
                            <option value="">-- Seleccione Provincia --</option>
                            {PROVINCIAS.map(p => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tutor/a Empresa <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={tutorEmpresa}
                            onChange={(e) => setTutorEmpresa(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm"
                            placeholder="Nombre y Apellidos"
                        />
                    </div>
                </div>
                {empresaProvincia === 'Extranjero' && (
                    <div className="mt-4 bg-orange-100 p-3 rounded">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección Completa (Extranjero) <span className="text-red-500">*</span></label>
                        <textarea
                            value={empresaDireccion}
                            onChange={(e) => setEmpresaDireccion(e.target.value)}
                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm"
                            placeholder="Calle, número, código postal, país..."
                        />
                    </div>
                )}
            </div>
          </div>
        )}
        
        {/* DROPDOWN DE CONVENIOS */}
        {shouldUseConvenioDropdown && (
             <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                 <h3 className="text-sm font-bold text-gray-700 mb-2">Selección de Convenio <span className="text-red-500">*</span></h3>
                 {currentCentro?.convenios && currentCentro.convenios.length > 0 ? (
                     <select 
                        value={selectedConvenioList}
                        onChange={(e) => setSelectedConvenioList(e.target.value)}
                        className="block w-full border-gray-300 rounded-md shadow-sm border p-2 text-sm focus:ring-rayuela-500 focus:border-rayuela-500"
                     >
                         <option value="">-- Seleccione Convenio Vigente --</option>
                         {currentCentro.convenios.map(c => (
                             <option key={c} value={c}>{c}</option>
                         ))}
                     </select>
                 ) : (
                     <p className="text-sm text-red-500">Este centro no tiene convenios registrados.</p>
                 )}
             </div>
        )}

        {/* Student Selection */}
        {tipo !== TipoAnexo.ANEXO_V && (
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Alumnos (Solo FP)</label>
            <div className="relative mb-4">
                <div className="flex items-center border border-gray-300 rounded-md bg-white overflow-hidden focus-within:ring-2 focus-within:ring-rayuela-500">
                    <div className="pl-3 text-gray-400">
                        <Search className="h-4 w-4" />
                    </div>
                    <input 
                        type="text" 
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="Buscar por nombre o apellidos para añadir..."
                        className="w-full p-2 text-sm focus:outline-none"
                    />
                </div>
                {studentSearchTerm && availableToAdd.length > 0 && (
                    <div className="absolute z-10 w-full bg-white shadow-lg border border-gray-200 rounded-md mt-1 max-h-48 overflow-y-auto">
                        {availableToAdd.map(alumno => (
                            <button
                                key={alumno.dni}
                                type="button"
                                onClick={() => handleAddAlumno(alumno.dni)}
                                className="w-full text-left px-4 py-2 text-sm hover:bg-rayuela-50 transition-colors border-b border-gray-100 last:border-0"
                            >
                                <span className="font-bold text-gray-800">{alumno.apellidos}, {alumno.nombre}</span>
                                <span className="ml-2 text-gray-500 text-xs">({alumno.curso}) - {alumno.dni}</span>
                            </button>
                        ))}
                    </div>
                )}
            </div>
            {/* ... List of selected ... */}
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

        {/* File Upload (Modified to exclude types that use dropdown) */}
        {showFileUpload && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Documentación Adjunta</label>
          
          {tipo === TipoAnexo.ANEXO_II ? (
             <div className="space-y-4 mb-4">
                 {/* SOLO PLAN, CONVENIO ES DROPDOWN */}
                 <div className="border border-dashed border-purple-300 bg-purple-50 p-4 rounded text-center">
                    <p className="text-xs font-bold text-purple-800 mb-2">1. Plan Individual de Formación <span className="text-red-500">*</span></p>
                    <label className="cursor-pointer bg-white px-3 py-1 border border-purple-200 rounded text-xs font-medium text-purple-700 hover:bg-purple-50">
                            Seleccionar PDF
                            <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAddFile(e, 'PLAN')} />
                    </label>
                </div>
             </div>
          ) : tipo === TipoAnexo.ANEXO_IV_A ? (
             <div className="space-y-4 mb-4">
                 <div className="border border-dashed border-amber-300 bg-amber-50 p-4 rounded text-center">
                    <p className="text-xs font-bold text-amber-800 mb-2">1. Convenio con el Organismo Público <span className="text-red-500">*</span></p>
                    <label className="cursor-pointer bg-white px-3 py-1 border border-amber-200 rounded text-xs font-medium text-amber-700 hover:bg-amber-50">
                            Seleccionar PDF
                            <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAddFile(e, 'CONVENIO')} />
                    </label>
                 </div>
             </div>
          ) : !isAnexoVIII && (
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
          {/* List files ... */}
          {files.length > 0 ? (
             <ul className="space-y-2">
                 {files.map((f, idx) => (
                     <li key={idx} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                         <div className="flex items-center overflow-hidden">
                             <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                             <div className="truncate">
                                 <span className="text-sm text-gray-800 font-medium truncate">{f.file.name}</span>
                                 {f.type && <span className="ml-2 px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">{f.type}</span>}
                             </div>
                         </div>
                         <div className="flex items-center ml-2 space-x-1">
                             <button type="button" onClick={() => handleViewFile(f.file)} className="p-1 text-gray-400 hover:text-rayuela-600"><Eye className="h-4 w-4" /></button>
                             <button type="button" onClick={() => handleRemoveFile(idx)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                         </div>
                     </li>
                 ))}
             </ul>
          ) : (!shouldUseConvenioDropdown && tipo !== TipoAnexo.ANEXO_IV_A) && (
             <p className="text-sm text-gray-500 italic">No se han adjuntado documentos.</p>
          )}
        </div>
        )}

        {/* ... Footer ... */}
        <div className="border-t pt-4">
            <p className="text-sm text-gray-600 font-medium">Firmado por el Director:</p>
            <div className="flex items-center mt-2 text-gray-800 bg-gray-100 p-2 rounded w-fit px-4 border border-gray-300">
                <PenTool className="h-4 w-4 mr-2 text-gray-500" />
                <span className="font-bold">{currentCentro?.nombre_director || "Nombre Director No Disponible"}</span>
            </div>
        </div>

        <div className="flex justify-end pt-4 flex-col-reverse sm:flex-row">
          <button type="button" onClick={onClose} className="w-full sm:w-auto mt-2 sm:mt-0 bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mr-3">Cancelar</button>
          <button type="submit" className="w-full sm:w-auto bg-rayuela-700 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-rayuela-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rayuela-500"><Save className="h-4 w-4 inline mr-2" />Crear Solicitud</button>
        </div>
      </form>
    </div>
  );
};