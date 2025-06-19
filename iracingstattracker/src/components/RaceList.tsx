import React, { memo, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { RaceEntry } from '../types/race';
import { useRaces } from '../hooks/useRaces';

interface RaceItemProps {
  race: RaceEntry;
  onEdit: (race: RaceEntry) => void;
}

const RaceItem = memo(({ race, onEdit }: RaceItemProps) => {
  const { deleteRace } = useRaces();

  const handleDelete = useCallback(() => {
    deleteRace(race.id);
  }, [deleteRace, race.id]);

  const handleEdit = useCallback(() => {
    onEdit(race);
  }, [onEdit, race]);

  return (
    <ListItem>
      <ListItemText
        primary={race.title}
        secondary={
          <>
            <Typography component="span" variant="body2" color="textSecondary">
              {new Date(race.date).toLocaleDateString()}
            </Typography>
            <br />
            <Typography component="span" variant="body2" color="textSecondary">
              Track: {race.track.name}
            </Typography>
          </>
        }
      />
      <ListItemSecondaryAction>
        <IconButton edge="end" aria-label="edit" onClick={handleEdit} size="small">
          <EditIcon />
        </IconButton>
        <IconButton edge="end" aria-label="delete" onClick={handleDelete} size="small">
          <DeleteIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
});

RaceItem.displayName = 'RaceItem';

const RaceList = memo(() => {
  const { races, isLoading, error } = useRaces();

  const handleEdit = useCallback((race: RaceEntry) => {
    // Handle edit logic here
    console.log('Editing race:', race);
  }, []);

  if (isLoading) {
    return <Typography>Loading races...</Typography>;
  }

  if (error) {
    return <Typography color="error">{error}</Typography>;
  }

  if (races.length === 0) {
    return <Typography>No races found.</Typography>;
  }

  return (
    <Paper elevation={2} sx={{ mt: 2, mb: 2 }}>
      <List>
        {races.map((race) => (
          <RaceItem key={race.id} race={race} onEdit={handleEdit} />
        ))}
      </List>
    </Paper>
  );
});

RaceList.displayName = 'RaceList';

export default RaceList; 