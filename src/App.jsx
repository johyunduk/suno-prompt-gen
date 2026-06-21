import { useState } from 'react';
import './App.css';
import { scrollIntoViewA11y } from './lib/scroll';
import Hero from './components/Hero';
import Nav from './components/Nav';
import Basics from './components/sections/Basics';
import Builder from './components/sections/Builder';
import MetaTags from './components/sections/MetaTags';
import Genres from './components/sections/Genres';
import Structure from './components/sections/Structure';
import Tips from './components/sections/Tips';

const SECTIONS = {
  basics: Basics,
  builder: Builder,
  metatags: MetaTags,
  genres: Genres,
  structure: Structure,
  tips: Tips,
};

function App() {
  const [active, setActive] = useState('builder');

  const handleNav = (id) => {
    setActive(id);
    scrollIntoViewA11y(document.getElementById('main'));
  };

  const Section = SECTIONS[active];

  return (
    <>
      <Hero onNav={handleNav} />
      <Nav active={active} onNav={handleNav} />
      <main className={`main-content ${active === 'builder' ? 'main-content--wide' : ''}`}>
        <Section />
      </main>
      <div style={{ height: '6rem' }} />
    </>
  );
}

export default App;
