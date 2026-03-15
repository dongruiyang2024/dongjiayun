import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Diary from './pages/Diary';
import Post from './pages/Post';
import Growth from './pages/Growth';
import Guestbook from './pages/Guestbook';
import About from './pages/About';

export default function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/diary/:id" element={<Post />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </div>
  );
}
