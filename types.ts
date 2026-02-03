
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
  PENDIENTE_RESOLUCION_DG = 'PENDIENTE_RESOLUCION_DG',
  PENDIENTE_RESOLUCION_DELEGACION = 'PENDIENTE_RESOLUCION_DELEGACION',
  RESUELTA_POSITIVA = 'RESUELTA_POSITIVA',
  RESUELTA_NEGATIVA = 'RESUELTA_NEGATIVA',
  PENDIENTE_ANULACION = 'PENDIENTE_ANULACION',
  // ANULADA eliminada, unificada con PAPELERA
  PAPELERA = 'PAPELERA' 
}

export enum TipoAnexo {
  ANEXO_I = 'Anexo I - Solicitud de autorización de FEOE en curso único',
  ANEXO_II = 'Anexo II - Solicitud de autorización de FEOE en periodo intensivo',
  ANEXO_IV_A = 'Anexo IV-A - Solicitud de FEOE en Organismo Público',
  ANEXO_IV_B = 'Anexo IV-B - Solicitud de FEOE en el propio Centro Educativo',
  ANEXO_V = 'Anexo V - Solicitud de dualización de Ciclos Formativos',
  ANEXO_VIII_A = 'Anexo VIII-A - Solicitud condiciones extraordinarias',
  ANEXO_VIII_B = 'Anexo VIII-B Condiciones Extraordinarias mes de Julio',
  ANEXO_XIII = 'Anexo XIII - Solicitud de adaptación de periodo FEOE con alumnos NEFE'
}

export interface Centro {
  codigo: string;
  nombre: string;
  localidad: string;
  provincia: 'Badajoz' | 'Cáceres';
  nombre_director?: string;
  convenios?: string[]; // Nuevo: Lista de convenios disponibles
}

export interface Alumno {
  dni: string;
  nombre: string;
  apellidos: string;
  codigo_centro: string;
  curso: string;
  grupo: string;
  fecha_nacimiento?: string; // Nuevo: Para validación de edad 15/16 años
}

export interface Usuario {
  id: string;
  nombre: string;
  rol: Rol;
  codigo_centro?: string; 
  provincia?: 'Badajoz' | 'Cáceres'; 
}

export interface Documento {
  nombre: string;
  fecha: string;
  tipo?: string; 
  url?: string; 
}

export interface HistorialEntrada {
  fecha: string; 
  autor: string;
  rol: Rol;
  accion: string; 
  estado_nuevo: Estado;
  observaciones?: string;
}

export interface Solicitud {
  id: string;
  tipo_anexo: TipoAnexo;
  estado: Estado;
  fecha_creacion: string;
  codigo_centro: string;
  alumnos_implicados: string[]; 
  documentos_adjuntos: Documento[];
  historial: HistorialEntrada[];
  solicitante_anulacion?: string;
  leida: boolean; // Nuevo: Estado de lectura (Buzón)

  // Campos específicos
  motivo?: string;
  motivo_otros?: string;
  feoe_inicio?: string;
  feoe_fin?: string;
  numero_convenio?: string; // Ahora puede venir de un Select
  organismo_publico?: string;
  tutor_dual_destino?: string;
  centro_destino_codigo?: string;
  curso_dual?: string;
  condicion_extraordinaria?: string;
  justificacion_extraordinaria?: string;
  empresa_nombre?: string;
  empresa_localidad?: string;
  empresa_provincia?: string;
  empresa_direccion_extranjera?: string;
  tutor_empresa?: string;
  justificacion_nefe?: string;
  observaciones_inspeccion?: string;
  observaciones_resolucion?: string;
  autor_resolucion?: string;
}