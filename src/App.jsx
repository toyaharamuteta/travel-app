import React, { useState, useMemo } from 'react';
import { 
  PlaneTakeoff, 
  Users, 
  Receipt, 
  Calculator, 
  Plus, 
  Trash2, 
  ChevronRight, 
  ArrowLeft,
  CheckCircle2,
  Wallet,
  Coins,
  Map
} from 'lucide-react';

export default function App() {
  const [step, setStep] = useState('opening'); // 'opening', 'participants', 'expenses', 'settlement'
  const [participants, setParticipants] = useState([]);
  const [expenses, setExpenses] = useState([]);

  // Navigate between screens
  const goTo = (newStep) => setStep(newStep);

  return (
    <div className="min-h-screen bg-sky-50 text-slate-800 font-sans selection:bg-sky-200">
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-xl overflow-hidden flex flex-col relative">
        {step === 'opening' && <OpeningScreen onStart={() => goTo('participants')} />}
        {step === 'participants' && (
          <ParticipantsScreen 
            participants={participants} 
            setParticipants={setParticipants} 
            onNext={() => goTo('expenses')} 
            onBack={() => goTo('opening')} 
          />
        )}
        {step === 'expenses' && (
          <ExpensesScreen 
            participants={participants} 
            expenses={expenses} 
            setExpenses={setExpenses} 
            onCalculate={() => goTo('settlement')} 
            onBack={() => goTo('participants')} 
          />
        )}
        {step === 'settlement' && (
          <SettlementScreen 
            participants={participants} 
            expenses={expenses} 
            onBack={() => goTo('expenses')} 
          />
        )}
      </div>
    </div>
  );
}

function OpeningScreen({ onStart }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-sky-400 to-sky-600 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 opacity-20"><Map size={120} /></div>
      <div className="absolute -bottom-10 -right-10 opacity-20"><PlaneTakeoff size={180} /></div>
      
      <div className="z-10 text-center animate-fade-in-up">
        <div className="bg-white/20 p-6 rounded-full inline-block mb-6 shadow-lg backdrop-blur-sm">
          <PlaneTakeoff size={64} className="text-white" />
        </div>
        <h1 className="text-4xl font-extrabold mb-2 tracking-wider drop-shadow-md">旅わり</h1>
        <p className="text-sky-100 mb-12 text-lg font-medium drop-shadow-sm">
          旅行の立て替え、<br/>サクッと計算・スマートに精算
        </p>
        
        <button 
          onClick={onStart}
          className="bg-white text-sky-600 font-bold text-xl py-4 px-12 rounded-full shadow-xl hover:bg-sky-50 hover:scale-105 transition-all duration-300 flex items-center justify-center mx-auto"
        >
          始める
          <ChevronRight size={24} className="ml-2" />
        </button>
      </div>
    </div>
  );
}

