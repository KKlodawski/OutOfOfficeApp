-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Czas generowania: 17 Lip 2024, 21:00
-- Wersja serwera: 10.4.27-MariaDB
-- Wersja PHP: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Baza danych: `outofoffice`
--

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `approvalrequests`
--

CREATE TABLE `approvalrequests` (
  `ID` int(11) NOT NULL,
  `Approver` int(11) DEFAULT NULL,
  `LeaveRequest` int(11) NOT NULL,
  `Status` enum('New','Approved','Rejected','Cancelled') NOT NULL DEFAULT 'New',
  `Comment` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Zrzut danych tabeli `approvalrequests`
--

INSERT INTO `approvalrequests` (`ID`, `Approver`, `LeaveRequest`, `Status`, `Comment`) VALUES
(8, 4, 5, 'Approved', NULL),
(9, 4, 1, 'Approved', NULL),
(10, NULL, 3, 'Cancelled', NULL),
(11, 5, 4, 'Rejected', 'You don\'t have enough free days to apply for leave'),
(12, NULL, 6, 'New', NULL);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `employees`
--

CREATE TABLE `employees` (
  `ID` int(11) NOT NULL,
  `FullName` varchar(100) NOT NULL,
  `Subdivision` varchar(50) NOT NULL,
  `Position` enum('HRManager','ProjectManager','Employee','Administrator') NOT NULL,
  `Status` enum('Active','Inactive') NOT NULL,
  `PeoplePartner` int(11) DEFAULT NULL,
  `OutOfOfficeBalance` int(11) NOT NULL,
  `Photo` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Zrzut danych tabeli `employees`
--

INSERT INTO `employees` (`ID`, `FullName`, `Subdivision`, `Position`, `Status`, `PeoplePartner`, `OutOfOfficeBalance`, `Photo`) VALUES
(1, 'Steven Cobb', 'NetworkAdministration', 'Administrator', 'Active', 8, 30, 'uploads\\employeePhoto1.jpg'),
(2, 'Skyla Hooper', 'NetworkAdministration', 'Administrator', 'Active', 7, 24, NULL),
(4, 'Rory Solomon', 'ProjectManagement', 'ProjectManager', 'Active', 8, 0, 'uploads\\employeePhoto4.jpg'),
(5, 'Griffin Higgins', 'ProjectManagement', 'ProjectManager', 'Active', 7, 15, 'uploads\\employeePhoto5.jpg'),
(6, 'Rayan Swanson', 'ProjectManagement', 'ProjectManager', 'Inactive', 7, 0, NULL),
(7, 'Karly Villegas', 'HumanResources', 'HRManager', 'Active', 8, 10, 'uploads\\employeePhoto7.jpg'),
(8, 'Fletcher Stephenson', 'HumanResources', 'HRManager', 'Active', 7, 20, 'uploads\\employeePhoto8.jpg'),
(10, 'Brent Strickland', 'Cybersecurity', 'Employee', 'Active', 7, 0, 'uploads\\employeePhoto10.jpg'),
(12, 'Kasey Stevens', 'Helpdesk', 'Employee', 'Active', 8, 21, 'uploads\\employeePhoto12.jpg'),
(13, 'Osvaldo Shaffer', 'SoftwareDevelopment', 'Employee', 'Active', 7, 9, 'uploads\\employeePhoto13.jpg'),
(14, 'Angeline Webb', 'QualityAssurance', 'Employee', 'Active', 7, 9, 'uploads\\employeePhoto14.jpg');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `employee_approvalrequest`
--

CREATE TABLE `employee_approvalrequest` (
  `EmployeeId` int(11) NOT NULL,
  `ApprovalRequestId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Zrzut danych tabeli `employee_approvalrequest`
--

INSERT INTO `employee_approvalrequest` (`EmployeeId`, `ApprovalRequestId`) VALUES
(4, 8),
(4, 9),
(5, 11),
(6, 12),
(7, 8),
(7, 9),
(7, 11),
(7, 12),
(8, 10);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `employee_project`
--

CREATE TABLE `employee_project` (
  `EmployeeID` int(11) NOT NULL,
  `ProjectID` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Zrzut danych tabeli `employee_project`
--

INSERT INTO `employee_project` (`EmployeeID`, `ProjectID`) VALUES
(1, 1),
(10, 1),
(10, 5),
(13, 2),
(14, 3);

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `leaverequests`
--

CREATE TABLE `leaverequests` (
  `ID` int(11) NOT NULL,
  `Employee` int(11) NOT NULL,
  `AbsenceReason` varchar(100) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date NOT NULL,
  `Comment` text DEFAULT NULL,
  `Status` enum('New','Submitted','Cancelled','Approved','Rejected') NOT NULL DEFAULT 'New'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Zrzut danych tabeli `leaverequests`
--

INSERT INTO `leaverequests` (`ID`, `Employee`, `AbsenceReason`, `StartDate`, `EndDate`, `Comment`, `Status`) VALUES
(1, 14, 'SickLeave', '2024-07-08', '2024-07-19', '', 'Approved'),
(2, 13, 'PersonalLeave', '2024-07-18', '2024-07-19', '', 'New'),
(3, 12, 'Vacation', '2024-07-08', '2024-07-19', NULL, 'Cancelled'),
(4, 10, 'PersonalLeave', '2024-07-24', '2024-07-26', 'flat change', 'Rejected'),
(5, 14, 'Vacation', '2024-07-22', '2024-07-26', 'Short Vacation', 'Approved'),
(6, 13, 'PersonalLeave', '2024-07-25', '2024-07-26', NULL, 'Submitted');

-- --------------------------------------------------------

--
-- Struktura tabeli dla tabeli `projects`
--

CREATE TABLE `projects` (
  `ID` int(11) NOT NULL,
  `ProjectType` varchar(50) NOT NULL,
  `StartDate` date NOT NULL,
  `EndDate` date DEFAULT NULL,
  `ProjectManager` int(11) NOT NULL,
  `Comment` text DEFAULT NULL,
  `Status` enum('Active','Inactive') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Zrzut danych tabeli `projects`
--

INSERT INTO `projects` (`ID`, `ProjectType`, `StartDate`, `EndDate`, `ProjectManager`, `Comment`, `Status`) VALUES
(1, 'Security', '2024-06-28', NULL, 5, '', 'Active'),
(2, 'SoftwareDevelopment', '2024-05-14', '2024-07-03', 6, 'A software development project', 'Inactive'),
(3, 'Infrastructure', '2024-07-05', NULL, 4, 'Installing faster RJ cables in offices', 'Active'),
(4, 'Infrastructure', '2024-06-13', '2024-06-30', 4, NULL, 'Inactive'),
(5, 'Security', '2024-06-01', NULL, 5, 'Updating security policies', 'Active');

--
-- Indeksy dla zrzutów tabel
--

--
-- Indeksy dla tabeli `approvalrequests`
--
ALTER TABLE `approvalrequests`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `Approver` (`Approver`),
  ADD KEY `LeaveRequest` (`LeaveRequest`);

--
-- Indeksy dla tabeli `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `PeoplePartner` (`PeoplePartner`);

--
-- Indeksy dla tabeli `employee_approvalrequest`
--
ALTER TABLE `employee_approvalrequest`
  ADD PRIMARY KEY (`EmployeeId`,`ApprovalRequestId`),
  ADD KEY `FK_Employee_ApprovalRequest_ApprovalRequest` (`ApprovalRequestId`);

--
-- Indeksy dla tabeli `employee_project`
--
ALTER TABLE `employee_project`
  ADD PRIMARY KEY (`EmployeeID`,`ProjectID`),
  ADD KEY `FK_EmployeeProject_Project` (`ProjectID`);

--
-- Indeksy dla tabeli `leaverequests`
--
ALTER TABLE `leaverequests`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `Employee` (`Employee`);

--
-- Indeksy dla tabeli `projects`
--
ALTER TABLE `projects`
  ADD PRIMARY KEY (`ID`),
  ADD KEY `ProjectManager` (`ProjectManager`);

--
-- AUTO_INCREMENT dla zrzuconych tabel
--

--
-- AUTO_INCREMENT dla tabeli `approvalrequests`
--
ALTER TABLE `approvalrequests`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT dla tabeli `employees`
--
ALTER TABLE `employees`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT dla tabeli `leaverequests`
--
ALTER TABLE `leaverequests`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT dla tabeli `projects`
--
ALTER TABLE `projects`
  MODIFY `ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Ograniczenia dla zrzutów tabel
--

--
-- Ograniczenia dla tabeli `approvalrequests`
--
ALTER TABLE `approvalrequests`
  ADD CONSTRAINT `approvalrequests_ibfk_1` FOREIGN KEY (`Approver`) REFERENCES `employees` (`ID`),
  ADD CONSTRAINT `approvalrequests_ibfk_2` FOREIGN KEY (`LeaveRequest`) REFERENCES `leaverequests` (`ID`);

--
-- Ograniczenia dla tabeli `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`PeoplePartner`) REFERENCES `employees` (`ID`);

--
-- Ograniczenia dla tabeli `employee_approvalrequest`
--
ALTER TABLE `employee_approvalrequest`
  ADD CONSTRAINT `FK_Employee_ApprovalRequest_ApprovalRequest` FOREIGN KEY (`ApprovalRequestId`) REFERENCES `approvalrequests` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_Employee_ApprovalRequest_Employee` FOREIGN KEY (`EmployeeId`) REFERENCES `employees` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `employee_project`
--
ALTER TABLE `employee_project`
  ADD CONSTRAINT `FK_EmployeeProject_Employee` FOREIGN KEY (`EmployeeID`) REFERENCES `employees` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `FK_EmployeeProject_Project` FOREIGN KEY (`ProjectID`) REFERENCES `projects` (`ID`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ograniczenia dla tabeli `leaverequests`
--
ALTER TABLE `leaverequests`
  ADD CONSTRAINT `leaverequests_ibfk_1` FOREIGN KEY (`Employee`) REFERENCES `employees` (`ID`);

--
-- Ograniczenia dla tabeli `projects`
--
ALTER TABLE `projects`
  ADD CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`ProjectManager`) REFERENCES `employees` (`ID`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
