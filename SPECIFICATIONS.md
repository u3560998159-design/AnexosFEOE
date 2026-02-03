# Documento de Especificación de Requisitos de Software (SRS)
## Módulo de Gestión de Anexos FEOE (Rayuela)

| Metadato | Detalle |
| :--- | :--- |
| **Proyecto** | Integración FEOE - Plataforma Rayuela |
| **Versión del Documento** | 1.1 (Revisión Técnica) |
| **Fecha** | 03/02/2026 |
| **Estado** | Aprobado para Desarrollo |
| **Destinatario** | Equipo de Ingeniería de Software / Integración |

---

## 1. Introducción

### 1.1 Propósito
El propósito de este documento es definir los requisitos funcionales, no funcionales y de interfaz para el subsistema de **Gestión de Anexos de Formación en Empresas u Organismos Equiparados (FEOE)**. Este módulo permitirá la digitalización completa del ciclo de vida de las solicitudes de autorización extraordinaria, eliminando el flujo en papel y centralizando la gestión en la plataforma educativa Rayuela.

### 1.2 Alcance
El sistema abarca desde la creación del borrador por parte de los Centros Educativos, pasando por la supervisión de la Inspección Educativa, hasta la resolución final por parte de la Dirección General de Formación Profesional o las Delegaciones Provinciales. Incluye gestión de documentos, validaciones de negocio específicas (edad, fechas) y un sistema de "papelera de reciclaje" lógico.

---

## 2. Descripción General del Sistema

### 2.1 Pila Tecnológica (Prototipo Entregado)
El prototipo de referencia ha sido desarrollado utilizando:
*   **Frontend:** React 19, TypeScript.
*   **Estilos:** Tailwind CSS (Sistema de diseño basado en la paleta corporativa "Rayuela Purple").
*   **Iconografía:** Lucide React.
*   **Build Tool:** Vite.

### 2.2 Actores y Permisos
El sistema implementa un control de acceso basado en roles (RBAC):

| Rol | Código | Responsabilidades |
| :--- | :--- | :--- |
| **Director Centro** | `DIRECTOR` | CRUD de solicitudes propias (Borrador), Subsanación, Consulta. |
| **Inspector** | `INSPECTOR` | Revisión de Anexos VIII/XIII, Emisión de Informes (Favorable/Desfavorable). |
| **Delegado Prov.** | `DELEGADO` | Resolución de Anexos IV-A y VIII-A (Ámbito Provincial). |
| **Director General** | `DG` | Resolución de Anexos I, II, IV-B, V, VIII-B, XIII (Ámbito Regional). |
| **Servicios Centrales** | `SUPERUSER`| Administración, Gestión de Datos Maestros, Borrado Físico. |

---

## 3. Requisitos Funcionales (RF)

### RF-01: Gestión de Solicitudes (Dashboard)
*   **RF-01.1:** El sistema debe presentar un listado de solicitudes filtrable por Estado, Tipo de Anexo, Centro y Alumno.
*   **RF-01.2 (Estado de Lectura):** El sistema debe diferenciar visualmente entre solicitudes "Leídas" y "No Leídas".
    *   *Comportamiento:* Al crear una solicitud, nace como "Leída" para el autor. Al cambiar de estado por un actor externo, debe marcarse como "No Leída" para el destinatario.
    *   *Interfaz:* Texto en negrita para no leídos. Botón manual (toggle) en el listado.
*   **RF-01.3:** Se debe implementar un sistema de paginación o scroll virtual para grandes volúmenes de datos.

### RF-02: Creación y Edición de Solicitudes
*   **RF-02.1:** El formulario debe ser dinámico según el `TipoAnexo` seleccionado.
*   **RF-02.2 (Selección de Convenios):** Para Anexos II, IV-B, VIII-A y VIII-B, el campo "Número de Convenio" debe ser un desplegable (`<select>`) alimentado por la entidad `Centro.convenios`. No se permite entrada libre ni subida de PDF para estos casos.
*   **RF-02.3 (Carga de Documentos):**
    *   Anexo IV-A: Requiere subida de PDF de Convenio específico.
    *   Anexo II: Requiere subida de PDF "Plan Individual".
    *   Anexo I: Requiere subida de justificación genérica.

### RF-03: Validaciones de Negocio (Bloqueantes)
El sistema debe validar en cliente y servidor las siguientes reglas antes de permitir el cambio de estado o guardado:

