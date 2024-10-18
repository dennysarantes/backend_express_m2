import express from 'express'
import routes from './routes';
import mongoose from 'mongoose';
import { variaveis } from '../enviroments/env';
import bdConnectMapper from './utils/config/bd-connect-mapper';
import path from 'path';
import cors from 'cors';


const whiteListCORS = [
                        'http://example1.com',
                        'http://localhost'
                      ];

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

        const corsOptions = {
            origin: function (origin, callback) {
              if (whiteListCORS.indexOf(origin) !== -1) {
                callback(null, true)
              } else {
                callback(new Error('Acesso negado CORS'))
              }
            }
          }

        //this.server.use(cors(corsOptions));

        this.server.use(
            '/fotos-casas',
            express.static(path.resolve(__dirname, '..', 'uploads'))
        );
        this.server.use(express.json(), cors(corsOptions));
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