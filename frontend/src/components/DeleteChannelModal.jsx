import { Modal, Button } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { removeChannel } from '../slices/channelsSlice';

function DeleteChannelModal({ show, onHide, channel }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.channels);

  if (!channel) return null;

  const handleDelete = async () => {
    try {
      await dispatch(removeChannel(channel.id)).unwrap();
      toast.success(t('channels.deleteSuccess', { name: channel.name }));
      onHide();
    } catch (error) {
      console.error('❌ Error deleting channel:', error);
      toast.error(t('errors.deleteChannel'));
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{t('channels.delete')}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{t('channels.deleteConfirm', { name: channel.name })}</p>
        <p className="text-muted small">{t('channels.deleteWarning')}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isLoading}>
          {t('channels.cancel')}
        </Button>
        <Button
          variant="danger"
          onClick={handleDelete}
          disabled={isLoading}
        >
          {isLoading ? t('auth.loading') : t('channels.deleteButton')}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default DeleteChannelModal;
