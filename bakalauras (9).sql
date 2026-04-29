-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 29, 2026 at 06:45 PM
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
(1, 'Programming', 'Programming description!!'),
(2, 'No category', 'Used when a deleted category is reassigned.'),
(3, 'Web design', 'Category used for designing web applications'),
(4, 'Logo design', 'Category used for single or multiple logo designs');

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

--
-- Dumping data for table `b_comments`
--

INSERT INTO `b_comments` (`commentId`, `fkListingId`, `fkContractId`, `fkUserId`, `commentText`, `createdAt`, `isVisible`) VALUES
(5, 11, 29, 4, 'Very good job, just slow worker', '2026-04-22 18:27:04', 1),
(6, 11, 32, 4, 'Good job!', '2026-04-28 15:51:58', 0),
(7, 11, 32, 4, 'Good Job!', '2026-04-28 15:52:15', 1),
(8, 11, 31, 4, 'Good job!', '2026-04-28 15:52:59', 1);

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

--
-- Dumping data for table `b_completed_listing_fragment`
--

INSERT INTO `b_completed_listing_fragment` (`fragmentId`, `fkContractId`, `fkMilestoneId`, `fkRequirementId`, `title`, `description`, `filePath`, `submittedByUserId`, `submittedAt`, `status`, `reviewComment`, `approvedByUserId`, `approvedAt`, `releaseTxHash`, `createdAt`, `updatedAt`) VALUES
(57, 29, 53, 65, 'First fragment title', 'First fragment', NULL, 1, '2026-04-22 17:37:54', 'Approved', 'Approved with full payout.', 4, '2026-04-22 17:55:25', '0x36a2503e7610d67df13cecc2c267f0f6d9d067a5901bb8798371d4c903dd06ee', '2026-04-22 17:37:54', '2026-04-22 20:55:25'),
(58, 29, 54, 66, 'Test', 'test', NULL, 1, '2026-04-22 18:07:38', 'Approved', 'Approved with full payout.', 4, '2026-04-22 18:07:50', '0xd90b48a48f0c1a56cf9aa5fbafe91f2738066576eb2d09a087ffbfdaaee79404', '2026-04-22 18:07:38', '2026-04-22 21:07:50'),
(60, 30, 55, 68, 'Test', 'Test', NULL, 1, '2026-04-22 19:34:39', 'Approved', 'Approved with full payout.', 4, '2026-04-22 19:34:47', '0xe50f0edaa6509b50780d6ce8f5891e62f2a957746eaa7a95ac56a54de80405b8', '2026-04-22 19:34:39', '2026-04-22 22:34:47'),
(61, 31, 57, 70, 'test', NULL, NULL, 1, '2026-04-23 17:02:13', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-23 17:02:17', NULL, '2026-04-23 17:02:13', '2026-04-23 20:02:17'),
(62, 31, 57, 70, 'Test', 'test', NULL, 1, '2026-04-23 17:02:22', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-23 17:02:25', NULL, '2026-04-23 17:02:22', '2026-04-23 20:02:25'),
(63, 31, 57, 70, 'Correct', NULL, NULL, 1, '2026-04-23 17:02:32', 'ApprovedPartial', 'Approved with partial payout (15% refund) because rejected fragments for this milestone exceeded the agreed threshold (2).', 4, '2026-04-23 17:02:40', '0x91b2544b7f92e6252a40bb53793269ad704c76e2d18ddc368ac99437f0648f6a', '2026-04-23 17:02:32', '2026-04-23 20:02:40'),
(64, 31, 58, 71, 'Good', NULL, NULL, 1, '2026-04-23 17:02:45', 'Approved', 'Approved with full payout.', 4, '2026-04-23 17:02:52', '0x52c28c5bc3bbdedd702e8af910f1b11865356798811e4ba26c9fa3da8f088627', '2026-04-23 17:02:45', '2026-04-23 20:02:52'),
(65, 32, 59, 72, 'Test', 'asd', NULL, 1, '2026-04-24 08:24:21', 'Approved', 'Approved with partial payout (0% refund) because fragment was submitted after milestone deadline; last fragment was submitted after contract deadline; fragment speed score was below the agreed threshold; delivery was late.', 4, '2026-04-24 08:25:25', '0x2673245e7790b0afce7c60c99a28877d2c6ca06795b13469249128a07d613fc7', '2026-04-24 08:24:21', '2026-04-24 11:25:25'),
(66, 33, 60, 73, 'First job complete', 'I did what you asked, does anything need correcting?', NULL, 1, '2026-04-28 17:20:13', 'Approved', 'Approved with full payout.', 4, '2026-04-28 17:23:11', '0xf992b46b6c2455d35793f377ca46567f1e60ce5a5163a0c71642ab5fa4bdba36', '2026-04-28 17:20:13', '2026-04-28 20:23:11'),
(67, 33, 61, 74, 'Bad fragment', NULL, NULL, 1, '2026-04-28 17:31:48', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:31:53', NULL, '2026-04-28 17:31:48', '2026-04-28 20:31:53'),
(68, 33, 61, 74, 'Final version', 'I fixed the last fragment and added new changes.', NULL, 1, '2026-04-28 17:33:07', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:33:25', NULL, '2026-04-28 17:33:07', '2026-04-28 20:33:25'),
(69, 33, 61, 74, 'Fixed fragment again', 'I did the changes you asked. I hope its good now.', '/uploads/requirements/548cbdea873c4234a5a3e685e62a663a.rar', 1, '2026-04-28 17:34:02', 'Approved', 'Approved with full payout.', 4, '2026-04-28 17:40:18', '0x3aa361b82f6b31bc2ed2a6788845eac18e7387972ad24dbec85ab1119271cd49', '2026-04-28 17:34:02', '2026-04-28 20:40:18'),
(70, 34, 62, 75, 'Good', NULL, NULL, 1, '2026-04-28 17:43:59', 'Approved', 'Approved with full payout.', 4, '2026-04-28 17:44:06', '0xc03548cf5865c51783849c1f4bcd933ed008ef9e6c66117c01ca60dbc37da34d', '2026-04-28 17:43:59', '2026-04-28 20:44:06'),
(71, 34, 63, 76, 'Bad', NULL, NULL, 1, '2026-04-28 17:44:12', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:44:17', NULL, '2026-04-28 17:44:12', '2026-04-28 20:44:17'),
(72, 34, 63, 76, 'Bad', NULL, NULL, 1, '2026-04-28 17:44:22', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:44:26', NULL, '2026-04-28 17:44:22', '2026-04-28 20:44:26'),
(73, 34, 63, 76, 'bad', NULL, NULL, 1, '2026-04-28 17:44:34', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:44:38', NULL, '2026-04-28 17:44:34', '2026-04-28 20:44:38'),
(74, 34, 63, 76, 'IFixed fragment again', 'I did the changes you asked, i hope its good now.', '/uploads/requirements/b64b3e73bcd24262a1ff063f0c99337c.rar', 1, '2026-04-28 17:45:06', 'ApprovedPartial', 'Approved with partial payout (50% refund) because rejected fragments for this milestone exceeded the agreed threshold (3).', 4, '2026-04-28 17:45:16', '0xf2f25c438c39010187271c2d5633a9dee05de3f57345a80f9901a9646cf5a776', '2026-04-28 17:45:06', '2026-04-28 20:45:16'),
(75, 35, 64, 77, 't', NULL, NULL, 1, '2026-04-28 17:52:58', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:53:01', NULL, '2026-04-28 17:52:58', '2026-04-28 20:53:01'),
(76, 35, 64, 77, 't', NULL, NULL, 1, '2026-04-28 17:53:05', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 17:53:08', NULL, '2026-04-28 17:53:05', '2026-04-28 20:53:08'),
(77, 35, 64, 77, 't', NULL, NULL, 1, '2026-04-28 17:53:12', 'ApprovedPartial', 'Approved with partial payout (50% refund) because rejected fragments for this milestone exceeded the agreed threshold (2).', 4, '2026-04-28 17:53:18', '0x7cad52f6b79432e4427eb8fdd34c4fc24a4e764b14d99f6ddf1370a98bb3935e', '2026-04-28 17:53:12', '2026-04-28 20:53:18'),
(79, 36, 65, 78, 'Rough sketch', 'File is uploaded for you to check', '/uploads/requirements/744c35c2d1b2412985161fb5c7e02c44.rar', 1, '2026-04-28 20:04:06', 'Approved', 'Approved with full payout.', 4, '2026-04-28 20:19:41', '0x449e590276d03a5936cea1481c4b8efc3234062676978ea71be0f8b5086745d4', '2026-04-28 20:04:06', '2026-04-28 23:19:41'),
(80, 36, 66, 79, 'Uploaded by mistake', NULL, NULL, 1, '2026-04-28 20:19:28', 'Rejected', 'Rejected by client. Please revise and resubmit.', 4, '2026-04-28 20:19:36', NULL, '2026-04-28 20:19:28', '2026-04-28 23:19:36'),
(81, 36, 66, 79, 'Final upload', 'Final upload', NULL, 1, '2026-04-28 20:22:11', 'Approved', 'Approved with full payout.', 4, '2026-04-28 20:22:19', '0x5e70aded588117306cbcaf4349615777b473a282e2a9ada07f86a992f4d0919a', '2026-04-28 20:22:11', '2026-04-28 23:22:19');

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

--
-- Dumping data for table `b_completed_list_fragment_history`
--

INSERT INTO `b_completed_list_fragment_history` (`historyId`, `fkContractId`, `milestoneIndex`, `oldStatus`, `newStatus`, `changedByUserId`, `changedAt`, `note`, `delayInDays`, `isFinalState`) VALUES
(124, 29, 1, 'Pending', 'Submitted', 1, '2026-04-22 17:37:54', 'Fragment submitted: First fragment title', 0, 0),
(125, 29, 1, 'Submitted', 'Approved', 4, '2026-04-22 17:55:25', 'Approved with full payout.', 0, 1),
(126, 29, 2, 'Pending', 'Submitted', 1, '2026-04-22 18:07:38', 'Fragment submitted: Test', 0, 0),
(127, 29, 2, 'Submitted', 'Approved', 4, '2026-04-22 18:07:50', 'Approved with full payout.', 0, 1),
(128, 30, 1, 'Submitted', 'Approved', 4, '2026-04-22 19:34:47', 'Approved with full payout.', 0, 1),
(129, 30, 2, 'Pending', 'Cancelled', 4, '2026-04-22 19:35:08', 'Contract cancelled. Milestone #2 refunded to client.', 0, 1),
(130, 31, 1, 'Submitted', 'Rejected', 4, '2026-04-23 17:02:17', 'Rejected by client. Please revise and resubmit.', 0, 0),
(131, 31, 1, 'Submitted', 'Rejected', 4, '2026-04-23 17:02:25', 'Rejected by client. Please revise and resubmit.', 0, 0),
(132, 31, 1, 'Submitted', 'ApprovedPartial', 4, '2026-04-23 17:02:40', 'Approved with partial payout (15% refund) because rejected fragments for this milestone exceeded the agreed threshold (2).', 0, 1),
(133, 31, 2, 'Submitted', 'Approved', 4, '2026-04-23 17:02:52', 'Approved with full payout.', 0, 1),
(134, 32, 1, 'Submitted', 'Rejected', 4, '2026-04-24 08:24:29', 'Rejected by client. Please revise and resubmit.', 8, 0),
(135, 32, 1, 'Rejected', 'Disputed', 1, '2026-04-24 08:24:40', 'Provider requested administrator review.', 8, 0),
(136, 32, 1, 'Disputed', 'Submitted', 3, '2026-04-24 08:25:08', 'Administrator approved disputed fragment and returned it to the client for final approval.', 0, 0),
(137, 32, 1, 'Submitted', 'Approved', 4, '2026-04-24 08:25:25', 'Approved with partial payout (0% refund) because fragment was submitted after milestone deadline; last fragment was submitted after contract deadline; fragment speed score was below the agreed threshold; delivery was late.', 8, 1),
(138, 33, 1, 'Submitted', 'Approved', 4, '2026-04-28 17:23:11', 'Approved with full payout.', 0, 1),
(139, 33, 2, 'Submitted', 'Rejected', 4, '2026-04-28 17:31:53', 'Rejected by client. Please revise and resubmit.', 0, 0),
(140, 33, 2, 'Submitted', 'Rejected', 4, '2026-04-28 17:33:25', 'Rejected by client. Please revise and resubmit.', 0, 0),
(141, 33, 2, 'Submitted', 'Approved', 4, '2026-04-28 17:40:18', 'Approved with full payout.', 0, 1),
(142, 34, 1, 'Submitted', 'Approved', 4, '2026-04-28 17:44:06', 'Approved with full payout.', 0, 1),
(143, 34, 2, 'Submitted', 'Rejected', 4, '2026-04-28 17:44:17', 'Rejected by client. Please revise and resubmit.', 0, 0),
(144, 34, 2, 'Submitted', 'Rejected', 4, '2026-04-28 17:44:26', 'Rejected by client. Please revise and resubmit.', 0, 0),
(145, 34, 2, 'Submitted', 'Rejected', 4, '2026-04-28 17:44:38', 'Rejected by client. Please revise and resubmit.', 0, 0),
(146, 34, 2, 'Submitted', 'ApprovedPartial', 4, '2026-04-28 17:45:16', 'Approved with partial payout (50% refund) because rejected fragments for this milestone exceeded the agreed threshold (3).', 0, 1),
(147, 35, 1, 'Submitted', 'Rejected', 4, '2026-04-28 17:53:01', 'Rejected by client. Please revise and resubmit.', 0, 0),
(148, 35, 1, 'Submitted', 'Rejected', 4, '2026-04-28 17:53:08', 'Rejected by client. Please revise and resubmit.', 0, 0),
(149, 35, 1, 'Submitted', 'ApprovedPartial', 4, '2026-04-28 17:53:18', 'Approved with partial payout (50% refund) because rejected fragments for this milestone exceeded the agreed threshold (2).', 0, 1),
(150, 36, 1, 'Submitted', 'Rejected', 4, '2026-04-28 20:05:06', 'Rejected by client. Please revise and resubmit.', 0, 0),
(151, 36, 1, 'Rejected', 'Disputed', 1, '2026-04-28 20:08:38', 'Provider requested administrator review.', 0, 0),
(152, 36, 1, 'Disputed', 'Submitted', 3, '2026-04-28 20:18:46', 'Administrator approved disputed fragment and returned it to the client for final approval.', 0, 0),
(153, 36, 2, 'Submitted', 'Rejected', 4, '2026-04-28 20:19:36', 'Rejected by client. Please revise and resubmit.', 0, 0),
(154, 36, 1, 'Submitted', 'Approved', 4, '2026-04-28 20:19:41', 'Approved with full payout.', 0, 1),
(155, 36, 2, 'Submitted', 'Approved', 4, '2026-04-28 20:22:19', 'Approved with full payout.', 0, 1);

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
(29, 35, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 15.00, 15.00000000, 2, 7.50000000, '0x0018e8301f99297fb064920dad331488c20e563345e8e0073ca681a9f41b0908', 'Closed', '2026-04-22 16:58:35', '2026-04-22 21:08:05'),
(30, 37, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 50.00, 50.00000000, 2, 25.00000000, '0x27c2ab477a0b223666f9d8ce3c3e98316ae94e241bc6105f73a5b46d16471381', 'Cancelled', '2026-04-22 19:32:38', '2026-04-22 22:35:08'),
(31, 38, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 5.00, 5.00000000, 2, 2.50000000, '0x10c900914b0b89ede3559e43519b38d7d9fd8fb1fcd26be95506c1915148bbc8', 'Closed', '2026-04-23 17:00:41', '2026-04-23 20:03:00'),
(32, 39, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 5.00, 5.00000000, 1, 5.00000000, '0x13dcb6a48ff4c7a2a6fd5f20e75a01955d3dafeacaa90b9f107b86660c06b7e1', 'Closed', '2026-04-23 18:01:09', '2026-04-24 11:25:47'),
(33, 40, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 100.00, 100.00000000, 2, 50.00000000, '0xc63929d0c7a7a2396760f19ba6fc85e1fdd9750efce6694c69a8ab8a68619d37', 'Closed', '2026-04-28 17:09:28', '2026-04-28 20:41:50'),
(34, 41, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 2, 100.00, 100.00000000, 2, 50.00000000, '0x68a72948d1bed3cfeca6e88b70e4e23d37b6233ca9b7b76d72e28c70eeb553b2', 'Closed', '2026-04-28 17:43:30', '2026-04-28 20:51:09'),
(35, 42, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 3, 50.00, 50.00000000, 1, 50.00000000, '0xcf112e690d6b58a5b6a32de01985a55c991ee1bd40270d03bb77d6ecb5187bda', 'Closed', '2026-04-28 17:52:38', '2026-04-28 20:54:10'),
(36, 43, 4, 1, '0x90F79bf6EB2c4f870365E785982E1f101E93b906', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 4, 100.00, 100.00000000, 2, 50.00000000, '0x8ceb229080de23bd9380892643d5fe542c1c49ef11e1fc855382f15171e10e23', 'Closed', '2026-04-28 19:56:09', '2026-04-28 23:22:34');

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

--
-- Dumping data for table `b_contract_history`
--

INSERT INTO `b_contract_history` (`historyId`, `fkContractId`, `oldStatus`, `newStatus`, `changedByUserId`, `changedAt`, `note`) VALUES
(128, 29, 'Funded', 'WaitingForApproval', 1, '2026-04-22 17:37:54', 'Provider submitted fragment for milestone #1.'),
(129, 29, 'WaitingForApproval', 'InProgress', 4, '2026-04-22 17:55:25', 'Milestone #1 approved with full payout.'),
(130, 29, 'InProgress', 'WaitingForApproval', 1, '2026-04-22 18:07:38', 'Provider submitted fragment for milestone #2.'),
(131, 29, 'WaitingForApproval', 'Completed', 4, '2026-04-22 18:07:50', 'Milestone #2 approved with full payout.'),
(132, 29, 'Completed', 'Closed', 4, '2026-04-22 18:08:05', 'Client submitted final user rating.'),
(133, 30, 'WaitingForApproval', 'InProgress', 4, '2026-04-22 19:34:47', 'Milestone #1 approved with full payout.'),
(134, 30, 'InProgress', 'Cancelled', 4, '2026-04-22 19:35:08', 'Contract cancelled. Refunded 25.00000000 ETH for unfinished milestone(s).'),
(135, 31, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-23 17:02:17', 'Fragment #61 rejected by client.'),
(136, 31, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-23 17:02:25', 'Fragment #62 rejected by client.'),
(137, 31, 'WaitingForApproval', 'InProgress', 4, '2026-04-23 17:02:40', 'Milestone #1 approved with partial payout/refund. Provider=2.125 ETH, ClientRefund=0.375 ETH.'),
(138, 31, 'WaitingForApproval', 'Completed', 4, '2026-04-23 17:02:52', 'Milestone #2 approved with full payout.'),
(139, 31, 'Completed', 'Closed', 4, '2026-04-23 17:03:00', 'Client submitted final user rating.'),
(140, 32, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-24 08:24:29', 'Fragment #65 rejected by client.'),
(141, 32, 'UnderRevision', 'WaitingForApproval', 3, '2026-04-24 08:25:08', 'Administrator approved disputed fragment #65 and returned it to the client for final approval.'),
(142, 32, 'WaitingForApproval', 'Completed', 4, '2026-04-24 08:25:25', 'Milestone #1 approved with full payout.'),
(143, 32, 'Completed', 'Closed', 4, '2026-04-24 08:25:47', 'Client submitted final user rating.'),
(144, 33, 'WaitingForApproval', 'InProgress', 4, '2026-04-28 17:23:11', 'Milestone #1 approved with full payout.'),
(145, 33, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:31:53', 'Fragment #67 rejected by client.'),
(146, 33, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:33:25', 'Fragment #68 rejected by client.'),
(147, 33, 'WaitingForApproval', 'Completed', 4, '2026-04-28 17:40:18', 'Milestone #2 approved with full payout.'),
(148, 33, 'Completed', 'Closed', 4, '2026-04-28 17:41:50', 'Client submitted final user rating.'),
(149, 34, 'WaitingForApproval', 'InProgress', 4, '2026-04-28 17:44:06', 'Milestone #1 approved with full payout.'),
(150, 34, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:44:17', 'Fragment #71 rejected by client.'),
(151, 34, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:44:26', 'Fragment #72 rejected by client.'),
(152, 34, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:44:38', 'Fragment #73 rejected by client.'),
(153, 34, 'WaitingForApproval', 'Completed', 4, '2026-04-28 17:45:16', 'Milestone #2 approved with partial payout/refund. Provider=25 ETH, ClientRefund=25 ETH.'),
(154, 34, 'Completed', 'Closed', 4, '2026-04-28 17:51:09', 'Client submitted final user rating.'),
(155, 35, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:53:01', 'Fragment #75 rejected by client.'),
(156, 35, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 17:53:08', 'Fragment #76 rejected by client.'),
(157, 35, 'WaitingForApproval', 'Completed', 4, '2026-04-28 17:53:18', 'Milestone #1 approved with partial payout/refund. Provider=25 ETH, ClientRefund=25 ETH.'),
(158, 35, 'Completed', 'Closed', 4, '2026-04-28 17:54:10', 'Client submitted final user rating.'),
(159, 36, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 20:05:06', 'Fragment #79 rejected by client.'),
(160, 36, 'UnderRevision', 'WaitingForApproval', 3, '2026-04-28 20:18:46', 'Administrator approved disputed fragment #79 and returned it to the client for final approval.'),
(161, 36, 'WaitingForApproval', 'UnderRevision', 4, '2026-04-28 20:19:36', 'Fragment #80 rejected by client.'),
(162, 36, 'UnderRevision', 'InProgress', 4, '2026-04-28 20:19:41', 'Milestone #1 approved with full payout.'),
(163, 36, 'WaitingForApproval', 'Completed', 4, '2026-04-28 20:22:19', 'Milestone #2 approved with full payout.'),
(164, 36, 'Completed', 'Closed', 4, '2026-04-28 20:22:34', 'Client submitted final user rating.');

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
(11, 29, 4, 1, 'Hello', '2026-04-22 18:07:46', 1, '2026-04-22 18:23:21'),
(12, 30, 4, 1, 'Why cancel?', '2026-04-22 19:35:25', 1, '2026-04-22 19:35:34'),
(13, 33, 4, 1, 'I wanted it to be more finalized, because it still looks like a demo version', '2026-04-28 17:34:24', 1, '2026-04-28 17:34:35'),
(14, 33, 1, 4, 'Okay sure thing, what should i fix?', '2026-04-28 17:34:35', 1, '2026-04-28 17:34:48'),
(15, 33, 4, 1, 'Just add a bit of more style in the product page, and maybe change the colors from purple, to light green.', '2026-04-28 17:37:28', 1, '2026-04-28 17:37:33'),
(16, 33, 1, 4, 'ok', '2026-04-28 17:37:38', 1, '2026-04-28 17:37:42');

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
(53, 29, 65, 1, 7.50000000, 7.50, 'Released', '0x36a2503e7610d67df13cecc2c267f0f6d9d067a5901bb8798371d4c903dd06ee', '2026-04-22 17:55:25', '2026-04-22 16:58:36', '2026-04-22 20:55:25'),
(54, 29, 66, 2, 7.50000000, 7.50, 'Released', '0xd90b48a48f0c1a56cf9aa5fbafe91f2738066576eb2d09a087ffbfdaaee79404', '2026-04-22 18:07:50', '2026-04-22 16:58:36', '2026-04-22 21:07:50'),
(55, 30, 68, 1, 25.00000000, 25.00, 'Released', '0xe50f0edaa6509b50780d6ce8f5891e62f2a957746eaa7a95ac56a54de80405b8', '2026-04-22 19:34:47', '2026-04-22 19:32:38', '2026-04-22 22:34:47'),
(56, 30, 69, 2, 25.00000000, 25.00, 'Cancelled', '0x7cf185aa26303fb9e1ab50590b892f3885da43b7937949746dea687377c68e66', '2026-04-22 19:35:08', '2026-04-22 19:32:38', '2026-04-22 22:35:08'),
(57, 31, 70, 1, 2.50000000, 2.50, 'ReleasedPartial', '0x91b2544b7f92e6252a40bb53793269ad704c76e2d18ddc368ac99437f0648f6a', '2026-04-23 17:02:40', '2026-04-23 17:00:42', '2026-04-23 20:02:40'),
(58, 31, 71, 2, 2.50000000, 2.50, 'Released', '0x52c28c5bc3bbdedd702e8af910f1b11865356798811e4ba26c9fa3da8f088627', '2026-04-23 17:02:52', '2026-04-23 17:00:42', '2026-04-23 20:02:52'),
(59, 32, 72, 1, 5.00000000, 5.00, 'Released', '0x2673245e7790b0afce7c60c99a28877d2c6ca06795b13469249128a07d613fc7', '2026-04-24 08:25:25', '2026-04-23 18:01:09', '2026-04-24 11:25:25'),
(60, 33, 73, 1, 50.00000000, 50.00, 'Released', '0xf992b46b6c2455d35793f377ca46567f1e60ce5a5163a0c71642ab5fa4bdba36', '2026-04-28 17:23:11', '2026-04-28 17:09:28', '2026-04-28 20:23:11'),
(61, 33, 74, 2, 50.00000000, 50.00, 'Released', '0x3aa361b82f6b31bc2ed2a6788845eac18e7387972ad24dbec85ab1119271cd49', '2026-04-28 17:40:18', '2026-04-28 17:09:28', '2026-04-28 20:40:18'),
(62, 34, 75, 1, 50.00000000, 50.00, 'Released', '0xc03548cf5865c51783849c1f4bcd933ed008ef9e6c66117c01ca60dbc37da34d', '2026-04-28 17:44:06', '2026-04-28 17:43:30', '2026-04-28 20:44:06'),
(63, 34, 76, 2, 50.00000000, 50.00, 'ReleasedPartial', '0xf2f25c438c39010187271c2d5633a9dee05de3f57345a80f9901a9646cf5a776', '2026-04-28 17:45:16', '2026-04-28 17:43:30', '2026-04-28 20:45:16'),
(64, 35, 77, 1, 50.00000000, 50.00, 'ReleasedPartial', '0x7cad52f6b79432e4427eb8fdd34c4fc24a4e764b14d99f6ddf1370a98bb3935e', '2026-04-28 17:53:18', '2026-04-28 17:52:38', '2026-04-28 20:53:18'),
(65, 36, 78, 1, 50.00000000, 50.00, 'Released', '0x449e590276d03a5936cea1481c4b8efc3234062676978ea71be0f8b5086745d4', '2026-04-28 20:19:41', '2026-04-28 19:56:09', '2026-04-28 23:19:41'),
(66, 36, 79, 2, 50.00000000, 50.00, 'Released', '0x5e70aded588117306cbcaf4349615777b473a282e2a9ada07f86a992f4d0919a', '2026-04-28 20:22:19', '2026-04-28 19:56:09', '2026-04-28 23:22:19');

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
(35, 11, 4, 'Please design me a e-shop style shop design. Please do it fast.', 15.00, '2026-04-21 18:50:28', 1, 'ACCEPTED', 0, '2026-04-22 16:58:36', NULL, 'OWNER', 1, 0),
(36, 11, 4, 'asd', NULL, '2026-04-21 18:51:24', 1, 'PENDING', 0, NULL, NULL, 'OWNER', 1, 0),
(37, 11, 4, 'Need it done fast', 50.00, '2026-04-22 19:32:33', 1, 'ACCEPTED', 0, '2026-04-22 19:32:38', NULL, 'OWNER', 1, 0),
(38, 11, 4, 'Need design', 5.00, '2026-04-23 17:00:35', 1, 'ACCEPTED', 0, '2026-04-23 17:00:42', NULL, 'OWNER', 1, 0),
(39, 11, 4, 'as', 5.00, '2026-04-23 18:00:57', 1, 'ACCEPTED', 0, '2026-04-23 18:01:09', NULL, 'OWNER', 1, 0),
(40, 12, 4, 'Need you design me a website that is an e-shop where i will want to sell LED strips', 100.00, '2026-04-28 17:09:17', 1, 'ACCEPTED', 0, '2026-04-28 17:09:28', NULL, 'OWNER', 1, 0),
(41, 12, 4, 'Need you to design a web an e-shop.', 100.00, '2026-04-28 17:43:21', 1, 'ACCEPTED', 0, '2026-04-28 17:43:30', NULL, 'OWNER', 1, 0),
(42, 12, 4, 't', 50.00, '2026-04-28 17:52:32', 1, 'ACCEPTED', 0, '2026-04-28 17:52:38', NULL, 'OWNER', 1, 0),
(43, 12, 4, 'Same job, just need you to create me a clothing e-shop.', 100.00, '2026-04-28 19:50:21', 1, 'ACCEPTED', 0, '2026-04-28 19:56:09', NULL, 'OWNER', 1, 0);

-- --------------------------------------------------------

--
-- Table structure for table `b_inquiry_contract_terms`
--

CREATE TABLE `b_inquiry_contract_terms` (
  `inquiryContractTermsId` int(11) NOT NULL,
  `fkInquiryId` int(11) NOT NULL,
  `fragmentSpeedMinScore` decimal(4,2) NOT NULL DEFAULT 2.00,
  `fragmentSpeedRefundPercent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `revisionCountMaxAverage` decimal(4,2) NOT NULL DEFAULT 3.00,
  `revisionCountRefundPercent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `contractSpeedMinScore` decimal(4,2) NOT NULL DEFAULT 2.00,
  `contractSpeedRefundPercent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `messageResponseMinScore` decimal(4,2) NOT NULL DEFAULT 2.00,
  `messageResponseRefundPercent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `rejectedFragmentsMaxCount` int(11) NOT NULL DEFAULT 0,
  `rejectedFragmentsRefundPercent` decimal(5,2) NOT NULL DEFAULT 0.00,
  `createdAt` datetime NOT NULL DEFAULT current_timestamp(),
  `updatedAt` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `b_inquiry_contract_terms`
--

INSERT INTO `b_inquiry_contract_terms` (`inquiryContractTermsId`, `fkInquiryId`, `fragmentSpeedMinScore`, `fragmentSpeedRefundPercent`, `revisionCountMaxAverage`, `revisionCountRefundPercent`, `contractSpeedMinScore`, `contractSpeedRefundPercent`, `messageResponseMinScore`, `messageResponseRefundPercent`, `rejectedFragmentsMaxCount`, `rejectedFragmentsRefundPercent`, `createdAt`, `updatedAt`) VALUES
(7, 35, 2.00, 0.00, 3.00, 0.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-21 21:50:28', '2026-04-21 21:50:28'),
(8, 36, 2.00, 0.00, 3.00, 0.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-21 21:51:24', '2026-04-21 21:51:24'),
(9, 37, 2.00, 50.00, 2.00, 50.00, 2.00, 50.00, 2.00, 0.00, 0, 0.00, '2026-04-22 22:32:33', '2026-04-22 22:32:33'),
(10, 38, 2.00, 0.00, 1.00, 15.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-23 20:00:35', '2026-04-23 20:00:35'),
(11, 39, 2.00, 0.00, 3.00, 0.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-23 21:00:57', '2026-04-23 21:00:57'),
(12, 40, 2.00, 0.00, 2.00, 50.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-28 20:09:17', '2026-04-28 20:09:17'),
(13, 41, 2.00, 0.00, 2.00, 50.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-28 20:43:21', '2026-04-28 20:43:21'),
(14, 42, 2.00, 0.00, 1.00, 50.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-28 20:52:32', '2026-04-28 20:52:32'),
(15, 43, 2.00, 0.00, 1.00, 15.00, 2.00, 0.00, 2.00, 0.00, 0, 0.00, '2026-04-28 22:50:21', '2026-04-28 22:55:20');

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
(9, 1, 'Low poly company logo designs', 0.50, 5.00, 'I create modern and professional Low Poly style logos that stand out with clean design, geometric shapes, and a contemporary look. These logos are perfect for businesses, brands, social media, gaming projects, or personal use. Every design is made to be visually attractive, memorable, and adapted to your needs. You will receive a unique logo concept with attention to detail, style, and quality.', '5 days', '2026-04-21 17:36:30', 4, b'1', NULL, '2026-04-21 18:25:16', 3),
(11, 1, 'Web design using figma', 10.00, 71.00, 'I create modern and professional web designs in Figma tailored to your brand and goals. Clean layouts, user-friendly structure, and visually appealing interfaces that work great for businesses, startups, portfolios, e-commerce, or personal projects. Each design is crafted with attention to usability, style, and responsive thinking to ensure a smooth user experience. You will receive a unique and polished UI concept ready for development.', '1 week', '2026-04-21 18:32:20', 3, b'1', NULL, '2026-04-21 18:34:02', 3),
(12, 1, 'Web design using FigmaJam', 25.00, 75.00, 'I do easily readable figmaJam web designs', '2 Weeks', '2026-04-24 07:55:32', 3, b'1', NULL, '2026-04-24 07:55:51', 3),
(13, 1, 'Designing logos for your clothing brands', 0.01, 1.00, 'Creating unique and professional logos for clothing brands that reflect your style, identity, and target audience. Clean, modern, and memorable designs tailored to your fashion vision.', '1 week', '2026-04-28 20:52:41', 4, b'1', NULL, '2026-04-28 20:54:32', 3);

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
(7, 9, '/uploads/listings/9/p_d6bbd1afc447411ab674688b9c941861.jpg', 1, '2026-04-21 17:36:30'),
(8, 9, '/uploads/listings/9/p_98d12f9aa2964630a82f7d193d7b36a4.jpg', 0, '2026-04-21 17:36:30'),
(9, 9, '/uploads/listings/9/p_d5d49efeba324e0f98396b10739230eb.png', 0, '2026-04-21 17:36:30'),
(13, 11, '/uploads/listings/11/p_12126ca9f38440d8bb1214c8a735c249.png', 1, '2026-04-21 18:32:20'),
(14, 11, '/uploads/listings/11/p_35901d052589432d894e21eef7ea368f.jpg', 0, '2026-04-21 18:32:20'),
(15, 11, '/uploads/listings/11/p_4e4e985c776445e9ac3d9fd14e09571c.jpg', 0, '2026-04-21 18:32:20'),
(16, 12, '/uploads/listings/12/p_13a22ad6dfe64ab9a0989a839d3c002f.png', 1, '2026-04-24 07:55:33'),
(17, 13, '/uploads/listings/13/p_63582fb7a2f743199cbe1326fd21a08b.png', 1, '2026-04-28 20:52:41');

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
(146, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 9, 1, '2026-04-21 18:25:16'),
(147, 1, 'Listing rejected', 'Not good', 'ListingRejected', 11, 1, '2026-04-21 18:32:39'),
(148, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 11, 1, '2026-04-21 18:34:02'),
(149, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #29, milestone #1.', 'contract_fragment_submitted', 29, 1, '2026-04-22 17:37:54'),
(150, 1, 'Fragment approved', 'Fragment approved and payout released for contract #29.', 'contract_fragment_release', 29, 1, '2026-04-22 17:55:25'),
(151, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #29, milestone #2.', 'contract_fragment_submitted', 29, 1, '2026-04-22 18:07:38'),
(152, 1, 'New message', 'uzsakovas sent you a message: Hello', 'contract_message', 29, 1, '2026-04-22 18:07:46'),
(153, 1, 'Fragment approved', 'Fragment approved and payout released for contract #29.', 'contract_fragment_release', 29, 1, '2026-04-22 18:07:50'),
(154, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #30, milestone #1.', 'contract_fragment_submitted', 30, 1, '2026-04-22 19:34:23'),
(155, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #30, milestone #1.', 'contract_fragment_submitted', 30, 1, '2026-04-22 19:34:39'),
(156, 1, 'Fragment approved', 'Fragment approved and payout released for contract #30.', 'contract_fragment_release', 30, 1, '2026-04-22 19:34:47'),
(157, 1, 'Contract cancelled', 'Contract #30 was cancelled.', 'contract_cancelled', 30, 1, '2026-04-22 19:35:08'),
(158, 1, 'New message', 'uzsakovas sent you a message: Why cancel?', 'contract_message', 30, 1, '2026-04-22 19:35:25'),
(159, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #31, milestone #1.', 'contract_fragment_submitted', 31, 1, '2026-04-23 17:02:13'),
(160, 1, 'Fragment rejected', 'Your fragment for contract #31 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 31, 1, '2026-04-23 17:02:17'),
(161, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #31, milestone #1.', 'contract_fragment_submitted', 31, 1, '2026-04-23 17:02:22'),
(162, 1, 'Fragment rejected', 'Your fragment for contract #31 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 31, 1, '2026-04-23 17:02:25'),
(163, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #31, milestone #1.', 'contract_fragment_submitted', 31, 1, '2026-04-23 17:02:32'),
(164, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #31.', 'contract_fragment_partial_release', 31, 1, '2026-04-23 17:02:40'),
(165, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #31, milestone #2.', 'contract_fragment_submitted', 31, 1, '2026-04-23 17:02:45'),
(166, 1, 'Fragment approved', 'Fragment approved and payout released for contract #31.', 'contract_fragment_release', 31, 1, '2026-04-23 17:02:52'),
(167, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 12, 0, '2026-04-24 07:55:51'),
(168, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #32, milestone #1.', 'contract_fragment_submitted', 32, 1, '2026-04-24 08:24:21'),
(169, 1, 'Fragment rejected', 'Your fragment for contract #32 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 32, 0, '2026-04-24 08:24:29'),
(170, 3, 'Fragment dispute requires review', 'Contract #32, milestone #1 was escalated by provider.', 'contract_fragment_disputed', 65, 1, '2026-04-24 08:24:40'),
(171, 4, 'Fragment dispute opened', 'Provider asked administrator to review contract #32, milestone #1.', 'contract_fragment_dispute_opened', 32, 1, '2026-04-24 08:24:40'),
(172, 1, 'Dispute approved', 'Administrator approved your disputed fragment for contract #32. The client can now only approve it.', 'contract_fragment_dispute_approved', 32, 0, '2026-04-24 08:25:08'),
(173, 4, 'Fragment returned for approval', 'Administrator approved the disputed fragment for contract #32. You can approve it, but you can no longer reject it.', 'contract_fragment_dispute_approved', 32, 1, '2026-04-24 08:25:08'),
(174, 1, 'Fragment approved', 'Fragment approved and payout released for contract #32.', 'contract_fragment_release', 32, 0, '2026-04-24 08:25:25'),
(175, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #33, milestone #1.', 'contract_fragment_submitted', 33, 1, '2026-04-28 17:20:13'),
(176, 1, 'Fragment approved', 'Fragment approved and payout released for contract #33.', 'contract_fragment_release', 33, 0, '2026-04-28 17:23:11'),
(177, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #33, milestone #2.', 'contract_fragment_submitted', 33, 1, '2026-04-28 17:31:48'),
(178, 1, 'Fragment rejected', 'Your fragment for contract #33 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 33, 0, '2026-04-28 17:31:53'),
(179, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #33, milestone #2.', 'contract_fragment_submitted', 33, 1, '2026-04-28 17:33:07'),
(180, 1, 'Fragment rejected', 'Your fragment for contract #33 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 33, 0, '2026-04-28 17:33:25'),
(181, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #33, milestone #2.', 'contract_fragment_submitted', 33, 1, '2026-04-28 17:34:02'),
(182, 1, 'New message', 'uzsakovas sent you a message: I wanted it to be more finalized, because it still looks like a demo version', 'contract_message', 33, 0, '2026-04-28 17:34:24'),
(183, 4, 'New message', 'jokubas sent you a message: Okay sure thing, what should i fix?', 'contract_message', 33, 1, '2026-04-28 17:34:35'),
(184, 1, 'New message', 'uzsakovas sent you a message: Just add a bit of more style in the product page, and maybe change the colors from purple, to light green.', 'contract_message', 33, 0, '2026-04-28 17:37:28'),
(185, 4, 'New message', 'jokubas sent you a message: ok', 'contract_message', 33, 1, '2026-04-28 17:37:38'),
(186, 1, 'Fragment approved', 'Fragment approved and payout released for contract #33.', 'contract_fragment_release', 33, 0, '2026-04-28 17:40:18'),
(187, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #34, milestone #1.', 'contract_fragment_submitted', 34, 1, '2026-04-28 17:43:59'),
(188, 1, 'Fragment approved', 'Fragment approved and payout released for contract #34.', 'contract_fragment_release', 34, 0, '2026-04-28 17:44:06'),
(189, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #34, milestone #2.', 'contract_fragment_submitted', 34, 1, '2026-04-28 17:44:12'),
(190, 1, 'Fragment rejected', 'Your fragment for contract #34 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 34, 0, '2026-04-28 17:44:17'),
(191, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #34, milestone #2.', 'contract_fragment_submitted', 34, 1, '2026-04-28 17:44:22'),
(192, 1, 'Fragment rejected', 'Your fragment for contract #34 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 34, 0, '2026-04-28 17:44:26'),
(193, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #34, milestone #2.', 'contract_fragment_submitted', 34, 1, '2026-04-28 17:44:34'),
(194, 1, 'Fragment rejected', 'Your fragment for contract #34 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 34, 0, '2026-04-28 17:44:38'),
(195, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #34, milestone #2.', 'contract_fragment_submitted', 34, 1, '2026-04-28 17:45:06'),
(196, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #34.', 'contract_fragment_partial_release', 34, 0, '2026-04-28 17:45:16'),
(197, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #35, milestone #1.', 'contract_fragment_submitted', 35, 1, '2026-04-28 17:52:58'),
(198, 1, 'Fragment rejected', 'Your fragment for contract #35 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 35, 0, '2026-04-28 17:53:01'),
(199, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #35, milestone #1.', 'contract_fragment_submitted', 35, 1, '2026-04-28 17:53:05'),
(200, 1, 'Fragment rejected', 'Your fragment for contract #35 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 35, 0, '2026-04-28 17:53:08'),
(201, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #35, milestone #1.', 'contract_fragment_submitted', 35, 1, '2026-04-28 17:53:12'),
(202, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #35.', 'contract_fragment_partial_release', 35, 0, '2026-04-28 17:53:18'),
(203, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #36, milestone #1.', 'contract_fragment_submitted', 36, 0, '2026-04-28 20:02:25'),
(204, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #36, milestone #1.', 'contract_fragment_submitted', 36, 0, '2026-04-28 20:04:06'),
(205, 1, 'Fragment rejected', 'Your fragment for contract #36 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 36, 0, '2026-04-28 20:05:06'),
(206, 3, 'Fragment dispute requires review', 'Contract #36, milestone #1 was escalated by provider.', 'contract_fragment_disputed', 79, 1, '2026-04-28 20:08:38'),
(207, 4, 'Fragment dispute opened', 'Provider asked administrator to review contract #36, milestone #1.', 'contract_fragment_dispute_opened', 36, 0, '2026-04-28 20:08:38'),
(208, 1, 'Dispute approved', 'Administrator approved your disputed fragment for contract #36. The client can now only approve it.', 'contract_fragment_dispute_approved', 36, 0, '2026-04-28 20:18:46'),
(209, 4, 'Fragment returned for approval', 'Administrator approved the disputed fragment for contract #36. You can approve it, but you can no longer reject it.', 'contract_fragment_dispute_approved', 36, 0, '2026-04-28 20:18:46'),
(210, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #36, milestone #2.', 'contract_fragment_submitted', 36, 0, '2026-04-28 20:19:28'),
(211, 1, 'Fragment rejected', 'Your fragment for contract #36 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 36, 0, '2026-04-28 20:19:36'),
(212, 1, 'Fragment approved', 'Fragment approved and payout released for contract #36.', 'contract_fragment_release', 36, 0, '2026-04-28 20:19:41'),
(213, 4, 'New fragment submitted', 'Provider submitted a fragment for contract #36, milestone #2.', 'contract_fragment_submitted', 36, 0, '2026-04-28 20:22:11'),
(214, 1, 'Fragment approved', 'Fragment approved and payout released for contract #36.', 'contract_fragment_release', 36, 0, '2026-04-28 20:22:19'),
(215, 1, 'Listing approved', 'Your listing was approved by admin.', 'ListingApproved', 13, 0, '2026-04-28 20:54:32');

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

--
-- Dumping data for table `b_rating`
--

INSERT INTO `b_rating` (`ratingId`, `fkContractId`, `fkListingId`, `fkFromUserId`, `fkToUserId`, `userRating`, `userRatingComment`, `systemRating`, `systemRatingReason`, `createdAt`, `updatedAt`) VALUES
(20, 29, 11, 4, 1, 1, 'Good job, just very very slow', 5.00, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 2 milestone(s). Agreed minimum: 2.00.\r\nRevision count: 2/2 - Average rejected fragments per milestone is 0 across 2 milestone(s). Agreed maximum average rejects per milestone: 3.00.\r\nContract speed: 2/2 - Contract completed at 2026-04-22 18:07:50, deadline was 2026-04-30 00:00:00. Agreed minimum: 2.00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply. Agreed minimum: 2.00.\r\nRejected fragments: 2/2 - Rejected fragments stayed within the agreed threshold. Rejected fragment count is 0. Agreed maximum count: 0.\r\nTotal: 10/10\r\nFinal system rating: 5.00/5.00', '2026-04-22 16:58:37', '2026-04-22 21:08:05'),
(21, 30, 11, 4, 1, NULL, NULL, NULL, NULL, '2026-04-22 19:32:39', '2026-04-22 22:32:39'),
(22, 31, 11, 4, 1, 1, 'Eh job', 3.50, 'Fragment speed: 2/2 - On-time fragments get 2 points, late fragments get 0. Formula: 8 point(s) / 4 fragment(s) = 2. On time: 4; late: 0.\r\nRevision count: 1/2 - Total revisions across the whole contract: 2. Max revisions = fragment resubmission number 1 * 2 milestone(s) = 2. 25% limit rounded: 1; 75% limit rounded: 2.\r\nContract speed: 2/2 - Contract completed at 2026-04-23 17:02:52, deadline was 2026-04-24 00:00:00. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 0/2 - Rejected fragment count is 2. Agreed allowed count is 0. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0.\r\nTotal: 7/10\r\nFinal system rating: 3.50/5.00', '2026-04-23 17:00:43', '2026-04-23 20:03:00'),
(23, 32, 11, 4, 1, 2, 'Gerai', 3.00, 'Fragment speed: 0/2 - On-time fragments get 2 points, late fragments get 0. Formula: 0 point(s) / 1 fragment(s) = 0. On time: 0; late: 1.\r\nRevision count: 2/2 - Total revisions across the whole contract: 0. Max revisions = fragment resubmission number 3 * 1 milestone(s) = 3. 25% limit rounded: 1; 75% limit rounded: 2.\r\nContract speed: 0/2 - Contract completed at 2026-04-24 08:25:25, deadline was 2026-04-16 00:00:00. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 2/2 - Rejected fragment count is 0. Agreed allowed count is 0. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0.\r\nTotal: 6/10\r\nFinal system rating: 3.00/5.00', '2026-04-23 18:01:10', '2026-04-24 11:25:47'),
(24, 33, 12, 4, 1, 1, 'Good job just did some bad things.', 3.50, 'Fragment speed: 2/2 - On-time fragments get 2 points, late fragments get 0. Formula: 8 point(s) / 4 fragment(s) = 2. On time: 4; late: 0.\r\nRevision count: 1/2 - Total revisions across the whole contract: 2. Max revisions = fragment resubmission number 2 * 2 milestone(s) = 4. 25% limit rounded: 1; 75% limit rounded: 3.\r\nContract speed: 2/2 - Contract completed at 2026-04-28 17:40:18, deadline was 2026-05-13 00:00:00. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0.\r\nMessage response: 2/2 - Average provider response time is 0 hour(s). Up to 18 hours = 2; up to 24 hours = 1; over 24 hours = 0.\r\nRejected fragments: 0/2 - Rejected fragment count is 2. Agreed allowed count is 0. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0.\r\nTotal: 7/10\r\nFinal system rating: 3.50/5.00', '2026-04-28 17:09:29', '2026-04-28 20:41:50'),
(25, 34, 12, 4, 1, 2, 'Did a decent job, just could of done it a bit faster and also was not very nice whilst communicating', 3.50, 'Fragment speed: 2/2 - On-time fragments get 2 points, late fragments get 0. Formula: 10 point(s) / 5 fragment(s) = 2. On time: 5; late: 0.\r\nRevision count: 1/2 - Total revisions across the whole contract: 3. Max revisions = fragment resubmission number 2 * 2 milestone(s) = 4. 25% limit rounded: 1; 75% limit rounded: 3.\r\nContract speed: 2/2 - Contract completed at 2026-04-28 17:45:16, deadline was 2026-05-13 00:00:00. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 0/2 - Rejected fragment count is 3. Agreed allowed count is 0. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0.\r\nTotal: 7/10\r\nFinal system rating: 3.50/5.00', '2026-04-28 17:43:31', '2026-04-28 20:51:09'),
(26, 35, 12, 4, 1, 4, NULL, 3.00, 'Fragment speed: 2/2 - On-time fragments get 2 points, late fragments get 0. Formula: 6 point(s) / 3 fragment(s) = 2. On time: 3; late: 0.\r\nRevision count: 0/2 - Total revisions across the whole contract: 2. Max revisions = fragment resubmission number 1 * 1 milestone(s) = 1. 25% limit rounded: 0; 75% limit rounded: 1.\r\nContract speed: 2/2 - Contract completed at 2026-04-28 17:53:18, deadline was 2026-04-29 00:00:00. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 0/2 - Rejected fragment count is 2. Agreed allowed count is 0. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0.\r\nTotal: 6/10\r\nFinal system rating: 3.00/5.00', '2026-04-28 17:52:39', '2026-04-28 20:54:10'),
(27, 36, 12, 4, 1, 2, 'Good job!', 4.00, 'Fragment speed: 2/2 - On-time fragments get 2 points, late fragments get 0. Formula: 6 point(s) / 3 fragment(s) = 2. On time: 3; late: 0.\r\nRevision count: 2/2 - Total revisions across the whole contract: 1. Max revisions = fragment resubmission number 1 * 2 milestone(s) = 2. 25% limit rounded: 1; 75% limit rounded: 2.\r\nContract speed: 2/2 - Contract completed at 2026-04-28 20:22:19, deadline was 2026-05-05 00:00:00. On or before deadline = 2; up to 2 days late = 1; more than 2 days late = 0.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 0/2 - Rejected fragment count is 1. Agreed allowed count is 0. With zero allowed rejects: 0 rejected = 2; any rejected fragments = 0.\r\nTotal: 8/10\r\nFinal system rating: 4.00/5.00', '2026-04-28 19:56:10', '2026-04-28 23:22:34');

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
(65, 35, 'I want a home page design, please use purple theme', NULL, '2026-04-28'),
(66, 35, 'I want a listing design please use yellow theme', NULL, '2026-04-30'),
(67, 36, 'asd', NULL, '2026-04-22'),
(68, 37, 'Test', NULL, '2026-04-29'),
(69, 37, 'Test', NULL, '2026-05-06'),
(70, 38, 'Test 1', NULL, '2026-04-24'),
(71, 38, 'Test 2', NULL, '2026-04-24'),
(72, 39, 'test', NULL, '2026-04-16'),
(73, 40, 'Want a rough design of the e-shop', NULL, '2026-05-01'),
(74, 40, 'Want a final version', NULL, '2026-05-13'),
(75, 41, 'Want a rough design of the e-shop', NULL, '2026-05-01'),
(76, 41, 'Want a final version.', NULL, '2026-05-13'),
(77, 42, 'T', NULL, '2026-04-29'),
(78, 43, 'Need a rough sketch.', NULL, '2026-04-30'),
(79, 43, 'Need a final design', NULL, '2026-05-05');

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
(3, 'admin1', 'admin@gmail.com', '$2a$11$qxTBTwvrSRYZiV6msmCwmua7va7ntnfcI61w2Acdx8b7t6iXr5OAW', 1, NULL, NULL, NULL, NULL, NULL),
(4, 'uzsakovas', 'uzsakovas@gmail.com', '$2a$11$BXnmRj1.ETtj.e00GaFxLOHKoRI0.N0WMOnnXPA6Eb.MAJ1OVRRt2', 2, NULL, '', '', '', '0x90f79bf6eb2c4f870365e785982e1f101e93b906');

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
-- Indexes for table `b_inquiry_contract_terms`
--
ALTER TABLE `b_inquiry_contract_terms`
  ADD PRIMARY KEY (`inquiryContractTermsId`),
  ADD UNIQUE KEY `uq_b_inquiry_contract_terms_inquiry` (`fkInquiryId`);

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
  MODIFY `CategoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `b_comments`
--
ALTER TABLE `b_comments`
  MODIFY `commentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  MODIFY `fragmentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `b_completed_list_fragment_history`
--
ALTER TABLE `b_completed_list_fragment_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=156;

--
-- AUTO_INCREMENT for table `b_contract`
--
ALTER TABLE `b_contract`
  MODIFY `contractId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=37;

--
-- AUTO_INCREMENT for table `b_contract_history`
--
ALTER TABLE `b_contract_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=165;

--
-- AUTO_INCREMENT for table `b_contract_messages`
--
ALTER TABLE `b_contract_messages`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `b_contract_milestone`
--
ALTER TABLE `b_contract_milestone`
  MODIFY `milestoneId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  MODIFY `inquiryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `b_inquiry_contract_terms`
--
ALTER TABLE `b_inquiry_contract_terms`
  MODIFY `inquiryContractTermsId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `b_listing`
--
ALTER TABLE `b_listing`
  MODIFY `listingId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `b_listing_photo`
--
ALTER TABLE `b_listing_photo`
  MODIFY `photoId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `b_message`
--
ALTER TABLE `b_message`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_notifications`
--
ALTER TABLE `b_notifications`
  MODIFY `notificationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=216;

--
-- AUTO_INCREMENT for table `b_rating`
--
ALTER TABLE `b_rating`
  MODIFY `ratingId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_requirement`
--
ALTER TABLE `b_requirement`
  MODIFY `requirementId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `b_role`
--
ALTER TABLE `b_role`
  MODIFY `RoleId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `b_user`
--
ALTER TABLE `b_user`
  MODIFY `UserId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

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
-- Constraints for table `b_inquiry_contract_terms`
--
ALTER TABLE `b_inquiry_contract_terms`
  ADD CONSTRAINT `fk_b_inquiry_contract_terms_inquiry` FOREIGN KEY (`fkInquiryId`) REFERENCES `b_inquiry` (`inquiryId`) ON DELETE CASCADE;

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
