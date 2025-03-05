import { Navigate, Route, Routes} from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { getUserRole,isAuthenticated } from './utils/auth';
import Admin from './pages/Admin';
import AdminEdit from './pages/AdminEdit';
import { Toaster } from './components/ui/sonner';

function PrivateRoute({ children, allowedRoles }: { children: JSX.Element, allowedRoles: string[] }) {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  const userRole = getUserRole();

  // If userRole is missing or not in the allowedRoles list, redirect
  if (!userRole || !allowedRoles.includes(userRole)) {
    return <Navigate to="/home" replace />;
  }
  return children;
}


function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<PrivateRoute allowedRoles={["user", "admin"]}><Home /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute allowedRoles={["admin"]}><Admin /></PrivateRoute>} />
        <Route path="/admin-edit" element={<PrivateRoute allowedRoles={["admin"]}><AdminEdit /></PrivateRoute>} />
      </Routes>
      <Toaster richColors visibleToasts={3} toastOptions={{ duration: 1000 }} />
    </>
  );
}

export default App;
