import { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  ThemeProvider,
  createTheme,
  Box,
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
  CalendarMonth as CalendarMonthIcon,
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import Dashboard from './pages/Dashboard'
import RacePlanner from './pages/RacePlanner'
import RaceHistory from './pages/RaceHistory'
import ChampionshipManager from './pages/ChampionshipManager'
import ChampionshipAnalysis from './pages/ChampionshipAnalysis'
import SettingsDialog from './components/SettingsDialog'
import { Race } from './types/race'
import { storage, AppSettings } from './services/storage'
import Calendar from './pages/Calendar'
import Settings from './pages/Settings'
import SeriesEditor from './pages/SeriesEditor'
import Documentation from './pages/Documentation'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useRaces } from './hooks/useRaces'
import { useSelector, useDispatch } from 'react-redux'
import { selectSettings, setSettings as setSettingsAction } from './store/slices/settingsSlice'

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
  const [mobileOpen, setMobileOpen] = useState(false)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  
  const dispatch = useDispatch()
  const settings = useSelector(selectSettings)
  const { races, isLoading, loadRaces } = useRaces()
  
  const theme = createAppTheme(settings.theme)
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const location = useLocation()

  // Load data on initial render
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedSettings = await storage.getSettings()
        dispatch(setSettingsAction(loadedSettings))
        await loadRaces()
      } catch (error) {
        console.error('Failed to load data:', error)
      }
    }
    loadData()
  }, [dispatch, loadRaces])

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleThemeToggle = () => {
    const newSettings = {
      ...settings,
      theme: settings.theme === 'dark' ? 'light' : 'dark'
    }
    dispatch(setSettingsAction(newSettings))
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleSettingsOpen = () => {
    setSettingsOpen(true)
    handleMenuClose()
  }

  const handleSettingsClose = () => {
    setSettingsOpen(false)
  }

  const handleSettingsUpdate = (newSettings: AppSettings) => {
    dispatch(setSettingsAction(newSettings))
  }

  const navigationItems = [
    { path: '/', label: 'Dashboard', icon: <DashboardIcon /> },
    { path: '/planner', label: 'Race Planner', icon: <EventIcon /> },
    { path: '/history', label: 'Race History', icon: <HistoryIcon /> },
    { path: '/championship', label: 'Championship', icon: <TrophyIcon /> },
    { path: '/analysis', label: 'Analysis', icon: <AnalyticsIcon /> },
    { path: '/calendar', label: 'Calendar', icon: <CalendarMonthIcon /> },
    { path: '/settings', label: 'Settings', icon: <SettingsIcon /> },
    { path: '/series', label: 'Series Editor', icon: <SettingsIcon /> },
    { path: '/docs', label: 'Documentation', icon: <SettingsIcon /> },
  ]

  const drawer = (
    <Box sx={{ mt: 8 }}>
      <List>
        {navigationItems.map((item) => (
          <ListItem
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
                {settings.theme === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <SettingsIcon />
              </IconButton>
            </Toolbar>
          </AppBar>

          <Box
            component="nav"
            sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
          >
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
            }}
          >
            <Toolbar />
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/planner" element={<RacePlanner />} />
                <Route path="/history" element={<RaceHistory />} />
                <Route path="/championship" element={<ChampionshipManager />} />
                <Route path="/analysis" element={<ChampionshipAnalysis />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/series" element={<SeriesEditor />} />
                <Route path="/docs" element={<Documentation />} />
              </Routes>
            </ErrorBoundary>
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleSettingsOpen}>Settings</MenuItem>
        </Menu>

        <SettingsDialog
          open={settingsOpen}
          onClose={handleSettingsClose}
          settings={settings}
          onSave={handleSettingsUpdate}
        />
      </LocalizationProvider>
    </ThemeProvider>
  )
}
