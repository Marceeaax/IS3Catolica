# Instrucciones para Configurar la Base de Datos SQLite

## Instalación de Dependencias
Ejecuta el siguiente comando para instalar la librería `sqlite3`:
```bash
npm install sqlite3
```

## Proceso de implementación
### 1. Crear la Base de Datos

- Asegúrate de que el archivo `crebas.sql` se encuentre en la carpeta `db`.
- Ejecuta el script `crebas.js` para crear las tablas en la base de datos:

```bash
node db/crebas.js
```

### 2. Insertar los datos

- Asegúrate de que el archivo `inserts.sql` también esté en la carpeta db.
- Ejecuta el script `inserts.js` para insertar los datos iniciales:

```bash
node db/inserts.js
```

### 3. Ejecutar la aplicacion

- Una vez que la base de datos esté configurada e inicializada, ejecuta tu aplicación Node.js con el siguiente comando:

```bash
npm run dev
```

Este comando ejecutará el servidor de desarrollo y permitirá la conexión a la base de datos SQLite para consultar, insertar, actualizar o eliminar datos según sea necesario