function ParticipantsScreen({ participants, setParticipants, onNext, onBack }) {
  const [newName, setNewName] = useState('');

  const addParticipant = (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newParticipant = {
      id: Date.now().toString(),
      name: newName.trim()
    };
    setParticipants([...participants, newParticipant]);
    setNewName('');
  };

  const removeParticipant = (id) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <Header title="メンバー設定" icon={<Users size={20} />} onBack={onBack} />
      
      <div className="flex-1 overflow-y-auto p-6">
        <p className="text-slate-600 mb-6 text-sm">
          一緒に旅行に行くメンバーのニックネームを追加してください。（2名以上）
        </p>

        <form onSubmit={addParticipant} className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="ニックネーム (例: 太郎)" 
            className="flex-1 border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
          />
          <button 
            type="submit" 
            disabled={!newName.trim()}
            className="bg-sky-500 text-white p-3 rounded-xl hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 transition-colors shadow-sm"
          >
            <Plus size={24} />
          </button>
        </form>

        <div className="space-y-3">
          {participants.length === 0 ? (
            <div className="text-center text-slate-400 py-8 border-2 border-dashed border-slate-200 rounded-xl">
              メンバーがまだいません
            </div>
          ) : (
            participants.map((p, index) => (
              <div key={p.id} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="font-semibold text-slate-700">{p.name}</span>
                </div>
                <button 
                  onClick={() => removeParticipant(p.id)}
                  className="text-slate-400 hover:text-red-500 transition-colors p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <button 
          onClick={onNext}
          disabled={participants.length < 2}
          className="w-full bg-sky-500 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 transition-all flex items-center justify-center"
        >
          支出の入力へ進む
          <ChevronRight size={24} className="ml-2" />
        </button>
      </div>
    </div>
  );
}

function ExpensesScreen({ participants, expenses, setExpenses, onCalculate, onBack }) {
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [payerId, setPayerId] = useState(participants[0]?.id || '');
  const [splitType, setSplitType] = useState('equal'); // 'equal' or 'custom'
  
  // State for 'equal'
  const [totalAmount, setTotalAmount] = useState('');
  const [involvedIds, setInvolvedIds] = useState(participants.map(p => p.id));
  
  // State for 'custom'
  const [customAmounts, setCustomAmounts] = useState({});

  const handleOpenForm = () => {
    setTitle('');
    setPayerId(participants[0]?.id || '');
    setSplitType('equal');
    setTotalAmount('');
    setInvolvedIds(participants.map(p => p.id));
    
    // Initialize custom amounts
    const initialCustom = {};
    participants.forEach(p => initialCustom[p.id] = '');
    setCustomAmounts(initialCustom);
    
    setShowForm(true);
  };

  const handleCustomAmountChange = (id, val) => {
    setCustomAmounts(prev => ({ ...prev, [id]: val }));
  };

  const handleInvolvedToggle = (id) => {
    setInvolvedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const saveExpense = () => {
    let finalTotal = 0;
    let finalSplits = {}; // { participantId: amountOwed }

    if (splitType === 'equal') {
      const amount = parseFloat(totalAmount);
      if (isNaN(amount) || amount <= 0 || involvedIds.length === 0) return alert('金額を正しく入力し、支払う人を1人以上選択してください。');
      
      finalTotal = amount;
      const splitAmount = amount / involvedIds.length;
      involvedIds.forEach(id => {
        finalSplits[id] = splitAmount;
      });
    } else {
      let sum = 0;
      Object.entries(customAmounts).forEach(([id, val]) => {
        const amt = parseFloat(val) || 0;
        if (amt > 0) {
          finalSplits[id] = amt;
          sum += amt;
        }
      });
      if (sum <= 0) return alert('金額を正しく入力してください。');
      finalTotal = sum;
    }

    if (!title.trim()) return alert('タイトルを入力してください。');

    const newExpense = {
      id: Date.now().toString(),
      title,
      payerId,
      totalAmount: finalTotal,
      splits: finalSplits,
      splitType,
      date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute:'2-digit' })
    };

    setExpenses([newExpense, ...expenses]);
    setShowForm(false);
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50 relative">
      <Header title="支出の記録" icon={<Receipt size={20} />} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-4 pb-32">
        {expenses.length === 0 ? (
          <div className="text-center text-slate-400 mt-20 flex flex-col items-center">
            <Wallet size={48} className="mb-4 opacity-30" />
            <p>まだ支出が記録されていません。<br/>下の「＋」ボタンから追加してください。</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.map((exp) => (
              <div key={exp.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">{exp.title}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      {exp.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold text-sky-600">¥{Math.round(exp.totalAmount).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-end mt-3">
                  <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-sm text-slate-600 inline-block">
                    <span className="text-slate-400 text-xs block mb-0.5">立て替え</span>
                    <span className="font-semibold">{participants.find(p => p.id === exp.payerId)?.name || '不明'}</span>
                  </div>
                  
                  <button onClick={() => deleteExpense(exp.id)} className="text-slate-400 hover:text-red-500 p-2">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={handleOpenForm}
        className="absolute bottom-24 right-6 bg-sky-500 text-white w-14 h-14 rounded-full shadow-lg shadow-sky-200 flex items-center justify-center hover:bg-sky-600 hover:scale-105 transition-all z-10"
      >
        <Plus size={28} />
      </button>

      {/* Bottom Calculate Button */}
      <div className="absolute bottom-0 left-0 w-full p-4 bg-white border-t border-slate-100 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
          onClick={onCalculate}
          disabled={expenses.length === 0}
          className="w-full bg-emerald-500 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-emerald-600 disabled:opacity-50 transition-all flex items-center justify-center"
        >
          <Calculator size={24} className="mr-2" />
          精算する (誰が誰に払うか計算)
        </button>
      </div>

      {/* Add Expense Modal Form */}
      {showForm && (
        <div className="absolute inset-0 bg-slate-900/60 z-50 flex flex-col justify-end">
          <div className="bg-white rounded-t-3xl h-[85vh] flex flex-col animate-slide-up">
            <div className="flex justify-between items-center p-5 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">支出の追加</h3>
              <button onClick={() => setShowForm(false)} className="text-slate-500 p-2 hover:bg-slate-100 rounded-full">
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">何にお金を使いましたか？</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例: 夕食代、ホテル代" 
                  className="w-full border border-slate-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              {/* Payer */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">誰が立て替えましたか？</label>
                <div className="flex flex-wrap gap-2">
                  {participants.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPayerId(p.id)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        payerId === p.id 
                          ? 'bg-sky-500 text-white shadow-md' 
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Split Method Toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">割り勘の方法</label>
                <div className="flex bg-slate-100 rounded-xl p-1">
                  <button 
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${splitType === 'equal' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}
                    onClick={() => setSplitType('equal')}
                  >
                    みんなで均等
                  </button>
                  <button 
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${splitType === 'custom' ? 'bg-white shadow-sm text-sky-600' : 'text-slate-500'}`}
                    onClick={() => setSplitType('custom')}
                  >
                    個別に金額指定
                  </button>
                </div>
              </div>

              {/* Amounts section based on split type */}
              {splitType === 'equal' ? (
                <div className="space-y-4 bg-sky-50 p-4 rounded-xl border border-sky-100">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">合計金額</label>
                    <div className="relative">
                      <span className="absolute left-4 top-3 text-slate-500 font-bold">¥</span>
                      <input 
                        type="number" 
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="0" 
                        className="w-full border-none rounded-xl pl-10 pr-4 py-3 text-lg font-bold focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">支払う人（チェックを外すと除外）</label>
                    <div className="grid grid-cols-2 gap-2">
                      {participants.map(p => (
                        <label key={p.id} className="flex items-center gap-2 bg-white p-3 rounded-lg border border-slate-200 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={involvedIds.includes(p.id)}
                            onChange={() => handleInvolvedToggle(p.id)}
                            className="w-5 h-5 text-sky-500 rounded border-slate-300 focus:ring-sky-500"
                          />
                          <span className="text-sm font-medium">{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 bg-sky-50 p-4 rounded-xl border border-sky-100">
                  <p className="text-xs text-slate-600 mb-2">
                    各自が頼んだメニューの金額などを個別に入力します。入力した金額の合計が自動的に支払総額になります。
                  </p>
                  {participants.map(p => (
                    <div key={p.id} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-200">
                      <span className="font-medium text-slate-700 w-24 truncate pl-2">{p.name}</span>
                      <div className="relative flex-1">
                        <span className="absolute left-3 top-2.5 text-slate-400">¥</span>
                        <input 
                          type="number" 
                          value={customAmounts[p.id]}
                          onChange={(e) => handleCustomAmountChange(p.id, e.target.value)}
                          placeholder="0" 
                          className="w-full border-none rounded-lg pl-8 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  ))}
                  <div className="text-right pt-2 font-bold text-slate-700">
                    合計: <span className="text-sky-600 text-lg">¥{
                      Object.values(customAmounts).reduce((acc, val) => acc + (parseFloat(val) || 0), 0).toLocaleString()
                    }</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-5 bg-white border-t border-slate-100">
              <button 
                onClick={saveExpense}
                className="w-full bg-sky-500 text-white font-bold text-lg py-4 rounded-xl shadow-md hover:bg-sky-600 transition-all"
              >
                追加する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SettlementScreen({ participants, expenses, onBack }) {
  
  // Calculate who owes whom
  const transactions = useMemo(() => {
    if (expenses.length === 0) return [];

    // 1. Calculate net balances
    const balances = {};
    participants.forEach(p => balances[p.id] = 0);

    expenses.forEach(exp => {
      // Payer paid the total, so they are owed this amount (+ balance)
      if (balances[exp.payerId] !== undefined) {
         balances[exp.payerId] += exp.totalAmount;
      }

      // Subtract what each person owes (- balance)
      Object.entries(exp.splits).forEach(([participantId, amountOwed]) => {
        if (balances[participantId] !== undefined) {
          balances[participantId] -= amountOwed;
        }
      });
    });

    // 2. Separate into debtors (-) and creditors (+)
    const debtors = [];
    const creditors = [];
    
    Object.entries(balances).forEach(([id, balance]) => {
      // Handle floating point inaccuracies
      if (balance < -0.5) debtors.push({ id, amount: -balance });
      else if (balance > 0.5) creditors.push({ id, amount: balance });
    });

    // Sort to optimize (pay largest debts to largest credits first)
    debtors.sort((a, b) => b.amount - a.amount);
    creditors.sort((a, b) => b.amount - a.amount);

    // 3. Resolve balances
    const results = [];
    let dIndex = 0;
    let cIndex = 0;

    while (dIndex < debtors.length && cIndex < creditors.length) {
      const debtor = debtors[dIndex];
      const creditor = creditors[cIndex];

      const amountToTransfer = Math.min(debtor.amount, creditor.amount);

      if (amountToTransfer > 0.5) {
        results.push({
          from: participants.find(p => p.id === debtor.id)?.name || 'Unknown',
          to: participants.find(p => p.id === creditor.id)?.name || 'Unknown',
          amount: Math.round(amountToTransfer) // Round to nearest yen
        });
      }

      debtor.amount -= amountToTransfer;
      creditor.amount -= amountToTransfer;

      if (debtor.amount < 0.5) dIndex++;
      if (creditor.amount < 0.5) cIndex++;
    }

    return results;
  }, [participants, expenses]);

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-50">
      <Header title="精算結果" icon={<Coins size={20} />} onBack={onBack} />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl p-6 text-white shadow-lg mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20"><CheckCircle2 size={80} /></div>
          <h2 className="text-xl font-bold mb-2 relative z-10">計算完了！</h2>
          <p className="text-emerald-50 text-sm relative z-10">
            立て替えの相殺を計算し、最小限のお金のやり取りで精算できるようにしました。
          </p>
        </div>

        <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
          <span className="bg-slate-200 text-slate-600 w-6 h-6 rounded-full flex items-center justify-center text-xs">!</span>
          誰が誰にいくら払う？
        </h3>

        {transactions.length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center shadow-sm border border-slate-100">
            <p className="text-slate-600 font-medium">貸し借りは発生していません。<br/>精算の必要はありません 🎉</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between animate-fade-in-up" style={{animationDelay: `${idx * 100}ms`}}>
                <div className="flex flex-col items-center w-1/3">
                  <div className="bg-red-50 text-red-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1 border border-red-100">
                    払う
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{tx.from}</span>
                </div>
                
                <div className="flex flex-col items-center flex-1 px-2">
                  <span className="text-lg font-extrabold text-slate-800 mb-1">
                    ¥{tx.amount.toLocaleString()}
                  </span>
                  <div className="w-full flex items-center">
                    <div className="h-0.5 w-full bg-slate-300"></div>
                    <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-slate-300 border-b-[5px] border-b-transparent"></div>
                  </div>
                </div>

                <div className="flex flex-col items-center w-1/3">
                  <div className="bg-blue-50 text-blue-600 w-10 h-10 rounded-full flex items-center justify-center font-bold mb-1 border border-blue-100">
                    受取
                  </div>
                  <span className="font-semibold text-slate-800 text-sm">{tx.to}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="p-6 bg-white border-t border-slate-100">
        <button 
          onClick={onBack}
          className="w-full bg-slate-100 text-slate-700 font-bold text-lg py-4 rounded-xl hover:bg-slate-200 transition-all"
        >
          記録画面に戻る
        </button>
      </div>
    </div>
  );
}

function Header({ title, icon, onBack }) {
  return (
    <div className="bg-white px-4 py-4 flex items-center border-b border-slate-100 shadow-sm sticky top-0 z-20">
      <button 
        onClick={onBack}
        className="p-2 -ml-2 text-slate-400 hover:text-sky-500 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      <div className="flex-1 flex justify-center items-center gap-2">
        <span className="text-sky-500">{icon}</span>
        <h2 className="font-bold text-slate-800 text-lg">{title}</h2>
      </div>
      <div className="w-10"></div> {/* Spacer for centering */}
    </div>
  );
}

