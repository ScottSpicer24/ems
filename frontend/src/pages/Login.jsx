// src/pages/Login.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../api/api'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      // Call FastAPI directly so local dev doesn't depend on Vite proxy config.
      // Backend expects: { username, password }
      const res = await API.post('/auth/login', { username, password })

      // On success, FastAPI returns an access token (and we also include role).
      localStorage.setItem('token',    res.data.access_token)
      localStorage.setItem('role',     res.data.role)
      localStorage.setItem('username', username)
      navigate('/homepage')
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.message || 'Login failed. Please try again.')
    }
  }

  return (
    <div>
      <h1>Employee Login</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
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

        <button
          type="submit"
        >
          Login
        </button>

        <button
          type="button"
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </form>

      {error && <p role="alert">{error}</p>}
    </div>
  )
}