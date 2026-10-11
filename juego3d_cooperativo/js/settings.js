// Funcion para redondear
function floor(num) {
    return Math.floor(num);
}

export const settings = {
    velocity: 0.15,
    sensibility: 1,
    trees: floor(Math.random() * 10),
    // Vida
    health: 100,
    healthMax: 100,

    // Hambre
    hambre: 100,
    hambreMax: 100,
	
	// Frío
    frio: 100,
    frioMax: 100,

    // Sed
    sed: 100,
    sedMax: 100,
	
	balas: 0,        // 🔑 nuevo
    balasMax: 30,    // 🔑 nuevo (opcional)
	
    inventorySlots: 4,
    Rocks: floor(Math.random() * 5),
    SmallRocks: floor(Math.random() * 5),
    CherryTreeBrands: floor(Math.random() * 10),
    InvCount: 1
}