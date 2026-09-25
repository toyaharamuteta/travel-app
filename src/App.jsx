import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Users, Receipt, RefreshCw, Calculator, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function App() {
  // --- 状態管理 (localStorageから初期化) ---
  const [step, setStep] = useState(() => {
    return localStorage.getItem('travel_step') || 'opening';
  });
  
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('travel_members');
    return saved ? JSON.parse(saved) : [];
  });

  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('travel_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // --- ローカルストレージへの自動保存 ---
  useEffect(() => {
    localStorage.setItem('travel_step', step);
  }, [step]);

  useEffect(() => {
    localStorage.setItem('travel_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('travel_expenses', JSON.stringify(expenses));
  }, [expenses]);

  // --- 入力フォームの状態 ---
  const [memberInput, setMemberInput] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);

  // 新規支出フォーム
  const [title, setTitle] = useState('');
  const [payer, setPayer] = useState('');
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'individual'
  const [totalAmount, setTotalAmount] = useState('');
  const [participants, setParticipants] = useState([]);
  
  // 個別入力用 { [memberName]: { amount: string, menu: string } }
  const [individualDetails, setIndividualDetails] = useState({});

  // メンバー設定時の初期化
  const handleStartMembers = () => {
    if (members.length === 0) {
      setMembers(['A君', 'B君', 'C君']);
    }
    setStep('members');
  };

  const addMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      const newMembers = [...members, memberInput.trim()];
      setMembers(newMembers);
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
    members.forEach(m => {
      initDetails[m] = { amount: '', menu: '' };
    });
    setIndividualDetails(initDetails);
    
    setShowAddModal(true);
  };

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!title) {
      alert('内容を入力してください');
      return;
    }
    if (!payer) {
      alert('立て替えた人を選択してください');
      return;
    }

    let finalTotal = 0;
    let shares = {};
    let menus = {};

    if (splitType === 'equal') {
      finalTotal = Number(totalAmount) || 0;
      if (finalTotal <= 0) {
        alert('金額を入力してください');
        return;
      }
      if (participants.length === 0) {
        alert('支払う人を1人以上選択してください');
        return;
      }
      const perPerson = Math.round(finalTotal / participants.length);
      members.forEach(m => {
        shares[m] = participants.includes(m) ? perPerson : 0;
      });
    } else {
      // 個別指定
      let sum = 0;
      members.forEach(m => {
        const amt = Number(individualDetails[m]?.amount) || 0;
        shares[m] = amt;
        menus[m] = individualDetails[m]?.menu || '';
        sum += amt;
      });
      if (sum <= 0) {
        alert('少なくとも1人の金額を入力してください');
        return;
      }
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

  const resetAllData = () => {
    if (confirm('全てのデータをリセットして新しい旅行を始めますか？')) {
      localStorage.clear();
      setMembers([]);
      setExpenses([]);
      setStep('opening');
    }
  };

  // --- 精算計算ロジック ---
  const calculateSettlement = () => {
    const balances = {};
    members.forEach(m => balances[m] = 0);

    expenses.forEach(exp => {
      // 立て替えた人はプラス
      if (balances[exp.payer] !== undefined) {
        balances[exp.payer] += exp.totalAmount;
      }
      // 払うべき人はマイナス
      Object.entries(exp.shares).forEach(([member, amount]) => {
        if (balances[member] !== undefined) {
          balances[member] -= amount;
        }
      });
    });

    // 借りがある人と貸しがある人に分類
    let debtors = []; // 払う人（マイナス）
    let creditors = []; // もらう人（プラス）

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

    return { balances, transactions };
  };

  const { balances, transactions } = calculateSettlement();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-12">
      {/* ヘッダー */}
      <header className="bg-slate-800 border-b border-slate-700 p-4 sticky top-0 z-10 shadow-lg">
        <div className="max-w-md mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">
              割り勘かんたん計算
            </h1>
          </div>
          {step !== 'opening' && (
            <button
              onClick={resetAllData}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 bg-slate-700/50 px-2 py-1 rounded border border-slate-600"
            >
              <RefreshCw className="w-3 h-3" /> リセット
            </button>
          )}
        </div>
      </header>

      <main className="max-w-md mx-auto p-4">
        {/* STEP 1: オープニング画面 */}
        {step === 'opening' && (
          <div className="text-center py-12 space-y-6">
            <div className="w-24 h-24 bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-orange-500/20">
              <Calculator className="w-12 h-12 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">旅行・ご飯の割り勘をスマートに</h2>
              <p className="text-slate-400 text-sm">
                誰がいくら払ったか記録するだけ！<br />
                個別のメニュー指定や自動保存にも対応。
              </p>
            </div>
            <button
              onClick={handleStartMembers}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 font-bold rounded-2xl shadow-lg shadow-orange-500/20 text-lg transition-all transform active:scale-95"
            >
              始める
            </button>
          </div>
        )}

        {/* STEP 2: メンバー設定画面 */}
        {step === 'members' && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-sm space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                参加メンバーを設定
              </h2>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="例: たろう"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={addMember}
                  className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold px-4 py-2 rounded-xl text-sm flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" /> 追加
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {members.map((name, index) => (
                  <div key={index} className="flex justify-between items-center bg-slate-900/60 p-3 rounded-xl border border-slate-700/50">
                    <span className="font-medium">{name}</span>
                    <button onClick={() => removeMember(index)} className="text-slate-500 hover:text-rose-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => {
                if (members.length < 2) {
                  alert('2人以上のメンバーを登録してください');
                  return;
                }
                setStep('main');
              }}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 font-bold rounded-2xl shadow-lg text-slate-900 transition-all"
            >
              次へ（支出の入力へ）
            </button>
          </div>
        )}

        {/* STEP 3: メイン画面 (支出一覧 & 精算) */}
        {step === 'main' && (
          <div className="space-y-6">
            {/* 支出追加ボタン */}
            <button
              onClick={openAddModal}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-900 font-bold rounded-xl shadow-lg flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> 支出を記録する
            </button>

            {/* 精算結果カード */}
            <div className="bg-slate-800 p-5 rounded-2xl border border-slate-700 shadow-md space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 border-b border-slate-700 pb-3">
                <Receipt className="w-5 h-5 text-amber-400" />
                精算結果（最終振込先）
              </h2>

              {transactions.length === 0 ? (
                <p className="text-slate-400 text-sm text-center py-4">貸し借りはまだありません</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t, idx) => (
                    <div key={idx} className="bg-slate-900 p-3.5 rounded-xl border border-slate-700 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-rose-400">{t.from}</span>
                        <ArrowRight className="w-4 h-4 text-slate-500" />
                        <span className="font-bold text-emerald-400">{t.to}</span>
                      </div>
                      <span className="text-base font-bold text-amber-400">¥{t.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 支出一覧 */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-400 px-1">支出の履歴 ({expenses.length}件)</h3>
              
              {expenses.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm bg-slate-800/40 rounded-2xl border border-dashed border-slate-700">
                  ＋ボタンから立て替えたお金を記録しましょう
                </div>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-sm">
                    <div className="p-4 flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base">{exp.title}</h4>
                          <span className="text-xs bg-slate-700 text-amber-300 px-2 py-0.5 rounded-md border border-slate-600">
                            立て替え: {exp.payer}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{exp.date}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-lg font-bold text-slate-100">¥{exp.totalAmount.toLocaleString()}</span>
                        <div className="mt-1 flex items-center justify-end gap-2">
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* アコーディオン展開ボタン */}
                    <button
                      onClick={() => setExpandedExpenseId(expandedExpenseId === exp.id ? null : exp.id)}
                      className="w-full py-2 bg-slate-900/60 hover:bg-slate-900 border-t border-slate-700/60 text-xs text-slate-400 flex items-center justify-center gap-1 transition-colors"
                    >
                      <span>詳細を見る（内訳・誰がいくら）</span>
                      {expandedExpenseId === exp.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>

                    {/* 詳細テーブル (表形式) */}
                    {expandedExpenseId === exp.id && (
                      <div className="p-4 bg-slate-900/90 border-t border-slate-700 space-y-2">
                        <table className="w-full text-xs text-left">
                          <thead>
                            <tr className="border-b border-slate-700 text-slate-400">
                              <th className="py-1.5 font-normal">メンバー</th>
                              {exp.splitType === 'individual' && <th className="py-1.5 font-normal">注文メニュー</th>}
                              <th className="py-1.5 font-normal text-right">負担額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(exp.shares).map(([memberName, amt]) => (
                              <tr key={memberName} className="border-b border-slate-800/50">
                                <td className="py-2 font-medium text-slate-200">{memberName}</td>
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

        {/* --- 支出追加モーダル --- */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-md rounded-2xl p-5 space-y-5 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold">支出の記録を追加</h3>

              <div className="space-y-4">
                {/* 支出内容 */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">何にお金を使いましたか？</label>
                  <input
                    type="text"
                    placeholder="例: 夕食代、ホテル代、タクシー"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* 立て替えた人（色がはっきり変わるボタン） */}
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
                          className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all flex items-center justify-center gap-1 ${
                            isSelected
                              ? 'bg-amber-500 border-amber-400 text-slate-900 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 stroke-[3]" />}
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 割り勘方法 */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">割り勘の方法</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setSplitType('equal')}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        splitType === 'equal'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      みんなで均等割り
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitType('individual')}
                      className={`py-2 text-xs font-bold rounded-xl border ${
                        splitType === 'individual'
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400'
                      }`}
                    >
                      個別に金額・メニュー指定
                    </button>
                  </div>
                </div>

                {/* 均等割りの場合の入力 */}
                {splitType === 'equal' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">合計金額 (円)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-lg font-mono focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">支払う人（チェック）</label>
                      <div className="flex flex-wrap gap-2">
                        {members.map((m) => {
                          const isChecked = participants.includes(m);
                          return (
                            <button
                              key={m}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  setParticipants(participants.filter(p => p !== m));
                                } else {
                                  setParticipants([...participants, m]);
                                }
                              }}
                              className={`px-3 py-1.5 rounded-lg text-xs border ${
                                isChecked
                                  ? 'bg-slate-700 border-amber-500 text-amber-300'
                                  : 'bg-slate-900 border-slate-800 text-slate-500'
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

                {/* 個別指定の場合の入力（メニュー＆金額） */}
                {splitType === 'individual' && (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    <label className="block text-xs text-slate-400">各メンバーの注文メニューと金額</label>
                    {members.map((m) => (
                      <div key={m} className="bg-slate-900 p-2.5 rounded-xl border border-slate-700/60 space-y-2">
                        <span className="text-xs font-bold text-amber-400">{m}</span>
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            placeholder="頼んだメニュー (例: パスタ)"
                            value={individualDetails[m]?.menu || ''}
                            onChange={(e) => {
                              setIndividualDetails({
                                ...individualDetails,
                                [m]: { ...individualDetails[m], menu: e.target.value }
                              });
                            }}
                            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs focus:outline-none"
                          />
                          <input
                            type="number"
                            placeholder="金額 (円)"
                            value={individualDetails[m]?.amount || ''}
                            onChange={(e) => {
                              setIndividualDetails({
                                ...individualDetails,
                                [m]: { ...individualDetails[m], amount: e.target.value }
                              });
                            }}
                            className="bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ボタン類 */}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 font-bold rounded-xl text-sm"
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleAddExpense}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded-xl text-sm"
                >
                  追加する
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}