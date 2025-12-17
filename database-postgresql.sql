-- PostgreSQL conversion from MySQL dump
-- TubeTools database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    first_earn_at TIMESTAMP NULL,
    voting_streak INTEGER DEFAULT 0,
    last_voted_at TIMESTAMP NULL,
    last_vote_date_reset TIMESTAMP NULL,
    voting_days_count INTEGER DEFAULT 0
);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url VARCHAR(500) NOT NULL,
    thumbnail VARCHAR(500),
    reward_min DECIMAL(10,2) NOT NULL,
    reward_max DECIMAL(10,2) NOT NULL,
    duration INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Votes table
CREATE TABLE IF NOT EXISTS votes (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    video_id VARCHAR(50) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    vote_type VARCHAR(10) NOT NULL CHECK (vote_type IN ('like', 'dislike')),
    reward_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(10) NOT NULL CHECK (type IN ('credit', 'debit')),
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    status VARCHAR(15) DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(15) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rejected', 'cancelled')),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    bank_details JSONB
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_video_id ON votes(video_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);

-- Insert sample data (converted from MySQL)
-- Users
INSERT INTO users (id, email, name, balance, created_at, updated_at, first_earn_at, voting_streak, last_voted_at, last_vote_date_reset, voting_days_count) 
VALUES 
('5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'rotelliofficial@gmail.com', 'Rotelli', 981.86, '2025-12-11 01:16:39', '2025-12-16 17:12:50', '2025-12-11 02:16:30', 3, '2025-12-16 20:12:51', '2025-12-16 17:56:15', 3)
ON CONFLICT (id) DO NOTHING;

-- Videos
INSERT INTO videos (id, title, description, url, thumbnail, reward_min, reward_max, duration, created_at) VALUES
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
('XMdrHHh2aJc', 'Video 19', 'YouTube Video', 'https://www.youtube.com/embed/XMdrHHh2aJc', 'https://img.youtube.com/vi/XMdrHHh2aJc/maxresdefault.jpg', 5.10, 13.70, 200, '2025-12-10 20:12:14')
ON CONFLICT (id) DO NOTHING;

-- Sample transactions (first few)
INSERT INTO transactions (id, user_id, type, amount, description, status, created_at) VALUES
('091fd720-6a43-4e20-af5f-5b5c5420da82', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 1.20, 'Video vote reward - Video 12', 'completed', '2025-12-13 16:02:53'),
('0a25f607-1030-4925-ba52-34ddc0b22833', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.17, 'Video vote reward - Video 6', 'completed', '2025-12-16 18:20:08'),
('0c1b133e-055f-47cb-83f8-2aa947d0e9b3', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 7.03, 'Video vote reward - Video 19', 'completed', '2025-12-16 20:07:22'),
('0db49717-f5ca-47e3-aee4-01a16c6e6baf', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'debit', 3.27, 'Withdrawal processed (Fee Paid)', 'completed', '2025-12-13 06:49:39'),
('0ff6aa96-bb33-4f71-a930-11efbf2ff623', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'credit', 10.38, 'Video vote reward - Video 20', 'completed', '2025-12-16 18:03:26')
ON CONFLICT (id) DO NOTHING;

-- Sample votes
INSERT INTO votes (id, user_id, video_id, vote_type, reward_amount, created_at) VALUES
('870ca921-d054-43b7-b381-e8be5f736cbd', '5448ea88-76f1-48ab-95e7-6f3e8e292cc0', 'gx-zPheFnHo', 'like', 15.43, '202eko-12
ON CONFLICT (id) DO NOTHING;
