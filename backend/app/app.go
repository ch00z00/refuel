package app

import (
	"fmt"
	"log"
	"os"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/mysql"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
	// Generated models will be used here, but we need to ensure they have GORM tags
	// For now, we'll use a placeholder for modelsToMigrate.
	// In a real scenario, you'd either add gorm tags to generated models
	// or define separate GORM models and map them.
	// For this integration, we'll assume generated models are adapted for GORM.
	// refuelapi "refuel/backend/generated/go" // Import generated models if needed for AutoMigrate
)

// AppContext holds shared application resources like DB connection and validator.
type AppContext struct {
	DB       *gorm.DB
	Validate *validator.Validate
}

// ErrorResponse represents a structured error message.
type ErrorResponse struct {
	Code    int    `json:"code"`
	Message string `json:"message"`
}

// NewErrorResponse Helper
func NewErrorResponse(code int, message string) ErrorResponse {
	return ErrorResponse{Code: code, Message: message}
}

// AuthMiddleware provides a simple authentication mechanism for the MVP.
func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userID := c.GetHeader("X-User-ID")
		if userID == "" {
			userID = "user-test-123" // Dummy user ID for testing
			log.Printf("Warning: X-User-ID header not found, using default test user ID: %s", userID)
		}
		c.Set("userID", userID)
		c.Next()
	}
}

// SetupApp initializes the database, validator, and runs migrations.
func SetupApp() (*AppContext, error) {
	// --- Environment variable loading ---
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")
	dbHost := os.Getenv("DB_HOST")
	dbPort := os.Getenv("DB_PORT")
	dbName := os.Getenv("DB_NAME")
	migrationPath := os.Getenv("MIGRATION_PATH") // e.g., "file://./db/migrations"

	requiredEnvVars := map[string]string{
		"DB_USER":    dbUser,
		"DB_PASSWORD": dbPassword,
		"DB_HOST":    dbHost,
		"DB_PORT":    dbPort,
		"DB_NAME":    dbName,
	}
	for key, value := range requiredEnvVars {
		if value == "" {
			return nil, fmt.Errorf("🚨 Missing required environment variable: %s", key)
		}
	}

	// --- Validator initialization ---
	validate := validator.New()

	// --- Database connection (GORM) ---
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		dbUser, dbPassword, dbHost, dbPort, dbName,
	)
	gormLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             time.Second,
			LogLevel:                  logger.Info, // Info for development
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, fmt.Errorf("🚨 Failed to connect to database: %v", err)
	}
	log.Println("🎉 Database connected successfully!")

	// --- Database Migrations ---
	if migrationPath != "" {
		if err := runMigrations(dbUser, dbPassword, dbHost, dbPort, dbName, migrationPath); err != nil {
			return nil, fmt.Errorf("🚨 Failed to run migrations: %v", err)
		}
	} else {
		log.Println("ℹ️ MIGRATION_PATH not set, skipping automated migrations. Ensure DB schema is up to date.")
		// For initial setup, you might still want AutoMigrate here if no migrations are used.
		// db.AutoMigrate(&refuelapi.ModelComplex{}, &refuelapi.ModelGoal{}, &refuelapi.ModelAction{}, ...)
	}

	return &AppContext{DB: db, Validate: validate}, nil
}

// runMigrations handles database migrations.
func runMigrations(dbUser, dbPassword, dbHost, dbPort, dbName, migrationPath string) error {
	dbURL := fmt.Sprintf("mysql://%s:%s@tcp(%s:%s)/%s",
		dbUser, dbPassword, dbHost, dbPort, dbName,
	)
	m, err := migrate.New(migrationPath, dbURL)
	if err != nil {
		return fmt.Errorf("failed to initialize migrations: %w", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("failed to run migrations: %w", err)
	}
	log.Println("🎉 Migrations applied successfully or no changes.")
	srcErr, dbErr := m.Close()
	if srcErr != nil {
		log.Printf("⚠️ Error closing migration source: %v", srcErr)
	}
	if dbErr != nil {
		log.Printf("⚠️ Error closing migration database connection: %v", dbErr)
	}
	return nil
}

// SetupGinMiddlewares configures common Gin middlewares.
func SetupGinMiddlewares(r *gin.Engine) {
	r.Use(gin.Logger())
	r.Use(gin.Recovery())
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-User-ID"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))
	r.Use(AuthMiddleware())
}