import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth }   from './contexts/AuthContext.jsx';
import { MedicineProvider }        from './contexts/MedicineContext.jsx';
import { ChatProvider }            from './contexts/ChatContext.jsx';

import { useMobileGuard }  from './hooks/useMobileGuard.js';
import DesktopBlock        from './components/common/DesktopBlock.jsx';

import SplashScreen   from './screens/auth/SplashScreen.jsx';
import LoginScreen    from './screens/auth/LoginScreen.jsx';
import RegisterScreen from './screens/auth/RegisterScreen.jsx';
import AuthLockScreen from './screens/auth/LockScreen.jsx';

import AdherenceHistory from './screens/shared/AdherenceHistory.jsx';
import MedicineDetail   from './screens/shared/MedicineDetail.jsx';
import DispenserView    from './screens/shared/DispenserView.jsx';
import SelfCareMode     from './screens/shared/SelfCareMode.jsx';
import { SelfCareDashboard, SelfCareAI } from './screens/selfcare/SelfCareScreens.jsx';

import SeniorDashboard               from './screens/senior/SeniorDashboard.jsx';
import { SeniorMedicines, SeniorAI, SeniorProfile } from './screens/senior/SeniorScreens.jsx';

import StandardDashboard from './screens/standard/StandardDashboard.jsx';
import { StandardMedicines, AddMedicine, StandardAI, StandardProfile }
  from './screens/standard/StandardScreens.jsx';

import {
  CaregiverDashboard, CaregiverPatients, CaregiverAlerts,
  PatientDetail, CaregiverProfile,
} from './screens/caregiver/CaregiverScreens.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RequireRole({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    const dest = user.role === 'senior' ? '/senior'
               : user.role === 'caregiver' ? '/caregiver' : '/standard';
    return <Navigate to={dest} replace />;
  }
  return children;
}

function PatientProviders({ children }) {
  return (
    <MedicineProvider>
      <ChatProvider>{children}</ChatProvider>
    </MedicineProvider>
  );
}
function CaregiverProviders({ children }) {
  return <ChatProvider>{children}</ChatProvider>;
}

function LockManager({ children }) {
  const { user } = useAuth();
  // Explicitly require user action to show lock screen; no auto-lock timer.
  const [locked, setLocked] = useState(false);

  if (locked && user?.lockType && user.lockType !== 'none') {
    return (
      <LockScreen
        user={user}
        lockType={user.lockType}
        onUnlock={() => setLocked(false)}
      />
    );
  }
  return children;
}

function AppRoutes() {
  const { isMobile } = useMobileGuard();
  if (!isMobile) return <DesktopBlock />;

  return (
    <LockManager>
      <div className="app-shell">
        <Routes>
          <Route path="/"         element={<SplashScreen />} />
          <Route path="/login"    element={<LoginScreen />} />
          <Route path="/register" element={<RegisterScreen />} />
          <Route path="/lock" element={
            <RequireAuth>
              <AuthLockScreen />
            </RequireAuth>
          } />

          <Route path="/senior" element={
            <RequireRole role="senior">
              <PatientProviders><SeniorDashboard /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/senior/medicines" element={
            <RequireRole role="senior">
              <PatientProviders><SeniorMedicines /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/senior/ai" element={
            <RequireRole role="senior">
              <PatientProviders><SeniorAI /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/senior/profile" element={
            <RequireRole role="senior">
              <PatientProviders><SeniorProfile /></PatientProviders>
            </RequireRole>
          } />

          <Route path="/standard" element={
            <RequireRole role="standard">
              <PatientProviders><StandardDashboard /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/standard/medicines" element={
            <RequireRole role="standard">
              <PatientProviders><StandardMedicines /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/standard/medicines/add" element={
            <RequireRole role="standard">
              <PatientProviders><AddMedicine /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/standard/ai" element={
            <RequireRole role="standard">
              <PatientProviders><StandardAI /></PatientProviders>
            </RequireRole>
          } />
          <Route path="/standard/profile" element={
            <RequireRole role="standard">
              <PatientProviders><StandardProfile /></PatientProviders>
            </RequireRole>
          } />

          <Route path="/caregiver" element={
            <RequireRole role="caregiver">
              <CaregiverProviders><CaregiverDashboard /></CaregiverProviders>
            </RequireRole>
          } />
          <Route path="/caregiver/patients" element={
            <RequireRole role="caregiver">
              <CaregiverProviders><CaregiverPatients /></CaregiverProviders>
            </RequireRole>
          } />
          <Route path="/caregiver/patients/:id" element={
            <RequireRole role="caregiver">
              <CaregiverProviders><PatientDetail /></CaregiverProviders>
            </RequireRole>
          } />
          <Route path="/caregiver/alerts" element={
            <RequireRole role="caregiver">
              <CaregiverProviders><CaregiverAlerts /></CaregiverProviders>
            </RequireRole>
          } />
          <Route path="/caregiver/profile" element={
            <RequireRole role="caregiver">
              <CaregiverProviders><CaregiverProfile /></CaregiverProviders>
            </RequireRole>
          } />

          <Route path="/medicines/:id" element={
            <RequireAuth>
              <PatientProviders><MedicineDetail /></PatientProviders>
            </RequireAuth>
          } />
          <Route path="/history" element={
            <RequireAuth>
              <PatientProviders><AdherenceHistory /></PatientProviders>
            </RequireAuth>
          } />
          <Route path="/dispenser" element={
            <RequireAuth>
              <PatientProviders><DispenserView /></PatientProviders>
            </RequireAuth>
          } />
          <Route path="/selfcare" element={
            <RequireAuth>
              <PatientProviders><SelfCareDashboard /></PatientProviders>
            </RequireAuth>
          } />
          <Route path="/selfcare/ai" element={
            <RequireAuth>
              <PatientProviders><SelfCareAI /></PatientProviders>
            </RequireAuth>
          } />
          <Route path="/selfcare/mode" element={
            <RequireAuth>
              <PatientProviders><SelfCareMode /></PatientProviders>
            </RequireAuth>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </LockManager>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
