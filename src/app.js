import express from 'express'
import routes from './routes';

class App{
    
    // Variáveis

    constructor(){
        this.server = express();
        console.log('passou aqui...');
        this.middlewares();
        this.routes();
    }



    middlewares(){
        this.server.use(express.json());
    }

    routes(){
        console.log('tentando usar rotas...');
        try {
            this.server.use(routes);
            console.log('rotas carregas com sucesso...');
        } catch (error) {
            console.log('erro aqui...')
        }
    }
}

export default new App().server;