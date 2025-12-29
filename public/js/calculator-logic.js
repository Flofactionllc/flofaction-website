/**
 * PHASE 2: Financial Calculators & Tools
 * Calculator Logic Module - Core calculation functions
 * Contains logic for all 11 calculators
 */

// ===== LIFE INSURANCE CALCULATORS =====

/**
 * Life Insurance Needs Calculator
 * Calculates recommended life insurance coverage based on financial obligations
 */
function calculateLifeInsuranceNeeds(income, yearsSupported, debts, childrenEducation, funeralCosts) {
  const annualNeeds = income * yearsSupported;
  const totalDebts = debts;
  const educationCosts = childrenEducation;
  const otherCosts = funeralCosts;
  
  const totalNeeded = annualNeeds + totalDebts + educationCosts + otherCosts;
  const recommendedCoverage = totalNeeded * 1.1; // 10% buffer
  
  return {
    annualNeeds,
    totalDebts,
    educationCosts,
    otherCosts,
    totalNeeded,
    recommendedCoverage: Math.round(recommendedCoverage),
    monthlyPayment: Math.round(recommendedCoverage / 12 / 100) / 100 // Rough estimate
  };
}

/**
 * IUL (Indexed Universal Life) Calculator
 * Estimates growth potential and costs
 */
function calculateIUL(initialPremium, annualPremium, years, creditRate, capRate) {
  let balance = initialPremium;
  const rateOfReturn = creditRate / 100;
  const maxReturn = capRate / 100;
  const costOfInsurance = 0.005; // 0.5% annually
  
  for (let year = 0; year < years; year++) {
    const gain = balance * Math.min(rateOfReturn, maxReturn);
    const insurance = balance * costOfInsurance;
    balance = balance + gain + annualPremium - insurance;
  }
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: initialPremium + (annualPremium * years),
    totalGain: Math.round(balance - initialPremium - (annualPremium * years)),
    projectedValue: Math.round(balance)
  };
}

/**
 * Whole Life Calculator
 * Calculates whole life policy projections
 */
function calculateWholeLife(premiums, years, dividendRate) {
  let totalPaid = premiums * years;
  let cashValue = totalPaid * 0.50; // Estimate 50% of paid premiums as cash value
  let dividends = totalPaid * (dividendRate / 100);
  let totalValue = cashValue + dividends;
  
  return {
    totalPremiumsPaid: totalPaid,
    estimatedCashValue: Math.round(cashValue),
    estimatedDividends: Math.round(dividends),
    totalValue: Math.round(totalValue),
    deathBenefit: totalValue * 1.5 // Typical multiplier
  };
}

/**
 * Term Life Calculator
 * Simple term life insurance estimator
 */
function calculateTermLife(age, healthStatus, deathBenefit, termYears) {
  let ratePerThousand = 0.5; // Base rate
  
  // Age adjustment
  if (age > 50) ratePerThousand *= 2;
  else if (age > 40) ratePerThousand *= 1.5;
  
  // Health adjustment
  if (healthStatus === 'poor') ratePerThousand *= 2;
  else if (healthStatus === 'fair') ratePerThousand *= 1.5;
  
  const monthlyRate = (deathBenefit / 1000) * ratePerThousand;
  const monthlyPayment = monthlyRate;
  const totalCost = monthlyPayment * 12 * termYears;
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    annualPayment: Math.round(monthlyPayment * 12 * 100) / 100,
    totalCost: Math.round(totalCost),
    deathBenefit: deathBenefit
  };
}

/**
 * Disability Insurance Calculator
 * Estimates disability coverage needs
 */
function calculateDisabilityInsurance(monthlyIncome, monthsSupport, percentageReplaced) {
  const monthlyBenefit = (monthlyIncome * percentageReplaced) / 100;
  const totalBenefit = monthlyBenefit * monthsSupport;
  const estimatedMonthlyPremium = monthlyBenefit * 0.015; // Estimate 1.5% of benefit
  
  return {
    monthlyIncome,
    monthlyBenefitReplaced: Math.round(monthlyBenefit),
    totalBenefit: Math.round(totalBenefit),
    estimatedMonthlyPremium: Math.round(estimatedMonthlyPremium * 100) / 100,
    annualPremiumEstimate: Math.round(estimatedMonthlyPremium * 12 * 100) / 100
  };
}

// ===== FINANCIAL PLANNING TOOLS =====

/**
 * Retirement Savings Calculator
 * Projects retirement savings based on contributions and returns
 */
function calculateRetirementSavings(currentSavings, monthlyContribution, years, annualReturn) {
  let balance = currentSavings;
  const monthlyRate = annualReturn / 100 / 12;
  
  for (let month = 0; month < years * 12; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
  }
  
  const totalContributions = currentSavings + (monthlyContribution * years * 12);
  const gains = balance - totalContributions;
  
  return {
    finalBalance: Math.round(balance),
    totalContributions: Math.round(totalContributions),
    gains: Math.round(gains),
    monthlyNeeded4MillionIn30Years: Math.round((1000000 - currentSavings) / (30 * 12))
  };
}

