import { Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from "react";
import PageTitle from './components/page-title';
import Signin from './pages/Authentication/Signin';
import Signup from './pages/Authentication/Signup';
import { ResetPassword } from './pages/Authentication/ResetPassword';
import { auth } from './lib/firebase';
import { onIdTokenChanged } from 'firebase/auth';
import { Loader } from './components/ui/loader';
import DefaultLayout from './layout/DefaultLayout';
import { useDispatch } from 'react-redux';
import { setUser } from './redux/features/slice/userSlice';

function App() {
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      if (user) {
        const token = await user.getIdToken(); // always fresh
        const userData = {
          providerData: user.providerData,
          accessToken: token,
        };
        dispatch(setUser(userData));
        setIsAuthorized(true);
      } else {
        setIsAuthorized(false);
      }
    });
    return () => unsubscribe();
  }, [dispatch]);

  if (isAuthorized === null) {
    return <Loader size={40} />;
  }

  return (
    <Routes>
      {!isAuthorized ? (
        <>
          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Sign In" />
                <Signin />
              </>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <>
                <PageTitle title="Sign Up" />
                <Signup />
              </>
            }
          />
          <Route
            path="/api/trainer/password-reset/:userId/:token"
            element={
              <>
                <PageTitle title="Reset Password" />
                <ResetPassword />
              </>
            }
          />
          <Route path="*" element={<Navigate to="/auth/signin" replace />} />
        </>
      ) : (
        <Route path="/*" element={<DefaultLayout />} />
      )}
    </Routes>
  );
}

export default App