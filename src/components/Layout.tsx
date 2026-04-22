import { Link } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export function Header({ title, showTagline = false }: { title: string; showTagline?: boolean }) {
    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                mb: 3,
            }}
        >
            <Link to="/" style={{ textDecoration: 'none' }}>
                <Typography variant="h3" component="h1" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    {title}
                </Typography>
            </Link>
            {showTagline && (
                <Typography variant="subtitle1" sx={{ color: '#666', fontStyle: 'italic' }}>
                    Self-Sovereign Identity for Everyone
                </Typography>
            )}
        </Box>
    );
}

export function LoadingShell({ title }: { title: string }) {
    return (
        <div className="App">
            <Header title={title} />
            <Box
                sx={{
                    maxWidth: 720,
                    mx: 'auto',
                    minHeight: 180,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f8f9fa',
                    borderRadius: 2,
                    border: '1px solid #e9ecef',
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body1" sx={{ color: '#888' }}>Loading...</Typography>
                </Box>
            </Box>
        </div>
    );
}

export function buildWalletUrl(walletUrl: string, params: Record<string, string>) {
    try {
        const url = new URL(walletUrl);
        for (const [key, value] of Object.entries(params)) {
            url.searchParams.set(key, value);
        }
        return url.toString();
    } catch {
        return null;
    }
}