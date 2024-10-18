import { Schema, model } from "mongoose";

const ReservaSchema = new Schema({
    dataSolicitacao: String,
    dataInicioReserva: String,
    dataFimReserva: String,
    ativa:Boolean,
    responsavel_id: {
        type: Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    casa: {
        type: Schema.Types.ObjectId,
        ref: 'Casa'
    },
    codigoReserva: String
});

export default model('Reserva',ReservaSchema);