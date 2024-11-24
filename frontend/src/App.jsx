import './App.css'
import ProfileLink from './components/ProfileLink';
import Stats from './components/stats/Stats'

function App() {
  const privateRepos = import.meta.env.VITE_PRIVATE_REPOS.split(',');
  
  return (
    <>
      <ProfileLink />
      <Stats username={import.meta.env.VITE_USERNAME} token={import.meta.env.VITE_TOKEN} privateRepos={privateRepos}/>
    </>
  )
}

export default App
