# Manual de Usuario: Gestor de Anexos FEOE
**Consejería de Educación - Plataforma Rayuela**  
**Versión del Manual:** 1.0  
**Fecha:** 03/02/2026

---

## Índice
1.  [Introducción](#1-introducción)
2.  [Acceso al Sistema](#2-acceso-al-sistema)
3.  [Panel Principal (Buzón de Solicitudes)](#3-panel-principal-buzón-de-solicitudes)
4.  [Creación de una Nueva Solicitud](#4-creación-de-una-nueva-solicitud)
5.  [Revisión y Tramitación](#5-revisión-y-tramitación)
6.  [Gestión de Datos Maestros](#6-gestión-de-datos-maestros)
7.  [Papelera de Reciclaje](#7-papelera-de-reciclaje)

---

## 1. Introducción
El **Gestor FEOE** es la herramienta diseñada para centralizar, digitalizar y agilizar la tramitación de los anexos para la Formación en Empresas u Organismos Equiparados. Permite la comunicación fluida entre los Centros Educativos, la Inspección y la Dirección General de FP.

---

## 2. Acceso al Sistema
Al acceder a la aplicación, se presenta una pantalla de selección de perfil (simulación de Login). El sistema adapta las funcionalidades según el rol del usuario seleccionado.

**Roles Disponibles:**
*   **Director:** Crea y envía solicitudes.
*   **Inspector:** Emite informes favorables/desfavorables.
*   **Delegado/DG:** Resuelve los expedientes.
*   **Servicios Centrales (Superusuario):** Administración y borrado definitivo.

> *[INSERTAR CAPTURA DE PANTALLA AQUÍ: Pantalla de Login con la cuadrícula de usuarios]*

---

## 3. Panel Principal (Buzón de Solicitudes)
Una vez dentro, el usuario accede al **Dashboard**. Este panel funciona con una metáfora de "Buzón de Correo Electrónico".

### Características Principales:
1.  **Estado de Lectura:**
    *   **Negrita / Fondo Blanco:** Solicitud **No Leída**.
    *   **Texto Normal / Fondo Gris:** Solicitud **Leída**.
    *   Puede cambiar el estado manualmente pulsando el icono del sobre (✉️) a la izquierda de cada fila.
2.  **Filtros:** Barra superior para filtrar por Centro, Alumno, Tipo de Anexo o Estado.
3.  **Indicadores de Estado:** Etiquetas de colores (Borrador, Pendiente, Resuelta, etc.).

> *[INSERTAR CAPTURA DE PANTALLA AQUÍ: Listado principal de solicitudes mostrando filas leídas y no leídas]*

---

## 4. Creación de una Nueva Solicitud
*(Solo disponible para el rol Director)*

Pulse el botón **"Nueva Solicitud"** en la parte superior derecha para abrir el formulario.

### Pasos Clave:
1.  **Selección de Tipo:** Elija el Anexo correspondiente (I, II, IV, VIII, etc.). El formulario cambiará dinámicamente según la elección.
2.  **Validación de Fechas:**
    *   El sistema **impide** seleccionar fechas en el mes de **Agosto** (inhábil).
    *   La fecha de inicio debe ser anterior a la de fin.
3.  **Selección de Alumnado:**
    *   Utilice el buscador para añadir alumnos.
    *   **Alerta de Edad:** Si añade un alumno de 15 años o menos (ej. DNI `87654321X`), aparecerá un aviso amarillo indicando: *"Cuidado el alumno... tiene 15 años..."*.
4.  **Documentación y Convenios:**
    *   Para Anexos II, IV-B y VIII, seleccione el **Número de Convenio** del desplegable (datos precargados del centro).
    *   Para otros anexos, suba los archivos PDF requeridos.

> *[INSERTAR CAPTURA DE PANTALLA AQUÍ: Formulario de creación mostrando la alerta de edad y el desplegable de convenios]*

---

## 5. Revisión y Tramitación
Al hacer clic en una solicitud ("Ver"), se accede al **Panel de Detalle**.

### Funcionalidades:
*   **Generar PDF:** Botón en la cabecera para descargar un resumen de la solicitud.
*   **Historial:** Trazabilidad completa de quién creó, revisó o resolvió la solicitud.
*   **Acciones (según estado y rol):**
    *   **Director:** Enviar a Inspección/Resolución, Editar (si es borrador) o Solicitar Anulación.
    *   **Inspector:** Emitir Informe Favorable o Desfavorable.
    *   **DG / Delegado:** Emitir Resolución Estimatoria (Aprobar) o Desestimatoria (Denegar).

> *[INSERTAR CAPTURA DE PANTALLA AQUÍ: Panel de detalle de una solicitud]*

---

## 6. Gestión de Datos Maestros
*(Accesible para Directores y Administradores)*

Desde el menú lateral, acceda a "Gestión de Datos". Aquí puede dar de alta o baja:
*   **Centros Educativos:** Gestión de códigos y nombres.
*   **Alumnado:** Gestión de alumnos matriculados en FP para que aparezcan en las búsquedas.

> *[INSERTAR CAPTURA DE PANTALLA AQUÍ: Pantalla de gestión de datos (tablas de alumnos/centros)]*

---

## 7. Papelera de Reciclaje
*(Exclusivo para Servicios Centrales / Superusuario)*

Las solicitudes que son eliminadas o anuladas no desaparecen del sistema inmediatamente, sino que van a la **Papelera**.

*   **Restaurar:** Devuelve la solicitud al estado "Borrador".
*   **Eliminar Definitivamente:** Borra los datos permanentemente de la base de datos. Acción irreversible.

> *[INSERTAR CAPTURA DE PANTALLA AQUÍ: Pantalla de la papelera de reciclaje]*

---
**Soporte Técnico:** Para incidencias, contacte con CAU Rayuela.
