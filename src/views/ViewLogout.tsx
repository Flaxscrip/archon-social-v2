import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export function ViewLogout() {
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                await api.post('/logout');
            } catch (e) {
                console.error('Failed to logout:', e);
            }
            navigate('/');
        })();
    }, [navigate]);

    return null;
}