import { Router } from "express";
import UsuarioController from "./controllers/UsuarioController";
import CasaController from "./controllers/CasaController";
import multer from "multer";
import uploadConfig from "./utils/config/upload";
import ReservaController from "./controllers/ReservaController";

const routes = new Router();

    const uploadFile = multer(uploadConfig);
 
    // Rotas de usuário
    routes.post('/usuarios', UsuarioController.store);


    // Rotas de casas: 
    routes.post('/casas', uploadFile.single('caminhoFotoCasa'), CasaController.criarCasa);
    routes.get('/casas', CasaController.buscarCasas);
    routes.get('/v2/casas', CasaController.buscarCasasV2);
    routes.put('/casas/:id',uploadFile.single('caminhoFotoCasa'),  CasaController.editarCasaPorId);
    routes.delete('/casas', CasaController.excluirCasaPorId);

    // Rotas de reservas:
    routes.post('/reservas', ReservaController.listarReservas);
    routes.post('/reserva/nova', ReservaController.nova);
    routes.delete('/reserva/:codigoReserva', ReservaController.excluirReservaPorCodigo);
    routes.put('/reserva/:codigoReserva', ReservaController.cancelarReservaPorCodigo);

export default routes;