*   **RN-01 (Inhabilidad de Agosto):** Las fechas `feoe_inicio` y `feoe_fin` no pueden pertenecer al mes de Agosto (Mes 8).
*   **RN-02 (Coherencia Temporal):** `feoe_inicio` < `feoe_fin`.
*   **RN-03 (Edad del Alumno):** 
    *   Al seleccionar un alumno, se debe verificar su `fecha_nacimiento`.
    *   Si edad <= 15 años: Mostrar **Alerta Visual (Toast/Banner Amarillo)**: *"Cuidado el alumno [Nombre] tiene 15 años, asegúrese de que en la fecha de inicio de FEOE haya cumplido 16 años"*.
    *   Esta alerta no es bloqueante para el guardado, pero sí obligatoria de mostrar.
*   **RN-04 (Justificación):**
    *   Anexo VIII-B: Campo `justificacion_extraordinaria` siempre obligatorio.
    *   Anexo I: Si `motivo` == "Otros", campo `motivo_otros` obligatorio.

### RF-04: Máquina de Estados (Workflow)
El ciclo de vida de la entidad `Solicitud` se rige por la siguiente máquina de estados:

1.  `BORRADOR` -> Acción: "Enviar" -> `PENDIENTE_INSPECCION` (Si requiere informe) o `PENDIENTE_RESOLUCION_X`.
2.  `PENDIENTE_INSPECCION` -> Acción: "Informe" -> `PENDIENTE_RESOLUCION_X`.
3.  `PENDIENTE_RESOLUCION_X` -> Acción: "Resolver" -> `RESUELTA_POSITIVA` o `RESUELTA_NEGATIVA`.
4.  **Flujo de Cancelación:**
    *   Cualquier Estado (salvo Papelera) -> Acción: "Solicitar Anulación" (Director) -> `PENDIENTE_ANULACION`.
    *   `PENDIENTE_ANULACION` -> Acción: "Confirmar" (Superuser) -> `PAPELERA`.
5.  **Borrado Lógico:**
    *   Acción: "Eliminar" (Soft Delete) -> `PAPELERA`.

### RF-05: Papelera de Reciclaje
*   **RF-05.1:** Las solicitudes en estado `PAPELERA` no deben aparecer en el Dashboard principal.
*   **RF-05.2:** Solo el rol `SUPERUSER` tiene acceso a la vista de Papelera.
*   **RF-05.3:** Funcionalidad de **Restaurar**: Devuelve la solicitud al estado `BORRADOR`.
*   **RF-05.4:** Funcionalidad de **Borrado Físico**: Elimina el registro de la base de datos permanentemente.

---

## 4. Modelo de Datos (Entidades Principales)

### 4.1 Solicitud
```typescript
interface Solicitud {
  id: string;                 // Formato: YYYY-COD_CENTRO-TIPO-SEQ
  tipo_anexo: Enum;           // I, II, IV_A, IV_B, V, VIII_A, VIII_B, XIII
  estado: Enum;               // BORRADOR, PENDIENTE_..., RESUELTA_..., PAPELERA
  leida: boolean;             // Flag de lectura
  codigo_centro: string;      // FK Centro
  alumnos_implicados: string[]; // Array de DNIs
  historial: HistorialEntrada[]; // Trazabilidad completa
  // ... campos específicos (motivo, fechas, empresa, etc.)
}
```

### 4.2 Centro
```typescript
interface Centro {
  codigo: string;             // PK
  nombre: string;
  localidad: string;
  provincia: 'Badajoz' | 'Cáceres';
  convenios: string[];        // Lista de códigos de convenios vigentes
}
```

### 4.3 Alumno
```typescript
interface Alumno {
  dni: string;                // PK
  nombre: string;
  apellidos: string;
  fecha_nacimiento: string;   // ISO Date (YYYY-MM-DD) para cálculo de edad
  codigo_centro: string;      // FK Centro
  curso: string;
}
```

---

## 5. Requisitos de Interfaz (UI/UX)

### 5.1 Identidad Visual
*   Uso estricto de la paleta de colores corporativa (Rayuela Purple).
*   Feedback al usuario mediante componentes **Toast** (Notificaciones emergentes) para acciones de éxito (Verde), error (Rojo) o advertencia (Ámbar).

### 5.2 Diseño Responsivo
*   La aplicación debe ser funcional en resoluciones de escritorio (>1024px) y tabletas (>768px).
*   El menú lateral debe ser colapsable en dispositivos móviles.

---

## 6. Historial de Revisiones

*   **v1.0:** Definición inicial de requisitos.
*   **v1.1:**
    *   Eliminación de estado `ANULADA` en favor de `PAPELERA`.
    *   Inclusión de lógica "Leído/No Leído".
    *   Especificación de alerta de edad (15 años).
    *   Cambio de input de archivo por desplegable para Convenios.
    *   Restricción de permisos de "Forzar Estado" para Superuser.
