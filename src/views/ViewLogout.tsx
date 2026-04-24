import { useEffect } from 'react';
import api from '../api';

export function ViewLogout() {
    useEffect(() => {
        (async () => {
            try {
                await api.post('/logout');
            } catch (e) {
                console.error('Failed to logout:', e);
            }
            window.location.href = '/';
        })();
    }, []);

    return null;
}