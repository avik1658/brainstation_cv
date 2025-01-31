import { Route, Routes} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { isAuthenticated } from './utils/auth';

function PrivateRoute({ children }: { children: JSX.Element }) {
  // return isAuthenticated() ? children : <Navigate to="/" replace />;
  return isAuthenticated() ? children : children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default App;
