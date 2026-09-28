export type TransactionType = 'income' | 'expense';
export type Transaction = { id:string; amount:number; type:TransactionType; category:string; note:string; date:string; createdAt:string; };
export type Budget = { month:string; amount:number };
export type FinanceSummary = { income:number; expense:number; balance:number; budget:number; budgetUsed:number; byCategory:Record<string,number> };
export const CATEGORIES = ['Ăn uống','Di chuyển','Mua sắm','Hóa đơn','Giải trí','Sức khỏe','Lương','Khác'] as const;
