import { useEffect, useState } from 'react'
import API from '../api/api'

export default function Homepage() {
    const [employees, setEmployees] = useState([])
    const [error, setError] = useState('')
    const username = localStorage.getItem('username') || 'Unknown'

    useEffect(() => {
        API.get('/employees/')
            .then((res) => setEmployees(res.data))
            .catch((err) => setError(err.response?.data?.detail || 'Failed to load employees.'))
    }, [])

    return (
        <div>
            <h2>Welcome, {username}</h2>

            <h1>Employees</h1>

            {error && <p role="alert">{error}</p>}

            <table border="1" cellPadding="8" cellSpacing="0">
                <thead>
                    <tr>
                        <th>Employee ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Position</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Created At</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp) => (
                        <tr key={emp.employeeId}>
                            <td>{emp.employeeId}</td>
                            <td>{emp.name}</td>
                            <td>{emp.email}</td>
                            <td>{emp.position}</td>
                            <td>{emp.department}</td>
                            <td>{emp.status}</td>
                            <td>{emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : '—'}</td>
                        </tr>
                    ))}
                    {employees.length === 0 && !error && (
                        <tr>
                            <td colSpan="7">No employees found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    )
}