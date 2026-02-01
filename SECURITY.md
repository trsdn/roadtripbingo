# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.2.x   | :white_check_mark: |
| < 1.2   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not report security vulnerabilities through public GitHub issues.**

## Security Best Practices

### API Key Management

1. **Never commit API keys** to the repository
2. Use the `.env` file for local development (already in `.gitignore`)
3. Set environment variables in production environments
4. Rotate API keys regularly (recommended: every 90 days)
5. Monitor API usage for unusual patterns

### Data Storage

1. **SQLite Database**: 
   - Database files are excluded from version control
   - Use parameterized queries to prevent SQL injection
   - Regular backups are recommended
   - Database path validation is enforced

2. **File Uploads**:
   - Image files are validated before processing
   - Maximum file size limits are enforced
   - Images are automatically compressed and sanitized
   - Only image MIME types are accepted

3. **User Data**:
   - All data is stored locally on the client/server
   - No third-party data sharing except optional AI features
   - Regular data exports are available for backup

### API Security

1. **Rate Limiting**:
   - API endpoints have request rate limits
   - AI endpoints are protected with additional throttling
   - Excessive requests return 429 (Too Many Requests)

2. **Input Validation**:
   - All API inputs are validated and sanitized
   - Request body size limits are enforced
   - File uploads are validated for type and size

3. **Authentication** (if implemented):
   - API keys must be included in Authorization headers
   - Keys are validated on each request
   - Invalid keys return 401 (Unauthorized)

## Known Security Considerations

### 1. Local Storage
The application uses SQLite for local data storage. Ensure your deployment environment has appropriate file system permissions.

### 2. AI Features
AI icon analysis requires an OpenAI API key. Users should:
- Keep their API keys secure
- Monitor API usage and costs
- Set monthly usage limits if available
- Review OpenAI's security and privacy policies

### 3. PDF Generation
PDF files are generated client-side using html2pdf.js. No data is sent to external servers during PDF generation.

### 4. Dependencies
Regular security audits of npm dependencies are recommended:
```bash
npm audit
npm audit fix
```

## Security Headers

When deploying this application, consider adding these HTTP security headers:

```
Content-Security-Policy: default-src 'self'; img-src 'self' data:; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
```

## Secure Development Practices

### Code Review
- All code changes require review before merging
- Security-sensitive changes require additional scrutiny
- Automated tests include security validation

### Testing
- Unit tests cover security-critical functions
- Input validation is tested thoroughly
- SQL injection and XSS tests are included

### Updates
- Dependencies are kept up to date
- Security patches are applied promptly
- Regular security audits are performed

## Contact

For security concerns, please contact the repository maintainers through GitHub.

---

**Last Updated**: 2026-02-01
