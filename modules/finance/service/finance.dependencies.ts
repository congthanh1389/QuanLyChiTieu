import {FinanceService} from './finance.service'; import {repository} from '../../../src/repositories/finance-repository';
export const createFinanceDependencies=()=>({repository,service:new FinanceService(repository)});
