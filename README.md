# Instrucciones para montaje de proyecto

Para correr el proyecto en un entorno de desarrollo, es necesario tener preinstalado:
- `git`
- `npm`
- Un IDE

## Clonar el proyecto
```bash
git clone https://gitlab.com/cacereslujann/03-y-18624-motor-plantillas
```

## Instalación de Dependencias

Ejecuta el siguiente comando para instalar la librería `nodemon`, para renderizar automaticamente las paginas cuando se producen cambios en el proyecto:
```bash
npm install nodemon
```

Ejecuta el siguiente comando para instalar la librería `sqlite3`, que es el motor de base de datos utilizada para el proyecto:
```bash
npm install sqlite3
```

Es probable que tambien necesites instalar `express`, que es un framework de Node.js utilizado para construir aplicaciones web, y `hbs`, que es un motor de plantillas para Express.js utilizado para generar vistas dinámicas en HTML. Puedes hacerlo utilizando los dos comandos anteriores

## Proceso de implementación

En este proyecto se utiliza el motor de base de datos SQLite para almacenar los datos de los integrantes. Se tienen:

- 3 archivos JavaScript para la conexion, creacion e insercion de datos
- 2 scripts SQL para la creacion e insercion de datos
- Un diagrama de entidad de relacion en formato jpg como referencia para la implementacion de la base de datos

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

### 3. Rescatar las variables de entorno

Se debe renombrar el archivo `.env.example` a `.env`, para que las variables de entorno del proyecto puedan ser utilizadas

### 4. Ejecutar la aplicacion

- Una vez que la base de datos esté configurada e inicializada, ejecuta tu aplicación Node.js con el siguiente comando:

```bash
npm run dev
```

Este comando ejecutará el servidor de desarrollo y permitirá la conexión a la base de datos SQLite para renderizar los datos de cada integrante 

Para esta entrega, se cambiaron las rutas desde el archivo principal (index.js) al archivo public.js, ubicando dentro de la carpeta routes