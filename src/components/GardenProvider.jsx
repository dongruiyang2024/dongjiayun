import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { GardenContext } from '../lib/garden';

export default function GardenProvider({ children }) {
  const [garden, setGarden] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.garden.get().then(setGarden).catch((err) => setError(err.message)); }, []);
  return <GardenContext.Provider value={{ garden, setGarden, error }}>
    {error && <p role="alert" className="comment-error">成长档案加载失败：{error}。请刷新重试。</p>}
    {children}
  </GardenContext.Provider>;
}
