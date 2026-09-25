import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Users, Receipt, RefreshCw, Calculator, Sparkles, Check, ArrowRight, AlertTriangle, X } from 'lucide-react';

// CSSをコンポーネント内に完全埋め込み（Tailwind未設定でも100%おしゃれに表示されます）
const styleTag = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
  
  .app-bg {
    font-family: 'Plus Jakarta Sans', 'Hiragino Kaku Gothic ProN', sans-serif;
    background: linear-gradient(135deg, #0b0f19 0%, #111827 50%, #1e1b4b 100%);
    min-height: 100vh;
    color: #f3f4f6;
  }
  .glass-card {
    background: rgba(31, 41, 55, 0.65);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
    border-radius: 20px;
  }
  .glass-input {
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #ffffff;
    border-radius: 12px;
    transition: all 0.2s ease;
  }
  .glass-input:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
  }
  .btn-gradient {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.35);
    transition: all 0.2s ease;
    border: none;
  }
  .btn-gradient:active {
    transform: scale(0.97);
  }
  .payer-btn {
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #9ca3af;
    border-radius: 12px;
    transition: all 0.2s;
  }
  .payer-btn.selected {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-color: #a5b4fc;
    color: #ffffff;
    font-weight: 700;
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
  }
  .modal-overlay {
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
  }
