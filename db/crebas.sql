CREATE TABLE Integrantes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT NOT NULL,
    apellido TEXT NOT NULL,
    matricula TEXT UNIQUE NOT NULL, 
    activo BOOLEAN DEFAULT 1,
    orden INTEGER
);


CREATE TABLE TiposMedia (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT UNIQUE NOT NULL,
    activo BOOLEAN DEFAULT 1,
    orden INTEGER
);

CREATE TABLE Media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    integranteId INTEGER NOT NULL,
    tiposmediaId INTEGER NOT NULL,
    url TEXT,
    nombrearchivo TEXT,
    orden INTEGER,
    activo BOOLEAN DEFAULT 1,
    FOREIGN KEY (integranteId) REFERENCES Integrantes (id),
    FOREIGN KEY (tiposmediaId) REFERENCES TiposMedia (id)
);

CREATE TABLE Colores (
    integranteId INTEGER PRIMARY KEY,
    background TEXT,
    headerBackground TEXT,
    sectionBackground TEXT,
    activo BOOLEAN DEFAULT 1,
    FOREIGN KEY (integranteId) REFERENCES Integrantes (id)
);

CREATE TABLE Usuarios (
    usuarioid INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    sysadmin BOOLEAN DEFAULT false,
    integranteId TEXT,
    confirmationCode TEXT,
    confirmed INTEGER DEFAULT 0,
    resetToken TEXT,
    FOREIGN KEY (
        integranteId
    )
    REFERENCES Integrantes (matricula) ON DELETE SET NULL
);