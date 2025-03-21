'use client';
import { TokenContextType } from '@/types';
import React, { createContext, useContext } from 'react';

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export const TokenProvider: React.FC<{
    sessionToken: string;
    children: React.ReactNode;
}> = ({ sessionToken, children }) => {
    return (
        <TokenContext.Provider value={{ sessionToken }}>
            {children}
        </TokenContext.Provider>
    );
};

export const useTokenContext = () => {
    const context = useContext(TokenContext);
    if (!context) {
        throw new Error('useTokenContext must be used within a TokenProvider');
    }
    return context;
};