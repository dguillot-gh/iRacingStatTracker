# Application Architecture

## Overview

The iRacing Stat Tracker is a client-side application built with React and TypeScript. This document outlines the application's architecture, data flow, and component relationships.

## Data Flow Diagram

```mermaid
graph TD
    UI["User Interface"]
    Store["Redux Store"]
    Storage["Local Storage"]
    Export["Export/Import"]
    
    UI -->|"Dispatch Actions"| Store
    Store -->|"State Updates"| UI
    Store -->|"Persist Data"| Storage
    Storage -->|"Load Data"| Store
    UI -->|"Export Data"| Export
    Export -->|"Import Data"| Store
```

## Component Architecture

```mermaid
graph TD
    App["App Component"]
    Layout["Layout Component"]
    Nav["Navigation"]
    Pages["Pages"]
    Components["Shared Components"]
    
    App --> Layout
    Layout --> Nav
    Layout --> Pages
    Pages --> Components
    
    subgraph "Pages"
        Dashboard["Dashboard"]
        Calendar["Race Calendar"]
        History["Race History"]
        Championship["Championship"]
        Analysis["Analysis"]
    end
    
    subgraph "Components"
        RaceForm["Race Form"]
        ResultDialog["Result Dialog"]
        Stats["Statistics"]
        Charts["Charts"]
    end
```

## State Management Flow

```mermaid
graph LR
    Action["User Action"]
    Dispatch["Dispatch"]
    Reducer["Reducer"]
    State["New State"]
    Storage["Local Storage"]
    UI["UI Update"]
    
    Action --> Dispatch
    Dispatch --> Reducer
    Reducer --> State
    State --> Storage
    State --> UI
```

## Data Storage Architecture

```mermaid
graph TD
    App["Application"]
    LocalStorage["Local Storage"]
    Backup["Backup System"]
    Export["Export/Import"]
    
    subgraph "Storage Keys"
        Races["races"]
        Settings["settings"]
        Backup["backups"]
    end
    
    App -->|"Read/Write"| LocalStorage
    LocalStorage --> Races
    LocalStorage --> Settings
    LocalStorage --> Backup
    App -->|"Export"| Export
    Export -->|"Import"| App
```

## Component Dependencies

```mermaid
graph TD
    App["App.tsx"]
    Router["Router"]
    Store["Redux Store"]
    Theme["Theme Provider"]
    
    App --> Router
    App --> Store
    App --> Theme
    
    subgraph "Core Components"
        Layout["Layout.tsx"]
        Nav["Sidebar.tsx"]
        Settings["Settings.tsx"]
    end
    
    subgraph "Feature Components"
        RaceForm["RaceForm.tsx"]
        Calendar["Calendar.tsx"]
        Analysis["Analysis.tsx"]
    end
    
    Router --> Layout
    Layout --> Nav
    Layout --> Settings
    Layout --> RaceForm
    Layout --> Calendar
    Layout --> Analysis
``` 