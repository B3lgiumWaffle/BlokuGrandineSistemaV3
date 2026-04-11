-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 11, 2026 at 02:51 PM
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

--
-- Dumping data for table `b_comments`
--

INSERT INTO `b_comments` (`commentId`, `fkListingId`, `fkContractId`, `fkUserId`, `commentText`, `createdAt`, `isVisible`) VALUES
(1, 7, 17, 2, 'Amazing Job done, congrats loved it so much', '2026-04-02 15:49:56', 1),
(2, 6, 16, 2, 'GERAS', '2026-04-02 16:30:54', 1),
(3, 7, 14, 2, 'Labai geras', '2026-04-02 16:30:58', 1),
(4, 7, 18, 2, 'Sauniai atliktas darbas', '2026-04-03 08:29:11', 1);

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
(1, 9, 19, 30, 'Pirmas fragmentas', 'Testas', '/uploads/requirements/8aa6d31082c74303ab3abd6b35ee856e.rar', 1, '2026-03-28 11:22:56', 'Rejected', 'blogas', 2, '2026-03-28 11:23:30', NULL, '2026-03-28 11:22:56', '2026-03-28 13:23:30'),
(2, 9, 19, 30, 'Geras', 'Geras', '/uploads/requirements/0cd520a2533f498899e705ddb7428254.rar', 1, '2026-03-28 11:24:39', 'ApprovedPartial', 'Approved with partial payout because fragment was submitted after milestone deadline; last fragment was submitted after contract deadline.', 2, '2026-03-28 11:24:44', 'SIMULATED-bf02ffcbcbc24624ac4015a19a325e2f', '2026-03-28 11:24:39', '2026-03-28 13:24:44'),
(3, 12, 24, 36, 'geras', 'gaeas', NULL, 1, '2026-03-28 11:55:03', 'Approved', 'Approved with full payout.', 2, '2026-03-28 12:00:40', '0x05525da34d88765c28ab79ac51eff35f5b82d1dfc512a45564d1b15dd971d7b3', '2026-03-28 11:55:03', '2026-03-28 14:00:40'),
(4, 12, 25, 37, 'sitas blogas', NULL, NULL, 1, '2026-03-28 12:01:07', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:01:11', NULL, '2026-03-28 12:01:07', '2026-03-28 14:01:11'),
(5, 12, 25, 37, 'asdasdas', NULL, NULL, 1, '2026-03-28 12:01:16', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:01:19', NULL, '2026-03-28 12:01:16', '2026-03-28 14:01:19'),
(6, 12, 25, 37, 'asdasdasd', NULL, NULL, 1, '2026-03-28 12:01:24', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:01:27', NULL, '2026-03-28 12:01:24', '2026-03-28 14:01:27'),
(7, 12, 25, 37, 'adadasd', NULL, NULL, 1, '2026-03-28 12:01:31', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:01:34', NULL, '2026-03-28 12:01:31', '2026-03-28 14:01:34'),
(8, 12, 25, 37, 'gggg', NULL, NULL, 1, '2026-03-28 12:01:42', 'ApprovedPartial', 'Approved with partial payout because submission count exceeded limit (5 > 3).', 2, '2026-03-28 12:01:59', '0x9e4dd5f10aedb5dac023d8e7f5349eb91d2204f0984c4b1a4d8cb8e2edd67d60', '2026-03-28 12:01:42', '2026-03-28 14:01:59'),
(9, 13, 26, 38, 'asdf', NULL, NULL, 1, '2026-03-28 12:04:08', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:04:12', NULL, '2026-03-28 12:04:08', '2026-03-28 14:04:12'),
(10, 13, 26, 38, 'awsd', NULL, NULL, 1, '2026-03-28 12:04:15', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:04:20', NULL, '2026-03-28 12:04:15', '2026-03-28 14:04:20'),
(11, 13, 26, 38, 'asd', NULL, NULL, 1, '2026-03-28 12:04:24', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:04:31', NULL, '2026-03-28 12:04:24', '2026-03-28 14:04:31'),
(12, 13, 26, 38, 'asd', NULL, NULL, 1, '2026-03-28 12:04:28', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:04:33', NULL, '2026-03-28 12:04:28', '2026-03-28 14:04:33'),
(13, 13, 26, 38, 'asd', NULL, NULL, 1, '2026-03-28 12:04:39', 'ApprovedPartial', 'Approved with partial payout because submission count exceeded limit (5 > 3).', 2, '2026-03-28 12:04:52', '0x019be92fba75b8918c21c2af3696d231cb81c9df016cab20b00434b2343e9f90', '2026-03-28 12:04:39', '2026-03-28 14:04:52'),
(14, 14, 27, 39, 'asdas', NULL, NULL, 1, '2026-03-28 12:39:14', 'Approved', 'Approved with full payout.', 2, '2026-03-28 12:39:20', '0xec4ae479788f4cc24c742eaab0cb42c52b44d9054f3a6a5cbd6feece3de44d44', '2026-03-28 12:39:14', '2026-03-28 14:39:20'),
(15, 15, 28, 40, 'asd', NULL, NULL, 1, '2026-03-28 12:41:06', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:41:24', NULL, '2026-03-28 12:41:06', '2026-03-28 14:41:24'),
(16, 16, 29, 41, 'asd', NULL, NULL, 1, '2026-03-28 12:42:17', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:42:20', NULL, '2026-03-28 12:42:17', '2026-03-28 14:42:20'),
(17, 16, 29, 41, 'asd', NULL, NULL, 1, '2026-03-28 12:42:22', 'ApprovedPartial', 'Approved with partial payout because fragment was submitted after milestone deadline; last fragment was submitted after contract deadline.', 2, '2026-03-28 12:42:27', '0x2afb2332c53c7d7f8b4a8a61e46e4fbec0c036620b07edf9fe8588f17e7055ae', '2026-03-28 12:42:22', '2026-03-28 14:42:27'),
(18, 17, 30, 42, 'asdasdasd', NULL, NULL, 1, '2026-03-28 12:45:39', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:45:42', NULL, '2026-03-28 12:45:39', '2026-03-28 14:45:42'),
(19, 17, 30, 42, 'asdasd', NULL, NULL, 1, '2026-03-28 12:45:47', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-03-28 12:45:50', NULL, '2026-03-28 12:45:47', '2026-03-28 14:45:50'),
(20, 17, 30, 42, 'asdad', NULL, NULL, 1, '2026-03-28 12:45:53', 'Approved', 'Approved with full payout.', 2, '2026-03-28 12:45:58', '0x6baa1555633a0bead19ee33b5b5a244500e57d7ea80511854bb953e441d70909', '2026-03-28 12:45:53', '2026-03-28 14:45:58'),
(21, 18, 31, 43, 'TWSASDA', 'Asdasd', NULL, 1, '2026-04-03 08:20:38', 'Approved', 'GERAI', 2, '2026-04-03 08:21:04', '0xcf95fa5d6dd5533da2b35b32dfa778de18657fcd167ecbb5b7e6ce7bf58d0f53', '2026-04-03 08:20:38', '2026-04-03 11:21:04'),
(22, 18, 32, 44, 'blogas', 'asdasds', '/uploads/requirements/185007014f784f68b184eee6520a6580.rar', 1, '2026-04-03 08:21:35', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-03 08:22:06', NULL, '2026-04-03 08:21:35', '2026-04-03 11:22:06'),
(23, 18, 33, 45, 'asdsadasd', NULL, NULL, 1, '2026-04-03 08:22:12', 'Rejected', 'Netinka, man sitas', 2, '2026-04-03 08:22:22', NULL, '2026-04-03 08:22:12', '2026-04-03 11:22:22'),
(24, 18, 33, 45, 'TADASD', 'ASDSADA', NULL, 1, '2026-04-03 08:23:08', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-03 08:23:13', NULL, '2026-04-03 08:23:08', '2026-04-03 11:23:13'),
(25, 18, 33, 45, 'asda', 'asdasd', NULL, 1, '2026-04-03 08:23:20', 'Approved', 'Approved with full payout.', 2, '2026-04-03 08:23:41', '0x9b949ca2a6ac2c4f6c1fa473396ffe7c15ae3f873bdf19c12c66677b4b1e756b', '2026-04-03 08:23:20', '2026-04-03 11:23:41'),
(26, 18, 32, 44, 'asdasd', 'asdad', NULL, 1, '2026-04-03 08:24:22', 'Approved', 'Approved with full payout.', 2, '2026-04-03 08:24:33', '0xe9b8344687dd9441720d354d5fb7902d06a5b3ee9584e3ce465ef502a21f9bcc', '2026-04-03 08:24:22', '2026-04-03 11:24:33'),
(27, 19, 35, 47, 'adasd', NULL, NULL, 1, '2026-04-03 08:36:14', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-03 08:36:24', NULL, '2026-04-03 08:36:14', '2026-04-03 11:36:24'),
(28, 19, 34, 46, 'asda', 'asda', NULL, 1, '2026-04-03 08:36:29', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-03 08:36:44', NULL, '2026-04-03 08:36:29', '2026-04-03 11:36:44'),
(29, 19, 34, 46, 'asdads', 'asdads', NULL, 1, '2026-04-03 08:36:35', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-03 08:36:47', NULL, '2026-04-03 08:36:35', '2026-04-03 11:36:48'),
(30, 19, 34, 46, 'asd', 'asda', NULL, 1, '2026-04-03 08:36:39', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-03 08:36:51', NULL, '2026-04-03 08:36:39', '2026-04-03 11:36:51'),
(31, 19, 34, 46, 'ads', 'asd', NULL, 1, '2026-04-03 08:37:03', 'ApprovedPartial', 'Approved with partial payout because submission count exceeded limit (4 > 3).', 2, '2026-04-03 08:37:13', '0x1b4fcb09af491a211ada7932efadaae252ffa54d18b3f98e6041519f9e8f676b', '2026-04-03 08:37:03', '2026-04-03 11:37:13'),
(32, 20, 36, 48, 'Done', 'adasd', NULL, 1, '2026-04-08 17:58:14', 'Submitted', NULL, NULL, NULL, NULL, '2026-04-08 17:58:14', '2026-04-08 20:58:14'),
(33, 21, 38, 50, 'PADARIAU', 'dad', NULL, 1, '2026-04-08 18:06:30', 'Approved', 'tinka', 2, '2026-04-08 18:06:38', '0x84c339742df006a95423f61dc82fcbaf85b97b4291c7ec5c3f8e9e8bca1b4cd6', '2026-04-08 18:06:30', '2026-04-08 21:06:38'),
(34, 21, 39, 51, 'antras fra', NULL, NULL, 1, '2026-04-08 18:10:27', 'Rejected', 'Netinka', 2, '2026-04-08 18:10:39', NULL, '2026-04-08 18:10:27', '2026-04-08 21:10:39'),
(35, 21, 39, 51, '2 kartas', NULL, NULL, 1, '2026-04-08 18:10:50', 'Rejected', 'Vel netinka', 2, '2026-04-08 18:10:58', NULL, '2026-04-08 18:10:50', '2026-04-08 21:10:58'),
(36, 21, 39, 51, '3 kartas', NULL, NULL, 1, '2026-04-08 18:11:08', 'Rejected', 'NEEE', 2, '2026-04-08 18:11:16', NULL, '2026-04-08 18:11:08', '2026-04-08 21:11:16'),
(37, 21, 40, 52, '4 kartas', NULL, NULL, 1, '2026-04-08 18:11:24', 'Approved', 'Approved with full payout.', 2, '2026-04-08 18:12:08', '0x2dbfb4af15cd3ceccaf0b06e1db947419cfa5f3c3c5afe87b87865d81c0a7ae4', '2026-04-08 18:11:24', '2026-04-08 21:12:08'),
(38, 21, 39, 51, '1', NULL, NULL, 1, '2026-04-08 18:13:33', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-08 18:13:39', NULL, '2026-04-08 18:13:33', '2026-04-08 21:13:39'),
(39, 21, 39, 51, '2', NULL, NULL, 1, '2026-04-08 18:13:50', 'ApprovedPartial', 'Approved with partial payout because submission count exceeded limit (5 > 3).', 2, '2026-04-08 18:14:02', '0xcd5f042b1182425072e4d99c952aef80d1428a433ecd0933c48851888cb8d436', '2026-04-08 18:13:50', '2026-04-08 21:14:02'),
(40, 22, 41, 53, 'Pirmas fragmentas', 'asdnjaojnd', '/uploads/requirements/87f89b6418f44d2ea4bca38ddde4deb5.rar', 1, '2026-04-09 08:20:49', 'Approved', 'Approved with full payout.', 2, '2026-04-09 08:21:42', '0xf7df5104f1918908965d6770a589d96486400552e671133902d07471b8fcb1f7', '2026-04-09 08:20:49', '2026-04-09 11:21:42'),
(41, 23, 42, 54, 'bad', NULL, NULL, 1, '2026-04-11 12:45:47', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-11 12:45:53', NULL, '2026-04-11 12:45:47', '2026-04-11 15:45:53'),
(42, 23, 42, 54, 'bad', NULL, NULL, 1, '2026-04-11 12:45:59', 'Rejected', 'Rejected by client. Please revise and resubmit.', 2, '2026-04-11 12:46:03', NULL, '2026-04-11 12:45:59', '2026-04-11 15:46:03'),
(43, 23, 43, 55, 'good', NULL, NULL, 1, '2026-04-11 12:46:09', 'Approved', 'Approved with full payout.', 2, '2026-04-11 12:47:29', '0x47b65fa8a396c52b9328901b98ebc36e58f64fd6cbe3fa1e65555e5d4ab06b36', '2026-04-11 12:46:09', '2026-04-11 15:47:29'),
(44, 23, 42, 54, 'good', NULL, NULL, 1, '2026-04-11 12:46:25', 'ApprovedPartial', 'Approved with partial payout (75% refund) because rejected fragments for this milestone exceeded the agreed threshold (2).', 2, '2026-04-11 12:47:02', '0x546124d065544b3566a3eaa84b2d34cf8066cb7bd21f967a836c86402097b254', '2026-04-11 12:46:25', '2026-04-11 15:47:02');

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
(1, 9, 1, 'Pending', 'Submitted', 1, '2026-03-28 11:22:56', 'Fragment submitted: Pirmas fragmentas', 0, 0),
(2, 9, 1, 'Submitted', 'Rejected', 2, '2026-03-28 11:23:30', 'blogas', 17, 0),
(3, 9, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 11:24:39', 'Fragment submitted: Geras', 0, 0),
(4, 9, 1, 'Submitted', 'ApprovedPartial', 2, '2026-03-28 11:24:44', 'Approved with partial payout because fragment was submitted after milestone deadline; last fragment was submitted after contract deadline.', 17, 1),
(5, 12, 1, 'Pending', 'Submitted', 1, '2026-03-28 11:55:03', 'Fragment submitted: geras', 0, 0),
(6, 12, 1, 'Submitted', 'Approved', 2, '2026-03-28 12:00:40', 'Approved with full payout.', 0, 1),
(7, 12, 2, 'Pending', 'Submitted', 1, '2026-03-28 12:01:07', 'Fragment submitted: sitas blogas', 0, 0),
(8, 12, 2, 'Submitted', 'Rejected', 2, '2026-03-28 12:01:11', 'Rejected by client. Please revise and resubmit.', 0, 0),
(9, 12, 2, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:01:16', 'Fragment submitted: asdasdas', 0, 0),
(10, 12, 2, 'Submitted', 'Rejected', 2, '2026-03-28 12:01:19', 'Rejected by client. Please revise and resubmit.', 0, 0),
(11, 12, 2, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:01:24', 'Fragment submitted: asdasdasd', 0, 0),
(12, 12, 2, 'Submitted', 'Rejected', 2, '2026-03-28 12:01:27', 'Rejected by client. Please revise and resubmit.', 0, 0),
(13, 12, 2, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:01:31', 'Fragment submitted: adadasd', 0, 0),
(14, 12, 2, 'Submitted', 'Rejected', 2, '2026-03-28 12:01:34', 'Rejected by client. Please revise and resubmit.', 0, 0),
(15, 12, 2, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:01:42', 'Fragment submitted: gggg', 0, 0),
(16, 12, 2, 'Submitted', 'ApprovedPartial', 2, '2026-03-28 12:01:59', 'Approved with partial payout because submission count exceeded limit (5 > 3).', 0, 1),
(17, 13, 1, 'Pending', 'Submitted', 1, '2026-03-28 12:04:08', 'Fragment submitted: asdf', 0, 0),
(18, 13, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:04:12', 'Rejected by client. Please revise and resubmit.', 0, 0),
(19, 13, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:04:15', 'Fragment submitted: awsd', 0, 0),
(20, 13, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:04:20', 'Rejected by client. Please revise and resubmit.', 0, 0),
(21, 13, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:04:24', 'Fragment submitted: asd', 0, 0),
(22, 13, 1, 'Submitted', 'Submitted', 1, '2026-03-28 12:04:28', 'Fragment submitted: asd', 0, 0),
(23, 13, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:04:31', 'Rejected by client. Please revise and resubmit.', 0, 0),
(24, 13, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:04:33', 'Rejected by client. Please revise and resubmit.', 0, 0),
(25, 13, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:04:39', 'Fragment submitted: asd', 0, 0),
(26, 13, 1, 'Submitted', 'ApprovedPartial', 2, '2026-03-28 12:04:52', 'Approved with partial payout because submission count exceeded limit (5 > 3).', 0, 1),
(27, 14, 1, 'Pending', 'Submitted', 1, '2026-03-28 12:39:14', 'Fragment submitted: asdas', 0, 0),
(28, 14, 1, 'Submitted', 'Approved', 2, '2026-03-28 12:39:20', 'Approved with full payout.', 0, 1),
(29, 15, 1, 'Pending', 'Submitted', 1, '2026-03-28 12:41:06', 'Fragment submitted: asd', 0, 0),
(30, 15, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:41:24', 'Rejected by client. Please revise and resubmit.', 2, 0),
(31, 16, 1, 'Pending', 'Submitted', 1, '2026-03-28 12:42:17', 'Fragment submitted: asd', 0, 0),
(32, 16, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:42:20', 'Rejected by client. Please revise and resubmit.', 8, 0),
(33, 16, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:42:22', 'Fragment submitted: asd', 0, 0),
(34, 16, 1, 'Submitted', 'ApprovedPartial', 2, '2026-03-28 12:42:27', 'Approved with partial payout because fragment was submitted after milestone deadline; last fragment was submitted after contract deadline.', 8, 1),
(35, 17, 1, 'Pending', 'Submitted', 1, '2026-03-28 12:45:39', 'Fragment submitted: asdasdasd', 0, 0),
(36, 17, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:45:42', 'Rejected by client. Please revise and resubmit.', 0, 0),
(37, 17, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:45:47', 'Fragment submitted: asdasd', 0, 0),
(38, 17, 1, 'Submitted', 'Rejected', 2, '2026-03-28 12:45:50', 'Rejected by client. Please revise and resubmit.', 0, 0),
(39, 17, 1, 'UnderRevision', 'Submitted', 1, '2026-03-28 12:45:53', 'Fragment submitted: asdad', 0, 0),
(40, 17, 1, 'Submitted', 'Approved', 2, '2026-03-28 12:45:58', 'Approved with full payout.', 0, 1),
(41, 18, 1, 'Pending', 'Submitted', 1, '2026-04-03 08:20:38', 'Fragment submitted: TWSASDA', 0, 0),
(42, 18, 1, 'Submitted', 'Approved', 2, '2026-04-03 08:21:04', 'Approved with full payout.', 0, 1),
(43, 18, 2, 'Pending', 'Submitted', 1, '2026-04-03 08:21:35', 'Fragment submitted: blogas', 0, 0),
(44, 18, 2, 'Submitted', 'Rejected', 2, '2026-04-03 08:22:06', 'Rejected by client. Please revise and resubmit.', 0, 0),
(45, 18, 3, 'Pending', 'Submitted', 1, '2026-04-03 08:22:12', 'Fragment submitted: asdsadasd', 0, 0),
(46, 18, 3, 'Submitted', 'Rejected', 2, '2026-04-03 08:22:22', 'Netinka, man sitas', 0, 0),
(47, 18, 3, 'UnderRevision', 'Submitted', 1, '2026-04-03 08:23:08', 'Fragment submitted: TADASD', 0, 0),
(48, 18, 3, 'Submitted', 'Rejected', 2, '2026-04-03 08:23:13', 'Rejected by client. Please revise and resubmit.', 0, 0),
(49, 18, 3, 'UnderRevision', 'Submitted', 1, '2026-04-03 08:23:20', 'Fragment submitted: asda', 0, 0),
(50, 18, 3, 'Submitted', 'Approved', 2, '2026-04-03 08:23:41', 'Approved with full payout.', 0, 1),
(51, 18, 2, 'UnderRevision', 'Submitted', 1, '2026-04-03 08:24:22', 'Fragment submitted: asdasd', 0, 0),
(52, 18, 2, 'Submitted', 'Approved', 2, '2026-04-03 08:24:33', 'Approved with full payout.', 0, 1),
(53, 19, 2, 'Pending', 'Submitted', 1, '2026-04-03 08:36:14', 'Fragment submitted: adasd', 0, 0),
(54, 19, 2, 'Submitted', 'Rejected', 2, '2026-04-03 08:36:24', 'Rejected by client. Please revise and resubmit.', 0, 0),
(55, 19, 1, 'Pending', 'Submitted', 1, '2026-04-03 08:36:29', 'Fragment submitted: asda', 0, 0),
(56, 19, 1, 'Submitted', 'Submitted', 1, '2026-04-03 08:36:35', 'Fragment submitted: asdads', 0, 0),
(57, 19, 1, 'Submitted', 'Submitted', 1, '2026-04-03 08:36:39', 'Fragment submitted: asd', 0, 0),
(58, 19, 1, 'Submitted', 'Rejected', 2, '2026-04-03 08:36:44', 'Rejected by client. Please revise and resubmit.', 0, 0),
(59, 19, 1, 'Submitted', 'Rejected', 2, '2026-04-03 08:36:47', 'Rejected by client. Please revise and resubmit.', 0, 0),
(60, 19, 1, 'Submitted', 'Rejected', 2, '2026-04-03 08:36:51', 'Rejected by client. Please revise and resubmit.', 0, 0),
(61, 19, 1, 'UnderRevision', 'Submitted', 1, '2026-04-03 08:37:03', 'Fragment submitted: ads', 0, 0),
(62, 19, 1, 'Submitted', 'ApprovedPartial', 2, '2026-04-03 08:37:13', 'Approved with partial payout because submission count exceeded limit (4 > 3).', 0, 1),
(63, 20, 1, 'Pending', 'Submitted', 1, '2026-04-08 17:58:14', 'Fragment submitted: Done', 0, 0),
(64, 21, 1, 'Pending', 'Submitted', 1, '2026-04-08 18:06:30', 'Fragment submitted: PADARIAU', 0, 0),
(65, 21, 1, 'Submitted', 'Approved', 2, '2026-04-08 18:06:38', 'Approved with full payout.', 0, 1),
(66, 21, 2, 'Pending', 'Submitted', 1, '2026-04-08 18:10:27', 'Fragment submitted: antras fra', 0, 0),
(67, 21, 2, 'Submitted', 'Rejected', 2, '2026-04-08 18:10:39', 'Netinka', 0, 0),
(68, 21, 2, 'UnderRevision', 'Submitted', 1, '2026-04-08 18:10:50', 'Fragment submitted: 2 kartas', 0, 0),
(69, 21, 2, 'Submitted', 'Rejected', 2, '2026-04-08 18:10:58', 'Vel netinka', 0, 0),
(70, 21, 2, 'UnderRevision', 'Submitted', 1, '2026-04-08 18:11:08', 'Fragment submitted: 3 kartas', 0, 0),
(71, 21, 2, 'Submitted', 'Rejected', 2, '2026-04-08 18:11:16', 'NEEE', 0, 0),
(72, 21, 3, 'Pending', 'Submitted', 1, '2026-04-08 18:11:24', 'Fragment submitted: 4 kartas', 0, 0),
(73, 21, 3, 'Submitted', 'Approved', 2, '2026-04-08 18:12:08', 'Approved with full payout.', 0, 1),
(74, 21, 2, 'UnderRevision', 'Submitted', 1, '2026-04-08 18:13:33', 'Fragment submitted: 1', 0, 0),
(75, 21, 2, 'Submitted', 'Rejected', 2, '2026-04-08 18:13:39', 'Rejected by client. Please revise and resubmit.', 0, 0),
(76, 21, 2, 'UnderRevision', 'Submitted', 1, '2026-04-08 18:13:50', 'Fragment submitted: 2', 0, 0),
(77, 21, 2, 'Submitted', 'ApprovedPartial', 2, '2026-04-08 18:14:02', 'Approved with partial payout because submission count exceeded limit (5 > 3).', 0, 1),
(78, 22, 1, 'Pending', 'Submitted', 1, '2026-04-09 08:20:49', 'Fragment submitted: Pirmas fragmentas', 0, 0),
(79, 22, 1, 'Submitted', 'Approved', 2, '2026-04-09 08:21:42', 'Approved with full payout.', 0, 1),
(80, 23, 1, 'Pending', 'Submitted', 1, '2026-04-11 12:45:47', 'Fragment submitted: bad', 0, 0),
(81, 23, 1, 'Submitted', 'Rejected', 2, '2026-04-11 12:45:53', 'Rejected by client. Please revise and resubmit.', 0, 0),
(82, 23, 1, 'UnderRevision', 'Submitted', 1, '2026-04-11 12:45:59', 'Fragment submitted: bad', 0, 0),
(83, 23, 1, 'Submitted', 'Rejected', 2, '2026-04-11 12:46:03', 'Rejected by client. Please revise and resubmit.', 0, 0),
(84, 23, 2, 'Pending', 'Submitted', 1, '2026-04-11 12:46:09', 'Fragment submitted: good', 0, 0),
(85, 23, 1, 'UnderRevision', 'Submitted', 1, '2026-04-11 12:46:25', 'Fragment submitted: good', 0, 0),
(86, 23, 1, 'Submitted', 'ApprovedPartial', 2, '2026-04-11 12:47:02', 'Approved with partial payout (75% refund) because rejected fragments for this milestone exceeded the agreed threshold (2).', 0, 1),
(87, 23, 2, 'Submitted', 'Approved', 2, '2026-04-11 12:47:29', 'Approved with full payout.', 0, 1);

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
(9, 14, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 20.00, 20.00000000, 1, 20.00000000, '0x35346650b99ca274115a45c9bd67ed1f6bd488f4e52cff5cb66c79eedd8aca07', 'Completed', '2026-03-08 15:08:53', '2026-03-28 13:24:44'),
(10, 16, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 400.00, 400.00000000, 2, 200.00000000, '0x42c1765ccf782183090483eebe7970ddeb3bad335d837261bb99280d6a5a62a6', 'Completed', '2026-03-11 13:30:13', '2026-03-11 15:31:11'),
(11, 17, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 5255.00, 5255.00000000, 2, 2627.50000000, '0xd3c347f52439abc45a33355fc7126c153be96a673d3a597fc7d63250afcdea96', 'Completed', '2026-03-13 11:03:27', '2026-03-13 13:04:41'),
(12, 18, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 100.00, 100.00000000, 2, 50.00000000, '0x7097c0261f3414a338439927146a5103980c0f02c0053646a6cd0d167ebf9052', 'Completed', '2026-03-28 11:53:25', '2026-03-28 14:01:59'),
(13, 19, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 2, 100.00, 100.00000000, 1, 100.00000000, '0x98d884fcb2c20d5ff57d1d4097cf6d0623158c55fd716b29260d7805ac81d7a0', 'Completed', '2026-03-28 12:03:38', '2026-03-28 14:04:52'),
(14, 20, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 3, 100.00, 100.00000000, 1, 100.00000000, '0x222918431ba5683cc141809504cba974438e0bf518236415d69d49e386816b88', 'Closed', '2026-03-28 12:38:49', '2026-03-28 14:39:37'),
(15, 21, 2, 1, '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 4, 100.00, NULL, 1, 100.00000000, NULL, 'UnderRevision', '2026-03-28 12:40:58', '2026-03-28 14:41:24'),
(16, 22, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 5, 10.00, 10.00000000, 1, 10.00000000, '0x13fbf44c530d83261e4cefc7444b598c1a2bc6b7c080e892ff2f4e33b8a720be', 'Closed', '2026-03-28 12:42:01', '2026-03-28 14:42:35'),
(17, 23, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 6, 44.00, 44.00000000, 1, 44.00000000, '0x00acc86eab49ec9ee3665c021bf8ea59b988081daa8a75dd24e59c76605508c4', 'Closed', '2026-03-28 12:45:18', '2026-03-28 14:46:34'),
(18, 24, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 250.00, 250.00000000, 3, 83.33333333, '0x4fee730500179b6e14fc405197bec56516fd8731d396639483d1a9bccb4ac007', 'Closed', '2026-04-03 08:09:19', '2026-04-03 11:25:31'),
(19, 25, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 2, 100.00, 100.00000000, 2, 50.00000000, '0x88dfc4014c058c49cbf62dd1e282ad669a45d50d896f5eb8057d34a107ac1348', 'InProgress', '2026-04-03 08:35:42', '2026-04-03 11:37:13'),
(20, 26, 2, 1, '0x70997970c51812dc3a010c7d01b50e0d17dc79c8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 250.00, NULL, 2, 125.00000000, NULL, 'WaitingForApproval', '2026-04-08 17:34:54', '2026-04-08 20:58:14'),
(21, 27, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 2, 200.00, 200.00000000, 3, 66.66666667, '0xc8bf1bad7c28b931041a4bf0e853aa8d7079b1954ae039b0abbbacc455f53cdd', 'Closed', '2026-04-08 18:05:59', '2026-04-08 21:17:30'),
(22, 28, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 5.00, 5.00000000, 1, 5.00000000, '0x2830841ff3138caa6e435d4929c9a744a650f913304009edcf0c3c99791c7b0f', 'Completed', '2026-04-09 08:18:32', '2026-04-09 11:21:42'),
(23, 29, 2, 1, '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', 'localhost', '0x5FbDB2315678afecb367f032d93F642f64180aa3', 1, 200.00, 200.00000000, 2, 100.00000000, '0x5bde38e3d226a80738ce442cc6f7a0a39164e39154a05eba0fb27b65d49efe3c', 'Closed', '2026-04-11 12:43:55', '2026-04-11 15:47:36');

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
(1, 9, 'Funded', 'WaitingForApproval', 1, '2026-03-28 11:22:56', 'Provider submitted fragment for milestone #1.'),
(2, 9, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 11:23:30', 'Fragment #1 rejected by client.'),
(3, 9, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 11:24:39', 'Provider submitted fragment for milestone #1.'),
(4, 9, 'WaitingForApproval', 'Completed', 2, '2026-03-28 11:24:44', 'Milestone #1 approved with partial payout/refund. Provider=10.00000000 ETH, ClientRefund=10.00000000 ETH.'),
(5, 12, 'Funded', 'WaitingForApproval', 1, '2026-03-28 11:55:03', 'Provider submitted fragment for milestone #1.'),
(6, 12, 'WaitingForApproval', 'InProgress', 2, '2026-03-28 12:00:40', 'Milestone #1 approved with full payout.'),
(7, 12, 'InProgress', 'WaitingForApproval', 1, '2026-03-28 12:01:07', 'Provider submitted fragment for milestone #2.'),
(8, 12, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:01:11', 'Fragment #4 rejected by client.'),
(9, 12, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:01:16', 'Provider submitted fragment for milestone #2.'),
(10, 12, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:01:19', 'Fragment #5 rejected by client.'),
(11, 12, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:01:24', 'Provider submitted fragment for milestone #2.'),
(12, 12, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:01:27', 'Fragment #6 rejected by client.'),
(13, 12, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:01:31', 'Provider submitted fragment for milestone #2.'),
(14, 12, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:01:34', 'Fragment #7 rejected by client.'),
(15, 12, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:01:42', 'Provider submitted fragment for milestone #2.'),
(16, 12, 'WaitingForApproval', 'Completed', 2, '2026-03-28 12:01:59', 'Milestone #2 approved with partial payout/refund. Provider=25 ETH, ClientRefund=25 ETH.'),
(17, 13, 'Funded', 'WaitingForApproval', 1, '2026-03-28 12:04:08', 'Provider submitted fragment for milestone #1.'),
(18, 13, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:04:12', 'Fragment #9 rejected by client.'),
(19, 13, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:04:15', 'Provider submitted fragment for milestone #1.'),
(20, 13, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:04:20', 'Fragment #10 rejected by client.'),
(21, 13, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:04:24', 'Provider submitted fragment for milestone #1.'),
(22, 13, 'WaitingForApproval', 'WaitingForApproval', 1, '2026-03-28 12:04:28', 'Provider submitted fragment for milestone #1.'),
(23, 13, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:04:31', 'Fragment #11 rejected by client.'),
(24, 13, 'UnderRevision', 'UnderRevision', 2, '2026-03-28 12:04:33', 'Fragment #12 rejected by client.'),
(25, 13, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:04:39', 'Provider submitted fragment for milestone #1.'),
(26, 13, 'WaitingForApproval', 'Completed', 2, '2026-03-28 12:04:52', 'Milestone #1 approved with partial payout/refund. Provider=50 ETH, ClientRefund=50 ETH.'),
(27, 14, 'Funded', 'WaitingForApproval', 1, '2026-03-28 12:39:14', 'Provider submitted fragment for milestone #1.'),
(28, 14, 'WaitingForApproval', 'Completed', 2, '2026-03-28 12:39:20', 'Milestone #1 approved with full payout.'),
(29, 14, 'Completed', 'Closed', 2, '2026-03-28 12:39:37', 'Client submitted final user rating.'),
(30, 15, 'PendingFunding', 'WaitingForApproval', 1, '2026-03-28 12:41:06', 'Provider submitted fragment for milestone #1.'),
(31, 15, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:41:24', 'Fragment #15 rejected by client.'),
(32, 16, 'Funded', 'WaitingForApproval', 1, '2026-03-28 12:42:17', 'Provider submitted fragment for milestone #1.'),
(33, 16, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:42:20', 'Fragment #16 rejected by client.'),
(34, 16, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:42:22', 'Provider submitted fragment for milestone #1.'),
(35, 16, 'WaitingForApproval', 'Completed', 2, '2026-03-28 12:42:27', 'Milestone #1 approved with partial payout/refund. Provider=5 ETH, ClientRefund=5 ETH.'),
(36, 16, 'Completed', 'Closed', 2, '2026-03-28 12:42:35', 'Client submitted final user rating.'),
(37, 17, 'Funded', 'WaitingForApproval', 1, '2026-03-28 12:45:39', 'Provider submitted fragment for milestone #1.'),
(38, 17, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:45:42', 'Fragment #18 rejected by client.'),
(39, 17, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:45:47', 'Provider submitted fragment for milestone #1.'),
(40, 17, 'WaitingForApproval', 'UnderRevision', 2, '2026-03-28 12:45:50', 'Fragment #19 rejected by client.'),
(41, 17, 'UnderRevision', 'WaitingForApproval', 1, '2026-03-28 12:45:53', 'Provider submitted fragment for milestone #1.'),
(42, 17, 'WaitingForApproval', 'Completed', 2, '2026-03-28 12:45:58', 'Milestone #1 approved with full payout.'),
(43, 17, 'Completed', 'Closed', 2, '2026-03-28 12:46:34', 'Client submitted final user rating.'),
(44, 18, 'Funded', 'WaitingForApproval', 1, '2026-04-03 08:20:38', 'Provider submitted fragment for milestone #1.'),
(45, 18, 'WaitingForApproval', 'InProgress', 2, '2026-04-03 08:21:04', 'Milestone #1 approved with full payout.'),
(46, 18, 'InProgress', 'WaitingForApproval', 1, '2026-04-03 08:21:35', 'Provider submitted fragment for milestone #2.'),
(47, 18, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-03 08:22:06', 'Fragment #22 rejected by client.'),
(48, 18, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-03 08:22:12', 'Provider submitted fragment for milestone #3.'),
(49, 18, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-03 08:22:22', 'Fragment #23 rejected by client.'),
(50, 18, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-03 08:23:08', 'Provider submitted fragment for milestone #3.'),
(51, 18, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-03 08:23:13', 'Fragment #24 rejected by client.'),
(52, 18, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-03 08:23:20', 'Provider submitted fragment for milestone #3.'),
(53, 18, 'WaitingForApproval', 'InProgress', 2, '2026-04-03 08:23:41', 'Milestone #3 approved with full payout.'),
(54, 18, 'InProgress', 'WaitingForApproval', 1, '2026-04-03 08:24:22', 'Provider submitted fragment for milestone #2.'),
(55, 18, 'WaitingForApproval', 'Completed', 2, '2026-04-03 08:24:33', 'Milestone #2 approved with full payout.'),
(56, 18, 'Completed', 'Closed', 2, '2026-04-03 08:25:31', 'Client submitted final user rating.'),
(57, 19, 'Funded', 'WaitingForApproval', 1, '2026-04-03 08:36:14', 'Provider submitted fragment for milestone #2.'),
(58, 19, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-03 08:36:24', 'Fragment #27 rejected by client.'),
(59, 19, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-03 08:36:29', 'Provider submitted fragment for milestone #1.'),
(60, 19, 'WaitingForApproval', 'WaitingForApproval', 1, '2026-04-03 08:36:35', 'Provider submitted fragment for milestone #1.'),
(61, 19, 'WaitingForApproval', 'WaitingForApproval', 1, '2026-04-03 08:36:39', 'Provider submitted fragment for milestone #1.'),
(62, 19, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-03 08:36:44', 'Fragment #28 rejected by client.'),
(63, 19, 'UnderRevision', 'UnderRevision', 2, '2026-04-03 08:36:47', 'Fragment #29 rejected by client.'),
(64, 19, 'UnderRevision', 'UnderRevision', 2, '2026-04-03 08:36:51', 'Fragment #30 rejected by client.'),
(65, 19, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-03 08:37:03', 'Provider submitted fragment for milestone #1.'),
(66, 19, 'WaitingForApproval', 'InProgress', 2, '2026-04-03 08:37:13', 'Milestone #1 approved with partial payout/refund. Provider=25 ETH, ClientRefund=25 ETH.'),
(67, 20, 'PendingFunding', 'WaitingForApproval', 1, '2026-04-08 17:58:14', 'Provider submitted fragment for milestone #1.'),
(68, 21, 'Funded', 'WaitingForApproval', 1, '2026-04-08 18:06:30', 'Provider submitted fragment for milestone #1.'),
(69, 21, 'WaitingForApproval', 'InProgress', 2, '2026-04-08 18:06:38', 'Milestone #1 approved with full payout.'),
(70, 21, 'InProgress', 'WaitingForApproval', 1, '2026-04-08 18:10:27', 'Provider submitted fragment for milestone #2.'),
(71, 21, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-08 18:10:39', 'Fragment #34 rejected by client.'),
(72, 21, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-08 18:10:50', 'Provider submitted fragment for milestone #2.'),
(73, 21, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-08 18:10:58', 'Fragment #35 rejected by client.'),
(74, 21, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-08 18:11:08', 'Provider submitted fragment for milestone #2.'),
(75, 21, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-08 18:11:16', 'Fragment #36 rejected by client.'),
(76, 21, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-08 18:11:24', 'Provider submitted fragment for milestone #3.'),
(77, 21, 'WaitingForApproval', 'InProgress', 2, '2026-04-08 18:12:08', 'Milestone #3 approved with full payout.'),
(78, 21, 'InProgress', 'WaitingForApproval', 1, '2026-04-08 18:13:33', 'Provider submitted fragment for milestone #2.'),
(79, 21, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-08 18:13:39', 'Fragment #38 rejected by client.'),
(80, 21, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-08 18:13:50', 'Provider submitted fragment for milestone #2.'),
(81, 21, 'WaitingForApproval', 'Completed', 2, '2026-04-08 18:14:02', 'Milestone #2 approved with partial payout/refund. Provider=33.335 ETH, ClientRefund=33.335 ETH.'),
(82, 21, 'Completed', 'Closed', 2, '2026-04-08 18:17:30', 'Client submitted final user rating.'),
(83, 22, 'Funded', 'WaitingForApproval', 1, '2026-04-09 08:20:49', 'Provider submitted fragment for milestone #1.'),
(84, 22, 'WaitingForApproval', 'Completed', 2, '2026-04-09 08:21:42', 'Milestone #1 approved with full payout.'),
(85, 23, 'Funded', 'WaitingForApproval', 1, '2026-04-11 12:45:47', 'Provider submitted fragment for milestone #1.'),
(86, 23, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-11 12:45:53', 'Fragment #41 rejected by client.'),
(87, 23, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-11 12:45:59', 'Provider submitted fragment for milestone #1.'),
(88, 23, 'WaitingForApproval', 'UnderRevision', 2, '2026-04-11 12:46:03', 'Fragment #42 rejected by client.'),
(89, 23, 'UnderRevision', 'WaitingForApproval', 1, '2026-04-11 12:46:09', 'Provider submitted fragment for milestone #2.'),
(90, 23, 'WaitingForApproval', 'WaitingForApproval', 1, '2026-04-11 12:46:25', 'Provider submitted fragment for milestone #1.'),
(91, 23, 'WaitingForApproval', 'InProgress', 2, '2026-04-11 12:47:02', 'Milestone #1 approved with partial payout/refund. Provider=25 ETH, ClientRefund=75 ETH.'),
(92, 23, 'InProgress', 'Completed', 2, '2026-04-11 12:47:29', 'Milestone #2 approved with full payout.'),
(93, 23, 'Completed', 'Closed', 2, '2026-04-11 12:47:36', 'Client submitted final user rating.');

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
(7, 9, 1, 2, 'labas', '2026-03-27 11:16:10', 1, '2026-03-28 11:07:48'),
(8, 20, 1, 2, 'Hello', '2026-04-08 17:57:50', 1, '2026-04-08 17:57:52'),
(9, 22, 2, 1, 'Labas, ka tu', '2026-04-09 08:20:15', 1, '2026-04-09 08:20:17'),
(10, 23, 1, 2, 'HEELO', '2026-04-11 12:45:32', 1, '2026-04-11 12:45:50');

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
(19, 9, 30, 1, 20.00000000, 20.00, 'ReleasedPartial', 'SIMULATED-bf02ffcbcbc24624ac4015a19a325e2f', '2026-03-28 11:24:44', '2026-03-08 15:08:53', '2026-03-28 13:24:44'),
(20, 10, 32, 1, 200.00000000, 200.00, 'Released', '0xaf879ad0c0acb774ef6be5751d81b11b9be8307820db447cb6d6544f7a4ca562', '2026-03-11 13:31:07', '2026-03-11 13:30:13', '2026-03-11 15:31:07'),
(21, 10, 33, 2, 200.00000000, 200.00, 'Released', '0xcdec548d652311d27930df3e1f836107a4bf9c57a64518d8f20013ca8dd28f39', '2026-03-11 13:31:11', '2026-03-11 13:30:13', '2026-03-11 15:31:11'),
(22, 11, 34, 1, 2627.50000000, 2627.50, 'Released', '0x2f0fe1294328fd94264d2a9f07644ada38bf2b1b35c4fca9aa48609cb2bb0a86', '2026-03-13 11:04:34', '2026-03-13 11:03:28', '2026-03-13 13:04:34'),
(23, 11, 35, 2, 2627.50000000, 2627.50, 'Released', '0x5f52f275a86b8996fe7d6c00f6340c35fc930bced7d235bbf031231a694bcac7', '2026-03-13 11:04:41', '2026-03-13 11:03:28', '2026-03-13 13:04:41'),
(24, 12, 36, 1, 50.00000000, 50.00, 'Released', '0x05525da34d88765c28ab79ac51eff35f5b82d1dfc512a45564d1b15dd971d7b3', '2026-03-28 12:00:40', '2026-03-28 11:53:25', '2026-03-28 14:00:40'),
(25, 12, 37, 2, 50.00000000, 50.00, 'ReleasedPartial', '0x9e4dd5f10aedb5dac023d8e7f5349eb91d2204f0984c4b1a4d8cb8e2edd67d60', '2026-03-28 12:01:59', '2026-03-28 11:53:25', '2026-03-28 14:01:59'),
(26, 13, 38, 1, 100.00000000, 100.00, 'ReleasedPartial', '0x019be92fba75b8918c21c2af3696d231cb81c9df016cab20b00434b2343e9f90', '2026-03-28 12:04:52', '2026-03-28 12:03:38', '2026-03-28 14:04:52'),
(27, 14, 39, 1, 100.00000000, 100.00, 'Released', '0xec4ae479788f4cc24c742eaab0cb42c52b44d9054f3a6a5cbd6feece3de44d44', '2026-03-28 12:39:20', '2026-03-28 12:38:49', '2026-03-28 14:39:20'),
(28, 15, 40, 1, 100.00000000, 100.00, 'UnderRevision', NULL, NULL, '2026-03-28 12:40:58', '2026-03-28 14:41:24'),
(29, 16, 41, 1, 10.00000000, 10.00, 'ReleasedPartial', '0x2afb2332c53c7d7f8b4a8a61e46e4fbec0c036620b07edf9fe8588f17e7055ae', '2026-03-28 12:42:27', '2026-03-28 12:42:01', '2026-03-28 14:42:27'),
(30, 17, 42, 1, 44.00000000, 44.00, 'Released', '0x6baa1555633a0bead19ee33b5b5a244500e57d7ea80511854bb953e441d70909', '2026-03-28 12:45:58', '2026-03-28 12:45:18', '2026-03-28 14:45:58'),
(31, 18, 43, 1, 83.33000000, 83.33, 'Released', '0xcf95fa5d6dd5533da2b35b32dfa778de18657fcd167ecbb5b7e6ce7bf58d0f53', '2026-04-03 08:21:04', '2026-04-03 08:09:19', '2026-04-03 11:21:04'),
(32, 18, 44, 2, 83.33000000, 83.33, 'Released', '0xe9b8344687dd9441720d354d5fb7902d06a5b3ee9584e3ce465ef502a21f9bcc', '2026-04-03 08:24:33', '2026-04-03 08:09:19', '2026-04-03 11:24:33'),
(33, 18, 45, 3, 83.34000000, 83.34, 'Released', '0x9b949ca2a6ac2c4f6c1fa473396ffe7c15ae3f873bdf19c12c66677b4b1e756b', '2026-04-03 08:23:41', '2026-04-03 08:09:19', '2026-04-03 11:23:41'),
(34, 19, 46, 1, 50.00000000, 50.00, 'ReleasedPartial', '0x1b4fcb09af491a211ada7932efadaae252ffa54d18b3f98e6041519f9e8f676b', '2026-04-03 08:37:13', '2026-04-03 08:35:42', '2026-04-03 11:37:13'),
(35, 19, 47, 2, 50.00000000, 50.00, 'UnderRevision', NULL, NULL, '2026-04-03 08:35:42', '2026-04-03 11:36:24'),
(36, 20, 48, 1, 125.00000000, 125.00, 'Submitted', NULL, NULL, '2026-04-08 17:34:55', '2026-04-08 20:58:14'),
(37, 20, 49, 2, 125.00000000, 125.00, 'Pending', NULL, NULL, '2026-04-08 17:34:55', '2026-04-08 20:34:55'),
(38, 21, 50, 1, 66.67000000, 66.67, 'Released', '0x84c339742df006a95423f61dc82fcbaf85b97b4291c7ec5c3f8e9e8bca1b4cd6', '2026-04-08 18:06:38', '2026-04-08 18:05:59', '2026-04-08 21:06:38'),
(39, 21, 51, 2, 66.67000000, 66.67, 'ReleasedPartial', '0xcd5f042b1182425072e4d99c952aef80d1428a433ecd0933c48851888cb8d436', '2026-04-08 18:14:02', '2026-04-08 18:05:59', '2026-04-08 21:14:02'),
(40, 21, 52, 3, 66.66000000, 66.66, 'Released', '0x2dbfb4af15cd3ceccaf0b06e1db947419cfa5f3c3c5afe87b87865d81c0a7ae4', '2026-04-08 18:12:08', '2026-04-08 18:05:59', '2026-04-08 21:12:08'),
(41, 22, 53, 1, 5.00000000, 5.00, 'Released', '0xf7df5104f1918908965d6770a589d96486400552e671133902d07471b8fcb1f7', '2026-04-09 08:21:42', '2026-04-09 08:18:32', '2026-04-09 11:21:42'),
(42, 23, 54, 1, 100.00000000, 100.00, 'ReleasedPartial', '0x546124d065544b3566a3eaa84b2d34cf8066cb7bd21f967a836c86402097b254', '2026-04-11 12:47:02', '2026-04-11 12:43:55', '2026-04-11 15:47:02'),
(43, 23, 55, 2, 100.00000000, 100.00, 'Released', '0x47b65fa8a396c52b9328901b98ebc36e58f64fd6cbe3fa1e65555e5d4ab06b36', '2026-04-11 12:47:29', '2026-04-11 12:43:55', '2026-04-11 15:47:29');

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
(17, 4, 2, 'dfs', 5255.00, '2026-03-13 11:03:12', 1, 'ACCEPTED', 0, '2026-03-13 11:03:28', NULL, 'OWNER', 1, 0),
(18, 4, 2, 'Pilnas ismokejimas TEST', 100.00, '2026-03-28 11:53:07', 1, 'ACCEPTED', 0, '2026-03-28 11:53:25', NULL, 'OWNER', 1, 1),
(19, 4, 2, 'trfy', 100.00, '2026-03-28 12:03:32', 1, 'ACCEPTED', 0, '2026-03-28 12:03:38', NULL, 'OWNER', 1, 0),
(20, 7, 2, 'asd', 100.00, '2026-03-28 12:38:39', 1, 'ACCEPTED', 0, '2026-03-28 12:38:49', NULL, 'OWNER', 1, 1),
(21, 7, 2, 'asd', 100.00, '2026-03-28 12:40:51', 1, 'ACCEPTED', 0, '2026-03-28 12:40:58', NULL, 'OWNER', 1, 0),
(22, 6, 2, 'asd', 10.00, '2026-03-28 12:41:51', 1, 'ACCEPTED', 0, '2026-03-28 12:42:01', NULL, 'OWNER', 1, 1),
(23, 7, 2, 'asd', 44.00, '2026-03-28 12:45:11', 1, 'ACCEPTED', 0, '2026-03-28 12:45:18', NULL, 'OWNER', 1, 1),
(24, 7, 2, 'TESTAS POKALBIO', 250.00, '2026-04-03 08:09:07', 1, 'ACCEPTED', 0, '2026-04-03 08:09:19', NULL, 'OWNER', 1, 1),
(25, 4, 2, 'adsa', 100.00, '2026-04-03 08:35:30', 1, 'ACCEPTED', 0, '2026-04-03 08:35:42', NULL, 'OWNER', 1, 1),
(26, 4, 2, '2026 - 04 - 08 Reikai dabar', 250.00, '2026-04-08 17:32:12', 1, 'ACCEPTED', 0, '2026-04-08 17:34:55', NULL, 'OWNER', 1, 1),
(27, 7, 2, '2026-04-08', 200.00, '2026-04-08 18:05:50', 1, 'ACCEPTED', 0, '2026-04-08 18:05:59', NULL, 'OWNER', 1, 1),
(28, 6, 2, 'asd', 5.00, '2026-04-08 18:37:43', 1, 'ACCEPTED', 0, '2026-04-09 08:18:32', NULL, 'OWNER', 1, 0),
(29, 7, 2, '2026-4-11', 200.00, '2026-04-11 12:31:38', 1, 'ACCEPTED', 0, '2026-04-11 12:43:55', NULL, 'OWNER', 1, 0);

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
(1, 29, 2.00, 0.00, 1.00, 75.00, 2.00, 50.00, 2.00, 0.00, 0, 0.00, '2026-04-11 15:31:38', '2026-04-11 15:43:46');

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
(9, 2, 'New message', 'jokubas sent you a message: labas', 'contract_message', 9, 1, '2026-03-27 11:16:10'),
(10, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #9, milestone #1.', 'contract_fragment_submitted', 9, 1, '2026-03-28 11:22:56'),
(11, 1, 'Fragment rejected', 'Your fragment for contract #9 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 9, 1, '2026-03-28 11:23:30'),
(12, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #9, milestone #1.', 'contract_fragment_submitted', 9, 1, '2026-03-28 11:24:39'),
(13, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #9.', 'contract_fragment_partial_release', 9, 1, '2026-03-28 11:24:44'),
(14, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #12, milestone #1.', 'contract_fragment_submitted', 12, 1, '2026-03-28 11:55:03'),
(15, 1, 'Fragment approved', 'Fragment approved and payout released for contract #12.', 'contract_fragment_release', 12, 1, '2026-03-28 12:00:40'),
(16, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #12, milestone #2.', 'contract_fragment_submitted', 12, 1, '2026-03-28 12:01:07'),
(17, 1, 'Fragment rejected', 'Your fragment for contract #12 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 12, 1, '2026-03-28 12:01:11'),
(18, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #12, milestone #2.', 'contract_fragment_submitted', 12, 1, '2026-03-28 12:01:16'),
(19, 1, 'Fragment rejected', 'Your fragment for contract #12 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 12, 1, '2026-03-28 12:01:19'),
(20, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #12, milestone #2.', 'contract_fragment_submitted', 12, 1, '2026-03-28 12:01:24'),
(21, 1, 'Fragment rejected', 'Your fragment for contract #12 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 12, 1, '2026-03-28 12:01:27'),
(22, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #12, milestone #2.', 'contract_fragment_submitted', 12, 1, '2026-03-28 12:01:31'),
(23, 1, 'Fragment rejected', 'Your fragment for contract #12 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 12, 1, '2026-03-28 12:01:34'),
(24, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #12, milestone #2.', 'contract_fragment_submitted', 12, 1, '2026-03-28 12:01:42'),
(25, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #12.', 'contract_fragment_partial_release', 12, 1, '2026-03-28 12:01:59'),
(26, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #13, milestone #1.', 'contract_fragment_submitted', 13, 1, '2026-03-28 12:04:08'),
(27, 1, 'Fragment rejected', 'Your fragment for contract #13 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 13, 1, '2026-03-28 12:04:12'),
(28, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #13, milestone #1.', 'contract_fragment_submitted', 13, 1, '2026-03-28 12:04:15'),
(29, 1, 'Fragment rejected', 'Your fragment for contract #13 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 13, 1, '2026-03-28 12:04:20'),
(30, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #13, milestone #1.', 'contract_fragment_submitted', 13, 1, '2026-03-28 12:04:24'),
(31, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #13, milestone #1.', 'contract_fragment_submitted', 13, 1, '2026-03-28 12:04:28'),
(32, 1, 'Fragment rejected', 'Your fragment for contract #13 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 13, 1, '2026-03-28 12:04:31'),
(33, 1, 'Fragment rejected', 'Your fragment for contract #13 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 13, 1, '2026-03-28 12:04:33'),
(34, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #13, milestone #1.', 'contract_fragment_submitted', 13, 1, '2026-03-28 12:04:39'),
(35, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #13.', 'contract_fragment_partial_release', 13, 1, '2026-03-28 12:04:52'),
(36, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #14, milestone #1.', 'contract_fragment_submitted', 14, 1, '2026-03-28 12:39:14'),
(37, 1, 'Fragment approved', 'Fragment approved and payout released for contract #14.', 'contract_fragment_release', 14, 1, '2026-03-28 12:39:20'),
(38, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #15, milestone #1.', 'contract_fragment_submitted', 15, 1, '2026-03-28 12:41:06'),
(39, 1, 'Fragment rejected', 'Your fragment for contract #15 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 15, 1, '2026-03-28 12:41:24'),
(40, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #16, milestone #1.', 'contract_fragment_submitted', 16, 1, '2026-03-28 12:42:17'),
(41, 1, 'Fragment rejected', 'Your fragment for contract #16 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 16, 1, '2026-03-28 12:42:20'),
(42, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #16, milestone #1.', 'contract_fragment_submitted', 16, 1, '2026-03-28 12:42:22'),
(43, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #16.', 'contract_fragment_partial_release', 16, 1, '2026-03-28 12:42:27'),
(44, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #17, milestone #1.', 'contract_fragment_submitted', 17, 1, '2026-03-28 12:45:39'),
(45, 1, 'Fragment rejected', 'Your fragment for contract #17 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 17, 1, '2026-03-28 12:45:42'),
(46, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #17, milestone #1.', 'contract_fragment_submitted', 17, 1, '2026-03-28 12:45:47'),
(47, 1, 'Fragment rejected', 'Your fragment for contract #17 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 17, 1, '2026-03-28 12:45:50'),
(48, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #17, milestone #1.', 'contract_fragment_submitted', 17, 1, '2026-03-28 12:45:53'),
(49, 1, 'Fragment approved', 'Fragment approved and payout released for contract #17.', 'contract_fragment_release', 17, 1, '2026-03-28 12:45:58'),
(50, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #18, milestone #1.', 'contract_fragment_submitted', 18, 1, '2026-04-03 08:20:38'),
(51, 1, 'Fragment approved', 'Fragment approved and payout released for contract #18.', 'contract_fragment_release', 18, 1, '2026-04-03 08:21:04'),
(52, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #18, milestone #2.', 'contract_fragment_submitted', 18, 1, '2026-04-03 08:21:35'),
(53, 1, 'Fragment rejected', 'Your fragment for contract #18 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 18, 1, '2026-04-03 08:22:06'),
(54, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #18, milestone #3.', 'contract_fragment_submitted', 18, 1, '2026-04-03 08:22:12'),
(55, 1, 'Fragment rejected', 'Your fragment for contract #18 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 18, 1, '2026-04-03 08:22:22'),
(56, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #18, milestone #3.', 'contract_fragment_submitted', 18, 1, '2026-04-03 08:23:08'),
(57, 1, 'Fragment rejected', 'Your fragment for contract #18 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 18, 1, '2026-04-03 08:23:13'),
(58, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #18, milestone #3.', 'contract_fragment_submitted', 18, 1, '2026-04-03 08:23:20'),
(59, 1, 'Fragment approved', 'Fragment approved and payout released for contract #18.', 'contract_fragment_release', 18, 1, '2026-04-03 08:23:41'),
(60, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #18, milestone #2.', 'contract_fragment_submitted', 18, 1, '2026-04-03 08:24:22'),
(61, 1, 'Fragment approved', 'Fragment approved and payout released for contract #18.', 'contract_fragment_release', 18, 1, '2026-04-03 08:24:33'),
(62, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #19, milestone #2.', 'contract_fragment_submitted', 19, 1, '2026-04-03 08:36:14'),
(63, 1, 'Fragment rejected', 'Your fragment for contract #19 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 19, 1, '2026-04-03 08:36:24'),
(64, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #19, milestone #1.', 'contract_fragment_submitted', 19, 1, '2026-04-03 08:36:29'),
(65, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #19, milestone #1.', 'contract_fragment_submitted', 19, 1, '2026-04-03 08:36:35'),
(66, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #19, milestone #1.', 'contract_fragment_submitted', 19, 1, '2026-04-03 08:36:39'),
(67, 1, 'Fragment rejected', 'Your fragment for contract #19 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 19, 1, '2026-04-03 08:36:44'),
(68, 1, 'Fragment rejected', 'Your fragment for contract #19 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 19, 1, '2026-04-03 08:36:47'),
(69, 1, 'Fragment rejected', 'Your fragment for contract #19 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 19, 1, '2026-04-03 08:36:51'),
(70, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #19, milestone #1.', 'contract_fragment_submitted', 19, 1, '2026-04-03 08:37:03'),
(71, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #19.', 'contract_fragment_partial_release', 19, 1, '2026-04-03 08:37:13'),
(72, 2, 'New message', 'jokubas sent you a message: Hello', 'contract_message', 20, 1, '2026-04-08 17:57:50'),
(73, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #20, milestone #1.', 'contract_fragment_submitted', 20, 0, '2026-04-08 17:58:14'),
(74, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #1.', 'contract_fragment_submitted', 21, 0, '2026-04-08 18:06:30'),
(75, 1, 'Fragment approved', 'Fragment approved and payout released for contract #21.', 'contract_fragment_release', 21, 1, '2026-04-08 18:06:38'),
(76, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #2.', 'contract_fragment_submitted', 21, 0, '2026-04-08 18:10:27'),
(77, 1, 'Fragment rejected', 'Your fragment for contract #21 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 21, 1, '2026-04-08 18:10:39'),
(78, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #2.', 'contract_fragment_submitted', 21, 0, '2026-04-08 18:10:50'),
(79, 1, 'Fragment rejected', 'Your fragment for contract #21 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 21, 1, '2026-04-08 18:10:58'),
(80, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #2.', 'contract_fragment_submitted', 21, 0, '2026-04-08 18:11:08'),
(81, 1, 'Fragment rejected', 'Your fragment for contract #21 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 21, 1, '2026-04-08 18:11:16'),
(82, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #3.', 'contract_fragment_submitted', 21, 0, '2026-04-08 18:11:24'),
(83, 1, 'Fragment approved', 'Fragment approved and payout released for contract #21.', 'contract_fragment_release', 21, 1, '2026-04-08 18:12:08'),
(84, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #2.', 'contract_fragment_submitted', 21, 0, '2026-04-08 18:13:33'),
(85, 1, 'Fragment rejected', 'Your fragment for contract #21 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 21, 1, '2026-04-08 18:13:39'),
(86, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #21, milestone #2.', 'contract_fragment_submitted', 21, 1, '2026-04-08 18:13:50'),
(87, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #21.', 'contract_fragment_partial_release', 21, 1, '2026-04-08 18:14:02'),
(88, 1, 'New message', 'povilas sent you a message: Labas, ka tu', 'contract_message', 22, 1, '2026-04-09 08:20:15'),
(89, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #22, milestone #1.', 'contract_fragment_submitted', 22, 0, '2026-04-09 08:20:49'),
(90, 1, 'Fragment approved', 'Fragment approved and payout released for contract #22.', 'contract_fragment_release', 22, 1, '2026-04-09 08:21:42'),
(91, 2, 'New message', 'jokubas sent you a message: HEELO', 'contract_message', 23, 0, '2026-04-11 12:45:32'),
(92, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #23, milestone #1.', 'contract_fragment_submitted', 23, 0, '2026-04-11 12:45:47'),
(93, 1, 'Fragment rejected', 'Your fragment for contract #23 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 23, 0, '2026-04-11 12:45:53'),
(94, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #23, milestone #1.', 'contract_fragment_submitted', 23, 0, '2026-04-11 12:45:59'),
(95, 1, 'Fragment rejected', 'Your fragment for contract #23 was rejected. Please revise and resubmit.', 'contract_fragment_rejected', 23, 0, '2026-04-11 12:46:03'),
(96, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #23, milestone #2.', 'contract_fragment_submitted', 23, 0, '2026-04-11 12:46:09'),
(97, 2, 'New fragment submitted', 'Provider submitted a fragment for contract #23, milestone #1.', 'contract_fragment_submitted', 23, 0, '2026-04-11 12:46:25'),
(98, 1, 'Partial payout processed', 'Fragment approved with partial payout for contract #23.', 'contract_fragment_partial_release', 23, 0, '2026-04-11 12:47:02'),
(99, 1, 'Fragment approved', 'Fragment approved and payout released for contract #23.', 'contract_fragment_release', 23, 0, '2026-04-11 12:47:29');

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
(1, 9, 4, 2, 1, NULL, NULL, NULL, NULL, '2026-03-28 11:24:44', '2026-03-28 13:24:44'),
(2, 12, 4, 2, 1, NULL, NULL, NULL, NULL, '2026-03-28 12:01:59', '2026-03-28 14:01:59'),
(3, 13, 4, 2, 1, NULL, NULL, NULL, NULL, '2026-03-28 12:04:52', '2026-03-28 14:04:52'),
(4, 14, 7, 2, 1, 4, 'Visai neblogai', 5.00, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 1 milestone(s).\r\nRevision count: 2/2 - Average revision score is 2 across 1 milestone(s).\r\nContract speed: 2/2 - Contract completed at 2026-03-28 12:39:20, deadline was 2026-04-03 00:00:00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 2/2 - Rejected fragment count is 0.\r\nTotal: 10/10\r\nFinal system rating: 5.00/5.00', '2026-03-28 12:38:50', '2026-03-28 14:39:37'),
(5, 15, 7, 2, 1, NULL, NULL, NULL, NULL, '2026-03-28 12:40:59', '2026-03-28 14:40:59'),
(6, 16, 6, 2, 1, 3, 'eh', 5.00, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 1 milestone(s).\r\nRevision count: 2/2 - Average revision score is 2 across 1 milestone(s).\r\nContract speed: 2/2 - Contract completed at 2026-03-28 12:42:27, deadline was 2026-03-20 00:00:00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 2/2 - Rejected fragment count is 1.\r\nTotal: 10/10\r\nFinal system rating: 5.00/5.00', '2026-03-28 12:42:02', '2026-03-28 14:42:35'),
(7, 17, 7, 2, 1, 2, 'asd', 4.00, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 1 milestone(s).\r\nRevision count: 1/2 - Average revision score is 1 across 1 milestone(s).\r\nContract speed: 2/2 - Contract completed at 2026-03-28 12:45:58, deadline was 2026-04-02 00:00:00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 1/2 - Rejected fragment count is 2.\r\nTotal: 8/10\r\nFinal system rating: 4.00/5.00', '2026-03-28 12:45:19', '2026-03-28 14:46:34'),
(8, 18, 7, 2, 1, 4, 'Gerai', 4.34, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 3 milestone(s).\r\nRevision count: 1.67/2 - Average revision score is 1.67 across 3 milestone(s).\r\nContract speed: 2/2 - Contract completed at 2026-04-03 08:24:33, deadline was 2026-04-19 00:00:00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 1/2 - Rejected fragment count is 3.\r\nTotal: 8.67/10\r\nFinal system rating: 4.34/5.00', '2026-04-03 08:09:21', '2026-04-03 11:25:31'),
(9, 19, 4, 2, 1, NULL, NULL, NULL, NULL, '2026-04-03 08:35:43', '2026-04-03 11:35:43'),
(10, 20, 4, 2, 1, NULL, NULL, NULL, NULL, '2026-04-08 17:34:56', '2026-04-08 20:34:56'),
(11, 21, 7, 2, 1, 1, 'Truko darbo uzbaigtumo', 3.67, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 3 milestone(s).\r\nRevision count: 1.33/2 - Average revision score is 1.33 across 3 milestone(s).\r\nContract speed: 2/2 - Contract completed at 2026-04-08 18:14:02, deadline was 2026-04-23 00:00:00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 0/2 - Rejected fragment count is 4.\r\nTotal: 7.33/10\r\nFinal system rating: 3.67/5.00', '2026-04-08 18:06:00', '2026-04-08 21:17:30'),
(12, 22, 6, 2, 1, NULL, NULL, 5.00, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 1 milestone(s).\r\nRevision count: 2/2 - Average revision score is 2 across 1 milestone(s).\r\nContract speed: 2/2 - Contract completed at 2026-04-09 08:21:42, deadline was 2026-04-22 00:00:00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply.\r\nRejected fragments: 2/2 - Rejected fragment count is 0.\r\nTotal: 10/10\r\nFinal system rating: 5.00/5.00', '2026-04-09 08:18:34', '2026-04-09 11:21:42'),
(13, 11, 4, 2, 1, NULL, NULL, NULL, NULL, '2026-04-11 11:35:20', '2026-04-11 14:35:20'),
(14, 23, 7, 2, 1, 1, 'eh', 4.00, 'Fragment speed: 2/2 - Average milestone speed score is 2 across 2 milestone(s). Agreed minimum: 2.00.\r\nRevision count: 1.5/2 - Average rejected fragments per milestone is 1 across 2 milestone(s). Agreed maximum average rejects per milestone: 1.00.\r\nContract speed: 2/2 - Contract completed at 2026-04-11 12:47:29, deadline was 2026-04-19 00:00:00. Agreed minimum: 2.00.\r\nMessage response: 2/2 - No client-provider response pairs required a provider reply. Agreed minimum: 2.00.\r\nRejected fragments: 1/2 - Rejected fragment count is 2. Agreed maximum count: 0.\r\nTotal: 8/10\r\nFinal system rating: 4.00/5.00', '2026-04-11 12:43:56', '2026-04-11 15:47:36');

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
(35, 17, 'sdfs', NULL, '2026-03-25'),
(36, 18, 'TST 1', NULL, '2026-03-31'),
(37, 18, 'TST 2', NULL, '2026-04-05'),
(38, 19, 'gtyf', NULL, '2026-04-02'),
(39, 20, 'asd', NULL, '2026-04-03'),
(40, 21, 'asd', NULL, '2026-03-26'),
(41, 22, 'asd', NULL, '2026-03-20'),
(42, 23, 'asd', NULL, '2026-04-02'),
(43, 24, 'REQUIREMENT 1', NULL, '2026-04-05'),
(44, 24, 'REQUIREMENT 2', NULL, '2026-04-12'),
(45, 24, 'REQUIREMENT 3', NULL, '2026-04-19'),
(46, 25, 'tesas', NULL, '2026-04-05'),
(47, 25, 'asas', NULL, '2026-04-05'),
(48, 26, 'asda', NULL, '2026-04-09'),
(49, 26, 'ads', NULL, '2026-04-15'),
(50, 27, 'PADARYK', NULL, '2026-04-09'),
(51, 27, 'CIA REIKIA TO', NULL, '2026-04-15'),
(52, 27, 'O CIA KITO', NULL, '2026-04-23'),
(53, 28, 'asd', NULL, '2026-04-22'),
(54, 29, 'TEST Ą', NULL, '2026-04-12'),
(55, 29, 'TEST Č', NULL, '2026-04-19');

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
  MODIFY `CategoryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `b_comments`
--
ALTER TABLE `b_comments`
  MODIFY `commentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `b_completed_listing_fragment`
--
ALTER TABLE `b_completed_listing_fragment`
  MODIFY `fragmentId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=45;

--
-- AUTO_INCREMENT for table `b_completed_list_fragment_history`
--
ALTER TABLE `b_completed_list_fragment_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=88;

--
-- AUTO_INCREMENT for table `b_contract`
--
ALTER TABLE `b_contract`
  MODIFY `contractId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `b_contract_history`
--
ALTER TABLE `b_contract_history`
  MODIFY `historyId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=94;

--
-- AUTO_INCREMENT for table `b_contract_messages`
--
ALTER TABLE `b_contract_messages`
  MODIFY `messageId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `b_contract_milestone`
--
ALTER TABLE `b_contract_milestone`
  MODIFY `milestoneId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=44;

--
-- AUTO_INCREMENT for table `b_inquiry`
--
ALTER TABLE `b_inquiry`
  MODIFY `inquiryId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `b_inquiry_contract_terms`
--
ALTER TABLE `b_inquiry_contract_terms`
  MODIFY `inquiryContractTermsId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

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
  MODIFY `notificationId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=100;

--
-- AUTO_INCREMENT for table `b_rating`
--
ALTER TABLE `b_rating`
  MODIFY `ratingId` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `b_requirement`
--
ALTER TABLE `b_requirement`
  MODIFY `requirementId` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=56;

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
