import Layout from './layout'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signin from './pages/Signin'
import Signup from './pages/Signup'
import Guardian from './pages/Guardian'
import Mypage_BoHoZa from './pages/Mypage_BoHoZa'
import Mypage_PeBoHoZa from './pages/Mypage_PeBoHoZa'
import Fall_LOG from './pages/Fall_log'

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Signin />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/guardian" element={<Guardian />} />
          <Route path="/mypage1" element={<Mypage_BoHoZa />} />
          <Route path="/mypage2" element={<Mypage_PeBoHoZa />} />
          <Route path="/falllog" element={<Fall_LOG />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
