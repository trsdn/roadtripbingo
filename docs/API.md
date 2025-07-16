# Road Trip Bingo API Documentation

## Overview

The Road Trip Bingo application provides a RESTful API for managing icons, settings, and card generations. All endpoints accept and return JSON data.

## Base URL

```
http://localhost:3000/api
```

## Common Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error description",
  "message": "Operation failed"
}
```

## Endpoints

### Icons

#### GET /api/icons
Retrieve all icons.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "airplane",
      "image_data": "base64-encoded-image-data",
      "mime_type": "image/png",
      "alt_text": "Airplane icon",
      "created_at": "2023-07-08T10:00:00.000Z",
      "updated_at": "2023-07-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/icons
Create a new icon.

**Request Body:**
```json
{
  "name": "airplane",
  "image_data": "base64-encoded-image-data",
  "mime_type": "image/png",
  "alt_text": "Airplane icon"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "airplane",
    "image_data": "base64-encoded-image-data",
    "mime_type": "image/png",
    "alt_text": "Airplane icon",
    "created_at": "2023-07-08T10:00:00.000Z",
    "updated_at": "2023-07-08T10:00:00.000Z"
  }
}
```

#### PUT /api/icons/:id
Update an existing icon.

**Request Body:**
```json
{
  "name": "updated-airplane",
  "alt_text": "Updated airplane icon"
}
```

#### DELETE /api/icons/:id
Delete an icon.

**Response:**
```json
{
  "success": true,
  "message": "Icon deleted successfully"
}
```

#### DELETE /api/icons
Delete all icons.

**Response:**
```json
{
  "success": true,
  "message": "All icons deleted successfully"
}
```

### Settings

#### GET /api/settings
Retrieve all settings.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "key": "language",
      "value": "en",
      "created_at": "2023-07-08T10:00:00.000Z",
      "updated_at": "2023-07-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/settings
Create or update a setting.

**Request Body:**
```json
{
  "key": "language",
  "value": "en"
}
```

#### GET /api/settings/:key
Retrieve a specific setting by key.

#### PUT /api/settings/:key
Update a specific setting.

**Request Body:**
```json
{
  "value": "de"
}
```

#### DELETE /api/settings/:key
Delete a specific setting.

### Card Generations

#### GET /api/generations
Retrieve all card generations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Summer Road Trip",
      "grid_size": 5,
      "icons": "[1,2,3,4,5]",
      "created_at": "2023-07-08T10:00:00.000Z",
      "updated_at": "2023-07-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/generations
Create a new card generation.

**Request Body:**
```json
{
  "name": "Summer Road Trip",
  "grid_size": 5,
  "icons": [1, 2, 3, 4, 5]
}
```

#### PUT /api/generations/:id
Update a card generation.

#### DELETE /api/generations/:id
Delete a card generation.

#### DELETE /api/generations
Delete all card generations.

### Storage Information

#### GET /api/storage/info
Get storage information and statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "icons_count": 25,
    "settings_count": 5,
    "generations_count": 3,
    "database_size": "2.5 MB",
    "last_backup": "2023-07-08T09:00:00.000Z"
  }
}
```

### Export/Import

#### GET /api/export
Export all data as JSON.

**Query Parameters:**
- `format` (optional): Export format (`json` or `sql`, default: `json`)

**Response:**
```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "exported_at": "2023-07-08T10:00:00.000Z",
    "icons": [...],
    "settings": [...],
    "generations": [...]
  }
}
```

#### POST /api/import
Import data from JSON.

**Request Body:**
```json
{
  "data": {
    "icons": [...],
    "settings": [...],
    "generations": [...]
  },
  "merge": true
}
```

**Parameters:**
- `merge`: If `true`, merge with existing data. If `false`, replace all data.

## Error Codes

- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

## Rate Limiting

Currently, no rate limiting is implemented. This may be added in future versions.

## Authentication

Currently, no authentication is required. This is suitable for local development and single-user scenarios.
