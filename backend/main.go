package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

/* Global Variables */
var (
	db      *gorm.DB
	validate *validator.Validate
)

/* --- Models (実際には models/ ディレクトリなどに分離推奨) --- */

// Complex represents the complex entity.
type Complex struct {
	ID        uint      `gorm:"primarykey" json:"id"`
	UserID    string    `json:"user_id" gorm:"type:varchar(36);not null;index"` // UUID from AuthMiddleware
	Content   string    `json:"content" gorm:"not null" validate:"required"`
	Category  string    `json:"category" gorm:"not null" validate:"required"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

// ComplexInput defines the expected input for creating a new complex.
type ComplexInput struct {
	Content  string `json:"content" validate:"required,min=1,max=255"`
	Category string `json:"category" validate:"required,min=1,max=100"`
}

// Goal represents the goal entity.
type Goal struct {
	ID             uint      `gorm:"primarykey" json:"id"`
	UserID         string    `json:"user_id" gorm:"type:varchar(36);not null;index"`
	ComplexID      uint      `json:"complex_id" gorm:"not null;index"` // Foreign key to Complex
	SurfaceGoal    string    `json:"surface_goal" gorm:"not null"`
	UnderlyingGoal string    `json:"underlying_goal" gorm:"not null"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
	Complex        Complex   `gorm:"foreignKey:ComplexID"` // Belongs to Complex
}

// GoalInput defines the expected input for creating or updating a goal.
type GoalInput struct {
	ComplexID      uint   `json:"complex_id" validate:"required"`
	SurfaceGoal    string `json:"surface_goal" validate:"required,min=1,max=255"`
	UnderlyingGoal string `json:"underlying_goal" validate:"required,min=1,max=255"`
}

// Action represents the action entity.
type Action struct {
	ID          uint       `gorm:"primarykey" json:"id"`
	UserID      string     `json:"user_id" gorm:"type:varchar(36);not null;index"`
	GoalID      uint       `json:"goal_id" gorm:"not null;index"` // Foreign key to Goal
	Content     string     `json:"content" gorm:"not null"`
	CompletedAt *time.Time `json:"completed_at,omitempty"` // Pointer to allow null
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
	Goal        Goal       `gorm:"foreignKey:GoalID"` // Belongs to Goal
}

// ActionInput defines the expected input for creating a new action.
type ActionInput struct {
	GoalID      uint   `json:"goal_id" validate:"required"`
	Content     string `json:"content" validate:"required,min=1,max=1000"`
	CompletedAt string `json:"completed_at,omitempty" validate:"omitempty,datetime=2006-01-02T15:04:05Z07:00"` // ISO8601 format
}

// --- GORM AutoMigrate Helper ---
// (This can be moved to a more appropriate place like a db setup function later)
var modelsToMigrate = []interface{}{&Complex{}, &Goal{}, &Action{}}

// ErrorResponse Helper
type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// NewErrorResponse Helper
func NewErrorResponse(code int, message string) ErrorResponse {
	return ErrorResponse{Code: code, Message: message}
}

// AuthMiddleware provides a simple authentication mechanism for the MVP.
// It checks for an 'X-User-ID' header. If the header is not present,
// it sets a default test user ID. This is a temporary measure and should be
// replaced with a proper token-based authentication system for production.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			// テスト用のダミーユーザーID (実際の認証基盤実装時に置き換える)
			userID = "test-user-uuid-12345"
			log.Printf("Warning: X-User-ID header not found, using default test user ID: %s", userID)
		}
		c.Set("userID", userID)
		c.Next()
	}
}

// PingHandler handles the health check endpoint.
func PingHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "pong"})
}

// CreateComplexHandler handles the creation of a new complex.
func CreateComplexHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	var input ComplexInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Invalid request body: "+err.Error()))
		return
	}

	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error()))
		return
	}

	complex := Complex{
		UserID:   userID.(string),
		Content:  input.Content,
		Category: input.Category,
	}

	if result := db.Create(&complex); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to create complex: "+result.Error.Error()))
		return
	}

	c.JSON(http.StatusCreated, complex)
}

