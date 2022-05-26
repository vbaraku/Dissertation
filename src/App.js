import "./App.css";
import {
	BrowserRouter as Router,
	Route,
	Redirect,
	Routes,
} from "react-router-dom";
import Home from './Home';
import EncryptionTools from "./EncryptionTools";
import History from "./History";

function App() {
  return (
    <Router>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/tools" element={<EncryptionTools/>}/>
          <Route exact path="/history" element={<History/>}/>
        </Routes>
    </Router>
  );
}

export default App;


