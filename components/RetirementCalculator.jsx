
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

  // Original Logic Preserved from
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
        
        chartData.push({
          age,
          corpus: Math.round(currentCorpus),
          withdrawal: 0,
          phase: 'Accumulation'
        });
      } else {
        const yearExpense = annualExpense * Math.pow(1 + inputs.inflationRate / 100, age - inputs.retirementAge);
        
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
    
    setCalculations({
      totalCorpus: Math.round(totalCorpus),
      requiredCorpus: Math.round(totalRequired),
      gap: Math.round(totalRequired - totalCorpus),
      monthlyExpenseAtRetirement: Math.round(totalMonthlyExpense),
      chartData,
      successRate,
      yearsToRetirement,
      yearsInRetirement,
      emergencyFund: Math.round(emergencyFund),
    });

    setShowResults(true);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
    setTimeout(() => {
      document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  const getStatusColor = () => {
    if (!calculations) return 'text-slate-600';
    if (calculations.gap <= 0) return 'text-emerald-500';
    if (calculations.gap <= calculations.totalCorpus * 0.2) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getStatusMessage = () => {
    if (!calculations) return 'Calculate Now';
    if (calculations.gap <= 0) return 'On Track! 🎉';
    if (calculations.gap <= calculations.totalCorpus * 0.2) return 'Almost There';
    return 'Action Needed';
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 pb-20">
      {/* Background Ornament */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 z-0">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-200 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-indigo-200 blur-[100px]" />
      </div>

      {/* Popup Overlay - From */}
      {showPopup && calculations && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
          <div className="animate-in zoom-in-95 duration-300 pointer-events-auto">
            {calculations.gap <= 0 ? (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm text-center border-4 border-emerald-500">
                <div className="text-7xl mb-4 animate-bounce">🎉</div>
                <h2 className="text-2xl font-black text-emerald-600 mb-2">Congratulations!</h2>
                <p className="text-slate-600">You're on track for a comfortable retirement!</p>
                <div className="mt-4 py-2 px-4 bg-emerald-50 rounded-full inline-block text-emerald-700 font-bold">
                  Success Rate: {calculations.successRate}% ✨
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 max-w-sm text-center border-4 border-amber-500">
                <div className="text-7xl mb-4 animate-bounce">😟</div>
                <h2 className="text-2xl font-black text-amber-600 mb-2">Action Required!</h2>
                <p className="text-slate-600">You have a shortfall of</p>
                <div className="text-3xl font-black text-rose-600 my-2">
                  ₹{(Math.abs(calculations.gap) / 10000000).toFixed(2)} Cr
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Check recommendations below 👇</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-10">
        {/* Header - From */}
        <div className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">Financial Dashboard</span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 mb-4">Retirement <span className="text-blue-600">Planner</span></h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto italic">Advanced calculator with inflation scenarios & Monte Carlo simulation</p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Input Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Basic Details Section */}
            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200"><Target size={20} /></div>
                <h2 className="text-xl font-bold tracking-tight">Basic Details</h2>
              </div>
              
              <div className="space-y-5">
                {[
                  { label: "Current Age", key: "currentAge", type: "number" },
                  { label: "Retirement Age", key: "retirementAge", type: "number" },
                  { label: "Life Expectancy", key: "lifeExpectancy", type: "number" },
                  { label: "Current Savings (₹)", key: "currentSavings", type: "number" },
                  { label: "Monthly SIP (₹)", key: "monthlyContribution", type: "number" },
                  { label: "Monthly Expenses Today (₹)", key: "monthlyExpenseToday", type: "number" },
                  { label: "General Inflation (%)", key: "inflationRate", type: "number", step: "0.5" },
                  { label: "Expense Inflation (%)", key: "expenseInflation", type: "number", step: "0.5" },
                ].map((field) => (
                  <div key={field.key} className="group">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{field.label}</label>
                    <input
                      type={field.type}
                      step={field.step}
                      value={inputs[field.key]}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-4 focus:ring-blue-100 focus:bg-white transition-all outline-none"
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Advanced Settings Section - Restored from */}
            <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-sm border border-white p-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-900 rounded-xl text-white"><Percent size={20} /></div>
                <h2 className="text-xl font-bold tracking-tight">Advanced Settings</h2>
              </div>
              
              <div className="space-y-5">
                {[
                  { label: "Pre-Retirement Return (%)", key: "preRetirementReturn", type: "number", target: "advanced" },
                  { label: "Post-Retirement Return (%)", key: "postRetirementReturn", type: "number", target: "advanced" },
                  { label: "Monthly Medical Expenses (₹)", key: "medicalExpenses", type: "number", target: "advanced" },
                  { label: "Medical Inflation (%)", key: "medicalInflation", type: "number", target: "advanced" },
                  { label: "Emergency Fund (Years)", key: "emergencyYears", type: "number", target: "advanced" },
                ].map((field) => (
                  <div key={field.key}>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">{field.label}</label>
                    <input
                      type="number"
                      value={advanced[field.key]}
                      onChange={(e) => handleAdvancedChange(field.key, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-4 focus:ring-blue-100 transition-all outline-none"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block ml-1">Lifestyle Adjustment</label>
                  <select
                    value={advanced.lifestyleChange}
                    onChange={(e) => handleAdvancedChange('lifestyleChange', e.target.value)}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-slate-700 font-bold focus:ring-4 focus:ring-blue-100 outline-none appearance-none"
                  >
                    <option value="0.6">60% - Minimal lifestyle</option>
                    <option value="0.7">70% - Reduced expenses</option>
                    <option value="0.8">80% - Comfortable</option>
                    <option value="0.9">90% - Similar lifestyle</option>
                    <option value="1.0">100% - Same as today</option>
                    <option value="1.2">120% - Enhanced lifestyle</option>
                  </select>
                </div>
              </div>
            </section>

            <button
              onClick={calculateRetirement}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[2rem] shadow-2xl shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-3 group text-lg"
            >
              <Calculator size={24} />
              Calculate My Plan
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Results Main Area */}
          <div id="results-section" className="lg:col-span-8 space-y-6">
            {!showResults ? (
              <div className="h-full bg-white/50 backdrop-blur-sm rounded-[3rem] border-4 border-dashed border-white flex flex-col items-center justify-center text-center p-12">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
                  <TrendingUp size={40} className="text-blue-500 animate-pulse" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-3">Ready to Plan Your Future?</h2>
                <p className="text-slate-500 max-w-sm mb-8">Fill in your details and click "Calculate" to see your professional retirement projection.</p>
                <div className="flex flex-wrap justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full"><ShieldCheck size={14} className="text-emerald-500"/> Advanced Analytics</span>
                  <span className="flex items-center gap-2 px-4 py-2 bg-white rounded-full"><ShieldCheck size={14} className="text-blue-500"/> Monte Carlo</span>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
                {/* Status Dashboard Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 grid md:grid-cols-3 gap-8">
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">You'll Have</p>
                    <p className="text-4xl font-black text-slate-900">₹{(calculations.totalCorpus / 10000000).toFixed(2)}Cr</p>
                  </div>
                  <div className="text-center md:text-left border-y md:border-y-0 md:border-x border-slate-100 py-6 md:py-0 md:px-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">You'll Need</p>
                    <p className="text-4xl font-black text-slate-900">₹{(calculations.requiredCorpus / 10000000).toFixed(2)}Cr</p>
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Plan Health</p>
                    <p className={`text-4xl font-black ${getStatusColor()}`}>{getStatusMessage()}</p>
                    <p className="text-xs font-bold text-slate-400 mt-1">Confidence: {calculations.successRate}%</p>
                  </div>
                </div>

                {/* Wealth Chart Card */}
                <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                      <TrendingUp className="text-blue-500" /> Wealth Projection
                    </h2>
                    <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                      <span className="flex items-center gap-1.5 text-blue-600"><div className="w-2.5 h-2.5 bg-blue-500 rounded-full" /> Growth</span>
                      <span className="flex items-center gap-1.5 text-rose-500"><div className="w-2.5 h-2.5 bg-rose-400 rounded-full" /> Usage</span>
                    </div>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={calculations.chartData}>
                        <defs>
                          <linearGradient id="colorCorpus" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} dy={10} />
                        <YAxis tickFormatter={(v) => `₹${(v/10000000).toFixed(1)}Cr`} axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 700}} />
                        <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}} />
                        <Area type="monotone" dataKey="corpus" stroke="#3b82f6" strokeWidth={4} fill="url(#colorCorpus)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Key Insights Grid - From */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-blue-50 rounded-[2rem] p-8 border border-blue-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-2xl text-blue-600 shadow-sm"><DollarSign /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">Monthly Cost at Retirement</p>
                        <p className="text-3xl font-black text-blue-900">₹{(calculations.monthlyExpenseAtRetirement / 1000).toFixed(0)}K</p>
                        <p className="text-xs font-bold text-blue-600/60 mt-1">{(advanced.lifestyleChange * 100).toFixed(0)}% of current lifestyle</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-emerald-50 rounded-[2rem] p-8 border border-emerald-100">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-2xl text-emerald-600 shadow-sm"><Calendar /></div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1">Emergency Fund</p>
                        <p className="text-3xl font-black text-emerald-900">₹{(calculations.emergencyFund / 100000).toFixed(1)}L</p>
                        <p className="text-xs font-bold text-emerald-600/60 mt-1">{advanced.emergencyYears} years of expenses</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Restored Recommendations Section - From */}
                {calculations.gap > 0 && (
                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-amber-50 rounded-xl text-amber-600"><Info size={20} /></div>
                      <h2 className="text-xl font-bold">💡 Recommendations</h2>
                    </div>
                    <div className="grid gap-4">
                      <div className="flex items-center gap-5 p-5 bg-blue-50 rounded-3xl border border-blue-100">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-black flex-shrink-0">1</div>
                        <div>
                          <p className="font-black text-slate-800">Increase Monthly SIP</p>
                          <p className="text-sm text-slate-500">Raise to ₹{Math.round((inputs.monthlyContribution + (calculations.gap / (calculations.yearsToRetirement * 12))) / 1000)}K/month to bridge the gap</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 p-5 bg-emerald-50 rounded-3xl border border-emerald-100">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black flex-shrink-0">2</div>
                        <div>
                          <p className="font-black text-slate-800">Work More Years</p>
                          <p className="text-sm text-slate-500">Delay retirement to age {inputs.retirementAge + Math.ceil(calculations.gap / (inputs.monthlyContribution * 12))} to reach goal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-5 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                        <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black flex-shrink-0">3</div>
                        <div>
                          <p className="font-black text-slate-800">Adjust Lifestyle</p>
                          <p className="text-sm text-slate-500">Reduce expenses by {Math.round((1 - (calculations.totalCorpus / calculations.requiredCorpus) * advanced.lifestyleChange) * 100)}% to match corpus</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
