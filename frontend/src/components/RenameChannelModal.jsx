import React, { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { renameChannel } from '../slices/channelsSlice';

function RenameChannelModal({ show, onHide, channel }) {
  const dispatch = useDispatch();
  const { channels, isLoading } = useSelector((state) => state.channels);
  const inputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [show]);

  if (!channel) return null;

  const validationSchema = Yup.object().shape({
    name: Yup.string()
      .required('Обязательное поле')
      .min(3, 'От 3 до 20 символов')
      .max(20, 'От 3 до 20 символов')
      .matches(/^[a-zA-Z0-9а-яА-Я-]+$/, 'Только буквы, цифры и дефис')
      .test('unique', 'Канал с таким именем уже существует', function (value) {
        const currentChannels = this.options.context?.channels || [];
        return !currentChannels.some((c) => c.name === value && c.id !== channel.id);
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(renameChannel({ id: channel.id, name: values.name })).unwrap();
      onHide();
    } catch (error) {
      console.error('❌ Error renaming channel:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Переименовать канал</Modal.Title>
      </Modal.Header>
      <Formik
        initialValues={{ name: channel.name }}
        validationSchema={validationSchema}
        context={{ channels }}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              <Form.Group>
                <Form.Label>Новое имя канала</Form.Label>
                <Field
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder="Введите новое имя"
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
              >
                {isSubmitting || isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default RenameChannelModal;
