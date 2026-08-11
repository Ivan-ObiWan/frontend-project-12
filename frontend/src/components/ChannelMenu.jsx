import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function ChannelMenu({ channel, onRename, onDelete }) {
  const { t } = useTranslation();
  const isDefault = channel.name === 'general';
  const isDark = localStorage.getItem('theme') === 'dark';

  return (
    <Dropdown>
      <Dropdown.Toggle
        as="span"
        id={`dropdown-${channel.id}`}
        className="p-0"
        style={{
          cursor: 'pointer',
          fontSize: '16px',
          padding: '0 4px',
          background: 'none',
          border: 'none',
          lineHeight: 1,
          letterSpacing: '1px',
          color: isDark ? '#adb5bd' : '#6c757d',
          opacity: 0.8,
          transition: 'opacity 0.2s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
        onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
      >
        •••
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onRename(channel)}>
          {t('channels.rename')}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => onDelete(channel)}
          disabled={isDefault}
          className={isDefault ? 'text-muted' : 'text-danger'}
        >
          {t('channels.delete')}
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ChannelMenu;