// GetComplexesHandler handles fetching all complexes for the authenticated user.
func GetComplexesHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	var complexes []Complex
	if result := db.Where("user_id = ?", userID.(string)).Find(&complexes); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to fetch complexes: "+result.Error.Error()))
		return
	}

	if complexes == nil { // ユーザーに紐づくコンプレックスが存在しない場合も空配列を返す
		complexes = []Complex{}
	}

	c.JSON(http.StatusOK, complexes)
}

// GetComplexHandler handles fetching a specific complex by its ID.
func GetComplexHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	complexID := c.Param("complexId")

	var complex Complex
	if result := db.Where("id = ? AND user_id = ?", complexID, userID.(string)).First(&complex); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Complex not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to fetch complex: "+result.Error.Error()))
		return
	}

	c.JSON(http.StatusOK, complex)
}

// UpdateComplexHandler handles updating an existing complex.
func UpdateComplexHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	complexID := c.Param("complexId")

	var input ComplexInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Invalid request body: "+err.Error()))
		return
	}

	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error()))
		return
	}

	var complex Complex
	if result := db.Where("id = ? AND user_id = ?", complexID, userID.(string)).First(&complex); result.Error != nil {
		if result.Error == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Complex not found to update"))
			return
		}
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to find complex to update: "+result.Error.Error()))
		return
	}

	complex.Content = input.Content
	complex.Category = input.Category

	if result := db.Save(&complex); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to update complex: "+result.Error.Error()))
		return
	}

	c.JSON(http.StatusOK, complex)
}

// DeleteComplexHandler handles deleting a complex by its ID.
func DeleteComplexHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}
	complexID := c.Param("complexId")

	if result := db.Where("id = ? AND user_id = ?", complexID, userID.(string)).Delete(&Complex{}); result.Error != nil || result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Complex not found or already deleted"))
		return
	}
	c.Status(http.StatusNoContent)
}

// CreateGoalHandler handles the creation of a new goal.
func CreateGoalHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	var input GoalInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Invalid request body: "+err.Error()))
		return
	}

	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error()))
		return
	}

	// Check if the referenced complex exists and belongs to the user
	var complex Complex
	if err := db.Where("id = ? AND user_id = ?", input.ComplexID, userID.(string)).First(&complex).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Referenced complex not found or does not belong to user"))
			return
		}
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Error checking complex: "+err.Error()))
		return
	}

	goal := Goal{
		UserID:         userID.(string),
		ComplexID:      input.ComplexID,
		SurfaceGoal:    input.SurfaceGoal,
		UnderlyingGoal: input.UnderlyingGoal,
	}

	if result := db.Create(&goal); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to create goal: "+result.Error.Error()))
		return
	}

	c.JSON(http.StatusCreated, goal)
}

// GetGoalsHandler handles fetching all goals for the authenticated user.
func GetGoalsHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	var goals []Goal
	if result := db.Where("user_id = ?", userID.(string)).Find(&goals); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to fetch goals: "+result.Error.Error()))
		return
	}

	if goals == nil {
		goals = []Goal{}
	}
	c.JSON(http.StatusOK, goals)
}

// GetGoalHandler handles fetching a specific goal by its ID.
func GetGoalHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}
	goalID := c.Param("goalId")

	var goal Goal
	if err := db.Where("id = ? AND user_id = ?", goalID, userID.(string)).First(&goal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Goal not found"))
			return
		}
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to fetch goal: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, goal)
}

