// Importaciones
import express from "express";
import fs from "fs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

// Configuración dotenv
dotenv.config();

// Declaración de puerto
const app = express();
const PORT = process.env.PORT;

// Middlewares
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");

// Traer proyectos del archivo json
app.get("/", (req, res) => {
    fs.readFile("./data/projects.json", "utf8", (err, data) => {
        if (err) {
            console.error("Error leyendo el archivo:", err);
            return res.status(500).send("Error interno del servidor");
        }

        const proyectos = JSON.parse(data);
        res.render("index", { proyectos });
    });
});

// Enviar correo
app.post('/sendMail', (req, res) => {
    const { nombre, correo, asunto, mensaje } = req.body;

    // Configuración del correo
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: correo,
      to: process.env.EMAIL_TO,
      subject: `Contacto desde el sitio: ${asunto}`,
      text: `Nombre: ${nombre}\nCorreo: ${correo}\n\nMensaje:\n${mensaje}`,
    };

    // Enviar el correo
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error al enviar correo:', error);
        return res.status(500).send('Ocurrió un error al enviar el mensaje.');
      } else {
        console.log('Correo enviado:', info.response);
        return res.send('¡Mensaje enviado con éxito!');
      }
    });
});

// Traer proyectos por id
app.get("/proyecto/:id", (req, res) => {
    const id = parseInt(req.params.id);

    fs.readFile("./data/projects.json", "utf8", (err, data) => {
        if (err) {
            console.error("Error leyendo el archivo:", err);
            return res.status(500).send("Error interno del servidor");
        }

        const proyectos = JSON.parse(data);
        const proyecto = proyectos.find(p => p.id === id);

        if (!proyecto) {
            return res.status(404).send("Proyecto no encontrado");
        }
        res.render("proyecto", { proyecto });
    });
})

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});