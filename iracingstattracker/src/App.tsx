import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  Box,
  Tab,
  Tabs,
  Container,
  CssBaseline,
  IconButton,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  Menu,
  MenuItem,
  Button,
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  Event as EventIcon,
  History as HistoryIcon,
  EmojiEvents as TrophyIcon,
  Analytics as AnalyticsIcon,
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Dashboard from './pages/Dashboard'
import RacePlanner from './pages/RacePlanner'
import RaceHistory from './pages/RaceHistory'
import ChampionshipManager from './pages/ChampionshipManager'
import ChampionshipAnalysis from './pages/ChampionshipAnalysis'
import { RaceEntry } from './types/race'
import { StorageService } from './services/storage'

// Create theme with color palette
const createAppTheme = (mode: 'light' | 'dark') =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#2196f3',
      },
      secondary: {
        main: '#f50057',
      },
      background: {
        default: mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: mode === 'dark' ? '#1e1e1e' : '#ffffff',
            color: mode === 'dark' ? '#ffffff' : '#000000',
          },
        },
      },
    },
  })

const DRAWER_WIDTH = 240

export default function App() {
  const [races, setRaces] = useState<RaceEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('dark')
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  
  const theme = createAppTheme(themeMode)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()

  // Load races from localStorage on initial render
  useEffect(() => {
    const loadRaces = async () => {
      try {
        const storedRaces = await StorageService.getRaces()
        setRaces(storedRaces)
      } catch (error) {
        console.error('Failed to load races:', error)
      } finally {
        setIsLoading(false)
      }
    }
    loadRaces()
  }, [])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    setThemeMode(prev => prev === 'dark' ? 'light' : 'dark')
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/planner', label: 'Race Planner', icon: <EventIcon /> },
    { path: '/history', label: 'Race History', icon: <HistoryIcon /> },
    { path: '/championship', label: 'Championship', icon: <TrophyIcon /> },
    { path: '/analysis', label: 'Analysis', icon: <AnalyticsIcon /> },
  ]

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.path}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => isMobile && handleDrawerToggle()}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Box>
  )

  if (isLoading) {
    return null
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Box sx={{ display: 'flex' }}>
          <AppBar
            position="fixed"
            sx={{
              width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
              ml: { md: `${DRAWER_WIDTH}px` },
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2, display: { md: 'none' } }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                iRacing Stat Tracker
              </Typography>
              <IconButton color="inherit" onClick={handleThemeToggle}>
                {themeMode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <SettingsIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
                <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
                <MenuItem onClick={handleMenuClose}>Backup Data</MenuItem>
              </Menu>
            </Toolbar>
          </AppBar>

          <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
          >
            {/* Mobile drawer */}
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true, // Better open performance on mobile.
              }}
              sx={{
                display: { xs: 'block', md: 'none' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                },
              }}
            >
              {drawer}
            </Drawer>
            {/* Desktop drawer */}
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', md: 'block' },
                '& .MuiDrawer-paper': {
                  boxSizing: 'border-box',
                  width: DRAWER_WIDTH,
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 3,
              width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
              mt: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard races={races} />} />
              <Route
                path="/planner"
                element={<RacePlanner races={races} onRaceUpdate={setRaces} />}
              />
              <Route
                path="/history"
                element={<RaceHistory races={races} onRaceUpdate={setRaces} />}
              />
              <Route
                path="/championship"
                element={<ChampionshipManager races={races} />}
              />
              <Route
                path="/analysis"
                element={<ChampionshipAnalysis races={races} />}
              />
            </Routes>
          </Box>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  )
}
