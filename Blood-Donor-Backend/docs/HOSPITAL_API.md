# Hospital Module API

Base URL: `http://localhost:8080/api`  
Auth: `Authorization: Bearer <HOSPITAL_JWT>` (except signup/login).

Donor search (Step 1 — existing module):  
`GET /donors/search?bloodGroup=O+&pinCode=600001&limit=10`

See controller and DTOs in the codebase for full field lists.
