import { Schema, model } from "mongoose";

const UsuarioSchema = new Schema({
    email: String,
    nome: String,
    idade: Number
});

export default model('Usuario',UsuarioSchema);