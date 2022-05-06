import "./App.css";
import {
	BrowserRouter as Router,
	Route,
	Redirect,
	Routes,
} from "react-router-dom";
import Home from './Home';
import EncryptionTools from "./EncryptionTools";

function App() {
  return (
    <Router>
        <Routes>
          <Route exact path="/" element={<Home/>}/>
          <Route exact path="/tools" element={<EncryptionTools/>}/>
        </Routes>
    </Router>
  );
}

export default App;


