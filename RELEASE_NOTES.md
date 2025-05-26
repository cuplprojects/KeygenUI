# Release Notes

## Version 1.1.0 (Upcoming Release)

### New Features
- **Manual Key Management**
  - Added ability to upload manual keys for papers
  - Added API endpoint to check manual key status
  - Added warning display when manual keys exist for a paper

- **Verification System Improvements**
  - Enhanced verification status display with color-coded indicators
  - Added filters for upload status, processing status, and verification status
  - Improved filter UI with separate filter button outside search box

- **Bulk Upload Enhancements**
  - Improved file upload process to send files for processing immediately after each successful upload
  - Added better error handling for duplicate upload errors
  - Enhanced progress indicators with more user-friendly loading animations

- **Import Configuration**
  - Added Import Config feature for easier system configuration

### Bug Fixes
- Fixed issue where verification status wasn't properly preventing key downloads
- Fixed program filter search on all keys page
- Fixed search functionality in All Generated Keys section
- Fixed question number display in type mode in master key
- Fixed issue with more than defined questions in Excel alert

### UI/UX Improvements
- Added cancel button to ManageKeys and improved layout for program and paper selection
- Improved two-row layout in Excel exports
- Added headers to each page in exports
- Updated language options in papers table
- Created central utility service for common functions
- Changed action buttons to icons for better usability
- Enhanced status indicators with consistent color coding
- Improved error handling with better user feedback

### Technical Improvements
- Added validation to restrict master key upload until all questions are entered
- Enhanced PDF status tracking and display
- Updated version numbering system
- Improved language handling for the paper section

## Version 1.0.1 (December 28, 2024)
- Initial release with core functionality

## Commit History

### May 2, 2025
- Changed file upload and status indicators
- Fixed verification status to properly prevent key downloads when verification fails

### April 25, 2025
- Added manual key upload functionality
- Fixed issue where incorrect verification status wasn't preventing key downloads

### April 11, 2025
- Added Import Config Feature

### April 8, 2025
- Added cancel button to ManageKeys
- Improved layout for program and paper selection
- Enhanced Excel exports with two rows and headers on each page

### March 10, 2025
- Fixed program filter search on all keys page
- Fixed search in All Generated Keys
- Fixed question number display in type mode in master key

### February 14-13, 2025
- Updated environment configuration
- Added language options in papers table
- Created central utility service

### February 1, 2025
- Added verification status filters for uploaded and not uploaded items

### January 31, 2025
- Updated number of questions during master upload
- Added filter for papers by program
- Changed action buttons to icons

### January 30, 2025
- Added alert for more than defined questions in Excel

### January 28, 2025
- Added restriction for master key upload until all questions are entered
- Improved status display for PDFs

### January 27, 2025
- Updated version numbering

### January 24, 2025
- Updated language options for the paper section

### January 23, 2025
- Added run command functionality

### December 28, 2024
- Initial release (v1.0.1)
