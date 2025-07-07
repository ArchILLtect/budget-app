// Federal brackets – 2024 Single Filer
export const FEDERAL_BRACKETS = [
    { min: 0, max: 11000, rate: 0.1 },
    { min: 11000, max: 44725, rate: 0.12 },
    { min: 44725, max: 95375, rate: 0.22 },
    { min: 95375, max: 182100, rate: 0.24 },
    { min: 182100, max: 231250, rate: 0.32 },
    { min: 231250, max: 578125, rate: 0.35 },
    { min: 578125, max: Infinity, rate: 0.37 },
];

// Wisconsin brackets – 2024
export const STATE_BRACKETS = {
    WI: [
        { min: 0, max: 14430, rate: 0.035 },
        { min: 14430, max: 28850, rate: 0.045 },
        { min: 28850, max: 31610, rate: 0.053 },
        { min: 31610, max: Infinity, rate: 0.0615 },
    ],
};

export function calculateBracketTax(gross, brackets) {
    let tax = 0;
    for (const bracket of brackets) {
        const taxable = Math.min(gross, bracket.max) - bracket.min;
        if (taxable > 0) {
            tax += taxable * bracket.rate;
        }
        if (gross < bracket.max) break;
    }
    return tax;
}

export function calculateTotalTaxes(gross, state = "WI") {
    const federalTax = calculateBracketTax(gross, FEDERAL_BRACKETS);
    const stateTax = calculateBracketTax(gross, STATE_BRACKETS[state] || []);
    const ssTax = Math.min(gross, 168600) * 0.062;
    const medicareTax = gross * 0.0145;

    return {
        federalTax,
        stateTax,
        ssTax,
        medicareTax,
        total: federalTax + stateTax + ssTax + medicareTax,
    };
}
