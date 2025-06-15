import { useState } from 'react'
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
} from '@mui/material'
import {
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Close as CloseIcon,
} from '@mui/icons-material'
import { RaceEntry } from '../types/race'
import { PdfParserService } from '../services/pdfParser'
import * as pdfjsLib from 'pdfjs-dist'

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`

interface DataManagementProps {
  races: RaceEntry[]
  onImport: (races: RaceEntry[]) => void
}

type ImportType = 'json' | 'pdf'

export default function DataManagement({ races, onImport }: DataManagementProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importType, setImportType] = useState<ImportType>('json')
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = () => {
    try {
      const exportData = {
        version: '1.0',
        timestamp: new Date().toISOString(),
        races: races,
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `iracing-schedule-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to export data. Please try again.')
    }
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
            onClick={handleExport}
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
    </>
  )
} 