import React, { useMemo } from 'react';
import { useLocation } from "react-router";

export interface IQuery {
    roomId: string;
};

export function useQueryParams(): IQuery {
    const res = {};
    const { search } = useLocation();
    const { length } = search;
    useMemo(() => {
        for(let i = 0; i < length; i++) {
            if (/[?&]/.test(search[i])) i++;
    
            let key = '';
            while(search[i] !== '=') key += search[i++];
    
            i++;
    
            let value = '';
            while(search[i] !== '&' && i < length) value += search[i++];
    
            // @ts-ignore
            res[key] = value;
        }
    }, []);

    return res as IQuery;
}