// UpdateGoalHandler handles updating an existing goal.
func UpdateGoalHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}
	goalID := c.Param("goalId")

	var input GoalInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Invalid request body: "+err.Error()))
		return
	}
	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error()))
		return
	}

	var goal Goal
	if err := db.Where("id = ? AND user_id = ?", goalID, userID.(string)).First(&goal).Error; err != nil {
		c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Goal not found to update"))
		return
	}

	// Note: ComplexID update is not allowed here for simplicity, but can be added if needed.
	// If ComplexID is updated, ensure the new ComplexID also belongs to the user.
	goal.SurfaceGoal = input.SurfaceGoal
	goal.UnderlyingGoal = input.UnderlyingGoal

	if err := db.Save(&goal).Error; err != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to update goal: "+err.Error()))
		return
	}
	c.JSON(http.StatusOK, goal)
}

// DeleteGoalHandler handles deleting a goal by its ID.
func DeleteGoalHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}
	goalID := c.Param("goalId")

	if result := db.Where("id = ? AND user_id = ?", goalID, userID.(string)).Delete(&Goal{}); result.Error != nil || result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Goal not found or already deleted"))
		return
	}
	c.Status(http.StatusNoContent)
}

// CreateActionHandler handles the creation of a new action.
func CreateActionHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	var input ActionInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Invalid request body: "+err.Error()))
		return
	}

	if err := validate.Struct(input); err != nil {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Validation failed: "+err.Error()))
		return
	}

	// Check if the referenced goal exists and belongs to the user
	var goal Goal
	if err := db.Where("id = ? AND user_id = ?", input.GoalID, userID.(string)).First(&goal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Referenced goal not found or does not belong to user"))
			return
		}
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Error checking goal: "+err.Error()))
		return
	}

	var completedAtParsed *time.Time
	if input.CompletedAt != "" {
		t, err := time.Parse(time.RFC3339, input.CompletedAt)
		if err != nil {
			c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Invalid completed_at format. Use ISO8601 (RFC3339)."))
			return
		}
		completedAtParsed = &t
	}

	action := Action{
		UserID:      userID.(string),
		GoalID:      input.GoalID,
		Content:     input.Content,
		CompletedAt: completedAtParsed,
	}

	if result := db.Create(&action); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to create action: "+result.Error.Error()))
		return
	}
	c.JSON(http.StatusCreated, action)
}

// GetActionsHandler handles fetching all actions for a specific goal of the authenticated user.
func GetActionsHandler(c *gin.Context) {
	userID, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, NewErrorResponse(http.StatusUnauthorized, "User ID not found in context"))
		return
	}

	goalIDStr := c.Query("goal_id")
	if goalIDStr == "" {
		c.JSON(http.StatusBadRequest, NewErrorResponse(http.StatusBadRequest, "Query parameter 'goal_id' is required"))
		return
	}

	// Ensure the goal belongs to the user to prevent fetching actions for other users' goals
	var goal Goal
	if err := db.Where("id = ? AND user_id = ?", goalIDStr, userID.(string)).First(&goal).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			c.JSON(http.StatusNotFound, NewErrorResponse(http.StatusNotFound, "Goal not found or does not belong to user"))
			return
		}
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Error verifying goal: "+err.Error()))
		return
	}

	var actions []Action
	if result := db.Where("goal_id = ? AND user_id = ?", goalIDStr, userID.(string)).Order("created_at DESC").Find(&actions); result.Error != nil {
		c.JSON(http.StatusInternalServerError, NewErrorResponse(http.StatusInternalServerError, "Failed to fetch actions: "+result.Error.Error()))
		return
	}

	if actions == nil {
		actions = []Action{}
	}
	c.JSON(http.StatusOK, actions)
}

