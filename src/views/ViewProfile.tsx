import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Box, Button, Typography, Alert, Table, TableBody, TableRow, TableCell, TextField } from '@mui/material';
import { format, differenceInDays } from 'date-fns';
import { Header } from '../components/Layout';
import api from '../api';

export function ViewProfile() {
    const { did } = useParams<{ did: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [currentName, setCurrentName] = useState('');
    const [newName, setNewName] = useState('');
    const [nameError, setNameError] = useState('');
    const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

    useEffect(() => {
        if (!did) return;
        (async () => {
            try {
                await api.get('/check-auth');
                const r = await api.get(`/profile/${did}`);
                setProfile(r.data);
                if (r.data.name) {
                    setCurrentName(r.data.name);
                    setNewName(r.data.name);
                }
            } catch (e) {
                navigate('/');
            }
        })();
    }, [did, navigate]);

    async function saveName() {
        setNameError('');
        try {
            const name = newName.trim();
            await api.put(`/profile/${profile.did}/name`, { name });
            setNewName(name);
            setCurrentName(name);
            profile.name = name;
        } catch (error: any) {
            setNameError(error.response?.data?.message || error.response?.data?.error || 'Failed to save name');
        }
    }

    async function deleteName() {
        if (!window.confirm(`Delete name '${currentName}'? This will also revoke your credential.`)) return;
        setNameError('');
        try {
            await api.delete(`/profile/${profile.did}/name`);
            setCurrentName('');
            setNewName('');
            profile.name = '';
        } catch (error: any) {
            setNameError(error.response?.data?.message || error.response?.data?.error || 'Failed to delete name');
        }
    }

    async function checkName() {
        setNameError('');
        setNameAvailable(null);
        try {
            const name = newName.trim().toLowerCase();
            await api.get(`/name/${name}`);
            setNameAvailable(false);
            setNameError('Name already taken');
        } catch (error: any) {
            if (error.response?.status === 404) {
                setNameAvailable(true);
            } else {
                setNameError('Failed to check name');
            }
        }
    }

    if (!profile) return <div className="App"><Header title="Profile" /><p>Loading...</p></div>;

    function formatDate(time: string) {
        const date = new Date(time);
        const days = differenceInDays(new Date(), date);
        return `${format(date, 'yyyy-MM-dd HH:mm:ss')} (${days} days ago)`;
    }

    return (
        <div className="App">
            <Header title="Profile" />
            <Box sx={{ maxWidth: 800, mx: 'auto' }}>
                <Table sx={{ width: '100%' }}>
                    <TableBody>
                        <TableRow>
                            <TableCell>DID:</TableCell>
                            <TableCell><Typography sx={{ fontFamily: 'Courier' }}>{profile.did}</Typography></TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>First login:</TableCell>
                            <TableCell>{formatDate(profile.firstLogin)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Last login:</TableCell>
                            <TableCell>{formatDate(profile.lastLogin)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Login count:</TableCell>
                            <TableCell>{profile.logins}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Name:</TableCell>
                            <TableCell>
                                {profile.isUser ? (
                                    <>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                            <TextField
                                                label="" value={newName}
                                                onChange={(e) => { setNewName(e.target.value); setNameError(''); setNameAvailable(null); }}
                                                slotProps={{ htmlInput: { maxLength: 32 } }}
                                                sx={{ width: 300 }} margin="normal" fullWidth
                                            />
                                            <Button variant="outlined" onClick={checkName} disabled={!newName.trim() || newName === currentName}>Check</Button>
                                            <Button variant="outlined" color="primary" onClick={saveName} disabled={newName === currentName}>Save</Button>
                                            {currentName && <Button variant="outlined" color="error" onClick={deleteName}>Delete</Button>}
                                        </Box>
                                        {nameError && <Alert severity="error" sx={{ mt: 1 }}>{nameError}</Alert>}
                                        {nameAvailable && <Alert severity="success" sx={{ mt: 1 }}>Name is available!</Alert>}
                                    </>
                                ) : currentName}
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Box sx={{ mt: 3 }}>
                    <Button component={Link} to="/" variant="outlined">← Back to Home</Button>
                </Box>
            </Box>
        </div>
    );
}