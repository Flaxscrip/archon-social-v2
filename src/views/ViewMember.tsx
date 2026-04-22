import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Button, Typography, Avatar } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { Header, LoadingShell, buildWalletUrl } from '../components/Layout';
import { useApp } from '../contexts/AppContext';
import api from '../api';

export function ViewMember() {
    const { name } = useParams<{ name: string }>();
    const { config } = useApp();
    const [memberData, setMemberData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [didCopied, setDidCopied] = useState(false);

    useEffect(() => {
        if (!name) return;
        (async () => {
            try {
                const response = await api.get(`/member/${name}`);
                setMemberData(response.data);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Member not found');
            } finally {
                setLoading(false);
            }
        })();
    }, [name]);

    async function copyDid(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            setDidCopied(true);
        } catch (e: any) {
            window.alert('Failed to copy text: ' + e);
        }
    }

    const serviceDomain = config?.serviceDomain || 'archon.social';
    const walletUrl = config?.walletUrl || '';

    if (loading) return <LoadingShell title={`${name}@${serviceDomain}`} />;

    if (error) {
        return (
            <div className="App">
                <Header title="Member Not Found" />
                <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                    <Typography variant="h6" sx={{ color: '#e74c3c', mb: 2 }}>{error}</Typography>
                    <Button component={Link} to="/members" variant="outlined">← Back to Directory</Button>
                </Box>
            </div>
        );
    }

    const aliasWalletUrl = memberData?.didDocument?.id && walletUrl
        ? buildWalletUrl(walletUrl, {
            alias: `${name}@${serviceDomain}`,
            did: memberData.didDocument.id,
        })
        : null;

    return (
        <div className="App">
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
                <Avatar
                    src={`${api.defaults.baseURL}/name/${name}/avatar`}
                    alt={name}
                    sx={{ width: 64, height: 64, fontSize: '1.75rem' }}
                >
                    {name?.[0]?.toUpperCase()}
                </Avatar>
                <Link to="/" style={{ textDecoration: 'none' }}>
                    <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                        {name}@{serviceDomain}
                    </Typography>
                </Link>
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Box sx={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    p: 3,
                    mb: 3,
                    border: '1px solid #e9ecef',
                    textAlign: 'center'
                }}>
                    {memberData?.didDocument?.id && aliasWalletUrl && (
                        <Box>
                            <a href={aliasWalletUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                                <QRCodeSVG value={aliasWalletUrl} />
                            </a>
                            <Typography variant="body1" sx={{ fontFamily: 'monospace', color: '#666', wordBreak: 'break-all', mt: 2 }}>
                                {memberData.didDocument.id}
                            </Typography>
                            <Button
                                variant="outlined"
                                size="small"
                                sx={{ mt: 1.5, textTransform: 'none' }}
                                onClick={() => copyDid(memberData.didDocument.id)}
                                disabled={didCopied}
                            >
                                {didCopied ? 'Copied' : 'Copy DID'}
                            </Button>
                        </Box>
                    )}
                </Box>

                <Typography variant="h6" sx={{ mb: 2 }}>DID Document</Typography>

                <Box sx={{
                    backgroundColor: '#1e1e1e',
                    borderRadius: 2,
                    p: 2,
                    overflow: 'auto'
                }}>
                    <pre style={{
                        color: '#d4d4d4',
                        margin: 0,
                        fontSize: '0.85rem',
                        fontFamily: 'Monaco, Consolas, monospace'
                    }}>
                        {JSON.stringify(memberData, null, 2)}
                    </pre>
                </Box>

                <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Button component={Link} to="/members" variant="outlined">← Back to Directory</Button>
                    <Button
                        component="a"
                        href={`https://explorer.archon.technology/search?did=${memberData?.id}`}
                        target="_blank"
                        variant="outlined"
                    >
                        View on Archon Explorer
                    </Button>
                </Box>
            </Box>
        </div>
    );
}