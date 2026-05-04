# API Specification: {{service_name}}

## Overview
- **Service Name:** {{service_name}}
- **Base URL:** `{{base_url}}`
- **Versioning:** {{versioning_strategy}}
- **Authentication:** {{authentication_scheme}}

## Global Standards

### Standard Error Shape
```json
{
  "error": {
    "code": "STRING_ERROR_CODE",
    "message": "Human readable description.",
    "details": [
      {
        "field": "fieldName",
        "issue": "Specific validation failure"
      }
    ]
  }
}
```

### Pagination Scheme
- [Describe if Cursor or Offset based, and required query parameters]

---

## Endpoints

### 1. [Operation Name] (e.g., Create User)

**Endpoint:** `[METHOD] [PATH]` (e.g., `POST /users`)  
**Description:** [Brief description of what this endpoint does]  
**Auth Required:** [Yes/No] (Required Roles: [Role])  

#### Request

**Headers:**
- `Content-Type: application/json`

**Path Parameters:**
| Name | Type | Description |
| :--- | :--- | :--- |
| | | |

**Query Parameters:**
| Name | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| | | | |

**Body Schema:**
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| | | | |

**Body Example:**
```json
{
  // Insert JSON payload example here
}
```

#### Response

**Success Status Code:** `200 OK` (or 201 Created, 204 No Content)

**Success Body Schema:**
| Field | Type | Description |
| :--- | :--- | :--- |
| | | |

**Success Body Example:**
```json
{
  // Insert JSON response example here
}
```

#### Errors
| Status Code | Error Code | Description |
| :--- | :--- | :--- |
| 400 | `VALIDATION_FAILED` | Request payload is malformed or missing fields. |
| 401 | `UNAUTHORIZED` | Missing or invalid authentication token. |
| 403 | `FORBIDDEN` | User lacks required roles. |
| 404 | `NOT_FOUND` | Resource not found. |

---
*(Duplicate the Endpoint block above for each additional endpoint)*
