import React, { useEffect, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import { setAuthData, setError, setLoading } from '../slices/authSlice';

const SignupSchema = Yup.object().shape({
  username: Yup.string()
    .required('Обязательное поле')
    .min(3, 'От 3 до 20 символов')
    .max(20, 'От 3 до 20 символов')
    .matches(/^[a-zA-Z0-9а-яА-Я-]+$/, 'Только буквы, цифры и дефис'),
  password: Yup.string()
    .required('Обязательное поле')
    .min(6, 'Не менее 6 символов'),
  confirmPassword: Yup.string()
    .required('Обязательное поле')
    .oneOf([Yup.ref('password')], 'Пароли должны совпадать'),
});

function SignupPage() {
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

  const handleSubmit = async (values, { setSubmitting }) => {
    dispatch(setLoading());
    
    try {
      const response = await axios.post('/api/v1/signup', {
        username: values.username,
        password: values.password,
      });

      const { token, user } = response.data;
      dispatch(setAuthData({ token, user }));
      setSubmitting(false);
    } catch (err) {
      if (err.response?.status === 409) {
        dispatch(setError('Пользователь с таким именем уже существует'));
      } else {
        const errorMessage = err.response?.data?.message || 'Ошибка регистрации';
        dispatch(setError(errorMessage));
      }
      setSubmitting(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h1 className="text-center mb-4">Hexlet Chat</h1>
      <h2 className="text-center mb-4">Регистрация</h2>
      
      <Formik
        initialValues={{ username: '', password: '', confirmPassword: '' }}
        validationSchema={SignupSchema}
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
              <label htmlFor="username" className="form-label">Имя пользователя</label>
              <Field
                type="text"
                name="username"
                id="username"
                className="form-control"
                placeholder="Введите имя пользователя"
                innerRef={inputRef}
                disabled={isSubmitting || isLoading}
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
                disabled={isSubmitting || isLoading}
              />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Подтверждение пароля</label>
              <Field
                type="password"
                name="confirmPassword"
                id="confirmPassword"
                className="form-control"
                placeholder="Подтвердите пароль"
                disabled={isSubmitting || isLoading}
              />
              <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </Form>
        )}
      </Formik>
      
      <p className="mt-3 text-center">
        Уже есть аккаунт? <Link to="/login">Войти</Link>
      </p>
    </div>
  );
}

export default SignupPage;
