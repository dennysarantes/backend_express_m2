import Usuario from '../models/Usuario';
import Casa from '../models/Casa';
import Reserva from '../models/Reserva';
import UtilShared from '../utils/shared';

class ReservaController {
    constructor() {
        // Amarra o contexto dos métodos à instância da classe
        this.nova = this.nova.bind(this);
        this.casaDisponivel = this.casaDisponivel.bind(this);
        this.ehUsuarioValido = this.ehUsuarioValido.bind(this);
        this.ehReservaExistente = this.ehReservaExistente.bind(this);
    }

    async cancelarReservaPorCodigo(req, res) {
        const { codigoReserva } = req.params;
        const { id_usuario } = req.headers;

        if (!codigoReserva || !id_usuario) {
            return res.status(401).json({
                mensagem:
                    'dados inválidos. Deve ser informado o id da reserva e o id do usuário',
            });
        }

        const usuario = await Usuario.findById(id_usuario);
        const reservaReferencia = await Reserva.findOne({ codigoReserva });

        if (!reservaReferencia) {
            return res.status(400).json({ mensagem: 'Reserva inválida.' });
        }

        if (
            String(usuario?._id) !== String(reservaReferencia?.responsavel_id)
        ) {
            return res.status(401).json({ mensagem: 'Não autorizado.' });
        }

        try {
            const reservaEditada = await Reserva.updateOne(
                { _id: reservaReferencia._id },
                {
                    ativa: false,
                },
            );

            if (reservaEditada) {
                return res
                    .status(200)
                    .json({ msg: 'Reserva cancelada com sucesso.' });
            } else {
                return res
                    .status(500)
                    .json({ msg: 'Algo deu errado, tente novamente.' });
            }
        } catch (error) {
            console.error('Erro ao tentar deletar reserva.', error);
            return res
                .status(500)
                .json({ msg: 'Algo deu errado, tente novamente.' });
        }
    }

    async excluirReservaPorCodigo(req, res) {
        const { codigoReserva } = req.params;
        const { id_usuario } = req.headers;

        if (!codigoReserva || !id_usuario) {
            return res.status(401).json({
                mensagem:
                    'dados inválidos. Deve ser informado o id da reserva e o id do usuário',
            });
        }

        const usuario = await Usuario.findById(id_usuario);
        const reservaReferencia = await Reserva.findOne({ codigoReserva });

        if (!reservaReferencia) {
            return res.status(400).json({ mensagem: 'Reserva inválida.' });
        }

        if (
            String(usuario?._id) !== String(reservaReferencia?.responsavel_id)
        ) {
            return res.status(401).json({ mensagem: 'Não autorizado.' });
        }

        try {
            const reservaDeletada = await Reserva.findByIdAndDelete(
                reservaReferencia._id,
            );

            if (reservaDeletada) {
                return res.send();
            } else {
                return res
                    .status(500)
                    .json({ msg: 'Algo deu errado, tente novamente.' });
            }
        } catch (error) {
            console.error('Erro ao tentar deletar reserva.', error);
            return res
                .status(500)
                .json({ msg: 'Algo deu errado, tente novamente.' });
        }
    }

    async listarReservas(req, res) {
        let reservas = [];
        const { id_usuario, id_casa, paginaIndex, qtdElementosPorPagina } =
            req.body;

        const limit = !qtdElementosPorPagina ? 4 : qtdElementosPorPagina;
        const skip =
            ((!paginaIndex ? 1 : paginaIndex) - 1) * qtdElementosPorPagina;

        try {
            const objBusca = UtilShared.retirarDadosNulosDeObjeto({
                responsavel_id: id_usuario,
                casa: id_casa,
            });

            reservas = await Reserva.find(objBusca).skip(skip).limit(limit);

            // Retorna o total de reservas e as reservas paginadas
            const totalReservas = await Reserva.countDocuments(objBusca); // Conta total de documentos
            const paginasTotais = Math.ceil(totalReservas / limit);

            return res.status(200).json({
                reservas,
                paginacao: {
                    paginaAtual: paginaIndex || 1,
                    paginasTotais,
                    totalReservas,
                    qtdPorPagina: limit,
                },
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                msg: 'ERRRO ao tentar listar as reservas. Tente novamente mais tarde.',
            });
        }
    }

