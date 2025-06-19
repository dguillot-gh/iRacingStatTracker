import { RaceEntry, Track } from '../types/race'
import { v4 as uuidv4 } from 'uuid'

interface ParsedScheduleEntry {
  series: string
  week: number
  track: string
  trackType?: 'oval' | 'road' | 'dirt'
  date?: Date
  vehicle?: string
}

export const PdfParserService = {
  /**
   * Parse text content extracted from a PDF into race entries
   * This is a basic implementation that expects a specific format
   * You may need to adjust the parsing logic based on the actual PDF format
   */
  parseSchedule: (text: string): RaceEntry[] => {
    const races: RaceEntry[] = []
    const lines = text.split('\n').filter(line => line.trim())

    let currentSeries = ''
    let currentVehicle = ''
    
    // Example parsing logic - adjust based on actual PDF format
    lines.forEach(line => {
      // Try to identify series headers
      if (line.includes('Series') || line.includes('Championship')) {
        currentSeries = line.trim()
        return
      }

      // Try to identify vehicle information
      if (line.includes('Car:') || line.includes('Vehicle:')) {
        currentVehicle = line.split(':')[1].trim()
        return
      }

      // Try to parse schedule entries
      // Example format: "Week 1 - Daytona International Speedway - January 1"
      const weekMatch = line.match(/Week (\d+)/)
      if (weekMatch) {
        const entry = parseScheduleLine(line, {
          series: currentSeries,
          vehicle: currentVehicle
        })

        if (entry) {
          races.push({
            id: uuidv4(),
            series: mapToKnownSeries(entry.series),
            vehicle: entry.vehicle || '',
            week: entry.week,
            season: new Date().getFullYear().toString(),
            track: {
              name: entry.track,
              type: entry.trackType || determineTrackType(entry.track)
            },
            class: entry.trackType === 'oval' ? 'oval' : 'road',
            date: entry.date || new Date(),
            status: 'upcoming'
          })
        }
      }
    })

    return races
  }
}

function parseScheduleLine(
  line: string,
  context: { series: string; vehicle: string }
): ParsedScheduleEntry | null {
  try {
    // Example: "Week 1 - Daytona International Speedway - January 1"
    const parts = line.split('-').map(p => p.trim())
    
    if (parts.length < 2) return null

    const weekMatch = parts[0].match(/Week (\d+)/)
    if (!weekMatch) return null

    const week = parseInt(weekMatch[1])
    const track = parts[1]
    
    // Try to parse date if available
    let date: Date | undefined
    if (parts[2]) {
      try {
        date = new Date(parts[2])
      } catch (e) {
        // Invalid date format, ignore
      }
    }

    return {
      series: context.series,
      week,
      track,
      vehicle: context.vehicle,
      date
    }
  } catch (e) {
    console.error('Error parsing schedule line:', e)
    return null
  }
}

function mapToKnownSeries(seriesName: string): RaceEntry['series'] {
  const normalizedName = seriesName.toLowerCase()
  
  if (normalizedName.includes('draftmaster')) return 'Draftmasters'
  if (normalizedName.includes('truck')) return 'Nascar Trucks'
  
  return 'Other'
}

function determineTrackType(trackName: string): Track['type'] {
  const name = trackName.toLowerCase()
  
  // This is a basic implementation - you might want to expand this
  // with a more comprehensive track database
  if (name.includes('dirt')) return 'dirt'
  if (name.includes('road') || 
      name.includes('circuit') || 
      name.includes('raceway')) return 'road'
  
  return 'oval' // Default to oval
} 