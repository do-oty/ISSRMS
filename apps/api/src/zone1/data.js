/**
 * Zone 1 Institutional Source Mock Data
 * Simulates Saint Joseph School of Mactan's existing legacy database.
 */

export const INSTITUTIONAL_STUDENTS = [
  {
    id_number: 'STU-2026-0891',
    rfid_uid: '6A:9C:1D:3F',
    first_name: 'Kyle',
    last_name: 'Zenarosa',
    grade_level: 'Grade 11',
    section: 'St. Benedict',
    contact_number: '09171234567',
    parent_contact: '09181234567',
    enrollment_status: 'Active',
    photo_url: '/assets/avatar_kyle.png',
  },
  {
    id_number: 'STU-2026-0412',
    rfid_uid: '1B:3D:5F:7A',
    first_name: 'Jose',
    last_name: 'Rizal',
    grade_level: 'Grade 12',
    section: 'St. Francis',
    contact_number: '09172345678',
    parent_contact: '09182345678',
    enrollment_status: 'Active',
    photo_url: null,
  },
  {
    id_number: 'STU-2026-0922',
    rfid_uid: '2C:4E:6A:8B',
    first_name: 'Samantha',
    last_name: 'Gomez',
    grade_level: 'Grade 10',
    section: 'St. Scholastica',
    contact_number: '09173456789',
    parent_contact: '09183456789',
    enrollment_status: 'Active',
    photo_url: null,
  },
  {
    id_number: 'STU-2025-0105',
    rfid_uid: '4E:8A:1C:3D',
    first_name: 'Mark',
    last_name: 'Tan',
    grade_level: 'Grade 12',
    section: 'St. Joseph',
    contact_number: '09174567890',
    parent_contact: '09184567890',
    enrollment_status: 'Inactive', // Example: withdrawn or inactive
    photo_url: null,
  }
];

export const INSTITUTIONAL_LOGGING_RECORDS = [
  {
    log_id: 1001,
    id_number: 'STU-2026-0891',
    log_type: 'Gate_Entry',
    location: 'Gate_1',
    timestamp: '2026-10-10T07:15:22.000Z'
  },
  {
    log_id: 1002,
    id_number: 'STU-2026-0891',
    log_type: 'Library_Entry',
    location: 'Library',
    timestamp: '2026-10-10T09:42:10.000Z'
  },
  {
    log_id: 1003,
    id_number: 'STU-2026-0891',
    log_type: 'Library_Exit',
    location: 'Library',
    timestamp: '2026-10-10T10:35:48.000Z'
  },
  {
    log_id: 1004,
    id_number: 'STU-2026-0412',
    log_type: 'Gate_Entry',
    location: 'Gate_2',
    timestamp: '2026-10-10T07:22:15.000Z'
  },
  {
    log_id: 1005,
    id_number: 'STU-2026-0922',
    log_type: 'Gate_Entry',
    location: 'Gate_1',
    timestamp: '2026-10-10T07:28:44.000Z'
  }
];
