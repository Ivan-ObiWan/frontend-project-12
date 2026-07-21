import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Link } from 'react-router-dom';

// Схема валидации
const LoginSchema = Yup.object().shape({
  username: Yup.string()
    .required('Обязательное поле'),
  password: Yup.string()
    .required('Обязательное поле')
    .min(6, 'Не менее 6 символов'),
});

function LoginPage() {
  const handleSubmit = (values, { setSubmitting }) => {
    // Пока просто выводим в консоль
    console.log('Данные для входа:', values);
    alert('Форма отправлена! (логика пока не реализована)');
    setSubmitting(false);
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
              disabled={isSubmitting}
            >
              Войти
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
