import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/api'

export default function Register(){
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        try {
            const res = await API.post('/auth/register', { username, email, password })
            console.log(res)

            // On success, FastAPI returns a message
            navigate('/login')
        } catch (err) {
            setError(err.response?.data?.detail || err.response?.data?.message || 'Registration failed. Please try again.')
        }
    }

    return (
        <div>
            <h1>Register</h1>
            <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                {error && <p role="alert">{error}</p>}
            </form>
        </div>
    )
}