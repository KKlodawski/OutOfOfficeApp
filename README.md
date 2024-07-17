# Out Of Office Application

## Structure
* Backend: C# ASP.NET
* Frontend: React.js with Typescript
* Database: MySQL database managed locally via XAMPP

## How to start
### Make sure ports 3000 and 5234 are available
- start xampp
- create database named 'outofoffice'
- insert sql code in database/sqlScript.sql
- navigate to webapp folder and type 'npm start'
- navigate to api/api folder and type 'dotnet run'

## Additional informations

* Webapp uses [shadcn](https://ui.shadcn.com) elements
* Requirements are in Test_Task_Out_of_Office_solution.pdf
* Database interactions are managed using Entity Framework Core with database-first approach

## Note on Login Procedure

Due to the absence of requirements for Login Procedure and the lack of specifications for daatabase structure to contain login credentials, I have choosen to design the main page as a selectable list for specific roles and users login into the system. This is intended to be a temporary measure until a proper login system is implemented.

Initially, I planned to add JWT authentication with verification to API. However, due to lack of login procedure, I have decided not to implement token based authentication.