import { Navigate, Route, Routes} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { isAuthenticated } from './utils/auth';
import Admin from './pages/Admin';
import AdminEdit from './pages/AdminEdit';

function PrivateRoute({ children }: { children: JSX.Element }) {
   return isAuthenticated() ? children : <Navigate to="/" replace />;
  // return isAuthenticated() ? children : children;
}

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute><Admin /></PrivateRoute>} />
        <Route path="/admin-edit" element={<PrivateRoute><AdminEdit /></PrivateRoute>} />
      </Routes>
    </>
  );
}

export default App;
