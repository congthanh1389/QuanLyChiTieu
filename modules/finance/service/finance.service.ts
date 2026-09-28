import type { FinanceRepository } from '../../../src/repositories/finance-repository';
import type { Transaction } from '../../../src/models/finance';
import { calculateSummary } from '../model/finance-calculations';

export class FinanceService {
  constructor(private readonly repo: FinanceRepository) {}

  list(month: string) {
    return this.repo.list().then((items) => items.filter((item) => item.date.startsWith(month)));
  }

  summary(month: string) {
    return Promise.all([this.list(month), this.repo.getBudget(month)]).then(([items, budget]) =>
      calculateSummary(items, budget),
    );
  }

  save(item: Transaction) {
    if (!Number.isFinite(item.amount) || item.amount <= 0) {
      throw new Error('Số tiền phải lớn hơn 0');
    }
    if (!item.category.trim()) {
      throw new Error('Danh mục không được để trống');
    }
    return this.repo.save(item);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }

  setBudget(month: string, amount: number) {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error('Ngân sách không được âm');
    }
    return this.repo.setBudget(month, amount);
  }
}
