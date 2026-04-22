export interface AuthState {
    isAuthenticated: boolean;
    userDID: string;
    isOwner: boolean;
    profile?: {
        logins?: number;
        name?: string;
        [key: string]: any;
    };
    [key: string]: any;
}

export interface AppConfig {
    publicUrl?: string;
    serviceDomain?: string;
    serviceName?: string;
    walletUrl?: string;
    [key: string]: any;
}

export interface DirectoryEntry {
    name: string;
    did: string;
}

export interface AppContextValue {
    config: AppConfig | null;
    auth: AuthState | null;
    directory: DirectoryEntry[];
    directoryUpdated: string;

    configLoading: boolean;
    authLoading: boolean;
    directoryLoading: boolean;

    refreshAuth: () => Promise<void>;
    refreshDirectory: () => Promise<void>;
}