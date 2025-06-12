CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    complex_id INT NOT NULL,
    surface_goal VARCHAR(255) NOT NULL,
    underlying_goal VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id_goal (user_id),
    INDEX idx_complex_id_goal (complex_id),
    FOREIGN KEY (complex_id) REFERENCES complexes(id) ON DELETE CASCADE
);
