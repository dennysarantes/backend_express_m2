import { Schema, model } from "mongoose";
import SituacaoCasa from "../utils/enums/situacao-casa.enum";

const CasaSchema = new Schema({
    caminhoFotoCasa:String,
    descricao:String,
    preco:Number,
    endereco:String,
    situacao: {
                type: String,
                enum: Object.values(SituacaoCasa),
                required: true  // O campo é obrigatório
            },
    idDono: {
            type: Schema.Types.ObjectId, //O tipo é o id do 
            ref: 'Usuario'
            },

},{
    toJSON: {
        virtuals: true
    }}
);

CasaSchema.virtual('caminhoFotoCasa_url').get(function(){
            return `http://localhost:3333/fotos-casas/${this.caminhoFotoCasa}`;
});

export default model('Casa', CasaSchema);