import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { removeChannel } from '../slices/channelsSlice';

function DeleteChannelModal({ show, onHide, channel }) {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.channels);

  if (!channel) return null;

  const handleDelete = async () => {
    try {
      await dispatch(removeChannel(channel.id)).unwrap();
      onHide();
    } catch (error) {
      console.error('❌ Error deleting channel:', error);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Удалить канал</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>Вы уверены, что хотите удалить канал <strong>#{channel.name}</strong>?</p>
        <p className="text-muted small">Все сообщения в этом канале будут удалены.</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          Отменить
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? 'Удаление...' : 'Удалить'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteChannelModal;
