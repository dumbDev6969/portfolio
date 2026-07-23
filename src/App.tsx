import './App.css'
import { Nav } from './components/nav'
import { Hero, About, Projects, Certifications } from './components/sections'

function App() {
  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--text-primary)] flex flex-col items-center">
      <Nav />
      <Hero />
      <About />
      <Projects />
      <Certifications />
    </div>
  );
}

export default App
