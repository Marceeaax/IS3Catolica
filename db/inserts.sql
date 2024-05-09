-- Insertar los tipos de media
INSERT INTO TiposMedia (nombre) VALUES ('youtube'), ('imagen'), ('dibujo');

-- Insertar los integrantes
INSERT INTO Integrantes (nombre, apellido, matricula) VALUES
('Lujan', 'Caceres', 'Y18624'),
('Christian', 'Salinas', 'Y25366'),
('Steven', 'Lopez', 'Y12887'),
('Marcio', 'Saldivar', '3850665');

-- Insertar medios asociados a cada integrante
INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden) VALUES
-- Lujan
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/Ci5raxp37QE', NULL, 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '../../images/isla.jpeg', 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '../../images/paint_lujan.png', 1),
-- Christian
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/ZDs_f_ZdluU', NULL, 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '../../images/imgrepresentativa.jpg', 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '../../images/imgpropia.png', 1),
-- Steven
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/0aQPX_Iqu-A?si=yrpnMk0IUVFkQtif', NULL, 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '../../images/mejores-anime-largos.webp', 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '../../images/20240410_192335.jpg', 1),
-- Marcio
((SELECT id FROM Integrantes WHERE matricula = '3850665'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/QcaZLO59Vpc?si=qS5-wBEcKhgr_DaM', NULL, 1),
((SELECT id FROM Integrantes WHERE matricula = '3850665'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '../../images/mathi.jpg', 1),
((SELECT id FROM Integrantes WHERE matricula = '3850665'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '../../images/imagen.png', 1);

-- Insertar configuraciones de colores
INSERT INTO Colores (integranteId, background, headerBackground, sectionBackground) VALUES
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), '#FFFFFF', '#491D57', '#ca98da'),
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), '#FFFF00', 'black', 'black'),
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), '#a298da', '#1d2857', '#1d2857'),
((SELECT id FROM Integrantes WHERE matricula = '3850665'), '#FF6347', '#a53737', '#a53737');
