
import { Alumno, Centro, Solicitud, Usuario, Rol, Estado, TipoAnexo } from './types';

export const CENTROS: Centro[] = [
  { 
    codigo: "06006899", 
    nombre: "I.E.S. San Roque", 
    localidad: "Badajoz", 
    provincia: "Badajoz", 
    nombre_director: "Director San Roque",
    convenios: ["10013410-1", "10013410-2", "10013410-3"]
  },
  { 
    codigo: "10000356", 
    nombre: "I.E.S. Tierra de Barros", 
    localidad: "Aceuchal", 
    provincia: "Badajoz", 
    nombre_director: "María González (Directora)",
    convenios: ["20025678-A", "20025678-B"]
  },
  { 
    codigo: "10003789", 
    nombre: "I.E.S. El Brocense", 
    localidad: "Cáceres", 
    provincia: "Cáceres", 
    nombre_director: "Pedro Alcántara (Director)",
    convenios: ["30039999-X", "30039999-Y", "30039999-Z"]
  }
];

export const ALUMNOS: Alumno[] = [
  { dni: "80247196N", nombre: "Juan", apellidos: "García Pérez", codigo_centro: "06006899", curso: "2º C.F.G.B.", grupo: "A", fecha_nacimiento: "2007-05-15" },
  { dni: "80238007T", nombre: "María", apellidos: "López Silva", codigo_centro: "06006899", curso: "2º C.F.G.B.", grupo: "A", fecha_nacimiento: "2006-10-20" },
  { dni: "12345678Z", nombre: "Carlos", apellidos: "Ruiz Mateos", codigo_centro: "10000356", curso: "2º DUAL", grupo: "B", fecha_nacimiento: "2005-01-01" },
  // Ana Botella -> DNI Solicitado para alerta de 15 años
  { dni: "87654321X", nombre: "Ana", apellidos: "Botella Aznar", codigo_centro: "10003789", curso: "1º SMR", grupo: "A", fecha_nacimiento: "2010-06-15" }, 
  { dni: "11111111H", nombre: "Laura", apellidos: "Gómez Redondo", codigo_centro: "06006899", curso: "1º DAM", grupo: "A", fecha_nacimiento: "2000-12-12" },
  { dni: "22222222J", nombre: "David", apellidos: "Fernández Mota", codigo_centro: "06006899", curso: "2º DAW", grupo: "C", fecha_nacimiento: "2002-03-30" },
  { dni: "33333333K", nombre: "Elena", apellidos: "Vázquez Soria", codigo_centro: "06006899", curso: "1º SMR", grupo: "B", fecha_nacimiento: "2008-01-01" }
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

const BASE_SOLICITUDES: Solicitud[] = [
  {
    id: "2025-06006899-I-001",
    tipo_anexo: TipoAnexo.ANEXO_I,
    estado: Estado.PENDIENTE_RESOLUCION_DG, 
    fecha_creacion: "2025-03-15",
    codigo_centro: "06006899",
    alumnos_implicados: ["80247196N"],
    documentos_adjuntos: [{ nombre: "memoria_proyecto.pdf", fecha: "2025-03-15" }],
    motivo: "Enfermedad, accidente o causas sobrevenidas",
    leida: false,
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
        estado_nuevo: Estado.PENDIENTE_RESOLUCION_DG,
        accion: "Informe Favorable"
      }
    ]
  },
  {
    id: "2025-10003789-IVA-002",
    tipo_anexo: TipoAnexo.ANEXO_IV_A,
    estado: Estado.PENDIENTE_RESOLUCION_DELEGACION, // IV-A es Delegado
    fecha_creacion: "2025-03-20",
    codigo_centro: "10003789",
    alumnos_implicados: ["87654321X"],
    documentos_adjuntos: [],
    leida: true,
    historial: [
      {
        fecha: "2025-03-20T09:30:00.000Z",
        autor: "Director Brocense",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION_DELEGACION,
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
    leida: true,
    historial: [
      {
        fecha: "2025-02-10T08:00:00.000Z",
        autor: "Director San Roque",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION_DG,
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
  {
    id: "2025-06006899-II-OLD-1",
    tipo_anexo: TipoAnexo.ANEXO_II,
    estado: Estado.PENDIENTE_RESOLUCION_DG,
    fecha_creacion: "2025-01-10",
    codigo_centro: "06006899",
    alumnos_implicados: ["80238007T"],
    feoe_inicio: "2025-02-01",
    feoe_fin: "2025-03-01",
    documentos_adjuntos: [],
    leida: false,
    historial: [
      {
        fecha: "2025-01-10T09:00:00.000Z",
        autor: "Director San Roque",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION_DG,
        accion: "Creación y Envío"
      }
    ]
  },
  {
    id: "2025-10003789-VIII-OLD-2",
    tipo_anexo: TipoAnexo.ANEXO_VIII_A,
    estado: Estado.PENDIENTE_RESOLUCION_DELEGACION, // VIII-A Delegado
    fecha_creacion: "2025-01-15",
    codigo_centro: "10003789",
    alumnos_implicados: [],
    condicion_extraordinaria: "En días no lectivos",
    empresa_nombre: "Empresa Test Antigua",
    empresa_localidad: "Cáceres",
    empresa_provincia: "Cáceres",
    tutor_empresa: "Juan Antiguo",
    documentos_adjuntos: [],
    leida: false,
    historial: [
       {
        fecha: "2025-01-15T09:00:00.000Z",
        autor: "Director Brocense",
        rol: Rol.DIRECTOR,
        estado_nuevo: Estado.PENDIENTE_INSPECCION,
        accion: "Creación y Envío"
      },
      {
        fecha: "2025-01-20T10:00:00.000Z", 
        autor: "Inspector Cáceres",
        rol: Rol.INSPECTOR,
        estado_nuevo: Estado.PENDIENTE_RESOLUCION_DELEGACION,
        accion: "Informe Favorable"
      }
    ]
  }
];

// Generar 15 solicitudes mock adicionales
const generateMockRequests = (): Solicitud[] => {
  const mocks: Solicitud[] = [];
  const estados = Object.values(Estado);
  const tipos = Object.values(TipoAnexo);
  
  for (let i = 1; i <= 15; i++) {
    const estadoRandom = estados[i % estados.length];
    const tipoRandom = tipos[i % tipos.length];
    const anexoCode = tipoRandom.split(' ')[1] || 'GEN';
    
    // Generar fecha escalonada
    const day = 10 + i;
    const fecha = `2025-04-${day < 10 ? '0' + day : day}`;

    mocks.push({
      id: `2025-10003789-${anexoCode}-${i + 100}`,
      tipo_anexo: tipoRandom,
      estado: estadoRandom,
      fecha_creacion: fecha,
      codigo_centro: "10003789", 
      alumnos_implicados: i % 2 === 0 ? ["87654321X"] : [], 
      documentos_adjuntos: [],
      motivo: tipoRandom === TipoAnexo.ANEXO_I ? "Insuficiencia de plazas formativas..." : undefined,
      condicion_extraordinaria: tipoRandom === TipoAnexo.ANEXO_VIII_A ? "En días no lectivos" : undefined,
      empresa_nombre: `Empresa Mock ${i}`,
      empresa_provincia: "Cáceres",
      empresa_localidad: "Cáceres",
      tutor_empresa: "Tutor Mock",
      leida: i % 3 === 0,
      historial: [
        {
          fecha: `${fecha}T09:00:00.000Z`,
          autor: "Director Brocense",
          rol: Rol.DIRECTOR,
          estado_nuevo: Estado.BORRADOR,
          accion: "Generación Automática Mock"
        }
      ]
    });
  }
  return mocks;
};

export const SOLICITUDES_INICIALES = [...BASE_SOLICITUDES, ...generateMockRequests()];

export const getTargetResolutionState = (tipo: TipoAnexo): Estado => {
  switch (tipo) {
    case TipoAnexo.ANEXO_IV_A:
    case TipoAnexo.ANEXO_VIII_A:
      return Estado.PENDIENTE_RESOLUCION_DELEGACION;
    
    case TipoAnexo.ANEXO_I:
    case TipoAnexo.ANEXO_II:
    case TipoAnexo.ANEXO_IV_B:
    case TipoAnexo.ANEXO_V:
    case TipoAnexo.ANEXO_VIII_B:
    case TipoAnexo.ANEXO_XIII:
      return Estado.PENDIENTE_RESOLUCION_DG;
      
    default:
      return Estado.PENDIENTE_RESOLUCION_DG;
  }
};
