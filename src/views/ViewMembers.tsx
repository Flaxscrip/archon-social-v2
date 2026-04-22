import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Typography, Table, TableBody, TableRow, TableCell, Avatar } from '@mui/material';
import { format } from 'date-fns';
import { useApp } from '../contexts/AppContext';
import { Header, LoadingShell } from '../components/Layout';
import api from '../api';

interface DirectoryEntry { name: string; did: string; }

export function ViewMembers() {
    const { config, stats } = useApp();
    const [directory, setDirectory] = useState<DirectoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState('');
    const serviceDomain = config?.serviceDomain || '';
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            try {
                const authResponse = await api.get('/check-auth');
                if (!authResponse.data.isAuthenticated) { navigate('/'); return; }

                const dirResponse = await api.get('/registry');
                const data = dirResponse.data;
                setLastUpdated(data.updated || '');
                const entries: DirectoryEntry[] = Object.entries(data.names || {}).map(
                    ([name, did]) => ({ name, did: did as string })
                );
                entries.sort((a, b) => a.name.localeCompare(b.name));
                setDirectory(entries);
            } catch (e) {
                console.error(e);
                navigate('/');
            } finally {
                setLoading(false);
            }
        })();
    }, [navigate]);

    if (loading) return <LoadingShell title="Member Directory" />;

    return (
        <div className="App">
            <Header title="Member Directory" />
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                            {directory.length} {directory.length === 1 ? 'name' : 'names'} claimed
                        </Typography>
                        {stats.totalUsers !== null && (
                            <Typography variant="body2" sx={{ color: '#888' }}>
                                · {stats.totalUsers} {stats.totalUsers === 1 ? 'user' : 'users'} registered
                            </Typography>
                        )}
                    </Box>
                    {lastUpdated && (
                        <Typography variant="body2" sx={{ color: '#888' }}>
                            Last updated: {format(new Date(lastUpdated), 'MMM d, yyyy h:mm a')}
                        </Typography>
                    )}
                </Box>

                <Table sx={{ backgroundColor: '#fff', borderRadius: 2, overflow: 'hidden' }}>
                    <TableBody>
                        {directory.map((entry) => (
                            <TableRow
                                key={entry.did}
                                sx={{ '&:hover': { backgroundColor: '#f8f9fa' }, cursor: 'pointer' }}
                                onClick={() => navigate(`/profile/${entry.did}`)}
                            >
                                <TableCell sx={{ fontWeight: 600, fontSize: '1.1rem', color: '#2c3e50' }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Avatar
                                            src={`${api.defaults.baseURL}/name/${entry.name}/avatar`}
                                            alt={entry.name}
                                            sx={{ width: 36, height: 36 }}
                                        >
                                            {entry.name[0]?.toUpperCase()}
                                        </Avatar>
                                        {entry.name}@{serviceDomain}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ color: '#666', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                    {entry.did.substring(0, 20)}...{entry.did.substring(entry.did.length - 8)}
                                </TableCell>
                                <TableCell align="right">
                                    <Button component={Link} to={`/member/${entry.name}`} size="small" variant="outlined" onClick={(e) => e.stopPropagation()}>
                                        View Details
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Button component={Link} to="/" variant="text">← Back to Home</Button>
                </Box>
            </Box>
        </div>
    );
}