-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 28, 2026 at 11:20 AM
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
-- Table structure for table `b_comments`
--

CREATE TABLE `b_comments` (
  `commentId` int(11) NOT NULL,
  `fkListingId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `fkUserId` int(11) NOT NULL,
  `commentText` text NOT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isVisible` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Table structure for table `b_completed_list_fragment_history`
--

CREATE TABLE `b_completed_list_fragment_history` (
  `historyId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `milestoneIndex` int(11) NOT NULL,
  `oldStatus` varchar(50) DEFAULT NULL,
  `newStatus` varchar(50) NOT NULL,
  `changedByUserId` int(11) NOT NULL,
  `changedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `note` text DEFAULT NULL,
  `delayInDays` int(11) NOT NULL DEFAULT 0,
  `isFinalState` tinyint(1) NOT NULL DEFAULT 0
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
(7, 12, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 1000.00, 1000.00000000, 3, 333.33333333, '0x3d0688540e44113d6500d81b0dc34f2c7cae968cee1fe6cb5ae2fbceabf55196', 'Completed', '2026-03-08 14:48:57', '2026-03-08 17:02:39'),
(8, 13, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 2, 750.00, 750.00000000, 3, 250.00000000, '0xd11c0cbcc0104c4a43dc3aeadc50e1f06ab807b279f2c73fbd96f22d5879d90e', 'Completed', '2026-03-08 15:04:49', '2026-03-08 17:06:02'),
(9, 14, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 20.00, 20.00000000, 1, 20.00000000, '0x35346650b99ca274115a45c9bd67ed1f6bd488f4e52cff5cb66c79eedd8aca07', 'Funded', '2026-03-08 15:08:53', '2026-03-26 20:25:40'),
(10, 16, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 400.00, 400.00000000, 2, 200.00000000, '0x42c1765ccf782183090483eebe7970ddeb3bad335d837261bb99280d6a5a62a6', 'Completed', '2026-03-11 13:30:13', '2026-03-11 15:31:11'),
(11, 17, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 5255.00, 5255.00000000, 2, 2627.50000000, '0xd3c347f52439abc45a33355fc7126c153be96a673d3a597fc7d63250afcdea96', 'Completed', '2026-03-13 11:03:27', '2026-03-13 13:04:41');

-- --------------------------------------------------------

--
-- Table structure for table `b_contract_history`
--

CREATE TABLE `b_contract_history` (
  `historyId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `oldStatus` varchar(50) DEFAULT NULL,
  `newStatus` varchar(50) NOT NULL,
  `changedByUserId` int(11) NOT NULL,
  `changedAt` datetime NOT NULL DEFAULT current_timestamp(),
  `note` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `b_contract_messages`
--

CREATE TABLE `b_contract_messages` (
  `messageId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `fkSenderUserId` int(11) NOT NULL,
  `fkReceiverUserId` int(11) NOT NULL,
  `messageText` text NOT NULL,
  `sentAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `readAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_contract_messages`
--

INSERT INTO `b_contract_messages` (`messageId`, `fkContractId`, `fkSenderUserId`, `fkReceiverUserId`, `messageText`, `sentAt`, `isRead`, `readAt`) VALUES
(1, 9, 1, 2, 'Labas vakaras', '2026-03-26 18:26:08', 1, '2026-03-26 18:26:17'),
(2, 9, 2, 1, 'Ar matei mano žinute?', '2026-03-26 18:26:45', 1, '2026-03-26 18:26:54'),
(3, 9, 2, 1, 'ĖĖĖ moli', '2026-03-26 18:27:10', 1, '2026-03-26 18:27:20'),
(4, 9, 2, 1, 'Ė Jokūbai klausyk skolas grąžink', '2026-03-26 18:28:16', 1, '2026-03-26 18:28:20'),
(5, 9, 2, 1, 'Test notifc', '2026-03-26 18:35:25', 1, '2026-03-26 18:42:24'),
(6, 9, 2, 1, 'dfsfs', '2026-03-27 11:16:00', 1, '2026-03-27 11:16:05'),
(7, 9, 1, 2, 'labas', '2026-03-27 11:16:10', 0, NULL);

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
(13, 7, 24, 1, 333.33000000, 333.33, 'Released', '0x1c776ed4106039123432eca36fc3e66e14a0f5658a927447a40f2a691c73fec9', '2026-03-08 15:01:41', '2026-03-08 14:48:57', '2026-03-08 17:01:41'),
(14, 7, 25, 2, 333.33000000, 333.33, 'Released', '0xafcd0db8e0d28ce8ad8b30571ec982e2c3c20d694adbc3045531de3169b25da8', '2026-03-08 15:02:24', '2026-03-08 14:48:57', '2026-03-08 17:02:24'),
(15, 7, 26, 3, 333.34000000, 333.34, 'Released', '0x79c2d08df868d0fb62a59ab2fb292050fce5bd98bd19adbf8b261fe7860342d1', '2026-03-08 15:02:39', '2026-03-08 14:48:57', '2026-03-08 17:02:39'),
(16, 8, 27, 1, 250.00000000, 250.00, 'Released', '0x0206021b4bb38189d2dc1471db9dd14bd590c64bb7247c1296249477fd665fb2', '2026-03-08 15:05:45', '2026-03-08 15:04:49', '2026-03-08 17:05:45'),
(17, 8, 28, 2, 250.00000000, 250.00, 'Released', '0x6a34dadef212444fa950d4ac3ef48816f8a892782b498e2ca17c48dba03e2751', '2026-03-08 15:05:58', '2026-03-08 15:04:49', '2026-03-08 17:05:58'),
(18, 8, 29, 3, 250.00000000, 250.00, 'Released', '0x8ae8fce2f1727586e82894ee64fa5b9d18620848573b2bcf43ad387368601d33', '2026-03-08 15:06:02', '2026-03-08 15:04:49', '2026-03-08 17:06:02'),
(19, 9, 30, 1, 20.00000000, 20.00, 'Pending', NULL, NULL, '2026-03-08 15:08:53', '2026-03-08 17:08:53'),
(20, 10, 32, 1, 200.00000000, 200.00, 'Released', '0xaf879ad0c0acb774ef6be5751d81b11b9be8307820db447cb6d6544f7a4ca562', '2026-03-11 13:31:07', '2026-03-11 13:30:13', '2026-03-11 15:31:07'),
(21, 10, 33, 2, 200.00000000, 200.00, 'Released', '0xcdec548d652311d27930df3e1f836107a4bf9c57a64518d8f20013ca8dd28f39', '2026-03-11 13:31:11', '2026-03-11 13:30:13', '2026-03-11 15:31:11'),
(22, 11, 34, 1, 2627.50000000, 2627.50, 'Released', '0x2f0fe1294328fd94264d2a9f07644ada38bf2b1b35c4fca9aa48609cb2bb0a86', '2026-03-13 11:04:34', '2026-03-13 11:03:28', '2026-03-13 13:04:34'),
(23, 11, 35, 2, 2627.50000000, 2627.50, 'Released', '0x5f52f275a86b8996fe7d6c00f6340c35fc930bced7d235bbf031231a694bcac7', '2026-03-13 11:04:41', '2026-03-13 11:03:28', '2026-03-13 13:04:41');

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
(12, 4, 2, 'asdasd', 1000.00, '2026-03-08 14:48:47', 1, 'ACCEPTED', 0, '2026-03-08 14:48:57', NULL, 'OWNER', 1, 1),
(13, 3, 2, 'Man reik graziai', 750.00, '2026-03-08 15:04:14', 1, 'ACCEPTED', 0, '2026-03-08 15:04:49', NULL, 'OWNER', 1, 1),
(14, 4, 2, 'asd', 20.00, '2026-03-08 15:08:02', 1, 'ACCEPTED', 0, '2026-03-08 15:08:53', NULL, 'OWNER', 1, 1),
(16, 6, 2, 'Testas', 400.00, '2026-03-11 13:30:03', 1, 'ACCEPTED', 0, '2026-03-11 13:30:13', NULL, 'OWNER', 1, 1),
(17, 4, 2, 'dfs', 5255.00, '2026-03-13 11:03:12', 1, 'ACCEPTED', 0, '2026-03-13 11:03:28', NULL, 'OWNER', 1, 0);

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
  `CategoryId` int(11) NOT NULL,
  `isActivated` bit(1) NOT NULL DEFAULT b'0',
  `adminComment` varchar(1000) CHARACTER SET utf8 COLLATE utf8_general_ci DEFAULT NULL,
  `reviewedAt` datetime DEFAULT NULL,
  `fkReviewedByUserId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_listing`
--

INSERT INTO `b_listing` (`listingId`, `userId`, `Title`, `PriceFrom`, `PriceTo`, `Description`, `CompletionTime`, `UploadTime`, `CategoryId`, `isActivated`, `adminComment`, `reviewedAt`, `fkReviewedByUserId`) VALUES
(3, 1, 'Job2', 67.00, 420.00, 'dfasON[KJDSF', '2 weeks pwo', '2026-02-19 17:11:16', 1, b'1', NULL, NULL, NULL),
(4, 1, 'Naujas darbukas', 412.00, 42545.00, 'asdasd kk', 'asda', '2026-02-19 17:49:36', 1, b'1', NULL, '2026-03-11 13:23:15', 3),
(6, 1, 'Tempo', 1.00, 2.00, '9415', '512', '2026-03-11 13:23:42', 1, b'1', NULL, '2026-03-11 13:23:58', 3),
(7, 1, 'wfwef', 455.00, 800.00, 'asdsadad', 'asd', '2026-03-13 11:10:02', 1, b'1', NULL, '2026-03-13 11:10:36', 3),
(8, 1, 'Aptarimas', 10.00, 1000.00, 'AS SUKURIU SISTEMAS A..Z uzfasd', '4 week', '2026-03-13 11:45:03', 1, b'0', NULL, NULL, NULL);

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
-- Table structure for table `b_message`
--

CREATE TABLE `b_message` (
  `messageId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `fkSenderUserId` int(11) NOT NULL,
  `fkReceiverUserId` int(11) NOT NULL,
  `messageText` text NOT NULL,
  `sentAt` datetime NOT NULL DEFAULT current_timestamp(),
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `isEdited` tinyint(1) NOT NULL DEFAULT 0,
  `editedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `b_notifications`
--

CREATE TABLE `b_notifications` (
  `notificationId` int(11) NOT NULL,
  `fkUserId` int(11) NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` varchar(1000) DEFAULT NULL,
  `type` varchar(100) NOT NULL,
  `referenceId` int(11) DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_notifications`
--

INSERT INTO `b_notifications` (`notificationId`, `fkUserId`, `title`, `message`, `type`, `referenceId`, `isRead`, `createdAt`) VALUES
(1, 1, 'Listing rejected', 'Photo is not acceptable, listen change the photo', 'ListingRejected', 4, 1, '2026-03-11 13:18:36'),
(2, 1, 'Listing rejected', 'Photo is not acceptable, listen change the photo', 'ListingRejected', 4, 1, '2026-03-11 13:23:04'),
(3, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 4, 1, '2026-03-11 13:23:15'),
(4, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 6, 1, '2026-03-11 13:23:58'),
(5, 1, 'Listing rejected', 'asdadasdad', 'ListingRejected', 7, 1, '2026-03-13 11:10:22'),
(6, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 7, 1, '2026-03-13 11:10:36'),
(7, 1, 'New message', 'povilas sent you a message: Test notifc', 'contract_message', 9, 1, '2026-03-26 18:35:25'),
(8, 1, 'New message', 'povilas sent you a message: dfsfs', 'contract_message', 9, 1, '2026-03-27 11:16:00'),
(9, 2, 'New message', 'jokubas sent you a message: labas', 'contract_message', 9, 0, '2026-03-27 11:16:10');

-- --------------------------------------------------------

--
-- Table structure for table `b_rating`
--

CREATE TABLE `b_rating` (
  `ratingId` int(11) NOT NULL,
  `fkContractId` int(11) NOT NULL,
  `fkListingId` int(11) NOT NULL,
  `fkFromUserId` int(11) NOT NULL,
  `fkToUserId` int(11) NOT NULL,
  `userRating` int(11) DEFAULT NULL,
  `userRatingComment` text DEFAULT NULL,
  `systemRating` decimal(4,2) DEFAULT NULL,
  `systemRatingReason` text DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ;

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
(24, 12, 'asdasdasd', NULL, '2026-02-24'),
(25, 12, 'asdasdasd', NULL, '2026-03-12'),
(26, 12, 'asdasdasdasd', NULL, '2026-04-01'),
(27, 13, '645asdasdasd', NULL, '2026-03-02'),
(28, 13, 'asd asdasdasd', NULL, '2026-03-13'),
(29, 13, 'asdasdasd', NULL, '2026-03-26'),
(30, 14, 'sad', NULL, '2026-03-11'),
(32, 16, 'greitas', NULL, '2026-03-05'),
(33, 16, 'kitas greitukas', NULL, '2026-03-19'),
(34, 17, 'sdfs', NULL, '2026-03-24'),
(35, 17, 'sdfs', NULL, '2026-03-25');

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
  `lastname` varchar(50) DEFAULT NULL,
  `Website` text DEFAULT NULL,
  `WalletAddress` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_user`
--

INSERT INTO `b_user` (`UserId`, `Username`, `Email`, `PasswordHash`, `RoleId`, `avatar`, `firstname`, `lastname`, `Website`, `WalletAddress`) VALUES
(1, 'jokubas', 'jokubas2@gmail.com', '$2a$11$0KxJEsSmgRyRVnPMt/82OOKYovUP1/GmdOrgBzyFHPcsy23lMCh9e', 3, '/uploads/avatars/u1_454920d5f8f14e16b561a48435e83126.jpg', 'Jokubukas', 'grazuolis', '', '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266'),
(2, 'povilas', 'povilas@gmail.com', '$2a$11$lH7TtHIIEnBkwux6HAVzb.ETNTmO30v70C/mJNL.7KSHSZaNUIcCi', 2, '/uploads/avatars/u2_f311435ce02f4f0181d36397835c622d.jpg', 'Povilas', 'Jakstas', '', '0x70997970c51812dc3a010c7d01b50e0d17dc79c8'),
(3, 'admin1', 'admin@gmail.com', '$2a$11$qxTBTwvrSRYZiV6msmCwmua7va7ntnfcI61w2Acdx8b7t6iXr5OAW', 1, NULL, NULL, NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `b_category`
--
ALTER TABLE `b_category`
  ADD PRIMARY KEY (`CategoryId`);

--
-- Indexes for table `b_comments`
--
ALTER TABLE `b_comments`
  ADD PRIMARY KEY (`commentId`),
  ADD KEY `fk_comments_listing` (`fkListingId`),
  ADD KEY `fk_comments_contract` (`fkContractId`),
  ADD KEY `fk_comments_user` (`fkUserId`);

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
-- Indexes for table `b_completed_list_fragment_history`
--
ALTER TABLE `b_completed_list_fragment_history`
  ADD PRIMARY KEY (`historyId`),
  ADD KEY `fk_fragment_history_contract` (`fkContractId`),
  ADD KEY `fk_fragment_history_user` (`changedByUserId`);

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
-- Indexes for table `b_contract_history`
--
ALTER TABLE `b_contract_history`
  ADD PRIMARY KEY (`historyId`),
  ADD KEY `fk_contract_history_contract` (`fkContractId`),
  ADD KEY `fk_contract_history_user` (`changedByUserId`);

--
-- Indexes for table `b_contract_messages`
--
ALTER TABLE `b_contract_messages`
  ADD PRIMARY KEY (`messageId`),
  ADD KEY `fk_bcm_sender` (`fkSenderUserId`),
  ADD KEY `idx_bcm_contract_sentAt` (`fkContractId`,`sentAt`),
  ADD KEY `idx_bcm_receiver_isRead` (`fkReceiverUserId`,`isRead`);

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
-- Indexes for table `b_message`
--
ALTER TABLE `b_message`
  ADD PRIMARY KEY (`messageId`),
  ADD KEY `fk_message_contract` (`fkContractId`),
  ADD KEY `fk_message_sender` (`fkSenderUserId`),
  ADD KEY `fk_message_receiver` (`fkReceiverUserId`);

--
-- Indexes for table `b_notifications`
--
ALTER TABLE `b_notifications`
  ADD PRIMARY KEY (`notificationId`),
  ADD KEY `FK_b_notifications_b_users` (`fkUserId`);

--
-- Indexes for table `b_rating`
--
ALTER TABLE `b_rating`
  ADD PRIMARY KEY (`ratingId`),
  ADD UNIQUE KEY `uq_rating_contract` (`fkContractId`),
  ADD KEY `fk_rating_listing` (`fkListingId`),
  ADD KEY `fk_rating_from_user` (`fkFromUserId`),
  ADD KEY `fk_rating_to_user` (`fkToUserId`);

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
-- AUTO_INCREMENT for table `b_comments`
--
ALTER TABLE `b_comments`
  MODIFY `commentId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  MODIFY `fragmentId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_completed_list_fragment_history`
--
ALTER TABLE `b_completed_list_fragment_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_contract`
--
ALTER TABLE `b_contract`
  MODIFY `contractId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `b_contract_history`
--
ALTER TABLE `b_contract_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_contract_messages`
--
ALTER TABLE `b_contract_messages`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `b_contract_milestone`
--
ALTER TABLE `b_contract_milestone`
  MODIFY `milestoneId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  MODIFY `inquiryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `b_listing`
--
ALTER TABLE `b_listing`
  MODIFY `listingId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `b_listing_photo`
--
ALTER TABLE `b_listing_photo`
  MODIFY `photoId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `b_message`
--
ALTER TABLE `b_message`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_notifications`
--
ALTER TABLE `b_notifications`
  MODIFY `notificationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `b_rating`
--
ALTER TABLE `b_rating`
  MODIFY `ratingId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_requirement`
--
ALTER TABLE `b_requirement`
  MODIFY `requirementId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `b_role`
--
ALTER TABLE `b_role`
  MODIFY `RoleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `b_user`
--
ALTER TABLE `b_user`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `b_comments`
--
ALTER TABLE `b_comments`
  ADD CONSTRAINT `fk_comments_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comments_listing` FOREIGN KEY (`fkListingId`) REFERENCES `b_listing` (`listingId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_comments_user` FOREIGN KEY (`fkUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  ADD CONSTRAINT `fk_fragment_approved_by` FOREIGN KEY (`approvedByUserId`) REFERENCES `b_user` (`UserId`),
  ADD CONSTRAINT `fk_fragment_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fragment_milestone` FOREIGN KEY (`fkMilestoneId`) REFERENCES `b_contract_milestone` (`milestoneId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_fragment_submitted_by` FOREIGN KEY (`submittedByUserId`) REFERENCES `b_user` (`UserId`);

--
-- Constraints for table `b_completed_list_fragment_history`
--
ALTER TABLE `b_completed_list_fragment_history`
  ADD CONSTRAINT `fk_fragment_history_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_fragment_history_user` FOREIGN KEY (`changedByUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_contract`
--
ALTER TABLE `b_contract`
  ADD CONSTRAINT `fk_contract_client` FOREIGN KEY (`fkClientUserId`) REFERENCES `b_user` (`UserId`),
  ADD CONSTRAINT `fk_contract_inquiry` FOREIGN KEY (`fkInquiryId`) REFERENCES `b_inquiry` (`inquiryId`),
  ADD CONSTRAINT `fk_contract_provider` FOREIGN KEY (`fkProviderUserId`) REFERENCES `b_user` (`UserId`);

--
-- Constraints for table `b_contract_history`
--
ALTER TABLE `b_contract_history`
  ADD CONSTRAINT `fk_contract_history_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_contract_history_user` FOREIGN KEY (`changedByUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_contract_messages`
--
ALTER TABLE `b_contract_messages`
  ADD CONSTRAINT `fk_bcm_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bcm_receiver` FOREIGN KEY (`fkReceiverUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_bcm_sender` FOREIGN KEY (`fkSenderUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE;

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
-- Constraints for table `b_message`
--
ALTER TABLE `b_message`
  ADD CONSTRAINT `fk_message_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_message_receiver` FOREIGN KEY (`fkReceiverUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_message_sender` FOREIGN KEY (`fkSenderUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `b_notifications`
--
ALTER TABLE `b_notifications`
  ADD CONSTRAINT `FK_b_notifications_b_users` FOREIGN KEY (`fkUserId`) REFERENCES `b_user` (`UserId`);

--
-- Constraints for table `b_rating`
--
ALTER TABLE `b_rating`
  ADD CONSTRAINT `fk_rating_contract` FOREIGN KEY (`fkContractId`) REFERENCES `b_contract` (`contractId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rating_from_user` FOREIGN KEY (`fkFromUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rating_listing` FOREIGN KEY (`fkListingId`) REFERENCES `b_listing` (`listingId`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_rating_to_user` FOREIGN KEY (`fkToUserId`) REFERENCES `b_user` (`UserId`) ON DELETE CASCADE ON UPDATE CASCADE;

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
