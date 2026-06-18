import { createContext, useContext } from 'react';

export const CurrencyContext = createContext();
export const useCurrency = () => useContext(CurrencyContext);