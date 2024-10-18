import Usuario from "../models/Usuario"

class UsuarioController {

    constructor() {
        // Amarra o contexto dos métodos à instância da classe
        this.store = this.store.bind(this);
        this.searchBy = this.searchBy.bind(this);
    }

    async store(req, res) {
        const { email, nome, idade } = req.body;

        // Verifica se usuário existe
        let usuarioJaExiste = await this.searchBy('email', email);
        let resposta;

        
        if (usuarioJaExiste) {
            resposta = usuarioJaExiste; // Se existir, devole os dados do usuário
        } else {
            let novoUsuario = await Usuario.create({ email, nome, idade });
            resposta = novoUsuario;  // Se não existir, cria um usuário no banco e retorna dados do novo usuário criado
        }

        return res.json(resposta);
    }

    async searchBy(chave, valor) {
        return await Usuario.findOne({ [chave]: valor });
    }
}

export default new UsuarioController();