export function calculateIPFPoints(totalWeight:number, bodyWeight:number): number{
    // Coeficientes para hombres (Classic/Raw)
    const a = 1199.72839;
    const b = 1025.18162;
    const c = 0.00921;
    
    // Cálculo del índice IPF
    const points = totalWeight * 100 / (a - b * Math.log10(bodyWeight / c));
    
    return points;
}

// Ejemplo de uso
const totalWeight = 600; // kg - suma de sentadilla, banca y peso muerto
const bodyWeight = 80;   // kg - peso corporal

const ipfPoints = calculateIPFPoints(totalWeight, bodyWeight);
console.log(`Tu índice IPF es: ${ipfPoints.toFixed(2)}`);