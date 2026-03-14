# Test Credentials

Local dev only. **Never commit real credentials here.**

## App URL
http://localhost:1303

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| superadmin | superadmin@izhubs.local | Test1234! |
| admin | admin@izhubs.local | Test1234! |
| member | member@izhubs.local | Test1234! |
| viewer | viewer@izhubs.local | Test1234! |

## Re-seed
```bash
npx ts-node --project tsconfig.json database/seeds/seed-test-users.ts
```
