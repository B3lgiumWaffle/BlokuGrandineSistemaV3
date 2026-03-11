-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 07, 2026 at 08:21 PM
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
-- Table structure for table `b_completed_listing_fragment`
--

CREATE TABLE `b_completed_listing_fragment` (
  `fragmentId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `fkMilestoneId` int(11) NOT NULL,
  `fkRequirementId` int(11) DEFAULT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `filePath` varchar(500) DEFAULT NULL,
  `submittedByUserId` int(11) NOT NULL,
  `submittedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `status` varchar(50) NOT NULL DEFAULT 'Submitted',
  `reviewComment` text DEFAULT NULL,
  `approvedByUserId` int(11) DEFAULT NULL,
  `approvedAt` datetime DEFAULT NULL,
  `releaseTxHash` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `b_contract`
--

CREATE TABLE `b_contract` (
  `contractId` int(11) NOT NULL,
  `fkInquiryId` int(11) NOT NULL,
  `fkClientUserId` int(11) NOT NULL,
  `fkProviderUserId` int(11) NOT NULL,
  `clientWalletAddress` varchar(255) DEFAULT NULL,
  `providerWalletAddress` varchar(255) DEFAULT NULL,
  `network` varchar(50) NOT NULL DEFAULT 'sepolia',
  `smartContractAddress` varchar(255) DEFAULT NULL,
  `chainProjectId` bigint(20) DEFAULT NULL,
  `agreedAmountEur` decimal(18,2) NOT NULL,
  `fundedAmountEth` decimal(18,8) DEFAULT NULL,
  `milestoneCount` int(11) NOT NULL,
  `milestoneAmountEth` decimal(18,8) DEFAULT NULL,
  `fundingTxHash` varchar(255) DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'PendingFunding',
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_contract`
--

INSERT INTO `b_contract` (`contractId`, `fkInquiryId`, `fkClientUserId`, `fkProviderUserId`, `clientWalletAddress`, `providerWalletAddress`, `network`, `smartContractAddress`, `chainProjectId`, `agreedAmountEur`, `fundedAmountEth`, `milestoneCount`, `milestoneAmountEth`, `fundingTxHash`, `status`, `createdAt`, `updatedAt`) VALUES
(3, 8, 2, 1, NULL, NULL, 'sepolia', NULL, NULL, 100.00, NULL, 2, NULL, NULL, 'PendingFunding', '2026-03-07 14:23:28', '2026-03-07 16:23:28');

-- --------------------------------------------------------

--
-- Table structure for table `b_contract_milestone`
--

CREATE TABLE `b_contract_milestone` (
  `milestoneId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `fkRequirementId` int(11) DEFAULT NULL,
  `milestoneNo` int(11) NOT NULL,
  `amountEth` decimal(18,8) DEFAULT NULL,
  `amountEurSnapshot` decimal(18,2) NOT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `releaseTxHash` varchar(255) DEFAULT NULL,
  `releasedAt` datetime DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_contract_milestone`
--

INSERT INTO `b_contract_milestone` (`milestoneId`, `fkContractId`, `fkRequirementId`, `milestoneNo`, `amountEth`, `amountEurSnapshot`, `status`, `releaseTxHash`, `releasedAt`, `createdAt`, `updatedAt`) VALUES
(5, 3, 16, 1, NULL, 50.00, 'Pending', NULL, NULL, '2026-03-07 14:23:28', '2026-03-07 16:23:28'),
(6, 3, 17, 2, NULL, 50.00, 'Pending', NULL, NULL, '2026-03-07 14:23:28', '2026-03-07 16:23:28');

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
(8, 4, 2, 'TESTAS', 100.00, '2026-03-07 14:23:12', 1, 'ACCEPTED', 0, '2026-03-07 14:23:28', NULL, 'SENDER', 0, 1);

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
(16, 8, 'ATASD', '/uploads/requirements/3d2408c158bb475685e81a3724756bd8.txt', '2026-03-05'),
(17, 8, 'ADASDASD', NULL, '2026-03-25');

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
-- Indexes for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  ADD PRIMARY KEY (`fragmentId`),
  ADD KEY `fk_fragment_submitted_by` (`submittedByUserId`),
  ADD KEY `fk_fragment_approved_by` (`approvedByUserId`),
  ADD KEY `idx_fragment_contract` (`fkContractId`),
  ADD KEY `idx_fragment_milestone` (`fkMilestoneId`),
  ADD KEY `idx_fragment_requirement` (`fkRequirementId`),
  ADD KEY `idx_fragment_status` (`status`);

--
-- Indexes for table `b_contract`
--
ALTER TABLE `b_contract`
  ADD PRIMARY KEY (`contractId`),
  ADD KEY `idx_contract_inquiry` (`fkInquiryId`),
  ADD KEY `idx_contract_client` (`fkClientUserId`),
  ADD KEY `idx_contract_provider` (`fkProviderUserId`),
  ADD KEY `idx_contract_status` (`status`);

--
-- Indexes for table `b_contract_milestone`
--
ALTER TABLE `b_contract_milestone`
  ADD PRIMARY KEY (`milestoneId`),
  ADD UNIQUE KEY `uq_contract_milestone_no` (`fkContractId`,`milestoneNo`),
  ADD KEY `idx_milestone_contract` (`fkContractId`),
  ADD KEY `idx_milestone_requirement` (`fkRequirementId`),
  ADD KEY `idx_milestone_status` (`status`);

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
-- AUTO_INCREMENT for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  MODIFY `fragmentId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_contract`
--
ALTER TABLE `b_contract`
  MODIFY `contractId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `b_contract_milestone`
--
ALTER TABLE `b_contract_milestone`
  MODIFY `milestoneId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  MODIFY `inquiryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

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
  MODIFY `requirementId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

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
-- Constraints for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  ADD CONSTRAINT `fk_fragment_approved_by` FOREIGN KEY (`approvedByUserId`) REFERENCES `b_user` (`UserId`),
  ADD CONSTRAINT `fk_fragment_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fragment_milestone` FOREIGN KEY (`fkMilestoneId`) REFERENCES `b_contract_milestone` (`milestoneId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fragment_submitted_by` FOREIGN KEY (`submittedByUserId`) REFERENCES `b_user` (`UserId`);

--
-- Constraints for table `b_contract`
--
ALTER TABLE `b_contract`
  ADD CONSTRAINT `fk_contract_client` FOREIGN KEY (`fkClientUserId`) REFERENCES `b_user` (`UserId`),
  ADD CONSTRAINT `fk_contract_inquiry` FOREIGN KEY (`fkInquiryId`) REFERENCES `b_inquiry` (`inquiryId`),
  ADD CONSTRAINT `fk_contract_provider` FOREIGN KEY (`fkProviderUserId`) REFERENCES `b_user` (`UserId`);

--
-- Constraints for table `b_contract_milestone`
--
ALTER TABLE `b_contract_milestone`
  ADD CONSTRAINT `fk_milestone_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_milestone_requirement` FOREIGN KEY (`fkRequirementId`) REFERENCES `b_requirement` (`requirementId`);

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
