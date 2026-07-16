import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import AddProduct from './pages/AddProduct';
import Calendar from './pages/Calendar';
import Photos from './pages/Photos';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';

function AnimatedRoutes() {
  const loc = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={loc.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={loc}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddProduct />} />
          <Route path="/edit/:id" element={<AddProduct />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/photos" element={<Photos />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <div className="mx-auto max-w-md min-h-screen relative bg-gradient-warm shadow-2xl">
        <AnimatedRoutes />
        <BottomNav />
      </div>
    </BrowserRouter>
  );
}

export default App;