/**
 * Mortgage Calculator
 * Calculates monthly payments and amortization
 */
function calculateMortgage(loanAmount, interestRate, years) {
  const monthlyRate = interestRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  const monthlyPayment = (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments))) / (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  const totalPayment = monthlyPayment * numberOfPayments;
  const totalInterest = totalPayment - loanAmount;
  
  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPayment: Math.round(totalPayment),
    totalInterest: Math.round(totalInterest),
    loanAmount,
    interestRate,
    years
  };
}

/**
 * Debt Consolidation Calculator
 * Compares debt consolidation vs regular payments
 */
function calculateDebtConsolidation(totalDebt, currentRate, consolidationRate, years) {
  const currentMonthly = calculateMortgage(totalDebt, currentRate, years).monthlyPayment;
  const consolidatedMonthly = calculateMortgage(totalDebt, consolidationRate, years).monthlyPayment;
  const monthlySavings = currentMonthly - consolidatedMonthly;
  const totalSavings = monthlySavings * years * 12;
  
  return {
    currentMonthlyPayment: currentMonthly,
    consolidatedMonthlyPayment: consolidatedMonthly,
    monthlySavings: Math.round(monthlySavings * 100) / 100,
    yearlySavings: Math.round(monthlySavings * 12 * 100) / 100,
    totalSavings: Math.round(totalSavings)
  };
}

/**
 * Investment Calculator
 * Projects investment growth
 */
function calculateInvestment(initialInvestment, monthlyInvestment, years, annualReturn) {
  return calculateRetirementSavings(initialInvestment, monthlyInvestment, years, annualReturn);
}

/**
 * Tax Planning Calculator
 * Estimates tax impact and savings
 */
function calculateTaxPlanning(income, deductions, taxRate) {
  const taxableIncome = Math.max(0, income - deductions);
  const estimatedTax = taxableIncome * (taxRate / 100);
  const taxSavingsFromDeductions = deductions * (taxRate / 100);
  
  return {
    grossIncome: income,
    deductions,
    taxableIncome,
    estimatedTax: Math.round(estimatedTax),
    taxRate,
    effectiveTaxRate: Math.round((estimatedTax / income) * 100 * 100) / 100,
    taxSavingsFromDeductions: Math.round(taxSavingsFromDeductions),
    netIncome: Math.round(income - estimatedTax)
  };
}

/**
 * Insurance Needs Assessment Tool
 * Comprehensive assessment of insurance needs
 */
function calculateInsuranceNeeds(age, familySize, income, homeValue, carValue, debts) {
  const lifeInsurance = calculateLifeInsuranceNeeds(income, 25, debts, familySize * 100000, 15000).recommendedCoverage;
  const homeInsurance = homeValue * 0.015; // 1.5% annual premium estimate
  const carInsurance = carValue * 0.10 / 12; // ~10% annual, per month
  const healthInsurance = income * 0.08 / 12; // ~8% annual estimate
  const disabilityInsurance = (income / 12) * 0.015; // 1.5% monthly benefit estimate
  
  return {
    recommendedLifeInsurance: Math.round(lifeInsurance),
    estimatedAnnualHomeInsurance: Math.round(homeInsurance),
    estimatedMonthlyCarInsurance: Math.round(carInsurance),
    estimatedMonthlyHealthInsurance: Math.round(healthInsurance),
    estimatedMonthlyDisabilityInsurance: Math.round(disabilityInsurance),
    totalAnnualInsuranceCost: Math.round(homeInsurance + (carInsurance * 12) + (healthInsurance * 12) + (disabilityInsurance * 12)),
    coverageGaps: identifyCoverageGaps(age, familySize, income)
  };
}

/**
 * Helper function to identify coverage gaps
 */
function identifyCoverageGaps(age, familySize, income) {
  const gaps = [];
  
  if (familySize > 0 && income < 100000) {
    gaps.push('Consider increased life insurance');
  }
  if (age > 45 && income > 75000) {
    gaps.push('Review retirement savings adequacy');
  }
  if (familySize > 2) {
    gaps.push('Consider disability insurance');
  }
  
  return gaps.length > 0 ? gaps : ['Coverage appears adequate'];
}

// Export functions for use in HTML
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateLifeInsuranceNeeds,
    calculateIUL,
    calculateWholeLife,
    calculateTermLife,
    calculateDisabilityInsurance,
    calculateRetirementSavings,
    calculateMortgage,
    calculateDebtConsolidation,
    calculateInvestment,
    calculateTaxPlanning,
    calculateInsuranceNeeds
  };
}
