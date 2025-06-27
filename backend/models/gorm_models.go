package models

import "time"

// Complex represents the complex entity for GORM.
type Complex struct {
	ID             uint   `gorm:"primarykey" json:"id"`
	UserID         string `json:"user_id" gorm:"type:varchar(36);not null;index"`
	Content        string `json:"content" gorm:"not null" validate:"required"`
	TriggerEpisode string `json:"trigger_episode" gorm:"type:text"`
	Category       string `json:"category" gorm:"not null" validate:"required"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Goals          []Goal `json:"goals,omitempty" gorm:"foreignKey:ComplexID"`
}

// Goal represents the goal entity for GORM.
type Goal struct {
	ID        uint   `gorm:"primarykey" json:"id"`
	UserID    string `json:"user_id" gorm:"type:varchar(36);not null;index"`
	ComplexID uint   `json:"complex_id" gorm:"not null;index"`
	Content   string `json:"content" gorm:"type:varchar(255);not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Complex Complex `gorm:"foreignKey:ComplexID"`
}

// Action represents the action entity for GORM.
type Action struct {
	ID uint `gorm:"primarykey" json:"id"`
	UserID string `json:"user_id" gorm:"type:varchar(36);not null;index"`
	GoalID uint `json:"goal_id" gorm:"not null;index"`
	Content string `json:"content" gorm:"type:text;not null"`
	CompletedAt *time.Time `json:"completed_at,omitempty" gorm:"index"`
	RecurrencePattern string `json:"recurrence_pattern,omitempty" gorm:"type:json"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	Goal Goal `gorm:"foreignKey:GoalID"`
	Gains []Gain `json:"gains,omitempty" gorm:"foreignKey:ActionID"`
	Losses []Loss `json:"losses,omitempty" gorm:"foreignKey:ActionID"`
}

// Gain represents the gain entity for GORM.
type Gain struct {
	ID          uint   `gorm:"primarykey" json:"id"`
	ActionID    uint   `gorm:"not null;index" json:"action_id"`
	Type        string `gorm:"type:varchar(20);not null" json:"type"`
	Description string `gorm:"type:text;not null" json:"description"`
}

// Loss represents the loss entity for GORM.
type Loss struct {
	ID          uint   `gorm:"primarykey" json:"id"`
	ActionID    uint   `gorm:"not null;index" json:"action_id"`
	Type        string `gorm:"type:varchar(20);not null" json:"type"`
	Description string `gorm:"type:text;not null" json:"description"`
}