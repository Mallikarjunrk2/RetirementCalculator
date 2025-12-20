'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { TrendingUp, AlertCircle, DollarSign, Calendar, Percent, Target, Calculator, ChevronRight, Info } from 'lucide-react';

export default function RetirementCalculator() {
  // Logic remains identical to your original code
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

  // Original calculation logic preserved exactly
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
    
    const realReturn = ((1 + advanced.postRetirementReturn / 100) / 
      (1 + inputs.inflationRate / 100)) - 1;
    
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
        chartData.push({ age, corpus: Math.round(currentCorpus), phase: 'Accumulation' });
      } else {
        const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, age - inputs.retirementAge);
        currentCorpus = currentCorpus * (1 + advanced.postRetirementReturn / 100) - yearExpense;
        chartData.push({ age, corpus: Math.round(Math.max(0, currentCorpus)), withdrawal: Math.round(yearExpense), phase: 'Withdrawal' });
      }
    }
    
    const successRate = (() => {
      let successCount = 0;
      for (let sim = 0; sim < 1000; sim++) {
        let simCorpus = totalCorpus;
        for (let year = 0; year < yearsInRetirement; year++) {
          const randomReturn = (Math.random() - 0.5) * 10 + advanced.postRetirementReturn;
          const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, year);
          simCorpus = simCorpus * (1 + randomReturn / 100) - yearExpense;
          if (simCorpus < 0) break;
        }
        if (simCorpus > 0) successCount++;
      }
      return (successCount / 10).toFixed(1);
    })();
    
    setCalculations({ totalCorpus, requiredCorpus, gap: Math.round(totalRequired - totalCorpus), monthlyExpenseAtRetirement: Math.round(totalMonthlyExpense), chartData, successRate, yearsToRetirement, emergencyFund: Math.round(emergencyFund) });
    setShowResults(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 4000);
    setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 500);
  };

  const getStatusColor = () => {
    if (!calculations) return 'text-slate-600';
    return calculations.gap <= 0 ? 'text-emerald-500' : 'text-rose-500';
  };

  // Modern Input Component for consistency
  const InputGroup = ({ label, value, onChange, type = "number", min, max, step = 1, prefix }) => (
    <div className="group space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
        {label}
      </label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full ${prefix ? 'pl-8' : 'px-4'} py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none text-slate-700 font-medium`}
        />
      </div>
      {type === "range" && (
        <input 
          type="range" min={min} max={max} step={step} value={value} 
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-100">
      {/* Dynamic Background Ornament */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-200 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-200 blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 py-12 md:px-8">
        {/* Header Section */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest">Financial Planning</span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">Retirement <span className="text-blue-600">Architect</span></h1>
            <p className="text-slate-500 text-lg max-w-lg">Advanced simulations for Indian investors considering real-world inflation.</p>
          </div>
          <div className="hidden lg:flex items-center gap-4 text-sm font-medium text-slate-400">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-400" /> Monte Carlo Ready</div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400" /> Real-time Projections</div>
          </div>
        </header>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Controls Panel */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white">
              <div className="flex items-center gap-3 mb-8 border-b border-slate-100 pb-4">
                <div className="p-2 bg-blue-600 rounded-lg text-white"><Target size={20} /></div>
                <h2 className="text-xl font-bold">Core Parameters</h2>
              </div>
              
              <div className="grid gap-6">
                <InputGroup label="Current Age" value={inputs.currentAge} onChange={(val) => handleInputChange('currentAge', val)} />
                <InputGroup label="Retirement Age" value={inputs.retirementAge} onChange={(val) => handleInputChange('retirementAge', val)} />
                <InputGroup label="Monthly SIP" value={inputs.monthlyContribution} prefix="₹" onChange={(val) => handleInputChange('monthlyContribution', val)} />
                <InputGroup label="Current Corpus" value={inputs.currentSavings} prefix="₹" onChange={(val) => handleInputChange('currentSavings', val)} />
                <InputGroup label="Monthly Expense Today" value={inputs.monthlyExpenseToday} prefix="₹" onChange={(val) => handleInputChange('monthlyExpenseToday', val)} />
              </div>

              <button
                onClick={calculateRetirement}
                className="w-full mt-10 bg-slate-900 hover:bg-blue-600 text-white font-bold py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 group"
              >
                Run Simulation
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            
            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-8 shadow-sm border border-white">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                <Info size={14}/> Advanced Variables
              </h2>
              <div className="space-y-6">
                <InputGroup label="Returns (Pre-Retire)" value={advanced.preRetirementReturn} suffix="%" onChange={(val) => handleAdvancedChange('preRetirementReturn', val)} />
                <InputGroup label="Inflation Rate" value={inputs.inflationRate} suffix="%" onChange={(val) => handleInputChange('inflationRate', val)} />
              </div>
            </div>
          </aside>

          {/* Visualization Panel */}
          <main id="results-section" className="lg:col-span-8">
            {!showResults ? (
              <div className="h-full min-h-[500px] bg-white rounded-[2rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                  <Calculator size={40} className="text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Simulation Pending</h2>
                <p className="text-slate-500 mt-2 max-w-xs">Adjust your parameters and click "Run Simulation" to visualize your financial future.</p>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Hero Stats */}
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: 'Projected Corpus', val: (calculations.totalCorpus / 10000000).toFixed(2) + ' Cr', color: 'text-slate-900' },
                    { label: 'Required Target', val: (calculations.requiredCorpus / 10000000).toFixed(2) + ' Cr', color: 'text-slate-900' },
                    { label: 'Plan Health', val: calculations.gap <= 0 ? 'Optimal' : 'Gap Exists', color: getStatusColor() }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-[1.5rem] shadow-sm border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.val}</p>
                    </div>
                  ))}
                </div>

                {/* Main Chart */}
                <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="text-blue-500" /> Wealth Trajectory
                    </h2>
                    <div className="flex gap-4 text-xs font-bold">
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded-full" /> Accumulation</span>
                      <span className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded-full" /> Withdrawal</span>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calculations.chartData}>
                        <defs>
                          <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis tickFormatter={(v) => `₹${(v/10000000).toFixed(1)}Cr`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}} />
                        <Area type="monotone" dataKey="corpus" stroke="#3b82f6" strokeWidth={3} fill="url(#colorCorpus)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Additional Insight Cards (Monte Carlo, etc.) */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-600 rounded-[2rem] p-8 text-white relative overflow-hidden group">
                    <div className="absolute right-0 top-0 opacity-10 group-hover:scale-110 transition-transform"><TrendingUp size={160} /></div>
                    <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Simulation Confidence</p>
                    <h3 className="text-4xl font-black mb-4">{calculations.successRate}%</h3>
                    <p className="text-blue-100 text-sm leading-relaxed">Based on 1,000 market scenarios, your current plan survives in {calculations.successRate}% of market conditions.</p>
                  </div>
                  
                  <div className="bg-slate-900 rounded-[2rem] p-8 text-white">
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-2">Retirement Monthly Budget</p>
                    <h3 className="text-4xl font-black mb-4">₹{(calculations.monthlyExpenseAtRetirement / 1000).toFixed(0)}K</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Estimated monthly purchasing power needed to maintain your lifestyle at age {inputs.retirementAge}.</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modern Achievement Popup */}
      {showPopup && calculations && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md animate-in slide-in-from-bottom-8">
          <div className={`p-1 rounded-3xl ${calculations.gap <= 0 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-amber-400 to-orange-500'} shadow-2xl`}>
            <div className="bg-white rounded-[1.4rem] p-6 flex items-center gap-4">
              <div className="text-4xl">{calculations.gap <= 0 ? '🎯' : '⚠️'}</div>
              <div>
                <h4 className="font-bold text-slate-900">{calculations.gap <= 0 ? 'Plan Validated!' : 'Gap Detected'}</h4>
                <p className="text-slate-500 text-sm">{calculations.gap <= 0 ? "You're financially bulletproof." : `Shortfall of ₹${(Math.abs(calculations.gap) / 10000000).toFixed(2)} Cr.`}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
