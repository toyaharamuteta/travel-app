import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, Users, Receipt, RefreshCw, Calculator, Sparkles, Check, ArrowRight, AlertTriangle, Edit3, X, UserPlus, UserCheck } from 'lucide-react';

// 完全独立型埋め込みCSS
const embeddedStyles = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    background-color: #0b0f19;
    color: #f3f4f6;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  }
  .app-container {
    min-height: 100vh;
    background: linear-gradient(135deg, #0b0f19 0%, #111827 50%, #1e1b4b 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 16px;
  }
  .app-header {
    width: 100%;
    max-width: 480px;
    padding: 16px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }
  .app-body {
    width: 100%;
    max-width: 480px;
    flex: 1;
  }
  .glass-card {
    background: rgba(31, 41, 55, 0.7);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 20px;
    margin-bottom: 20px;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  }
  .btn-gradient {
    width: 100%;
    padding: 14px;
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #d946ef 100%);
    color: #ffffff;
    font-weight: 700;
    font-size: 15px;
    border: none;
    border-radius: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-shadow: 0 4px 15px rgba(99, 102, 241, 0.35);
    transition: transform 0.1s;
  }
  .btn-gradient:active {
    transform: scale(0.98);
  }
  .btn-secondary {
    padding: 10px 16px;
    background: #374151;
    color: #f3f4f6;
    border: none;
    border-radius: 10px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }
  .btn-secondary:hover {
    background: #4b5563;
  }
  .input-field {
    width: 100%;
    padding: 12px 14px;
    background: rgba(17, 24, 39, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    color: #ffffff;
    font-size: 14px;
  }
  .input-field:focus {
    outline: none;
    border-color: #818cf8;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 8px;
  }
  .payer-btn {
    padding: 10px;
    background: rgba(17, 24, 39, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    color: #9ca3af;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
  }
  .payer-btn.selected {
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border-color: #a5b4fc;
    color: #ffffff;
  }
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.75);
    backdrop-filter: blur(8px);
    z-index: 50;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }
  .modal-content {
    width: 100%;
    max-width: 440px;
    max-height: 85vh;
    overflow-y: auto;
  }
  .reset-footer {
    margin-top: 80px;
    margin-bottom: 40px;
    text-align: center;
    width: 100%;
  }
  .reset-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #6b7280;
    font-size: 12px;
    padding: 8px 16px;
    border-radius: 10px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s;
  }
  .reset-btn:hover {
    color: #f87171;
    border-color: rgba(248, 113, 113, 0.3);
  }
