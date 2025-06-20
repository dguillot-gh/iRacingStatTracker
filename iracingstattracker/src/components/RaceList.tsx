import React, { memo, useCallback, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { RaceEntry } from '../types/race';
import { useRaces } from '../hooks/useRaces';
import { LoadingSkeleton } from './LoadingSkeleton';

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

  const getTrackName = (track: string | { name: string; type: string }) => {
    if (typeof track === 'string') return track;
    return track.name;
  };

  return (
    <TableRow>
      <TableCell>{race.title}</TableCell>
      <TableCell>{race.series}</TableCell>
      <TableCell>{new Date(race.date).toLocaleDateString()}</TableCell>
      <TableCell>{getTrackName(race.track)}</TableCell>
      <TableCell align="right">
        <IconButton onClick={handleEdit} size="small">
          <EditIcon />
        </IconButton>
        <IconButton onClick={handleDelete} size="small" color="error">
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
});

RaceItem.displayName = 'RaceItem';

interface RaceListProps {
  races: RaceEntry[];
  onEditRace: (race: RaceEntry) => void;
  onDeleteRace: (raceId: string) => void;
  isLoading?: boolean;
}

export const RaceList = memo(({ races, onEditRace, onDeleteRace, isLoading = false }: RaceListProps) => {
  const sortedRaces = useMemo(() => 
    [...races].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
    [races]
  );

  if (isLoading) {
    return <LoadingSkeleton type="table" rows={5} />;
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Series</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Track</TableCell>
            <TableCell align="right">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {sortedRaces.map(race => (
            <RaceItem 
              key={race.id} 
              race={race} 
              onEdit={onEditRace} 
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
});

RaceList.displayName = 'RaceList';

export default RaceList; 