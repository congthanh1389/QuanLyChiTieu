import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {Transaction,Budget} from '../models/finance';
const KEY='so-chi-tieu.finance.v1'; const BACKUP=KEY+'.backup';
export interface FinanceRepository{ init():Promise<void>; list():Promise<Transaction[]>; save(item:Transaction):Promise<void>; remove(id:string):Promise<void>; replace(items:Transaction[]):Promise<void>; getBudget(month:string):Promise<number>; setBudget(month:string,amount:number):Promise<void>; cleanup():Promise<void>; }
const memory:Transaction[]=[]; const budgets:Record<string,number>={};
export class AsyncFinanceRepository implements FinanceRepository{
 async init(){const raw=await AsyncStorage.getItem(KEY);if(raw){try{const parsed=JSON.parse(raw);memory.splice(0,memory.length,...(parsed.transactions||parsed||[]));Object.assign(budgets,parsed.budgets||{});}catch{}}}
 private async persist(){await AsyncStorage.setItem(KEY,JSON.stringify({transactions:memory,budgets}));}
 async list(){return [...memory].sort((a,b)=>b.date.localeCompare(a.date));} async save(i:Transaction){const n=memory.findIndex(x=>x.id===i.id);if(n>=0)memory[n]=i;else memory.push(i);await this.persist();} async remove(id:string){const n=memory.findIndex(x=>x.id===id);if(n>=0)memory.splice(n,1);await this.persist();} async replace(items:Transaction[]){await AsyncStorage.setItem(BACKUP,JSON.stringify({transactions:memory,budgets}));memory.splice(0,memory.length,...items);await this.persist();} async getBudget(m:string){return budgets[m]||0;} async setBudget(m:string,a:number){budgets[m]=a;await this.persist();} async cleanup(){await AsyncStorage.setItem(BACKUP,await AsyncStorage.getItem(KEY)||'{}');}
}
export const repository = new AsyncFinanceRepository();
export {KEY,BACKUP};
