import { Alumno, Centro, Solicitud, Usuario, Rol, Estado, TipoAnexo } from './types';

export const CENTROS: Centro[] = [
  { codigo: "06006899", nombre: "I.E.S. San Roque", localidad: "Badajoz", provincia: "Badajoz", nombre_director: "Director San Roque" },
  { codigo: "10000356", nombre: "I.E.S. Tierra de Barros", localidad: "Aceuchal", provincia: "Badajoz", nombre_director: "María González (Directora)" },
  { codigo: "10003789", nombre: "I.E.S. El Brocense", localidad: "Cáceres", provincia: "Cáceres", nombre_director: "Pedro Alcántara (Director)" }
];

export const ALUMNOS: Alumno[] = [
  { dni: "80247196N", nombre: "Juan", apellidos: "García Pérez", codigo_centro: "06006899", curso: "2º C.F.G.B.", grupo: "A" },
  { dni: "80238007T", nombre: "María", apellidos: "López Silva", codigo_centro: "06006899", curso: "2º C.F.G.B.", grupo: "A" },
  { dni: "12345678Z", nombre: "Carlos", apellidos: "Ruiz Mateos", codigo_centro: "10000356", curso: "2º DUAL", grupo: "B" },
  { dni: "87654321X", nombre: "Ana", apellidos: "Botella Aznar", codigo_centro: "10003789", curso: "1º SMR", grupo: "A" },
  { dni: "11111111H", nombre: "Laura", apellidos: "Gómez Redondo", codigo_centro: "06006899", curso: "1º DAM", grupo: "A" },
  { dni: "22222222J", nombre: "David", apellidos: "Fernández Mota", codigo_centro: "06006899", curso: "2º DAW", grupo: "C" },
  { dni: "33333333K", nombre: "Elena", apellidos: "Vázquez Soria", codigo_centro: "06006899", curso: "1º SMR", grupo: "B" }
];

export const USUARIOS_MOCK: Usuario[] = [
  { id: "dir_sanroque", nombre: "Director San Roque", rol: Rol.DIRECTOR, codigo_centro: "06006899" },
  { id: "dir_brocense", nombre: "Director Brocense", rol: Rol.DIRECTOR, codigo_centro: "10003789" },
  { id: "insp_badajoz", nombre: "Inspector Badajoz", rol: Rol.INSPECTOR, provincia: "Badajoz" },
  { id: "insp_caceres", nombre: "Inspector Cáceres", rol: Rol.INSPECTOR, provincia: "Cáceres" },
  { id: "del_badajoz", nombre: "Delegado Badajoz", rol: Rol.DELEGADO, provincia: "Badajoz" },
  { id: "del_caceres", nombre: "Delegado Cáceres", rol: Rol.DELEGADO, provincia: "Cáceres" },
  { id: "dg_fp", nombre: "Director General FP", rol: Rol.DG },
  { id: "superuser", nombre: "Servicios Centrales", rol: Rol.SUPERUSER },
];

