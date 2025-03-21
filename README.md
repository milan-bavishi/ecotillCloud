# landingpage

## LLM Carbon Tracking

The LLM Carbon Tracking feature allows users to track carbon emissions from their LLM usage. The system now stores data per user, using one of the following identification methods:

1. **Authenticated Users**: Data is automatically associated with the authenticated user via their user ID.
2. **Email Identification**: For non-authenticated sessions, the system can associate data with a user's email if provided.
3. **Demo Mode**: If neither authentication nor email is available, the system falls back to a demo user ID.

### How User Data is Stored and Retrieved

- Each LLM usage record includes a `userId` field linking it to a specific user
- API endpoints support both authenticated and non-authenticated requests
- Authenticated requests use JWT tokens in the Authorization header
- Non-authenticated requests can include either a userId or email parameter

### Technical Implementation

- Frontend automatically includes authentication token when available
- Backend validates user identity before storing or retrieving data
- MongoDB queries are filtered by userId to ensure data privacy
- Email lookups are supported to find the correct user ID when only email is available
# ecoTillLLM
# ecoTillIOT
# cloud
# ecotillCloud
