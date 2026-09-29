# hostel-Managment-applicationPG Hostel Management System — Sharing Based Version
Stack
Java 17
Spring Boot 3
Spring Data JPA / Hibernate
MySQL
React.js + Vite
HTML + CSS + JavaScript
Room segregation
Rooms are strictly divided into:

ONE = 1 Sharing, capacity 1
TWO = 2 Sharing, capacity 2
THREE = 3 Sharing, capacity 3
Capacity is calculated automatically from the sharing type. The user does not enter capacity manually.

Backend
Create database pghostel.
Edit backend/src/main/resources/application.properties.
Run: mvn spring-boot:run
Frontend
Inside frontend: npm install npm run dev

Frontend: http://localhost:5173 Backend: http://localhost:8080

Main APIs
Rooms: GET /api/rooms GET /api/rooms/{id} GET /api/rooms/sharing/{sharingType} POST /api/rooms PUT /api/rooms/{id} DELETE /api/rooms/{id}

Candidates: GET /api/candidates GET /api/candidates/{id} POST /api/candidates PUT /api/candidates/{id} DELETE /api/candidates/{id}

Fees: GET /api/fees POST /api/fees?candidateId=1 POST /api/fees/{id}/payment

Room creation example
{ "roomNumber": "101", "sharingType": "ONE", "rent": 8000 }

The backend automatically sets: capacity = 1 occupied = 0 status = AVAILABLE
