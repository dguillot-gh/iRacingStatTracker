import React, { useState, useMemo, useEffect } from 'react'
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Tab,
  Tabs,
  Box,
  CircularProgress,
  TextField,
  Menu,
  MenuItem,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
} from '@mui/material'
import {
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material'
import { RaceEntry } from '../types/race'
import { PdfParserService } from '../services/pdfParser'
import * as pdfjsLib from 'pdfjs-dist'
import { searchRaces, exportToCSV, exportToJSON, SearchOptions } from '../utils/search'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface DataManagementProps {
  races: RaceEntry[]
  onImport: (races: RaceEntry[]) => void
  onSearchResults?: (results: RaceEntry[]) => void
}

type ImportType = 'json' | 'pdf'

export default function DataManagement({ races, onImport, onSearchResults }: DataManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importType, setImportType] = useState<ImportType>('json')
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAnchor, setFilterAnchor] = useState<null | HTMLElement>(null)
  const [exportAnchor, setExportAnchor] = useState<null | HTMLElement>(null)
  const [filters, setFilters] = useState<SearchOptions>({})

  // Search results
  const filteredRaces = useMemo(() => {
    const results = searchRaces(races, searchTerm, filters)
    return results
  }, [races, searchTerm, filters])

  // Use useEffect to notify parent of search results
  useEffect(() => {
    onSearchResults?.(filteredRaces)
  }, [filteredRaces, onSearchResults])

  // Handle filter changes
  const handleFilterChange = (key: keyof SearchOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleExportCSV = () => {
    const csv = exportToCSV(filteredRaces)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `race_data_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    setExportAnchor(null)
  }

  const handleExportJSON = () => {
    const json = exportToJSON(filteredRaces)
    const blob = new Blob([json], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `race_data_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    setExportAnchor(null)
  }

  const handleJsonImport = async (file: File) => {
    try {
      const content = await file.text()
      const importData = JSON.parse(content)
      
      // Basic validation
      if (!importData.races || !Array.isArray(importData.races)) {
        throw new Error('Invalid file format')
      }

      // Convert date strings back to Date objects
      const processedRaces = importData.races.map((race: any) => ({
        ...race,
        date: new Date(race.date),
        endDate: race.endDate ? new Date(race.endDate) : null,
      }))

      onImport(processedRaces)
      setIsOpen(false)
      setError(null)
    } catch (err) {
      setError('Failed to import JSON data. Please check the file format.')
    }
  }

  const handlePdfImport = async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)

      // Load the PDF file
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

      // Extract text from all pages
      let fullText = ''
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }

      // Parse the extracted text into race entries
      const races = PdfParserService.parseSchedule(fullText)
      
      if (races.length === 0) {
        throw new Error('No valid schedule entries found in the PDF')
      }

      onImport(races)
      setIsOpen(false)
      setError(null)
    } catch (err) {
      setError('Failed to import PDF schedule. Please check the file format.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (importType === 'json') {
      await handleJsonImport(file)
    } else {
      await handlePdfImport(file)
    }
  }

  return (
    <>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {/* Search field */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search races..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          {/* Filter button */}
          <Tooltip title="Filter">
            <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
              <FilterListIcon />
            </IconButton>
          </Tooltip>

          {/* Export button */}
          <Tooltip title="Export">
            <IconButton onClick={(e) => setExportAnchor(e.currentTarget)}>
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>

      <Stack direction="row" spacing={1}>
        <Tooltip title="Import Schedule">
          <Button
            startIcon={<FileUploadIcon />}
            onClick={() => setIsOpen(true)}
            variant="outlined"
          >
            Import
          </Button>
        </Tooltip>
        <Tooltip title="Export Schedule">
          <Button
            startIcon={<FileDownloadIcon />}
            onClick={() => {
              handleExportCSV()
              handleExportJSON()
            }}
            variant="outlined"
          >
            Export
          </Button>
        </Tooltip>
      </Stack>

      <Dialog 
        open={isOpen} 
        onClose={() => !isLoading && setIsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Import Schedule
          {!isLoading && (
            <IconButton
              aria-label="close"
              onClick={() => setIsOpen(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs
              value={importType}
              onChange={(_, newValue: ImportType) => setImportType(newValue)}
            >
              <Tab label="JSON" value="json" />
              <Tab label="PDF Schedule" value="pdf" />
            </Tabs>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <input
                type="file"
                accept={importType === 'json' ? '.json' : '.pdf'}
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label htmlFor="import-file">
                <Button variant="contained" component="span">
                  Choose {importType.toUpperCase()} File
                </Button>
              </label>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)} disabled={isLoading}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter menu */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Series</InputLabel>
            <Select
              value={filters.series || ''}
              label="Series"
              onChange={(e: SelectChangeEvent<string>) => 
                handleFilterChange('series', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="Draftmasters">Draftmasters</MenuItem>
              <MenuItem value="Nascar Trucks">Nascar Trucks</MenuItem>
              <MenuItem value="Other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <DatePicker
              label="Start Date"
              value={filters.startDate || null}
              onChange={(date) => handleFilterChange('startDate', date)}
            />
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
            <DatePicker
              label="End Date"
              value={filters.endDate || null}
              onChange={(date) => handleFilterChange('endDate', date)}
            />
          </FormControl>

          <Button
            fullWidth
            variant="outlined"
            onClick={() => {
              setFilters({})
              setFilterAnchor(null)
            }}
          >
            Clear Filters
          </Button>
        </Box>
      </Menu>

      {/* Export menu */}
      <Menu
        anchorEl={exportAnchor}
        open={Boolean(exportAnchor)}
        onClose={() => setExportAnchor(null)}
      >
        <MenuItem onClick={handleExportCSV}>Export as CSV</MenuItem>
        <MenuItem onClick={handleExportJSON}>Export as JSON</MenuItem>
      </Menu>
    </>
  )
} 