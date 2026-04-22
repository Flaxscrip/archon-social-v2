import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Header, LoadingShell, buildWalletUrl } from '../components/Layout';
import api from '../api';

export function ViewCredential() {
    const [credentialData, setCredentialData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [walletUrl, setWalletUrl] = useState('');
    const [credentialDidCopied, setCredentialDidCopied] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const configResponse = await api.get('/config');
                setWalletUrl(configResponse.data.walletUrl);
                const response = await api.get('/credential');
                setCredentialData(response.data);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    navigate('/login');
                } else {
                    setError(err.response?.data?.error || 'Failed to fetch credential');
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    const credentialWalletUrl = credentialData?.credentialDid && walletUrl
        ? buildWalletUrl(walletUrl, { credential: credentialData.credentialDid })
        : null;

    async function copyCredentialDid(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setCredentialDidCopied(true);
        } catch (e: any) {
            window.alert('Failed to copy text: ' + e);
        }
    }

    if (loading) return <LoadingShell title="My Credential" />;

    return (
        <div className="App">
            <Header title="My Credential" />
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                {error && (
                    <Box sx={{ backgroundColor: '#fee', border: '1px solid #fcc', borderRadius: 2, p: 2, mb: 3 }}>
                        <Typography color="error">{error}</Typography>
                    </Box>
                )}

                {!credentialData?.hasCredential ? (
                    <Box sx={{ backgroundColor: '#f8f9fa', borderRadius: 2, p: 4, textAlign: 'center', border: '1px solid #e9ecef' }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50' }}>No Credential Yet</Typography>
                        <Typography variant="body1" sx={{ mb: 3, color: '#666' }}>
                            Set a name on your profile to automatically receive a verifiable credential.
                        </Typography>
                        <Button component={Link} to={`/profile/${credentialData?.did || ''}`} variant="outlined">
                            Go to Profile
                        </Button>
                    </Box>
                ) : (
                    <Box>
                        <Box sx={{ backgroundColor: '#e8f5e9', borderRadius: 2, p: 3, mb: 3, border: '1px solid #c8e6c9', textAlign: 'center' }}>
                            <Typography variant="h5" sx={{ color: '#2e7d32', mb: 1 }}>
                                ✓ Verified Name Credential
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 600, color: '#1b5e20' }}>
                                {credentialData.credential?.credentialSubject?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                                Issued: {credentialData.credentialIssuedAt
                                    ? format(new Date(credentialData.credentialIssuedAt), 'MMM d, yyyy h:mm a')
                                    : 'Unknown'}
                            </Typography>
                        </Box>

                        <Typography variant="h6" sx={{ mb: 2 }}>Credential DID</Typography>
                        <Box sx={{ backgroundColor: '#f5f5f5', p: 2, borderRadius: 1, mb: 3, textAlign: 'center' }}>
                            <a href={credentialWalletUrl || '#'} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                <QRCodeSVG value={credentialWalletUrl || credentialData.credentialDid} />
                            </a>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all', mt: 2, color: '#666' }}>
                                {credentialData.credentialDid}
                            </Typography>
                            <Button variant="outlined" size="small" sx={{ mt: 1.5, textTransform: 'none' }}
                                onClick={() => copyCredentialDid(credentialData.credentialDid)} disabled={credentialDidCopied}>
                                {credentialDidCopied ? 'Copied' : 'Copy DID'}
                            </Button>
                        </Box>

                        <Typography variant="h6" sx={{ mb: 2 }}>Verifiable Credential</Typography>
                        <Box sx={{ backgroundColor: '#1e1e1e', borderRadius: 2, p: 2, overflow: 'auto', maxHeight: 400 }}>
                            <pre style={{ color: '#d4d4d4', margin: 0, fontSize: '0.8rem', fontFamily: 'Monaco, Consolas, monospace' }}>
                                {JSON.stringify(credentialData.credential, null, 2)}
                            </pre>
                        </Box>
                    </Box>
                )}

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button component={Link} to="/" variant="text">← Back to Home</Button>
                </Box>
            </Box>
        </div>
    );
}