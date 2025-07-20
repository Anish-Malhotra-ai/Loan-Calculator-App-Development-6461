import { addMonths, addWeeks, addDays, addYears, format, isValid } from 'date-fns';

export const calculateLoan = (loanData) => {
  const { 
    amount, 
    interestRate, 
    termYears, 
    startDate, 
    paymentFrequency, 
    extraPayment, 
    extraPaymentFrequency, 
    lumpSumPayments 
  } = loanData;

  // Validate inputs to ensure accurate calculations
  if (!amount || amount <= 0 || !interestRate || interestRate <= 0 || !termYears || termYears <= 0 || !startDate) {
    return null;
  }

  // Ensure date is valid
  const parsedStartDate = new Date(startDate);
  if (!isValid(parsedStartDate)) {
    return null;
  }

  // Calculate payment frequency multiplier
  const getPaymentFrequencyMultiplier = (frequency) => {
    switch (frequency) {
      case 'monthly': return 12;
      case 'biweekly': return 26;
      case 'fortnightly': return 26; // Adding fortnightly support (same as biweekly)
      case 'weekly': return 52;
      case 'daily': return 365;
      case 'yearly': return 1;
      default: return 12;
    }
  };

  const paymentsPerYear = getPaymentFrequencyMultiplier(paymentFrequency);
  const periodicRate = interestRate / 100 / paymentsPerYear;
  const totalPayments = termYears * paymentsPerYear;

  // Calculate base monthly payment using standard formula
  const monthlyRate = interestRate / 100 / 12;
  const monthlyPayments = termYears * 12;
  
  // Standard amortization formula: PMT = P * [r(1+r)^n] / [(1+r)^n - 1]
  const monthlyPayment = amount * (monthlyRate * Math.pow(1 + monthlyRate, monthlyPayments)) / 
    (Math.pow(1 + monthlyRate, monthlyPayments) - 1);

  // Calculate periodic payment based on frequency
  const periodicPayment = amount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) / 
    (Math.pow(1 + periodicRate, totalPayments) - 1);

  // Calculate extra payment per period with precision
  const getExtraPaymentPerPeriod = () => {
    if (!extraPayment) return 0;
    
    const extraFreqMultiplier = getPaymentFrequencyMultiplier(extraPaymentFrequency);
    const paymentFreqMultiplier = getPaymentFrequencyMultiplier(paymentFrequency);
    
    // Calculate exact ratio for accurate extra payment distribution
    return (extraPayment * extraFreqMultiplier) / paymentFreqMultiplier;
  };

  const extraPaymentPerPeriod = getExtraPaymentPerPeriod();

  // Generate original schedule (no extra payments)
  const originalSchedule = generateAmortizationSchedule({
    principal: amount,
    periodicRate,
    periodicPayment,
    startDate: parsedStartDate,
    paymentFrequency,
    extraPaymentPerPeriod: 0,
    lumpSumPayments: []
  });

  // Generate optimized schedule (with extra payments)
  const optimizedSchedule = generateAmortizationSchedule({
    principal: amount,
    periodicRate,
    periodicPayment,
    startDate: parsedStartDate,
    paymentFrequency,
    extraPaymentPerPeriod,
    lumpSumPayments
  });

  // Calculate totals with high precision
  const originalTotalInterest = originalSchedule.reduce((sum, payment) => sum + payment.interest, 0);
  const optimizedTotalInterest = optimizedSchedule.reduce((sum, payment) => sum + payment.interest, 0);
  const totalInterestSaved = originalTotalInterest - optimizedTotalInterest;
  const monthsSaved = Math.max(0, originalSchedule.length - optimizedSchedule.length);
  const payoffDate = optimizedSchedule.length > 0 ? 
    optimizedSchedule[optimizedSchedule.length - 1].date : startDate;

  // Calculate lump sum payment impacts (for each lump sum payment)
  const lumpSumImpacts = [];
  
  if (lumpSumPayments && lumpSumPayments.length > 0) {
    lumpSumPayments.forEach(payment => {
      // Calculate impact without this specific lump sum payment
      const filteredLumpSums = lumpSumPayments.filter(p => p.id !== payment.id);
      
      const scheduleWithoutThisLumpSum = generateAmortizationSchedule({
        principal: amount,
        periodicRate,
        periodicPayment,
        startDate: parsedStartDate,
        paymentFrequency,
        extraPaymentPerPeriod,
        lumpSumPayments: filteredLumpSums
      });
      
      // Calculate the difference this lump sum payment makes
      const interestWithout = scheduleWithoutThisLumpSum.reduce((sum, payment) => sum + payment.interest, 0);
      const interestSaved = interestWithout - optimizedTotalInterest;
      const timeMonthsSaved = scheduleWithoutThisLumpSum.length - optimizedSchedule.length;
      
      lumpSumImpacts.push({
        id: payment.id,
        amount: payment.amount,
        date: payment.date,
        interestSaved: Math.round(interestSaved),
        monthsSaved: Math.max(0, timeMonthsSaved)
      });
    });
  }

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100, // Round to 2 decimal places for accuracy
    periodicPayment: Math.round(periodicPayment * 100) / 100, // Round to 2 decimal places
    originalSchedule,
    optimizedSchedule,
    totalInterestSaved: Math.round(totalInterestSaved),
    monthsSaved,
    payoffDate,
    originalTotalInterest: Math.round(originalTotalInterest),
    optimizedTotalInterest: Math.round(optimizedTotalInterest),
    lumpSumImpacts
  };
};