export const SOLICITUDES_INICIALES: Solicitud[] = [
  {
    id: "2025-06006899-I-001",
    tipo_anexo: TipoAnexo.ANEXO_I,
    estado: Estado.PENDIENTE_RESOLUCION, 
    fecha_creacion: "2025-03-15",
    codigo_centro: "06006899",
    alumnos_implicados: ["80247196N"],
    documentos_adjuntos: [{ nombre: "memoria_proyecto.pdf", fecha: "2025-03-15" }],
    motivo: "Enfermedad, accidente o causas sobrevenidas",
    historial: [
      {
        fecha: "2025-03-15T10:00:00.000Z",
        autor: "Director San Roque",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_INSPECCION,
        accion: "Creación y Envío"
      },
      {
        fecha: "2025-03-16T10:00:00.000Z",
        autor: "Inspector Badajoz",
        rol: Rol.INSPECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION,
        accion: "Informe Favorable"
      }
    ]
  },
  {
    id: "2025-10003789-IVA-002",
    tipo_anexo: TipoAnexo.ANEXO_IV_A,
    estado: Estado.PENDIENTE_RESOLUCION, // Delegado
    fecha_creacion: "2025-03-20",
    codigo_centro: "10003789",
    alumnos_implicados: ["87654321X"],
    documentos_adjuntos: [],
    historial: [
      {
        fecha: "2025-03-20T09:30:00.000Z",
        autor: "Director Brocense",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION,
        accion: "Creación y Envío"
      }
    ]
  },
  {
    id: "2025-06006899-V-003",
    tipo_anexo: TipoAnexo.ANEXO_V,
    estado: Estado.RESUELTA_POSITIVA,
    fecha_creacion: "2025-02-10",
    codigo_centro: "06006899",
    alumnos_implicados: [], 
    documentos_adjuntos: [{ nombre: "compromiso_dual.pdf", fecha: "2025-02-10" }],
    historial: [
      {
        fecha: "2025-02-10T08:00:00.000Z",
        autor: "Director San Roque",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION,
        accion: "Creación y Envío"
      },
      {
        fecha: "2025-02-20T10:00:00.000Z",
        autor: "Director General FP",
        rol: Rol.DG,
        estado_nuevo: Estado.RESUELTA_POSITIVA,
        accion: "Resolución Estimatoria",
        observaciones: "Aprobado automáticamente por cumplimiento de plazas."
      }
    ]
  },
  // SOLICITUDES ANTIGUAS (MÁS DE 10 DÍAS)
  {
    id: "2025-06006899-II-OLD-1",
    tipo_anexo: TipoAnexo.ANEXO_II,
    estado: Estado.PENDIENTE_RESOLUCION,
    fecha_creacion: "2025-01-10",
    codigo_centro: "06006899",
    alumnos_implicados: ["80238007T"],
    feoe_inicio: "2025-02-01",
    feoe_fin: "2025-03-01",
    documentos_adjuntos: [],
    historial: [
      {
        fecha: "2025-01-10T09:00:00.000Z", // Más de 10 días
        autor: "Director San Roque",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION,
        accion: "Creación y Envío"
      }
    ]
  },
  {
    id: "2025-10003789-VIII-OLD-2",
    tipo_anexo: TipoAnexo.ANEXO_VIII_A,
    estado: Estado.PENDIENTE_RESOLUCION,
    fecha_creacion: "2025-01-15",
    codigo_centro: "10003789",
    alumnos_implicados: [],
    condicion_extraordinaria: "En días no lectivos",
    empresa_nombre: "Empresa Test Antigua",
    empresa_localidad: "Cáceres",
    empresa_provincia: "Cáceres",
    tutor_empresa: "Juan Antiguo",
    documentos_adjuntos: [],
    historial: [
       {
        fecha: "2025-01-15T09:00:00.000Z",
        autor: "Director Brocense",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_INSPECCION,
        accion: "Creación y Envío"
      },
      {
        fecha: "2025-01-20T10:00:00.000Z", // Más de 10 días desde el último cambio
        autor: "Inspector Cáceres",
        rol: Rol.INSPECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION,
        accion: "Informe Favorable"
      }
    ]
  }
];

// Helper to determine who resolves what
export const getResolverRole = (tipo: TipoAnexo): Rol | 'AUTO' => {
  switch (tipo) {
    case TipoAnexo.ANEXO_IV_A:
    case TipoAnexo.ANEXO_VIII_A:
      return Rol.DELEGADO; // IV-A y VIII-A resueltos por Delegado
    case TipoAnexo.ANEXO_I:
    case TipoAnexo.ANEXO_II:
    case TipoAnexo.ANEXO_IV_B:
    case TipoAnexo.ANEXO_V:
    case TipoAnexo.ANEXO_VIII_B:
    case TipoAnexo.ANEXO_XIII:
      return Rol.DG; // Resto resueltos por DG
    default:
      return Rol.DG;
  }
};