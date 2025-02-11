import React, { useState, useEffect } from 'react';
import { loginUser, getProjects, getReports, getUsers } from './apiServices';

export function MainApp() {
    const [token, setToken] = useState('');
    const [projects, setProjects] = useState([]);
    const [reports, setReports] = useState([]);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Load token from localStorage on component mount
    useEffect(() => {
        const savedToken = localStorage.getItem('token');
        if (savedToken) setToken(savedToken);
    }, []);

    // Login Handler
    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const loginData = {
                loginname: 'Yomna',
                password: 'Y159',
            };
            const response = await loginUser(loginData);
            setToken(response.token); // Assume the token is in response.token
            localStorage.setItem('token', response.token);
            console.log('Logged in successfully:', response);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
            console.error('Login Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Projects
    const fetchProjects = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await getProjects(token);
            setProjects(data);
            console.log('Projects:', data);
        } catch (err) {
            setError(err.message || 'Failed to fetch projects.');
            console.error('Fetch Projects Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Reports
    const fetchReports = async () => {
        setLoading(true);
        setError('');
        try {
            const reportData = {
                pageno: 1,
                ispage: true,
                pagesize: 10,
                sortcol: 't.date',
                filter: [
                    { table: 't', column: 'date', value: '2024-08-01', paraname: 'sdate', operation: '>=' },
                    { table: 't', column: 'date', value: '2024-08-31', paraname: 'edate', operation: '<=' },
                ],
                Dfilter: { summary: false },
            };
            const data = await getReports(token, reportData);
            setReports(data);
            console.log('Reports:', data);
        } catch (err) {
            setError(err.message || 'Failed to fetch reports.');
            console.error('Fetch Reports Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Users
    const fetchUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const userData = { id: 1, firstname: 'Yomna', lastname: 'Sherif', loginname: 'Yomna' };
            const data = await getUsers(token, userData);
            setUsers(data);
            console.log('Users:', data);
        } catch (err) {
            setError(err.message || 'Failed to fetch users.');
            console.error('Fetch Users Error:', err);
        } finally {
            setLoading(false);
        }
    };

    // Logout Handler (Optional)
    const handleLogout = () => {
        setToken('');
        localStorage.removeItem('token');
        setProjects([]);
        setReports([]);
        setUsers([]);
        setError('');
    };

    return (
        <div>
            <h1>TimeTracking Integration</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            {loading && <p>Loading...</p>}
            {!token ? (
                <button onClick={handleLogin} disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            ) : (
                <button onClick={handleLogout}>
                    Logout
                </button>
            )}
            <button onClick={fetchProjects} disabled={!token || loading}>
                Fetch Projects
            </button>
            <button onClick={fetchReports} disabled={!token || loading}>
                Fetch Reports
            </button>
            <button onClick={fetchUsers} disabled={!token || loading}>
                Fetch Users
            </button>

            <div>
                <h2>Projects</h2>
                <pre>{JSON.stringify(projects, null, 2)}</pre>
            </div>
            <div>
                <h2>Reports</h2>
                <pre>{JSON.stringify(reports, null, 2)}</pre>
            </div>
            <div>
                <h2>Users</h2>
                <pre>{JSON.stringify(users, null, 2)}</pre>
            </div>
        </div>
    );
}

export default MainApp;
