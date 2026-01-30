import Layout from './layout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Guardian from './pages/Guardian'


const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
           <Route path="/guardian" element={<Guardian />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
