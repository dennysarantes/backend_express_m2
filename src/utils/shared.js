const retirarDadosNulosDeObjeto = (obj) => {
    const novoObjeto = {};

    // Percorre as chaves do objeto original
    for (let chave in obj) {
      if (obj.hasOwnProperty(chave)) {
        // Verifica se o valor da propriedade não é nulo ou undefined
        if (obj[chave] !== null && obj[chave] !== undefined) {
          // Se for válido, adiciona ao novo objeto
          novoObjeto[chave] = obj[chave];
        }
      }
    }
  
    return novoObjeto;

};

const retirarValoresNulosDeArray = (array) => {
    return array?.filter(valor => valor !== null && valor !== undefined);
}

const gerarCodigoRandomicoV1 = () => {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

const gerarCodigoRandomicoV2 = () => {
  const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let codigo = '';
  
  // Gera 5 caracteres randômicos
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(Math.random() * caracteres.length);
    codigo += caracteres[randomIndex];
  }
  
  return codigo;
}

const validarFormatoData = (data) => {
  // Valida o formato de data "YYYY-MM-DD" com uma expressão regular
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  console.log(regex)
  if (!data.match(regex)) {
      return false;
  }

  // Valida se a data é real (não uma data inválida como 2024-02-30)
  const date = new Date(data);
  console.log(date)
  return date instanceof Date && !isNaN(date);
}

const gerarCodigoHash = (input) => {
  const dataAtual = new Date().toISOString(); // Obtém a data atual no formato ISO
  const stringParaHash = input + dataAtual; // Concatena a string com a data atual

  // Função simples de hash
  let hash = 0;
  for (let i = 0; i < stringParaHash.length; i++) {
    const char = stringParaHash.charCodeAt(i);
    hash = (hash << 5) - hash + char; // Gera o hash
    hash |= 0; // Converte para número de 32 bits
  }

  // Converte o hash para uma string hexadecimal e limita a 20 caracteres
  const hashString = Math.abs(hash).toString(36).substring(0, 20);

  return hashString;
}


const dataBrParaDate = (data) => {
  const [dia, mes, ano] = data.split('/').map(Number);
  // Criando um objeto Date sem considerar horas
  const dataObj = new Date(ano, mes - 1, dia);
  dataObj.setUTCHours(0, 0, 0, 0); // Zerar horas para garantir comparação apenas de dias
  return dataObj;
}


const validarDatasReserva = (dataInicial, dataFinal) => {
  // Expressão regular para validar o formato dd/mm/yyyy
  const regexData = /^\d{2}\/\d{2}\/\d{4}$/;

  // Verifica se as datas estão no formato correto
  if (!regexData.test(dataInicial) || !regexData.test(dataFinal)) {
    return { ehValida: false, motivo: 'ERRO: formato de data inválido.' };
  }

  // Função para converter string dd/mm/yyyy para objeto Date
  function converterParaData(dataString) {
    const [dia, mes, ano] = dataString.split('/').map(Number);
    return new Date(ano, mes - 1, dia); // O mês no objeto Date é 0-indexado
  }

  const dataInicio = converterParaData(dataInicial);
  const dataFim = converterParaData(dataFinal);
  const hoje = new Date();

  // Verifica se a data inicial é maior que hoje
  if (dataInicio <= hoje) {
    return { ehValida: false, motivo: 'ERRO: A data inicial deve ser maior que hoje.' };
  }

  // Verifica se a data final é maior que a data inicial
  if (dataFim <= dataInicio) {
    return { ehValida: false, motivo: 'ERRO: A data final deve ser maior que a data inicial.' };
  }

  // Verifica se o intervalo entre as datas é maior que 30 dias
  const diferencaEmMilissegundos = dataFim - dataInicio;
  const diasDeDiferenca = diferencaEmMilissegundos / (1000 * 60 * 60 * 24);

  if (diasDeDiferenca > 30) {
    return { ehValida: false, motivo: 'ERRO: O intervalo máximo entre a data inicial e a data final deve ser de 30 dias corridos.' };
  }

  // Se todas as validações passarem, retorna o objeto com ehValida true
  return { ehValida: true, motivo: null };
}


const UtilShared = {
    retirarDadosNulosDeObjeto,
    retirarValoresNulosDeArray,
    gerarCodigoRandomicoV1,
    gerarCodigoRandomicoV2,
    validarFormatoData,
    gerarCodigoHash,
    validarDatasReserva,
    dataBrParaDate
}

export default UtilShared