// Safe to edit by hand
// =============================================================================
// The Academy's table views (PORTS.md card 117)
// =============================================================================
// NOT PORTABLE. Each entry adds a "... as a table" item BESIDE the normal list
// on the desk (src/sanity/structure.ts, tableListItem()), never instead of it:
// a sortable grid with a status pill and an Open button, for the lists staff
// scan every term (which courses run when, who teaches, what is coming up).
// The machinery is src/sanity/workflow/DocumentTable.tsx and
// src/lib/studio-table.ts; studio-table.test.ts checks this file.
// =============================================================================

import type { TableConfig } from '../lib/studio-table';

export const TABLES: TableConfig[] = [
  {
    id: 'course-table',
    title: 'Courses as a table',
    type: 'course',
    projection:
      'courseCode, title, "areas": teachingAreas[]->title, "terms": offerings[].term->title, "teachers": instructors[]->name, featured',
    columns: [
      { key: 'courseCode', label: 'Code' },
      { key: 'title', label: 'Course' },
      { key: 'areas', label: 'Teaching areas', kind: 'list' },
      { key: 'terms', label: 'Terms', kind: 'list' },
      { key: 'teachers', label: 'Faculty', kind: 'list' },
      { key: 'featured', label: 'Featured', kind: 'bool' },
    ],
    defaultSort: { key: 'courseCode', dir: 'asc' },
  },
  {
    id: 'term-table',
    title: 'Terms as a table',
    type: 'term',
    projection: 'title, startDate, endDate, registrationDeadline, status',
    columns: [
      { key: 'title', label: 'Term' },
      { key: 'startDate', label: 'Begins', kind: 'date' },
      { key: 'endDate', label: 'Ends', kind: 'date' },
      { key: 'registrationDeadline', label: 'Apply by', kind: 'date' },
      { key: 'status', label: 'Status' },
    ],
    defaultSort: { key: 'startDate', dir: 'desc' },
  },
  {
    id: 'faculty-table',
    title: 'Faculty as a table',
    type: 'facultyMember',
    projection:
      'name, title, "areas": teachingAreas[]->title, "courses": count(*[_type == "course" && references(^._id)])',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'title', label: 'Role' },
      { key: 'areas', label: 'Teaching areas', kind: 'list' },
      { key: 'courses', label: 'Courses' },
    ],
    defaultSort: { key: 'name', dir: 'asc' },
  },
  {
    id: 'event-table',
    title: 'Events as a table',
    type: 'event',
    projection: 'start, title, category, location, featuredOnHome',
    columns: [
      { key: 'start', label: 'When', kind: 'date' },
      { key: 'title', label: 'Event' },
      { key: 'category', label: 'Kind' },
      { key: 'location', label: 'Where' },
      { key: 'featuredOnHome', label: 'On Home', kind: 'bool' },
    ],
    defaultSort: { key: 'start', dir: 'desc' },
  },
];
