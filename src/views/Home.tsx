import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Box, Button, Typography, TextField, Avatar } from '@mui/material';
import { useApp } from '../contexts/AppContext';
import { Header } from '../components/Layout';
import api from '../api';

export function Home() {
    const { config, auth, directory, directoryLoading, stats } = useApp();
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();

    const isAuthenticated = !!(auth && auth.isAuthenticated);
    const userDID = auth?.userDID || '';
    const userName = auth?.profile?.name || '';
    const logins = auth?.profile?.logins || 0;
    const serviceDomain = config?.serviceDomain || '';
    const serviceName = config?.serviceName || 'archon.social';

    const filteredDirectory = searchQuery
        ? directory.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : directory;

    return (
        <div className="App">
            {isAuthenticated && <Header title={serviceName} showTagline />}

            {auth && isAuthenticated ? (
                <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
                    <Box sx={{
                        backgroundColor: '#f8f9fa', borderRadius: 2, p: 3, mb: 3,
                        border: '1px solid #e9ecef',
                    }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#2c3e50' }}>
                            {logins > 1 ? `Welcome back, ${userName || 'friend'}!` : 'Welcome aboard!'}
                        </Typography>
                        {userName ? (
                            <Typography variant="h6" sx={{ color: '#27ae60', fontWeight: 600 }}>
                                🎉 Your handle: <strong>{userName}@{serviceDomain}</strong>
                            </Typography>
                        ) : (
                            <Typography variant="body1" sx={{ color: '#e74c3c' }}>
                                You haven't claimed a name yet! Visit your profile to claim one.
                            </Typography>
                        )}
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                        You have access to:
                    </Typography>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center', mb: 3 }}>
                        <Button component={Link} to={`/profile/${userDID}`} variant="outlined" size="small">
                            My Profile
                        </Button>
                        <Button component={Link} to="/credential" variant="outlined" size="small" color="success">
                            My Credential
                        </Button>
                        <Button component={Link} to="/members" variant="outlined" size="small">
                            Members
                        </Button>
                        {auth.isOwner && (
                            <Button component={Link} to="/owner" variant="outlined" size="small">
                                Owner
                            </Button>
                        )}
                    </Box>

                    <Button variant="contained" color="error" onClick={() => navigate('/logout')}>
                        Logout
                    </Button>
                </Box>
            ) : (
                <Box sx={{ maxWidth: 1100, mx: 'auto', px: 2 }}>
                    {/* Hero */}
                    <Box sx={{ textAlign: 'center', pt: { xs: 3, md: 6 }, pb: { xs: 4, md: 6 } }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontWeight: 800,
                                fontSize: { xs: '2.2rem', md: '3.4rem' },
                                lineHeight: 1.1, mb: 2,
                                background: 'linear-gradient(135deg, #7c5cff 0%, #00e0c6 100%)',
                                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
                            }}
                        >
                            Decentralized names<br />for humans and AIs
                        </Typography>
                        <Typography variant="h6" sx={{
                            color: '#555', fontWeight: 400, mb: 4, maxWidth: 620, mx: 'auto',
                        }}>
                            Claim your <strong>@name</strong> bound to your DID. Get a verifiable
                            credential, a Lightning Address, and a public identity — no email,
                            no passwords, no gatekeepers.
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: 4 }}>
                            <Button
                                variant="contained" onClick={() => navigate('/login')} size="large"
                                sx={{
                                    px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600,
                                    textTransform: 'none', borderRadius: 2,
                                    background: 'linear-gradient(135deg, #7c5cff 0%, #00e0c6 100%)',
                                    boxShadow: '0 4px 14px rgba(124, 92, 255, 0.35)',
                                    '&:hover': { background: 'linear-gradient(135deg, #6b4bff 0%, #00c9b1 100%)' },
                                }}
                            >
                                Claim your @name
                            </Button>
                            <Button
                                component="a" href="/agents.html" variant="outlined" size="large"
                                sx={{
                                    px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600,
                                    textTransform: 'none', borderRadius: 2,
                                    borderColor: '#7c5cff', color: '#7c5cff',
                                }}
                            >
                                🤖 I'm an AI agent
                            </Button>
                        </Box>

                        {/* Stats strip */}
                        <Box sx={{
                            display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 },
                            flexWrap: 'wrap', color: '#666', fontSize: '0.95rem',
                        }}>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                                    {stats.totalUsers !== null ? stats.totalUsers.toLocaleString() : '—'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#888' }}>Registered users</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>
                                    {directoryLoading ? '…' : directory.length.toLocaleString()}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#888' }}>Names claimed</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>W3C VC</Typography>
                                <Typography variant="body2" sx={{ color: '#888' }}>Verifiable credentials</Typography>
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>⚡ LUD-16</Typography>
                                <Typography variant="body2" sx={{ color: '#888' }}>Lightning addresses</Typography>
                            </Box>
                        </Box>
                    </Box>

                    {/* Directory */}
                    <Box sx={{ mt: 4, mb: 6 }}>
                        <Box sx={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            mb: 2, flexWrap: 'wrap', gap: 2,
                        }}>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#2c3e50' }}>Community</Typography>
                            <TextField
                                size="small" placeholder="Search names..."
                                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                sx={{ width: 220 }}
                            />
                        </Box>

                        {directoryLoading ? (
                            <Typography sx={{ color: '#888', textAlign: 'center', py: 4 }}>
                                Loading directory...
                            </Typography>
                        ) : (
                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                                gap: 2,
                            }}>
                                {filteredDirectory.map(entry => (
                                    <Box
                                        key={entry.did}
                                        component={Link}
                                        to={`/member/${entry.name}`}
                                        sx={{
                                            display: 'flex', alignItems: 'center', gap: 1.5,
                                            p: 1.5, borderRadius: 2, textDecoration: 'none',
                                            border: '1px solid #e9ecef', backgroundColor: '#fafbfc',
                                            '&:hover': { backgroundColor: '#f0f2ff', borderColor: '#7c5cff' },
                                            transition: 'all 0.15s ease',
                                        }}
                                    >
                                        <Avatar
                                            src={`${api.defaults.baseURL}/name/${entry.name}/avatar`}
                                            alt={entry.name}
                                            sx={{ width: 36, height: 36 }}
                                        >
                                            {entry.name[0]?.toUpperCase()}
                                        </Avatar>
                                        <Typography sx={{ fontWeight: 600, color: '#2c3e50', fontSize: '0.95rem' }}>
                                            {entry.name}@{serviceDomain}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ mt: 3, textAlign: 'center' }}>
                            <Button component={Link} to="/members" variant="text" size="small">
                                View full directory →
                            </Button>
                        </Box>
                    </Box>

                    {/* AI Agents — links to /agents.html for full quick start */}
                    <Box sx={{ mt: 4, p: 3, backgroundColor: '#1a1a2e', borderRadius: 2, textAlign: 'center' }}>
                        <Typography variant="h6" sx={{ mb: 1, color: '#00d4aa', fontFamily: 'monospace' }}>
                            🤖 AI Agent?
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#888', mb: 2 }}>
                            Claim your @name programmatically — no browser required.
                        </Typography>
                        <Button
                            component="a"
                            href="/agents.html"
                            variant="outlined"
                            sx={{
                                color: '#00d4aa',
                                borderColor: '#00d4aa',
                                '&:hover': { borderColor: '#00e8bb', backgroundColor: 'rgba(0,212,170,0.08)' },
                                textTransform: 'none',
                            }}
                        >
                            Agent Quick Start →
                        </Button>
                    </Box>

                    {/* Footer */}
                    <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e9ecef' }}>
                        <Typography variant="body2" sx={{ color: '#888' }}>
                            Powered by{' '}
                            <a href="https://archon.technology" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>
                                Archon Protocol
                            </a>
                            {' • '}
                            <a href="/directory.json" target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>
                                View Directory
                            </a>
                            {config?.publicUrl && (
                                <>
                                    {' • '}
                                    <a href={`https://ipfs.io/ipns/${new URL(config.publicUrl).host}`} target="_blank" rel="noopener noreferrer" style={{ color: '#3498db' }}>
                                        IPNS Registry
                                    </a>
                                </>
                            )}
                        </Typography>
                    </Box>
                </Box>
            )}
        </div>
    );
}