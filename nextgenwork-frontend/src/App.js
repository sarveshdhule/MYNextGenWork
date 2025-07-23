import React, { useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import OpportunityList from './components/opportunities/OpportunityList';
import OpportunityForm from './components/opportunities/OpportunityForm';
import Profile from './components/profile/Profile';
import OpportunityDetails from './components/opportunities/OpportunityDetails';
import OpportunityEditForm from './components/opportunities/OpportunityEditForm';
import { AuthContext } from './context/AuthContext';
import GoogleSuccess from './pages/GoogleSuccess';
import Header from './components/common/Header';
import ResourceList from './components/resources/ResourceList';
import ResourceForm from './components/resources/ResourceForm';

function PrivateRoute({ children }) {
  const { token } = useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const [resources, setResources] = useState([]);

  return (
    <>
      <Header />
      <div style={{ paddingTop: 88 }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/google-success" element={<GoogleSuccess />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <OpportunityList />
              </PrivateRoute>
            }
          />
          <Route
            path="/add"
            element={
              <PrivateRoute>
                <OpportunityForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/opportunity/:id"
            element={
              <PrivateRoute>
                <OpportunityDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/opportunity/:id/edit"
            element={
              <PrivateRoute>
                <OpportunityEditForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/resources"
            element={
              <PrivateRoute>
                <ResourceList resources={resources} setResources={setResources} />
              </PrivateRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;