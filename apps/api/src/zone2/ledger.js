/**
 * Double-Entry Financial Ledger Engine
 * Enforces strict Capstone mathematical and double-entry invariants:
 * B = T_total - P_total
 * C_avail = C_limit - C_used
 * P <= B + C_avail
 * Settle-to-Zero: C_used = 0
 * SUM(Debits) === SUM(Credits)
 */

import { wallets, transactions, ledgerEntries, auditLogs, canteenItems } from './store.js';

class FinancialLedgerEngine {
  /**
   * Derive spendable cash balance B dynamically from ledger entries
   * B = Sum of Credits - Sum of Debits for Student Wallet
   */
  getStudentCashBalance(walletId) {
    const studentWalletEntries = ledgerEntries.filter(e => e.wallet_id === walletId);
    let totalCredits = 0; // Top-ups credited to student
    let totalDebits = 0;  // Purchases debited from student

    for (const entry of studentWalletEntries) {
      if (entry.entry_side === 'Credit') {
        totalCredits += entry.amount;
      } else if (entry.entry_side === 'Debit') {
        totalDebits += entry.amount;
      }
    }
    return Math.max(0, totalCredits - totalDebits);
  }

  /**
   * Get complete wallet state
   */
  getWalletState(idNumber) {
    const wallet = wallets.find(w => w.id_number === idNumber);
    if (!wallet) return null;

    const balance = this.getStudentCashBalance(wallet.wallet_id);
    const availableCredit = Math.max(0, wallet.credit_limit - wallet.credit_used);

    return {
      wallet_id: wallet.wallet_id,
      id_number: wallet.id_number,
      balance: balance,
      credit_limit: wallet.credit_limit,
      credit_used: wallet.credit_used,
      available_credit: availableCredit,
      total_purchasing_power: balance + availableCredit
    };
  }

  /**
   * Cash-Only Top-Up (Authorized by Registrar, Canteen Personnel, or Admin)
   * Double-Entry Journal:
   * Debit: Cash_Collection (101)
   * Credit: Student Wallet (studentWalletId)
   */
  processTopUp({ studentId, amount, operatorAccountId, receiptRef }) {
    if (amount <= 0) {
      throw new Error('Invalid top-up amount. Must be greater than zero.');
    }

    const wallet = wallets.find(w => w.id_number === studentId);
    if (!wallet) {
      throw new Error(`Student wallet not found for ID ${studentId}`);
    }

    const txId = transactions.length + 1;
    const txCode = `TXN-TOPUP-${Date.now()}`;

    // 1. Create Transaction Header
    const newTx = {
      financial_transaction_id: txId,
      transaction_code: txCode,
      transaction_type: 'Top_Up',
      transaction_status: 'Posted',
      initiated_by_account_id: operatorAccountId,
      supporting_reference: receiptRef || `OR-${Date.now()}`,
      created_at: new Date().toISOString()
    };
    transactions.push(newTx);

    // 2. Create Balanced Double-Entry Lines
    const entry1 = {
      ledger_entry_id: ledgerEntries.length + 1,
      financial_transaction_id: txId,
      wallet_id: 101, // Cash_Collection
      entry_side: 'Debit',
      amount: Number(amount),
      entry_sequence: 1,
      posted_at: newTx.created_at
    };

    const entry2 = {
      ledger_entry_id: ledgerEntries.length + 2,
      financial_transaction_id: txId,
      wallet_id: wallet.wallet_id, // Student Wallet
      entry_side: 'Credit',
      amount: Number(amount),
      entry_sequence: 2,
      posted_at: newTx.created_at
    };

    ledgerEntries.push(entry1, entry2);

    // 3. Log Immutable Audit Record
    auditLogs.push({
      log_id: auditLogs.length + 1,
      actor_account_id: operatorAccountId,
      action_type: 'CASH_TOP_UP',
      module: 'Finance',
      target_reference: txCode,
      ip_address: '127.0.0.1',
      result: 'Success',
      reason: `Cash top-up of ₱${amount.toFixed(2)} credited to ${studentId}.`,
      created_at: newTx.created_at
    });

    return {
      success: true,
      transaction: newTx,
      new_balance: this.getStudentCashBalance(wallet.wallet_id)
    };
  }

