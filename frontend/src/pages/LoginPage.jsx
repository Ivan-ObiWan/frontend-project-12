import { useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import axios from 'axios';
import { setAuthData, setError, setLoading } from '../slices/authSlice';

function LoginPage() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { token, error, isLoading } = useSelector((state) => state.auth);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    return () => {
      dispatch(setError(null));
    };
  }, [dispatch]);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const LoginSchema = Yup.object().shape({
    username: Yup.string().required(t('validation.required')),
    password: Yup.string().required(t('validation.required')),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(setLoading());
    
    try {
      const response = await axios.post('/api/v1/login', {
        username: values.username,
        password: values.password,
      });

      const { token, user } = response.data;
      dispatch(setAuthData({ token, user }));
      toast.success(t('auth.loginSuccess', { username: user.username }));
      setSubmitting(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || t('auth.loginError');
      dispatch(setError(errorMessage));
      setSubmitting(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: '#0a0a0f',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundImage: `url('/chat-banner.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        zIndex: 0,
        transform: 'scale(1.1)',
      }} />
      
      <div className="container" style={{ maxWidth: '480px', position: 'relative', zIndex: 1 }}>
        <div className="text-center mb-4">
          <img 
            src="/chat-banner.jpg" 
            alt="Hexlet Chat" 
            className="img-fluid rounded-4 shadow-xl"
            style={{ 
              width: '100%',
              maxHeight: '280px',
              objectFit: 'cover',
              border: '2px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            }}
          />
        </div>

        <Link to="/" className="text-decoration-none">
          <h1 className="text-center text-white mb-4" style={{ 
            fontWeight: 300, 
            fontSize: '2.8rem', 
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
            letterSpacing: '2px',
            cursor: 'pointer',
          }}>
            {t('app.title')}
          </h1>
        </Link>
        
        <div className="card bg-dark bg-opacity-90 border-0 shadow-2xl" style={{ 
          backdropFilter: 'blur(12px)',
          boxShadow: '0 25px 80px rgba(0,0,0,0.9)',
          borderRadius: '16px',
        }}>
          <div className="card-body p-5">
            <h2 className="text-center text-white mb-4" style={{ 
              fontWeight: 300, 
              fontSize: '1.8rem',
              letterSpacing: '1px',
            }}>
              {t('auth.loginTitle')}
            </h2>
            
            <Formik
              initialValues={{ username: '', password: '' }}
              validationSchema={LoginSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form>
                  {error && (
                    <div className="alert alert-danger" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label text-light-50">{t('auth.username')}</label>
                    <Field
                      type="text"
                      name="username"
                      id="username"
                      className="form-control"
                      placeholder={t('auth.usernamePlaceholder')}
                      innerRef={inputRef}
                      disabled={isSubmitting || isLoading}
                      style={{
                        backgroundColor: 'rgba(20,20,30,0.8)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                    />
                    <ErrorMessage name="username" component="div" className="text-danger" />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label text-light-50">{t('auth.password')}</label>
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      className="form-control"
                      placeholder={t('auth.passwordPlaceholder')}
                      disabled={isSubmitting || isLoading}
                      style={{
                        backgroundColor: 'rgba(20,20,30,0.8)',
                        borderColor: 'rgba(255,255,255,0.08)',
                        color: '#fff',
                      }}
                    />
                    <ErrorMessage name="password" component="div" className="text-danger" />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary w-100 py-2"
                    disabled={isSubmitting || isLoading}
                    style={{ 
                      fontWeight: 500,
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      border: 'none',
                    }}
                  >
                    {isLoading ? t('auth.loading') : t('auth.loginButton')}
                  </button>
                </Form>
              )}
            </Formik>
            
            <p className="mt-3 text-center text-light-50" style={{ color: 'rgba(255,255,255,0.6)' }}>
              {t('auth.noAccount')} <Link to="/signup" className="text-primary text-decoration-none fw-bold">Регистрация</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
