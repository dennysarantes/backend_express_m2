import express from 'express'
import routes from './routes';
import mongoose from 'mongoose';
import { variaveis } from '../enviroments/env';
import bdConnectMapper from './utils/bd-connect-mapper';

class App{
    
    constructor(){
        // -------- Carregamento do express.js--------------
        this.server = express();

        //--------- Conexão de banco --------------
        const mongoConnect = bdConnectMapper.getStringConnect(variaveis.mongoDataBaseStringConnect);
        mongoose.connect(mongoConnect);

        this.middlewares();
        this.routes();
    }



    middlewares(){
        this.server.use(express.json());
    }

    routes(){
        try {
            this.server.use(routes);
        } catch (error) {
            console.error('erro no carregamento de rotas...', error);
        }
    }
}

export default new App().server;