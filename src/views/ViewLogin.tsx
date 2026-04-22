import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import api from '../api';

export function ViewLogin() {
    const [challengeDID, setChallengeDID] = useState('');
    const [challengeURL, setChallengeURL] = useState<string | null>(null);
    const [challengeCopied, setChallengeCopied] = useState(false);
    const navigate = useNavigate();
    const intervalIdRef = useRef<number | null>(null);

    useEffect(() => {
        const init = async () => {
            try {
                intervalIdRef.current = window.setInterval(async () => {
                    try {
                        const response = await api.get('/check-auth');
                        if (response.data.isAuthenticated) {
                            if (intervalIdRef.current) clearInterval(intervalIdRef.current);
                            navigate('/');
                        }
                    } catch (e) {
                        console.error('Failed to check authentication:', e);
                    }
                }, 1000);

                const response = await api.get('/challenge');
                const { challenge, challengeURL } = response.data;
                setChallengeDID(challenge);
                setChallengeURL(encodeURI(challengeURL));
            } catch (error: any) {
                window.alert(error);
            }
        };

        init();
        return () => {
            if (intervalIdRef.current) clearInterval(intervalIdRef.current);
        };
    }, [navigate]);

    async function copyToClipboard(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setChallengeCopied(true);
        } catch (e: any) {
            window.alert('Failed to copy text: ' + e);
        }
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at top, #f5f8ff 0%, #eef2f8 45%, #e8edf5 100%)',
                p: 2,
            }}
        >
            <Dialog
                open
                onClose={() => navigate('/')}
                maxWidth="xs"
                fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3, px: 1, py: 1.5 } } }}
            >
                <DialogContent sx={{ textAlign: 'center', pt: 2 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1.5 }}>
                        Login
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
                        Scan with Archon Wallet to continue.
                    </Typography>
                    {challengeURL && (
                        <Box
                            component="a"
                            href={challengeURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'inline-flex', p: 2, borderRadius: 2,
                                backgroundColor: '#fff', border: '1px solid #e5e7eb',
                                boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
                            }}
                        >
                            <QRCodeSVG value={challengeURL} />
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ justifyContent: 'center', gap: 1, pb: 3 }}>
                    <Button variant="outlined" onClick={() => copyToClipboard(challengeDID)} disabled={challengeCopied}>
                        {challengeCopied ? 'Copied' : 'Copy'}
                    </Button>
                    <Button variant="text" color="inherit" onClick={() => navigate('/')}>
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}