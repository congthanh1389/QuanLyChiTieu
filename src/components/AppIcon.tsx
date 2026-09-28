import React from 'react';
import {Image, ImageStyle, StyleProp} from 'react-native';

type IconName = 'home'|'receipt-long'|'pie-chart'|'settings'|'add'|'income'|'expense'|'budget'|'search'|'scan-receipt'|'excel-export'|'excel-import'|'notification'|'restaurant'|'transport'|'shopping'|'bill'|'entertainment'|'health'|'other';
const icons: Record<IconName, any> = {
  home: require('../../assets/icons-png/home.png'),
  'receipt-long': require('../../assets/icons-png/receipt-long.png'),
  'pie-chart': require('../../assets/icons-png/pie-chart.png'),
  settings: require('../../assets/icons-png/settings.png'),
  add: require('../../assets/icons-png/add.png'),
  income: require('../../assets/icons-png/income.png'),
  expense: require('../../assets/icons-png/expense.png'),
  budget: require('../../assets/icons-png/budget.png'),
  search: require('../../assets/icons-png/search.png'),
  'scan-receipt': require('../../assets/icons-png/scan-receipt.png'),
  'excel-export': require('../../assets/icons-png/excel-export.png'),
  'excel-import': require('../../assets/icons-png/excel-import.png'),
  notification: require('../../assets/icons-png/notification.png'),
  restaurant: require('../../assets/icons-png/restaurant.png'),
  transport: require('../../assets/icons-png/transport.png'),
  shopping: require('../../assets/icons-png/shopping.png'),
  bill: require('../../assets/icons-png/bill.png'),
  entertainment: require('../../assets/icons-png/entertainment.png'),
  health: require('../../assets/icons-png/health.png'),
  other: require('../../assets/icons-png/other.png')
};
export function AppIcon({name,size=24,style}:{name:IconName;size?:number;style?:StyleProp<ImageStyle>}){return <Image source={icons[name]} style={[{width:size,height:size},style]} resizeMode="contain"/>;}
