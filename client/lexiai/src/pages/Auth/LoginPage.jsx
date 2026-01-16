import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/useAuth.js'
import authService from '../../services/authService.js'
import { BrainCircuit, Mail, Lock, Eye, EyeOff,ArrowRight } from 'lucide-react'
import { toast } from 'react-hot-toast'

const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, user } = await authService.login({ email, password })
      login({ token, user })
      toast.success('Login successful!')
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.')
      toast.error('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='text flex justify-center min-h-screen bg-linear-to-r from-slate-50 mt-30'>
      <div className='absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] opacity-30'/>
        <div className='relative w-full max-w-md px-6'>
          <div className='bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-xl shadow-slate-200/60 p-10'>
            <div className='text-center mb-10'>
              <div className='inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-linear-to-br from-emerald-300 to-teal-400 shadow shadow-emerald-500/25 mb-6'>
                <BrainCircuit size={48} className='w-7 h-7 text-gray-100' />
              </div>
                <h1 className='text-2xl font-medium text-slate-900 tracking-tight mb-2'>Welcome Back</h1>
                <p className='text-slate-500 text-sm'>Sign in to Continue your journey</p>
            </div>
        {/* form section */}
          <div className='space-y-5'>
            {/* email section */}
            <div className='space-y-2'>
              <label className = 'block text-xs font-semibold text-slate-700 uppercase tracking-wide'>
                Email
              </label>
              <div className="">
                <div className = {`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 
                  ${focused === 'email' ? 'text-emerald-300' : 'text-slate-400'}  `}>
                  <Mail size={16} />
                  </div>
                <input 
                  type = 'email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFouces={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder='you@example.com'
                  className=''
                />
              </div>

            </div>

            {/* password section */}
            <div className=''>
              <label>
                password
              </label>
              <div className="">
                <div className = {`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors duration-200 
                  ${focused === 'email' ? 'text-emerald-300' : 'text-slate-400'}  `}>
                  <Lock size={16} />
                  </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFouces={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder='Enter your password'
                  className=''
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className=''  
                />
                  


            </div>


        </div>
        {error && <div className=''>
          <p></p>
          </div>}

        <button onClick={handleSubmit} disabled={loading} className=''>
          <span className=''>
            {loading ? (
              <>
              <div className=''/>
              'Signing In ...'
              </>) : 
              (
                <>
                'Sign In'
                <ArrowRight />
                </>
              )
              }
          </span>
        </button>
      </div>
      {/* footer section */}
      <div className=''>
        <p>
          Don't have an account?{' '}
          <Link to='/register' className=''>
            Sign Up
          </Link>
        </p>
      </div>
    </div>
    <p className=''>
      By Continuing , you agree to our Terms & Privacy Policy
    </p>
  </div>
  </div>

    
  )
}

export default LoginPage