const generateAmortizationSchedule = ({
  principal,
  periodicRate,
  periodicPayment,
  startDate,
  paymentFrequency,
  extraPaymentPerPeriod,
  lumpSumPayments
}) => {
  const schedule = [];
  let currentBalance = principal;
  let currentDate = new Date(startDate);
  let paymentNumber = 1;

  // Sort lump sum payments by date
  const sortedLumpSums = [...lumpSumPayments]
    .filter(payment => payment && payment.date && payment.amount)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
    
  let lumpSumIndex = 0;

  const getNextPaymentDate = (date, frequency) => {
    switch (frequency) {
      case 'monthly': return addMonths(date, 1);
      case 'biweekly': return addWeeks(date, 2);
      case 'fortnightly': return addWeeks(date, 2); // Adding fortnightly support
      case 'weekly': return addWeeks(date, 1);
      case 'daily': return addDays(date, 1);
      case 'yearly': return addYears(date, 1);
      default: return addMonths(date, 1);
    }
  };

  while (currentBalance > 0.01 && paymentNumber <= 1200) { // Safety limit increased for very long loans
    // Calculate interest with high precision
    const interestPayment = currentBalance * periodicRate;
    let principalPayment = periodicPayment - interestPayment;
    let extraPayment = extraPaymentPerPeriod;
    let lumpSumPayment = 0;

    // Check for lump sum payments on this date
    while (
      lumpSumIndex < sortedLumpSums.length && 
      new Date(sortedLumpSums[lumpSumIndex].date) <= currentDate
    ) {
      lumpSumPayment += sortedLumpSums[lumpSumIndex].amount;
      lumpSumIndex++;
    }

    // Ensure we don't overpay with high precision calculation
    const totalPayment = principalPayment + extraPayment + lumpSumPayment;
    if (totalPayment > currentBalance) {
      const overage = totalPayment - currentBalance;
      if (lumpSumPayment >= overage) {
        lumpSumPayment -= overage;
      } else if (extraPayment >= (overage - lumpSumPayment)) {
        extraPayment -= (overage - lumpSumPayment);
        lumpSumPayment = 0;
      } else {
        principalPayment = currentBalance - interestPayment;
        extraPayment = 0;
        lumpSumPayment = 0;
      }
    }

    const totalPrincipal = principalPayment + extraPayment + lumpSumPayment;
    currentBalance -= totalPrincipal;
    
    // Ensure no negative balance with a safety check
    currentBalance = Math.max(0, currentBalance);

    schedule.push({
      paymentNumber,
      date: format(currentDate, 'yyyy-MM-dd'),
      principal: Math.round(principalPayment * 100) / 100,
      interest: Math.round(interestPayment * 100) / 100,
      extraPayment: Math.round(extraPayment * 100) / 100,
      lumpSumPayment: Math.round(lumpSumPayment * 100) / 100,
      balance: Math.max(0, Math.round(currentBalance * 100) / 100)
    });

    if (currentBalance <= 0.01) break;
    
    currentDate = getNextPaymentDate(currentDate, paymentFrequency);
    paymentNumber++;
  }

  return schedule;
};