import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Box, Button, Typography, Alert } from '@mui/material';
import { Header } from '../components/Layout';
import { useApp } from '../contexts/AppContext';
import api from '../api';

export function ViewOwner() {
    const { auth } = useApp();
    const [adminInfo, setAdminInfo] = useState<any>(null);
    const [publishing, setPublishing] = useState(false);
    const [publishResult, setPublishResult] = useState<any>(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (auth && !auth.isOwner) {
            navigate('/');
            return;
        }
        (async () => {
            try {
                const response = await api.get('/admin');
                setAdminInfo(response.data);
            } catch (err: any) {
                navigate('/');
            }
        })();
    }, [auth, navigate]);

    const publishToIPNS = async () => {
        setPublishing(true);
        setError('');
        setPublishResult(null);
        try {
            const response = await api.post('/admin/publish');
            setPublishResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to publish');
        } finally {
            setPublishing(false);
        }
    };

    return (
        <div className="App">
            <Header title="Owner Area" />
            <Box sx={{ maxWidth: 600, mx: 'auto', p: 3 }}>
                <Typography variant="h6" gutterBottom>Registry Management</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Publish the name registry to IPNS for decentralized resolution.
                </Typography>

                <Button
                    variant="contained"
                    onClick={publishToIPNS}
                    disabled={publishing}
                    sx={{ mb: 2 }}
                >
                    {publishing ? 'Publishing...' : 'Publish to IPNS'}
                </Button>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {publishResult && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        <Typography variant="body2">
                            <strong>Published successfully!</strong><br />
                            CID: {publishResult.cid}<br />
                            IPNS: {publishResult.ipns}
                        </Typography>
                    </Alert>
                )}
            </Box>

            <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
                <Typography variant="h6" gutterBottom>Database</Typography>
                <pre style={{ textAlign: 'left', overflow: 'auto' }}>
                    {JSON.stringify(adminInfo, null, 4)}
                </pre>
            </Box>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
                <Button component={Link} to="/" variant="text">← Back to Home</Button>
            </Box>
        </div>
    );
}