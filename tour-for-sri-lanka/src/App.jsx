import './App.css'
import AdminPage from './pages/admin/AdminPage';
import {BrowserRouter, Route ,Routes} from "react-router-dom"
import HomePage from './pages/homePage';
import LoginPage from './pages/loginPage';
import {Toaster} from "react-hot-toast"

function App() {
  return (
    <BrowserRouter>
    <Toaster/>
      <Routes path="/*">
        <Route path="/login" element={<LoginPage/>}/>
        <Route path="admin/*" element={<AdminPage/>}/>
        <Route path="/*" element={<HomePage/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
