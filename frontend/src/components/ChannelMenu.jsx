import React, { useState } from 'react';
import { Dropdown } from 'react-bootstrap';

function ChannelMenu({ channel, onRename, onDelete }) {
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
           Переименовать...
        </Dropdown.Item>
        <Dropdown.Item
          onClick={() => onDelete(channel)}
          disabled={isDefault}
          className={isDefault ? 'text-muted' : 'text-danger'}
        >
          🗑️ Удалить
        </Dropdown.Item>
        {isDefault && (
          <Dropdown.Item disabled className="text-muted small">
            Нельзя удалить канал #general
          </Dropdown.Item>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
}

export default ChannelMenu;
