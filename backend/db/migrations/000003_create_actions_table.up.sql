CREATE TABLE actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    goal_id INT NOT NULL,
    content TEXT NOT NULL,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id_action (user_id),
    INDEX idx_goal_id_action (goal_id),
    FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE
);
