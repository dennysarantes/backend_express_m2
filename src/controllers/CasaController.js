import Usuario from "../models/Usuario";
import Casa from "../models/Casa";
import UtilShared from "../utils/shared";
import * as Yup from 'yup';

class CasaController {

    constructor() {
        // Amarra o contexto dos métodos à instância da classe
        this.criarCasa = this.criarCasa.bind(this);
        this.searchBy = this.searchBy.bind(this);
    }


    async excluirCasaPorId(req, res){
        const { id_casa } = req?.body
        const { id_user } = req?.headers;
        console.log("id_user: ", id_user);

        if(!id_casa || !id_user){
            return res.status(400).json({mensagem: "dados inválidos. Deve ser informado o id da casa e o id do usuário"});
        }

        const usuario = await Usuario.findById(id_user);
        const casaReferencia = await Casa.findById(id_casa);

        if(String(usuario?._id) !== String(casaReferencia?.idDono)){
            return res.status(401).json({mensagem: 'Não autorizado.'});
        }
        const casa = await Casa.findByIdAndDelete(id_casa);
        console.log("casa: ", casa);

        return res.send();
    }

    async editarCasaPorId(req, res){


         // Validação de entrada de dados
         const schema = Yup.object().shape({
            descricao: Yup.string().required(),
            preco: Yup.string().required(),
            endereco: Yup.string().required(),
            situacao: Yup.string().required(),
        })


        const { descricao, preco, endereco, situacao } = req.body;
        const file =  req?.file;
        const { id } = req?.params;
        const { iddono } = req?.headers;

        const ehValidoSchema = await schema.isValid(req.body);

        if(!ehValidoSchema){
            return res.status(400).json({msg: 'ERRO: Falha na validação.'})
        }



        if(!id || !iddono){
            return res.status(400).json({mensagem: "dados inválidos. Deve ser informado o id da casa e o id do usuário"});
        }

        //const usuario = await this.searchBy('_id', iddono, 'Usuario');
        //const donoPropriedade = await this.searchBy('_id', id, 'Casa');

        const usuario = await Usuario.findById(iddono);
        const casaReferencia = await Casa.findById(id);

        if(String(usuario?._id) !== String(casaReferencia?.idDono)){
            return res.status(401).json({mensagem: 'Não autorizado.'});
        }

        
       const casa = await Casa.updateOne({_id: id},
        {
            idDono: iddono,
            descricao: descricao,
            caminhoFotoCasa: file?.filename, //file.path,
            endereco:endereco,
            situacao: situacao,
            preco:preco
        }
       );

       console.log('casa encontrada', casa);


       return res.send();
    }

    // DEPRECATED -> Atenção: Usar buscarCasasV2
    async buscarCasas(req, res){
        try {
            const { situacao, id_dono, preco_max, preco_min } = req.query;
            const dadosBusca = UtilShared.retirarDadosNulosDeObjeto({situacao: situacao, idDono: id_dono });
            let casasArray = await Casa.find(dadosBusca);

            if(casasArray.length){
                casasArray = casasArray.map((el) => {
                    const preco = el?.preco;
                    
                    if (preco === undefined) return null;
                
                    // Verifica ambos os limites de preço
                    if (preco_min !== undefined && preco_max !== undefined) {
                      return preco >= preco_min && preco <= preco_max ? el : null;
                    }
                
                    // Verifica apenas o preço mínimo
                    if (preco_max === undefined) {
                      return preco >= (preco_min ?? 0) ? el : null;
                    }
                
                    // Verifica apenas o preço máximo
                    return preco <= preco_max ? el : null;
                  }).filter(el => el !== null);
            }


            return res.json(UtilShared.retirarValoresNulosDeArray(casasArray));

        } catch (error) {
            console.error('erro: ', error);
            return res.json({mensagem:`Erro ao tentar obter casas ${error}`})
        }
    }

    async buscarCasasV2(req, res){
        try {
            const { situacao, id_dono, preco_max, preco_min } = req.query;
            const filtro = UtilShared.retirarDadosNulosDeObjeto({situacao: situacao, idDono: id_dono });
            
            if (preco_min !== undefined && preco_max !== undefined) {
                filtro.preco = { $gte: preco_min, $lte: preco_max };
              } else if (preco_min !== undefined) {
                filtro.preco = { $gte: preco_min };
              } else if (preco_max !== undefined) {
                filtro.preco = { $lte: preco_max };
              }
            const casasArray = await Casa.find(filtro);

            return res.json(UtilShared.retirarValoresNulosDeArray(casasArray));

        } catch (error) {
            console.error('erro: ', error);
            return res.json({mensagem:`Erro ao tentar obter casas ${error}`})
        }
    }

    async criarCasa(req, res) {
        try {

            // Validação de entrada de dados
            const schema = Yup.object().shape({
                descricao: Yup.string().required(),
                preco: Yup.string().required(),
                endereco: Yup.string().required(),
                situacao: Yup.string().required(),
            })

            const { descricao, preco, endereco, situacao } = req.body;
            const file =  req.file;
            const { iddono } = req.headers;

            const ehValidoSchema = await schema.isValid(req.body);

            if(!ehValidoSchema){
                return res.status(400).json({msg: 'ERRO: Falha na validação.'})
            }


            // Verifica se já existe uma casa com este mesmo endereço ou descrição
            const jaExisteCasaDescricao = await this.searchBy('descricao', descricao, 'Casa');
            const jaExisteCasaEndereco = await this.searchBy('descricao', descricao, 'Casa');
            const idValido = await this.searchBy('_id', iddono, 'Usuario');

            if((jaExisteCasaDescricao || jaExisteCasaEndereco) || !idValido){
                    res.status(400)
                return res.json({mensagem: 'Dados inválidos'});
            }

            let novaCasa = await Casa.create({ 
                idDono: iddono,
                descricao: descricao,
                caminhoFotoCasa: file.filename, //file.path,
                endereco:endereco,
                situacao: situacao,
                preco:preco
            });

            return res.json(novaCasa);
            
        } catch (error) {
            res.status(500).json({ ERRO : `Não foi possível processar a requisição ${error}`   })
        }
    }

    async searchBy(chave, valor, schema) {
        try {
            if(!valor || !chave){ return null}
            return await schema === 'Usuario' ? 
                     Usuario.findOne({_id: valor}) : 
                        Casa.findOne({ [chave]: valor });
        } catch (error) {
            console.error(`ERRO - ${Date.now()}>>>`, error)
            return null
        }

    }

}

export default new CasaController();