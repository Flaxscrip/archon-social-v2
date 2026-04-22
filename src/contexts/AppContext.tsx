import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';
import type { AppConfig, AuthState, DirectoryEntry, AppContextValue } from '../types';

const AppCtx = createContext<AppContextValue | null>(null);

export function useApp(): AppContextValue {
    const ctx = useContext(AppCtx);
    if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
    return ctx;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [auth, setAuth] = useState<AuthState | null>(null);
    const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
    const [directoryUpdated, setDirectoryUpdated] = useState('');

    const [configLoading, setConfigLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [directoryLoading, setDirectoryLoading] = useState(true);

    const refreshAuth = useCallback(async () => {
        try {
            const r = await api.get('/check-auth');
            setAuth(r.data);
        } catch (e) {
            console.error('check-auth failed:', e);
        } finally {
            setAuthLoading(false);
        }
    }, []);

    const refreshDirectory = useCallback(async () => {
        try {
            const r = await api.get('/registry');
            const data = r.data || {};
            const entries: DirectoryEntry[] = Object.entries(data.names || {}).map(
                ([name, did]) => ({ name, did: did as string })
            );
            entries.sort((a, b) => a.name.localeCompare(b.name));
            setDirectory(entries);
            setDirectoryUpdated(data.updated || '');
        } catch (e) {
            console.error('registry fetch failed:', e);
        } finally {
            setDirectoryLoading(false);
        }
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const r = await api.get('/config');
                setConfig(r.data);
            } catch (e) {
                console.error('config fetch failed:', e);
            } finally {
                setConfigLoading(false);
            }
        })();
        refreshAuth();
        refreshDirectory();
    }, [refreshAuth, refreshDirectory]);

    const value: AppContextValue = {
        config,
        auth,
        directory,
        directoryUpdated,
        configLoading,
        authLoading,
        directoryLoading,
        refreshAuth,
        refreshDirectory,
    };

    return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}