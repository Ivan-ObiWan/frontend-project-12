import React, { useEffect, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { renameChannel } from '../slices/channelsSlice';

function RenameChannelModal({ show, onHide, channel }) {
  const { t } = useTranslation();
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
      .required(t('validation.required'))
      .min(3, t('validation.channelName.min'))
      .max(20, t('validation.channelName.max'))
      .matches(/^[a-zA-Z0-9а-яА-Я-]+$/, t('validation.usernameChars'))
      .test('unique', t('validation.channelName.unique'), function (value) {
        const currentChannels = this.options.context?.channels || [];
        return !currentChannels.some((c) => c.name === value && c.id !== channel.id);
      }),
  });

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await dispatch(renameChannel({ id: channel.id, name: values.name })).unwrap();
      toast.success(t('channels.renameSuccess', { name: values.name }));
      onHide();
    } catch (error) {
      console.error('❌ Error renaming channel:', error);
      toast.error(t('errors.renameChannel'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('channels.rename')}</Modal.Title>
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
                <Form.Label>{t('channels.renameLabel')}</Form.Label>
                <Field
                  name="name"
                  type="text"
                  className="form-control"
                  placeholder={t('channels.renamePlaceholder')}
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
                {t('channels.cancel')}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading ? t('auth.loading') : t('channels.renameButton')}
              </Button>
            </Modal.Footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default RenameChannelModal;
