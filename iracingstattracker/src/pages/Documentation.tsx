import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Container,
  Breadcrumbs,
  Link,
  CircularProgress,
} from '@mui/material';

interface DocNode {
  content: string;
  children: Record<string, DocNode>;
}

const docs = {
  'Getting Started': {
    content: `
# iRacing Stat Tracker

A comprehensive application for tracking and analyzing your iRacing statistics, race history, and championship progress.

## Features

- Race history tracking and management
- Championship points calculation and analysis
- Performance analytics and visualization
- Season comparison tools
- Data backup and export/import functionality
- Fully client-side application with browser storage`,
    children: {}
  },
  'Features': {
    content: `
# Features Overview

iRacing Stat Tracker provides comprehensive tools for managing and analyzing your iRacing career. Here are the main features:

## Core Features

1. Race Management
   - Track all your race results
   - Manage practice and qualifying sessions
   - View detailed race statistics

2. Championship Analysis
   - Track points across multiple series
   - View championship standings
   - Analyze performance trends

3. Data Management
   - Automatic data backup
   - Import/Export functionality
   - Local storage management

4. Performance Analytics
   - Lap time analysis
   - Incident rate tracking
   - Safety rating progression
   - iRating trends

## Additional Tools

- Race Calendar integration
- Series-specific statistics
- Track-specific performance metrics
- Season comparison tools`,
    children: {
      'Race Management': {
        content: `
# Race Management

Track and manage your individual race sessions and results with our comprehensive race management tools.

## Session Management

1. Race Entry
   - Quick add race results
   - Track selection with favorites
   - Car/class selection
   - Split information
   - Weather conditions
   - Session date/time tracking

2. Results Recording
   - Starting grid position
   - Finish position
   - Qualifying time
   - Fastest lap
   - Average lap time
   - Total laps completed
   - Laps led
   - Incidents count

3. Advanced Stats
   - Fuel usage tracking
   - Tire wear notes
   - Setup versions
   - Track temperature
   - Track state (rubber/marbles)
   - Session strength of field

## Race Analysis

1. Lap Time Analysis
   - Lap by lap breakdown
   - Sector times
   - Consistency rating
   - Best sector combinations
   - Optimal lap calculation
   - Pace degradation tracking

2. Race Incidents
   - Incident points tracking
   - Contact analysis
   - Off-track occurrences
   - Safety rating impact
   - Incident patterns

3. Position Analysis
   - Position changes by lap
   - Overtaking statistics
   - Defense statistics
   - Gap to cars ahead/behind
   - Running position graph

## Practice Tools

1. Session Planning
   - Practice schedule
   - Track conditions log
   - Setup iteration tracking
   - Focus areas notes
   - Personal bests tracking

2. Setup Management
   - Setup version control
   - Track condition matching
   - Setup notes
   - Baseline comparisons
   - Setup sharing options

3. Progress Tracking
   - Practice lap statistics
   - Time trial results
   - Personal records
   - Track learning notes
   - Areas for improvement`,
        children: {}
      },
      'Championship Analysis': {
        content: `
# Championship Analysis

Comprehensive tools for tracking and analyzing championship performance across multiple series.

## Points Tracking

1. Series Management
   - Multiple series tracking
   - Custom points systems
   - Drop weeks calculation
   - Division tracking

2. Standings Overview
   - Real-time points calculation
   - Position in division
   - Points gap analysis
   - Projected final position

3. Season Progress
   - Completed races
   - Remaining schedule
   - Required participation
   - Points needed for promotion

## Performance Analytics

1. Championship Trends
   - Points per race
   - Position trends
   - Consistency metrics
   - Strength of field analysis

2. Competition Analysis
   - Competitor tracking
   - Head-to-head statistics
   - Division boundary analysis
   - Points gaps to key positions

3. Season Goals
   - Target points tracking
   - Division promotion calculator
   - Achievement tracking
   - Personal best records

## Strategic Planning

1. Schedule Optimization
   - Best tracks identification
   - Participation planning
   - Drop week strategy
   - Division boundary monitoring

2. Performance Improvement
   - Track-specific analysis
   - Incident rate tracking
   - Qualifying performance
   - Race finish consistency

3. Season Review
   - Detailed statistics export
   - Season comparison
   - Goal achievement analysis
   - Areas for improvement`,
        children: {}
      }
    }
  },
  'Troubleshooting': {
    content: `
# Troubleshooting Guide

Common issues and their solutions.

## Data Issues

1. Data Not Saving
   - Check storage space
   - Clear browser cache
   - Export backup regularly

2. Performance Issues
   - Reduce data size
   - Clear old records
   - Use filters effectively`,
    children: {}
  }
};

export default function Documentation() {
  const [selectedDoc, setSelectedDoc] = useState<string[]>(['Getting Started']);
  const [content, setContent] = useState(docs['Getting Started'].content);

  const handleDocSelect = (path: string[]) => {
    setSelectedDoc(path);
    let currentNode: DocNode = docs as any;
    for (const segment of path) {
      currentNode = currentNode[segment] as DocNode;
    }
    setContent(currentNode.content);
  };

  const renderDocTree = (node: Record<string, DocNode>, path: string[] = []) => {
    return (
      <List>
        {Object.entries(node).map(([key, value]) => (
          <div key={key}>
            <ListItem disablePadding>
              <ListItemButton
                selected={selectedDoc.join('/') === [...path, key].join('/')}
                onClick={() => handleDocSelect([...path, key])}
              >
                <ListItemText 
                  primary={key}
                  sx={{
                    '& .MuiTypography-root': {
                      fontWeight: Object.keys(value.children).length > 0 ? 'bold' : 'normal'
                    }
                  }}
                />
              </ListItemButton>
            </ListItem>
            {Object.keys(value.children).length > 0 && (
              <Box sx={{ pl: 2 }}>
                {renderDocTree(value.children, [...path, key])}
              </Box>
            )}
          </div>
        ))}
      </List>
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Documentation
      </Typography>
      <Breadcrumbs sx={{ mb: 2 }}>
        {selectedDoc.map((segment, index) => (
          <Link
            key={segment}
            component="button"
            underline={index === selectedDoc.length - 1 ? 'none' : 'hover'}
            color={index === selectedDoc.length - 1 ? 'text.primary' : 'inherit'}
            onClick={() => handleDocSelect(selectedDoc.slice(0, index + 1))}
            sx={{ cursor: 'pointer' }}
          >
            {segment}
          </Link>
        ))}
      </Breadcrumbs>
      <Box sx={{ display: 'flex', gap: 4 }}>
        <Paper sx={{ width: 280, flexShrink: 0 }}>
          {renderDocTree(docs)}
        </Paper>
        <Paper sx={{ flex: 1, p: 3 }}>
          <Box sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {content}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
} 