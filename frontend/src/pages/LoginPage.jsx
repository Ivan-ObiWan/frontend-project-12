import React, { useEffect } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setAuthData, setError, setLoading } from '../slices/authSlice';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Обязательное поле'),
  password: Yup.string().required('Обязательное поле'),
});

function LoginPage() {
  const dispatch = useDispatch();
  const { token, error, isLoading } = useSelector((state) => state.auth);

  // Если уже авторизован — редирект в чат
  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(setLoading());
    
    try {
      const response = await axios.post('/api/v1/login', {
        username: values.username,
        password: values.password,
      });

      const { token, user } = response.data;
      dispatch(setAuthData({ token, user }));
      setSubmitting(false);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Ошибка авторизации';
      dispatch(setError(errorMessage));
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h1 className="text-center mb-4">Hexlet Chat</h1>
      <h2 className="text-center mb-4">Войти</h2>
      
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
              <label htmlFor="username" className="form-label">Ваш ник</label>
              <Field
                type="text"
                name="username"
                id="username"
                className="form-control"
                placeholder="Введите ник"
              />
              <ErrorMessage name="username" component="div" className="text-danger" />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Пароль</label>
              <Field
                type="password"
                name="password"
                id="password"
                className="form-control"
                placeholder="Введите пароль"
              />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? 'Загрузка...' : 'Войти'}
            </button>
          </Form>
        )}
      </Formik>
      
      <p className="mt-3 text-center">
        Нет аккаунта? <Link to="/register">Регистрация</Link>
      </p>
    </div>
  );
}

export default LoginPage;