`;

export default function App() {
  // --- 状態管理 (localStorageから初期化) ---
  const [step, setStep] = useState(() => localStorage.getItem('travel_step') || 'opening');
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('travel_members');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('travel_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // モーダルの表示管理
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  // ローカルストレージ保存
  useEffect(() => { localStorage.setItem('travel_step', step); }, [step]);
  useEffect(() => { localStorage.setItem('travel_members', JSON.stringify(members)); }, [members]);
  useEffect(() => { localStorage.setItem('travel_expenses', JSON.stringify(expenses)); }, [expenses]);

  // 入力フォーム状態
  const [memberInput, setMemberInput] = useState('');
  const [title, setTitle] = useState('');
  const [payer, setPayer] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState([]);
  const [individualDetails, setIndividualDetails] = useState({});

  const handleStartMembers = () => {
    if (members.length === 0) setMembers(['A君', 'B君', 'C君']);
    setStep('members');
  };

  const addMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const openAddModal = () => {
    setTitle('');
    setPayer(members[0] || '');
    setSplitType('equal');
    setTotalAmount('');
    setParticipants([...members]);
    
    const initDetails = {};
    members.forEach(m => { initDetails[m] = { amount: '', menu: '' }; });
    setIndividualDetails(initDetails);
    
    setShowAddModal(true);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title) return alert('支出の内容を入力してください');
    if (!payer) return alert('立て替えた人を選択してください');

    let finalTotal = 0;
    let shares = {};
    let menus = {};

    if (splitType === 'equal') {
      finalTotal = Number(totalAmount) || 0;
      if (finalTotal <= 0) return alert('金額を正確に入力してください');
      if (participants.length === 0) return alert('支払う人を1人以上選択してください');
      const perPerson = Math.round(finalTotal / participants.length);
      members.forEach(m => { shares[m] = participants.includes(m) ? perPerson : 0; });
    } else {
      let sum = 0;
      members.forEach(m => {
        const amt = Number(individualDetails[m]?.amount) || 0;
        shares[m] = amt;
        menus[m] = individualDetails[m]?.menu || '';
        sum += amt;
      });
      if (sum <= 0) return alert('少なくとも1人の金額を入力してください');
      finalTotal = sum;
    }

    const newExpense = {
      id: Date.now(),
      title,
      payer,
      totalAmount: finalTotal,
      splitType,
      shares,
      menus: splitType === 'individual' ? menus : {},
      date: new Date().toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    };

    setExpenses([newExpense, ...expenses]);
    setShowAddModal(false);
  };

  const deleteExpense = (id) => {
    if (confirm('この記録を削除しますか？')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleConfirmReset = () => {
    localStorage.clear();
    setMembers([]);
    setExpenses([]);
    setStep('opening');
    setShowResetModal(false);
  };

  // 精算計算ロジック
  const calculateSettlement = () => {
    const balances = {};
    members.forEach(m => balances[m] = 0);

    expenses.forEach(exp => {
      if (balances[exp.payer] !== undefined) balances[exp.payer] += exp.totalAmount;
      Object.entries(exp.shares).forEach(([member, amount]) => {
        if (balances[member] !== undefined) balances[member] -= amount;
      });
    });

    let debtors = [];
    let creditors = [];

    Object.entries(balances).forEach(([member, amount]) => {
      if (amount < -1) debtors.push({ member, amount: -amount });
      if (amount > 1) creditors.push({ member, amount });
    });

    const transactions = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const pay = Math.min(debtors[i].amount, creditors[j].amount);
      transactions.push({
        from: debtors[i].member,
        to: creditors[j].member,
        amount: Math.round(pay)
      });

      debtors[i].amount -= pay;
      creditors[j].amount -= pay;

      if (debtors[i].amount < 1) i++;
      if (creditors[j].amount < 1) j++;
    }

    return { transactions };
  };

  const { transactions } = calculateSettlement();

  return (
    <div className="app-bg pb-12 flex flex-col justify-between">
      <style>{styleTag}</style>

      <div>
        {/* ヘッダー */}
        <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-900/80 backdrop-blur-md px-4 py-3.5 shadow-lg">
          <div className="max-w-md mx-auto flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                割り勘かんたん計算
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 pt-6 space-y-6">
          {/* STEP 1: オープニング */}
          {step === 'opening' && (
            <div className="text-center py-10 space-y-8 glass-card p-8 mt-4">
              <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-indigo-500/30">
                <Calculator className="w-10 h-10 text-white" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">旅行・ご飯の割り勘を<br /><span className="bg-gradient-to-r from-indigo-400 to-pink-400 bg-clip-text text-transparent">スマートに一瞬で精算</span></h2>
                <p className="text-slate-400 text-xs leading-relaxed">
                  誰がいくら払ったか記録するだけ！<br />
                  個別メニューの入力や自動保存にも完全対応。
                </p>
              </div>
              <button
                onClick={handleStartMembers}
                className="w-full py-4 btn-gradient rounded-2xl text-base tracking-wider shadow-lg"
              >
                スタートする
              </button>
            </div>
          )}

          {/* STEP 2: メンバー設定 */}
          {step === 'members' && (
            <div className="space-y-6">
              <div className="glass-card p-6 space-y-5">
                <h2 className="text-base font-bold flex items-center gap-2 text-indigo-300">
                  <Users className="w-5 h-5 text-indigo-400" />
                  参加メンバーを登録
                </h2>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="例: たろう"
                    value={memberInput}
                    onChange={(e) => setMemberInput(e.target.value)}
                    className="flex-1 glass-input px-4 py-2.5 text-sm"
                  />
                  <button
                    onClick={addMember}
                    className="btn-gradient px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" /> 追加
                  </button>
                </div>

                <div className="space-y-2 pt-2">
                  {members.map((name, index) => (
                    <div key={index} className="flex justify-between items-center bg-slate-900/60 px-4 py-3 rounded-xl border border-white/5">
                      <span className="font-semibold text-sm text-slate-200">{name}</span>
                      <button onClick={() => removeMember(index)} className="text-slate-500 hover:text-rose-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (members.length < 2) return alert('2人以上のメンバーを登録してください');
                  setStep('main');
                }}
                className="w-full py-4 btn-gradient rounded-2xl text-sm tracking-wide shadow-lg"
              >
                次へ（支出の入力へ）
              </button>
            </div>
          )}

          {/* STEP 3: メイン画面 */}
          {step === 'main' && (
            <div className="space-y-6">
              {/* 支出追加ボタン */}
              <button
                onClick={openAddModal}
                className="w-full py-4 btn-gradient rounded-2xl shadow-xl flex items-center justify-center gap-2 text-base"
              >
                <Plus className="w-5 h-5 stroke-[3]" /> 支出を記録する
              </button>

              {/* 精算結果カード */}
              <div className="glass-card p-5 space-y-4">
                <h2 className="text-sm font-bold flex items-center gap-2 text-indigo-300 border-b border-white/10 pb-3">
                  <Receipt className="w-4 h-4 text-indigo-400" />
                  精算結果（最終振込先）
                </h2>

                {transactions.length === 0 ? (
                  <p className="text-slate-400 text-xs text-center py-4">貸し借りはまだありません</p>
                ) : (
                  <div className="space-y-2.5">
                    {transactions.map((t, idx) => (
                      <div key={idx} className="bg-slate-900/80 p-3.5 rounded-xl border border-white/10 flex items-center justify-between shadow-inner">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-md border border-rose-500/20">{t.from}</span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20">{t.to}</span>
                        </div>
                        <span className="text-sm font-extrabold text-amber-300 font-mono">¥{t.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 支出履歴 */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-400 px-1">支出の履歴 ({expenses.length}件)</h3>
                
                {expenses.length === 0 ? (
                  <div className="text-center py-10 text-slate-500 text-xs glass-card border-dashed border-white/10">
                    ＋ボタンから立て替えたお金を記録しましょう
                  </div>
                ) : (
                  expenses.map((exp) => (
                    <div key={exp.id} className="glass-card overflow-hidden transition-all">
                      <div className="p-4 flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-white">{exp.title}</h4>
                            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                              立替: {exp.payer}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{exp.date}</p>
                        </div>

                        <div className="text-right flex flex-col items-end">
                          <span className="text-base font-extrabold text-white font-mono">¥{exp.totalAmount.toLocaleString()}</span>
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="text-slate-500 hover:text-rose-400 p-1 mt-1 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* アコーディオン */}
                      <button
                        onClick={() => setExpandedExpenseId(expandedExpenseId === exp.id ? null : exp.id)}
                        className="w-full py-2 bg-slate-900/50 hover:bg-slate-900/80 border-t border-white/5 text-[11px] text-slate-400 flex items-center justify-center gap-1 transition-colors"
                      >
                        <span>内訳詳細（誰がいくら）</span>
                        {expandedExpenseId === exp.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {expandedExpenseId === exp.id && (
                        <div className="p-4 bg-slate-950/80 border-t border-white/5 space-y-2">
                          <table className="w-full text-xs text-left">
                            <thead>
                              <tr className="border-b border-white/10 text-slate-400">
                                <th className="py-1.5 font-normal">メンバー</th>
                                {exp.splitType === 'individual' && <th className="py-1.5 font-normal">注文メニュー</th>}
                                <th className="py-1.5 font-normal text-right">負担額</th>
                              </tr>
                            </thead>
                            <tbody>
                              {Object.entries(exp.shares).map(([memberName, amt]) => (
                                <tr key={memberName} className="border-b border-white/5">
                                  <td className="py-2 font-medium text-slate-300">{memberName}</td>
                                  {exp.splitType === 'individual' && (
                                    <td className="py-2 text-slate-400">{exp.menus?.[memberName] || '-'}</td>
                                  )}
                                  <td className="py-2 text-right font-mono text-slate-200">
                                    {amt > 0 ? `¥${amt.toLocaleString()}` : <span className="text-slate-600">¥0</span>}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* モーダル: 支出追加 */}
          {showAddModal && (
            <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
              <div className="glass-card w-full max-w-md p-6 space-y-5 max-h-[90vh] overflow-y-auto border-white/20">
                <div className="flex justify-between items-center border-b border-white/10 pb-3">
                  <h3 className="text-base font-bold text-white">支出の記録を追加</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">支出の内容</label>
                    <input
                      type="text"
                      placeholder="例: 夕食代、ホテル代、タクシー"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full glass-input p-3 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">誰が立て替えましたか？</label>
                    <div className="grid grid-cols-3 gap-2">
                      {members.map((m) => {
                        const isSelected = payer === m;
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setPayer(m)}
                            className={`py-2.5 px-3 payer-btn text-xs font-semibold flex items-center justify-center gap-1 ${isSelected ? 'selected' : ''}`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            {m}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">割り勘の方法</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setSplitType('equal')}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                          splitType === 'equal'
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                            : 'bg-slate-900/50 border-white/5 text-slate-400'
                        }`}
                      >
                        均等割り勘
                      </button>
                      <button
                        type="button"
                        onClick={() => setSplitType('individual')}
                        className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${
                          splitType === 'individual'
                            ? 'bg-indigo-600/30 border-indigo-400 text-indigo-200'
                            : 'bg-slate-900/50 border-white/5 text-slate-400'
                        }`}
                      >
                        個別メニュー・金額指定
                      </button>
                    </div>
                  </div>

                  {splitType === 'equal' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">合計金額 (円)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          className="w-full glass-input p-3 text-lg font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1.5">支払う対象メンバー</label>
                        <div className="flex flex-wrap gap-2">
                          {members.map((m) => {
                            const isChecked = participants.includes(m);
                            return (
                              <button
                                key={m}
                                type="button"
                                onClick={() => {
                                  if (isChecked) setParticipants(participants.filter(p => p !== m));
                                  else setParticipants([...participants, m]);
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${
                                  isChecked
                                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 font-bold'
                                    : 'bg-slate-900/40 border-white/5 text-slate-500'
                                }`}
                              >
                                {isChecked ? '✓ ' : ''}{m}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {splitType === 'individual' && (
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                      <label className="block text-xs text-slate-400">各メンバーの注文メニューと金額</label>
                      {members.map((m) => (
                        <div key={m} className="bg-slate-900/80 p-3 rounded-xl border border-white/5 space-y-2">
                          <span className="text-xs font-bold text-indigo-300">{m}</span>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="注文メニュー"
                              value={individualDetails[m]?.menu || ''}
                              onChange={(e) => setIndividualDetails({ ...individualDetails, [m]: { ...individualDetails[m], menu: e.target.value } })}
                              className="glass-input p-2 text-xs"
                            />
                            <input
                              type="number"
                              placeholder="金額 (円)"
                              value={individualDetails[m]?.amount || ''}
                              onChange={(e) => setIndividualDetails({ ...individualDetails, [m]: { ...individualDetails[m], amount: e.target.value } })}
                              className="glass-input p-2 text-xs font-mono"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 font-bold rounded-xl text-xs text-slate-300"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleAddExpense}
                    className="flex-1 py-3 btn-gradient rounded-xl text-xs"
                  >
                    追加する
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* モーダル: リセット確認 */}
          {showResetModal && (
            <div className="fixed inset-0 modal-overlay z-50 flex items-center justify-center p-4">
              <div className="glass-card w-full max-w-sm p-6 text-center space-y-4 border-rose-500/30">
                <div className="w-12 h-12 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mx-auto border border-rose-500/30">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">データをすべてリセットしますか？</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    登録したメンバーや支出の記録が消去されます。<br />この操作は元に戻せません。
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs"
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReset}
                    className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs"
                  >
                    リセットする
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* フッター（リセットボタン） */}
      {step !== 'opening' && (
        <footer className="text-center pt-16 pb-6">
          <button
            onClick={() => setShowResetModal(true)}
            className="text-xs text-slate-500 hover:text-rose-400 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-slate-800"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            データをすべてリセットして最初からやり直す
          </button>
        </footer>
      )}
    </div>
  );
}