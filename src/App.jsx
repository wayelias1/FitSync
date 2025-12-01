import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Landing } from './pages/Landing.jsx'
import { Register } from './pages/Register.jsx'
import { Login } from './pages/Login.jsx'
import { IndexPage } from './pages/IndexPage.jsx'
import { Profile } from './pages/Profile.jsx'
import EliminateUserPage from './pages/EliminateUserPage.jsx'
import { Settings } from './pages/Settings.jsx'
import Payment from './pages/Payment';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// ⬅️ Lee credenciales desde .env
const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;

function App() {
  return (
    <PayPalScriptProvider
        options={{
          'client-id': 'AQZLXBc1RlowGQYKpcqmy_YWkpTQn078zDW8-vjYl0S92kOvtniPOj1uho6r-4jcqAQGgdZafkh0cnK8',
          'buyer-country': 'US',
          'disable-funding': 'credit',
          'intent': 'capture',
          'commit': 'true'
            }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<IndexPage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/eliminate-user" element={<EliminateUserPage />} />
          <Route path="/settings" element={<Settings />} />
       
          <Route path="/payment" element={ <Payment /> } />
        </Routes>
      </BrowserRouter>
    </PayPalScriptProvider>
  )
}

export default App