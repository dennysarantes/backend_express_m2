class BDConnectMapper{
      
    constructor(){ }

    getStringConnect(stringAmbiente){
        const passw = process.env.BD_KEY; //Pega a variável de sistema configurada no sistema operacional chamada BD_KEY
        return stringAmbiente.replace('<db_password>', passw);
    }

}

export default new BDConnectMapper();