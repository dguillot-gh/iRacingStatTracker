import { Skeleton, Box, Paper, Grid } from '@mui/material';

interface LoadingSkeletonProps {
  type: 'table' | 'calendar' | 'stats';
  rows?: number;
}

export const LoadingSkeleton = ({ type, rows = 5 }: LoadingSkeletonProps) => {
  if (type === 'table') {
    return (
      <Paper sx={{ p: 2 }}>
        <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />
        {Array.from({ length: rows }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rectangular"
            height={52}
            sx={{ mb: 1, opacity: 1 - index * 0.1 }}
          />
        ))}
      </Paper>
    );
  }

  if (type === 'calendar') {
    return (
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Skeleton variant="rectangular" height={60} />
          </Grid>
          {Array.from({ length: 35 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={3} lg={2} key={index}>
              <Skeleton
                variant="rectangular"
                height={100}
                sx={{ opacity: 0.8 + Math.random() * 0.2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Paper>
    );
  }

  if (type === 'stats') {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Grid item xs={12} md={3} key={index}>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                </Box>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    );
  }

  return null;
}; 