export enum Rol {
  DIRECTOR = 'DIRECTOR',
  INSPECTOR = 'INSPECTOR',
  DELEGADO = 'DELEGADO',
  DG = 'DG', // Director General
  SUPERUSER = 'SUPERUSER' // Servicios Centrales
}

export enum Estado {
  BORRADOR = 'BORRADOR',
  PENDIENTE_INSPECCION = 'PENDIENTE_INSPECCION',
  PENDIENTE_RESOLUCION = 'PENDIENTE_RESOLUCION',
  RESUELTA_POSITIVA = 'RESUELTA_POSITIVA',
  RESUELTA_NEGATIVA = 'RESUELTA_NEGATIVA'
}

export enum TipoAnexo {
  ANEXO_I = 'Anexo I - Solicitud de autorización de FEOE en curso único',
  ANEXO_II = 'Anexo II - Solicitud de autorización de FEOE en periodo intensivo',
  ANEXO_IV_A = 'Anexo IV-A - Solicitud de FEOE en Organismo Público',
  ANEXO_IV_B = 'Anexo IV-B - Solicitud de FEOE en el propio Centro Educativo',
  ANEXO_V = 'Anexo V - Solicitud de dualización de Ciclos Formativos',
  ANEXO_VIII_A = 'Anexo VIII-A - Solicitud condiciones extraordinarias',
  ANEXO_VIII_B = 'Anexo VIII-B Condiciones Extraordinarias mes de Julio',
  // ANEXO_IX eliminado
  ANEXO_XIII = 'Anexo XIII - Solicitud de adaptación de periodo FEOE con alumnos NEFE'
}

export interface Centro {
  codigo: string;
  nombre: string;
  localidad: string;
  provincia: 'Badajoz' | 'Cáceres';
  nombre_director?: string; // Nuevo campo
}

export interface Alumno {
  dni: string;
  nombre: string;
  apellidos: string;
  codigo_centro: string;
  curso: string;
  grupo: string;
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  // Contexto del usuario
  codigo_centro?: string; // Para directores
  provincia?: 'Badajoz' | 'Cáceres'; // Para inspectores/delegados
}

export interface Documento {
  nombre: string;
  fecha: string;
  tipo?: string; // Nuevo: Para categorizar documentos (ej: 'CONVENIO', 'PLAN')
  url?: string; // Simulación de URL
}

export interface HistorialEntrada {
  fecha: string; // ISO String
  autor: string;
  rol: Rol;
  accion: string; // "Creación", "Informe Favorable", "Resolución Positiva", etc.
  estado_nuevo: Estado;
  observaciones?: string;
}

export interface Solicitud {
  id: string;
  tipo_anexo: TipoAnexo;
  estado: Estado;
  fecha_creacion: string;
  codigo_centro: string;
  alumnos_implicados: string[]; // DNIs
  documentos_adjuntos: Documento[];
  historial: HistorialEntrada[]; // Nuevo campo de trazabilidad
  // Campos específicos Anexo I
  motivo?: string;
  motivo_otros?: string;
  // Campos específicos Anexo II y XIII
  feoe_inicio?: string;
  feoe_fin?: string;
  // Campos específicos Anexo IV-A
  numero_convenio?: string;
  organismo_publico?: string;
  // Campos específicos Anexo IV-B
  tutor_dual_destino?: string;
  centro_destino_codigo?: string;
  // Campos específicos Anexo V
  curso_dual?: string;
  // Campos específicos Anexo VIII-A y VIII-B
  condicion_extraordinaria?: string;
  justificacion_extraordinaria?: string;
  empresa_nombre?: string;
  empresa_localidad?: string;
  empresa_provincia?: string;
  empresa_direccion_extranjera?: string;
  tutor_empresa?: string;
  // Campos específicos Anexo XIII
  justificacion_nefe?: string;
  // Campos de observaciones/resolución
  observaciones_inspeccion?: string;
  observaciones_resolucion?: string;
  autor_resolucion?: string;
}