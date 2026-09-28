import { Platform } from 'react-native';

import { FinanceService } from './finance.service';
import { SqliteFinanceRepository } from '../repository/sqlite.finance.repository';
import {
  AsyncFinanceRepository,
  type FinanceRepository,
} from '../../../src/repositories/finance-repository';

const asyncRepository = new AsyncFinanceRepository();
const sqliteRepository = new SqliteFinanceRepository();

export const createFinanceDependencies = (): {
  repository: FinanceRepository;
  service: FinanceService;
} => {
  const repository = Platform.OS === 'web' ? asyncRepository : sqliteRepository;
  return { repository, service: new FinanceService(repository) };
};
