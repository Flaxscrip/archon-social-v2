import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../api';
import type { AppConfig, AuthState, DirectoryEntry, SiteStats, AppContextValue } from '../types';

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
    const [stats, setStats] = useState<SiteStats>({ totalNames: 0, totalUsers: null, lastUpdated: '' });

    const [configLoading, setConfigLoading] = useState(true);
    const [authLoading, setAuthLoading] = useState(true);
    const [directoryLoading, setDirectoryLoading] = useState(true);

    const refreshAuth = useCallback(async () => {
        try {
            const r = await api.get('/check-auth');
            setAuth(r.data);
            return r.data;
        } catch (e) {
            console.error('check-auth failed:', e);
            return null;
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
            setStats(s => ({ ...s, totalNames: entries.length, lastUpdated: data.updated || '' }));
        } catch (e) {
            console.error('registry fetch failed:', e);
        } finally {
            setDirectoryLoading(false);
        }
    }, []);

    // Fetch total registered users (auth-gated). Try after auth resolves.
    const refreshUserCount = useCallback(async () => {
        try {
            const r = await api.get('/users');
            // /users returns an object with DIDs as keys or an array
            const data = r.data;
            const count = Array.isArray(data)
                ? data.length
                : data.users
                    ? Object.keys(data.users).length
                    : data.total ?? Object.keys(data).length;
            setStats(s => ({ ...s, totalUsers: count }));
        } catch (e: any) {
            // 401 = not authed, that's fine — totalUsers stays null
            if (e?.response?.status !== 401) {
                console.error('users fetch failed:', e);
            }
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

    // After auth resolves, attempt to fetch /users if authenticated
    useEffect(() => {
        if (auth?.isAuthenticated) {
            refreshUserCount();
        }
    }, [auth?.isAuthenticated, refreshUserCount]);

    const value: AppContextValue = {
        config,
        auth,
        directory,
        directoryUpdated,
        stats,
        configLoading,
        authLoading,
        directoryLoading,
        refreshAuth,
        refreshDirectory,
    };

    return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}