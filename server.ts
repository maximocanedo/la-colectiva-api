import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import Connection from './Connection/Connection';
import * as Entities from './Entities/Entities';
import * as Crypto from './Security/Crypto';

const app = express();
const PORT = 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req: Request, res: Response) => {
   const con = new Connection();
   const q = con.Fetch("SELECT * FROM api_tokens", [], (err: any, results: any) => {
    if(err) console.error(err);
      console.log("Resultados: ", results);
      res.json({
        results
      });
   }, (err: any) => {
    console.log("ERROR EXTERNO", err);
   }, () => {
    console.log("We're closed now. ");
   })
});



// Crear usuarios de prueba
app.post('/test/addTestUser', (req: Request, res: Response) => {
  let clave = "1234";
  let hashClave = Crypto.generateHash(clave);
  console.log({
    clave, hashClave
  });

  const claveIngresada: string = req.body.password;
  if(claveIngresada == null) {
    res.json({
      error: "Clave null"
    });
    return;
  }
  let hashIngresado = Crypto.generateHash(claveIngresada);
  console.log({
    claveIngresada, hashIngresado
  });
  if(hashIngresado == hashClave) console.log("IDENTICOS");
});




app.post('/api/users', (req: Request, res: Response) => {
  const { name, email } = req.body;
  res.json({ message: 'Usuario creado correctamente', name, email });
});

app.listen(PORT, () => {
  console.log(`Servidor API REST funcionando en el puerto ${PORT}`);
});
