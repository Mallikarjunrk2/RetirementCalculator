'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Calendar, Percent, Target, Calculator } from 'lucide-react';

export default function RetirementCalculator() {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 60,
    lifeExpectancy: 85,
    currentSavings: 100000,
    monthlyContribution: 2000,
    expectedReturn: 12,
    inflationRate: 6,
    monthlyExpenseToday: 50000,
    expenseInflation: 7,
  });

  const [advanced, setAdvanced] = useState({
    preRetirementReturn: 12,
    postRetirementReturn: 8,
    emergencyYears: 2,
    lifestyleChange: 0.8,
    medicalInflation: 10,
    medicalExpenses: 10000,
  });

  const [showResults, setShowResults] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [calculations, setCalculations] = useState(null);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleAdvancedChange = (field, value) => {
    setAdvanced(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const calculateRetirement = () => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
    
    let corpus = inputs.currentSavings;
    const monthlyRate = advanced.preRetirementReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    
    const fvCurrentSavings = corpus * Math.pow(1 + monthlyRate, months);
    const fvContributions = inputs.monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const totalCorpus = fvCurrentSavings + fvContributions;
    
    const inflatedMonthlyExpense = inputs.monthlyExpenseToday * 
      Math.pow(1 + inputs.expenseInflation / 100, yearsToRetirement) * 
      advanced.lifestyleChange;
    
    const inflatedMedicalExpense = advanced.medicalExpenses * 
      Math.pow(1 + advanced.medicalInflation / 100, yearsToRetirement);
    
    const totalMonthlyExpense = inflatedMonthlyExpense + inflatedMedicalExpense / 12;
    const annualExpense = totalMonthlyExpense * 12;
    
    const realReturn = ((1 + advanced.postRetirementReturn / 100) / 
      (1 + inputs.inflationRate / 100)) - 1;
    
    const requiredCorpus = annualExpense * 
      ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);
    
    const emergencyFund = annualExpense * advanced.emergencyYears;
    const totalRequired = requiredCorpus + emergencyFund;
    
    const chartData = [];
    let currentCorpus = inputs.currentSavings;
    
    for (let year = 0; year <= inputs.lifeExpectancy - inputs.currentAge; year++) {
      const age = inputs.currentAge + year;
      
      if (age < inputs.retirementAge) {
        const yearlyContribution = inputs.monthlyContribution * 12;
        currentCorpus = (currentCorpus + yearlyContribution) * 
          (1 + advanced.preRetirementReturn / 100);
        
        chartData.push({
          age,
          corpus: Math.round(currentCorpus),
          withdrawal: 0,
          phase: 'Accumulation'
        });
      } else {
        const yearExpense = annualExpense * 
          Math.pow(1 + inputs.inflationRate / 100, age - inputs.retirementAge);
        
        currentCorpus = currentCorpus * (1 + advanced.postRetirementReturn / 100) - yearExpense;
        
        chartData.push({
          age,
          corpus: Math.round(Math.max(0, currentCorpus)),
          withdrawal: Math.round(yearExpense),
          phase: 'Withdrawal'
        });
      }
    }
    
    const runSimulation = () => {
      let successCount = 0;
      const simulations = 1000;
      
      for (let sim = 0; sim < simulations; sim++) {
        let simCorpus = totalCorpus;
        
        for (let year = 0; year < yearsInRetirement; year++) {
          const randomReturn = (Math.random() - 0.5) * 10 + advanced.postRetirementReturn;
          const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, year);
          simCorpus = simCorpus * (1 + randomReturn / 100) - yearExpense;
          
          if (simCorpus < 0) break;
        }
        
        if (simCorpus > 0) successCount++;
      }
      
      return (successCount / simulations * 100).toFixed(1);
    };
    
    const successRate = runSimulation();
    
    const result = {
      totalCorpus: Math.round(totalCorpus),
      requiredCorpus: Math.round(totalRequired),
      gap: Math.round(totalRequired - totalCorpus),
      monthlyExpenseAtRetirement: Math.round(totalMonthlyExpense),
      chartData,
      successRate,
      yearsToRetirement,
      yearsInRetirement,
      emergencyFund: Math.round(emergencyFund),
    };

    setCalculations(result);
    setShowResults(true);
    setShowPopup(true);

    // Auto hide popup after 3 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 3000);

    // Scroll to results
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const getStatusColor = () => {
    if (!calculations) return 'text-slate-600';
    if (calculations.gap <= 0) return 'text-emerald-600';
    if (calculations.gap <= calculations.totalCorpus * 0.2) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getStatusMessage = () => {
    if (!calculations) return 'Calculate Now';
    if (calculations.gap <= 0) return 'On Track! 🎉';
    if (calculations.gap <= calculations.totalCorpus * 0.2) return 'Almost There';
    return 'Action Needed';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      {/* Success/Warning Popup */}
      {showPopup && calculations && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="animate-[scale-in_0.3s_ease-out] pointer-events-auto">
            {calculations.gap <= 0 ? (
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border-4 border-emerald-500">
                <div className="text-8xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-3xl font-bold text-emerald-600 mb-2">Congratulations!</h2>
                <p className="text-xl text-slate-700">You're on track for a comfortable retirement!</p>
                <div className="mt-4 text-lg font-semibold text-emerald-700">
                  Success Rate: {calculations.successRate}% ✨
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md text-center border-4 border-amber-500">
                <div className="text-8xl mb-4 animate-bounce">😟</div>
                <h2 className="text-3xl font-bold text-amber-600 mb-2">Action Required!</h2>
                <p className="text-xl text-slate-700">You have a shortfall of</p>
                <div className="text-3xl font-bold text-rose-600 my-2">
                  ₹{(Math.abs(calculations.gap) / 10000000).toFixed(2)} Cr
                </div>
                <p className="text-sm text-slate-600">Check recommendations below 👇</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">Retirement Planner</h1>
          <p className="text-slate-600">Advanced calculator with inflation scenarios & Monte Carlo simulation</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Input Panel */}
          <div className="lg:col-span-1 space-y-4">
            {/* Basic Inputs */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                Basic Details
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Current Age</label>
                  <input
                    type="number"
                    value={inputs.currentAge}
                    onChange={(e) => handleInputChange('currentAge', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Retirement Age</label>
                  <input
                    type="number"
                    value={inputs.retirementAge}
                    onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Life Expectancy</label>
                  <input
                    type="number"
                    value={inputs.lifeExpectancy}
                    onChange={(e) => handleInputChange('lifeExpectancy', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Current Savings (₹)</label>
                  <input
                    type="number"
                    value={inputs.currentSavings}
                    onChange={(e) => handleInputChange('currentSavings', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Monthly SIP (₹)</label>
                  <input
                    type="number"
                    value={inputs.monthlyContribution}
                    onChange={(e) => handleInputChange('monthlyContribution', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Monthly Expenses Today (₹)</label>
                  <input
                    type="number"
                    value={inputs.monthlyExpenseToday}
                    onChange={(e) => handleInputChange('monthlyExpenseToday', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">General Inflation (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.inflationRate}
                    onChange={(e) => handleInputChange('inflationRate', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Expense Inflation (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={inputs.expenseInflation}
                    onChange={(e) => handleInputChange('expenseInflation', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Advanced Settings
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-600 block mb-1">Pre-Retirement Return (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={advanced.preRetirementReturn}
                    onChange={(e) => handleAdvancedChange('preRetirementReturn', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Post-Retirement Return (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={advanced.postRetirementReturn}
                    onChange={(e) => handleAdvancedChange('postRetirementReturn', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Lifestyle Adjustment</label>
                  <select
                    value={advanced.lifestyleChange}
                    onChange={(e) => handleAdvancedChange('lifestyleChange', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="0.6">60% - Minimal lifestyle</option>
                    <option value="0.7">70% - Reduced expenses</option>
                    <option value="0.8">80% - Comfortable</option>
                    <option value="0.9">90% - Similar lifestyle</option>
                    <option value="1.0">100% - Same as today</option>
                    <option value="1.2">120% - Enhanced lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Monthly Medical Expenses (₹)</label>
                  <input
                    type="number"
                    value={advanced.medicalExpenses}
                    onChange={(e) => handleAdvancedChange('medicalExpenses', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Medical Inflation (%)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={advanced.medicalInflation}
                    onChange={(e) => handleAdvancedChange('medicalInflation', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-600 block mb-1">Emergency Fund (Years)</label>
                  <input
                    type="number"
                    value={advanced.emergencyYears}
                    onChange={(e) => handleAdvancedChange('emergencyYears', e.target.value)}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Calculate Button */}
            <button
              onClick={calculateRetirement}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-3"
            >
              <Calculator className="w-6 h-6" />
              Calculate My Retirement Plan
            </button>
          </div>

          {/* Results Section */}
          <div id="results-section" className="lg:col-span-2 space-y-6">
            {!showResults ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">📊</div>
                <h2 className="text-2xl font-semibold text-slate-800 mb-2">Ready to Plan Your Future?</h2>
                <p className="text-slate-600 mb-6">Fill in your details and click "Calculate" to see your retirement projection</p>
                <div className="flex justify-center gap-4 text-sm text-slate-500">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                    Advanced Analytics
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    Monte Carlo Simulation
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    Personalized Tips
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Status Card */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">You'll Have</div>
                      <div className="text-3xl font-bold text-slate-800">
                        ₹{(calculations.totalCorpus / 10000000).toFixed(2)}Cr
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-slate-600 mb-1">You'll Need</div>
                      <div className="text-3xl font-bold text-slate-800">
                        ₹{(calculations.requiredCorpus / 10000000).toFixed(2)}Cr
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`text-sm text-slate-600 mb-1`}>Status</div>
                      <div className={`text-3xl font-bold ${getStatusColor()}`}>
                        {getStatusMessage()}
                      </div>
                      <div className="text-sm text-slate-600 mt-1">
                        Success Rate: {calculations.successRate}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Projection Chart */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Wealth Projection
                  </h2>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={calculations.chartData}>
                      <defs>
                        <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="age" stroke="#64748b" />
                      <YAxis stroke="#64748b" tickFormatter={(value) => `₹${(value/10000000).toFixed(1)}Cr`} />
                      <Tooltip 
                        contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        formatter={(value) => [`₹${(value/100000).toFixed(2)}L`, '']}
                      />
                      <Area type="monotone" dataKey="corpus" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCorpus)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Key Insights */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <DollarSign className="w-6 h-6 text-blue-600 mt-1" />
                      <div>
                        <div className="text-sm text-blue-700 mb-1">Monthly Expense at Retirement</div>
                        <div className="text-2xl font-bold text-blue-900">
                          ₹{(calculations.monthlyExpenseAtRetirement / 1000).toFixed(0)}K
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          {(advanced.lifestyleChange * 100).toFixed(0)}% of today's lifestyle
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Calendar className="w-6 h-6 text-emerald-600 mt-1" />
                      <div>
                        <div className="text-sm text-emerald-700 mb-1">Emergency Fund</div>
                        <div className="text-2xl font-bold text-emerald-900">
                          ₹{(calculations.emergencyFund / 100000).toFixed(1)}L
                        </div>
                        <div className="text-xs text-emerald-600 mt-1">
                          {advanced.emergencyYears} years of expenses
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-6 h-6 text-purple-600 mt-1" />
                      <div>
                        <div className="text-sm text-purple-700 mb-1">Success Probability</div>
                        <div className="text-2xl font-bold text-purple-900">
                          {calculations.successRate}%
                        </div>
                        <div className="text-xs text-purple-600 mt-1">
                          Based on Monte Carlo simulation
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
                      <div>
                        <div className="text-sm text-amber-700 mb-1">
                          {calculations.gap > 0 ? 'Shortfall' : 'Surplus'}
                        </div>
                        <div className="text-2xl font-bold text-amber-900">
                          ₹{(Math.abs(calculations.gap) / 10000000).toFixed(2)}Cr
                        </div>
                        <div className="text-xs text-amber-600 mt-1">
                          {calculations.gap > 0 ? 'Increase SIP or retirement age' : 'You\'re ahead of target!'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                {calculations.gap > 0 && (
                  <div className="bg-white rounded-2xl shadow-lg p-6">
                    <h2 className="text-lg font-semibold text-slate-800 mb-4">💡 Recommendations</h2>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">1</div>
                        <div>
                          <div className="font-medium text-slate-800">Increase Monthly SIP</div>
                          <div className="text-sm text-slate-600">
                            Raise to ₹{Math.round((inputs.monthlyContribution + (calculations.gap / (calculations.yearsToRetirement * 12))) / 1000)}K/month to bridge the gap
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">2</div>
                        <div>
                          <div className="font-medium text-slate-800">Work {Math.ceil(calculations.gap / (inputs.monthlyContribution * 12))} More Years</div>
                          <div className="text-sm text-slate-600">
                            Delay retirement to age {inputs.retirementAge + Math.ceil(calculations.gap / (inputs.monthlyContribution * 12))} to reach your goal
                          </div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-purple-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">3</div>
                        <div>
                          <div className="font-medium text-slate-800">Adjust Lifestyle</div>
                          <div className="text-sm text-slate-600">
                            Reduce post-retirement expenses by {Math.round((1 - (calculations.totalCorpus / calculations.requiredCorpus) * advanced.lifestyleChange) * 100)}% to match your corpus
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>* This calculator provides estimates based on assumptions. Actual results may vary.</p>
          <p>Consult with a certified financial planner for personalized advice.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

