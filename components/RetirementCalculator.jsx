'use client';

import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, DollarSign, Calendar, Percent, Target, Calculator, Info, ShieldCheck } from 'lucide-react';

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
      yearsToRetirement, emergencyFund, totalRequired
    });

    setShowResults(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3500);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans pb-20 overflow-x-hidden">
      {/* Emoji Popup Overlay */}
      {showPopup && calculations && (
        <div className="fixed inset-0 flex items-center justify-center z-[100] pointer-events-none px-4">
          <div className="animate-[scale-in_0.3s_ease-out] bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm text-center border-4 border-white pointer-events-auto">
            {calculations.gap <= 0 ? (
              <>
                <div className="text-8xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-2xl font-black text-emerald-600 mb-2">Perfect!</h2>
                <p className="text-slate-600">You're on track for a comfortable retirement!</p>
              </>
            ) : (
              <>
                <div className="text-8xl mb-4 animate-bounce">😟</div>
                <h2 className="text-2xl font-black text-amber-600 mb-2">Shortfall!</h2>
                <p className="text-slate-600">Gap: <span className="text-rose-600 font-bold">{formatCurrency(Math.abs(calculations.gap))}</span></p>
                <p className="text-xs font-bold text-slate-400 mt-2">Adjust your plan below 👇</p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:px-8">
        <header className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">Retirement <span className="text-blue-600">Planner</span></h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto italic">Professional simulation considering Indian market inflation & lifestyle costs.</p>
        </header>

        {/* INPUT PANEL - Centered Initial View */}
        <div className={`transition-all duration-700 mx-auto ${showResults ? 'max-w-7xl' : 'max-w-2xl'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            {/* Basic Details */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><Target className="text-blue-600" /> Basic Details</h2>
              <div className="grid gap-6">
                {[
                  { label: "Current Age", key: "currentAge" },
                  { label: "Retirement Age", key: "retirementAge" },
                  { label: "Life Expectancy", key: "lifeExpectancy" },
                  { label: "Current Savings (₹)", key: "currentSavings" },
                  { label: "Monthly SIP (₹)", key: "monthlyContribution" },
                  { label: "Monthly Expense (Today)", key: "monthlyExpenseToday" },
                  { label: "Inflation Rate (%)", key: "inflationRate" }
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">{f.label}</label>
                    <input type="number" value={inputs[f.key]} onChange={(e) => handleInputChange(f.key, e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none" />
                  </div>
                ))}
              </div>
            </section>

            {/* Advanced Settings */}
            <section className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-8 hover:shadow-xl transition-shadow">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-3"><Percent className="text-indigo-600" /> Advanced Settings</h2>
              <div className="grid gap-6">
                {[
                  { label: "Pre-Retirement Return (%)", key: "preRetirementReturn" },
                  { label: "Post-Retirement Return (%)", key: "postRetirementReturn" },
                  { label: "Monthly Medical Exp (₹)", key: "medicalExpenses" },
                  { label: "Medical Inflation (%)", key: "medicalInflation" },
                  { label: "Emergency Fund (Years)", key: "emergencyYears" },
                  { label: "Expense Inflation (%)", key: "expenseInflation", target: "inputs" }
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">{f.label}</label>
                    <input 
                      type="number" 
                      value={f.target === "inputs" ? inputs[f.key] : advanced[f.key]} 
                      onChange={(e) => f.target === "inputs" ? handleInputChange(f.key, e.target.value) : handleAdvancedChange(f.key, e.target.value)} 
                      className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 transition-all outline-none" 
                    />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">Lifestyle Adjustment</label>
                  <select value={advanced.lifestyleChange} onChange={(e) => handleAdvancedChange('lifestyleChange', e.target.value)} className="w-full bg-slate-50 border-0 rounded-2xl px-4 py-3 font-bold text-slate-700 focus:ring-4 focus:ring-blue-100 outline-none">
                    <option value="0.8">80% - Comfortable</option>
                    <option value="1.0">100% - Same as today</option>
                  </select>
                </div>
              </div>
            </section>
          </div>

          <div className="flex justify-center mb-16">
            <button onClick={calculateRetirement} className="bg-blue-600 hover:bg-blue-700 text-white font-black py-5 px-16 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center gap-3 text-lg group">
              <Calculator size={24} /> Calculate My Retirement Plan
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* RESULTS - Below Side-by-Side */}
        {showResults && calculations && (
          <div id="results-section" className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <div className="grid lg:grid-cols-2 gap-8 mb-10">
              {/* Chart Card */}
              <div className="bg-white rounded-[3rem] shadow-sm border border-slate-100 p-8">
                <h2 className="text-xl font-bold mb-10 flex items-center gap-2"><TrendingUp className="text-blue-500" /> Wealth Trajectory</h2>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={calculations.chartData}>
                      <defs>
                        <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} dy={10} />
                      <YAxis tickFormatter={(v) => `${(v/10000000).toFixed(1)}Cr`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                      <Tooltip 
                        formatter={(value) => [formatCurrency(value), "Net Wealth"]}
                        labelFormatter={(label) => `Age: ${label}`}
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                      />
                      <Area type="monotone" dataKey="wealth" stroke="#3b82f6" strokeWidth={4} fill="url(#colorWealth)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Insights & Recommendations */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target Needed</p>
                    <p className="text-3xl font-black">{formatCurrency(calculations.totalRequired)}</p>
                  </div>
                  <div className={`rounded-[2.5rem] p-8 ${calculations.gap <= 0 ? 'bg-emerald-500 text-white' : 'bg-rose-100 text-rose-900'}`}>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{calculations.gap <= 0 ? 'Surplus' : 'Shortfall'}</p>
                    <p className="text-3xl font-black">{formatCurrency(Math.abs(calculations.gap))}</p>
                  </div>
                </div>

                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-10">
                  <h2 className="text-xl font-bold mb-8 flex items-center gap-2">💡 Suggestions</h2>
                  <div className="space-y-6">
                    {calculations.gap > 0 ? (
                      <>
                        <div className="flex gap-5 items-start">
                          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black flex-shrink-0">1</div>
                          <div>
                            <p className="font-bold text-slate-800">Increase SIP</p>
                            <p className="text-sm text-slate-500">Adding ₹{Math.round(calculations.gap / (calculations.yearsToRetirement * 240))} to your monthly SIP significantly bridges the gap.</p>
                          </div>
                        </div>
                        {inputs.retirementAge + 5 <= 80 ? (
                          <div className="flex gap-5 items-start">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black flex-shrink-0">2</div>
                            <div>
                              <p className="font-bold text-slate-800">Work 3-5 More Years</p>
                              <p className="text-sm text-slate-500">Delaying retirement to age {inputs.retirementAge + 3} reduces the corpus needed and adds more time for compounding.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-5 items-start">
                            <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-black flex-shrink-0">2</div>
                            <div>
                              <p className="font-bold text-slate-800">Adjust Expectations</p>
                              <p className="text-sm text-slate-500">Consider a portfolio targeting {advanced.preRetirementReturn + 2}% returns to reach your target by age {inputs.retirementAge}.</p>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="font-bold text-emerald-600 text-center py-10">Excellent! Your current plan fully covers your retirement needs.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes scale-in {
          0% { transform: scale(0.5); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

function ChevronRight(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>;
}
