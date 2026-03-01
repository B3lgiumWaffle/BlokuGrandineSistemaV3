-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 01, 2026 at 10:20 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `bakalauras`
--

-- --------------------------------------------------------

--
-- Table structure for table `b_category`
--

CREATE TABLE `b_category` (
  `CategoryId` int(11) NOT NULL,
  `Title` varchar(100) NOT NULL,
  `Description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_category`
--

INSERT INTO `b_category` (`CategoryId`, `Title`, `Description`) VALUES
(1, 'Programming', 'Programming description!!');

-- --------------------------------------------------------

--
-- Table structure for table `b_inquiry`
--

CREATE TABLE `b_inquiry` (
  `inquiryId` int(11) NOT NULL,
  `fk_listingId` int(11) NOT NULL,
  `fk_userId` int(11) DEFAULT NULL,
  `description` text NOT NULL,
  `proposedSum` decimal(10,2) DEFAULT NULL,
  `creationDate` datetime NOT NULL DEFAULT current_timestamp(),
  `isConfirmed` tinyint(1) NOT NULL DEFAULT 0,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING',
  `isModified` tinyint(1) NOT NULL DEFAULT 0,
  `modifiedAt` datetime DEFAULT NULL,
  `modifiedNote` text DEFAULT NULL,
  `lastModifiedBy` varchar(10) NOT NULL DEFAULT 'SENDER',
  `ownerSeen` tinyint(1) NOT NULL DEFAULT 1,
  `senderSeen` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_inquiry`
--

INSERT INTO `b_inquiry` (`inquiryId`, `fk_listingId`, `fk_userId`, `description`, `proposedSum`, `creationDate`, `isConfirmed`, `status`, `isModified`, `modifiedAt`, `modifiedNote`, `lastModifiedBy`, `ownerSeen`, `senderSeen`) VALUES
(5, 3, 2, 'Duok sita KO TU NORI', 150.00, '2026-03-01 18:55:26', 0, 'PENDING', 0, '2026-03-01 21:19:28', NULL, 'SENDER', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `b_listing`
--

CREATE TABLE `b_listing` (
  `listingId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `Title` varchar(200) NOT NULL,
  `PriceFrom` decimal(10,2) DEFAULT NULL,
  `PriceTo` decimal(10,2) DEFAULT NULL,
  `Description` text DEFAULT NULL,
  `CompletionTime` varchar(100) DEFAULT NULL,
  `UploadTime` datetime NOT NULL DEFAULT current_timestamp(),
  `CategoryId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_listing`
--

INSERT INTO `b_listing` (`listingId`, `userId`, `Title`, `PriceFrom`, `PriceTo`, `Description`, `CompletionTime`, `UploadTime`, `CategoryId`) VALUES
(3, 1, 'Job2', 67.00, 420.00, 'dfasON[KJDSF', '2 weeks pwo', '2026-02-19 17:11:16', 1),
(4, 1, 'Naujas darbukas', 412.00, 42545.00, 'asdasd', 'asda', '2026-02-19 17:49:36', 1);

-- --------------------------------------------------------

--
-- Table structure for table `b_listing_photo`
--

CREATE TABLE `b_listing_photo` (
  `photoId` int(11) NOT NULL,
  `listingId` int(11) NOT NULL,
  `PhotoUrl` varchar(500) NOT NULL,
  `IsPrimary` tinyint(1) NOT NULL DEFAULT 0,
  `UploadTime` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_listing_photo`
--

INSERT INTO `b_listing_photo` (`photoId`, `listingId`, `PhotoUrl`, `IsPrimary`, `UploadTime`) VALUES
(1, 3, '/uploads/listings/3/p_598fcdbc6a18437484eba7d377979634.jpg', 0, '2026-02-19 17:11:17'),
(2, 3, '/uploads/listings/3/p_46b58938ebf44af2aecbac68c982d908.jpg', 1, '2026-02-19 17:11:17'),
(3, 3, '/uploads/listings/3/p_c5020738570549d2a39e6310cc823a25.jpg', 0, '2026-02-19 17:11:17'),
(6, 4, '/uploads/listings/4/p_773e07bc394a4f03888542c036588637.jpg', 1, '2026-02-19 17:49:36');

-- --------------------------------------------------------

--
-- Table structure for table `b_requirement`
--

CREATE TABLE `b_requirement` (
  `requirementId` int(11) NOT NULL,
  `fk_inquiryId` int(11) NOT NULL,
  `description` text NOT NULL,
  `fileUrl` varchar(500) DEFAULT NULL,
  `forseenCompletionDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_requirement`
--

INSERT INTO `b_requirement` (`requirementId`, `fk_inquiryId`, `description`, `fileUrl`, `forseenCompletionDate`) VALUES
(8, 5, 'Req 1', NULL, '2026-03-05'),
(9, 5, 'Req 2', '/uploads/requirements/e719b86938d441599a077cd43fdd6986.txt', '2026-03-25'),
(10, 5, 'No nenori', NULL, NULL),
(11, 5, 'DAsfasdfasfasdfasd', NULL, '2026-07-02');

-- --------------------------------------------------------

--
-- Table structure for table `b_role`
--

CREATE TABLE `b_role` (
  `RoleId` int(11) NOT NULL,
  `RoleName` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_role`
--

INSERT INTO `b_role` (`RoleId`, `RoleName`) VALUES
(1, 'Admin'),
(3, 'Seller'),
(2, 'User');

-- --------------------------------------------------------

--
-- Table structure for table `b_user`
--

CREATE TABLE `b_user` (
  `UserId` int(11) NOT NULL,
  `Username` varchar(50) NOT NULL,
  `Email` varchar(100) NOT NULL,
  `PasswordHash` varchar(255) NOT NULL,
  `RoleId` int(11) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `firstname` varchar(50) DEFAULT NULL,
  `lastname` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_user`
--

INSERT INTO `b_user` (`UserId`, `Username`, `Email`, `PasswordHash`, `RoleId`, `avatar`, `firstname`, `lastname`) VALUES
(1, 'jokubas', 'jokubas2@gmail.com', '$2a$11$0KxJEsSmgRyRVnPMt/82OOKYovUP1/GmdOrgBzyFHPcsy23lMCh9e', 2, '/uploads/avatars/u1_454920d5f8f14e16b561a48435e83126.jpg', 'Jokubukas', 'grazuolis'),
(2, 'povilas', 'povilas@gmail.com', '$2a$11$lH7TtHIIEnBkwux6HAVzb.ETNTmO30v70C/mJNL.7KSHSZaNUIcCi', 2, '/uploads/avatars/u2_f311435ce02f4f0181d36397835c622d.jpg', 'Povilas', 'Jakstas');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `b_category`
--
ALTER TABLE `b_category`
  ADD PRIMARY KEY (`CategoryId`);

--
-- Indexes for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  ADD PRIMARY KEY (`inquiryId`),
  ADD KEY `idx_inquiry_listing` (`fk_listingId`),
  ADD KEY `idx_inquiry_user` (`fk_userId`);

--
-- Indexes for table `b_listing`
--
ALTER TABLE `b_listing`
  ADD PRIMARY KEY (`listingId`),
  ADD KEY `idx_listing_userId` (`userId`),
  ADD KEY `idx_listing_uploadTime` (`UploadTime`);

--
-- Indexes for table `b_listing_photo`
--
ALTER TABLE `b_listing_photo`
  ADD PRIMARY KEY (`photoId`),
  ADD KEY `idx_photo_listingId` (`listingId`),
  ADD KEY `idx_photo_primary` (`listingId`,`IsPrimary`);

--
-- Indexes for table `b_requirement`
--
ALTER TABLE `b_requirement`
  ADD PRIMARY KEY (`requirementId`),
  ADD KEY `idx_req_inquiry` (`fk_inquiryId`);

--
-- Indexes for table `b_role`
--
ALTER TABLE `b_role`
  ADD PRIMARY KEY (`RoleId`),
  ADD UNIQUE KEY `uq_role_name` (`RoleName`);

--
-- Indexes for table `b_user`
--
ALTER TABLE `b_user`
  ADD PRIMARY KEY (`UserId`),
  ADD UNIQUE KEY `uq_user_username` (`Username`),
  ADD UNIQUE KEY `uq_user_email` (`Email`),
  ADD KEY `fk_user_role` (`RoleId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `b_category`
--
ALTER TABLE `b_category`
  MODIFY `CategoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  MODIFY `inquiryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `b_listing`
--
ALTER TABLE `b_listing`
  MODIFY `listingId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `b_listing_photo`
--
ALTER TABLE `b_listing_photo`
  MODIFY `photoId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `b_requirement`
--
ALTER TABLE `b_requirement`
  MODIFY `requirementId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `b_role`
--
ALTER TABLE `b_role`
  MODIFY `RoleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `b_user`
--
ALTER TABLE `b_user`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  ADD CONSTRAINT `fk_inquiry_listing` FOREIGN KEY (`fk_listingId`) REFERENCES `b_listing` (`listingId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_inquiry_user` FOREIGN KEY (`fk_userId`) REFERENCES `b_user` (`UserId`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `b_listing`
--
ALTER TABLE `b_listing`
  ADD CONSTRAINT `fk_listing_user` FOREIGN KEY (`userId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_listing_photo`
--
ALTER TABLE `b_listing_photo`
  ADD CONSTRAINT `fk_photo_listing` FOREIGN KEY (`listingId`) REFERENCES `b_listing` (`listingId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_requirement`
--
ALTER TABLE `b_requirement`
  ADD CONSTRAINT `fk_requirement_inquiry` FOREIGN KEY (`fk_inquiryId`) REFERENCES `b_inquiry` (`inquiryId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_user`
--
ALTER TABLE `b_user`
  ADD CONSTRAINT `fk_user_role` FOREIGN KEY (`RoleId`) REFERENCES `b_role` (`RoleId`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
