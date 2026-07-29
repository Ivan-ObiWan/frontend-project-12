import React, { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { addChannel } from '../slices/channelsSlice';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .required('Обязательное поле')
    .min(3, 'От 3 до 20 символов')
    .max(20, 'От 3 до 20 символов')
    .matches(/^[a-zA-Z0-9а-яА-Я-]+$/, 'Только буквы, цифры и дефис')
    .test('unique', 'Канал с таким именем уже существует', function (value) {
      const channels = this.options.context?.channels || [];
      return !channels.some((c) => c.name === value);
    }),
});

function AddChannelModal({ show, onHide }) {
  console.log('🔍 AddChannelModal render, show:', show);
  const dispatch = useDispatch();
  const { channels, isLoading } = useSelector((state) => state.channels);
  const inputRef = useRef(null);

  useEffect(() => {
    console.log('🔍 AddChannelModal useEffect, show:', show);
    if (show) {
      setTimeout(() => {
        console.log('🔍 Focusing input...');
        inputRef.current?.focus();
      }, 100);
    }
  }, [show]);

  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log('📤 [handleSubmit] НАЖАТА КНОПКА СОЗДАТЬ!', values);
    console.log('📤 [handleSubmit] Channel name:', values.name);
    
    if (!values.name.trim()) {
      console.log('❌ [handleSubmit] Имя пустое');
      return;
    }

    try {
      console.log('📤 [handleSubmit] Dispatching addChannel...');
      const result = await dispatch(addChannel({ name: values.name })).unwrap();
      console.log('✅ [handleSubmit] Канал создан:', result);
      resetForm();
      onHide();
    } catch (error) {
      console.error('❌ [handleSubmit] Ошибка:', error);
      console.error('❌ [handleSubmit] Error response:', error.response);
      alert('Ошибка: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
      console.log('📤 [handleSubmit] setSubmitting(false)');
    }
  };

  const handleButtonClick = () => {
    console.log('🖱️ Кнопка Создать нажата (onClick)');
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Добавить канал</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{ name: '' }}
        validationSchema={validationSchema}
        context={{ channels }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, handleSubmit, errors, touched, values }) => {
          console.log('📝 Formik render:', { isSubmitting, values, errors, touched });
          return (
            <Form onSubmit={handleSubmit}>
              <Modal.Body>
                <Form.Group>
                  <Form.Label>Имя канала</Form.Label>
                  <Field
                    name="name"
                    type="text"
                    className="form-control"
                    placeholder="Введите имя канала"
                    innerRef={inputRef}
                    disabled={isSubmitting || isLoading}
                  />
                  <ErrorMessage
                    name="name"
                    component="div"
                    className="text-danger mt-1"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={isSubmitting || isLoading}>
                  Отменить
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSubmitting || isLoading}
                  onClick={handleButtonClick}
                >
                  {isSubmitting || isLoading ? 'Создание...' : 'Создать'}
                </Button>
              </Modal.Footer>
            </Form>
          );
        }}
      </Formik>
    </Modal>
  );
}

export default AddChannelModal;
