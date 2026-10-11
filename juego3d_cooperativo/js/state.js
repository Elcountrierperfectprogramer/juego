// state.js
export const state = {
    mundoGenerado: null,
    ChunksGenerados: null,
    objetosColision: [],
    plane: null,
    veces: 0,
	
    ListaRamas: [],
    ListaRocas: [],
    ListaRocasGrandes: [],
    ListDeb: [],
    ListaArboles: [],
    ListaDrops: [],           // ✅ corregido
	
ListaBots: [],
	ListaCasas: [],
ListaCofres: [],

balas: 0,
    balasMax: 30,
	
	ListaPisos: [],
    ListaFogatas: [],
    modoColocacion: null,
    previsualizacion: null,

    ObjetoCercano: null,
    TipoCercano: null,
    MinDist: Infinity,
    RamaMasCerca: {},
    IndiceMasCerca: 0,
    CountInv: 1
};

export const ancho = 64;
export const radioIsla = 10;
export const z = 0;