func main() {
	// --- 環境変数からの設定読み込み (例) ---
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	migrationPath := os.Getenv("MIGRATION_PATH") // e.g., "file://./db/migrations"
	serverPort := os.Getenv("SERVER_PORT")
	if serverPort == "" {
		serverPort = "8080" // デフォルトポート
	}

	// 必須環境変数のチェック
	requiredEnvVars := map[string]string{
		"DB_USER":    dbUser,
		"DB_PASSWORD": dbPassword,
		"DB_HOST":    dbHost,
		"DB_PORT":    dbPort,
		"DB_NAME":    dbName,
	}
	for key, value := range requiredEnvVars {
		if value == "" {
			log.Fatalf("🚨 Missing required environment variable: %s", key)
		}
	}

	// --- Validatorの初期化 ---
	validate = validator.New()

	// --- データベース接続 (GORM) ---
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName,
	)

	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info, // 開発中はInfo, 本番ではWarnなど
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	var err error
	db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		log.Fatalf("🚨 Failed to connect to database: %v", err)
	}
	log.Println("🎉 Database connected successfully!")

	// --- データベースマイグレーション (golang-migrate/migrate) ---
	if migrationPath != "" {
		dbURL := fmt.Sprintf("mysql://%s:%s@tcp(%s:%s)/%s",
			dbUser, dbPassword, dbHost, dbPort, dbName,
		)
		m, err := migrate.New(migrationPath, dbURL)
		if err != nil { // マイグレーションの初期化失敗は致命的エラーとする場合
			log.Fatalf("🚨 Failed to initialize migrations: %v.", err)
		}
		if err := m.Up(); err != nil && err != migrate.ErrNoChange {
				log.Fatalf("🚨 Failed to run migrations: %v", err)
			}
			log.Println("🎉 Migrations applied successfully or no changes.")
			srcErr, dbErr := m.Close()
			if srcErr != nil {
				log.Printf("⚠️ Error closing migration source: %v", srcErr)
			}
			if dbErr != nil {
				log.Printf("⚠️ Error closing migration database connection: %v", dbErr)
			}
	} else {
		log.Println("ℹ️ MIGRATION_PATH not set, skipping automated migrations. Ensure DB schema is up to date.")
		// 開発初期段階ではGORMのAutoMigrateも便利です
		log.Println("Running GORM AutoMigrate for initial schema setup...")
		db.AutoMigrate(modelsToMigrate...) // Use the slice for AutoMigrate
	}

	// --- Ginルーターの初期化 ---
	// gin.SetMode(gin.ReleaseMode) // 本番環境ではReleaseModeに
	r := gin.Default()

	// --- ミドルウェア ---
	r.Use(gin.Logger())   // 標準のロガー
	r.Use(gin.Recovery()) // パニックリカバリ
	// CORS設定 (必要に応じてカスタマイズ)
	// r.Use(cors.Default())
	r.Use(AuthMiddleware()) // 認証ミドルウェア

	// --- ルーティング ---
	// APIのベースパスを `/api/v1` とします (openapi.yamlのservers.urlに合わせる)
	apiV1 := r.Group("/api/v1")
	{
		apiV1.GET("/ping", PingHandler)

		// Complexes
		complexesGroup := apiV1.Group("/complexes")
		{
			complexesGroup.POST("", CreateComplexHandler)
			complexesGroup.GET("", GetComplexesHandler)
			complexesGroup.GET("/:complexId", GetComplexHandler)
			complexesGroup.PUT("/:complexId", UpdateComplexHandler)
			complexesGroup.DELETE("/:complexId", DeleteComplexHandler)
		}

		// Goals
		goalsGroup := apiV1.Group("/goals")
		{
			goalsGroup.POST("", CreateGoalHandler)
			goalsGroup.GET("", GetGoalsHandler)
			goalsGroup.GET("/:goalId", GetGoalHandler)
			goalsGroup.PUT("/:goalId", UpdateGoalHandler)
			goalsGroup.DELETE("/:goalId", DeleteGoalHandler)
		}

		// Actions
		actionsGroup := apiV1.Group("/actions")
		{
			actionsGroup.POST("", CreateActionHandler)
			actionsGroup.GET("", GetActionsHandler)
		}
	}

	// --- サーバー起動 ---
	log.Printf("🚀 Server starting on port %s", serverPort)
	if err := r.Run(":" + serverPort); err != nil {
		log.Fatalf("🚨 Failed to run server: %v", err)
	}
}
