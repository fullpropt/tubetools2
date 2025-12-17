-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Tempo de geração: 16/12/2025 às 23:29
-- Versão do servidor: 5.7.23-23
-- Versão do PHP: 8.1.33

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `tuaces44_tubetoolstest_db`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `transactions`
--

CREATE TABLE `transactions` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('credit','debit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `status` enum('completed','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `transactions`
--

INSERT INTO `transactions` (`id`, `user_id`, `type`, `amount`, `description`, `status`, `created_at`) VALUES
('091fd720-6a43-4e20-af5f-5b5c5420da82', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 1.20, 'Video vote reward - Video 12', 'completed', '2025-12-13 16:02:53'),
('0a25f607-1030-4925-ba52-34ddc0b22833', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.17, 'Video vote reward - Video 6', 'completed', '2025-12-16 18:20:08'),
('0c1b133e-055f-47cb-83f8-2aa947d0e9b3', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 7.03, 'Video vote reward - Video 19', 'completed', '2025-12-16 20:07:22'),
('0db49717-f5ca-47e3-aee4-01a16c6e6baf', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'debit', 3.27, 'Withdrawal processed (Fee Paid)', 'completed', '2025-12-13 06:49:39'),
('0ff6aa96-bb33-4f71-a930-11efbf2ff623', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.38, 'Video vote reward - Video 20', 'completed', '2025-12-16 18:03:26'),
('12d75ed2-f9d7-42d0-95b3-b39bf819b7e3', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.18, 'Video vote reward - Video 12', 'completed', '2025-12-13 16:45:37'),
('16c08a89-660c-4ed9-a0d7-f21eb5265bfd', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 15.49, 'Video vote reward - Video 32', 'completed', '2025-12-16 17:56:15'),
('2f24728f-62f3-4147-a1ea-acd8039c197f', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 9.01, 'Video vote reward - Video 23', 'completed', '2025-12-13 17:00:35'),
('31f327a1-f357-44f5-bd02-dffc381b148d', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 12.55, 'Video vote reward - Video 9', 'completed', '2025-12-16 19:07:43'),
('31f75994-f804-45d0-978b-c94bf55b57ee', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 11.41, 'Video vote reward - Video 18', 'completed', '2025-12-13 16:04:15'),
('371707f8-d796-449b-b091-0fc2908b33cc', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 15.43, 'Video vote reward - Video 7', 'completed', '2025-12-16 20:12:51'),
('3d7cb9a2-50db-475b-9d9c-da292768c542', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'debit', 200.00, 'Withdrawal processed (Fee Paid)', 'completed', '2025-12-13 03:58:51'),
('405502f0-8cb7-410d-8b10-59ba8bad181a', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 20.53, 'Video vote reward - Video 5', 'completed', '2025-12-13 06:50:38'),
('409485ac-a7fe-4dd6-afbc-f630d3c75bf6', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.12, 'Video vote reward - Video 16', 'completed', '2025-12-13 16:03:23'),
('415e505b-91f0-4ff4-bee2-1b76af1e463e', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 9.04, 'Video vote reward - Video 28', 'completed', '2025-12-13 17:00:28'),
('41660c9c-bddb-4d35-815d-5c5831965b77', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 15.91, 'Video vote reward - Video 29', 'completed', '2025-12-13 17:00:16'),
('48d9510d-0a0d-45d6-8704-cb0a5c06cf2b', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 11.15, 'Video vote reward - Video 26', 'completed', '2025-12-16 19:00:09'),
('52bdff8c-86f6-4741-b019-e8b54f59a9a5', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 12.77, 'Video vote reward - Video 16', 'completed', '2025-12-16 19:04:59'),
('5402a301-154c-488b-ad67-625a78d25b4e', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 6.37, 'Video vote reward - Video 11', 'completed', '2025-12-13 16:48:48'),
('5491a5d8-2515-4793-be6f-5973bfafc3f0', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.20, 'Video vote reward - Video 17', 'completed', '2025-12-13 17:01:34'),
('59de80cb-4b9c-4500-aff1-a9d9db87d930', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 9.16, 'Video vote reward - Video 7', 'completed', '2025-12-13 17:01:27'),
('5c25a2cc-e3d6-4bfd-bf1b-cef008e06f4e', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 6.68, 'Video vote reward - Video 28', 'completed', '2025-12-16 18:43:42'),
('699724cb-3e61-4a53-91b0-1b4b091b22a3', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'debit', 60.00, 'Withdrawal processed (Fee Paid)', 'completed', '2025-12-13 04:09:02'),
('6c76c953-8ca7-4476-afd5-5e3eb8c3450c', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 9.35, 'Video vote reward - Video 7', 'completed', '2025-12-16 18:43:15'),
('6ec341e5-ab25-45e4-a84f-3cb1bce4c5a8', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 8.19, 'Video vote reward - Video 22', 'completed', '2025-12-16 19:18:33'),
('725e687b-ab8f-40ad-8975-8cad8231463a', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 14.25, 'Video vote reward - Video 23', 'completed', '2025-12-16 18:23:23'),
('7764c743-028f-421b-bde0-ecb516c04254', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 11.71, 'Video vote reward - Video 30', 'completed', '2025-12-13 17:01:19'),
('83bd7f95-75f3-49c8-be0f-bac1a02d7379', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 5.10, 'Video vote reward - Video 20', 'completed', '2025-12-13 16:39:17'),
('86384488-32f1-40dc-9896-28c8774d0035', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 19.99, 'Video vote reward - Video 11', 'completed', '2025-12-13 16:03:06'),
('86648b39-5358-47a6-8493-8010645844f2', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.16, 'Video vote reward - Video 4', 'completed', '2025-12-16 18:44:46'),
('8c0eedd9-9a51-43d1-a9ed-613eedc60649', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.51, 'Video vote reward - Video 12', 'completed', '2025-12-13 17:00:45'),
('8e766612-764a-4cda-83de-7fe3bce78101', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 8.89, 'Video vote reward - Video 23', 'completed', '2025-12-16 18:23:25'),
('967393f0-7b4a-4e1b-aaff-3edb7f0e4313', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 6.97, 'Video vote reward - Video 13', 'completed', '2025-12-13 17:00:40'),
('984eab9b-9b25-4722-9e42-5a8cc31cc8b0', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 7.52, 'Video vote reward - Video 15', 'completed', '2025-12-16 18:40:34'),
('9d82902d-0afd-4802-bdd6-f5c212531d8f', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 7.57, 'Video vote reward - Video 28', 'completed', '2025-12-16 19:11:54'),
('ab7e2533-f819-4f52-821c-6aa74e7a082a', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 13.48, 'Video vote reward - Video 6', 'completed', '2025-12-16 18:06:36'),
('b858ff52-7d3f-41c5-8a96-51062e2039c4', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 24.98, 'Video vote reward - Video 25', 'completed', '2025-12-13 16:02:58'),
('bc5f5e9b-e77f-4d2f-9fe3-b73dc53f1352', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 6.32, 'Video vote reward - Video 19', 'completed', '2025-12-16 18:49:39'),
('cd446c38-7b95-40bf-a98f-5dede88c3a3e', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 5.80, 'Video vote reward - Video 15', 'completed', '2025-12-13 16:46:12'),
('ceafd935-cb3e-4c4e-a604-26deab679a5c', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 11.35, 'Video vote reward - Video 2', 'completed', '2025-12-16 18:02:22'),
('d30f0f2b-4069-4018-adbd-131e0a1cd8c9', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 11.27, 'Video vote reward - Video 26', 'completed', '2025-12-13 16:03:34'),
('d56a2763-aec8-4c46-8cb5-3afc0db053d1', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 6.80, 'Video vote reward - Video 16', 'completed', '2025-12-16 18:10:41'),
('d6243ef6-6bae-4968-8b28-c82e09f8794e', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 16.53, 'Video vote reward - Video 13', 'completed', '2025-12-13 16:03:28'),
('d9289847-123f-4ac4-9ec4-5ae076fa5e8d', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 13.09, 'Video vote reward - Video 23', 'completed', '2025-12-16 18:23:19'),
('d92cc98e-3cc2-4098-88bc-2aaaf9f780af', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 9.77, 'Video vote reward - Video 14', 'completed', '2025-12-16 19:15:01'),
('daa79ac1-b684-4cca-bed9-781169a9634c', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 17.78, 'Video vote reward - Video 34', 'completed', '2025-12-13 17:01:00'),
('de765e10-6129-4c28-a03f-4fb1fe7f2c1c', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 8.96, 'Video vote reward - Video 6', 'completed', '2025-12-13 17:01:12'),
('f0a50a34-c889-4bc0-93dc-80c177ec4e5b', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 24.68, 'Video vote reward - Video 31', 'completed', '2025-12-11 02:16:30'),
('f5a9243c-682e-4483-bc06-cd14594818c6', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 4.46, 'Video vote reward - Video 29', 'completed', '2025-12-13 06:50:16'),
('fc63ce08-840e-42ae-aaca-b74ac9e7c247', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 5.35, 'Video vote reward - Video 3', 'completed', '2025-12-13 16:02:48');

-- --------------------------------------------------------

--
-- Estrutura para tabela `users`
--

CREATE TABLE `users` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `balance` decimal(10,2) DEFAULT '213.19',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `first_earn_at` timestamp NULL DEFAULT NULL,
  `voting_streak` int(11) DEFAULT '0',
  `last_voted_at` timestamp NULL DEFAULT NULL,
  `last_vote_date_reset` timestamp NULL DEFAULT NULL,
  `voting_days_count` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `users`
--

INSERT INTO `users` (`id`, `email`, `name`, `balance`, `created_at`, `updated_at`, `first_earn_at`, `voting_streak`, `last_voted_at`, `last_vote_date_reset`, `voting_days_count`) VALUES
('5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'rotelliofficial@gmail.com', 'Rotelli', 981.86, '2025-12-11 01:16:39', '2025-12-16 17:12:50', '2025-12-11 02:16:30', 3, '2025-12-16 20:12:51', '2025-12-16 17:56:15', 3);

-- --------------------------------------------------------

--
-- Estrutura para tabela `videos`
--

CREATE TABLE `videos` (
  `id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `url` varchar(500) COLLATE utf8mb4_unicode_ci NOT NULL,
  `thumbnail` varchar(500) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `reward_min` decimal(10,2) NOT NULL,
  `reward_max` decimal(10,2) NOT NULL,
  `duration` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `videos`
--

INSERT INTO `videos` (`id`, `title`, `description`, `url`, `thumbnail`, `reward_min`, `reward_max`, `duration`, `created_at`) VALUES
('0xzN6FM5x_E', 'Video 8', 'YouTube Video', 'https://www.youtube.com/embed/0xzN6FM5x_E', 'https://img.youtube.com/vi/0xzN6FM5x_E/maxresdefault.jpg', 6.40, 17.20, 260, '2025-12-10 20:12:14'),
('50A9wjJ40Dk', 'Video 31', 'YouTube Video', 'https://www.youtube.com/embed/50A9wjJ40Dk', 'https://img.youtube.com/vi/50A9wjJ40Dk/maxresdefault.jpg', 5.80, 15.70, 240, '2025-12-10 20:12:14'),
('6vEEVNAOFFY', 'Video 23', 'YouTube Video', 'https://www.youtube.com/embed/6vEEVNAOFFY', 'https://img.youtube.com/vi/6vEEVNAOFFY/maxresdefault.jpg', 5.70, 15.60, 240, '2025-12-10 20:12:14'),
('7oBZ8sBjdyQ', 'Video 9', 'YouTube Video', 'https://www.youtube.com/embed/7oBZ8sBjdyQ', 'https://img.youtube.com/vi/7oBZ8sBjdyQ/maxresdefault.jpg', 4.70, 14.60, 210, '2025-12-10 20:12:14'),
('7QLzzSml07Y', 'Video 17', 'YouTube Video', 'https://www.youtube.com/embed/7QLzzSml07Y', 'https://img.youtube.com/vi/7QLzzSml07Y/maxresdefault.jpg', 5.40, 15.10, 230, '2025-12-10 20:12:14'),
('A4WZF74dAg4', 'Video 24', 'YouTube Video', 'https://www.youtube.com/embed/A4WZF74dAg4', 'https://img.youtube.com/vi/A4WZF74dAg4/maxresdefault.jpg', 3.90, 12.70, 180, '2025-12-10 20:12:14'),
('A92_B_mnO-I', 'Video 15', 'YouTube Video', 'https://www.youtube.com/embed/A92_B_mnO-I', 'https://img.youtube.com/vi/A92_B_mnO-I/maxresdefault.jpg', 3.80, 12.90, 180, '2025-12-10 20:12:14'),
('aP2up9N6H-g', 'Video 3', 'YouTube Video', 'https://www.youtube.com/embed/aP2up9N6H-g', 'https://img.youtube.com/vi/aP2up9N6H-g/maxresdefault.jpg', 4.80, 18.30, 300, '2025-12-10 20:12:14'),
('C_BZQkU5Cds', 'Video 5', 'YouTube Video', 'https://www.youtube.com/embed/C_BZQkU5Cds', 'https://img.youtube.com/vi/C_BZQkU5Cds/maxresdefault.jpg', 5.90, 16.50, 240, '2025-12-10 20:12:14'),
('EbXSbP-wEFU', 'Video 30', 'YouTube Video', 'https://www.youtube.com/embed/EbXSbP-wEFU', 'https://img.youtube.com/vi/EbXSbP-wEFU/maxresdefault.jpg', 4.50, 13.40, 190, '2025-12-10 20:12:14'),
('ErwS24cBZPc', 'Video 20', 'YouTube Video', 'https://www.youtube.com/embed/ErwS24cBZPc', 'https://img.youtube.com/vi/ErwS24cBZPc/maxresdefault.jpg', 4.40, 13.20, 190, '2025-12-10 20:12:14'),
('fLonJKaTQqM', 'Video 34', 'YouTube Video', 'https://www.youtube.com/embed/fLonJKaTQqM', 'https://img.youtube.com/vi/fLonJKaTQqM/maxresdefault.jpg', 7.00, 18.50, 280, '2025-12-10 20:12:14'),
('fvyBCesuxMM', 'Video 16', 'YouTube Video', 'https://www.youtube.com/embed/fvyBCesuxMM', 'https://img.youtube.com/vi/fvyBCesuxMM/maxresdefault.jpg', 6.80, 17.60, 270, '2025-12-10 20:12:14'),
('gx-zPheFnHo', 'Video 7', 'YouTube Video', 'https://www.youtube.com/embed/gx-zPheFnHo', 'https://img.youtube.com/vi/gx-zPheFnHo/maxresdefault.jpg', 5.20, 15.90, 220, '2025-12-10 20:12:14'),
('HXFkg0vwLpQ', 'Video 13', 'YouTube Video', 'https://www.youtube.com/embed/HXFkg0vwLpQ', 'https://img.youtube.com/vi/HXFkg0vwLpQ/maxresdefault.jpg', 4.90, 14.30, 200, '2025-12-10 20:12:14'),
('imgPdo4TaT8', 'Video 26', 'YouTube Video', 'https://www.youtube.com/embed/imgPdo4TaT8', 'https://img.youtube.com/vi/imgPdo4TaT8/maxresdefault.jpg', 4.80, 14.10, 210, '2025-12-10 20:12:14'),
('keOaQm6RpBg', 'Video 2', 'YouTube Video', 'https://www.youtube.com/embed/keOaQm6RpBg', 'https://img.youtube.com/vi/keOaQm6RpBg/maxresdefault.jpg', 3.20, 12.40, 180, '2025-12-10 20:12:14'),
('kQcq3rpne78', 'Video 6', 'YouTube Video', 'https://www.youtube.com/embed/kQcq3rpne78', 'https://img.youtube.com/vi/kQcq3rpne78/maxresdefault.jpg', 4.30, 13.80, 180, '2025-12-10 20:12:14'),
('Kr8XAnR80XA', 'Video 28', 'YouTube Video', 'https://www.youtube.com/embed/Kr8XAnR80XA', 'https://img.youtube.com/vi/Kr8XAnR80XA/maxresdefault.jpg', 5.00, 13.90, 200, '2025-12-10 20:12:14'),
('MRV8mFWwtS4', 'Video 22', 'YouTube Video', 'https://www.youtube.com/embed/MRV8mFWwtS4', 'https://img.youtube.com/vi/MRV8mFWwtS4/maxresdefault.jpg', 5.30, 15.20, 220, '2025-12-10 20:12:14'),
('o-Ikkh5oxuo', 'Video 14', 'YouTube Video', 'https://www.youtube.com/embed/o-Ikkh5oxuo', 'https://img.youtube.com/vi/o-Ikkh5oxuo/maxresdefault.jpg', 5.60, 15.40, 240, '2025-12-10 20:12:14'),
('O6rHeD5x2tI', 'Video 32', 'YouTube Video', 'https://www.youtube.com/embed/O6rHeD5x2tI', 'https://img.youtube.com/vi/O6rHeD5x2tI/maxresdefault.jpg', 6.30, 16.90, 250, '2025-12-10 20:12:14'),
('OnQXRxW9VcQ', 'Video 21', 'YouTube Video', 'https://www.youtube.com/embed/OnQXRxW9VcQ', 'https://img.youtube.com/vi/OnQXRxW9VcQ/maxresdefault.jpg', 6.50, 17.00, 250, '2025-12-10 20:12:14'),
('qIVDxL2lgN4', 'Video 12', 'YouTube Video', 'https://www.youtube.com/embed/qIVDxL2lgN4', 'https://img.youtube.com/vi/qIVDxL2lgN4/maxresdefault.jpg', 7.10, 18.90, 280, '2025-12-10 20:12:14'),
('qYbhqbOEaY8', 'Video 29', 'YouTube Video', 'https://www.youtube.com/embed/qYbhqbOEaY8', 'https://img.youtube.com/vi/qYbhqbOEaY8/maxresdefault.jpg', 6.90, 17.80, 270, '2025-12-10 20:12:14'),
('s92UMJNjPIA', 'Video 11', 'YouTube Video', 'https://www.youtube.com/embed/s92UMJNjPIA', 'https://img.youtube.com/vi/s92UMJNjPIA/maxresdefault.jpg', 6.20, 16.80, 250, '2025-12-10 20:12:14'),
('t8Zz1XGuPK8', 'Video 18', 'YouTube Video', 'https://www.youtube.com/embed/t8Zz1XGuPK8', 'https://img.youtube.com/vi/t8Zz1XGuPK8/maxresdefault.jpg', 4.60, 14.00, 210, '2025-12-10 20:12:14'),
('taOdaf_nw3U', 'Video 25', 'YouTube Video', 'https://www.youtube.com/embed/taOdaf_nw3U', 'https://img.youtube.com/vi/taOdaf_nw3U/maxresdefault.jpg', 6.70, 17.40, 260, '2025-12-10 20:12:14'),
('UYaY2Kb_PKI', 'Video 10', 'YouTube Video', 'https://www.youtube.com/embed/UYaY2Kb_PKI', 'https://img.youtube.com/vi/UYaY2Kb_PKI/maxresdefault.jpg', 5.00, 13.50, 190, '2025-12-10 20:12:14'),
('vDGrfhJH1P4', 'Video 33', 'YouTube Video', 'https://www.youtube.com/embed/vDGrfhJH1P4', 'https://img.youtube.com/vi/vDGrfhJH1P4/maxresdefault.jpg', 5.40, 15.00, 220, '2025-12-10 20:12:14'),
('VGa1imApfdg', 'Video 4', 'YouTube Video', 'https://www.youtube.com/embed/VGa1imApfdg', 'https://img.youtube.com/vi/VGa1imApfdg/maxresdefault.jpg', 6.10, 14.20, 200, '2025-12-10 20:12:14'),
('W5PRZuaQ3VM', 'Video 1', 'YouTube Video', 'https://www.youtube.com/embed/W5PRZuaQ3VM', 'https://img.youtube.com/vi/W5PRZuaQ3VM/maxresdefault.jpg', 5.50, 15.75, 240, '2025-12-10 20:12:14'),
('wXcBGfXXL4w', 'Video 27', 'YouTube Video', 'https://www.youtube.com/embed/wXcBGfXXL4w', 'https://img.youtube.com/vi/wXcBGfXXL4w/maxresdefault.jpg', 5.50, 15.30, 230, '2025-12-10 20:12:14'),
('XMdrHHh2aJc', 'Video 19', 'YouTube Video', 'https://www.youtube.com/embed/XMdrHHh2aJc', 'https://img.youtube.com/vi/XMdrHHh2aJc/maxresdefault.jpg', 5.10, 13.70, 200, '2025-12-10 20:12:14');

-- --------------------------------------------------------

--
-- Estrutura para tabela `votes`
--

CREATE TABLE `votes` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `video_id` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `vote_type` enum('like','dislike') COLLATE utf8mb4_unicode_ci NOT NULL,
  `reward_amount` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `votes`
--

INSERT INTO `votes` (`id`, `user_id`, `video_id`, `vote_type`, `reward_amount`, `created_at`) VALUES
('870ca921-d054-43b7-b381-e8be5f736cbd', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'gx-zPheFnHo', 'like', 15.43, '2025-12-16 20:12:51'),
('e17f6d1e-d91a-4c47-89d4-e025e386918e', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'XMdrHHh2aJc', 'like', 7.03, '2025-12-16 20:07:22');

-- --------------------------------------------------------

--
-- Estrutura para tabela `withdrawals`
--

CREATE TABLE `withdrawals` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `status` enum('pending','completed','rejected','cancelled') COLLATE utf8mb4_unicode_ci DEFAULT 'pending',
  `requested_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `processed_at` timestamp NULL DEFAULT NULL,
  `bank_details` json DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Despejando dados para a tabela `withdrawals`
--

INSERT INTO `withdrawals` (`id`, `user_id`, `amount`, `status`, `requested_at`, `processed_at`, `bank_details`) VALUES
('61a7225c-7bca-4ece-9669-639f9547f251', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 3.27, 'completed', '2025-12-13 06:39:41', '2025-12-13 06:49:40', '{\"bankName\": \"Fictional Bank of test\", \"holderName\": \"Michael Thompson\", \"accountNumber\": \"9876543210\", \"routingNumber\": \"021000123\"}'),
('9be033f8-acfc-4523-be45-71f74c2ba2de', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 60.00, 'completed', '2025-12-13 04:06:00', NULL, '{\"bankName\": \"Fictional Bank of test\", \"holderName\": \"Michael Thompson\", \"accountNumber\": \"9876543210\", \"routingNumber\": \"021000123\"}'),
('f7f94223-575f-48f8-af7a-dc65b018d352', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 49.00, 'cancelled', '2025-12-13 06:58:34', '2025-12-13 06:58:47', '{\"bankName\": \"Fictional Bank of test\", \"holderName\": \"Michael Thompson\", \"accountNumber\": \"9876543210\", \"routingNumber\": \"021000123\"}');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `idx_email` (`email`);

--
-- Índices de tabela `videos`
--
ALTER TABLE `videos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `votes`
--
ALTER TABLE `votes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_video_id` (`video_id`),
  ADD KEY `idx_created_at` (`created_at`);

--
-- Índices de tabela `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_user_id` (`user_id`),
  ADD KEY `idx_status` (`status`);

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `votes`
--
ALTER TABLE `votes`
  ADD CONSTRAINT `votes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `votes_ibfk_2` FOREIGN KEY (`video_id`) REFERENCES `videos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `withdrawals`
--
ALTER TABLE `withdrawals`
  ADD CONSTRAINT `withdrawals_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
