import React, { useState } from 'react';
import { Usuario, TipoAnexo, Estado, Solicitud, HistorialEntrada, Alumno, Documento, Centro } from '../types';
import { Save, ArrowLeft, Upload, AlertCircle, FileText, Trash2, Eye, Calendar, UserPlus, Building2, School, GraduationCap, Globe } from 'lucide-react';

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
  type?: string; // Para Anexo II, IV-A, VIII-A
}

export const RequestForm: React.FC<RequestFormProps> = ({ user, alumnos, centros, onClose, onSubmit }) => {
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

  // Estados Anexo IV-A
  const [numeroConvenio, setNumeroConvenio] = useState('');
  const [organismoPublico, setOrganismoPublico] = useState('');

  // Estados Anexo IV-B
  const [tutorDestino, setTutorDestino] = useState('');
  const [centroDestino, setCentroDestino] = useState('');

  // Estados Anexo V
  const [cursoDual, setCursoDual] = useState('');

  // Estados Anexo VIII-A
  const [extraCondicion, setExtraCondicion] = useState('');
  const [extraJustificacion, setExtraJustificacion] = useState('');
  const [empresaNombre, setEmpresaNombre] = useState('');
  const [empresaLocalidad, setEmpresaLocalidad] = useState('');
  const [empresaProvincia, setEmpresaProvincia] = useState('');
  const [empresaDireccion, setEmpresaDireccion] = useState('');
  const [tutorEmpresa, setTutorEmpresa] = useState('');


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
        // No se requiere archivo
    }

    // Validación Anexo V
    if (tipo === TipoAnexo.ANEXO_V) {
        if (!cursoDual) {
            setError("Debe seleccionar el Ciclo Formativo para la dualización.");
            return;
        }
        // No se requiere archivo
    }

    // Validación Anexo VIII-A
    if (tipo === TipoAnexo.ANEXO_VIII_A) {
        if (!extraCondicion) {
            setError("Debe seleccionar una condición extraordinaria.");
            return;
        }
        if (extraCondicion === 'Otros supuestos que se determinen' && !extraJustificacion.trim()) {
            setError("Debe justificar la condición extraordinaria si selecciona 'Otros'.");
            return;
        }
        if (!empresaNombre.trim()) { setError("El nombre de la empresa es obligatorio."); return; }
        if (!empresaLocalidad.trim()) { setError("La localidad de la empresa es obligatoria."); return; }
        if (!empresaProvincia) { setError("La provincia es obligatoria."); return; }
        if (empresaProvincia === 'Extranjero' && !empresaDireccion.trim()) { setError("Debe indicar la dirección completa si es en el extranjero."); return; }
        if (!tutorEmpresa.trim()) { setError("El tutor/a de la empresa es obligatorio."); return; }

        const hasConvenio = files.some(f => f.type === 'CONVENIO');
        if (!hasConvenio) {
            setError("Para el Anexo VIII-A es obligatorio subir el Convenio.");
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
      numero_convenio: tipo === TipoAnexo.ANEXO_IV_A ? numeroConvenio : undefined,
      organismo_publico: tipo === TipoAnexo.ANEXO_IV_A ? organismoPublico : undefined,
      tutor_dual_destino: tipo === TipoAnexo.ANEXO_IV_B ? tutorDestino : undefined,
      centro_destino_codigo: tipo === TipoAnexo.ANEXO_IV_B ? centroDestino : undefined,
      curso_dual: tipo === TipoAnexo.ANEXO_V ? cursoDual : undefined,
      condicion_extraordinaria: tipo === TipoAnexo.ANEXO_VIII_A ? extraCondicion : undefined,
      justificacion_extraordinaria: tipo === TipoAnexo.ANEXO_VIII_A ? extraJustificacion : undefined,
      empresa_nombre: tipo === TipoAnexo.ANEXO_VIII_A ? empresaNombre : undefined,
      empresa_localidad: tipo === TipoAnexo.ANEXO_VIII_A ? empresaLocalidad : undefined,
      empresa_provincia: tipo === TipoAnexo.ANEXO_VIII_A ? empresaProvincia : undefined,
      empresa_direccion_extranjera: (tipo === TipoAnexo.ANEXO_VIII_A && empresaProvincia === 'Extranjero') ? empresaDireccion : undefined,
      tutor_empresa: tipo === TipoAnexo.ANEXO_VIII_A ? tutorEmpresa : undefined,
    };

    onSubmit(newRequest);
  };

  const showFileUpload = tipo !== TipoAnexo.ANEXO_IV_B && tipo !== TipoAnexo.ANEXO_V;

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
              setNumeroConvenio(''); setOrganismoPublico('');
              setTutorDestino(''); setCentroDestino('');
              setCursoDual('');
              setExtraCondicion(''); setExtraJustificacion(''); setEmpresaNombre(''); setEmpresaLocalidad(''); setEmpresaProvincia(''); setEmpresaDireccion(''); setTutorEmpresa('');
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
                     <p className="text-xs text-gray-500 mt-1 italic">
                        (Identificar ministerio, consejería, diputación, entre otros y sección o servicio, localidad, etc.)
                    </p>
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

            <div className="bg-white p-4 border border-indigo-200 rounded text-sm text-gray-700 space-y-3">
                <p>
                    Se solicita la Dualización del Ciclo Formativo arriba indicado, aceptando el compromiso de implantar esta dualización siendo de carácter voluntario.
                </p>
                <p>
                    Las condiciones y características de esta dualización quedarán recogidas en el plan marco de formación de la oferta que se adjunta a este compromiso.
                </p>
                <p className="font-semibold">
                    Las horas mínimas establecidas de FEOE en el caso de ciclos LOGSE en este compromiso serán las siguientes:
                </p>
            </div>

            <div className="overflow-hidden border border-indigo-200 rounded-md">
                <table className="min-w-full divide-y divide-indigo-200 text-sm">
                    <thead className="bg-indigo-100">
                        <tr>
                            <th className="px-4 py-2 text-left font-semibold text-indigo-900">CICLO FORMATIVO LOGSE</th>
                            <th className="px-4 py-2 text-center font-semibold text-indigo-900">HORAS MÍNIMAS DE ESTANCIA FEOE</th>
                            <th className="px-4 py-2 text-center font-semibold text-indigo-900">CURSO</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-indigo-100">
                        <tr>
                            <td className="px-4 py-2">CUIDADOS AUXILIARES DE ENFERMERÍA</td>
                            <td className="px-4 py-2 text-center">100</td>
                            <td className="px-4 py-2 text-center">1º</td>
                        </tr>
                        <tr>
                            <td className="px-4 py-2">DIETÉTICA</td>
                            <td className="px-4 py-2 text-center">260</td>
                            <td className="px-4 py-2 text-center">1º Y 2º</td>
                        </tr>
                    </tbody>
                </table>
            </div>

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

        {/* ANEXO VIII-A Fields */}
        {tipo === TipoAnexo.ANEXO_VIII_A && (
          <div className="bg-orange-50 p-4 rounded-md border border-orange-100 space-y-4">
             <h3 className="text-sm font-bold text-orange-800 flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                Condiciones Extraordinarias
            </h3>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Condición <span className="text-red-500">*</span></label>
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
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Justificación <span className="text-xs font-normal text-gray-500">(Obligatorio si selecciona 'Otros')</span></label>
                <textarea
                    value={extraJustificacion}
                    onChange={(e) => setExtraJustificacion(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 border p-2 text-sm h-20"
                    placeholder="Especifique los motivos..."
                />
            </div>

            <div className="border-t border-orange-200 pt-4 mt-2">
                <h4 className="text-xs font-bold text-orange-700 uppercase mb-3">Datos de la Empresa</h4>
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

        {/* File Upload Section - Only for types that require it */}
        {showFileUpload && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Documentación Adjunta</label>
          
          {tipo === TipoAnexo.ANEXO_II ? (
             <div className="space-y-4 mb-4">
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
          ) : tipo === TipoAnexo.ANEXO_IV_A || tipo === TipoAnexo.ANEXO_VIII_A ? (
             <div className="space-y-4 mb-4">
                 <div className={`border border-dashed ${tipo === TipoAnexo.ANEXO_VIII_A ? 'border-orange-300 bg-orange-50' : 'border-amber-300 bg-amber-50'} p-4 rounded text-center`}>
                    <p className={`text-xs font-bold ${tipo === TipoAnexo.ANEXO_VIII_A ? 'text-orange-800' : 'text-amber-800'} mb-2`}>
                        {tipo === TipoAnexo.ANEXO_VIII_A ? "Subir Convenio" : "1. Convenio con el Organismo Público"} <span className="text-red-500">*</span>
                    </p>
                    <label className={`cursor-pointer bg-white px-3 py-1 border rounded text-xs font-medium hover:bg-gray-50 ${tipo === TipoAnexo.ANEXO_VIII_A ? 'border-orange-200 text-orange-700' : 'border-amber-200 text-amber-700'}`}>
                            Seleccionar PDF
                            <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleAddFile(e, 'CONVENIO')} />
                    </label>
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
        )}

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