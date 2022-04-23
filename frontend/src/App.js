import './App.css';
import FileArchivePage from './pages/FileArchivePage';
import { Routes, Route, BrowserRouter, Outlet, Link } from "react-router-dom"
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import { useEffect, useRef, useState } from 'react';
import { QueryClientProvider, useQueryClient, QueryClient, useQuery } from "react-query"

function App() {
  const [selectedGroupChatId, setSelectedGroupChatId] = useState("")

  const client = useQueryClient()

  const { data, isLoading, isError } = useQuery('group-chat-ids', 
    async () => await (await fetch('/api/auth/group-chats')).json())

  useEffect(() => {
    client.invalidateQueries('archive')
  }, [selectedGroupChatId])

  return (
    <div className="App page-bg min-h-full">
      <div className="glass py-2 px-4 flex items-center sticky top-0 z-10">
        <h1 className="inline-block  text-lg font-bold">ga-bot</h1>
        <div className="flex gap-4 ml-8">
          <a href="/login">Login</a>
          <a href="/chat-archive">Chat Archive</a>
          <a href="file-archive">File Archive</a>
          <a href="emergency-chat">Emergency Chat</a>
        </div>
        <div className="flex-grow" />
        {isError
          ? <p>Error fetching group chats</p>
          : <select defaultValue={selectedGroupChatId} onChange={(event) => {
              event.preventDefault()
              setSelectedGroupChatId(event.target.value)
            }}>
              {isLoading
                ? <option>Loading...</option>
                : <>
                  <option value="">Select a group chat</option>
                    {
                      data.groupChats.map(({ groupId, groupName }) => (
                        <option key={groupId} value={groupId}>{groupName}</option>
                      ))
                    }
                  </>
              }
            </select>
        }
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="login" element={<LoginPage />} />
          <Route path="file-archive" element={<FileArchivePage groupChatId={selectedGroupChatId} />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>    
    </div>
  );
}

export default App;
