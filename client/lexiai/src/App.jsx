import React from 'react'
import { BrowserRouter as Router,Routes,Route,Navigate } from 'react-router-dom'
import LoginPage from './pages/Auth/LoginPage.jsx'
import SignupPage from './pages/Auth/SignupPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import DashboardPage from './pages/Dashboard/DashboardPage.jsx'
import DocumentListPage from './pages/Documents/DocumentListPage.jsx'
import DocumentDetailPage from './pages/Documents/DocumentDetailPage.jsx'
import FlashcardListPage from './pages/Flashcards/FlashcardListPage.jsx'
import FlashcardPage from './pages/Flashcards/FlashcardPage.jsx'
import QuizAttemptPage from './pages/Quizzes/QuizAttemptPage.jsx'
import QuizResultPage from './pages/Quizzes/QuizResultPage.jsx'
import ProfilePage from './pages/Profile/ProfilePage.jsx'
import ProtectedRoute from './components/auth/ProtectedRoute.jsx'
import {useAuth} from './context/useAuth.js'

const App = () => {
  const {isAuthenticated,loading} = useAuth();
  
  if (loading) {
    return <div className='flex items-center justify-center h-screen'><p>Loading...</p></div>;
  }
  return <Router>
    <Routes>
      <Route path = '/' element = {isAuthenticated ? <Navigate to = "/dashboard" replace /> : <Navigate to = "/login" replace/>} />
      <Route path = '/login' element = {<LoginPage/>} />
      <Route path = '/signup' element = {<SignupPage/>} />
      <Route element = {<ProtectedRoute/>}>
        <Route path = '/dashboard' element = {<DashboardPage/>} />
        <Route path = '/documents' element = {<DocumentListPage/>}/>
        <Route path='/documents/:id' element={<DocumentDetailPage/>} />
        <Route path = '/flashcards' element = {<FlashcardListPage/>}/>
        <Route path = '/documents/:id/flashcards' element = {<FlashcardPage/>}/>
        <Route path = '/quizzes/:quizId' element = {<QuizAttemptPage/>}/>
        <Route path = '/quizzes/:quizId/results' element = {<QuizResultPage/>}/>
        <Route path = '/profile' element = {<ProfilePage/>}/>
      </Route>
      <Route path = '*' element = {<NotFoundPage/>} />
    </Routes>
  </Router>
}

export default App