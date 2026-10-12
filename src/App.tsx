import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { HomePage } from '@/pages/HomePage';
import { SubmitPage } from '@/pages/SubmitPage';
import { TrackPage } from '@/pages/TrackPage';
import { FollowUpPage } from '@/pages/FollowUpPage';
import { AdminPage } from '@/pages/AdminPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/track" element={<TrackPage />} />
          <Route path="/follow-up" element={<FollowUpPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
