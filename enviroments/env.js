import { env_dsv } from "./env-dsv";
import { env_hmg } from "./env-hmg";
import { env_prd } from "./env-prd";

const getVariaveis = (contexto) => {
    switch (contexto) {
        case 'dsv': return env_dsv.variaveis; 
        case 'hmg': return env_hmg.variaveis; 
        case 'prd': return env_prd.variaveis; 


        default: return env_dsv.variaveis; //SET VARIAVEIS LOCALHOST
    }
}

export const variaveis = {...getVariaveis('local')}