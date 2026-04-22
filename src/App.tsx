import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import { Home } from './views/Home';
import { ViewLogin } from './views/ViewLogin';
import { ViewLogout } from './views/ViewLogout';
import { ViewMembers } from './views/ViewMembers';
import { ViewOwner } from './views/ViewOwner';
import { ViewProfile } from './views/ViewProfile';
import { ViewMember } from './views/ViewMember';
import { ViewCredential } from './views/ViewCredential';
import './App.css';

function NotFound() {
    return (
        <div className="App">
            <p>Page not found. Redirecting...</p>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter>
            <AppProvider>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<ViewLogin />} />
                    <Route path="/logout" element={<ViewLogout />} />
                    <Route path="/members" element={<ViewMembers />} />
                    <Route path="/owner" element={<ViewOwner />} />
                    <Route path="/profile/:did" element={<ViewProfile />} />
                    <Route path="/member/:name" element={<ViewMember />} />
                    <Route path="/credential" element={<ViewCredential />} />
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </AppProvider>
        </BrowserRouter>
    );
}

export default App;