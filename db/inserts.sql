-- Insertar los tipos de media
INSERT INTO TiposMedia (nombre, orden) VALUES ('youtube', 1), ('imagen', 2), ('dibujo', 3);

-- Insertar los integrantes
INSERT INTO Integrantes (nombre, apellido, matricula, orden) VALUES
('Lujan', 'Caceres', 'Y18624', 1),
('Christian', 'Salinas', 'Y25366', 2),
('Steven', 'Lopez', 'Y12887', 3),
('Marcio', 'Saldivar', '3850665', 4);

-- Insertar medios asociados a cada integrante
INSERT INTO Media (integranteId, tiposmediaId, url, nombrearchivo, orden) VALUES
-- Lujan
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/Ci5raxp37QE', NULL, 1),
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '/images/isla.jpeg', 2),
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '/images/paint_lujan.png', 3),
-- Christian
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/ZDs_f_ZdluU', NULL, 4),
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '/images/imgrepresentativa.jpg', 5),
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '/images/imgpropia.png', 6),
-- Steven
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/0aQPX_Iqu-A?si=yrpnMk0IUVFkQtif', NULL, 7),
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '/images/mejores-anime-largos.webp', 8),
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '/images/20240410_192335.jpg', 9),
-- Marcio
((SELECT id FROM Integrantes WHERE matricula = '3850665'), (SELECT id FROM TiposMedia WHERE nombre = 'youtube'), 'https://www.youtube.com/embed/QcaZLO59Vpc?si=qS5-wBEcKhgr_DaM', NULL, 10),
((SELECT id FROM Integrantes WHERE matricula = '3850665'), (SELECT id FROM TiposMedia WHERE nombre = 'imagen'), NULL, '/images/mathi.jpg', 11),
((SELECT id FROM Integrantes WHERE matricula = '3850665'), (SELECT id FROM TiposMedia WHERE nombre = 'dibujo'), NULL, '/images/imagen.png', 12);

-- Insertar configuraciones de colores
INSERT INTO Colores (integranteId, background, headerBackground, sectionBackground) VALUES
((SELECT id FROM Integrantes WHERE matricula = 'Y18624'), '#FFFFFF', '#491D57', '#ca98da'),
((SELECT id FROM Integrantes WHERE matricula = 'Y25366'), '#FFFF00', 'black', 'black'),
((SELECT id FROM Integrantes WHERE matricula = 'Y12887'), '#a298da', '#1d2857', '#1d2857'),
((SELECT id FROM Integrantes WHERE matricula = '3850665'), '#FF6347', '#a53737', '#a53737');