    async nova(req, res) {
        const { dataInicioReserva, dataFimReserva, casa_id } = req.body;
        const { responsavel_id } = req.headers;

        // Verifica se usuário que está criando a reserva é vállido
        try {
            const responsavelValido =
                await this.ehUsuarioValido(responsavel_id);
            if (!responsavelValido) {
                return res
                    .status(401)
                    .json({ msg: 'Id de responsável inválido' });
            }
        } catch (error) {
            return res
                .status(400)
                .json({ msg: error ?? 'Responsável inválido' });
        }

        // Verifica se a situação da casa é igual a DISPONIVEL
        try {
            const casaDisponivel = await this.casaDisponivel(casa_id);
            if (!casaDisponivel) {
                return res.status(400).json({ msg: 'Casa indisponível' });
            }
        } catch (error) {
            return res.status(400).json({ msg: error ?? 'Casa indisponível' });
        }

        try {
            // Verifica se  as datas de reserva foram informadas
            if (!dataInicioReserva || !dataFimReserva) {
                return res.status(400).json({
                    msg: 'Data dataInicioReserva e dataFimReserva são obrigatórios',
                });
            }

            //Verifica se as datas são válidas
            const datasReserva = UtilShared.validarDatasReserva(
                dataInicioReserva,
                dataFimReserva,
            );

            if (!datasReserva.ehValida) {
                return res.status(400).json({ msg: datasReserva.motivo });
            }

            //Verifica se a casa possui disponibilidade nas datas informadas
            const reservaExistente = await this.ehReservaExistente(
                casa_id,
                dataInicioReserva,
                dataFimReserva,
            );
            console.log('reservaExistente: ', reservaExistente);

            if (reservaExistente) {
                return res.status(400).json({
                    msg: 'A casa já está reservada para as datas fornecidas',
                });
            } else {
                const codigoReserva = UtilShared.gerarCodigoHash(
                    responsavel_id.toString(),
                );

                const reserva = await Reserva.create({
                    dataSolicitacao: new Date(),
                    dataInicioReserva:
                        UtilShared.dataBrParaDate(dataInicioReserva),
                    dataFimReserva: UtilShared.dataBrParaDate(dataFimReserva),
                    responsavel_id: responsavel_id,
                    casa: casa_id,
                    codigoReserva: codigoReserva,
                    ativa: true,
                });

                //await reserva.populate('casa');

                return reserva
                    ? res.status(200).json({
                          msg: 'Reserva criada com sucesso',
                          codigoReserva: reserva.codigoReserva,
                      })
                    : res.status(500).json({
                          msg: 'ERRO: Algo deu errado. Tente novamente mais tarde.',
                      });
            }
        } catch (error) {
            console.error('error: ', error);
            return res.status(500).json({ msg: error });
        }
    }

    async casaDisponivel(idCasa) {
        return await Casa.findOne({ _id: idCasa })
            .where('situacao')
            .equals('DISPONIVEL');
    }

    async ehUsuarioValido(idUsuario) {
        return await Usuario.findById(idUsuario);
    }

    async ehReservaExistente(casa_id, dataInicioReserva, dataFimReserva) {
        const dataInicio = UtilShared.dataBrParaDate(dataInicioReserva);
        const dataFim = UtilShared.dataBrParaDate(dataFimReserva);

        console.log(
            'Datas normalizadas para a nova reserva (sem horas):',
            dataInicio,
            dataFim,
        );

        // Buscar todas as reservas da casa que podem ter conflito
        const reservasRelevantes = await Reserva.find({
            casa: casa_id,
            $or: [
                { dataInicioReserva: { $gte: dataInicio, $lte: dataFim } }, // Reservas que começam no intervalo
                { dataFimReserva: { $gte: dataInicio, $lte: dataFim } }, // Reservas que terminam no intervalo
                {
                    dataInicioReserva: { $lte: dataInicio },
                    dataFimReserva: { $gte: dataFim },
                }, // Reservas que cobrem todo o intervalo
            ],
        });

        // Verifica se há conflito
        for (const reserva of reservasRelevantes) {
            const reservaInicio = new Date(reserva.dataInicioReserva);
            const reservaFim = new Date(reserva.dataFimReserva);

            // Verifica se as datas se sobrepõem
            if (
                dataInicio < reservaFim &&
                dataFim > reservaInicio // Conflito se a nova reserva inicia antes do fim e termina após o início da reserva existente
            ) {
                console.log(
                    'Conflito de reserva detectado com a reserva:',
                    reserva,
                );
                return reserva; // Retorna a reserva conflitante
            }
        }

        return null; // Se não houver conflito
    }
}

export default new ReservaController();