`;

export default function App() {
  // --- 状態管理 ---
  const [step, setStep] = useState(() => localStorage.getItem('travel_step') || 'opening');
  const [members, setMembers] = useState(() => {
    const saved = localStorage.getItem('travel_members');
    return saved ? JSON.parse(saved) : [];
  });
  const [expenses, setExpenses] = useState(() => {
    const saved = localStorage.getItem('travel_expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // モーダル・編集状態
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false); // メンバー管理モーダル
  const [showResetModal, setShowResetModal] = useState(false);
  const [expandedExpenseId, setExpandedExpenseId] = useState(null);
  const [editingExpenseId, setEditingExpenseId] = useState(null);

  // メンバー編集用の状態
  const [editingMemberIndex, setEditingMemberIndex] = useState(null);
  const [editingMemberName, setEditingMemberName] = useState('');

  // ローカルストレージ自動保存
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

  // メンバー追加
  const addMember = () => {
    if (memberInput.trim() && !members.includes(memberInput.trim())) {
      setMembers([...members, memberInput.trim()]);
      setMemberInput('');
    }
  };

  // メンバー削除（安全策付き）
  const removeMember = (targetName) => {
    const isUsed = expenses.some(exp => exp.payer === targetName || (exp.shares && exp.shares[targetName] > 0));
    if (isUsed) {
      if (!confirm(`${targetName}さんは過去の支出に含まれています。削除しますか？`)) {
        return;
      }
    }
    setMembers(members.filter(m => m !== targetName));
  };

  // メンバー名前変更（過去データも連動更新）
  const startRenameMember = (index) => {
    setEditingMemberIndex(index);
    setEditingMemberName(members[index]);
  };

  const saveRenameMember = (index) => {
    const oldName = members[index];
    const newName = editingMemberName.trim();

    if (!newName || newName === oldName) {
      setEditingMemberIndex(null);
      return;
    }

    if (members.includes(newName)) {
      alert('その名前は既に存在します');
      return;
    }

    // メンバーリスト更新
    const updatedMembers = [...members];
    updatedMembers[index] = newName;
    setMembers(updatedMembers);

    // 過去の支出データ（立替者・負担額キー等）を新名前に一括変換
    const updatedExpenses = expenses.map(exp => {
      const newPayer = exp.payer === oldName ? newName : exp.payer;
      const newShares = {};
      const newMenus = {};

      Object.entries(exp.shares || {}).forEach(([m, amt]) => {
        const key = m === oldName ? newName : m;
        newShares[key] = amt;
      });

      Object.entries(exp.menus || {}).forEach(([m, menu]) => {
        const key = m === oldName ? newName : m;
        newMenus[key] = menu;
      });

      return {
        ...exp,
        payer: newPayer,
        shares: newShares,
        menus: newMenus
      };
    });

    setExpenses(updatedExpenses);
    setEditingMemberIndex(null);
  };

  // 新規記録モーダルを開く
  const openAddModal = () => {
    if (members.length === 0) return alert('メンバーを1人以上登録してください');
    setEditingExpenseId(null);
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

  // 編集モーダルを開く
  const openEditModal = (exp) => {
    setEditingExpenseId(exp.id);
    setTitle(exp.title);
    setPayer(exp.payer);
    setSplitType(exp.splitType);
    setTotalAmount(exp.totalAmount ? String(exp.totalAmount) : '');
    
    const activeParticipants = Object.keys(exp.shares).filter(m => exp.shares[m] > 0);
    setParticipants(activeParticipants.length > 0 ? activeParticipants : [...members]);

    const details = {};
    members.forEach(m => {
      details[m] = {
        amount: exp.shares?.[m] ? String(exp.shares[m]) : '',
        menu: exp.menus?.[m] || ''
      };
    });
    setIndividualDetails(details);

    setShowAddModal(true);
  };

  // 保存処理
  const handleSaveExpense = (e) => {
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

    if (editingExpenseId) {
      setExpenses(expenses.map(exp => {
        if (exp.id === editingExpenseId) {
          return {
            ...exp,
            title,
            payer,
            totalAmount: finalTotal,
            splitType,
            shares,
            menus: splitType === 'individual' ? menus : {},
          };
        }
        return exp;
      }));
    } else {
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
    }

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
      Object.entries(exp.shares || {}).forEach(([member, amount]) => {
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
    <div className="app-container">
      <style>{embeddedStyles}</style>

      {/* ヘッダー */}
      <header className="app-header">
        <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #d946ef)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles style={{ width: '18px', height: '18px', color: '#fff' }} />
        </div>
        <h1 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>割り勘かんたん計算</h1>
      </header>

      <main className="app-body">
        {/* STEP 1: オープニング */}
        {step === 'opening' && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator style={{ width: '36px', height: '36px', color: '#fff' }} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>旅行・ご飯の割り勘を<br /><span style={{ color: '#a5b4fc' }}>スマートに精算</span></h2>
            <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.6', marginBottom: '24px' }}>
              誰がいくら払ったか記録するだけ！<br />途中からのメンバー追加・修正もバッチリ対応。
            </p>
            <button onClick={handleStartMembers} className="btn-gradient">
              スタートする
            </button>
          </div>
        )}

        {/* STEP 2: 初期メンバー設定 */}
        {step === 'members' && (
          <div>
            <div className="glass-card">
              <h2 style={{ fontSize: '15px', fontWeight: 'bold', color: '#a5b4fc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Users style={{ width: '18px', height: '18px' }} /> 参加メンバーを登録
              </h2>
              
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="text"
                  placeholder="例: 田中"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  className="input-field"
                />
                <button onClick={addMember} className="btn-secondary" style={{ whiteSpace: 'nowrap' }}>
                  <Plus style={{ width: '16px', height: '16px' }} /> 追加
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((name, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17, 24, 39, 0.6)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600' }}>{name}</span>
                    <button onClick={() => removeMember(name)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                      <Trash2 style={{ width: '16px', height: '16px' }} />
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
              className="btn-gradient"
            >
              次へ（支出の入力へ）
            </button>
          </div>
        )}

        {/* STEP 3: メイン画面 */}
        {step === 'main' && (
          <div>
            {/* 上部アクションボタン（支出追加 ＆ メンバー管理） */}
            <div className="grid-2" style={{ marginBottom: '20px' }}>
              <button onClick={openAddModal} className="btn-gradient">
                <Plus style={{ width: '18px', height: '18px' }} /> 支出を記録
              </button>
              <button onClick={() => setShowMemberModal(true)} className="btn-secondary" style={{ padding: '14px', justifyContent: 'center', background: 'rgba(31, 41, 55, 0.8)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Users style={{ width: '18px', height: '18px', color: '#a5b4fc' }} /> メンバー追加・変更
              </button>
            </div>

            {/* 精算結果カード */}
            <div className="glass-card">
              <h2 style={{ fontSize: '14px', fontWeight: 'bold', color: '#a5b4fc', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Receipt style={{ width: '18px', height: '18px' }} /> 精算結果（最終振込先）
              </h2>

              {transactions.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: '12px', padding: '12px 0' }}>貸し借りはまだありません</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {transactions.map((t, idx) => (
                    <div key={idx} style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span style={{ color: '#f87171', fontWeight: 'bold', background: 'rgba(248, 113, 113, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{t.from}</span>
                        <ArrowRight style={{ width: '14px', height: '14px', color: '#6b7280' }} />
                        <span style={{ color: '#34d399', fontWeight: 'bold', background: 'rgba(52, 211, 153, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>{t.to}</span>
                      </div>
                      <span style={{ fontSize: '15px', fontWeight: 'bold', color: '#fcd34d', fontFamily: 'monospace' }}>¥{t.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 支出履歴一覧 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 'bold', color: '#9ca3af' }}>支出の履歴 ({expenses.length}件)</h3>
              
              {expenses.length === 0 ? (
                <div className="glass-card" style={{ textAlign: 'center', color: '#6b7280', fontSize: '12px', padding: '24px 0' }}>
                  ＋ボタンから立て替えたお金を記録しましょう
                </div>
              ) : (
                expenses.map((exp) => (
                  <div key={exp.id} className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff' }}>{exp.title}</h4>
                          <span style={{ fontSize: '10px', background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
                            立替: {exp.payer}
                          </span>
                        </div>
                        <p style={{ fontSize: '11px', color: '#6b7280' }}>{exp.date}</p>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', fontFamily: 'monospace' }}>¥{exp.totalAmount.toLocaleString()}</span>
                        <div style={{ marginTop: '4px' }}>
                          <button onClick={() => deleteExpense(exp.id)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', padding: '2px' }}>
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedExpenseId(expandedExpenseId === exp.id ? null : exp.id)}
                      style={{ width: '100%', padding: '8px', background: 'rgba(15, 23, 42, 0.5)', border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', color: '#9ca3af', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyCenter: 'center', gap: '4px' }}
                    >
                      <span>詳細を見る（内訳・編集）</span>
                      {expandedExpenseId === exp.id ? <ChevronUp style={{ width: '14px', height: '14px' }} /> : <ChevronDown style={{ width: '14px', height: '14px' }} />}
                    </button>

                    {expandedExpenseId === exp.id && (
                      <div style={{ padding: '16px', background: 'rgba(3, 7, 18, 0.6)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse', marginBottom: '12px' }}>
                          <thead>
                            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#9ca3af', textAlign: 'left' }}>
                              <th style={{ paddingBottom: '6px', fontWeight: 'normal' }}>メンバー</th>
                              {exp.splitType === 'individual' && <th style={{ paddingBottom: '6px', fontWeight: 'normal' }}>注文メニュー</th>}
                              <th style={{ paddingBottom: '6px', fontWeight: 'normal', textAlign: 'right' }}>負担額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(exp.shares || {}).map(([memberName, amt]) => (
                              <tr key={memberName} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                                <td style={{ padding: '8px 0', color: '#e5e7eb' }}>{memberName}</td>
                                {exp.splitType === 'individual' && (
                                  <td style={{ padding: '8px 0', color: '#9ca3af' }}>{exp.menus?.[memberName] || '-'}</td>
                                )}
                                <td style={{ padding: '8px 0', textAlign: 'right', fontFamily: 'monospace', color: '#e5e7eb' }}>
                                  {amt > 0 ? `¥${amt.toLocaleString()}` : <span style={{ color: '#4b5563' }}>¥0</span>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => openEditModal(exp)}
                            className="btn-secondary"
                            style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc', border: '1px solid rgba(99, 102, 241, 0.4)' }}
                          >
                            <Edit3 style={{ width: '14px', height: '14px' }} /> この記録を編集する
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* --- モーダル: 途中メンバー管理（追加・編集・削除） --- */}
        {showMemberModal && (
          <div className="modal-overlay">
            <div className="glass-card modal-content" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Users style={{ width: '18px', height: '18px', color: '#a5b4fc' }} /> メンバーの管理
                </h3>
                <button onClick={() => setShowMemberModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              {/* 新規メンバー追加フォーム */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="text"
                  placeholder="追加する名前を入力"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  className="input-field"
                />
                <button onClick={addMember} className="btn-secondary" style={{ whiteSpace: 'nowrap', background: '#6366f1' }}>
                  <UserPlus style={{ width: '16px', height: '16px' }} /> 追加
                </button>
              </div>

              {/* メンバー一覧 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '250px', overflowY: 'auto', marginBottom: '20px' }}>
                {members.map((name, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(17, 24, 39, 0.8)', padding: '10px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    {editingMemberIndex === index ? (
                      <div style={{ display: 'flex', gap: '6px', width: '100%' }}>
                        <input
                          type="text"
                          value={editingMemberName}
                          onChange={(e) => setEditingMemberName(e.target.value)}
                          className="input-field"
                          style={{ padding: '6px 10px', fontSize: '13px' }}
                        />
                        <button onClick={() => saveRenameMember(index)} className="btn-secondary" style={{ padding: '6px 10px', background: '#10b981' }}>
                          <UserCheck style={{ width: '14px', height: '14px' }} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#e5e7eb' }}>{name}</span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => startRenameMember(index)} style={{ background: 'none', border: 'none', color: '#a5b4fc', cursor: 'pointer' }}>
                            <Edit3 style={{ width: '15px', height: '15px' }} />
                          </button>
                          <button onClick={() => removeMember(name)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>
                            <Trash2 style={{ width: '15px', height: '15px' }} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <button onClick={() => setShowMemberModal(false)} className="btn-gradient">
                完了
              </button>
            </div>
          </div>
        )}

        {/* --- モーダル: 支出の追加 / 編集 --- */}
        {showAddModal && (
          <div className="modal-overlay">
            <div className="glass-card modal-content" style={{ marginBottom: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>
                  {editingExpenseId ? '支出の記録を編集' : '支出の記録を追加'}
                </h3>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer' }}>
                  <X style={{ width: '20px', height: '20px' }} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>何にお金を使いましたか？</label>
                  <input
                    type="text"
                    placeholder="例: 夕食代、ホテル代、タクシー"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>誰が立て替えましたか？</label>
                  <div className="grid-3">
                    {members.map((m) => {
                      const isSelected = payer === m;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setPayer(m)}
                          className={`payer-btn ${isSelected ? 'selected' : ''}`}
                        >
                          {isSelected && <Check style={{ width: '14px', height: '14px' }} />}
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>割り勘の方法</label>
                  <div className="grid-2">
                    <button
                      type="button"
                      onClick={() => setSplitType('equal')}
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderColor: splitType === 'equal' ? '#818cf8' : 'rgba(255,255,255,0.1)',
                        background: splitType === 'equal' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(17, 24, 39, 0.6)',
                        color: splitType === 'equal' ? '#a5b4fc' : '#9ca3af'
                      }}
                    >
                      みんなで均等割り
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitType('individual')}
                      style={{
                        padding: '10px',
                        borderRadius: '12px',
                        border: '1px solid',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        borderColor: splitType === 'individual' ? '#818cf8' : 'rgba(255,255,255,0.1)',
                        background: splitType === 'individual' ? 'rgba(99, 102, 241, 0.25)' : 'rgba(17, 24, 39, 0.6)',
                        color: splitType === 'individual' ? '#a5b4fc' : '#9ca3af'
                      }}
                    >
                      個別に金額・メニュー指定
                    </button>
                  </div>
                </div>

                {splitType === 'equal' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>合計金額 (円)</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        className="input-field"
                        style={{ fontSize: '18px', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>支払う対象メンバー</label>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                              style={{
                                padding: '6px 12px',
                                borderRadius: '8px',
                                fontSize: '12px',
                                border: '1px solid',
                                cursor: 'pointer',
                                borderColor: isChecked ? '#818cf8' : 'rgba(255,255,255,0.1)',
                                background: isChecked ? 'rgba(99, 102, 241, 0.2)' : 'rgba(17, 24, 39, 0.5)',
                                color: isChecked ? '#a5b4fc' : '#6b7280'
                              }}
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
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto' }}>
                    <label style={{ fontSize: '12px', color: '#9ca3af' }}>各メンバーの注文メニューと金額</label>
                    {members.map((m) => (
                      <div key={m} style={{ background: 'rgba(17, 24, 39, 0.8)', padding: '10px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#a5b4fc', display: 'block', marginBottom: '6px' }}>{m}</span>
                        <div className="grid-2">
                          <input
                            type="text"
                            placeholder="注文メニュー"
                            value={individualDetails[m]?.menu || ''}
                            onChange={(e) => setIndividualDetails({ ...individualDetails, [m]: { ...individualDetails[m], menu: e.target.value } })}
                            className="input-field"
                            style={{ fontSize: '12px', padding: '8px' }}
                          />
                          <input
                            type="number"
                            placeholder="金額 (円)"
                            value={individualDetails[m]?.amount || ''}
                            onChange={(e) => setIndividualDetails({ ...individualDetails, [m]: { ...individualDetails[m], amount: e.target.value } })}
                            className="input-field"
                            style={{ fontSize: '12px', padding: '8px', fontFamily: 'monospace' }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid-2" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary"
                  style={{ justifyContent: 'center', padding: '12px' }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleSaveExpense}
                  className="btn-gradient"
                  style={{ padding: '12px' }}
                >
                  {editingExpenseId ? '更新する' : '追加する'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- モーダル: リセット確認 --- */}
        {showResetModal && (
          <div className="modal-overlay">
            <div className="glass-card modal-content" style={{ textAlign: 'center', padding: '24px', marginBottom: 0 }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                <AlertTriangle style={{ width: '24px', height: '24px' }} />
              </div>
              
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '8px' }}>データをすべてリセットしますか？</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: '1.5', marginBottom: '20px' }}>
                登録したメンバーやこれまでの支出の記録が消去されます。<br />この操作は元に戻せません。
              </p>

              <div className="grid-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn-secondary"
                  style={{ justifyContent: 'center', padding: '10px' }}
                >
                  キャンセル
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  style={{ padding: '10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  リセットする
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      {step !== 'opening' && (
        <footer className="reset-footer">
          <button
            onClick={() => setShowResetModal(true)}
            className="reset-btn"
          >
            <RefreshCw style={{ width: '14px', height: '14px' }} />
            データをすべてリセットして最初からやり直す
          </button>
        </footer>
      )}
    </div>
  );
}