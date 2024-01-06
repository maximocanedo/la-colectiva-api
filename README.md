# La Colectiva API
¡Bienvenido a La Colectiva API!

## Descripción
La API de la Colectiva está diseñada para proporcionar una forma sencilla de visualizar y manejar datos a través de un conjunto de endpoints RESTful. Está construída con Typescript para garantizar un desarrollo robusto y escalable.

## Primeros pasos
Estas instrucciones te permitirán crear una copia del proyecto y correrla en tu máquina local para desarrollo y pruebas. 
### Pre requisitos
Se necesita tener `node`, y `ts-node` instalado en tu sistema. Además necesitarás tener un servidor MongoDB corriendo.
#### Archivo .env
Necesitarás tener un archivo .env en la carpeta raíz del repositorio una vez clonado, con las siguientes variables:

`MONGODB_LOCAL_CONNECTION_STRING`: La connection string de tu servidor de base de datos MongoDB.

`UID_SECRET_KEY`: Clave secreta para encriptar datos varios.

`UID_IV_LENGTH`: Número entero.

`UID_ALGORITHM`: Algoritmo de encriptación.

`JWT_SECRET_KEY`: Clave secreta para encriptar los tokens JWT emitidos.


#### Instalando
Una vez clonado el repositorio, abrí una terminal e instalá las dependencias con el siguiente comando:
```bash
$ npm install
```
#### Corriendo
Una vez instaladas las dependencias, ejecutá el siguiente comando para iniciar el servidor:
```bash
$ ts-node src/index.ts
```
#### Probando
Ejecutar el siguiente comando para verificar que todo esté funcionando correctamente.
```bash
curl http://localhost/users/me
```
La respuesta debería verse así:
```json
{
    "error": {
        "code": "A-06",
        "message": "No autenticado. ",
        "details": "Esta operación requiere autenticación. "
    }
}
```
## Contribuir
Ver CONTRIBUTING.md para conocer los detalles del código de conducta, y del proceso para enviar pull requests.

## Autor
Máximo Canedo

## Licencia
Ver LICENSE.md.
