# La Colectiva API
¡Bienvenido a La Colectiva API!

## Descripción
La API de la Colectiva está diseñada para proporcionar una forma sencilla de visualizar y manejar datos a través de un conjunto de endpoints RESTful. Está construída con Typescript para garantizar un desarrollo robusto y escalable.

## Propósito
El propósito general de La Colectiva es el de brindar respuestas a preguntas como:

- ¿A qué hora pasa la próxima lancha?
- ¿Cuál es la mejor forma de llegar a mi destino?

Para eso, esta API se enfoca principalmente en brindar información sobre horarios, recorridos y datos relacionados con el transporte en las islas del Delta.

## ¿Cómo funciona?
### Usuarios
Los usuarios pueden registrarse, iniciar sesión y realizar acciones en base a su rol, que puede ser:

- **Limitado**: El usuario puede visualizar información, realizar consultas.
- **Común**: El usuario puede dar upvotes y downvotes, y comentar registros.
- **Moderador**: El usuario puede agregar, modificar y eliminar registros propios y que serán de acceso público.
- **Administrador**: El usuario puede asignar roles a otros usuarios.

Las sesiones de los usuarios se administran usando JWT.


