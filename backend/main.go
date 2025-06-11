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
	_ "github.com/golang-migrate/migrate/v4/database/mysql" // MySQL driver for migrate
	_ "github.com/golang-migrate/migrate/v4/source/file"    // File source for migrate
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// Global Variables
var (
	db      *gorm.DB
	validate *validator.Validate
)

// Models (仮定義: 実際には models/ ディレクトリなどに分離推奨)
// OpenAPIのスキーマに基づいてGORMモデルを定義します。
// 例:
// type Complex struct {
//  ID        uint      `gorm:"primarykey" json:"id"`
//  UserID    string    `json:"user_id" gorm:"type:varchar(36);not null;index"` // UUID
//  Content   string    `json:"content" gorm:"not null" validate:"required"`
//  Category  string    `json:"category" gorm:"not null" validate:"required"`
//  CreatedAt time.Time `json:"created_at"`
//  UpdatedAt time.Time `json:"updated_at"`
// }
// type Goal struct { ... }
// type Action struct { ... }

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

// Complex Handlers (スタブ)
// func CreateComplexHandler(c *gin.Context) { /* ... */ }
// func GetComplexesHandler(c *gin.Context) { /* ... */ }
// func GetComplexHandler(c *gin.Context) { /* ... */ }
// func UpdateComplexHandler(c *gin.Context) { /* ... */ }
// func DeleteComplexHandler(c *gin.Context) { /* ... */ }

// Goal Handlers (スタブ)
// func CreateGoalHandler(c *gin.Context) { /* ... */ }
// func GetGoalsHandler(c *gin.Context) { /* ... */ }
// func GetGoalHandler(c *gin.Context) { /* ... */ }
// func UpdateGoalHandler(c *gin.Context) { /* ... */ }
// func DeleteGoalHandler(c *gin.Context) { /* ... */ }

// Action Handlers (スタブ)
// func CreateActionHandler(c *gin.Context) { /* ... */ }

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
		// log.Println("Running GORM AutoMigrate for initial schema setup...")
		// db.AutoMigrate(&Complex{}, &Goal{}, &Action{}) // ここにモデルを追加
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
		// complexesGroup := apiV1.Group("/complexes")
		// {
		// 	// complexesGroup.POST("", CreateComplexHandler)
		// 	// complexesGroup.GET("", GetComplexesHandler)
		// 	// complexesGroup.GET("/:complexId", GetComplexHandler)
		// 	// complexesGroup.PUT("/:complexId", UpdateComplexHandler)
		// 	// complexesGroup.DELETE("/:complexId", DeleteComplexHandler)
		// }

		// Goals
		// goalsGroup := apiV1.Group("/goals")
		// {
		// 	// goalsGroup.POST("", CreateGoalHandler)
		// 	// goalsGroup.GET("", GetGoalsHandler)
		// 	// goalsGroup.GET("/:goalId", GetGoalHandler)
		// 	// goalsGroup.PUT("/:goalId", UpdateGoalHandler)
		// 	// goalsGroup.DELETE("/:goalId", DeleteGoalHandler)
		// }

		// Actions
		// actionsGroup := apiV1.Group("/actions")
		// {
		// 	// actionsGroup.POST("", CreateActionHandler)
		// }
	}

	// --- サーバー起動 ---
	log.Printf("🚀 Server starting on port %s", serverPort)
	if err := r.Run(":" + serverPort); err != nil {
		log.Fatalf("🚨 Failed to run server: %v", err)
	}
}
