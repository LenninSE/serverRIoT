var Express = require("express");
var MongoClient= require("mongodb").MongoClient;
var cors=require("cors");
const multer=require("multer");
const { error } = require("console");

var app=Express();
app.use(cors());

var CONNECTION_STRING="mongodb+srv://lenmanri29:JKnDqGdq8FYR7Zhg@cluster0.snrto53.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const PORT = process.env.PORT || 5038;










var DATABASENAME="prototipo";
var database;

app.listen(5038,()=>{
    MongoClient.connect(CONNECTION_STRING,(error,client)=>{
        database=client.db(DATABASENAME);
        console.log("Mongo DB conexion exitosa...");
    });

})






app.get('/api/proto/parametros',(request,response)=>{
        database.collection("parametros-planta").find({}).toArray((error,result)=>{
        response.send(result);
    });
})
//obetner el ultimo documento
app.get('/api/proto/ultimaLectura', (request, response) => {
    database.collection("parametros-planta")
    .find({})
    .sort({_id: -1})
    .limit(1)
    .toArray((error,result)=>{
        if (error) throw error;
        response.send(result);
        
    });

    
})
//lecturas por fecha//
app.get('/api/proto/lecturaDiaria', (request, response) => {
    // Obtener la fecha del último documento devuelto por el primer endpoint
    database.collection("parametros-planta")
    .find({})
    .sort({_id: -1})
    .limit(1)
    .toArray((error,result)=>{
        if (error) throw error;

        // Extraer los primeros 10 caracteres de la fecha del primer documento devuelto
        const fechaDocumento = result[0].date.substring(0, 10);

        // Consultar la colección para obtener todos los documentos que coincidan con la fecha
        database.collection("parametros-planta")
        .find({
            "date": { $regex: new RegExp("^" + fechaDocumento) } // Utilizar expresión regular para comparar los primeros 10 caracteres
        })
        .toArray((error, resultados) => {
            if (error) throw error;
            response.send(resultados);
        });
    });
});

//===== Lectura diaria promedio hora====//
app.get('/api/proto/lecturaDiariaPromedio', (request, response) => {
    database.collection("parametros-planta")
    .find({})
    .sort({_id: -1})
    .limit(1)
    .toArray((error, result) => {
        if (error) throw error;

        const fechaDocumento = result[0].date.substring(0, 10);

        // Consultar la colección para obtener todos los documentos que coincidan con la fecha
        database.collection("parametros-planta")
        .find({
            "date": { $regex: new RegExp("^" + fechaDocumento) }
        })
        .toArray((error, resultados) => {
            if (error) throw error;

            // Objeto para almacenar los promedios por hora
            const promediosPorHora = {};

            // Iterar sobre los documentos y calcular los promedios
            resultados.forEach(documento => {
                const hora = documento.date.substring(11, 13); // Obtener la hora del documento
                if (!promediosPorHora[hora]) {
                    // Inicializar el objeto para esta hora si no existe
                    promediosPorHora[hora] =
                     {
                        "hora": parseInt(hora),
                        temperatura: [],
                        "humedad-relativa": [],
                        luz: [],
                        "humedad-suelo": []
                    };
                }

                // Agregar los valores a los arrays correspondientes
                
                promediosPorHora[hora].temperatura.push(documento.temperatura);
                promediosPorHora[hora]["humedad-relativa"].push(documento["humedad-relativa"]);
                promediosPorHora[hora].luz.push(documento.luz);
                promediosPorHora[hora]["humedad-suelo"].push(documento["humedad-suelo"]);
            });

            // Calcular los promedios por hora
            const promedios = {};
            for (const hora in promediosPorHora) {
                const valores = promediosPorHora[hora];
                promedios[hora] = {
                    "hora":hora,
                    temperatura: promedio(valores.temperatura),
                    "humedad-relativa": promedio(valores["humedad-relativa"]),
                    luz: promedio(valores.luz),
                    "humedad-suelo": promedio(valores["humedad-suelo"])
                };
            }

            const resultadoFinal = Object.values(promedios);
            response.send(resultadoFinal);
        });
    });
});
// Función para calcular el promedio de un array de números
function promedio(array) {
    const sum = array.reduce((acc, val) => acc + val, 0);
    return sum / array.length;

}
//=====================
app.get('/api/proto/lecturaDiaria2', (request, response) => {
    database.collection("parametros-planta")
    .find({})
    .sort({_id: -1})
    .limit(1)
    .toArray((error, result) => {
        if (error) throw error;

        const fechaDocumento = result[0].date.substring(0, 10);

        // Consultar la colección para obtener todos los documentos que coincidan con la fecha
        database.collection("parametros-planta")
        .find({
            "date": { $regex: new RegExp("^" + fechaDocumento) }
        })
        .toArray((error, resultados) => {
            if (error) throw error;

            // Objeto para almacenar los promedios por hora
            const promediosPorHora = {};

            // Iterar sobre los documentos y calcular los promedios
            resultados.forEach(documento => {
                let hora = documento.date.substring(11, 13); // Obtener la hora del documento
                
                if (!promediosPorHora[hora]) {
                    // Inicializar el objeto para esta hora si no existe
                    promediosPorHora[hora] =
                    {
                        "hora": parseInt(hora),
                        temperatura: [],
                        "humedad-relativa": [],
                        luz: [],
                        "humedad-suelo": []
                    };
                }

                // Agregar los valores a los arrays correspondientes
                
                promediosPorHora[hora].temperatura.push(documento.temperatura);
                promediosPorHora[hora]["humedad-relativa"].push(documento["humedad-relativa"]);
                promediosPorHora[hora].luz.push(documento.luz);
                promediosPorHora[hora]["humedad-suelo"].push(documento["humedad-suelo"]);
            });

            // Calcular los promedios por hora
            const promedios = {};
            for (const hora in promediosPorHora) {
                const valores = promediosPorHora[hora];
                promedios[hora] = {
                    "hora":hora,
                    temperatura: promedio(valores.temperatura),
                    "humedad-relativa": promedio(valores["humedad-relativa"]),
                    luz: promedio(valores.luz),
                    "humedad-suelo": promedio(valores["humedad-suelo"])
                };
            }

            const resultadoFinal = Object.values(promedios);

            // Ordenar el array de objetos en función del campo "hora"
            resultadoFinal.sort((a, b) => {
                // Convertir las horas a números antes de comparar
                const horaA = parseInt(a.hora);
                const horaB = parseInt(b.hora);
                return horaA - horaB;
            });

            response.send(resultadoFinal);
        });
    });
});
// Función para calcular el promedio de un array de números
function promedio(array) {
    const sum = array.reduce((acc, val) => acc + val, 0);
    return sum / array.length;

}



