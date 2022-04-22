import './App.css';
import FileArchivePage from './pages/FileArchivePage';
import { Routes, Route, BrowserRouter, Outlet, Link } from "react-router-dom"
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="App page-bg min-h-full">
      <div class="glass py-2 px-4 flex items-center sticky top-0 z-10">
        <h1 className="inline-block  text-lg font-bold">ga-bot</h1>
        <div class="flex gap-4 ml-8">
          <a>Login</a>
          <a>Chat Archive</a>
          <a>File Archive</a>
          <a>Emergency Chat</a>
        </div>
        <div className="flex-grow" />
        <select name="pets" id="pet-select">
            <option value="">Select a group chat</option>
            <option value="dog">lorem Ipsum</option>
            <option value="cat">Dolor Sit Amet</option>
            <option value="hamster">Consectetur</option>
        </select>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="file-archive" element={<FileArchivePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
