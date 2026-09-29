import {useCallback, useEffect, useState} from 'react';
import {Transaction} from '../models/finance';
import {createFinanceDependencies} from '../../modules/finance/service/finance.dependencies';

export function useFinanceViewModel(month: string) {
  const {repository, service} = createFinanceDependencies();
  const [items, setItems] = useState<Transaction[]>([]);
  const [allItems, setAllItems] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);

  const refresh = useCallback(async () => {
    await repository.init();
    const savedItems = await repository.list();
    setAllItems(savedItems);
    setItems(savedItems.filter((item) => item.date.startsWith(month)));
    setSummary(await service.summary(month));
  }, [month]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    items,
    allItems,
    summary,
    refresh,
    save: async (item: Transaction) => {
      await service.save(item);
      await refresh();
    },
    remove: async (id: string) => {
      await service.remove(id);
      await refresh();
    },
    setBudget: async (amount: number) => {
      await service.setBudget(month, amount);
      await refresh();
    },
  };
}
