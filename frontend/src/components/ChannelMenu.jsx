import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

function ChannelMenu({ channel, onRename, onDelete }) {
  const { t } = useTranslation();
  const isDefault = channel.name === 'general';

  return (
    <Dropdown>
      <Dropdown.Toggle
        variant="link"
        className="p-0 text-secondary"
        id={`dropdown-${channel.id}`}
        size="sm"
      >
        ⋮
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item onClick={() => onRename(channel)}>
          ✏️ {t('channels.rename')}
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => onDelete(channel)}
          disabled={isDefault}
          className={isDefault ? 'text-muted' : 'text-danger'}
        >
          🗑️ {t('channels.delete')}
        </Dropdown.Item>
        {isDefault && (
          <Dropdown.Item disabled className="text-muted small">
            {t('channels.deleteDisabled')}
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ChannelMenu;
