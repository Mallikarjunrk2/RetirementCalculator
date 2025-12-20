'use client';

import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Calendar, Percent, Target, Calculator, ChevronRight, Info, ShieldCheck } from 'lucide-react';

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

  // Human readable currency formatter
  const formatCurrency = (value) => {
    if (value >= 10000000) return `${(value / 10000000).toFixed(2)} Cr`;
    if (value >= 100000) return `${(value / 100000).toFixed(2)} L`;
    return `₹${value.toLocaleString()}`;
  };

  const calculateRetirement = () => {
    const yearsToRetirement = inputs.retirementAge - inputs.currentAge;
    const yearsInRetirement = inputs.lifeExpectancy - inputs.retirementAge;
    
    let corpus = inputs.currentSavings;
    const monthlyRate = advanced.preRetirementReturn / 100 / 12;
    const months = yearsToRetirement * 12;
    
    const fvCurrentSavings = corpus * Math.pow(1 + monthlyRate, months);
    const fvContributions = inputs.monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const totalCorpus = fvCurrentSavings + fvContributions;
    
    const inflatedMonthlyExpense = inputs.monthlyExpenseToday * Math.pow(1 + inputs.expenseInflation / 100, yearsToRetirement) * advanced.lifestyleChange;
    const inflatedMedicalExpense = advanced.medicalExpenses * Math.pow(1 + advanced.medicalInflation / 100, yearsToRetirement);
    
    const totalMonthlyExpense = inflatedMonthlyExpense + inflatedMedicalExpense / 12;
    const annualExpense = totalMonthlyExpense * 12;
    
    const realReturn = ((1 + advanced.postRetirementReturn / 100) / (1 + inputs.inflationRate / 100)) - 1;
    const requiredCorpus = annualExpense * ((1 - Math.pow(1 + realReturn, -yearsInRetirement)) / realReturn);
    
    const emergencyFund = annualExpense * advanced.emergencyYears;
    const totalRequired = requiredCorpus + emergencyFund;
    
    const chartData = [];
    let currentCorpus = inputs.currentSavings;
    
    for (let year = 0; year <= inputs.lifeExpectancy - inputs.currentAge; year++) {
      const age = inputs.currentAge + year;
      if (age < inputs.retirementAge) {
        const yearlyContribution = inputs.monthlyContribution * 12;
        currentCorpus = (currentCorpus + yearlyContribution) * (1 + advanced.preRetirementReturn / 100);
        chartData.push({ age, wealth: Math.round(currentCorpus) });
      } else {
        const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, age - inputs.retirementAge);
        currentCorpus = currentCorpus * (1 + advanced.postRetirementReturn / 100) - yearExpense;
        chartData.push({ age, wealth: Math.round(Math.max(0, currentCorpus)) });
      }
    }
    
    setCalculations({
      totalCorpus, requiredCorpus, gap: totalRequired - totalCorpus,
      monthlyExpenseAtRetirement: totalMonthlyExpense, chartData,
      yearsToRetirement, emergencyFund
    });

    setShowResults(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 pb-20">
      <div className="max-w-7xl mx-auto px-4 py-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Retirement <span className="text-blue-600">Planner</span></h1>
          <p className="text-slate-500 max-w-2xl mx-auto">Plan your future with advanced inflation-aware simulations.</p>
        </div>

        {/* INPUT SECTION - Now Centered */}
        <div className={`transition-all duration-500 ${showResults ? 'max-w-7xl' : 'max-w-2xl mx-auto'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {/* Basic Details */}
            <div className="bg-white rounded-[2rem] shadow-sm border p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Target className="text-blue-600" /> Basic Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">Current Age</label>
                  <input type="number" value={inputs.currentAge} onChange={(e) => handleInputChange('currentAge', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2 border font-bold outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">Retirement Age</label>
                  <input type="number" value={inputs.retirementAge} onChange={(e) => handleInputChange('retirementAge', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2 border font-bold outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">Monthly SIP (₹)</label>
                  <input type="number" value={inputs.monthlyContribution} onChange={(e) => handleInputChange('monthlyContribution', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2 border font-bold outline-none" />
                </div>
              </div>
            </div>

            {/* Advanced Settings */}
            <div className="bg-white rounded-[2rem] shadow-sm border p-8">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Percent className="text-indigo-600" /> Advanced Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">Pre-Retirement Return (%)</label>
                  <input type="number" value={advanced.preRetirementReturn} onChange={(e) => handleAdvancedChange('preRetirementReturn', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2 border font-bold outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">Inflation Rate (%)</label>
                  <input type="number" value={inputs.inflationRate} onChange={(e) => handleInputChange('inflationRate', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2 border font-bold outline-none" />
                </div>
                <div>
                  <label className="text-xs font-black uppercase text-slate-400 block mb-1">Medical Inflation (%)</label>
                  <input type="number" value={advanced.medicalInflation} onChange={(e) => handleAdvancedChange('medicalInflation', e.target.value)} className="w-full bg-slate-50 rounded-xl px-4 py-2 border font-bold outline-none" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center mb-16">
            <button onClick={calculateRetirement} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-12 rounded-full shadow-xl transition-transform active:scale-95 flex items-center gap-2">
              <Calculator size={20} /> Calculate My Plan
            </button>
          </div>
        </div>

        {/* RESULTS SECTION - Below Side by Side */}
        {showResults && calculations && (
          <div id="results-section" className="animate-in fade-in slide-in-from-bottom-10 duration-700">
            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              {/* Wealth Chart */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border p-8">
                <h2 className="text-xl font-bold mb-6">Wealth Projection</h2>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={calculations.chartData}>
                      <defs>
                        <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="age" tick={{fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} label={{ value: 'Age', position: 'insideBottom', offset: -5 }} />
                      <YAxis tickFormatter={(v) => `${(v/10000000).toFixed(1)}Cr`} tick={{fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), "Wealth"]}
                        labelFormatter={(label) => `Age: ${label}`}
                        contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="wealth" stroke="#3b82f6" strokeWidth={3} fill="url(#colorWealth)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights and Recommendations */}
              <div className="space-y-6">
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 flex justify-between items-center">
                  <div>
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Target Corpus Needed</p>
                    <p className="text-4xl font-black">{formatCurrency(calculations.requiredCorpus)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">You'll Have</p>
                    <p className="text-2xl font-bold text-blue-400">{formatCurrency(calculations.totalCorpus)}</p>
                  </div>
                </div>

                {/* Intelligent Recommendations */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2">💡 Recommendations</h2>
                  <div className="space-y-4">
                    {calculations.gap > 0 ? (
                      <>
                        <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex gap-4 items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-black">1</div>
                          <div>
                            <p className="font-bold">Increase Monthly SIP</p>
                            <p className="text-sm text-slate-500">Add ₹{Math.round(calculations.gap / (calculations.yearsToRetirement * 12 * 2))} more to your SIP to reach the goal faster.</p>
                          </div>
                        </div>

                        {/* Smart Logic for Work Years */}
                        {(inputs.retirementAge + Math.ceil(calculations.gap / (inputs.monthlyContribution * 12))) < 80 ? (
                          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-4 items-center">
                            <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-black">2</div>
                            <div>
                              <p className="font-bold">Slightly Delay Retirement</p>
                              <p className="text-sm text-slate-500">Extending your career to age {Math.min(75, inputs.retirementAge + 3)} significantly builds your corpus.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-center">
                            <div className="w-10 h-10 bg-amber-600 rounded-full flex items-center justify-center text-white font-black">2</div>
                            <div>
                              <p className="font-bold">Diversify Portfolio</p>
                              <p className="text-sm text-slate-500">Consider equity for higher returns ({inputs.expectedReturn + 2}%) to hit your {formatCurrency(calculations.requiredCorpus)} target.</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="font-bold text-emerald-600">Your plan is perfect! No adjustments needed.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