  /**
   * Canteen Purchase Checkout (Atomic ACID Invariant)
   * Formula: P <= B + C_avail
   * Consumes Cash first: Cash_Used = min(P, B)
   * Draws Credit second: Credit_Added = P - Cash_Used
   */
  processPurchase({ studentId, cartItems, cashierAccountId }) {
    const wallet = wallets.find(w => w.id_number === studentId);
    if (!wallet) {
      throw new Error(`Student wallet not found for ID ${studentId}`);
    }

    // 1. Calculate and verify item availability & prices on the server
    let totalPurchase = 0;
    const validatedItems = [];

    for (const item of cartItems) {
      const stockItem = canteenItems.find(i => i.item_id === item.item_id);
      if (!stockItem || !stockItem.is_available) {
        throw new Error(`Item ${item.item_id} is unavailable.`);
      }
      if (stockItem.stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${stockItem.item_name}. Requested: ${item.quantity}, Available: ${stockItem.stock_quantity}`);
      }
      const subtotal = stockItem.unit_price * item.quantity;
      totalPurchase += subtotal;
      validatedItems.push({
        stockItem,
        quantity: item.quantity,
        unit_price: stockItem.unit_price,
        subtotal
      });
    }

    // 2. Validate against Purchasing Power: P <= B + C_avail
    const B = this.getStudentCashBalance(wallet.wallet_id);
    const Cavail = Math.max(0, wallet.credit_limit - wallet.credit_used);

    if (totalPurchase > B + Cavail) {
      throw new Error(`Purchase rejected: Total ₱${totalPurchase.toFixed(2)} exceeds spendable balance (₱${B.toFixed(2)}) + credit (₱${Cavail.toFixed(2)})`);
    }

    // 3. Split between Cash and Credit
    const cashUsed = Math.min(totalPurchase, B);
    const creditUsed = totalPurchase - cashUsed;

    const txId = transactions.length + 1;
    const txCode = `TXN-POS-${Date.now()}`;

    // 4. Record Financial Transaction Header
    const newTx = {
      financial_transaction_id: txId,
      transaction_code: txCode,
      transaction_type: 'Purchase',
      transaction_status: 'Posted',
      initiated_by_account_id: cashierAccountId,
      supporting_reference: `POS-SALE-${txId}`,
      created_at: new Date().toISOString()
    };
    transactions.push(newTx);

    // 5. Create Double-Entry Journal Lines
    let seq = 1;
    // Cash portion: Debit Student Wallet, Credit Canteen_Revenue (102)
    if (cashUsed > 0) {
      ledgerEntries.push({
        ledger_entry_id: ledgerEntries.length + 1,
        financial_transaction_id: txId,
        wallet_id: wallet.wallet_id,
        entry_side: 'Debit',
        amount: cashUsed,
        entry_sequence: seq++,
        posted_at: newTx.created_at
      });
      ledgerEntries.push({
        ledger_entry_id: ledgerEntries.length + 1,
        financial_transaction_id: txId,
        wallet_id: 102, // Canteen_Revenue
        entry_side: 'Credit',
        amount: cashUsed,
        entry_sequence: seq++,
        posted_at: newTx.created_at
      });
    }

    // Credit portion: Debit Credit_Receivable (103), Credit Canteen_Revenue (102)
    if (creditUsed > 0) {
      ledgerEntries.push({
        ledger_entry_id: ledgerEntries.length + 1,
        financial_transaction_id: txId,
        wallet_id: 103, // Credit_Receivable
        entry_side: 'Debit',
        amount: creditUsed,
        entry_sequence: seq++,
        posted_at: newTx.created_at
      });
      ledgerEntries.push({
        ledger_entry_id: ledgerEntries.length + 1,
        financial_transaction_id: txId,
        wallet_id: 102, // Canteen_Revenue
        entry_side: 'Credit',
        amount: creditUsed,
        entry_sequence: seq++,
        posted_at: newTx.created_at
      });

      // Update student's credit liability
      wallet.credit_used += creditUsed;
    }

    // 6. Deduct item inventory atomically
    for (const v of validatedItems) {
      v.stockItem.stock_quantity -= v.quantity;
    }

    // 7. Log Immutable Audit Record
    auditLogs.push({
      log_id: auditLogs.length + 1,
      actor_account_id: cashierAccountId,
      action_type: 'CANTEEN_PURCHASE',
      module: 'Canteen',
      target_reference: txCode,
      ip_address: '127.0.0.1',
      result: 'Success',
      reason: `Purchased ${validatedItems.length} items. Total: ₱${totalPurchase.toFixed(2)} (Cash: ₱${cashUsed.toFixed(2)}, Credit: ₱${creditUsed.toFixed(2)})`,
      created_at: newTx.created_at
    });

    return {
      success: true,
      transaction_code: txCode,
      total_amount: totalPurchase,
      cash_paid: cashUsed,
      credit_paid: creditUsed,
      remaining_cash_balance: this.getStudentCashBalance(wallet.wallet_id),
      remaining_credit_available: wallet.credit_limit - wallet.credit_used
    };
  }

  /**
   * Settle-to-Zero Action (Authorized by Registrar only)
   * Resets credit_used to 0.00 upon verified payment reference
   * Debit: Cash_Collection (101)
   * Credit: Credit_Receivable (103)
   */
  settleToZero({ studentId, registrarAccountId, officialReceiptRef }) {
    if (!officialReceiptRef) {
      throw new Error('Settle-to-Zero requires verified Official Receipt or Payment Reference.');
    }

    const wallet = wallets.find(w => w.id_number === studentId);
    if (!wallet) {
      throw new Error(`Student wallet not found for ID ${studentId}`);
    }

    const outstanding = wallet.credit_used;
    if (outstanding <= 0) {
      throw new Error('No outstanding canteen credit to settle.');
    }

    const txId = transactions.length + 1;
    const txCode = `TXN-SETTLE-${Date.now()}`;

    // 1. Transaction Header
    const newTx = {
      financial_transaction_id: txId,
      transaction_code: txCode,
      transaction_type: 'Credit_Settlement',
      transaction_status: 'Posted',
      initiated_by_account_id: registrarAccountId,
      supporting_reference: officialReceiptRef,
      created_at: new Date().toISOString()
    };
    transactions.push(newTx);

    // 2. Double-Entry: Settle Receivable
    ledgerEntries.push({
      ledger_entry_id: ledgerEntries.length + 1,
      financial_transaction_id: txId,
      wallet_id: 101, // Cash_Collection
      entry_side: 'Debit',
      amount: outstanding,
      entry_sequence: 1,
      posted_at: newTx.created_at
    });

    ledgerEntries.push({
      ledger_entry_id: ledgerEntries.length + 1,
      financial_transaction_id: txId,
      wallet_id: 103, // Credit_Receivable
      entry_side: 'Credit',
      amount: outstanding,
      entry_sequence: 2,
      posted_at: newTx.created_at
    });

    // 3. Reset to Zero
    wallet.credit_used = 0.00;

    // 4. Log Immutable Audit Record
    auditLogs.push({
      log_id: auditLogs.length + 1,
      actor_account_id: registrarAccountId,
      action_type: 'SETTLE_TO_ZERO',
      module: 'Finance',
      target_reference: txCode,
      ip_address: '127.0.0.1',
      result: 'Success',
      reason: `Settled outstanding canteen credit of ₱${outstanding.toFixed(2)} against OR: ${officialReceiptRef}.`,
      created_at: newTx.created_at
    });

    return {
      success: true,
      transaction_code: txCode,
      settled_amount: outstanding,
      credit_used: 0.00
    };
  }
}

export const ledgerEngine = new FinancialLedgerEngine();
