import React, { memo, useCallback, useMemo, useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Chip,
  Box,
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
import DataManagement from './DataManagement';

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
  onEdit?: (race: RaceEntry) => void;
  onDelete?: (race: RaceEntry) => void;
}

export default function RaceList({ races, onEdit, onDelete }: RaceListProps) {
  const [filteredRaces, setFilteredRaces] = useState<RaceEntry[]>(races);

  const handleSearchResults = (results: RaceEntry[]) => {
    setFilteredRaces(results);
  };

  return (
    <Box>
      <DataManagement 
        races={races} 
        onImport={() => {}} 
        onSearchResults={handleSearchResults}
      />
      
      {filteredRaces.length === 0 ? (
        <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
          No races found matching your search criteria
        </Typography>
      ) : (
        <Paper>
          <List>
            {filteredRaces.map((race) => (
              <ListItem key={race.id} divider>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1">
                        {race.series} - {race.track}
                      </Typography>
                      <Chip
                        label={race.status}
                        size="small"
                        color={
                          race.status === 'completed'
                            ? 'success'
                            : race.status === 'upcoming'
                            ? 'primary'
                            : 'error'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(race.date).toLocaleDateString()} - {race.vehicle}
                      </Typography>
                      {race.result && (
                        <Typography variant="body2" color="text.secondary">
                          Position: {race.result.finishPosition} | iRating: {race.result.iRating?.change > 0 ? '+' : ''}{race.result.iRating?.change}
                        </Typography>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  {onEdit && (
                    <IconButton edge="end" onClick={() => onEdit(race)} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton edge="end" onClick={() => onDelete(race)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

RaceList.displayName = 'RaceList'; 