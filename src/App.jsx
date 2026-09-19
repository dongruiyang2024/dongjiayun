import { Component, lazy, Suspense } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Diary from './pages/Diary';
import Post from './pages/Post';
import Growth from './pages/Growth';
import Guestbook from './pages/Guestbook';
import About from './pages/About';
import Admin from './pages/Admin';
import GardenProvider from './components/GardenProvider';
import Projects from './pages/Projects';
import Project from './pages/Project';
import Pet from './pages/Pet';

function PostRoute() {
  const { id } = useParams();
  return <Post key={id} />;
}

const RocketLab = lazy(() => import('./pages/RocketLab'));

class RocketRouteBoundary extends Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('[rocket:route]', { error, componentStack: info.componentStack });
  }

  render() {
    if (this.state.error) {
      return (
        <section role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
          <h1>火箭实验室加载失败</h1>
          <p>三维演示未能启动，请重新加载页面。</p>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
          <button onClick={() => window.location.reload()}>重新加载</button>
        </section>
      );
    }
    return this.props.children;
  }
}

function RocketRoute() {
  return (
    <RocketRouteBoundary>
      <Suspense fallback={<p role="status">正在准备火箭实验室…</p>}>
        <RocketLab />
      </Suspense>
    </RocketRouteBoundary>
  );
}

function BlogLayout() {
  return (
    <GardenProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/diary/:id" element={<PostRoute />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<Project />} />
        <Route path="/pet" element={<Pet />} />
        <Route path="/growth" element={<Growth />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/about" element={<About />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <Footer />
    </GardenProvider>
  );
}

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/rocket" element={<RocketRoute />} />
        <Route path="/explore" element={<Navigate to="/rocket" replace />} />
        <Route path="/explore/rocket" element={<Navigate to="/rocket" replace />} />
        <Route path="/*" element={<BlogLayout />} />
      </Routes>
    </div>
  );
}
