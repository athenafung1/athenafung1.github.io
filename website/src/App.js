import React, { Component } from 'react'
import Sidebar from './components/sidebar'
import HomePage from './components/home'
import AboutPage from './components/about'
import ProjectsPage from './components/projects'
import AdventuresPage from './components/adventures'


// import logo from './logo.svg';
import './App.css';

class App extends Component {
  render() {
    return (
      <div className="page">
        <Sidebar></Sidebar>
        <div id="main-content">
          <HomePage></HomePage>
          <AboutPage></AboutPage>
          <ProjectsPage></ProjectsPage>
          <AdventuresPage></AdventuresPage>
        </div>
      </div>
    )
  }
}

// function App() {
//   return (
//     <div className="App">
//       <header className="App-header">
//         <img src={logo} className="App-logo" alt="logo" />
//         <p>
//           Edit <code>src/App.js</code> and save to reload.
//         </p>
//         <a
//           className="App-link"
//           href="https://reactjs.org"
//           target="_blank"
//           rel="noopener noreferrer"
//         >
//           Learn React
//         </a>
//       </header>
//     </div>
//   );
// }

export default App;
